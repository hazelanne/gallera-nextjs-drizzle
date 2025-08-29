import { sign, verify } from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(payload: object) {
  return sign(payload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    return verify(token, SECRET) as any;
  } catch {
    return null;
  }
}
