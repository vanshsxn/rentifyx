import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Import the hooks normally - if they don't exist, the build will tell you
import { useConversations, useMessages, sendMessage, findAdminUserId, startConversation } from "@/hooks/useChat"; 
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
  const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Call hooks at the top level (No conditional gates allowed here)
  const { conversations = [], loading = false } = useConversations() || {};
  const { messages = [], loading: msgLoading = false } = useMessages(activeId) || {};

  useEffect(() => {
    if (initialConversationId) setActiveId(initialConversationId);
  }, [initialConversationId]);

  // Handle Support Logic
  useEffect(() => {
    const initSupport = async () => {
      if (openSupport && user && open) {
        try {
          const adminId = await findAdminUserId();
          if (!adminId || adminId === user.id) return;
          
          const id = await startConversation(user.id, adminId, undefined, true);
          if (id) setActiveId(id);
        } catch (err) {
          console.error("Support check failed", err);
        }
      }
    };
    initSupport();
  }, [openSupport, open, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId || !user) return;

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
      toast.error("Connection error");
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
            {/* Header */}
            <div className="h-16 px-5 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                {activeId && (
                  <button onClick={() => setActiveId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">
                  {activeConv ? (activeConv.is_support ? "Support Center" : (activeConv.other_user?.full_name || "Chat")) : "Messages"}
                </h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-[#F8F9FB]">
              {!activeId ? (
                <div className="p-4 space-y-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                      <Loader2 className="animate-spin mb-2" size={24} />
                      <p className="text-[10px] font-black uppercase">Loading Chats...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-20">
                       <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                       <p className="text-sm font-bold text-slate-400">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((c: any) => (
                      <button 
                        key={c.id} 
                        onClick={() => setActiveId(c.id)} 
                        className="w-full p-4 bg-white hover:border-indigo-200 border border-transparent rounded-2xl shadow-sm transition-all flex justify-between items-center group"
                      >
                         <div className="flex flex-col items-start">
                           <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                             {c.other_user?.full_name || "User"}
                           </span>
                           <span className="text-[10px] text-slate-400 font-medium">
                             {c.last_message?.content || "Click to view chat"}
                           </span>
                         </div>
                         <span className="text-[9px] font-black uppercase text-slate-300">
                           {c.updated_at ? formatDistanceToNow(new Date(c.updated_at)) : 'now'}
                         </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div ref={scrollRef} className="p-5 space-y-4">
                  {msgLoading && messages.length === 0 ? (
                     <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
                  ) : (
                    messages.map((m: any) => (
                      <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm font-medium shadow-sm ${
                          m.sender_id === user?.id 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Input Footer */}
            {activeId && (
              <div className="p-4 border-t bg-white flex gap-2 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !sending && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 bg-slate-50 rounded-xl outline-none text-sm font-medium border border-transparent focus:border-indigo-100 transition-all"
                />
                <button 
                  onClick={handleSend} 
                  disabled={sending || !input.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
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