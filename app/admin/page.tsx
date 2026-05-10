import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ZoomableImage from '@/components/ZoomableImage'
import { createServer } from '@/lib/supabase/server'

// Menambahkan properti pencarian URL (searchParams) untuk melacak halaman
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminDashboard(props: Props) {
  const supabase = await createServer()

  // 1. Dapatkan parameter halaman dari URL (contoh: ?page=2)
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = 20 // Beban maksimal per halaman

  // 2. Rumus kalkulasi rentang (offset)
  const startOffset = (currentPage - 1) * pageSize
  const endOffset = startOffset + pageSize - 1

  // Pengecekan Auth
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/home')

  // Tarik data pengguna yang masih pending (tanpa pagination)
  const { data: pendingUsers } = await supabase.from('profiles').select('*').eq('verification_status', 'pending')

  // Tarik data pengguna aktif DENGAN pagination dan hitung total datanya
  const { data: verifiedUsers, count: totalVerified } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' }) // Minta Supabase menghitung total baris
    .eq('verification_status', 'verified')
    .neq('role', 'admin')
    .range(startOffset, endOffset) // Batasi penarikan dari start ke end

  const totalPages = totalVerified ? Math.ceil(totalVerified / pageSize) : 1

  // Proses KTP untuk pengguna pending
  const usersWithSignedUrls = await Promise.all(
    (pendingUsers || []).map(async (u) => {
      let signedKtpUrl = null
      if (u.ktp_url) {
        const { data } = await supabase.storage.from('identity_docs').createSignedUrl(u.ktp_url, 3600) 
        signedKtpUrl = data?.signedUrl
      }
      return { ...u, signedKtpUrl }
    })
  )

  // Server Actions
  async function approveUser(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const userId = formData.get('userId') as string
    const ktpPath = formData.get('ktpPath') as string

    await supabaseServer.from('profiles').update({ verification_status: 'verified', ktp_url: null }).eq('id', userId)
    if (ktpPath) await supabaseServer.storage.from('identity_docs').remove([ktpPath])
    revalidatePath('/admin') 
  }

  async function revokeAccess(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const userId = formData.get('userId') as string
    await supabaseServer.from('profiles').update({ verification_status: 'rejected' }).eq('id', userId)
    revalidatePath('/admin') 
  }

  return (
    <>
      <Navbar userName={profile?.full_name ?? undefined} avatarUrl={profile?.avatar_url ?? undefined} />
      <div className="min-h-screen bg-gray-100 p-8 pt-12">
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-3xl font-bold text-blue-800">Pusat Kendali Admin</h1>
            <Link href="/home" className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition shadow-sm border border-blue-200 flex items-center gap-2">
              <span>🏠</span> Ke Beranda Utama
            </Link>
        </div>
        
        {/* BAGIAN 1: Menunggu Persetujuan (Tidak dipaginasi) */}
        <h2 className="text-xl font-bold text-gray-700 mb-4">Menunggu Verifikasi KTP</h2>
        {(!usersWithSignedUrls || usersWithSignedUrls.length === 0) ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center mb-8 border-l-4 border-green-500">
            <p className="text-gray-500">Semua pendaftaran baru sudah ditangani.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {usersWithSignedUrls.map((u) => (
              <div key={u.id} className="bg-white border p-6 rounded-lg shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-bold text-gray-800">{u.full_name}</h2>
                  <p className="text-sm text-gray-600">📞 {u.phone_number}</p>
                  <p className="text-sm text-gray-600">🏠 {u.home_address}</p>
                </div>
                
                <div className="flex-none flex flex-col items-center">
                  <p className="font-semibold text-xs mb-1 text-gray-600">Selfie</p>
                  <ZoomableImage src={u.avatar_url} alt={`Selfie ${u.full_name}`} className="w-24 h-24 object-cover rounded-full border-2 border-blue-100" fallbackText="👤" />
                </div>

                <div className="flex-none flex flex-col items-center">
                  <p className="font-semibold text-xs mb-1 text-red-600">KTP</p>
                  <ZoomableImage src={u.signedKtpUrl} alt={`KTP ${u.full_name}`} className="w-36 h-24 object-cover rounded border border-gray-300" fallbackText="🪪" />
                </div>

                <div className="flex-none">
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="ktpPath" value={u.ktp_url ?? ""} />
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">✅ Setujui</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BAGIAN 2: Pengguna Aktif (Dengan Pagination) */}
        <h2 className="text-xl font-bold text-gray-700 mb-4">Pengguna Aktif (Terverifikasi)</h2>
        {(!verifiedUsers || verifiedUsers.length === 0) ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">Belum ada pengguna yang diverifikasi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifiedUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-row items-center gap-3">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt={u.full_name ?? "User avatar"} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm shrink-0">👤</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{u.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">📞 {u.phone_number}</p>
                </div>
                <form action={revokeAccess} className="shrink-0">
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg border border-red-200 whitespace-nowrap">
                    Cabut Akses
                  </button>
                </form>
              </div>
            ))}

            {/* Navigasi Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-200">
                {currentPage > 1 ? (
                  <Link href={`/admin?page=${currentPage - 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 font-semibold text-sm transition">
                    ⬅️ Sebelumnya
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-semibold text-sm">
                    ⬅️ Sebelumnya
                  </button>
                )}
                
                <span className="font-bold text-gray-600 text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                  Halaman {currentPage} dari {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link href={`/admin?page=${currentPage + 1}`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 font-semibold text-sm transition">
                    Selanjutnya ➡️
                  </Link>
                ) : (
                  <button disabled className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-semibold text-sm">
                    Selanjutnya ➡️
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}