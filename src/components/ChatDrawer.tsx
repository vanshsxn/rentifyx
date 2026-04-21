import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useConversations,
  useMessages,
  sendMessage,
  startConversation,
  findAdminUserId,
  Conversation,
} from "@/hooks/useChat";
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
  
  // Safety check: Ensure useConversations returns expected values
  const convData = useConversations() || { conversations: [], loading: false };
  const { conversations, loading } = convData;

  const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
  
  // Safety check: Ensure useMessages handles null activeId gracefully
  const msgData = useMessages(activeId) || { messages: [], loading: false };
  const { messages, loading: msgLoading } = msgData;

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversationId) setActiveId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    const openSup = async () => {
      if (openSupport && user && typeof findAdminUserId === 'function') {
        try {
          const adminId = await findAdminUserId();
          if (!adminId) {
            toast.error("Support is currently unavailable");
            return;
          }
          if (adminId === user.id) {
            toast.info("You ARE the admin 😄");
            return;
          }
          if (typeof startConversation === 'function') {
            const id = await startConversation(user.id, adminId, undefined, true);
            if (id) setActiveId(id);
          }
        } catch (err) {
          console.error("Support init error:", err);
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
    if (typeof sendMessage !== 'function') return;

    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      const { error } = await sendMessage(activeId, user.id, text);
      if (error) {
        toast.error("Failed to send");
        setInput(text);
      }
    } catch (err) {
      toast.error("Error sending message");
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
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {activeId && (
                  <button onClick={() => setActiveId(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <ArrowLeft size={18} className="text-slate-600" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <MessageCircle size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800">
                      {activeConv
                        ? activeConv.is_support
                          ? "Support Chat"
                          : activeConv.other_user?.full_name || "Conversation"
                        : "Messages"}
                    </h3>
                    {activeConv?.is_support && (
                      <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                        <ShieldCheck size={10} /> Admin Team
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Body */}
            {!activeId ? (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="animate-spin text-indigo-600" />
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="p-10 text-center">
                    <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-600">No conversations yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Start chatting from a property or use Support
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {conversations.map((c: Conversation) => (
                      <li key={c.id}>
                        <button
                          onClick={() => setActiveId(c.id)}
                          className="w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-center gap-3"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                            {c.is_support ? <ShieldCheck size={18} /> : (c.other_user?.full_name?.[0]?.toUpperCase() || "?")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                              {c.is_support ? "Support" : c.other_user?.full_name || "User"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {c.last_message || "No messages yet"}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {c.updated_at ? formatDistanceToNow(new Date(c.updated_at), { addSuffix: false }) : 'now'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                  {msgLoading ? (
                    <div className="flex justify-center pt-10">
                      <Loader2 className="animate-spin text-indigo-600" />
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 mt-10">
                      Send a message to start the conversation 👋
                    </p>
                  ) : (
                    messages.map(m => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                              mine
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 flex gap-2 shrink-0 bg-white">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !sending && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-indigo-700 transition"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;