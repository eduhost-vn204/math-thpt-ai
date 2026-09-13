import katex from "katex";

console.log("=== KIỂM THỬ RENDER KATEX TOÁN HỌC THPT ===");

const testCases = [
  { name: "\\int (Tích phân)", latex: String.raw`\int_0^1 x e^x dx = 1` },
  { name: "\\frac (Phân số)", latex: String.raw`y = \frac{2x - 1}{x + 1}` },
  { name: "\\sum (Tổng sigma)", latex: String.raw`S_n = \sum_{k=1}^n k^2 = \frac{n(n+1)(2n+1)}{6}` },
  { name: "\\sqrt (Căn thức)", latex: String.raw`\sqrt{x^2 - 4x + 5}` },
  { name: "\\lim (Giới hạn)", latex: String.raw`\lim_{x \to 2} \frac{x^2 - 4}{x - 2} = 4` },
  { name: "\\left và \\right (Ngoặc co giãn)", latex: String.raw`\left( \frac{a+b}{2} \right)^2 \ge ab` },
  { name: "\\implies (Suy ra)", latex: String.raw`x > 2 \implies x^2 > 4` },
];

let allPassed = true;

for (const tc of testCases) {
  try {
    const rendered = katex.renderToString(tc.latex, {
      displayMode: true,
      throwOnError: true,
    });
    if (rendered.includes("katex-html") && rendered.includes("class=\"katex\"")) {
      console.log(`[PASS] ${tc.name}: render thành công, độ dài HTML: ${rendered.length}`);
    } else {
      console.error(`[FAIL] ${tc.name}: không tìm thấy cấu trúc katex hợp lệ`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] ${tc.name}: Lỗi render - ${err.message}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("\n>>> TOÀN BỘ 7/7 LỆNH TOÁN HỌC KATEX ĐẠT 100% <<<\n");
} else {
  console.error("\n>>> CÓ LỆNH THẤT BẠI <<<\n");
  process.exit(1);
}
