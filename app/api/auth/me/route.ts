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
    const payload = jwt.verify(token, secret) as any;
    return NextResponse.json({ ok: true, user: { id: payload.sub, role: payload.role } });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
