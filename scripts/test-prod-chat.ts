async function testProd() {
  const BASE_URL = "https://math-thpt-ai.vercel.app";

  console.log("1. Đăng nhập học sinh test trên production...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student@mathai.local", password: "Student@123" }),
  });

  const cookie = loginRes.headers.get("set-cookie") || "";
  console.log(`- Login HTTP: ${loginRes.status}, Cookie: ${cookie ? "Đã nhận" : "Không"}`);

  console.log("\n2. Gửi câu hỏi đến /api/chat trên production...");
  const chatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ message: "Giải phương trình x^2 - 5x + 6 = 0 và trình bày bằng LaTeX." }),
  });

  console.log(`- Chat HTTP: ${chatRes.status}`);
  const data = await chatRes.json();
  console.log("- Data response:", JSON.stringify(data, null, 2));
}

testProd().catch(console.error);
