import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboard.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const data = await DashboardService.getStats(page);
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Dashboard Error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
