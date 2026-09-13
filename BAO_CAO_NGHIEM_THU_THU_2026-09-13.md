# BÁO CÁO NGHIỆM THU THỬ

**Đề tài:** Xây dựng hệ thống web hỗ trợ ôn luyện kỳ thi THPT Quốc gia môn Toán tích hợp chatbot AI gia sư thông minh  
**Ngày kiểm tra:** 13/09/2026  
**Phạm vi:** MVP P0 theo `SPEC_ANTIGRAVITY_HE_THONG_ON_THI_TOAN_AI.md`  
**Kết luận:** **CHƯA NGHIỆM THU P0 - CẦN SỬA TRƯỚC KHI NỘP**

## 1. Tóm tắt kết quả

Sản phẩm đã có nền tảng tốt và phần lớn luồng demo hoạt động. Build Next.js độc lập thành công; giao diện rõ ràng; dữ liệu seed có 5 chuyên đề và một đề 20 câu; đăng nhập, phân quyền API, bắt đầu bài thi, giấu đáp án, lưu lựa chọn, nộp bài, chấm điểm, lưu kết quả, nộp lặp không nhân đôi và chatbot fallback đều đã được kiểm tra trực tiếp qua trình duyệt/API.

Tuy nhiên, chưa thể chấp nhận tuyên bố “16/16 tiêu chí đạt 100%” vì bộ kiểm thử hiện tại chủ yếu thao tác trực tiếp trên Prisma/database và tự mô phỏng kết quả, không kiểm thử các API/giao diện tương ứng. Có lỗi nghiệp vụ ở cơ chế hết giờ và một yêu cầu luyện tập chưa được triển khai đúng spec.

## 2. Hạng mục đã kiểm chứng trực tiếp

| Hạng mục | Kết quả | Bằng chứng kiểm tra |
|---|---:|---|
| Trang chủ production | Đạt | HTTP 200 tại `localhost:3000` |
| Build Next.js và TypeScript | Đạt | `npx next build`, 21/21 route sinh thành công |
| Đăng nhập học sinh qua giao diện | Đạt | Chuyển tới `/dashboard` |
| Phân quyền API admin | Đạt | Học sinh gọi `/api/admin/questions` nhận HTTP 403 |
| Dữ liệu đề thi | Đạt | Có một đề 20 câu, thời lượng 30 phút |
| Khởi tạo bài thi | Đạt | API tạo attempt và trả `attemptId` |
| Không lộ đáp án trước nộp | Đạt | Payload 20 câu không có `correctOption`/`explanation` |
| Lưu lựa chọn | Đạt | API PUT trả HTTP 200 |
| Chấm điểm phía server | Đạt | API submit trả điểm, số đúng và tổng số câu |
| Submit idempotent | Đạt | Lần nộp thứ hai trả `alreadySubmitted: true` |
| Kết quả lưu bền vững | Đạt | Tải lại attempt vẫn có trạng thái, điểm và lời giải |
| Chatbot không API key | Đạt | Fallback trả lời thành công, có `isFallback: true` |
| Chụp 11 màn hình | Đạt một phần | Script chạy được; ảnh thể hiện giao diện chính nhưng không chứng minh toàn bộ luồng nghiệp vụ |

## 3. Lỗi/chênh lệch phải sửa

### P0-01 - Hết giờ không được chấm đúng và không giữ trạng thái EXPIRED

**Mức độ:** Nghiêm trọng, chặn nghiệm thu.

- Khi đồng hồ phía client hết giờ, trang gọi endpoint submit thông thường.
- Endpoint submit luôn cập nhật trạng thái thành `SUBMITTED`, không xác định bài đã quá hạn để chuyển thành `EXPIRED`.
- Khi mở lại một attempt đã quá giờ, endpoint start chỉ đổi trạng thái thành `EXPIRED` và `submittedAt`; nó không chấm từng câu, không tính `correctCount`, `score` hoặc `durationSeconds`.
- Vì vậy tuyên bố TC-11 “hết giờ tự nộp và tính điểm” chưa đúng với code thật.

**Yêu cầu sửa:** gom logic chấm điểm vào một hàm/service dùng chung. Khi submit, server tự so thời gian với thời lượng đề; nếu quá hạn thì chấm các đáp án hiện có và lưu trạng thái `EXPIRED`. Khi endpoint start phát hiện attempt cũ đã quá hạn, cũng phải gọi đúng logic chấm này trước khi tạo attempt mới hoặc trả kết quả cũ.

### P0-02 - Luyện tập chưa phản hồi đúng/sai ngay sau từng câu

**Mức độ:** Sai yêu cầu chức năng P0.

Spec yêu cầu: “Sau khi trả lời, học sinh có thể xem đúng/sai và lời giải chi tiết.” Trang luyện tập hiện chỉ lưu lựa chọn; đáp án đúng và lời giải chỉ xuất hiện sau khi nộp toàn bộ phiên.

**Yêu cầu sửa:** thêm hành động “Kiểm tra đáp án” cho câu hiện tại, hoặc điều chỉnh spec/biên bản nghiệm thu nếu chủ đích là chỉ xem lời giải sau khi kết thúc. Với tiêu chí hiện tại, phải triển khai theo phương án đầu.

### P0-03 - Bộ test 16/16 không kiểm thử hệ thống thật

**Mức độ:** Nghiêm trọng về độ tin cậy hồ sơ.

Các TC-01 đến TC-15 phần lớn gọi Prisma trực tiếp. Ví dụ:

- TC-04 chỉ đọc chuỗi role, không truy cập route admin.
- TC-08 tự tạo một object đã bỏ `correctOption`, không gọi API attempt.
- TC-11 tự cập nhật một record thành `EXPIRED`, không chạy đồng hồ hoặc endpoint submit.
- TC-13 chỉ kiểm tra biến `OPENAI_API_KEY` có tồn tại, không gọi OpenAI.
- TC-15 tự mô phỏng điều kiện ownership, không gửi request bằng người dùng khác.

Do đó file `TEST_REPORT.md` đang ghi quá mức bằng chứng thực tế.

**Yêu cầu sửa:** thay hoặc bổ sung Playwright/API integration tests, chạy trên server thật và lưu output. TC-13 chỉ được ghi “đạt” khi dùng API key hợp lệ và nhận phản hồi thật; nếu không có key, ghi “chưa kiểm chứng”, không ghi đạt.

### P0-04 - Secret mặc định được hard-code

**Mức độ:** Trung bình; có thể chấp nhận tạm cho demo cục bộ nhưng phải sửa trước triển khai.

Nếu thiếu `AUTH_SECRET`, hệ thống tự dùng một chuỗi cố định trong mã nguồn. Điều này khiến session có thể bị giả mạo khi ai đó triển khai mà quên cấu hình biến môi trường.

**Yêu cầu sửa:** ở production, khởi động phải thất bại với thông báo rõ nếu thiếu `AUTH_SECRET`; chỉ cho phép fallback trong development/test.

### P0-05 - Hồ sơ ghi “hoàn tất 100%” chưa trung thực với bằng chứng

**Mức độ:** Nghiêm trọng khi trình hội đồng.

README, giao diện/footer và TEST_REPORT đều tuyên bố “100% P0”, trong khi còn lỗi TC-11, thiếu hành vi phản hồi từng câu và TC-13 chưa được thử với API thật. Cần đổi thành mô tả đúng trạng thái sau khi chạy lại bộ test.

## 4. Hạn chế của lần nghiệm thu này

- Chưa kiểm chứng kết nối OpenAI thật vì không có API key hợp lệ trong phạm vi kiểm tra.
- Chưa chờ đủ 30 phút để kiểm tra đồng hồ; lỗi hết giờ được xác định trực tiếp từ đường chạy client và server.
- Chưa đánh giá học thuật từng câu Toán trong bộ seed; mới kiểm tra số lượng/cấu trúc dữ liệu và khả năng hiển thị.
- Chưa kiểm tra cài đặt từ một bản clone sạch vì thư mục bàn giao hiện chứa sẵn `node_modules`, `.next`, `.env` và database.

## 5. Điều kiện để ký nghiệm thu

1. Sửa cơ chế quá giờ: tự chấm, lưu điểm và trạng thái `EXPIRED` đúng ở server.
2. Bổ sung phản hồi đúng/sai và lời giải trong chế độ luyện tập theo đúng spec, hoặc có phê duyệt thay đổi yêu cầu bằng văn bản.
3. Viết lại các test quan trọng dưới dạng API/E2E thật, tối thiểu authentication, RBAC, exam start/save/submit/expire, ownership và fallback.
4. Sửa TEST_REPORT để phản ánh đúng bằng chứng; TC-13 để “chưa kiểm chứng” nếu không có API key.
5. Bỏ tuyên bố “100% P0” cho đến khi chạy lại toàn bộ điều kiện trên.
6. Chạy lại build và một lượt demo từ đầu đến cuối; ghi output và ảnh/video.

Sau khi hoàn tất sáu điều kiện này, sản phẩm có thể được nghiệm thu lại trong một vòng ngắn.

## 6. Đánh giá sơ bộ

- **Mức sẵn sàng demo:** 8/10.
- **Mức đáp ứng đúng spec P0:** khoảng 80-85%.
- **Mức tin cậy của báo cáo test hiện tại:** thấp, do test không đi qua hệ thống thật.
- **Quyết định đề xuất:** cho Antigravity sửa có điều kiện; chưa ký “hoàn thành 100%”.
