import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7*24*60*60}`);
  return res;
}
