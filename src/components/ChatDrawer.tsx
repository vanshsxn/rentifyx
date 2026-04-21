import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Import everything as a namespace to check if they exist
import * as ChatHooks from "@/hooks/useChat"; 
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  initialConversationId?: string | null;
  openSupport?: boolean;
}

const ChatDrawer = ({ open, onClose, initialConversationId, openSupport }: ChatDrawerProps) => {
  const { user } = useAuth();
  
  // SAFETY GATE 1: Check if useConversations is a function before calling
  const convHook = typeof ChatHooks.useConversations === 'function' 
    ? ChatHooks.useConversations() 
    : { conversations: [], loading: false };
  
  const conversations = convHook?.conversations || [];
  const loading = convHook?.loading || false;

  const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
  
  // SAFETY GATE 2: Check if useMessages is a function before calling
  const msgHook = typeof ChatHooks.useMessages === 'function'
    ? ChatHooks.useMessages(activeId)
    : { messages: [], loading: false };

  const messages = msgHook?.messages || [];
  const msgLoading = msgHook?.loading || false;

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversationId) setActiveId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    const openSup = async () => {
      if (openSupport && user && typeof ChatHooks.findAdminUserId === 'function') {
        try {
          const adminId = await ChatHooks.findAdminUserId();
          if (!adminId) return;
          if (adminId === user.id) return;
          
          if (typeof ChatHooks.startConversation === 'function') {
            const id = await ChatHooks.startConversation(user.id, adminId, undefined, true);
            if (id) setActiveId(id);
          }
        } catch (err) {
          console.error("Support check failed", err);
        }
      }
    };
    if (open) openSup();
  }, [openSupport, open, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId || !user) return;
    if (typeof ChatHooks.sendMessage !== 'function') {
      toast.error("Chat system error");
      return;
    }

    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const { error } = await ChatHooks.sendMessage(activeId, user.id, text);
      if (error) {
        toast.error("Failed to send");
        setInput(text);
      }
    } catch (err) {
      setInput(text);
    }
    setSending(false);
  };

  const activeConv = conversations?.find(c => c.id === activeId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="h-16 px-5 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {activeId && (
                  <button onClick={() => setActiveId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h3 className="font-black text-sm uppercase">
                  {activeConv ? (activeConv.is_support ? "Support" : (activeConv.other_user?.full_name || "Chat")) : "Messages"}
                </h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!activeId ? (
                <div className="p-4">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                    conversations.map((c: any) => (
                      <button key={c.id} onClick={() => setActiveId(c.id)} className="w-full p-4 hover:bg-slate-50 border-b flex justify-between items-center">
                         <span className="font-bold text-sm">{c.other_user?.full_name || "User"}</span>
                         <span className="text-[10px] text-slate-400">
                           {c.updated_at ? formatDistanceToNow(new Date(c.updated_at)) : 'now'}
                         </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div ref={scrollRef} className="p-5 space-y-3">
                  {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-2xl text-sm ${m.sender_id === user?.id ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeId && (
              <div className="p-4 border-t flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Message..."
                  className="flex-1 p-2 bg-slate-50 rounded-xl outline-none"
                />
                <button onClick={handleSend} className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Send size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;