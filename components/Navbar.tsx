"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  SignOut,
  ShieldCheck,
  User,
  CarProfile,
  Ticket,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type NavbarProps = {
  userName?: string;
  avatarUrl?: string;
  showAdminLink?: boolean;
  currentUserId?: string; // Tambahan prop untuk melacak user
};

export default function Navbar({
  userName,
  avatarUrl,
  showAdminLink,
  currentUserId,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      // 1. Hitung pesanan masuk (sebagai pengemudi) yang statusnya pending
      const { data: myRides } = await supabase
        .from("rides")
        .select("id")
        .eq("driver_id", currentUserId);
      if (myRides && myRides.length > 0) {
        const rideIds = myRides.map((r) => r.id);
        const { count: pendingCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact" })
          .in("ride_id", rideIds)
          .eq("status", "pending");
        setPendingOrdersCount(pendingCount || 0);
      }

      // 2. Hitung pesan chat belum dibaca (yang bukan dikirim oleh kita)
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .neq("sender_id", currentUserId)
        .eq("is_read", false);
      setUnreadMessagesCount(unreadCount || 0);
    };

    fetchNotifications();

    // Realtime Listener
    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        fetchNotifications,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        fetchNotifications,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/home"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="bg-indigo-50 rounded-full p-0.5 shadow-sm border border-indigo-100 shrink-0">
            <Image
              src="/logo.png"
              alt="Mai-Milu"
              width={36}
              height={36}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-black text-xl leading-none tracking-tight text-indigo-700">
              Mai-Milu
            </h1>
            {userName ? (
              <p className="text-[11px] text-indigo-500 font-bold mt-0.5 truncate max-w-30 sm:max-w-50">
                Halo, {firstName}
              </p>
            ) : (
              <p className="text-[9px] text-indigo-400 font-bold tracking-wider mt-0.5 uppercase hidden sm:block">
                Bali Carpool
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
          <Link
            href="/my-rides"
            className={`relative flex items-center gap-1.5 text-sm font-bold transition-colors whitespace-nowrap ${pathname === "/my-rides" ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}
          >
            <CarProfile
              weight={pathname === "/my-rides" ? "fill" : "duotone"}
              className="w-6 h-6 sm:w-5 sm:h-5 shrink-0"
            />
            <span className="hidden sm:inline">Tumpangan</span>
            {/* Lencana Notifikasi Pengemudi */}
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {pendingOrdersCount}
              </span>
            )}
          </Link>

          <Link
            href="/my-bookings"
            className={`relative flex items-center gap-1.5 text-sm font-bold transition-colors whitespace-nowrap ${pathname === "/my-bookings" ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}
          >
            <Ticket
              weight={pathname === "/my-bookings" ? "fill" : "duotone"}
              className="w-6 h-6 sm:w-5 sm:h-5 shrink-0"
            />
            <span className="hidden sm:inline">Pesanan</span>
            {/* Lencana Notifikasi Penumpang (Chat Masuk) */}
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadMessagesCount}
              </span>
            )}
          </Link>

          {showAdminLink && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 text-sm font-bold transition-colors whitespace-nowrap ${pathname === "/admin" ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"}`}
            >
              <ShieldCheck
                weight={pathname === "/admin" ? "fill" : "duotone"}
                className="w-6 h-6 sm:w-5 sm:h-5 shrink-0"
              />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-gray-200 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName || "User"}
                className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                <User weight="duotone" className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-gray-200 hover:border-red-200"
              title="Keluar"
            >
              <span className="hidden sm:inline">Keluar</span>
              <SignOut
                weight="bold"
                className="w-4 h-4 sm:w-4 sm:h-4 shrink-0"
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
