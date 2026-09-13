# SPEC TRIỂN KHAI KHẨN - HỆ THỐNG WEB ÔN THI THPT QUỐC GIA MÔN TOÁN TÍCH HỢP CHATBOT AI

## 0. Chỉ thị thực thi dành cho Antigravity

Hãy xây dựng, kiểm thử và bàn giao một **MVP chạy hoàn chỉnh ngay hôm nay** cho đề tài:

> **Xây dựng hệ thống web hỗ trợ ôn luyện kỳ thi THPT Quốc gia môn Toán tích hợp chatbot AI gia sư thông minh**

Không chỉ tạo giao diện minh họa. Sản phẩm phải có dữ liệu thật trong cơ sở dữ liệu, đăng nhập được, làm bài được, chấm điểm được, lưu lịch sử được và chatbot trả lời được. Ưu tiên một luồng hoàn chỉnh, ổn định và dễ demo hơn nhiều chức năng dở dang.

Antigravity được quyền chủ động xử lý lỗi kỹ thuật và chọn thư viện tương đương, nhưng không được mở rộng phạm vi trước khi hoàn tất toàn bộ tiêu chí nghiệm thu P0 trong tài liệu này.

## 1. Mục tiêu sản phẩm

Xây dựng website responsive giúp học sinh lớp 12:

1. Ôn câu hỏi trắc nghiệm môn Toán theo chuyên đề.
2. Làm một đề thi mô phỏng có giới hạn thời gian.
3. Nhận điểm và lời giải sau khi nộp bài.
4. Theo dõi kết quả học tập và chuyên đề còn yếu.
5. Hỏi chatbot AI để nhận gợi ý, giải thích phương pháp và phân tích lỗi sai.

Sản phẩm phục vụ demo đồ án. Không tuyên bố thay thế giáo viên và không cần triển khai ở quy mô thương mại.

## 2. Phạm vi bắt buộc trong ngày - P0

### 2.1. Tài khoản và phân quyền

- Đăng ký tài khoản học sinh bằng họ tên, email, mật khẩu.
- Đăng nhập, đăng xuất và duy trì phiên đăng nhập.
- Mật khẩu phải được băm, không lưu dạng rõ.
- Có hai vai trò: `STUDENT` và `ADMIN`.
- Seed sẵn một tài khoản quản trị và một tài khoản học sinh để demo.
- Các trang quản trị và học tập phải được bảo vệ theo vai trò.

### 2.2. Ngân hàng câu hỏi

- Câu hỏi trắc nghiệm một đáp án đúng, gồm bốn lựa chọn A, B, C, D.
- Mỗi câu có: nội dung, chuyên đề, mức độ, đáp án đúng, lời giải chi tiết.
- Chuyên đề tối thiểu: Hàm số; Mũ và Logarit; Nguyên hàm - Tích phân; Hình học không gian; Xác suất.
- Mức độ: Nhận biết, Thông hiểu, Vận dụng.
- Seed tối thiểu 30 câu hỏi hợp lệ, phân bố trên ít nhất 5 chuyên đề.
- Nội dung công thức hiển thị bằng LaTeX/KaTeX hoặc MathJax.
- Trang quản trị cho phép xem danh sách, thêm, sửa và xóa câu hỏi.

### 2.3. Ôn tập theo chuyên đề

- Học sinh chọn chuyên đề và số lượng câu.
- Hệ thống tạo phiên luyện tập từ ngân hàng câu hỏi.
- Mỗi câu hiển thị bốn đáp án, có điều hướng câu trước/sau.
- Sau khi trả lời, học sinh có thể xem đúng/sai và lời giải chi tiết.
- Khi kết thúc, hệ thống lưu tổng số câu, số đúng, số sai, điểm và thời gian làm.

### 2.4. Thi thử

- Có ít nhất một đề thi mẫu được seed sẵn, gồm 20 câu.
- Có đồng hồ đếm ngược; thời lượng demo mặc định 30 phút và có thể cấu hình trong dữ liệu đề.
- Có bảng điều hướng số câu và trạng thái đã/chưa trả lời.
- Có hộp xác nhận trước khi nộp bài.
- Tự nộp khi hết giờ.
- Không hiển thị đáp án đúng trước khi nộp.
- Sau khi nộp: hiển thị điểm thang 10, số đúng/sai, thời gian làm và danh sách từng câu kèm đáp án đúng, đáp án đã chọn, lời giải.
- Kết quả phải được lưu, tải lại trang không bị mất.

### 2.5. Dashboard học tập

- Hiển thị tổng số lượt đã làm, điểm trung bình, điểm cao nhất và tổng số câu đã trả lời.
- Hiển thị 5 kết quả gần nhất.
- Hiển thị tỷ lệ đúng theo chuyên đề.
- Tự xác định “chuyên đề cần cải thiện” là chuyên đề có tỷ lệ đúng thấp nhất, chỉ tính khi đã trả lời ít nhất một câu thuộc chuyên đề đó.
- Có biểu đồ đơn giản hoặc thanh tiến độ; không cần hệ thống phân tích phức tạp.

### 2.6. Chatbot AI gia sư Toán

- Có giao diện chat riêng và nút “Hỏi AI về câu này” tại trang xem kết quả/lời giải.
- Khi hỏi từ một câu cụ thể, gửi kèm nội dung câu, bốn lựa chọn, đáp án đúng và lời giải hiện có làm ngữ cảnh.
- Chatbot trả lời bằng tiếng Việt, hiển thị được công thức toán.
- Prompt hệ thống phải yêu cầu chatbot:
  - đóng vai gia sư Toán THPT;
  - ưu tiên gợi ý từng bước trước khi đưa đáp án cuối;
  - giải thích phương pháp và lỗi sai;
  - không bịa dữ kiện;
  - nếu câu hỏi ngoài phạm vi Toán THPT thì trả lời ngắn rằng hệ thống chỉ hỗ trợ Toán THPT;
  - nhắc học sinh kiểm tra lại kết quả AI ở các bài toán quan trọng.
- API key chỉ nằm ở biến môi trường phía server, tuyệt đối không xuất hiện trong frontend hoặc commit Git.
- Nếu chưa cấu hình API key, hệ thống không được lỗi trắng. Phải chuyển sang **demo fallback mode** và trả về một lời nhắn/gợi ý có cấu trúc dựa trên lời giải lưu trong cơ sở dữ liệu; giao diện hiển thị nhãn “Chế độ minh họa”.
- Lưu lịch sử hội thoại tối thiểu trong phiên hiện tại hoặc trong cơ sở dữ liệu theo người dùng.

## 3. Ngoài phạm vi - không làm trong phiên bản hôm nay

- Thanh toán, gói thuê bao hoặc thương mại hóa.
- Mạng xã hội, diễn đàn, chat giữa học sinh.
- Lớp học trực tuyến và tài khoản giáo viên riêng.
- Nhận dạng chữ viết tay, OCR đề từ ảnh/PDF.
- Huấn luyện hoặc fine-tune mô hình AI riêng.
- Sinh đề thích ứng bằng thuật toán phức tạp.
- Chống gian lận, giám sát webcam.
- Ứng dụng di động native.
- Nhập hàng nghìn câu hỏi hoặc thu thập trái phép đề thi có bản quyền.

## 4. Kiến trúc và công nghệ mặc định

Nếu chưa có mã nguồn nền, dùng một monolith để hoàn thành nhanh và dễ chạy:

- Next.js 14+ với App Router và TypeScript.
- Tailwind CSS; có thể dùng shadcn/ui nếu cài đặt ổn định.
- Prisma ORM.
- SQLite cho bản demo cục bộ; cấu trúc cho phép đổi sang PostgreSQL sau này.
- Auth.js/NextAuth Credentials hoặc cơ chế session cookie an toàn tương đương.
- `bcrypt`/`bcryptjs` để băm mật khẩu.
- Zod để kiểm tra dữ liệu đầu vào.
- Recharts cho biểu đồ nếu cần.
- KaTeX hoặc MathJax cho công thức.
- API chatbot phía server tương thích OpenAI; tên model lấy từ biến môi trường, không hard-code model đã lỗi thời.

Nếu repository hiện có dùng stack khác nhưng đã chạy tốt, giữ stack đó và thực hiện đầy đủ hành vi/tiêu chí nghiệm thu; không viết lại chỉ để khớp danh sách trên.

## 5. Mô hình dữ liệu tối thiểu

### User

- `id`
- `name`
- `email` unique
- `passwordHash`
- `role`: STUDENT | ADMIN
- `createdAt`

### Topic

- `id`
- `name` unique
- `description`

### Question

- `id`
- `content`
- `optionA`, `optionB`, `optionC`, `optionD`
- `correctOption`: A | B | C | D
- `explanation`
- `difficulty`: RECOGNITION | UNDERSTANDING | APPLICATION
- `topicId`
- `createdAt`, `updatedAt`

### Exam

- `id`
- `title`
- `description`
- `durationMinutes`
- `isPublished`

### ExamQuestion

- `examId`
- `questionId`
- `position`

### Attempt

- `id`
- `userId`
- `examId` nullable, để phân biệt thi thử và luyện tập
- `mode`: PRACTICE | EXAM
- `startedAt`, `submittedAt`
- `durationSeconds`
- `correctCount`, `totalQuestions`
- `score`
- `status`: IN_PROGRESS | SUBMITTED | EXPIRED

### AttemptAnswer

- `id`
- `attemptId`
- `questionId`
- `selectedOption` nullable
- `isCorrect`

### ChatMessage (khuyến nghị nếu đủ thời gian)

- `id`
- `userId`
- `role`: USER | ASSISTANT
- `content`
- `questionId` nullable
- `createdAt`

Ràng buộc quan trọng: kết quả chấm phải được tính ở server dựa trên đáp án trong cơ sở dữ liệu; frontend không được nhận trường `correctOption` trước khi học sinh nộp bài thi.

## 6. Các trang bắt buộc

### Công khai

- `/` - giới thiệu ngắn, tính năng chính, nút đăng nhập/đăng ký.
- `/login`
- `/register`

### Học sinh

- `/dashboard`
- `/practice` - chọn chuyên đề và số câu.
- `/practice/[attemptId]`
- `/exams` - danh sách đề thi.
- `/exams/[examId]`
- `/attempts/[attemptId]/result`
- `/history`
- `/tutor` - chatbot AI.

### Quản trị

- `/admin`
- `/admin/questions`
- `/admin/questions/new`
- `/admin/questions/[id]/edit`

Menu phải thay đổi theo trạng thái đăng nhập/vai trò. Mọi trang cần có trạng thái loading, empty và error hợp lý.

## 7. API/hành vi server tối thiểu

- Đăng ký tài khoản, kiểm tra email trùng và mật khẩu tối thiểu 6 ký tự.
- Đăng nhập/đăng xuất.
- Lấy danh sách chuyên đề và đề thi đã công bố.
- Tạo phiên luyện tập/thi thử.
- Lưu hoặc cập nhật lựa chọn của học sinh.
- Nộp bài theo cơ chế idempotent: bấm nộp hai lần không tạo hai kết quả.
- Chấm điểm server-side và trả kết quả sau khi nộp.
- Lấy lịch sử và thống kê của chính người dùng.
- CRUD câu hỏi chỉ dành cho ADMIN.
- Endpoint chat phía server, có validation, xử lý thiếu API key và không làm lộ thông tin bí mật.

Không cho phép người dùng xem hoặc sửa attempt của người khác bằng cách đổi ID trên URL.

## 8. Giao diện và trải nghiệm demo

- Giao diện tiếng Việt, responsive tối thiểu cho laptop và điện thoại.
- Phong cách giáo dục hiện đại; màu chủ đạo xanh dương hoặc xanh ngọc, độ tương phản dễ đọc.
- Không dùng lorem ipsum, nút giả hoặc số liệu hard-code nếu đã có thể tính từ DB.
- Công thức không bị vỡ dòng hoặc hiện ký hiệu LaTeX thô.
- Câu đang làm, câu đã trả lời và câu chưa trả lời có trạng thái trực quan khác nhau.
- Thông báo rõ khi lưu đáp án, nộp bài hoặc gặp lỗi.
- Chatbot có ví dụ câu hỏi gợi ý và trạng thái đang trả lời.

## 9. Dữ liệu seed và tài khoản demo

Tạo script seed chạy lặp lại an toàn, gồm:

- Ít nhất 5 chuyên đề.
- Ít nhất 30 câu hỏi Toán có đáp án và lời giải hợp lý.
- 1 đề thi 20 câu, thời lượng 30 phút.
- Một vài attempt đã nộp cho tài khoản học sinh để dashboard có dữ liệu khi demo.

Tài khoản mặc định ghi trong README, ví dụ:

- Admin: `admin@mathai.local` / `Admin@123`
- Học sinh: `student@mathai.local` / `Student@123`

Đây chỉ là thông tin demo cục bộ; README phải cảnh báo đổi mật khẩu khi triển khai thật.

## 10. Biến môi trường

Cung cấp `.env.example`, tối thiểu:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret"
OPENAI_API_KEY=""
OPENAI_MODEL=""
```

Không commit `.env`, khóa API, database chứa dữ liệu nhạy cảm hoặc secret thật.

## 11. Kiểm thử bắt buộc

Antigravity phải tự chạy và ghi kết quả trong `TEST_REPORT.md`.

1. Đăng ký tài khoản mới thành công.
2. Email trùng bị từ chối.
3. Đăng nhập đúng thành công; mật khẩu sai bị từ chối.
4. Học sinh không truy cập được `/admin`.
5. Admin thêm/sửa/xóa được một câu hỏi.
6. Chọn chuyên đề tạo được phiên luyện tập.
7. Trả lời và kết thúc luyện tập tạo đúng kết quả.
8. Thi thử không lộ đáp án trước khi nộp.
9. Nộp đề tính đúng số câu, điểm và lưu lịch sử.
10. Tải lại trang kết quả vẫn còn dữ liệu.
11. Đồng hồ hết giờ tự nộp bài.
12. Dashboard phản ánh đúng dữ liệu attempt.
13. Chatbot hoạt động khi có API key.
14. Khi thiếu API key, fallback mode hoạt động và website không crash.
15. Người dùng không xem được attempt của người khác.
16. Build production thành công và không có lỗi TypeScript/lint nghiêm trọng.

Ưu tiên bổ sung test tự động cho hàm chấm điểm, tính thống kê và phân quyền. Nếu không đủ thời gian để tự động hóa toàn bộ, kiểm thử thủ công các luồng còn lại và ghi bằng chứng rõ trong báo cáo kiểm thử.

## 12. Tiêu chí nghiệm thu P0

Chỉ được tuyên bố hoàn thành khi tất cả điều kiện sau đạt:

- Cài đặt từ một bản clone sạch theo README và chạy được.
- Database migrate/seed thành công bằng lệnh đã ghi.
- Hai tài khoản demo đăng nhập được.
- Admin CRUD được câu hỏi.
- Học sinh làm trọn một phiên luyện tập.
- Học sinh làm trọn một đề thi 20 câu, nộp và nhận điểm đúng.
- Kết quả xuất hiện trong lịch sử và dashboard.
- Chatbot có cả chế độ API thật và fallback khi thiếu key.
- Công thức Toán hiển thị đúng.
- Không lộ đáp án trước khi nộp thi.
- Không có link chính bị 404, nút không hoạt động hoặc lỗi trắng màn hình.
- `npm run build` (hoặc lệnh tương đương) thành công.
- Có README, `.env.example`, schema/migration, seed và báo cáo kiểm thử.

## 13. Sản phẩm phải bàn giao

1. Toàn bộ mã nguồn.
2. File README hướng dẫn:
   - yêu cầu môi trường;
   - cài dependency;
   - cấu hình `.env`;
   - migrate và seed database;
   - chạy development và production;
   - tài khoản demo;
   - cách bật chatbot AI thật;
   - lỗi thường gặp.
3. `.env.example` không chứa secret.
4. Prisma schema/migration và script seed.
5. `TEST_REPORT.md` gồm bảng: mã test, bước thực hiện, kết quả mong đợi, kết quả thực tế, đạt/không đạt.
6. `PROJECT_REPORT.md` làm nền cho báo cáo đồ án, gồm:
   - bối cảnh và vấn đề;
   - mục tiêu và phạm vi;
   - yêu cầu chức năng/phi chức năng;
   - kiến trúc và công nghệ;
   - mô hình dữ liệu;
   - mô tả các chức năng;
   - kiểm thử và kết quả;
   - hạn chế và hướng phát triển.
7. `DEMO_SCRIPT.md`: kịch bản demo 5 phút, ghi rõ tài khoản và thứ tự thao tác.
8. Ảnh chụp rõ nét các màn hình chính trong thư mục `docs/screenshots/`.
9. Nếu có thể: video demo ngắn hoặc chỉ dẫn quay video.

## 14. Thứ tự triển khai bắt buộc

1. Khảo sát repository, chạy thử và ghi nhận hiện trạng; không phá chức năng sẵn có.
2. Chốt stack, tạo schema, migration và seed.
3. Làm authentication và phân quyền.
4. Làm ngân hàng câu hỏi và admin CRUD.
5. Làm luồng luyện tập.
6. Làm luồng thi thử, chấm điểm và lưu attempt.
7. Làm dashboard/lịch sử.
8. Tích hợp chatbot và fallback mode.
9. Hoàn thiện responsive, error/empty/loading states.
10. Chạy test, build production, sửa lỗi.
11. Viết tài liệu, chụp màn hình và chuẩn bị demo.

Không dành nhiều thời gian cho animation, dark mode hoặc trang trí trước khi P0 chạy hoàn chỉnh.

## 15. Quy tắc báo cáo tiến độ của Antigravity

Trong quá trình làm, cập nhật ngắn sau mỗi mốc lớn với:

- Hạng mục vừa hoàn thành.
- File chính đã tạo/sửa.
- Lệnh/test đã chạy và kết quả.
- Hạng mục tiếp theo.
- Vướng mắc cụ thể nếu có.

Khi kết thúc, trả báo cáo theo mẫu:

```text
TRẠNG THÁI: HOÀN THÀNH / CHƯA HOÀN THÀNH

1. Chức năng đã hoàn thành:
- ...

2. Chức năng chưa hoàn thành hoặc đang dùng fallback:
- ...

3. Kiểm thử và build:
- Lệnh: ...
- Kết quả: ...

4. Tài khoản demo:
- ...

5. Cách chạy:
- ...

6. Kịch bản demo 5 phút:
- ...

7. Hạn chế/rủi ro còn lại:
- ...
```

Không được báo “hoàn thành” nếu chỉ tạo giao diện, dùng mock data cho luồng chính, bỏ qua build hoặc chưa tự chạy thử từ đầu đến cuối.

## 16. Hạng mục P1 chỉ làm khi toàn bộ P0 đã đạt

- Import câu hỏi từ CSV/Excel.
- Bộ lọc nâng cao trong quản trị.
- Đánh dấu câu hỏi yêu thích.
- Chatbot có danh sách cuộc hội thoại lâu dài.
- Xuất kết quả học tập ra PDF.
- Thêm nhiều đề thi mẫu.
- Gợi ý lộ trình ôn tập theo chuyên đề yếu.

## 17. Kịch bản nghiệm thu nhanh dành cho giảng viên

1. Làm theo README trên môi trường sạch; migrate và seed dữ liệu.
2. Đăng nhập admin, thêm một câu hỏi rồi sửa câu đó.
3. Đăng nhập học sinh, luyện 5 câu theo một chuyên đề và xem lời giải.
4. Mở đề thi mẫu, chọn đáp án, tải lại trang để kiểm tra dữ liệu còn giữ.
5. Nộp bài, đối chiếu điểm với đáp án và mở lại từ lịch sử.
6. Kiểm tra dashboard và chuyên đề cần cải thiện.
7. Từ một câu sai, bấm “Hỏi AI về câu này”.
8. Chạy chatbot khi có key; sau đó bỏ key để kiểm tra fallback mode.
9. Thử truy cập trang admin bằng tài khoản học sinh và attempt của tài khoản khác.
10. Chạy build production lần cuối.

Nếu cả 10 bước trên đạt, MVP đủ điều kiện trình diễn và làm nền để hoàn thiện báo cáo đồ án.
