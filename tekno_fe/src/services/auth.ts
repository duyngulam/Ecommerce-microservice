const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function signupApi(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Đăng ký thất bại!");
    }

    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Không thể kết nối server!");
  }
}

export async function loginApi(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Đăng nhập thất bại!");
  }

  return res.json();
}

// export async function getCurrentUserApi() {
//   const res = await fetch(`${API_BASE_URL}/auth/me`, {
//     method: "GET",
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error("Không thể lấy thông tin người dùng");
//   return await res.json();
// }
