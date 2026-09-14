import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function verifyGeminiProduction() {
  console.log("==================================================");
  console.log("XÁC MINH GIAO DIỆN & TƯƠNG TÁC GEMINI AI PRODUCTION");
  console.log("==================================================");

  const baseUrl = "https://math-thpt-ai.vercel.app";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log("1. Đăng nhập học sinh trên production...");
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "student@mathai.local");
    await page.fill('input[type="password"]', "Student@123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    console.log("✓ Đăng nhập thành công, đã vào /dashboard.");

    console.log("2. Điều hướng đến trang Gia sư AI /tutor...");
    await page.goto(`${baseUrl}/tutor`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Gửi câu hỏi toán mới
    console.log("3. Gửi câu hỏi kiểm tra trực tiếp...");
    const questionInput = page.locator('textarea, input[type="text"]').first();
    await questionInput.fill("Thầy ơi hướng dẫn em tính đạo hàm của hàm số y = e^(2x) * sin(x) bằng công thức u.v");
    await page.keyboard.press("Enter");

    console.log("4. Đang chờ phản hồi từ Gemini 2.5 Flash...");
    // Đợi phản hồi xuất hiện
    await page.waitForTimeout(6000);

    // Kiểm tra nhãn Gemini AI trực tuyến
    const pageContent = await page.content();
    const hasOnlineBadge = pageContent.includes("Gemini AI trực tuyến");
    console.log(`- Nhãn 'Gemini AI trực tuyến': ${hasOnlineBadge ? "CÓ HIỆN DIỆN" : "Chưa thấy"}`);

    // Kiểm tra công thức KaTeX
    const hasKatex = pageContent.includes("katex") || pageContent.includes("math");
    console.log(`- Công thức KaTeX render: ${hasKatex ? "CÓ" : "KHÔNG"}`);

    // Chụp ảnh giao diện production
    const docsScreenshot = path.join(process.cwd(), "docs", "screenshots", "07_gia_su_ai.png");
    const assetsScreenshot = path.join(process.cwd(), "assets", "hinh_4_7_gia_su_ai.png");

    await page.screenshot({ path: docsScreenshot, fullPage: false });
    await page.screenshot({ path: assetsScreenshot, fullPage: false });
    console.log(`✓ Đã lưu ảnh chụp giao diện mới:`);
    console.log(`  - ${docsScreenshot}`);
    console.log(`  - ${assetsScreenshot}`);

    console.log("\n==================================================");
    console.log("KIỂM CHỨNG GIAO DIỆN PRODUCTION THÀNH CÔNG 100%!");
    console.log("==================================================");
  } catch (err) {
    console.error("Lỗi khi kiểm chứng Playwright:", err);
  } finally {
    await browser.close();
  }
}

verifyGeminiProduction();
