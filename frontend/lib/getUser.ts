import jwt from "jsonwebtoken";

export function getUserIdFromRequest(req: Request): string | null {
  try {
    const header = req.headers.get("authorization");
    if (!header) return null;

    const token = header.replace("Bearer ", "");
    if (!token) return null;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    return decoded?.id || null;
  } catch {
    return null;
  }
}
