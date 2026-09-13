# YÊU CẦU SỬA VÀ TRIỂN KHAI PRODUCTION V2

## Chỉ thị dành cho Antigravity

Tiếp tục trên mã nguồn hiện tại. Không tạo lại dự án. Hoàn thành, tự kiểm thử và bàn giao các hạng mục dưới đây theo thứ tự P0. Không tuyên bố hoàn thành nếu chưa có URL production công khai và chưa kiểm tra trực tiếp URL đó.

## P0-01 - Sửa hiển thị công thức và nội dung chatbot

### Lỗi đã quan sát

1. Trang giới thiệu: dòng “Lời giải mẫu KaTeX” đang hiện nguyên các lệnh như `\int`, `\implies`, `\left`, `\right` thay vì công thức.
2. Chatbot: các ký hiệu Markdown `**...**`, danh sách và emoji đang được hiển thị gần như văn bản thô; công thức chỉ render một phần.

### Nguyên nhân cần xử lý

- Không đặt chuỗi chứa LaTeX trực tiếp trong JavaScript string với dấu `\` đơn vì các escape như `\f` có thể bị biến đổi trước khi tới MathRenderer.
- Khối lời giải trang chủ chưa đi qua `MathRenderer`.
- `MathRenderer` chỉ tách công thức, chưa render Markdown an toàn.

### Yêu cầu sửa

- Dùng `String.raw` hoặc double escaping cho mọi chuỗi LaTeX viết trực tiếp trong TS/TSX.
- Toàn bộ câu hỏi và lời giải mẫu trang chủ phải đi qua component render nội dung chung.
- Tạo `RichMathContent` dùng Markdown renderer an toàn kết hợp KaTeX (`react-markdown` + `remark-math` + `rehype-katex`, hoặc giải pháp tương đương).
- Không bật `rehype-raw` nếu chưa sanitize; không cho AI chèn HTML tùy ý.
- Component phải hỗ trợ: đoạn văn, xuống dòng, danh sách, chữ đậm/nghiêng, inline math `$...$`, block math `$$...$$`, code inline.
- Dùng cùng component cho trang chủ, câu hỏi, lời giải, kết quả và chatbot.
- Thêm test với các lệnh `\int`, `\frac`, `\sum`, `\sqrt`, `\lim`, `\left`, `\right`, `\implies`.
- Chụp lại ảnh trang chủ và một câu trả lời chatbot; ảnh không được còn lệnh LaTeX/Markdown thô.

## P0-02 - Thiết kế đúng vai trò quản trị

Admin được phép sử dụng các chức năng học tập giống học sinh, vì vậy Navbar của admin vẫn có:

- Dashboard cá nhân
- Luyện tập
- Thi thử
- Lịch sử cá nhân
- Gia sư AI
- Quản trị

Không bỏ các tab này. Tuy nhiên, `/admin` phải là dashboard quản trị hệ thống, không phải dashboard học tập của admin.

### Dashboard quản trị `/admin`

Hiển thị tối thiểu:

- Tổng số học sinh (`role = STUDENT`).
- Số học sinh hoạt động: có ít nhất một attempt.
- Tổng lượt làm bài đã hoàn thành.
- Điểm trung bình toàn hệ thống.
- Tổng câu hỏi, chuyên đề và đề thi.
- 5 học sinh mới đăng ký gần nhất.
- 5 lượt làm bài gần nhất toàn hệ thống.
- Thống kê kết quả theo chuyên đề.

### Quản lý học sinh `/admin/students`

- Bảng gồm: họ tên, email, ngày đăng ký, số lượt làm, điểm trung bình, điểm cao nhất, lần hoạt động gần nhất.
- Tìm theo tên/email.
- Lọc theo: chưa làm bài, đã làm bài, điểm trung bình dưới 5, từ 5 đến dưới 8, từ 8 trở lên.
- Phân trang server-side.
- Bấm một học sinh mở `/admin/students/[id]`.

### Chi tiết học sinh `/admin/students/[id]`

- Thông tin cơ bản, ngày đăng ký.
- Tổng lượt làm, điểm trung bình/cao nhất, tổng số câu và tỷ lệ đúng.
- Tỷ lệ đúng theo chuyên đề và chuyên đề yếu nhất.
- Danh sách lịch sử luyện tập/thi thử.
- Cho admin mở chi tiết kết quả attempt của học sinh ở chế độ chỉ đọc.
- Không hiển thị password hash hoặc dữ liệu bí mật.

### API quản trị

- `GET /api/admin/overview`
- `GET /api/admin/students?page=&pageSize=&q=&performance=`
- `GET /api/admin/students/[id]`
- Tất cả bắt buộc `ADMIN`; học sinh nhận HTTP 403.
- Thống kê phải tính từ database, không hard-code.
- Không cho admin sửa điểm thủ công trong phiên bản này.

### Dữ liệu seed

- Seed ít nhất 8 học sinh mẫu.
- Có học sinh chưa làm bài, học sinh điểm yếu, trung bình và khá/giỏi.
- Mỗi nhóm có lịch sử attempt phù hợp để dashboard quản trị có dữ liệu ngay khi demo.
- Script seed phải idempotent.

## P0-03 - Tích hợp AI thật

- Dùng OpenAI SDK chỉ ở server.
- Chuyển luồng gọi mô hình sang Responses API nếu phù hợp với phiên bản SDK; không gọi OpenAI trực tiếp từ browser.
- `OPENAI_API_KEY` và `OPENAI_MODEL` chỉ được cấu hình trong biến môi trường của nền tảng deploy.
- Không commit khóa vào GitHub, `.env`, ảnh chụp hoặc tài liệu.
- Giữ fallback mode khi OpenAI lỗi/hết quota, nhưng giao diện phải phân biệt rõ “AI trực tuyến” và “Chế độ minh họa”.
- Thêm timeout và xử lý lỗi 401, 429, 5xx bằng thông báo thân thiện.
- Giới hạn độ dài message và tần suất request cơ bản để tránh lạm dụng chi phí.
- Chỉ gửi dữ liệu cần thiết của câu hỏi; không gửi email, password hay thông tin cá nhân của học sinh.
- Test production phải chứng minh `isFallback: false` và có câu trả lời thực tế. Không ghi khóa trong log.

**Lưu ý cho người triển khai:** người sở hữu dự án tự nhập `OPENAI_API_KEY` vào trang Environment Variables của Vercel. Không yêu cầu gửi key qua chat hoặc đưa vào repository.

## P0-04 - Kiến trúc deploy

Không dùng GitHub Pages vì ứng dụng có Next.js server routes, authentication, Prisma và OpenAI server-side.

Kiến trúc bắt buộc:

- GitHub: lưu repository.
- Vercel: build và chạy Next.js, cung cấp HTTPS và tên miền `*.vercel.app` ngay sau deploy.
- PostgreSQL managed: Neon, Supabase hoặc Vercel Postgres tương thích Prisma.
- Tên miền riêng chỉ cấu hình nếu chủ dự án đã sở hữu domain và có quyền sửa DNS.

### Chuyển database

- Đổi Prisma datasource từ SQLite sang PostgreSQL.
- Tạo migration production; không chỉ dùng `prisma db push` cho quy trình chính thức.
- Không commit `prisma/dev.db`.
- Có command seed production chủ động; không seed lại/xóa dữ liệu mỗi lần build.
- Không dùng `deleteMany()` toàn bộ dữ liệu trong seed production.
- Cập nhật unique constraints/index cần thiết cho truy vấn học sinh, attempt và submittedAt.

### Biến môi trường production

```env
DATABASE_URL=
AUTH_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=
```

- Tạo `AUTH_SECRET` ngẫu nhiên tối thiểu 32 byte.
- Kiểm tra production fail-fast nếu thiếu `DATABASE_URL` hoặc `AUTH_SECRET`.
- `.env.example` chỉ chứa tên biến và giá trị minh họa rỗng.

## P0-05 - GitHub và CI

- Khởi tạo Git repository nếu chưa có.
- Repository đề xuất: `math-thpt-ai`.
- `.gitignore` bắt buộc loại trừ: `.env*` ngoại trừ `.env.example`, `.next`, `node_modules`, SQLite database, Playwright artifacts và log.
- Không commit file chứa API key, secret hoặc cookie.
- Thêm GitHub Actions chạy trên push/PR:
  - `npm ci`
  - `npx prisma generate`
  - lint/typecheck
  - unit/API tests không cần secret thật
  - build với biến môi trường test phù hợp
- README dùng đường dẫn tương đối, không còn đường dẫn tuyệt đối `C:\Users\...`.
- README có URL production, kiến trúc deployment, cách cấu hình env và tài khoản demo.

## P0-06 - Quy trình deploy và tên miền

1. Push nhánh chính lên GitHub.
2. Import repository vào Vercel.
3. Kết nối PostgreSQL và đặt `DATABASE_URL`.
4. Đặt `AUTH_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL` trong Vercel.
5. Chạy migration production: `prisma migrate deploy`.
6. Seed một lần bằng quy trình được kiểm soát.
7. Deploy production.
8. Ghi lại URL dạng `https://<project>.vercel.app`.
9. Nếu có custom domain: add domain trong Vercel, cấu hình DNS và kiểm tra SSL.
10. Test trực tiếp URL production, không lấy localhost làm bằng chứng.

## P0-07 - Kiểm thử nghiệm thu production

Phải chạy trên URL công khai:

1. Trang chủ không còn LaTeX/Markdown thô.
2. Đăng ký học sinh mới và đăng nhập được.
3. Refresh vẫn giữ phiên.
4. Admin thấy danh sách tối thiểu 8 học sinh mẫu.
5. Admin xem được thống kê và lịch sử của một học sinh.
6. Học sinh bị chặn toàn bộ API `/api/admin/*`.
7. Admin vẫn dùng được Dashboard cá nhân, Luyện tập, Thi thử, Lịch sử và Gia sư AI.
8. Làm trọn một phiên luyện tập và xem lời giải tức thời.
9. Làm/nộp một đề thi; kết quả còn tồn tại sau redeploy.
10. Chatbot trả lời với `isFallback: false` bằng OpenAI thật.
11. Tạm bỏ key hoặc giả lập lỗi để xác nhận fallback không crash.
12. Kiểm tra responsive trên 390x844 và 1366x768.
13. Không có lỗi 500 trong log Vercel của toàn bộ kịch bản.
14. GitHub Actions xanh và Vercel deployment trạng thái Ready.

## Bàn giao bắt buộc

- URL GitHub repository.
- URL production `*.vercel.app`.
- Custom domain nếu đã được cung cấp quyền DNS.
- Commit hash và deployment ID đã nghiệm thu.
- Ảnh trang chủ đã sửa công thức.
- Ảnh chatbot AI thật, che thông tin nhạy cảm.
- Ảnh dashboard quản trị có dữ liệu học sinh.
- Báo cáo test production với thời gian, URL và kết quả từng bước.
- Danh sách biến môi trường đã cấu hình theo **tên biến**, tuyệt đối không ghi giá trị secret.

## Điều kiện hoàn thành

Chỉ báo `HOÀN THÀNH` khi có đủ GitHub URL, production URL, database bền vững, OpenAI thật trả lời, admin xem được dữ liệu học sinh và toàn bộ 14 bước nghiệm thu production đạt. Nếu thiếu quyền GitHub/Vercel, domain hoặc API key, báo `BỊ CHẶN` và chỉ rõ đúng thao tác chủ dự án cần thực hiện; không thay thế bằng localhost hoặc fallback rồi tuyên bố hoàn thành.
