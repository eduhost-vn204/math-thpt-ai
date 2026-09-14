# HỆ THỐNG WEB ÔN THI THPT QUỐC GIA MÔN TOÁN TÍCH HỢP GIA SƯ AI

> **Dự án:** Web Ôn luyện kỳ thi THPT Quốc gia môn Toán tích hợp Chatbot Gia sư AI thông minh (`math-thpt-ai`).  
> **Kiến trúc:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, OpenAI SDK, KaTeX.

---

## 1. Kiến trúc Triển khai (Deployment Architecture)

Ứng dụng được thiết kế theo mô hình Monolith Full-stack hiện đại:

- **Source Control:** GitHub Repository (`eduhost-vn204/math-thpt-ai`).
- **Hosting & Compute:** Vercel (chạy Next.js App Router, Server Components & Route Handlers).
- **Cơ sở dữ liệu:** PostgreSQL Managed (Neon, Supabase hoặc Vercel Postgres) kết nối qua Prisma ORM với cơ chế migration chính thức (`prisma migrate deploy`).
- **Trí tuệ nhân tạo (AI Engine):** Kiến trúc đa nhà cung cấp (`AI_PROVIDER=gemini|openai`). Hỗ trợ Google Gemini API (`gemini-2.5-flash` qua OpenAI-compatible endpoint) và OpenAI API (`gpt-4o-mini`). Thực thi độc quyền ở server-side, có timeout 15s, rate limit và chế độ dự phòng (fallback) sư phạm an toàn khi chưa cấu hình API key.
- **Bảo mật:** Cookie-based HTTP-only JWT (jose), băm mật khẩu Bcrypt, xác thực phân quyền Role-based (STUDENT vs ADMIN), fail-fast validation cho biến môi trường production.

---

## 2. Cấu hình Biến môi trường

File `.env.example` chứa các biến cần thiết:

```env
DATABASE_URL=
AUTH_SECRET=
AI_PROVIDER=gemini
GEMINI_API_KEY=
AI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Hướng dẫn thiết lập:

| Tên biến | Bắt buộc | Mô tả & Giá trị mẫu |
| :--- | :---: | :--- |
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL (ví dụ: `postgresql://user:password@ep-xyz.neon.tech/dbname?sslmode=require`) |
| `AUTH_SECRET` | Có | Khóa bí mật ký phiên JWT (tối thiểu 32 byte ngẫu nhiên, ví dụ: `openssl rand -base64 32`) |
| `AI_PROVIDER` | Tùy chọn | Nhà cung cấp AI (`gemini` hoặc `openai`, mặc định: `gemini`) |
| `GEMINI_API_KEY` | Tùy chọn | Khóa Gemini API khi dùng provider `gemini` (lấy tại Google AI Studio) |
| `AI_MODEL` | Tùy chọn | Model AI sử dụng (mặc định: `gemini-2.5-flash` cho Gemini, `gpt-4o-mini` cho OpenAI) |
| `OPENAI_API_KEY` | Tùy chọn | Khóa OpenAI API khi dùng provider `openai` |
| `OPENAI_MODEL` | Tùy chọn | Model OpenAI sử dụng (mặc định: `gpt-4o-mini`) |

> **Bảo mật nghiêm ngặt:** Tuyệt đối không commit file `.env` hoặc để lộ API key trong mã nguồn và repository. Khi triển khai trên Vercel, hãy nạp các biến này trực tiếp tại mục **Project Settings -> Environment Variables**.

---

## 3. Hướng dẫn Khởi chạy Cục bộ (Local Development)

### Bước 1: Cài đặt dependencies
```bash
git clone <URL_REPO>
cd math-thpt-ai
npm install
```

### Bước 2: Thiết lập biến môi trường
Tạo file `.env` từ `.env.example` và điền chuỗi kết nối PostgreSQL cùng `AUTH_SECRET`.

### Bước 3: Di chuyển cấu trúc dữ liệu & Nạp dữ liệu mẫu
```bash
# Áp dụng migration vào cơ sở dữ liệu
npx prisma migrate deploy

# Nạp dữ liệu khởi tạo (Idempotent: 5 chuyên đề, 35 câu hỏi KaTeX, đề thi thử, tài khoản demo)
npm run db:seed
```

### Bước 4: Chạy ứng dụng
```bash
# Chế độ phát triển
npm run dev

# Hoặc biên dịch và chạy production cục bộ
npm run build
npm start
```
Mở trình duyệt tại: `http://localhost:3000`

---

## 4. Tài khoản Demo Nghiệm thu

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Ghi chú quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@mathai.local` | `Admin@123` | Toàn quyền xem Overview hệ thống, quản lý học sinh, xem bài làm ở chế độ chỉ đọc, ngân hàng câu hỏi, đồng thời vẫn dùng được các chức năng học tập |
| **Học sinh (STUDENT)** | `student@mathai.local` | `Student@123` | Học sinh tiêu biểu (Điểm 8.0, 2 bài làm), luyện tập, thi thử, hỏi AI Gia sư |
| **Học sinh Khá/Giỏi** | `hoang.nam@mathai.local` | `Student@123` | Điểm 9.0 (3 bài làm) |
| **Học sinh Xuất sắc** | `minh.anh@mathai.local` | `Student@123` | Điểm 9.5 (2 bài làm) |
| **Học sinh Trung bình** | `duc.huy@mathai.local` | `Student@123` | Điểm 6.5 (2 bài làm) |
| **Học sinh Yếu** | `quoc.bao@mathai.local` | `Student@123` | Điểm 4.0 (2 bài làm) |
| **Học sinh Chưa làm bài** | `mai.anh@mathai.local` | `Student@123` | 0 bài làm (phục vụ kiểm thử bộ lọc "Chưa làm bài") |

---

## 5. Quy trình Triển khai Lên Vercel & PostgreSQL

1. **Đẩy mã nguồn lên GitHub:**
   ```bash
   git push origin main
   ```
2. **Tạo Database PostgreSQL:** Tạo database trên Neon (`neon.tech`) hoặc Supabase và sao chép chuỗi kết nối `DATABASE_URL`.
3. **Tạo Project trên Vercel:** Import repository từ GitHub.
4. **Cấu hình Environment Variables trên Vercel:**
   - `DATABASE_URL`: Connection string PostgreSQL.
   - `AUTH_SECRET`: Chuỗi ngẫu nhiên tối thiểu 32 ký tự.
   - `AI_PROVIDER`: `gemini` (hoặc `openai`).
   - `GEMINI_API_KEY`: Khóa Gemini API lấy từ Google AI Studio (người dùng tự nhập).
   - `AI_MODEL`: `gemini-2.5-flash` (hoặc `gemini-1.5-flash`).
   - `OPENAI_API_KEY`: Khóa OpenAI API (nếu muốn dùng OpenAI thay thế).
5. **Chạy Migration & Seed trên Database:**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
6. **Deploy:** Vercel tự động build và cung cấp URL công khai dạng `https://<ten-du-an>.vercel.app`.

---

## 6. Các lệnh Kiểm thử & Tiện ích

```bash
# Kiểm thử công thức toán KaTeX (\int, \frac, \sum, \sqrt, \lim, \left, \right, \implies)
npm run test:math

# Kiểm thử API tự động (Auth, Luyện tập, Thi thử, Admin Overview, Quản lý học sinh, RBAC)
npm run test:api

# Kiểm thử giao diện E2E bằng Playwright
npm run test:e2e
```
