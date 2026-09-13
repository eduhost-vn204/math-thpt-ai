import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu mẫu Idempotent cho Hệ thống Web Ôn thi Toán AI...");

  // 1. Tạo tài khoản Quản trị viên (Admin) và 9 Học sinh mẫu đa dạng năng lực (>= 8 học sinh theo P0-02)
  const defaultPassword = "Student@123";
  const studentPasswordHash = await bcrypt.hash(defaultPassword, 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@mathai.local" },
    update: { name: "Quản trị viên XPS", role: "ADMIN" },
    create: {
      name: "Quản trị viên XPS",
      email: "admin@mathai.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Danh sách 9 học sinh mẫu (bao gồm các nhóm: chưa làm bài, điểm yếu, điểm TB, điểm khá/giỏi)
  const studentsConfig = [
    { email: "student@mathai.local", name: "Nguyễn Văn An", tier: "GOOD" }, // 8.0đ
    { email: "hoang.nam@mathai.local", name: "Trần Hoàng Nam", tier: "EXCELLENT" }, // 9.0đ
    { email: "minh.anh@mathai.local", name: "Lê Thị Minh Anh", tier: "EXCELLENT" }, // 9.5đ
    { email: "duc.huy@mathai.local", name: "Phạm Đức Huy", tier: "AVERAGE" }, // 6.5đ
    { email: "thu.trang@mathai.local", name: "Hoàng Thu Trang", tier: "AVERAGE" }, // 5.5đ
    { email: "quoc.bao@mathai.local", name: "Vũ Quốc Bảo", tier: "WEAK" }, // 4.0đ
    { email: "khanh.linh@mathai.local", name: "Đỗ Khánh Linh", tier: "WEAK" }, // 3.5đ
    { email: "mai.anh@mathai.local", name: "Ngô Mai Anh", tier: "NONE" }, // Chưa làm bài
    { email: "gia.huy@mathai.local", name: "Bùi Gia Huy", tier: "NONE" }, // Chưa làm bài
  ];

  const students: Record<string, any> = {};
  for (const sc of studentsConfig) {
    const s = await prisma.user.upsert({
      where: { email: sc.email },
      update: { name: sc.name, role: "STUDENT" },
      create: {
        name: sc.name,
        email: sc.email,
        passwordHash: studentPasswordHash,
        role: "STUDENT",
      },
    });
    students[sc.email] = { ...s, tier: sc.tier };
  }

  console.log(`✅ Đã upsert tài khoản Admin và ${studentsConfig.length} học sinh mẫu.`);

  // 2. Tạo 5 chuyên đề Toán THPT (Upsert theo name)
  const topicData = [
    {
      name: "Hàm số và ứng dụng đạo hàm",
      description: "Tính đơn điệu, cực trị, giá trị lớn nhất - nhỏ nhất, tiệm cận và đồ thị hàm số.",
    },
    {
      name: "Hàm số mũ, lũy thừa và logarit",
      description: "Công thức biến đổi lũy thừa, logarit, phương trình và bất phương trình mũ - logarit.",
    },
    {
      name: "Nguyên hàm, tích phân và ứng dụng",
      description: "Bảng nguyên hàm cơ bản, tích phân từng phần, đổi biến số và ứng dụng tính diện tích, thể tích.",
    },
    {
      name: "Hình học không gian và tọa độ Oxyz",
      description: "Thể tích khối lăng trụ, chóp; khoảng cách, góc; phương trình mặt phẳng, đường thẳng, mặt cầu.",
    },
    {
      name: "Đại số tổ hợp và xác suất",
      description: "Quy tắc đếm, hoán vị, chỉnh hợp, tổ hợp, nhị thức Newton và xác suất cổ điển.",
    },
  ];

  const topics: Record<string, any> = {};
  for (const t of topicData) {
    topics[t.name] = await prisma.topic.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: t,
    });
  }
  console.log(`✅ Đã upsert 5 chuyên đề Toán THPT chuẩn.`);

  // 3. Ngân hàng câu hỏi chuẩn (35 câu có LaTeX, 7 câu mỗi chuyên đề)
  const questionsData = [
    // --- CHUYÊN ĐỀ 1: Hàm số và ứng dụng đạo hàm ---
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Cho hàm số $y = x^3 - 3x + 2$. Điểm cực đại của hàm số đã cho là:",
      optionA: "$x = 1$",
      optionB: "$x = -1$",
      optionC: "$x = 2$",
      optionD: "$x = 0$",
      correctOption: "B",
      difficulty: "RECOGNITION",
      explanation: "Ta có $y' = 3x^2 - 3 = 3(x-1)(x+1)$.\n$y' = 0 \\iff x = \\pm 1$.\nBảng xét dấu $y'$ cho thấy $y'$ đổi dấu từ dương sang âm khi qua $x = -1$.\nDo đó điểm cực đại của hàm số là $x = -1$.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Đường tiệm cận ngang của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có phương trình là:",
      optionA: "$y = 2$",
      optionB: "$y = -1$",
      optionC: "$x = -1$",
      optionD: "$x = 2$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Ta có $\\lim_{x \\to \\pm\\infty} \\frac{2x - 1}{x + 1} = 2$. Do đó đường tiệm cận ngang của đồ thị hàm số là $y = 2$.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Giá trị nhỏ nhất của hàm số $y = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng:",
      optionA: "$2$",
      optionB: "$3$",
      optionC: "$11$",
      optionD: "$1$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Ta có $y' = 4x^3 - 4x = 4x(x^2 - 1)$.\nTrên $[0; 2]$, $y' = 0 \\iff x = 0$ hoặc $x = 1$.\nTính các giá trị:\n$y(0) = 3$\n$y(1) = 1 - 2 + 3 = 2$\n$y(2) = 16 - 8 + 3 = 11$.\nVậy $\\min_{[0; 2]} y = 2$ tại $x = 1$.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Hàm số $y = -x^3 + 3x^2 - 4$ đồng biến trên khoảng nào dưới đây?",
      optionA: "$(0; 2)$",
      optionB: "$(-\\infty; 0)$",
      optionC: "$(2; +\\infty)$",
      optionD: "$(-\\infty; 2)$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Đạo hàm $y' = -3x^2 + 6x = -3x(x - 2)$.\nTa có $y' > 0 \\iff 0 < x < 2$.\nDo đó hàm số đồng biến trên khoảng $(0; 2)$.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Tìm số giao điểm của đồ thị hàm số $y = x^3 - 3x^2 + 2$ với trục hoành.",
      optionA: "$1$",
      optionB: "$2$",
      optionC: "$3$",
      optionD: "$0$",
      correctOption: "C",
      difficulty: "UNDERSTANDING",
      explanation: "Phương trình hoành độ giao điểm: $x^3 - 3x^2 + 2 = 0 \\iff (x - 1)(x^2 - 2x - 2) = 0$.\nPhương trình có 3 nghiệm phân biệt: $x = 1$, $x = 1 \\pm \\sqrt{3}$. Vậy có 3 giao điểm.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Cho hàm số bậc ba $y = f(x)$ có bảng biến thiên với cực đại tại $x = -1, y_{CĐ} = 4$ và cực tiểu tại $x = 1, y_{CT} = 0$. Phương trình $|f(x)| = 2$ có bao nhiêu nghiệm thực phân biệt?",
      optionA: "$4$",
      optionB: "$6$",
      optionC: "$3$",
      optionD: "$5$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Phương trình $|f(x)| = 2 \\iff f(x) = 2$ hoặc $f(x) = -2$.\n- Đường thẳng $y = 2$ nằm giữa $y_{CT} = 0$ và $y_{CĐ} = 4$ nên cắt đồ thị tại 3 điểm phân biệt.\n- Đường thẳng $y = -2 < 0$ cắt 1 nhánh bên trái của đồ thị.\nTổng cộng có $3 + 1 = 4$ nghiệm thực phân biệt.",
    },
    {
      topicName: "Hàm số và ứng dụng đạo hàm",
      content: "Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y = \\frac{x + 2m}{x - 1}$ nghịch biến trên từng khoảng xác định.",
      optionA: "$m > -\\frac{1}{2}$",
      optionB: "$m < -\\frac{1}{2}$",
      optionC: "$m \\ge -\\frac{1}{2}$",
      optionD: "$m \\le -\\frac{1}{2}$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Tập xác định $D = \\mathbb{R} \\setminus \\{1\\}$.\nTa có $y' = \\frac{-1 - 2m}{(x - 1)^2}$.\nHàm số nghịch biến trên từng khoảng xác định khi và chỉ khi $y' < 0 \\iff -1 - 2m < 0 \\iff m > -\\frac{1}{2}$.",
    },

    // --- CHUYÊN ĐỀ 2: Hàm số mũ, lũy thừa và logarit ---
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Nghiệm của phương trình $\\log_3(2x - 1) = 2$ là:",
      optionA: "$x = 5$",
      optionB: "$x = \\frac{7}{2}$",
      optionC: "$x = 4$",
      optionD: "$x = 2$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Điều kiện: $2x - 1 > 0 \\iff x > \\frac{1}{2}$.\nPhương trình $\\iff 2x - 1 = 3^2 = 9 \\iff 2x = 10 \\iff x = 5$ (thỏa mãn điều kiện).",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Đạo hàm của hàm số $y = 2^{3x}$ là:",
      optionA: "$y' = 3 \\cdot 2^{3x} \\ln 2$",
      optionB: "$y' = 2^{3x} \\ln 2$",
      optionC: "$y' = 3 \\cdot 2^{3x}$",
      optionD: "$y' = \\frac{2^{3x}}{3 \\ln 2}$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Áp dụng công thức $(a^u)' = u' \\cdot a^u \\ln a$, ta có $(2^{3x})' = (3x)' \\cdot 2^{3x} \\ln 2 = 3 \\cdot 2^{3x} \\ln 2$.",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Tập nghiệm của bất phương trình $2^{x^2 - 3x} \\le 16$ là:",
      optionA: "$[-1; 4]$",
      optionB: "$(-\\infty; -1] \\cup [4; +\\infty)$",
      optionC: "$[0; 4]$",
      optionD: "$[-4; 1]$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Ta có $16 = 2^4$. Bất phương trình $\\iff 2^{x^2 - 3x} \\le 2^4 \\iff x^2 - 3x \\le 4 \\iff x^2 - 3x - 4 \\le 0 \\iff -1 \\le x \\le 4$.",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Rút gọn biểu thức $P = \\log_a(a^2 b) - 2\\log_a(\\sqrt{b})$ với $a, b > 0, a \\neq 1$.",
      optionA: "$P = 2$",
      optionB: "$P = a$",
      optionC: "$P = 2 + \\log_a b$",
      optionD: "$P = 1$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Ta có $P = \\log_a(a^2) + \\log_a(b) - 2 \\cdot \\frac{1}{2} \\log_a(b) = 2 + \\log_a(b) - \\log_a(b) = 2$.",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Tìm tập xác định của hàm số $y = \\log_2(x^2 - 4x + 3)$.",
      optionA: "$(-\\infty; 1) \\cup (3; +\\infty)$",
      optionB: "$(1; 3)$",
      optionC: "$[1; 3]$",
      optionD: "$(-\\infty; 1] \\cup [3; +\\infty)$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Hàm số xác định khi $x^2 - 4x + 3 > 0 \\iff (x - 1)(x - 3) > 0 \\iff x < 1$ hoặc $x > 3$.",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Có bao nhiêu giá trị nguyên của tham số $m$ để phương trình $4^x - m \\cdot 2^{x+1} + 2m = 0$ có hai nghiệm thực phân biệt?",
      optionA: "$m > 2$",
      optionB: "$m > 0$",
      optionC: "$0 < m < 2$",
      optionD: "$m \\ge 2$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Đặt $t = 2^x > 0$. Phương trình trở thành $t^2 - 2mt + 2m = 0$.\nĐể có 2 nghiệm $x$ phân biệt, phương trình theo $t$ phải có 2 nghiệm dương phân biệt:\n$\\Delta' = m^2 - 2m > 0 \\iff m < 0$ hoặc $m > 2$.\n$S = 2m > 0 \\iff m > 0$.\n$P = 2m > 0 \\iff m > 0$.\nKết hợp lại ta được $m > 2$.",
    },
    {
      topicName: "Hàm số mũ, lũy thừa và logarit",
      content: "Biết $\\log_2 3 = a$ và $\\log_2 5 = b$. Biểu diễn $\\log_{12} 45$ theo $a$ và $b$.",
      optionA: "$\\frac{2a + b}{2 + a}$",
      optionB: "$\\frac{a + 2b}{2 + a}$",
      optionC: "$\\frac{2a + b}{1 + 2a}$",
      optionD: "$\\frac{a + b}{2 + a}$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Ta đổi cơ số sang cơ số 2:\n$\\log_{12} 45 = \\frac{\\log_2 45}{\\log_2 12} = \\frac{\\log_2(3^2 \\cdot 5)}{\\log_2(2^2 \\cdot 3)} = \\frac{2\\log_2 3 + \\log_2 5}{2 + \\log_2 3} = \\frac{2a + b}{2 + a}$.",
    },

    // --- CHUYÊN ĐỀ 3: Nguyên hàm, tích phân và ứng dụng ---
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Tìm nguyên hàm $\\int (3x^2 + e^x) dx$.",
      optionA: "$x^3 + e^x + C$",
      optionB: "$6x + e^x + C$",
      optionC: "$x^3 - e^x + C$",
      optionD: "$\\frac{x^3}{3} + e^x + C$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Ta có $\\int 3x^2 dx = x^3$ và $\\int e^x dx = e^x$. Do đó $\\int (3x^2 + e^x) dx = x^3 + e^x + C$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Biết $\\int_0^2 f(x) dx = 3$ và $\\int_0^2 g(x) dx = -1$. Tính $I = \\int_0^2 [2f(x) - 3g(x)] dx$.",
      optionA: "$I = 9$",
      optionB: "$I = 3$",
      optionC: "$I = 5$",
      optionD: "$I = 7$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Theo tính chất tuyến tính của tích phân:\n$I = 2\\int_0^2 f(x) dx - 3\\int_0^2 g(x) dx = 2(3) - 3(-1) = 6 + 3 = 9$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Tính tích phân từng phần: $I = \\int_0^1 x e^x dx$.",
      optionA: "$1$",
      optionB: "$e - 1$",
      optionC: "$e$",
      optionD: "$2$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Đặt $u = x \\implies du = dx$; $dv = e^x dx \\implies v = e^x$.\nTheo công thức từng phần: $I = \\left. x e^x \\right|_0^1 - \\int_0^1 e^x dx = (1 \\cdot e - 0) - (e - 1) = 1$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Diện tích hình phẳng giới hạn bởi đồ thị hàm số $y = x^2 - 4x + 3$ và trục hoành $Ox$ bằng:",
      optionA: "$\\frac{4}{3}$",
      optionB: "$\\frac{2}{3}$",
      optionC: "$2$",
      optionD: "$\\frac{1}{3}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Phương trình hoành độ giao điểm: $x^2 - 4x + 3 = 0 \\iff x = 1$ hoặc $x = 3$.\nDiện tích $S = \\int_1^3 |x^2 - 4x + 3| dx = -\\int_1^3 (x^2 - 4x + 3) dx = -\\left[ \\frac{x^3}{3} - 2x^2 + 3x \\right]_1^3 = \\frac{4}{3}$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Tính tích phân $I = \\int_1^e \\frac{\\ln x}{x} dx$.",
      optionA: "$\\frac{1}{2}$",
      optionB: "$1$",
      optionC: "$2$",
      optionD: "$\\frac{e}{2}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Đặt $t = \\ln x \\implies dt = \\frac{1}{x} dx$.\nĐổi cận: $x = 1 \\implies t = 0$; $x = e \\implies t = 1$.\n$I = \\int_0^1 t dt = \\left. \\frac{t^2}{2} \\right|_0^1 = \\frac{1}{2}$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Thể tích khối tròn xoay tạo thành khi quay hình phẳng giới hạn bởi đồ thị hàm số $y = \\sqrt{x}$, trục hoành và hai đường thẳng $x = 1, x = 4$ quanh trục $Ox$ bằng:",
      optionA: "$\\frac{15\\pi}{2}$",
      optionB: "$\\frac{15}{2}$",
      optionC: "$15\\pi$",
      optionD: "$\\frac{7\\pi}{2}$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Thể tích $V = \\pi \\int_1^4 (\\sqrt{x})^2 dx = \\pi \\int_1^4 x dx = \\pi \\left. \\frac{x^2}{2} \\right|_1^4 = \\pi \\left( \\frac{16 - 1}{2} \\right) = \\frac{15\\pi}{2}$.",
    },
    {
      topicName: "Nguyên hàm, tích phân và ứng dụng",
      content: "Cho hàm số $f(x)$ liên tục trên $\\mathbb{R}$ thỏa mãn $\\int_0^3 f(x) dx = 6$. Tính tích phân $I = \\int_0^1 f(3x) dx$.",
      optionA: "$2$",
      optionB: "$18$",
      optionC: "$3$",
      optionD: "$6$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Đặt $t = 3x \\implies dt = 3 dx \\implies dx = \\frac{1}{3} dt$.\nĐổi cận: $x = 0 \\implies t = 0$; $x = 1 \\implies t = 3$.\nDo đó $I = \\frac{1}{3} \\int_0^3 f(t) dt = \\frac{1}{3} \\cdot 6 = 2$.",
    },

    // --- CHUYÊN ĐỀ 4: Hình học không gian và tọa độ Oxyz ---
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 3z - 5 = 0$. Vectơ pháp tuyến của $(P)$ là:",
      optionA: "$\\vec{n} = (2; -1; 3)$",
      optionB: "$\\vec{n} = (2; 1; 3)$",
      optionC: "$\\vec{n} = (-2; 1; 3)$",
      optionD: "$\\vec{n} = (2; -1; -5)$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Mặt phẳng có phương trình $Ax + By + Cz + D = 0$ có một vectơ pháp tuyến là $\\vec{n} = (A; B; C) = (2; -1; 3)$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Trong không gian $Oxyz$, tâm và bán kính của mặt cầu $(S): (x-1)^2 + (y+2)^2 + (z-3)^2 = 16$ là:",
      optionA: "$I(1; -2; 3), R = 4$",
      optionB: "$I(-1; 2; -3), R = 4$",
      optionC: "$I(1; -2; 3), R = 16$",
      optionD: "$I(-1; 2; -3), R = 16$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Phương trình $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$ có tâm $I(a; b; c) = (1; -2; 3)$ và bán kính $R = \\sqrt{16} = 4$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$, $SA \\perp (ABC)$. Biết $SA = a\\sqrt{3}, AB = a, BC = a\\sqrt{2}$. Thể tích khối chóp $S.ABC$ là:",
      optionA: "$\\frac{a^3 \\sqrt{6}}{6}$",
      optionB: "$\\frac{a^3 \\sqrt{6}}{3}$",
      optionC: "$\\frac{a^3 \\sqrt{6}}{2}$",
      optionD: "$a^3 \\sqrt{6}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Diện tích đáy $S_{ABC} = \\frac{1}{2} AB \\cdot BC = \\frac{1}{2} a \\cdot a\\sqrt{2} = \\frac{a^2 \\sqrt{2}}{2}$.\nThể tích $V = \\frac{1}{3} S_{ABC} \\cdot SA = \\frac{1}{3} \\cdot \\frac{a^2 \\sqrt{2}}{2} \\cdot a\\sqrt{3} = \\frac{a^3 \\sqrt{6}}{6}$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Trong không gian $Oxyz$, khoảng cách từ điểm $M(1; 2; -1)$ đến mặt phẳng $(P): 2x - 2y + z + 5 = 0$ bằng:",
      optionA: "$\\frac{2}{3}$",
      optionB: "$\\frac{4}{3}$",
      optionC: "$2$",
      optionD: "$\\frac{1}{3}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Khoảng cách $d(M, (P)) = \\frac{|2(1) - 2(2) + 1(-1) + 5|}{\\sqrt{2^2 + (-2)^2 + 1^2}} = \\frac{|2 - 4 - 1 + 5|}{\\sqrt{9}} = \\frac{2}{3}$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Trong không gian $Oxyz$, phương trình đường thẳng đi qua điểm $A(1; -2; 3)$ và vuông góc với mặt phẳng $(P): x + 2y - z + 4 = 0$ là:",
      optionA: "$\\frac{x - 1}{1} = \\frac{y + 2}{2} = \\frac{z - 3}{-1}$",
      optionB: "$\\frac{x + 1}{1} = \\frac{y - 2}{2} = \\frac{z + 3}{-1}$",
      optionC: "$\\frac{x - 1}{1} = \\frac{y + 2}{-2} = \\frac{z - 3}{1}$",
      optionD: "$\\frac{x - 1}{1} = \\frac{y + 2}{2} = \\frac{z - 3}{1}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Đường thẳng vuông góc với $(P)$ nên nhận vectơ pháp tuyến của $(P)$ là $\\vec{u} = \\vec{n}_P = (1; 2; -1)$ làm vectơ chỉ phương.\nĐường thẳng đi qua $A(1; -2; 3)$ có phương trình chính tắc là $\\frac{x - 1}{1} = \\frac{y + 2}{2} = \\frac{z - 3}{-1}$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Trong không gian $Oxyz$, cho hai điểm $A(1; 0; -2)$ và $B(3; 2; 0)$. Mặt phẳng trung trực của đoạn thẳng $AB$ có phương trình là:",
      optionA: "$x + y + z - 2 = 0$",
      optionB: "$x + y + z + 2 = 0$",
      optionC: "$2x + 2y + 2z - 1 = 0$",
      optionD: "$x - y + z = 0$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Trung điểm của $AB$ là $I\\left(\\frac{1+3}{2}; \\frac{0+2}{2}; \\frac{-2+0}{2}\\right) = I(2; 1; -1)$.\n$\\vec{AB} = (2; 2; 2) = 2(1; 1; 1)$. Chọn VTPT $\\vec{n} = (1; 1; 1)$.\nPhương trình mặt phẳng: $1(x - 2) + 1(y - 1) + 1(z + 1) = 0 \\iff x + y + z - 2 = 0$.",
    },
    {
      topicName: "Hình học không gian và tọa độ Oxyz",
      content: "Cho khối nón có bán kính đáy $r = 3$ và chiều cao $h = 4$. Diện tích xung quanh của khối nón đã cho bằng:",
      optionA: "$15\\pi$",
      optionB: "$12\\pi$",
      optionC: "$24\\pi$",
      optionD: "$20\\pi$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Độ dài đường sinh của nón $l = \\sqrt{r^2 + h^2} = \\sqrt{3^2 + 4^2} = 5$.\nDiện tích xung quanh $S_{xq} = \\pi r l = \\pi \\cdot 3 \\cdot 5 = 15\\pi$.",
    },

    // --- CHUYÊN ĐỀ 5: Đại số tổ hợp và xác suất ---
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Có bao nhiêu cách chọn 3 học sinh từ một nhóm gồm 10 học sinh?",
      optionA: "$C_{10}^3 = 120$",
      optionB: "$A_{10}^3 = 720$",
      optionC: "$30$",
      optionD: "$10^3 = 1000$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Số cách chọn 3 người từ 10 người (không phân biệt thứ tự/nhiệm vụ) là tổ hợp chập 3 của 10 phần tử: $C_{10}^3 = \\frac{10!}{3! \\cdot 7!} = 120$.",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Gieo một con súc sắc cân đối và đồng chất một lần. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng:",
      optionA: "$\\frac{1}{2}$",
      optionB: "$\\frac{1}{3}$",
      optionC: "$\\frac{1}{6}$",
      optionD: "$\\frac{2}{3}$",
      correctOption: "A",
      difficulty: "RECOGNITION",
      explanation: "Không gian mẫu $n(\\Omega) = 6$. Các mặt có số chấm chẵn là $\\{2, 4, 6\\} \\implies n(A) = 3$.\nXác suất $P(A) = \\frac{3}{6} = \\frac{1}{2}$.",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Số hạng chứa $x^3$ trong khai triển nhị thức Newton $(x + 2)^5$ là:",
      optionA: "$40x^3$",
      optionB: "$10x^3$",
      optionC: "$80x^3$",
      optionD: "$20x^3$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Số hạng tổng quát trong khai triển $(x + 2)^5$ là $T_{k+1} = C_5^k x^{5-k} 2^k$.\nĐể số hạng chứa $x^3 \\implies 5 - k = 3 \\implies k = 2$.\nSố hạng đó là $C_5^2 x^3 2^2 = 10 \\cdot 4 \\cdot x^3 = 40x^3$.",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Từ các chữ số $\\{1, 2, 3, 4, 5\\}$ có thể lập được bao nhiêu số tự nhiên có 3 chữ số đôi một khác nhau?",
      optionA: "$60$",
      optionB: "$125$",
      optionC: "$10$",
      optionD: "$20$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Số các số thỏa mãn là số chỉnh hợp chập 3 của 5 chữ số: $A_5^3 = 5 \\cdot 4 \\cdot 3 = 60$ số.",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Một hộp chứa 5 viên bi đỏ và 4 viên bi xanh. Lấy ngẫu nhiên đồng thời 2 viên bi. Xác suất để lấy được 2 viên bi cùng màu là:",
      optionA: "$\\frac{4}{9}$",
      optionB: "$\\frac{5}{9}$",
      optionC: "$\\frac{1}{2}$",
      optionD: "$\\frac{2}{9}$",
      correctOption: "A",
      difficulty: "UNDERSTANDING",
      explanation: "Không gian mẫu: $n(\\Omega) = C_9^2 = 36$.\nBiến cố $A$: 'Lấy được 2 viên bi cùng màu' gồm:\n- 2 viên đỏ: $C_5^2 = 10$\n- 2 viên xanh: $C_4^2 = 6$\n$\\implies n(A) = 10 + 6 = 16$.\nXác suất $P(A) = \\frac{16}{36} = \\frac{4}{9}$.",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Một lớp học có 20 học sinh nam và 15 học sinh nữ. Chọn ngẫu nhiên 4 học sinh đi dự đại hội. Tính xác suất để trong 4 học sinh được chọn có ít nhất 1 học sinh nữ.",
      optionA: "$\\frac{1037}{1053}$",
      optionB: "$\\frac{16}{1053}$",
      optionC: "$\\frac{969}{1053}$",
      optionD: "$\\frac{84}{1053}$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Không gian mẫu: $n(\\Omega) = C_{35}^4 = 52360$.\nXét biến cố đối $\\bar{A}$: 'Cả 4 học sinh được chọn đều là nam'.\n$n(\\bar{A}) = C_{20}^4 = 4845$.\nXác suất $P(\\bar{A}) = \\frac{4845}{52360} = \\frac{969}{10472}$.\n$\\implies P(A) = 1 - P(\\bar{A}) = \\frac{1037}{1053}$ (hoặc xấp xỉ 90.7%).",
    },
    {
      topicName: "Đại số tổ hợp và xác suất",
      content: "Cho hai biến cố độc lập $A$ và $B$ có $P(A) = 0.6$ và $P(B) = 0.7$. Xác suất để có đúng một trong hai biến cố xảy ra là:",
      optionA: "$0.46$",
      optionB: "$0.42$",
      optionC: "$0.88$",
      optionD: "$0.54$",
      correctOption: "A",
      difficulty: "APPLICATION",
      explanation: "Vì $A$ và $B$ độc lập nên:\n$P(A \\bar{B}) = P(A) \\cdot P(\\bar{B}) = 0.6 \\cdot (1 - 0.7) = 0.18$.\n$P(\\bar{A} B) = P(\\bar{A}) \\cdot P(B) = (1 - 0.6) \\cdot 0.7 = 0.28$.\nXác suất có đúng một biến cố xảy ra là $P = 0.18 + 0.28 = 0.46$.",
    },
  ];

  const createdQuestions: any[] = [];
  for (const q of questionsData) {
    const topic = topics[q.topicName];
    // Tìm câu hỏi đã tồn tại theo content
    let existingQ = await prisma.question.findFirst({
      where: { content: q.content },
    });

    if (!existingQ) {
      existingQ = await prisma.question.create({
        data: {
          content: q.content,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topicId: topic.id,
        },
      });
    }
    createdQuestions.push(existingQ);
  }
  console.log(`✅ Đã đồng bộ ${createdQuestions.length} câu hỏi Toán THPT chất lượng cao.`);

  // 4. Tạo Đề thi thử chuẩn (20 câu, thời lượng 30 phút)
  const examTitle = "Đề thi thử Tốt nghiệp THPT 2026 - Môn Toán (Mã đề 101)";
  let exam = await prisma.exam.findFirst({
    where: { title: examTitle },
  });

  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title: examTitle,
        description: "Đề thi mô phỏng chuẩn cấu trúc kỳ thi THPT Quốc Gia với 20 câu hỏi trọng tâm bao phủ 5 chuyên đề Toán 12.",
        durationMinutes: 30,
        isPublished: true,
      },
    });

    // Gán 20 câu vào đề thi
    const examQuestionsToPick = createdQuestions.slice(0, 20);
    for (let i = 0; i < examQuestionsToPick.length; i++) {
      await prisma.examQuestion.upsert({
        where: {
          examId_questionId: {
            examId: exam.id,
            questionId: examQuestionsToPick[i].id,
          },
        },
        update: { position: i + 1 },
        create: {
          examId: exam.id,
          questionId: examQuestionsToPick[i].id,
          position: i + 1,
        },
      });
    }
  }
  console.log(`✅ Đã tạo đề thi thử: "${exam.title}".`);

  // 5. Tạo lịch sử Attempts cho các học sinh mẫu (Idempotent: chỉ tạo nếu chưa có)
  const examQuestionsList = createdQuestions.slice(0, 20);

  // Helper hàm tạo attempt hoàn thành
  async function createSampleAttempt(
    user: any,
    mode: "PRACTICE" | "EXAM",
    totalQ: number,
    correctQ: number,
    score: number,
    hoursAgo: number,
    questionsPool: any[]
  ) {
    const existing = await prisma.attempt.findFirst({
      where: {
        userId: user.id,
        score: score,
        mode: mode,
      },
    });
    if (existing) return existing;

    const startedAt = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const submittedAt = new Date(Date.now() - hoursAgo * 3600 * 1000 + 20 * 60 * 1000);

    const att = await prisma.attempt.create({
      data: {
        userId: user.id,
        examId: mode === "EXAM" ? exam?.id : null,
        mode,
        startedAt,
        submittedAt,
        durationSeconds: 1200,
        totalQuestions: totalQ,
        correctCount: correctQ,
        score,
        status: "SUBMITTED",
      },
    });

    for (let i = 0; i < totalQ; i++) {
      const q = questionsPool[i % questionsPool.length];
      const isCorrect = i < correctQ;
      await prisma.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: att.id,
            questionId: q.id,
          },
        },
        update: {},
        create: {
          attemptId: att.id,
          questionId: q.id,
          selectedOption: isCorrect ? q.correctOption : (q.correctOption === "A" ? "B" : "A"),
          isCorrect,
        },
      });
    }
    return att;
  }

  // Tạo dữ liệu attempt cho từng nhóm học sinh:
  // 1. Nguyễn Văn An (Khá - 8.0đ)
  await createSampleAttempt(students["student@mathai.local"], "EXAM", 20, 16, 8.0, 2, examQuestionsList);
  await createSampleAttempt(students["student@mathai.local"], "PRACTICE", 5, 4, 8.0, 4, createdQuestions.slice(0, 5));

  // 2. Trần Hoàng Nam (Giỏi - 9.0đ)
  await createSampleAttempt(students["hoang.nam@mathai.local"], "EXAM", 20, 18, 9.0, 5, examQuestionsList);
  await createSampleAttempt(students["hoang.nam@mathai.local"], "PRACTICE", 10, 9, 9.0, 6, createdQuestions.slice(5, 15));

  // 3. Lê Thị Minh Anh (Xuất sắc - 9.5đ)
  await createSampleAttempt(students["minh.anh@mathai.local"], "EXAM", 20, 19, 9.5, 8, examQuestionsList);
  await createSampleAttempt(students["minh.anh@mathai.local"], "PRACTICE", 10, 10, 10.0, 9, createdQuestions.slice(15, 25));

  // 4. Phạm Đức Huy (Trung bình - 6.5đ)
  await createSampleAttempt(students["duc.huy@mathai.local"], "EXAM", 20, 13, 6.5, 12, examQuestionsList);
  await createSampleAttempt(students["duc.huy@mathai.local"], "PRACTICE", 10, 6, 6.0, 14, createdQuestions.slice(0, 10));

  // 5. Hoàng Thu Trang (Trung bình - 5.5đ)
  await createSampleAttempt(students["thu.trang@mathai.local"], "EXAM", 20, 11, 5.5, 18, examQuestionsList);

  // 6. Vũ Quốc Bảo (Yếu - 4.0đ)
  await createSampleAttempt(students["quoc.bao@mathai.local"], "EXAM", 20, 8, 4.0, 24, examQuestionsList);
  await createSampleAttempt(students["quoc.bao@mathai.local"], "PRACTICE", 5, 2, 4.0, 26, createdQuestions.slice(0, 5));

  // 7. Đỗ Khánh Linh (Yếu - 3.5đ)
  await createSampleAttempt(students["khanh.linh@mathai.local"], "EXAM", 20, 7, 3.5, 30, examQuestionsList);

  // 8 & 9. Ngô Mai Anh và Bùi Gia Huy: Giữ 0 attempts để thể hiện nhóm "Chưa làm bài"

  console.log("✅ Đã tạo dữ liệu lịch sử bài làm đa tầng cho 7 học sinh (2 học sinh giữ 0 bài).");

  // 6. Tạo tin nhắn chat mẫu cho AI Tutor
  const sampleStudent = students["student@mathai.local"];
  const existingChat = await prisma.chatMessage.findFirst({
    where: { userId: sampleStudent.id },
  });

  if (!existingChat) {
    await prisma.chatMessage.create({
      data: {
        userId: sampleStudent.id,
        role: "USER",
        content: "Thầy ơi, cho em hỏi câu về tiệm cận đứng và tiệm cận ngang thì cách nhận biết nhanh nhất là gì ạ?",
        questionId: createdQuestions[1].id,
      },
    });

    await prisma.chatMessage.create({
      data: {
        userId: sampleStudent.id,
        role: "ASSISTANT",
        content: "Chào em! Với hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax + b}{cx + d}$ ($c \\neq 0$, $ad - bc \\neq 0$):\n- **Tiệm cận đứng**: Nghiệm của mẫu số $cx + d = 0 \\implies x = -\\frac{d}{c}$.\n- **Tiệm cận ngang**: Tỉ số giữa hệ số cao nhất của tử và mẫu khi $x \\to \\pm\\infty$, tức là $y = \\frac{a}{c}$.\nEm hãy áp dụng ngay vào bài toán để kiểm tra nhé!",
        questionId: createdQuestions[1].id,
      },
    });
  }

  console.log("🎉 Hoàn tất seed dữ liệu Idempotent thành công 100%!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
