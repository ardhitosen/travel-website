import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const tokenPair = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
    if (!tokenPair) return NextResponse.json({ ok: false }, { status: 401 });
    const token = tokenPair.replace('token=', '');
    const secret = process.env.JWT_SECRET as string;
    if (!secret) return NextResponse.json({ ok: false }, { status: 500 });
    const payload = jwt.verify(token, secret) as unknown;
    if (typeof payload === 'object' && payload !== null && 'sub' in payload) {
      const p = payload as { sub?: string | number; role?: string };
      return NextResponse.json({ ok: true, user: { id: p.sub, role: p.role } });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
