import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = { id: string | number; role?: string };

export async function requireAdmin():
  Promise<
    | { ok: true; user: AuthUser }
    | { ok: false; status: 401 | 403 | 500 }
  > 
{
  const cookieStore = await cookies(); // <-- key change
  const token = cookieStore.get("token")?.value;

  if (!token) return { ok: false, status: 401 };

  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false, status: 500 };

  try {
    const payload = jwt.verify(token, secret) as any;
    const role = payload?.role;
    const sub = payload?.sub;

    if (!sub) return { ok: false, status: 401 };
    if (role !== "admin") return { ok: false, status: 403 };

    return { ok: true, user: { id: sub, role } };
  } catch {
    return { ok: false, status: 401 };
  }
}
