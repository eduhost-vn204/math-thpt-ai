# KỊCH BẢN DEMO BẢO VỆ ĐỒ ÁN (5 PHÚT)
**Hệ thống Web Ôn thi THPT Quốc gia môn Toán tích hợp Chatbot AI**
**Dành cho:** Giảng viên hướng dẫn & Hội đồng chấm bảo vệ đồ án / NCKH

---

## 1. Thông tin Tài khoản Demo Cục bộ

Hệ thống đã được nạp sẵn dữ liệu thực tế trong CSDL SQLite:

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích sử dụng trong kịch bản |
| :--- | :--- | :--- | :--- |
| **Học sinh (STUDENT)** | `student@mathai.local` | `Student@123` | Demo luyện tập chuyên đề, thi thử 30 phút, xem Dashboard và chat với Gia sư AI |
| **Quản trị viên (ADMIN)** | `admin@mathai.local` | `Admin@123` | Demo quản lý ngân hàng câu hỏi, thêm/sửa/xóa câu hỏi có KaTeX Live Preview |

> **Mẹo demo nhanh:** Tại trang `/login`, có sẵn 2 nút **"🎓 Học sinh demo"** và **"🛡️ Quản trị viên"** để tự động điền thông tin chỉ bằng 1 cú nhấp chuột mà không cần gõ bàn phím!

---

## 2. Kịch bản Demo 5 Phút Chi Tiết (Từng bước thao tác)

### ⏱️ Phút 0:00 - 0:45: Giới thiệu Tổng quan & Đăng nhập
1. **Truy cập Trang chủ:** Mở trình duyệt tại `http://localhost:3000`.
2. **Trình bày:**
   - Giới thiệu ngắn về sứ mệnh của hệ thống: đồng hành cùng học sinh lớp 12 tự tin chinh phục kỳ thi THPT Quốc gia môn Toán với sự trợ giúp của AI.
   - Trỏ chuột vào phần minh họa công thức Toán KaTeX sắc nét, không bị vỡ layout.
3. **Thao tác:** Bấm nút **"Đăng nhập"** trên thanh menu, bấm nút **"🎓 Học sinh demo"** rồi bấm **"Đăng nhập"**.

---

### ⏱️ Phút 0:45 - 1:45: Trải nghiệm Dashboard & Phân tích Chuyên đề Yếu
1. **Màn hình Dashboard (`/dashboard`):**
   - Giới thiệu 4 thẻ chỉ số: Tổng số lượt thi, Điểm cao nhất, Điểm trung bình và Tổng số câu đã làm.
   - Giới thiệu biểu đồ tỷ lệ chính xác trên 5 chuyên đề Toán: *Hàm số, Mũ - Logarit, Tích phân, Hình học Oxyz, Xác suất*.
   - **Điểm nhấn sư phạm:** Chỉ vào khối cảnh báo màu hổ phách **"Chuyên đề cần cải thiện"** được hệ thống tự động tính toán dựa trên chuyên đề có tỷ lệ đúng thấp nhất.
2. **Thao tác:** Nhấp vào nút **"Ôn luyện ngay"** tại khối cảnh báo để chuyển sang trang luyện tập.

---

### ⏱️ Phút 1:45 - 2:45: Luyện tập Chuyên đề & Thi thử 20 câu 30 phút
1. **Luyện tập (`/practice`):**
   - Chọn chuyên đề mong muốn (VD: *Hàm số và ứng dụng đạo hàm*).
   - Chọn số lượng 5 câu hỏi và bấm **"Bắt đầu luyện tập ngay"**.
   - Thao tác chọn đáp án, bấm chuyển câu trước/sau, chỉ vào bảng câu hỏi bên phải để thấy trạng thái đổi màu xanh tức thì (đã lưu vào CSDL).
2. **Phòng thi thử (`/exams` -> `/exams/[examId]`):**
   - Mở đề thi thử số 01 chuẩn cấu trúc 20 câu 30 phút.
   - **Điểm nhấn kỹ thuật:**
     - Chỉ vào đồng hồ đếm ngược từng giây trên thanh tiêu đề cố định.
     - Nhấn mạnh tính năng bảo mật: Server đã loại bỏ hoàn toàn trường `correctOption` trước khi nộp để chống gian lận F12/Inspect.
     - Thao tác chọn vài câu, bấm **"Nộp bài thi"** -> xuất hiện hộp thoại xác nhận số câu đã làm và bấm nộp bài.

---

### ⏱️ Phút 2:45 - 4:00: Bảng điểm Thang 10, Lời giải Chi tiết & Chatbot AI Gia sư
1. **Trang kết quả (`/attempts/[attemptId]/result`):**
   - Điểm số thang 10 hiển thị to rõ (VD: 8.0đ / 10đ), phân tích rõ số câu đúng, số câu sai và thời gian làm bài.
   - Cuộn xuống danh sách câu hỏi: Đối chiếu phương án học sinh chọn và phương án đúng, cùng lời giải chi tiết từng bước bằng KaTeX.
   - Nhấn F5 (Reload trang) để chứng minh dữ liệu lưu trữ bền vững trong CSDL SQLite.
2. **Tương tác với Gia sư AI:**
   - Tại một câu làm sai, nhấp vào nút **"Hỏi AI về câu này"**.
   - Hệ thống chuyển sang phòng chat `/tutor` và tự động đính kèm ngữ cảnh câu hỏi ID vào khung chat.
   - Bấm nút gửi để nhận phân tích phương pháp giải sư phạm.
   - **Điểm nhấn bảo mật & độ tin cậy:** Trỏ vào nhãn **"Chế độ minh họa"** (Fallback Mode) chứng minh website vẫn phản hồi sư phạm thông minh từ CSDL mà không bị crash hay lỗi 500 khi chưa nạp API key bên ngoài.

---

### ⏱️ Phút 4:00 - 5:00: Phân quyền Quản trị viên (ADMIN Portal)
1. **Đăng xuất & Đăng nhập Admin:**
   - Bấm nút đăng xuất ở góc trên bên phải.
   - Tại `/login`, bấm nút **"🛡️ Quản trị viên"** và bấm Đăng nhập.
2. **Khu vực Quản trị (`/admin`):**
   - Xuất hiện menu **"Quản trị"** màu tím dành riêng cho ADMIN.
   - Vào `/admin/questions` để xem toàn bộ danh sách 35 câu hỏi.
   - Trình bày chức năng tìm kiếm câu hỏi và lọc theo chuyên đề.
   - Bấm **"Thêm câu hỏi mới"** (`/admin/questions/new`): gõ công thức LaTeX vào ô nội dung, chỉ vào khung **"Xem trước hiển thị"** (Live Preview) bên dưới để thấy KaTeX hiển thị ngay lập tức.
   - (Tùy chọn) Thử dùng tài khoản học sinh truy cập trực tiếp URL `/admin` để chứng minh cơ chế bảo mật chặn 403 Forbidden.

---

## 3. Kết luận buổi Demo
- Hệ thống chạy mượt mà 100%, đúng tiến độ, không có lỗi runtime.
- Đầy đủ 16/16 tiêu chí kiểm thử bắt buộc theo bản đặc tả SPEC P0.
- Sẵn sàng bàn giao mã nguồn và tài liệu cho Thầy nghiệm thu.
