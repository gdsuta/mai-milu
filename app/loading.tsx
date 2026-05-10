export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 font-medium animate-pulse">Memuat data...</p>
    </div>
  )
}