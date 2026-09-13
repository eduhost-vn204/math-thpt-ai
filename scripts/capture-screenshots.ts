import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function main() {
  const screenshotDir = path.join(process.cwd(), "docs", "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log("📸 Bắt đầu chụp ảnh toàn bộ các màn hình chức năng của hệ thống...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const baseUrl = "http://localhost:3000";

  // 1. Trang chủ
  console.log("-> 01_trang_chu.png");
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "01_trang_chu.png"), fullPage: true });

  // 2. Trang Đăng nhập
  console.log("-> 02_dang_nhap.png");
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "02_dang_nhap.png") });

  // 3. Trang Đăng ký
  console.log("-> 03_dang_ky.png");
  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "03_dang_ky.png") });

  // Đăng nhập học sinh
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.click("text=🎓 Học sinh demo");
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(1000);

  // 4. Dashboard học sinh
  console.log("-> 04_dashboard.png");
  await page.screenshot({ path: path.join(screenshotDir, "04_dashboard.png"), fullPage: true });

  // 5. Luyện tập theo chuyên đề
  console.log("-> 05_luyen_tap_chuyen_de.png");
  await page.goto(`${baseUrl}/practice`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "05_luyen_tap_chuyen_de.png"), fullPage: true });

  // 6. Danh sách đề thi
  console.log("-> 06_danh_sach_de_thi.png");
  await page.goto(`${baseUrl}/exams`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "06_danh_sach_de_thi.png"), fullPage: true });

  // 7. Gia sư AI
  console.log("-> 07_gia_su_ai.png");
  await page.goto(`${baseUrl}/tutor`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "07_gia_su_ai.png") });

  // 8. Lịch sử làm bài
  console.log("-> 08_lich_su.png");
  await page.goto(`${baseUrl}/history`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "08_lich_su.png"), fullPage: true });

  // Đăng xuất và đăng nhập Admin
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.click("text=🛡️ Quản trị viên");
  await page.click("button[type='submit']");
  await page.waitForURL("**/dashboard");
  await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 9. Admin Dashboard
  console.log("-> 09_admin_dashboard.png");
  await page.screenshot({ path: path.join(screenshotDir, "09_admin_dashboard.png"), fullPage: true });

  // 10. Admin Ngân hàng câu hỏi
  console.log("-> 10_admin_ngan_hang_cau_hoi.png");
  await page.goto(`${baseUrl}/admin/questions`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "10_admin_ngan_hang_cau_hoi.png"), fullPage: true });

  // 11. Admin Soạn thảo câu hỏi mới
  console.log("-> 11_admin_them_cau_hoi.png");
  await page.goto(`${baseUrl}/admin/questions/new`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "11_admin_them_cau_hoi.png"), fullPage: true });

  // 12. Admin Quản lý học sinh
  console.log("-> 12_admin_quan_ly_hoc_sinh.png");
  await page.goto(`${baseUrl}/admin/students`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "12_admin_quan_ly_hoc_sinh.png"), fullPage: true });

  await browser.close();
  console.log("🎉 Đã chụp hoàn tất 12 ảnh màn hình chất lượng cao vào thư mục docs/screenshots/!");
}

main().catch((err) => {
  console.error("Lỗi khi chụp màn hình:", err);
  process.exit(1);
});
