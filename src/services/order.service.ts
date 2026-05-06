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

  async createManual(phone: string, name: string, productId: string, quantity: number, unit_price: number, address?: string) {
    const { data: customer, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    let targetCustomerId = customer?.id;
    if (!customer) {
      const { data: newC, error: createError } = await supabase
        .from('customers')
        .insert([{ phone, name: name || 'Unknown', address }])
        .select()
        .single();
      if (createError) throw createError;
      targetCustomerId = newC.id;
    } else if (address || name) {
      // Update existing customer info if provided
      const updates: any = {};
      if (name && (!customer.name || customer.name === 'Unknown')) updates.name = name;
      if (address && !customer.address) updates.address = address;
      
      if (Object.keys(updates).length > 0) {
        await supabase.from('customers').update(updates).eq('id', customer.id);
      }
    }

    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    const { error } = await supabase.from('orders').insert([{
      customer_id: targetCustomerId,
      product_id: productId,
      product_name: product?.name || 'Cement',
      quantity,
      unit_price,
      total_price: quantity * unit_price,
      status: 'unpaid'
    }]);
    if (error) throw error;
  },

  async confirm(id: string, productId: string, quantity: number, unit_price: number) {
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    const { error } = await supabase
      .from('orders')
      .update({ 
        product_id: productId,
        product_name: product?.name || 'Cement',
        quantity, 
        unit_price, 
        total_price: quantity * unit_price, 
        status: 'unpaid',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
  }
};
