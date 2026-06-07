"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Impor ikon dari Phosphor
import {
  Envelope,
  LockKey,
  Eye,
  EyeSlash,
  SignIn,
  CircleNotch,
} from "@phosphor-icons/react";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi tidak boleh kosong"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitForm = async (data: LoginFormValues) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
        } else if (profile?.role === "user") {
          router.push("/home");
        } else {
          router.push("/verification");
        }
      }
    } catch (error: any) {
      alert("Gagal masuk: Pastikan email dan kata sandi Anda benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 w-24 h-24 mx-auto"></div>
          <Link href="/landing">
            <Image
              src="/logo.png"
              alt="Mai-Milu Logo"
              width={88}
              height={88}
              className="rounded-full shadow-md relative z-10 border-4 border-white cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <h1 className="text-3xl font-black text-center text-blue-600 mb-2 tracking-tight">
          Mai-Milu
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
          Bali Carpool Community. <br />
          Mari kurangi kemacetan dengan berbagi tumpangan!
          <br />
          Login untuk masuk ke menu utama.
        </p>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Envelope
                weight="duotone"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type="email"
                {...register("email")}
                className={`w-full border py-3 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50/50"}`}
                placeholder="anda@gmail.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-bold text-gray-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <LockKey
                weight="duotone"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border py-3 pl-11 pr-12 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50/50"}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeSlash weight="duotone" className="w-5 h-5" />
                ) : (
                  <Eye weight="duotone" className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-blue-700 transition-all disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2 text-[15px]"
          >
            {loading ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              <SignIn weight="bold" className="w-5 h-5" />
            )}
            {loading ? "Memeriksa..." : "Masuk ke Aplikasi"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-black hover:underline"
          >
            Daftar di sini
          </Link>
        </p>

        <div className="mt-10 text-center text-[11px] text-gray-400 font-medium tracking-wide uppercase">
          <p>Developed by Gede Suta Pinatih</p>
          <p className="mt-0.5">Mai-Milu Web App v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
