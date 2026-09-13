import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  throw new Error(
    "LỖI CẤU HÌNH NGHIÊM TRỌNG: Biến môi trường DATABASE_URL bắt buộc phải được cấu hình trong môi trường Production!"
  );
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
