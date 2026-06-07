"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Target,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Flag,
  CalendarBlank,
  Users,
  Coins,
  ArrowsClockwise,
  Trash,
  Ticket,
  User,
  WhatsappLogo,
} from "@phosphor-icons/react";

type Booking = {
  id: string;
  passenger_id: string;
  status: string;
  created_at: string;
  passenger?: {
    full_name: string;
    avatar_url: string | null;
    phone_number: string;
  } | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    phone_number: string;
  } | null;
  messages?: { is_read: boolean; sender_id: string }[];
};

type Ride = {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price: number;
  notes: string | null;
  status: string;
  created_at: string;
  is_recurring: boolean;
  recurring_days: string[] | null;
  bookings?: Booking[];
};

type Props = {
  rides: Ride[];
  updateRideStatus: (formData: FormData) => Promise<void>;
  deleteRide: (formData: FormData) => Promise<void>;
  respondToBooking: (formData: FormData) => Promise<void>;
};

type Tab = "tersedia" | "selesai" | "dibatalkan" | "kadaluarsa";

const TAB_CONFIG: Record<Tab, { label: string; color: string }> = {
  tersedia: { label: "Aktif", color: "text-green-600 border-green-500" },
  selesai: { label: "Selesai", color: "text-blue-600 border-blue-500" },
  dibatalkan: { label: "Dibatalkan", color: "text-red-600 border-red-500" },
  kadaluarsa: { label: "Kadaluarsa", color: "text-gray-500 border-gray-400" },
};

const getTabIcon = (tab: Tab, className: string) => {
  if (tab === "tersedia")
    return <Target weight="duotone" className={className} />;
  if (tab === "selesai")
    return <CheckCircle weight="duotone" className={className} />;
  if (tab === "dibatalkan")
    return <XCircle weight="duotone" className={className} />;
  return <Clock weight="duotone" className={className} />;
};

const STATUS_BADGE: Record<string, string> = {
  tersedia: "bg-green-100 text-green-700 border border-green-200",
  selesai: "bg-blue-100 text-blue-700 border border-blue-200",
  dibatalkan: "bg-red-100 text-red-700 border border-red-200",
  kadaluarsa: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function MyRidesList({
  rides,
  updateRideStatus,
  deleteRide,
  respondToBooking,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("tersedia");
  const [confirmAction, setConfirmAction] = useState<{
    rideId: string;
    action: "selesai" | "dibatalkan" | "delete";
    origin: string;
    destination: string;
  } | null>(null);

  const counts = {
    tersedia: rides.filter((r) => r.status === "tersedia").length,
    selesai: rides.filter((r) => r.status === "selesai").length,
    dibatalkan: rides.filter((r) => r.status === "dibatalkan").length,
    kadaluarsa: rides.filter((r) => r.status === "kadaluarsa").length,
  };

  const filtered = rides.filter((r) => r.status === activeTab);

  return (
    <>
      <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 mb-6">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? `bg-gray-50 shadow-sm ${TAB_CONFIG[tab].color}` : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"}`}
          >
            {getTabIcon(tab, "w-6 h-6 mb-1")}
            <span>{TAB_CONFIG[tab].label}</span>
            {counts[tab] > 0 && (
              <span
                className={`mt-0.5 text-[10px] font-black bg-white px-2 py-0.5 rounded-full border ${activeTab === tab ? "border-current" : "border-gray-200 text-gray-400"}`}
              >
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            {getTabIcon(activeTab, "w-12 h-12 text-gray-300")}
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-xs">
            Tidak ada tumpangan di kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((ride) => {
            const dateObj = new Date(ride.departure_time);

            // Format baru untuk lencana kalender vertikal
            const hariPendek = dateObj.toLocaleDateString("id-ID", {
              weekday: "short",
            }); // Cth: "Sen"
            const tanggalAngka = dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
            }); // Cth: "08"
            const bulanPendek = dateObj.toLocaleDateString("id-ID", {
              month: "short",
            }); // Cth: "Jun"

            const jam = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isPast = dateObj < new Date();
            const isActive = ride.status === "tersedia";

            const activeBookings =
              ride.bookings?.filter(
                (b) => b.status === "pending" || b.status === "accepted",
              ) || [];
            const pendingCount = activeBookings.filter(
              (b) => b.status === "pending",
            ).length;

            return (
              <div
                key={ride.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* STRUKTUR ATAS (Kalender Kiri, Rute Kanan) */}
                <div className="flex items-stretch gap-4 border-b border-gray-100 p-5">
                  {/* Lencana Kalender Vertikal */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2 flex flex-col items-center justify-center min-w-17.5 shrink-0 text-indigo-700">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {hariPendek}
                    </span>
                    <span className="text-2xl font-black leading-none my-0.5">
                      {tanggalAngka}
                    </span>
                    <span className="text-xs font-bold">{bulanPendek}</span>
                  </div>

                  {/* Info Rute & Waktu */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin
                        weight="duotone"
                        className="w-5 h-5 text-blue-500 shrink-0"
                      />
                      <span className="font-bold text-gray-800 text-lg truncate">
                        {ride.origin}
                      </span>
                      <span className="text-gray-300">→</span>
                      <Flag
                        weight="duotone"
                        className="w-5 h-5 text-red-500 shrink-0"
                      />
                      <span className="font-bold text-gray-800 text-lg truncate">
                        {ride.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold bg-gray-50 w-fit px-3 py-1 rounded-lg border border-gray-100">
                      <Clock
                        weight="duotone"
                        className="w-4 h-4 text-gray-400"
                      />{" "}
                      {jam} WITA
                    </div>
                  </div>

                  {/* Lencana Status Kanan Atas */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wider ${STATUS_BADGE[ride.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {getTabIcon(ride.status as Tab, "w-3.5 h-3.5")}{" "}
                      {TAB_CONFIG[ride.status as Tab]?.label ?? ride.status}
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1.5 animate-pulse">
                        <Ticket weight="fill" className="w-3.5 h-3.5" />{" "}
                        {pendingCount} Menunggu
                      </span>
                    )}
                  </div>
                </div>
                {/* ── DAFTAR PENUMPANG (BOOKINGS) ── */}
                {activeBookings.length > 0 && (
                  <div className="mt-4 mb-4 pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket weight="duotone" className="w-4 h-4" /> Daftar
                      Penumpang
                    </h4>
                    <div className="space-y-2">
                      {activeBookings.map((booking: any) => {
                        const passenger = booking.passenger || booking.profiles;
                        let waNumber =
                          passenger?.phone_number?.replace(/[^0-9]/g, "") || "";
                        if (waNumber.startsWith("0"))
                          waNumber = "62" + waNumber.substring(1);

                        return (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-50"
                          >
                            <div className="flex items-center gap-3">
                              {passenger?.avatar_url ? (
                                <img
                                  src={passenger.avatar_url}
                                  alt="Passenger"
                                  className="w-10 h-10 rounded-full object-cover border border-indigo-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
                                  <User
                                    weight="duotone"
                                    className="w-5 h-5 text-indigo-300"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-800 text-sm leading-tight">
                                  {passenger?.full_name || "Pengguna"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${booking.status === "accepted" ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}
                                  >
                                    {booking.status === "accepted"
                                      ? "Disetujui"
                                      : "Menunggu"}
                                  </span>
                                  {/* Tombol In-App Chat dengan Lencana Unread */}
                                  {(() => {
                                    const unreadChatCount =
                                      booking.messages?.filter(
                                        (m: any) =>
                                          !m.is_read &&
                                          m.sender_id !== ride.driver_id,
                                      ).length || 0;
                                    return (
                                      <Link
                                        href={`/chat/${booking.id}`}
                                        className="relative text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-[11px] font-bold transition-colors bg-indigo-50 px-2 py-0.5 rounded-md"
                                      >
                                        💬 Chat
                                        {unreadChatCount > 0 && (
                                          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow-sm ring-2 ring-white animate-pulse">
                                            {unreadChatCount}
                                          </span>
                                        )}
                                      </Link>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Tombol Aksi Pengemudi */}
                            {booking.status === "pending" && isActive && (
                              <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                <form
                                  action={respondToBooking}
                                  className="flex-1 sm:flex-none"
                                >
                                  <input
                                    type="hidden"
                                    name="bookingId"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="rideId"
                                    value={ride.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="action"
                                    value="reject"
                                  />
                                  <button
                                    type="submit"
                                    className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Tolak
                                  </button>
                                </form>
                                <form
                                  action={respondToBooking}
                                  className="flex-1 sm:flex-none"
                                >
                                  <input
                                    type="hidden"
                                    name="bookingId"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="rideId"
                                    value={ride.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="action"
                                    value="approve"
                                  />
                                  <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  >
                                    Setujui
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TOMBOL STATUS TUMPANGAN (Action Buttons) ── */}
                {isActive && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {isPast && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            rideId: ride.id,
                            action: "selesai",
                            origin: ride.origin,
                            destination: ride.destination,
                          })
                        }
                        className="flex-1 bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle weight="bold" className="w-4 h-4" /> Tandai
                        Selesai
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setConfirmAction({
                          rideId: ride.id,
                          action: "dibatalkan",
                          origin: ride.origin,
                          destination: ride.destination,
                        })
                      }
                      className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle weight="bold" className="w-4 h-4" /> Batalkan
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          rideId: ride.id,
                          action: "delete",
                          origin: ride.origin,
                          destination: ride.destination,
                        })
                      }
                      className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center"
                      title="Hapus"
                    >
                      <Trash weight="bold" className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {!isActive && (
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setConfirmAction({
                          rideId: ride.id,
                          action: "delete",
                          origin: ride.origin,
                          destination: ride.destination,
                        })
                      }
                      className="bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <Trash weight="bold" className="w-4 h-4" /> Hapus Riwayat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 pb-4 sm:pb-0 transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmAction(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="mb-4">
              {confirmAction.action === "selesai" && (
                <CheckCircle
                  weight="duotone"
                  className="w-12 h-12 text-green-500 mb-3"
                />
              )}
              {confirmAction.action === "dibatalkan" && (
                <XCircle
                  weight="duotone"
                  className="w-12 h-12 text-orange-500 mb-3"
                />
              )}
              {confirmAction.action === "delete" && (
                <Trash
                  weight="duotone"
                  className="w-12 h-12 text-red-500 mb-3"
                />
              )}

              <h3 className="text-xl font-black text-gray-800 mb-2 tracking-tight">
                {confirmAction.action === "selesai" && "Tandai Selesai?"}
                {confirmAction.action === "dibatalkan" && "Batalkan Tumpangan?"}
                {confirmAction.action === "delete" && "Hapus Permanen?"}
              </h3>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 flex items-center gap-2 text-sm">
                <MapPin weight="fill" className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-700 truncate">
                  {confirmAction.origin}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold text-gray-700 truncate">
                  {confirmAction.destination}
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                {confirmAction.action === "selesai" &&
                  "Tumpangan akan ditandai sebagai selesai dan menjadi riwayat yang baik."}
                {confirmAction.action === "dibatalkan" &&
                  "Tumpangan akan dibatalkan. Penumpang yang sudah memesan akan diberitahu."}
                {confirmAction.action === "delete" &&
                  "Tumpangan ini akan dihapus permanen."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Kembali
              </button>

              {confirmAction.action === "delete" ? (
                <form
                  action={deleteRide}
                  className="flex-1"
                  onSubmit={() => setConfirmAction(null)}
                >
                  <input
                    type="hidden"
                    name="rideId"
                    value={confirmAction.rideId}
                  />
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Hapus
                  </button>
                </form>
              ) : (
                <form
                  action={updateRideStatus}
                  className="flex-1"
                  onSubmit={() => setConfirmAction(null)}
                >
                  <input
                    type="hidden"
                    name="rideId"
                    value={confirmAction.rideId}
                  />
                  <input
                    type="hidden"
                    name="status"
                    value={confirmAction.action}
                  />
                  <button
                    type="submit"
                    className={`w-full text-white font-bold py-3 rounded-xl transition-colors shadow-sm ${confirmAction.action === "selesai" ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}
                  >
                    {confirmAction.action === "selesai"
                      ? "Selesaikan"
                      : "Batalkan"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
