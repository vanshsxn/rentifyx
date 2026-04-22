import React, { useState, useEffect, useRef } from "react";
import { 
  X, Send, User, MessageSquare, Shield, 
  ChevronLeft, Loader2, MessageCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
// CRITICAL: Using named imports to avoid "r is not a function" error
import { 
  useConversations, 
  useMessages, 
  sendMessage, 
  startConversation, 
  findAdminUserId,
  Conversation 
} from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  openSupport?: boolean;
}

const ChatDrawer = ({ open, onClose, openSupport = false }: ChatDrawerProps) => {
  const { user } = useAuth();
  const { conversations, loading: loadingConvos, reload } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, loading: loadingMsgs } = useMessages(selectedId);
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle Support Auto-Start
  useEffect(() => {
    if (open && openSupport && user) {
      const initSupport = async () => {
        const adminId = await findAdminUserId();
        if (adminId && adminId !== user.id) {
          const cid = await startConversation(user.id, adminId, undefined, true);
          if (cid) {
            setSelectedId(cid);
            reload();
          }
        }
      };
      initSupport();
    }
  }, [open, openSupport, user, reload]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedId || !user) return;

    const content = msgInput.trim();
    setMsgInput("");
    await sendMessage(selectedId, user.id, content);
  };

  const activeConvo = conversations.find((c) => c.id === selectedId);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center gap-3">
                {selectedId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedId(null)}
                    className="text-white hover:bg-white/10"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  <h2 className="font-bold">
                    {selectedId ? "Conversation" : "Messages"}
                  </h2>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {!selectedId ? (
                /* CONVERSATION LIST */
                <ScrollArea className="flex-1">
                  {loadingConvos ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
                      <Loader2 className="animate-spin" />
                      <p className="text-xs font-medium">Loading chats...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">No messages yet</p>
                      <p className="text-xs text-slate-400 mt-1">When you message a landlord or support, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {conversations.map((convo) => (
                        <button
                          key={convo.id}
                          onClick={() => setSelectedId(convo.id)}
                          className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <Avatar className="h-12 w-12 border-2 border-indigo-50">
                            <AvatarImage src={convo.other_user?.avatar_url || ""} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                              {convo.other_user?.full_name?.[0] || <User size={20} />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-slate-900 truncate">
                                {convo.other_user?.full_name || "User"}
                                {convo.is_support && (
                                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-md font-black uppercase">
                                    <Shield size={10} /> Support
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400">
                                {format(new Date(convo.updated_at), "HH:mm")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {convo.last_message || "Start a conversation..."}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                /* CHAT VIEW */
                <>
                  <div className="px-4 py-3 bg-slate-50 border-b flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activeConvo?.other_user?.avatar_url || ""} />
                      <AvatarFallback className="bg-indigo-600 text-white text-xs">
                        {activeConvo?.other_user?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{activeConvo?.other_user?.full_name || "Chat"}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                              isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                            }`}>
                              <p className="leading-relaxed font-medium">{msg.content}</p>
                              <p className={`text-[9px] mt-1.5 opacity-70 font-bold ${isMe ? "text-right" : "text-left"}`}>
                                {format(new Date(msg.created_at), "HH:mm")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      className="rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-600 font-medium"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!msgInput.trim()}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-lg shadow-indigo-200"
                    >
                      <Send size={18} />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;