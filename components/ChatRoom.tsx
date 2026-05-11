'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PaperPlaneRight, CircleNotch, User } from '@phosphor-icons/react'

type Message = {
  id: string
  booking_id: string
  sender_id: string
  content: string
  is_read: boolean | null
  created_at: string
}

type ChatRoomProps = {
  bookingId: string
  currentUserId: string
  otherUserName: string
  otherUserAvatar: string | null
  initialMessages: Message[]
}

export default function ChatRoom({ bookingId, currentUserId, otherUserName, otherUserAvatar, initialMessages }: ChatRoomProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Berlangganan ke Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`room-${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          const newMsg = payload.new as Message
          // Tambahkan pesan ke state HANYA jika pesan itu dari orang lain
          // (Pesan dari kita sendiri sudah ditambahkan optimistik saat fungsi handleSendMessage)
          if (newMsg.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, newMsg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, currentUserId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const tempMessage = newMessage
    setNewMessage('')
    setIsSending(true)

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: currentUserId,
          content: tempMessage,
        })
        .select()
        .single()

      if (error) throw error
      
      // Tambahkan pesan ke layar kita sendiri secara instan
      if (data) {
        setMessages((prev) => [...prev, data as Message])
      }
    } catch (error: any) {
      alert('Gagal mengirim pesan: ' + error.message)
      setNewMessage(tempMessage) // Kembalikan teks jika gagal
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 relative">
      
      {/* Area Daftar Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="bg-indigo-100 p-4 rounded-full mb-3">
              <PaperPlaneRight weight="duotone" className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Belum ada pesan.<br/>Kirim pesan pertama untuk menyapa!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            const time = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar (Hanya untuk lawan bicara) */}
                  {!isMe && (
                    <div className="shrink-0 mb-1">
                      {otherUserAvatar ? (
                        <img src={otherUserAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                          <User weight="fill" className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gelembung Pesan */}
                  <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm flex flex-col ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-[15px] leading-relaxed wrap-break-word">{msg.content}</p>
                    <span className={`text-[10px] self-end mt-1 font-medium ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {time}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} /> {/* Anchor untuk auto-scroll */}
      </div>

      {/* Area Input Chat (Sticky Bottom) */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200 p-3 pb-safe">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-5 py-3 text-sm outline-none transition-all"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            {isSending ? (
              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
            ) : (
              <PaperPlaneRight weight="fill" className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}