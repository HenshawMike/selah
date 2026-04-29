import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/services/settings.service';

export async function GET() {
  try {
    const data = await SettingsService.get();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Get Settings Error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { default_price } = await req.json();
    await SettingsService.update(default_price);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API Update Settings Error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
