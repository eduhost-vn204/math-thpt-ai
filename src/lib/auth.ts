import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    (!secret || secret.length < 32 || secret === "replace-with-a-long-random-secret")
  ) {
    throw new Error(
      "LỖI BẢO MẬT NGHIÊM TRỌNG: Biến môi trường AUTH_SECRET bắt buộc phải có độ dài tối thiểu 32 ký tự và được cấu hình an toàn trong môi trường Production!"
    );
  }
  return new TextEncoder().encode(secret || "math-thpt-ai-dev-secret-session-key-2026-secure");
}

const COOKIE_NAME = "mathai_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
}

// Băm mật khẩu
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Kiểm tra mật khẩu
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Tạo JWT token
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

// Xác thực JWT token
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

// Đặt cookie phiên đăng nhập
export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
  });
}

// Xóa cookie phiên đăng nhập
export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Lấy thông tin user hiện tại từ cookie
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

// Yêu cầu đăng nhập (dùng trong server components hoặc API)
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// Yêu cầu vai trò ADMIN
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
