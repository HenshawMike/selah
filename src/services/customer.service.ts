import { supabaseServer as supabase } from '@/lib/supabase/server';

export const CustomerService = {
  async findOrCreate(phone: string, name?: string) {
    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('id, phone, name')
      .eq('phone', phone)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) {
      if (name && (!existing.name || existing.name === 'Unknown')) {
        await supabase.from('customers').update({ name }).eq('id', existing.id);
      }
      return existing;
    }

    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert([{ phone, name: name || 'Unknown' }])
      .select()
      .single();

    if (createError) throw createError;
    return created;
  },

  async list() {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return data;
  },

  async update(id: string, name: string) {
    const { error } = await supabase.from('customers').update({ name }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },

  async bulkDelete(ids: string[]) {
    const { error } = await supabase.from('customers').delete().in('id', ids);
    if (error) throw error;
  }
};
