"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAdminSession, clearAdminSession } from "@/lib/auth";

export async function loginAction(rawEmail: string, pass: string) {
  try {
    const email = rawEmail.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Jika belum ada user satupun di DB, daftarkan otomatis sebagai Admin
      const count = await prisma.user.count();
      if (count === 0) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: "Admin Falya",
          },
        });
        await setAdminSession(newUser.id);
        return { success: true };
      }
      return { success: false, error: "Email tidak terdaftar sebagai Admin." };
    }

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      return { success: false, error: "Password salah. Silakan coba lagi." };
    }

    await setAdminSession(user.id);
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function logoutAction() {
  await clearAdminSession();
  return { success: true };
}
