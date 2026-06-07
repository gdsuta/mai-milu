"use client";

import { useEffect } from "react";
import { WarningCircle, ArrowsClockwise } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <WarningCircle
        weight="duotone"
        className="w-20 h-20 text-red-500 mb-4 mx-auto"
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Waduh, terjadi kesalahan!
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Sistem kami mengalami sedikit gangguan saat mencoba memuat halaman ini.
        Jangan khawatir, coba muat ulang halamannya.
      </p>
      <button
        onClick={() => reset()}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition flex items-center justify-center gap-2 mx-auto"
      >
        <ArrowsClockwise weight="bold" className="w-5 h-5" /> Coba Lagi
      </button>
    </div>
  );
}
