'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// ─────────────────────────────────────────────
// CLIENT-SIDE IMAGE COMPRESSION
// Uses the browser Canvas API — zero dependencies.
// selfie → max 800px,  JPEG 0.82 → ~150–250 KB
// KTP    → max 1400px, JPEG 0.88 → ~300–500 KB (legible for admin)
// ─────────────────────────────────────────────
async function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Compression failed'))
        const baseName = file.name.replace(/\.[^.]+$/, '')
        resolve(new File([blob], baseName + '.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

type ImageUploadFieldProps = {
  label: string
  hint: string
  colorScheme: 'blue' | 'red'
  maxWidth: number
  quality: number
  capture: string
  required?: boolean
  onFileReady: (file: File | null) => void
}

function ImageUploadField({ label, hint, colorScheme, maxWidth, quality, capture, required, onFileReady }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState(null)
  const [originalSize, setOriginalSize] = useState(null)
  const [compressedSize, setCompressedSize] = useState(null)
  const [compressing, setCompressing] = useState(false)

  // Two hidden inputs: one opens the camera, one opens the gallery
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const bg      = colorScheme === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'
  const text    = colorScheme === 'blue' ? 'text-blue-800' : 'text-red-800'
  const subtext = colorScheme === 'blue' ? 'text-blue-600' : 'text-red-600'
  const camBtn  = colorScheme === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'

  const processFile = async (raw) => {
    if (!raw) return
    setOriginalSize(raw.size)
    setCompressing(true)
    setPreview(null)
    try {
      const compressed = await compressImage(raw, maxWidth, quality)
      setCompressedSize(compressed.size)
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target?.result)
      reader.readAsDataURL(compressed)
      onFileReady(compressed)
    } catch (err) {
      alert('Gagal memproses gambar: ' + err.message)
      onFileReady(null)
    } finally {
      setCompressing(false)
    }
  }

  const savedPercent = originalSize && compressedSize
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : null

  return (
    <div className={bg + ' p-4 rounded-lg border'}>
      <label className={'block text-sm font-bold ' + text + ' mb-1'}>{label}</label>
      <p className={'text-xs ' + subtext + ' mb-3'}>{hint}</p>

      {/* Hidden inputs — camera and gallery separately */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture={capture}
        className="hidden" onChange={e => processFile(e.target.files?.[0])} />
      <input ref={galleryInputRef} type="file" accept="image/*"
        className="hidden" onChange={e => processFile(e.target.files?.[0])} />

      {/* Two explicit buttons */}
      {!preview && !compressing && (
        <div className="flex gap-2">
          <button type="button" onClick={() => cameraInputRef.current?.click()}
            className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition " + camBtn}>
            📷 Ambil Foto
          </button>
          <button type="button" onClick={() => galleryInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition">
            🖼️ Dari Galeri
          </button>
        </div>
      )}

      {compressing && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Mengompresi gambar...
        </div>
      )}

      {!compressing && preview && (
        <div className="flex items-start gap-3">
          <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm flex-shrink-0" />
          <div className="flex-1 text-xs text-gray-600 space-y-1">
            <p>Ukuran asli: <span className="font-medium text-gray-700">{formatBytes(originalSize)}</span></p>
            <p>Setelah kompresi: <span className="font-medium text-green-700">{formatBytes(compressedSize)}</span></p>
            {savedPercent > 0
              ? <p className="text-green-600 font-semibold">✅ Dihemat {savedPercent}%</p>
              : <p className="text-gray-400">Gambar sudah optimal.</p>}
            <button type="button" onClick={() => { setPreview(null); setOriginalSize(null); setCompressedSize(null); onFileReady(null) }}
              className="text-red-500 hover:text-red-700 font-semibold pt-1">
              × Ganti Foto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '', address: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [ktpFile, setKtpFile] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!agreedToTerms) { alert('Ups! Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi Mai-Milu sebelum mendaftar.'); return }
    setLoading(true)
    try {
      let userId
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password })
      if (authError) {
        if (authError.message === 'User already registered') {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password })
          if (signInError) throw new Error('Email ini sudah terdaftar namun pendaftaran sebelumnya tidak selesai. Pastikan kata sandi sama dengan percobaan pertama, atau gunakan fitur "Lupa Sandi".')
          userId = signInData.user?.id
        } else throw authError
      } else userId = authData.user?.id
      if (!userId) throw new Error('Gagal membuat akun pengguna.')

      let avatarUrl = ''
      if (avatarFile) {
        const avatarPath = userId + '/selfie-' + Date.now() + '.jpg'
        const { error: avatarError } = await supabase.storage.from('avatars').upload(avatarPath, avatarFile, { contentType: 'image/jpeg' })
        if (avatarError) throw new Error('Gagal mengunggah foto selfie: ' + avatarError.message)
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl
      }

      let ktpUrl = ''
      if (ktpFile) {
        const ktpPath = userId + '/ktp-' + Date.now() + '.jpg'
        const { error: ktpError } = await supabase.storage.from('identity_docs').upload(ktpPath, ktpFile, { contentType: 'image/jpeg' })
        if (ktpError) throw new Error('Gagal mengunggah foto KTP: ' + ktpError.message)
        ktpUrl = ktpPath
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId, full_name: formData.fullName, phone_number: formData.phone,
        home_address: formData.address, avatar_url: avatarUrl, ktp_url: ktpUrl,
        verification_status: 'pending', role: 'user',
      })
      if (profileError) throw profileError

      alert('Pendaftaran berhasil! Silakan tunggu verifikasi dari admin Mai-Milu.')
      router.push('/verification')
    } catch (error) {
      alert('Ups, terjadi kesalahan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Mai-Milu Logo" width={80} height={80} className="rounded-full shadow-md" />
        </div>
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Mai-Milu</h1>
        <p className="text-center text-gray-500 mb-8">Mari berbagi tumpangan bersama masyarakat Bali lainnya di komunitas Mai-Milu.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="anda@gmail.com" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
            <div className="relative mt-1">
              <input type={showPassword ? 'text' : 'password'} required
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full border border-gray-300 p-2 pr-10 rounded-lg text-gray-900" placeholder="Minimal 6 karakter" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <hr className="my-2" />

          <div>
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap (Sesuai KTP)</label>
            <input type="text" required onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="Putu / Kadek / Komang..." />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
            <input type="tel" required onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="081..." />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Alamat Rumah</label>
            <textarea required onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900"
              placeholder="Perumahan Delta, Jl Kuta No 8, Desa Panji, Buleleng" rows={2} />
          </div>

          <hr className="my-2" />

          <ImageUploadField
            label="1. Unggah Foto Selfie (Jelas)"
            hint="Ini akan menjadi foto profil Anda. Gambar dikompres otomatis sebelum dikirim."
            colorScheme="blue" maxWidth={800} quality={0.82} capture="user" required onFileReady={setAvatarFile}
          />
          <ImageUploadField
            label="2. Unggah Foto KTP"
            hint="Dijaga kerahasiaannya untuk keamanan komunitas. Gambar dikompres otomatis sebelum dikirim."
            colorScheme="red" maxWidth={1400} quality={0.88} capture="environment" required onFileReady={setKtpFile}
          />

          <div className="flex items-start gap-2 p-2 mt-2">
            <input type="checkbox" id="terms_consent" required checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="terms_consent" className="text-sm text-gray-700 leading-snug">
              Saya menyetujui{' '}
              <Link href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">Syarat & Ketentuan</Link>
              {' '}serta{' '}
              <Link href="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">Kebijakan Privasi</Link>
              {' '}Mai-Milu.
            </label>
          </div>

          <button type="submit" disabled={loading || !agreedToTerms}
            className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Memproses data Anda...' : 'Kirim Data Verifikasi'}
          </button>
        </form>
      </div>
    </div>
  )
}
