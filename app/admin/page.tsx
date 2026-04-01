import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ZoomableImage from '@/components/ZoomableImage' // <-- Import komponen baru kita

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set({ name, value, ...options }) }) } catch (error) {}
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/home')

  const { data: pendingUsers } = await supabase.from('profiles').select('*').eq('verification_status', 'pending')
  const { data: verifiedUsers } = await supabase.from('profiles').select('*').eq('verification_status', 'verified').neq('role', 'admin')

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

  async function approveUser(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll() { return cookieStore.getAll() }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set({ name, value, ...options }) }) } catch (error) {} } }
    })
    const userId = formData.get('userId') as string
    const ktpPath = formData.get('ktpPath') as string

    await supabaseServer.from('profiles').update({ verification_status: 'verified', ktp_url: null }).eq('id', userId)
    if (ktpPath) await supabaseServer.storage.from('identity_docs').remove([ktpPath])
    revalidatePath('/admin') 
  }

  async function revokeAccess(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { getAll() { return cookieStore.getAll() }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set({ name, value, ...options }) }) } catch (error) {} } }
    })
    const userId = formData.get('userId') as string
    await supabaseServer.from('profiles').update({ verification_status: 'rejected' }).eq('id', userId)
    revalidatePath('/admin') 
  }

  return (
    <>
      <Navbar userName={profile?.full_name} avatarUrl={profile?.avatar_url} />
      <div className="min-h-screen bg-gray-100 p-8 pt-12">
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-3xl font-bold text-blue-800">Pusat Kendali Admin</h1>
            <Link href="/home" className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition shadow-sm border border-blue-200 flex items-center gap-2">
              <span>🏠</span> Ke Beranda Utama
            </Link>
        </div>
        
        {/* BAGIAN 1: Menunggu Persetujuan */}
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
                
                {/* INI YANG BERUBAH: Menggunakan ZoomableImage untuk Selfie */}
                <div className="flex-none flex flex-col items-center">
                  <p className="font-semibold text-xs mb-1 text-gray-600">Selfie</p>
                  <ZoomableImage 
                    src={u.avatar_url} 
                    alt={`Selfie ${u.full_name}`} 
                    className="w-24 h-24 object-cover rounded-full border-2 border-blue-100"
                    fallbackText="👤"
                  />
                </div>

                {/* INI YANG BERUBAH: Menggunakan ZoomableImage untuk KTP */}
                <div className="flex-none flex flex-col items-center">
                  <p className="font-semibold text-xs mb-1 text-red-600">KTP</p>
                  <ZoomableImage 
                    src={u.signedKtpUrl} 
                    alt={`KTP ${u.full_name}`} 
                    className="w-36 h-24 object-cover rounded border border-gray-300"
                    fallbackText="🪪"
                  />
                </div>

                <div className="flex-none">
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="ktpPath" value={u.ktp_url} />
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">✅ Setujui</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BAGIAN 2: Pengguna Aktif (Terverifikasi) */}
        {/* ... (Kode tabel pengguna aktif tetap sama persis seperti sebelumnya) ... */}
        <h2 className="text-xl font-bold text-gray-700 mb-4">Pengguna Aktif (Terverifikasi)</h2>
        {(!verifiedUsers || verifiedUsers.length === 0) ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">Belum ada pengguna yang diverifikasi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-sm font-semibold text-gray-600">Nama Lengkap</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">No. WhatsApp</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {verifiedUsers.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-800 flex items-center gap-3">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">👤</div>}
                      {u.full_name}
                    </td>
                    <td className="p-4 text-gray-600">{u.phone_number}</td>
                    <td className="p-4 text-center">
                      <form action={revokeAccess}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1 rounded border border-red-200">
                          Cabut Akses
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  )
}