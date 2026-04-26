import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  property_id: string | null;
  last_message: string | null;
  updated_at: string;
  other_name?: string;
  property_title?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("with");
  const propertyId = searchParams.get("property");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    initChats();
  }, [user]);

  const initChats = async () => {
    if (!user) return;
    setLoading(true);

    // If linking from property detail with a specific user, ensure conversation exists
    if (targetUserId && targetUserId !== user.id) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant_one.eq.${user.id},participant_two.eq.${targetUserId}),and(participant_one.eq.${targetUserId},participant_two.eq.${user.id})`)
        .maybeSingle();

      if (!existing) {
        await supabase.from("conversations").insert({
          participant_one: user.id,
          participant_two: targetUserId,
          property_id: propertyId,
        });
      }
    }
    await loadConversations();
    setLoading(false);
  };

  const loadConversations = async () => {
    if (!user) return;
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convs) return;

    // Fetch profiles + property titles
    const otherIds = convs.map((c) => (c.participant_one === user.id ? c.participant_two : c.participant_one));
    const propIds = convs.map((c) => c.property_id).filter(Boolean) as string[];

    const [{ data: profiles }, { data: props }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").in("id", otherIds),
      propIds.length ? supabase.from("properties").select("id, title").in("id", propIds) : Promise.resolve({ data: [] as any[] }),
    ]);

    const enriched: Conversation[] = convs.map((c) => {
      const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
      const profile = profiles?.find((p) => p.id === otherId);
      const property = props?.find((p) => p.id === c.property_id);
      return {
        ...c,
        other_name: profile?.full_name || profile?.email || "User",
        property_title: property?.title,
      };
    });

    setConversations(enriched);
    if (enriched.length > 0 && !activeConv) setActiveConv(enriched[0]);
  };

  // Load messages + realtime
  useEffect(() => {
    if (!activeConv) return;
    const load = async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", activeConv.id).order("created_at", { ascending: true });
      setMessages(data || []);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);

      const unreadIds = (data || []).filter(m => m.sender_id !== user?.id && !m.read_at).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
      }
    };
    load();

    const channel = supabase
      .channel(`messages-${activeConv.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConv.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConv?.id]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !activeConv) return;
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content,
    });
    if (error) toast.error("Failed to send");
    else {
      await supabase.from("conversations").update({ last_message: content, updated_at: new Date().toISOString() }).eq("id", activeConv.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-4 h-[calc(100vh-180px)] min-h-[500px]">
          {/* Conversation list */}
          <aside className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col ${activeConv ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" /> Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-[10px] text-muted-foreground font-bold uppercase">
                  No conversations yet. Start one from a property page.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary transition-colors ${activeConv?.id === c.id ? "bg-secondary" : ""}`}
                  >
                    <p className="text-xs font-black truncate">{c.other_name}</p>
                    {c.property_title && <p className="text-[10px] text-primary font-bold uppercase truncate">🏠 {c.property_title}</p>}
                    <p className="text-[10px] text-muted-foreground truncate mt-1">{c.last_message || "No messages yet"}</p>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Active conversation */}
          <section className={`bg-card border border-border rounded-2xl flex flex-col overflow-hidden ${!activeConv ? "hidden md:flex" : "flex"}`}>
            {activeConv ? (
              <>
                <header className="p-4 border-b border-border flex items-center gap-3">
                  <button onClick={() => setActiveConv(null)} className="md:hidden p-1 rounded-lg hover:bg-secondary">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-black">{activeConv.other_name}</p>
                    {activeConv.property_title && <p className="text-[10px] text-primary font-bold uppercase">{activeConv.property_title}</p>}
                  </div>
                </header>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-xs ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                          <p>{m.content}</p>
                          <p className={`text-[9px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="p-3 border-t border-border flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
                Select a conversation
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Chat;