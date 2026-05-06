import { supabaseServer as supabase } from '@/lib/supabase/server';

export const ProductService = {
  async getAll(includeInactive = false) {
    let query = supabase.from('products').select('*').order('name');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async upsert(product: { id?: string; name: string; default_price: number }) {
    const { data, error } = await supabase
      .from('products')
      .upsert([
        { 
          ...product,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async toggleActive(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
};
