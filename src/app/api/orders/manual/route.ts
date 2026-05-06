import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';

export async function POST(req: NextRequest) {
  try {
    const { phone, name, productId, quantity, unit_price, address } = await req.json();
    await OrderService.createManual(phone, name, productId, quantity, unit_price, address);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('API Manual Order Error:', err);
    return NextResponse.json({ error: 'Failed to create manual order' }, { status: 500 });
  }
}
