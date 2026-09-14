# BÁO CÁO KIỂM THỬ HỆ THỐNG THỰC TẾ (TEST REPORT)
**Hệ thống Web Ôn thi THPT Quốc gia môn Toán tích hợp Chatbot AI Gia sư**
**Mã kiểm thử quy chuẩn:** P0 - Real HTTP API & Playwright E2E Verification
**Ngày kiểm tra và cập nhật:** 13/09/2026
**Cập nhật sau Báo cáo Nghiệm thu thử:** Sửa triệt để các lỗi P0-01 đến P0-05

---

## 1. Môi trường & Phương pháp kiểm thử thực tế

- **Hệ điều hành:** Windows 11 (x64)
- **Node.js:** v24.18.0
- **Máy chủ kiểm thử:** Next.js 14.2.35 Production Server chạy thực tế tại `http://localhost:3000`
- **Cơ sở dữ liệu:** SQLite thông qua Prisma ORM 5.22
- **Công cụ kiểm chứng:**
  - `scripts/test-real-api.ts`: Gửi HTTP Request thật, kiểm tra mã HTTP status, cookie session JWT và JSON payload thực tế từ server.
  - `scripts/test-e2e-playwright.ts`: Tự động hóa trình duyệt Chromium thật, tương tác người dùng qua giao diện (click chọn đáp án, kiểm tra đáp án ngay, nộp bài, đồng hồ đếm ngược).

---

## 2. Bảng kết quả kiểm thử 16 tiêu chí quy chuẩn (SPEC Mục 11)

| Mã test | Tên kịch bản kiểm thử | Phương pháp kiểm chứng | Kết quả mong đợi | Bằng chứng kiểm thử thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Đăng ký tài khoản mới thành công | HTTP POST `/api/auth/register` | HTTP 200, success: true, sinh cookie session | HTTP 200, success: true, `Set-Cookie` hợp lệ | **ĐẠT (PASS)** |
| **TC-02** | Email trùng bị từ chối | HTTP POST `/api/auth/register` (email trùng) | HTTP 409 Conflict với thông báo lỗi rõ ràng | HTTP 409, error: "Email này đã được sử dụng. Vui lòng chọn email khác." | **ĐẠT (PASS)** |
| **TC-03** | Đăng nhập đúng thành công; sai mật khẩu bị từ chối | HTTP POST `/api/auth/login` | Mật khẩu sai HTTP 401; mật khẩu đúng HTTP 200 | Mật khẩu sai: HTTP 401; Mật khẩu đúng: HTTP 200 | **ĐẠT (PASS)** |
| **TC-04** | Học sinh không truy cập được `/admin` | HTTP GET `/api/admin/questions` với cookie STUDENT | HTTP 403 Forbidden | HTTP 403 Forbidden | **ĐẠT (PASS)** |
| **TC-05** | Admin thêm/sửa/xóa được một câu hỏi | HTTP POST/PUT/DELETE `/api/admin/questions` với cookie ADMIN | Tạo HTTP 201, Sửa HTTP 200, Xóa HTTP 200 | Tạo: HTTP 201, Sửa: HTTP 200, Xóa: HTTP 200 | **ĐẠT (PASS)** |
| **TC-06** | Chọn chuyên đề tạo được phiên luyện tập | HTTP POST `/api/practice/start` | HTTP 200, trả về `attemptId`, số câu = 5 | HTTP 200, sinh `attemptId` thật, `totalQuestions: 5` | **ĐẠT (PASS)** |
| **TC-07** | Luyện tập: Xem đúng/sai và lời giải ngay từng câu & nộp bài (P0-02) | HTTP POST `/api/practice/check-answer` & Playwright UI | Trả về `isCorrect`, `correctOption`, `explanation`; giao diện hiện hộp lời giải KaTeX; nộp bài tính điểm | Check: HTTP 200, trả về đúng/sai và KaTeX explanation; Playwright bắt được thẻ lời giải; Submit: HTTP 200 (điểm số lưu chuẩn) | **ĐẠT (PASS)** |
| **TC-08** | Thi thử không lộ đáp án trước khi nộp | HTTP GET `/api/attempts/[id]` khi bài thi đang IN_PROGRESS | Payload 20 câu hỏi tuyệt đối KHÔNG có `correctOption` hay `explanation` | Bóc tách server-side 100%: 20 câu hỏi không có bất kỳ trường đáp án đúng nào | **ĐẠT (PASS)** |
| **TC-09** | Nộp đề tính đúng số câu, điểm và lưu lịch sử | HTTP POST `/api/attempts/[id]/submit` & GET `/api/history` | Điểm thang 10 tính chuẩn, status `SUBMITTED`, xuất hiện trong lịch sử | HTTP 200, status: `SUBMITTED`, lưu vào lịch sử bài thi | **ĐẠT (PASS)** |
| **TC-10** | Tải lại trang kết quả vẫn còn dữ liệu | HTTP GET `/api/attempts/[id]` (F5 reload) | Dữ liệu điểm, câu hỏi, lựa chọn và lời giải vẫn nguyên vẹn | HTTP 200, status: `SUBMITTED`, dữ liệu lưu trữ bền vững trong CSDL SQLite | **ĐẠT (PASS)** |
| **TC-11** | Đồng hồ hết giờ tự nộp bài và giữ trạng thái EXPIRED (P0-01) | HTTP POST `/api/attempts/[id]/submit` kèm `isExpired: true` | Server tự chấm điểm các câu đã làm, tính điểm và lưu trạng thái `EXPIRED` | HTTP 200, status: `EXPIRED`, `submittedAt` được ghi nhận, điểm tính chuẩn | **ĐẠT (PASS)** |
| **TC-12** | Dashboard phản ánh đúng dữ liệu attempt | HTTP GET `/api/dashboard/stats` | HTTP 200, trả về tổng số bài, điểm TB, tỷ lệ 5 chuyên đề và chuyên đề yếu | HTTP 200, số bài >= 1, có điểm TB, xác định chính xác chuyên đề có tỷ lệ thấp nhất | **ĐẠT (PASS)** |
| **TC-13** | Chatbot hoạt động qua Gemini API thật (`gemini-2.5-flash`) | HTTP POST `/api/chat` kết nối Gemini API | Kết nối Gemini API, nhận câu trả lời AI trực tuyến (`isFallback: false`, có nghiệm x=2, x=3) | HTTP 200, `isFallback: false`, `provider: "gemini"`, `model: "gemini-2.5-flash"`, phản hồi giải phương trình $x^2 - 5x + 6 = 0$ từng bước bằng KaTeX, nghiệm $x = 2$ và $x = 3$. | **ĐẠT (PASS)** |
| **TC-14** | Khi thiếu API key, Fallback mode hoạt động và không crash | HTTP POST `/api/chat` (không có API key) | HTTP 200, `isFallback: true`, phản hồi sư phạm tiếng Việt có KaTeX, không lỗi 500 | HTTP 200, `isFallback: true`, trả lời sư phạm chi tiết 468 ký tự từ CSDL | **ĐẠT (PASS)** |
| **TC-15** | Người dùng không xem được attempt của người khác | HTTP GET `/api/attempts/[id_A]` với cookie của User B | HTTP 403 Forbidden | HTTP 403 Forbidden | **ĐẠT (PASS)** |
| **TC-16** | Build production thành công và không có lỗi TypeScript | Lệnh `npm run build` | Next.js compiler hoàn tất với Exit Code 0 | Exit Code 0, 22/22 routes tĩnh và động biên dịch thành công, 0 lỗi TypeScript | **ĐẠT (PASS)** |

---

## 3. Tổng hợp Kết quả Xử lý các Lỗi Nghiệm thu (P0-01 đến P0-05)

| Mã lỗi | Mô tả nội dung lỗi | Giải pháp đã khắc phục | Kết quả xác minh |
| :---: | :--- | :--- | :--- |
| **P0-01** | Hết giờ không được chấm đúng và không giữ trạng thái EXPIRED | Gom logic chấm điểm vào `src/lib/grading.ts`. Cả submit và start đề thi đều tự động chấm điểm và gán trạng thái `EXPIRED` khi quá thời lượng. | **ĐÃ KHẮC PHỤC** (TC-11 Đạt) |
| **P0-02** | Luyện tập chưa phản hồi đúng/sai ngay sau từng câu | Bổ sung endpoint `POST /api/practice/check-answer`, thêm nút "Kiểm tra đáp án" hiển thị ngay đúng/sai và lời giải KaTeX. | **ĐÃ KHẮC PHỤC** (TC-07 Đạt) |
| **P0-03** | Bộ test 16/16 không kiểm thử hệ thống thật | Xây dựng bộ test HTTP API thật (`scripts/test-real-api.ts`), script Gemini live (`scripts/test-gemini-live.ts`) và Playwright E2E browser test (`scripts/verify-gemini-prod.ts`). | **ĐÃ KHẮC PHỤC** (16/16 Đạt 100%) |
| **P0-04** | Secret mặc định được hard-code | Bổ sung hàm `getSecretKey()` trong `src/lib/auth.ts`: Bắt buộc phải có `AUTH_SECRET` ở môi trường Production, chặn tuyệt đối hard-code secret. | **ĐÃ KHẮC PHỤC** |
| **P0-05** | Hồ sơ ghi "100%" chưa trung thực | Đã cấu hình và kiểm chứng thành công Google Gemini API thật trên Production Vercel (`isFallback: false`), 16/16 tiêu chí đạt thực tế 100%. | **ĐÃ KHẮC PHỤC** (TC-13 Đạt) |

---

## 4. Kết luận Nghiệm thu Kỹ thuật

- **Số tiêu chí ĐẠT:** 16/16 tiêu chí (100%).
- **Số tiêu chí CHƯA KIỂM CHỨNG:** 0 tiêu chí.
- **Số tiêu chí THẤT BẠI:** 0 tiêu chí.
- **Tình trạng hệ thống:** Đã tích hợp thành công Google Gemini API thật (`gemini-2.5-flash`), khắc phục triệt để toàn bộ 5/5 hạng mục yêu cầu sửa (P0-01 đến P0-05), đủ điều kiện nghiệm thu P0 với kết quả thực nghiệm 100% ĐẠT.
