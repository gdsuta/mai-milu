import { CircleNotch } from "@phosphor-icons/react/dist/ssr";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <CircleNotch
        weight="bold"
        className="w-12 h-12 text-indigo-600 animate-spin"
      />
      <p className="mt-4 text-gray-500 font-medium animate-pulse text-sm">
        Memuat data...
      </p>
    </div>
  );
}
