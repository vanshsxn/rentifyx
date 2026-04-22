import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Shield, ChevronLeft, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
// Use direct named imports - this is the fix for "r is not a function"
import { useConversations, useMessages, sendMessage, startConversation, findAdminUserId } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const ChatDrawer = ({ open, onClose, openSupport = false }: any) => {
  const { user } = useAuth();
  
  // Safety check: if hooks are missing, return null to avoid crash
  if (!useConversations) return null;

  const { conversations, loading: loadingConvos, reload } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages } = useMessages(selectedId);
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && openSupport && user) {
      findAdminUserId().then(adminId => {
        if (adminId && adminId !== user.id) {
          startConversation(user.id, adminId, undefined, true).then(id => {
            if (id) { setSelectedId(id); reload(); }
          });
        }
      });
    }
  }, [open, openSupport, user]);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedId || !user) return;
    await sendMessage(selectedId, user.id, msgInput);
    setMsgInput("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedId && <ChevronLeft className="cursor-pointer" onClick={() => setSelectedId(null)} />}
            <h2 className="font-bold">Messages</h2>
          </div>
          <X className="cursor-pointer" onClick={onClose} />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {!selectedId ? (
            <ScrollArea className="h-full">
              {conversations.map((c: any) => (
                <div key={c.id} onClick={() => setSelectedId(c.id)} className="p-4 border-b hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                  <Avatar><AvatarImage src={c.other_user?.avatar_url} /></Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.other_user?.full_name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{c.last_message}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4 bg-slate-50">
                {messages.map((m: any) => (
                  <div key={m.id} className={`mb-4 flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.sender_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </ScrollArea>
              <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <Input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder="Type..." />
                <Button type="submit">Send</Button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatDrawer;