import { supabaseServer as supabase } from '@/lib/supabase/server';

export const OrderService = {
  async createDraft(customerId: string, messageId: string, quantity: number) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{ customer_id: customerId, source_message_id: messageId, quantity, status: 'draft' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createManual(phone: string, name: string, quantity: number, unit_price?: number) {
    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    let targetCustomerId = customer?.id;
    if (!customer) {
      const { data: newC, error: nCErr } = await supabase
        .from('customers')
        .insert([{ phone, name: name || 'Unknown' }])
        .select()
        .single();
      if (nCErr) throw nCErr;
      targetCustomerId = newC.id;
    }

    let finalPrice = unit_price;
    if (!finalPrice) {
      const { data: dist } = await supabase.from('distributors').select('default_price').single();
      finalPrice = dist?.default_price;
    }

    const { error } = await supabase.from('orders').insert([{
      customer_id: targetCustomerId,
      quantity,
      unit_price: finalPrice,
      total_price: quantity * (finalPrice || 0),
      status: 'unpaid'
    }]);
    if (error) throw error;
  },

  async confirm(id: string, quantity: number, unit_price: number) {
    const { error } = await supabase
      .from('orders')
      .update({ quantity, unit_price, total_price: quantity * unit_price, status: 'unpaid' })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  }
};
