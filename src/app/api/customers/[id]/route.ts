import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customer.service';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, address } = await req.json();
    await CustomerService.update(id, { name, address });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Update Customer Error:', err);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await CustomerService.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Delete Customer Error:', err);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
