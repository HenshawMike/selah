import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const products = await ProductService.getAll(includeInactive);
    return NextResponse.json(products);
  } catch (err) {
    console.error('API GET Products Error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await ProductService.upsert(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('API POST Product Error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
