import { supabaseServer as supabase } from '@/lib/supabase/server';

export const MessageService = {
  async store(customerId: string, text: string, rawPayload: any) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ customer_id: customerId, message_text: text, raw_payload: rawPayload }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
