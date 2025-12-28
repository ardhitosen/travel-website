import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type AuthUser = { id: string | number; role?: string };

export function requireAdmin(): { ok: true; user: AuthUser } | { ok: false; status: 401 | 403 | 500 } {
  const token = cookies().get("token")?.value;
  if (!token) return { ok: false, status: 401 };

  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false, status: 500 };

  try {
    const payload = jwt.verify(token, secret) as any;
    const role = payload?.role;
    if (role !== "admin") return { ok: false, status: 403 };
    return { ok: true, user: { id: payload?.sub, role } };
  } catch {
    return { ok: false, status: 401 };
  }
}
