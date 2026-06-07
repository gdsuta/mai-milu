"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Impor ikon tambahan dari Phosphor
import {
  Envelope,
  LockKey,
  User as UserIcon,
  Phone,
  MapPin,
  Eye,
  EyeSlash,
  CircleNotch,
  PaperPlaneRight,
  Camera,
  ImageSquare,
  CheckCircle,
  IdentificationCard,
  UserFocus,
  X,
} from "@phosphor-icons/react";

const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phone: z.string().min(9, "Nomor telepon terlalu pendek"),
  address: z.string().min(10, "Alamat terlalu singkat, mohon diperjelas"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─────────────────────────────────────────────
// CLIENT-SIDE IMAGE COMPRESSION
// ─────────────────────────────────────────────
async function compressImage(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], baseName + ".jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type ImageUploadFieldProps = {
  label: React.ReactNode; // PERBAIKAN: Ubah menjadi ReactNode agar bisa menerima Ikon
  hint: string;
  colorScheme: "blue" | "red";
  maxWidth: number;
  quality: number;
  capture: boolean | "user" | "environment";
  required?: boolean;
  onFileReady: (file: File | null) => void;
};

function ImageUploadField({
  label,
  hint,
  colorScheme,
  maxWidth,
  quality,
  capture,
  required,
  onFileReady,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const bg =
    colorScheme === "blue"
      ? "bg-indigo-50 border-indigo-100"
      : "bg-red-50 border-red-100";
  const text = colorScheme === "blue" ? "text-indigo-800" : "text-red-800";
  const subtext = colorScheme === "blue" ? "text-indigo-600" : "text-red-600";
  const camBtn =
    colorScheme === "blue"
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-red-600 hover:bg-red-700";

  const processFile = async (raw: File | undefined) => {
    if (!raw) return;
    setOriginalSize(raw.size);
    setCompressing(true);
    setPreview(null);
    try {
      const compressed = await compressImage(raw, maxWidth, quality);
      setCompressedSize(compressed.size);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview((ev.target?.result as string) ?? null);
      reader.readAsDataURL(compressed);
      onFileReady(compressed);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal";
      alert("Gagal memproses gambar: " + errorMessage);
      onFileReady(null);
    } finally {
      setCompressing(false);
    }
  };

  const savedPercent =
    originalSize && compressedSize
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : null;

  return (
    <div className={bg + " p-4 rounded-xl border"}>
      <label
        className={
          "flex items-center gap-2 text-sm font-bold " + text + " mb-1"
        }
      >
        {label}
      </label>
      <p className={"text-xs " + subtext + " mb-4"}>{hint}</p>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture={capture as any}
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />

      {!preview && !compressing && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className={
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white transition-colors shadow-sm " +
              camBtn
            }
          >
            <Camera weight="bold" className="w-5 h-5" /> Ambil Foto
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ImageSquare weight="bold" className="w-5 h-5" /> Dari Galeri
          </button>
        </div>
      )}

      {compressing && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold py-4">
          <CircleNotch
            weight="bold"
            className="w-5 h-5 animate-spin text-indigo-500"
          />
          Mengompresi gambar...
        </div>
      )}

      {!compressing && preview && (
        <div className="flex items-start gap-4">
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-sm shrink-0"
          />
          <div className="flex-1 text-xs text-gray-600 space-y-1.5">
            <p>
              Ukuran asli:{" "}
              <span className="font-semibold text-gray-800">
                {formatBytes(originalSize)}
              </span>
            </p>
            <p>
              Setelah kompresi:{" "}
              <span className="font-bold text-green-600">
                {formatBytes(compressedSize)}
              </span>
            </p>
            {savedPercent !== null &&
              (savedPercent > 0 ? (
                <p className="text-green-600 font-bold bg-green-100 inline-flex items-center gap-1 px-2 py-0.5 rounded-md mt-1">
                  <CheckCircle weight="fill" className="w-4 h-4" /> Dihemat{" "}
                  {savedPercent}%
                </p>
              ) : (
                <p className="text-gray-400 font-medium">
                  Gambar sudah optimal.
                </p>
              ))}
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setOriginalSize(null);
                setCompressedSize(null);
                onFileReady(null);
              }}
              className="text-red-500 hover:text-red-700 font-bold pt-2 flex items-center gap-1 transition-colors"
            >
              <X weight="bold" className="w-4 h-4" /> Ganti Foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmitForm = async (data: RegisterFormValues) => {
    if (!agreedToTerms) {
      alert(
        "Ups! Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi Mai-Milu sebelum mendaftar.",
      );
      return;
    }
    setLoading(true);

    try {
      let userId: string | undefined;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError.message === "User already registered") {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });
          if (signInError)
            throw new Error(
              'Email ini sudah terdaftar namun pendaftaran sebelumnya tidak selesai. Pastikan kata sandi sama dengan percobaan pertama, atau gunakan fitur "Lupa Sandi".',
            );
          userId = signInData.user?.id;
        } else {
          throw authError;
        }
      } else {
        userId = authData.user?.id;
      }

      if (!userId) throw new Error("Gagal membuat akun pengguna.");

      let avatarUrl = "";
      if (avatarFile) {
        const avatarPath = `${userId}/selfie-${Date.now()}.jpg`;
        const { error: avatarError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, avatarFile, { contentType: "image/jpeg" });
        if (avatarError)
          throw new Error(
            "Gagal mengunggah foto selfie: " + avatarError.message,
          );
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(avatarPath)
          .data.publicUrl;
      }

      let ktpUrl = "";
      if (ktpFile) {
        const ktpPath = `${userId}/ktp-${Date.now()}.jpg`;
        const { error: ktpError } = await supabase.storage
          .from("identity_docs")
          .upload(ktpPath, ktpFile, { contentType: "image/jpeg" });
        if (ktpError)
          throw new Error("Gagal mengunggah foto KTP: " + ktpError.message);
        ktpUrl = ktpPath;
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: data.fullName,
        phone_number: data.phone,
        home_address: data.address,
        avatar_url: avatarUrl,
        ktp_url: ktpUrl,
        verification_status: "pending",
        role: "user",
      });

      if (profileError) throw profileError;

      alert(
        "Pendaftaran berhasil! Silakan tunggu verifikasi dari admin Mai-Milu.",
      );
      router.push("/verification");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak dikenal";
      alert("Ups, terjadi kesalahan: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 w-24 h-24 mx-auto"></div>
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

        <h1 className="text-3xl font-black text-center text-indigo-600 mb-2 tracking-tight">
          Mai-Milu
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
          Mari berbagi tumpangan bersama masyarakat Bali lainnya di komunitas
          Mai-Milu.
        </p>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="flex flex-col gap-5"
        >
          {/* Akun */}
          <div className="space-y-5 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              1. Data Akun
            </h3>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
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
                  className={`w-full border py-2.5 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
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
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <LockKey
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full border py-2.5 pl-11 pr-12 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
                  placeholder="Minimal 6 karakter"
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
          </div>

          {/* Profil */}
          <div className="space-y-5 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              2. Data Diri
            </h3>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Nama Lengkap (Sesuai KTP)
              </label>
              <div className="relative">
                <UserIcon
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type="text"
                  {...register("fullName")}
                  className={`w-full border py-2.5 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
                  placeholder="Putu / Kadek / Komang..."
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone
                  weight="duotone"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  type="tel"
                  {...register("phone")}
                  className={`w-full border py-2.5 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
                  placeholder="081..."
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Alamat Rumah
              </label>
              <div className="relative">
                <MapPin
                  weight="duotone"
                  className="absolute left-3.5 top-3 text-gray-400 w-5 h-5"
                />
                <textarea
                  {...register("address")}
                  className={`w-full border py-2.5 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.address ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}`}
                  placeholder="Perumahan Delta, Jl Kuta No 8..."
                  rows={3}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          <ImageUploadField
            label={
              <>
                <UserFocus weight="duotone" className="w-5 h-5" /> Unggah Foto
                Selfie
              </>
            }
            hint="Ini akan menjadi foto profil Anda untuk komunitas."
            colorScheme="blue"
            maxWidth={800}
            quality={0.82}
            capture="user"
            required
            onFileReady={setAvatarFile}
          />
          <ImageUploadField
            label={
              <>
                <IdentificationCard weight="duotone" className="w-5 h-5" />{" "}
                Unggah Foto KTP
              </>
            }
            hint="Hanya digunakan untuk verifikasi keamanan admin."
            colorScheme="red"
            maxWidth={1400}
            quality={0.88}
            capture="environment"
            required
            onFileReady={setKtpFile}
          />

          <div className="flex items-start gap-3 p-3 mt-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <input
              type="checkbox"
              id="terms_consent"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm"
            />
            <label
              htmlFor="terms_consent"
              className="text-sm text-gray-700 leading-relaxed font-medium"
            >
              Saya menyetujui{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-indigo-600 font-bold hover:underline"
              >
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-indigo-600 font-bold hover:underline"
              >
                Kebijakan Privasi
              </Link>{" "}
              Mai-Milu.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-[15px]"
          >
            {loading ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              <PaperPlaneRight weight="fill" className="w-5 h-5" />
            )}
            {loading ? "Memproses data Anda..." : "Kirim Data Verifikasi"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-black hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
