import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await OrderService.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Delete Order Error:', err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
