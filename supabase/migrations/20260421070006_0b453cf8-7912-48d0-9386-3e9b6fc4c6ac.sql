-- ============================================
-- CHAT SYSTEM
-- ============================================

CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one UUID NOT NULL,
  participant_two UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  is_support BOOLEAN NOT NULL DEFAULT false,
  last_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT distinct_participants CHECK (participant_one <> participant_two)
);

CREATE INDEX idx_conv_p1 ON public.conversations(participant_one);
CREATE INDEX idx_conv_p2 ON public.conversations(participant_two);
CREATE UNIQUE INDEX idx_conv_unique_pair ON public.conversations(
  LEAST(participant_one, participant_two),
  GREATEST(participant_one, participant_two),
  COALESCE(property_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users view their conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = participant_one
    OR auth.uid() = participant_two
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users create conversations they're in"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = participant_one OR auth.uid() = participant_two
  );

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = participant_one
    OR auth.uid() = participant_two
    OR public.has_role(auth.uid(), 'admin')
  );

-- Messages policies
CREATE POLICY "Users view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid()
             OR c.participant_two = auth.uid()
             OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid()
             OR c.participant_two = auth.uid()
             OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users mark messages read"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

-- Trigger: update conversations.updated_at + last_message
CREATE OR REPLACE FUNCTION public.touch_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now(),
      last_message = LEFT(NEW.content, 200)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation();

-- Realtime
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================
-- Ensure mvstudiosj@gmail.com has landlord role
-- ============================================
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'mvstudiosj@gmail.com' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'landlord')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;