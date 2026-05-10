import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ZoomableImage from '@/components/ZoomableImage'
import { createServer } from '@/lib/supabase/server'
// Impor ikon dari Phosphor
import { House, CheckCircle, Phone, MapPin, User, Prohibit, CaretLeft, CaretRight, HourglassMedium, ShieldCheck } from '@phosphor-icons/react/dist/ssr'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminDashboard(props: Props) {
  const supabase = await createServer()

  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  const pageSize = 20

  const startOffset = (currentPage - 1) * pageSize
  const endOffset = startOffset + pageSize - 1

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/home')

  const { data: pendingUsers } = await supabase.from('profiles').select('*').eq('verification_status', 'pending')

  const { data: verifiedUsers, count: totalVerified } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('verification_status', 'verified')
    .neq('role', 'admin')
    .range(startOffset, endOffset)

  const totalPages = totalVerified ? Math.ceil(totalVerified / pageSize) : 1

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
      <div className="min-h-screen bg-gray-50 p-6 pt-10 md:p-8 md:pt-12">
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-3">
              <ShieldCheck weight="duotone" className="w-10 h-10 text-blue-600" />
              Pusat Kendali Admin
            </h1>
            <Link href="/home" className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm border border-blue-200 flex items-center gap-2.5">
              <House weight="duotone" className="w-5 h-5" /> Ke Beranda Utama
            </Link>
        </div>
        
        {/* BAGIAN 1: Menunggu Persetujuan */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <HourglassMedium weight="duotone" className="w-6 h-6 text-orange-500" />
            Menunggu Verifikasi KTP
          </h2>
          
          {(!usersWithSignedUrls || usersWithSignedUrls.length === 0) ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center mb-10 border border-gray-200">
              <CheckCircle weight="duotone" className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Semua pendaftaran baru sudah ditangani.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-10">
              {usersWithSignedUrls.map((u) => (
                <div key={u.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center transition-shadow hover:shadow-md">
                  <div className="flex-1 w-full space-y-2">
                    <h2 className="text-xl font-black text-gray-800">{u.full_name}</h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone weight="duotone" className="w-4 h-4 text-gray-400" /> {u.phone_number}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 leading-snug">
                      <MapPin weight="duotone" className="w-4 h-4 text-gray-400 shrink-0" /> {u.home_address}
                    </p>
                  </div>
                  
                  <div className="flex-none flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-bold text-[11px] uppercase tracking-wider mb-2 text-gray-500">Selfie</p>
                    <ZoomableImage src={u.avatar_url} alt={`Selfie ${u.full_name}`} className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-sm" fallbackText="Foto" />
                  </div>

                  <div className="flex-none flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-bold text-[11px] uppercase tracking-wider mb-2 text-red-500">KTP Identitas</p>
                    <ZoomableImage src={u.signedKtpUrl} alt={`KTP ${u.full_name}`} className="w-36 h-24 object-cover rounded-md border-4 border-white shadow-sm" fallbackText="KTP" />
                  </div>

                  <div className="flex-none w-full md:w-auto">
                    <form action={approveUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="ktpPath" value={u.ktp_url ?? ""} />
                      <button type="submit" className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition-colors flex items-center justify-center gap-2.5">
                        <CheckCircle weight="bold" className="w-5 h-5" /> Setujui
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BAGIAN 2: Pengguna Aktif */}
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2 pt-4 border-t border-gray-200">
            <CheckCircle weight="duotone" className="w-6 h-6 text-green-500" />
            Pengguna Aktif (Terverifikasi)
          </h2>
          
          {(!verifiedUsers || verifiedUsers.length === 0) ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
              <User weight="duotone" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Belum ada pengguna yang diverifikasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedUsers.map((u) => (
                <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-row items-center gap-4 transition-shadow hover:shadow-md">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.full_name ?? "User avatar"} className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200" />
                    : <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shrink-0"><User weight="duotone" className="w-6 h-6 text-gray-400" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate text-base">{u.full_name}</p>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                      <Phone weight="duotone" className="w-3.5 h-3.5" /> {u.phone_number}
                    </p>
                  </div>
                  <form action={revokeAccess} className="shrink-0">
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit" className="text-red-600 hover:text-white hover:bg-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200 whitespace-nowrap transition-colors flex items-center gap-1.5">
                      <Prohibit weight="bold" className="w-4 h-4" /> Cabut
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Navigasi Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10 mb-8">
              {currentPage > 1 ? (
                <Link href={`/admin?page=${currentPage - 1}`} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors flex items-center gap-2">
                  <CaretLeft weight="bold" className="w-4 h-4" /> Sebelumnya
                </Link>
              ) : (
                <button disabled className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-bold text-sm flex items-center gap-2">
                  <CaretLeft weight="bold" className="w-4 h-4" /> Sebelumnya
                </button>
              )}
              
              <span className="font-black text-gray-700 text-sm bg-gray-100 px-5 py-2.5 rounded-xl border border-gray-200">
                Halaman {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link href={`/admin?page=${currentPage + 1}`} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors flex items-center gap-2">
                  Selanjutnya <CaretRight weight="bold" className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-bold text-sm flex items-center gap-2">
                  Selanjutnya <CaretRight weight="bold" className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}