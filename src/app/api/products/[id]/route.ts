import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await ProductService.update(id, body);
    return NextResponse.json(product);
  } catch (err) {
    console.error('API PUT Product Error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ProductService.toggleActive(id, false);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API DELETE Product Error:', err);
    return NextResponse.json({ error: 'Failed to deactivate product' }, { status: 500 });
  }
}
