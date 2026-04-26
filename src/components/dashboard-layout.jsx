// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import BottomNav from "./bottom-nav";
import { navItems } from "../data/nav-items";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { toggleTheme } from "../utils/helperTheme";

export default function DashboardLayout() {
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getLastPath = (pathname) => pathname.split("/").filter(Boolean).pop();

  const lastPath = getLastPath(location.pathname);

  useEffect(() => {
    fetchUser();
  }, []);

  const path = location.pathname;
  // hasil: ["", "dashboard", "detail", "service-hp", "id"]
  const segments = path.split("/");

  const type = segments[3]; // "service-hp"

  const formatTitle = () => {
    // 🔥 DETAIL PAGE
    if (segments[2] === "detail" && segments[3]) {
      const formatted = segments[3]
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return `Detail ${formatted}`;
    }

    // 🔥 MEMBER TRX
    if (segments[2] === "member" && segments[3] === "trx") {
      return "Riwayat Transaksi Member";
    }

    // 🔥 USER DETAIL (🔥 INI YANG LU BUTUH)
    if (segments[2] === "user" && segments[3]) {
      return "Analisa Performa User";
    }

    // 🔥 DEFAULT
    switch (lastPath) {
      case "penggabungan":
        return `${user.namaToko}`;
      case "new-transaksi":
        return "Mulai Transaksi";
      case "master-data":
        return "Master Data";
      case "history":
        return "History Penjualan";
      case "trx":
        return "History Transaksi";
      case "service":
        return "History Service";
      case "voucher-harian":
        return "Voucher Harian";
      case "barang-keluar":
        return "Barang Keluar";
      case "form-service":
        return "Service HP";
      case "product":
        return "Data Produk";
      case "logs":
        return "Log Aktivitas";
      case "user":
        return "Pengaturan";
      case "new-transaksi2":
        return "Transaksi";
      case "overview":
        return "Analisa Keuntungan";
      default:
        return "";
    }
  };
  // auto buka sidebar kalau desktop
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-white">
        Memeriksa sesi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0D0D10] transition-all duration-300 overflow-hidden">
      {/* ✅ Sidebar hanya desktop */}
      {/* {isDesktop && (
        <Sidebar
          navItems={navItems}
          sidebarOpen={sidebarOpen}
          isCollapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        />
      )} */}

      {/* ✅ Overlay mobile */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ CONTENT */}
      <div className="flex-1 flex flex-col w-full">
        {/* HEADER */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-green-600 dark:bg-indigo-800  px-3 py-3 md:px-4 md:py-3">
          <div className="flex items-center gap-3">
            {/* 🔥 BACK BUTTON */}

            {lastPath !== "penggabungan" ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <ArrowLeft className="dark:text-white" size={18} />
                </button>
              </>
            ) : null}
            {/* 
            {isDesktop && (
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="text-xl"
              >
                ☰
              </button>
            )} */}

            <h1 className="text-base md:text-lg font-semibold text-white dark:text-white">
              {formatTitle()}
            </h1>
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              onClick={() => navigate("/dashboard/user")}
              className="w-8 cursor-pointer h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
              }}
            >
              {user?.nama?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1  md:p-6 pb-20 overflow-x-hidden ">
          <Outlet />
        </main>

        {/* ✅ Bottom nav hanya mobile */}
        {/* {!isDesktop && <BottomNav />} */}
        <BottomNav />
      </div>
    </div>
  );
}

// import { toggleTheme } from "../utils/helperTheme";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const handleToggle = () => {
    const next = !isDark;

    // langsung set ke DOM
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setIsDark(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg 
      bg-gray-200 dark:bg-gray-700 
      hover:scale-95 transition"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  );
};
