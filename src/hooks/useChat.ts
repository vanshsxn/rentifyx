import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  property_id: string | null;
  is_support: boolean;
  last_message: string | null;
  updated_at: string;
  other_user?: { id: string; full_name: string | null; avatar_url: string | null };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const otherIds = data.map(c =>
          c.participant_one === user.id ? c.participant_two : c.participant_one
        );
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", otherIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        
        setConversations(
          data.map(c => ({
            ...c,
            other_user: profileMap.get(
              c.participant_one === user.id ? c.participant_two : c.participant_one
            ),
          }))
        );
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    if (!user?.id) return;

    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  return { conversations, loading, reload: load };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (!error) setMessages(data || []);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages", 
          filter: `conversation_id=eq.${conversationId}` 
        },
        (payload) => {
          setMessages(prev => {
            // Prevent duplicate messages if realtime and load fire at once
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading };
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  return supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });
};

export const startConversation = async (
  myId: string,
  otherId: string,
  propertyId?: string,
  isSupport = false
): Promise<string | null> => {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${myId},participant_two.eq.${otherId}),and(participant_one.eq.${otherId},participant_two.eq.${myId})`
    )
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_one: myId,
      participant_two: otherId,
      property_id: propertyId || null,
      is_support: isSupport,
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id;
};

export const findAdminUserId = async (): Promise<string | null> => {
  const { data } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return data?.user_id || null;
};