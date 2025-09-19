import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
export async function POST() {
try {
console.log('Starting to seed database...');
const passwordHash = await bcrypt.hash('admin123', 10);
await prisma.user.upsert({ where: { email: 'admin@jos.com' }, create: { email: 'admin@jos.com', passwordHash, role: 'admin' }, update: { passwordHash }, });
