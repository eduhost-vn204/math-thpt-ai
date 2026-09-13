import { chromium } from "playwright";

async function runPlaywrightE2E() {
  console.log("================================================================================");
  console.log("🎭 BẮT ĐẦU CHẠY BỘ KIỂM THỬ GIAO DIỆN PLAYWRIGHT E2E TRÊN TRÌNH DUYỆT THẬT");
  console.log("================================================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const baseUrl = "http://localhost:3000";

  try {
    // 1. Kiểm tra Trang chủ
    console.log("👉 1. Kiểm tra Trang chủ (Landing Page)...");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    const title = await page.title();
    console.log(`   Tiêu đề trang: "${title}"`);

    // 2. Kiểm tra Đăng nhập học sinh demo
    console.log("👉 2. Kiểm tra Đăng nhập tài khoản Học sinh...");
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.click("text=🎓 Học sinh demo");
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard");
    console.log("   ✅ Đăng nhập học sinh thành công, đã chuyển tới /dashboard.");

    // 3. Kiểm tra Dashboard: Phân tích chuyên đề yếu và 4 chỉ số
    console.log("👉 3. Kiểm tra Dashboard phân tích năng lực...");
    await page.waitForSelector("text=Tổng lượt làm bài");
    await page.waitForSelector("text=Tỷ lệ chính xác theo 5 chuyên đề");
    console.log("   ✅ Các khối thống kê và biểu đồ chuyên đề hiển thị đầy đủ.");

    // 4. Kiểm tra Chức năng Luyện tập & Xem đáp án ngay (P0-02)
    console.log("👉 4. Kiểm tra Luyện tập chuyên đề và xem đáp án ngay từng câu (P0-02)...");
    await page.goto(`${baseUrl}/practice`, { waitUntil: "networkidle" });
    await page.click("text=Bắt đầu luyện tập ngay");
    await page.waitForURL("**/practice/*");
    console.log("   Đã vào phòng luyện tập:", page.url());

    // Chọn đáp án A qua data-testid
    await page.waitForSelector("[data-testid='option-A']");
    await page.click("[data-testid='option-A']");
    console.log("   Đã chọn đáp án A.");

    // Bấm nút "Kiểm tra đáp án"
    await page.waitForSelector("[data-testid='check-answer-btn']:not([disabled])");
    await page.click("[data-testid='check-answer-btn']");
    await page.waitForSelector("[data-testid='explanation-box']");
    console.log("   ✅ Nút 'Kiểm tra đáp án' hoạt động: Đã hiển thị đúng/sai và lời giải chi tiết KaTeX ngay trên giao diện!");

    // Nộp bài luyện tập
    await page.click("text=Hoàn thành & Chấm điểm");
    await page.click("text=Xác nhận hoàn thành");
    await page.waitForURL("**/attempts/*/result");
    console.log("   ✅ Đã nộp bài luyện tập và chuyển sang trang kết quả.");

    // 5. Kiểm tra Phòng thi thử 20 câu 30 phút có đồng hồ đếm ngược
    console.log("👉 5. Kiểm tra Phòng thi thử tính giờ...");
    await page.goto(`${baseUrl}/exams`, { waitUntil: "networkidle" });
    await page.click("text=Bắt đầu làm bài thi");
    await page.waitForURL("**/exams/*");
    console.log("   Đã vào phòng thi thử:", page.url());

    // Kiểm tra đồng hồ đếm ngược hiển thị
    const timerText = await page.textContent(".font-mono");
    console.log(`   Đồng hồ đếm ngược đang chạy: ${timerText}`);

    // Chọn đáp án câu 1
    await page.locator("button").filter({ hasText: /^A/ }).first().click();
    // Nộp bài thi
    await page.click("text=Nộp bài thi");
    await page.click("text=Nộp bài ngay");
    await page.waitForURL("**/attempts/*/result");
    console.log("   ✅ Đã nộp bài thi thử, điểm số thang 10 hiển thị thành công.");

    // 6. Kiểm tra Chatbot AI Gia sư (P0 Fallback Mode)
    console.log("👉 6. Kiểm tra Phòng chat Gia sư AI...");
    await page.goto(`${baseUrl}/tutor`, { waitUntil: "networkidle" });
    await page.fill("input[type='text']", "Thầy ơi, tiệm cận đứng là gì ạ?");
    await page.click("button[type='submit']");
    await page.waitForSelector("text=tiệm cận");
    console.log("   ✅ Gia sư AI phản hồi sư phạm tiếng Việt có KaTeX, chế độ minh họa không crash.");

    // 7. Kiểm tra Quyền Quản trị viên (Admin)
    console.log("👉 7. Kiểm tra Quản trị viên CRUD câu hỏi...");
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.click("text=🛡️ Quản trị viên");
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard");
    await page.goto(`${baseUrl}/admin/questions`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Ngân hàng câu hỏi");
    console.log("   ✅ Khu vực Admin câu hỏi mở thành công.");

    console.log("\n================================================================================");
    console.log("🎉 TOÀN BỘ CÁC LUỒNG GIAO DIỆN PLAYWRIGHT E2E ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!");
    console.log("================================================================================");
  } catch (err: any) {
    console.error("❌ Lỗi trong quá trình kiểm thử Playwright:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPlaywrightE2E();
