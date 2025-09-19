import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('Starting to seed database...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'info@jalanoverseas.com' },
      create: { email: 'info@jalanoverseas.com', passwordHash, role: 'admin' },
      update: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Seed error', err);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
