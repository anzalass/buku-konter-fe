import { Routes, Route, Navigate } from "react-router-dom";
// import LoginSiswa from "./pages/LoginSiswa";
import "./index.css"; // <-- import Tailwind global CSS di sini
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import DashboardLayout from "./components/dashboard-layout";
import TransaksiPage from "./pages/transaksi";

import LoginPage from "./pages/login";

import SuperAdminDashboard from "./pages/super-admin";
import LogPage from "./pages/log";
import KeuntunganPage from "./pages/keuntungan";
import TransaksiPageNew from "./pages/transaksi-new";
import Penggabungan from "./pages/penggabungan";
import Product from "./pages/data-product";
import MasterData from "./pages/master-data";
import HistoryTransaksi from "./pages/history";
import HistoryBarangKeluar from "./pages/barang-keluar";
import ServiceHPPage from "./pages/form-service-hp";
import Transaksi2 from "./pages/transaksi2";
import HistoryTransaksiService from "./pages/history-service";
import HistoryTransaksiHarian from "./pages/history-transaksi";
import HistoryTransaksiVoucher from "./pages/history-voucher-harian";
import DetailPenjualanVoucherHarian from "./pages/detail-penjualan-voucher-harian";
import DetailTransaksi from "./pages/detail-transaksi";
import DetailJualanHarian from "./pages/detail-jualan-harian";
import DetailService from "./pages/detail-service";
import DetailUangKeluar from "./pages/detail-uang-keluar";
import HistoryLogs from "./pages/log";
import SettingUser from "./pages/setting-user";
import MemberTransactionHistory from "./pages/member-trx";
import DashboardKeuntungan from "./pages/overview";
import LaporanUser from "./pages/user-record";
import { setTheme } from "./utils/helperTheme";
import PrintTransaksi from "./pages/print-trans-acc";
import PrintService from "./pages/print-service-hp";
import LandingPage from "./pages/landing-page";

function App() {
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    // 🔁 Cek sesi login saat app pertama kali dimuat
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LandingPage />} />

      <Route path="/super-admin" element={<SuperAdminDashboard />} />

      <Route path="/print-transaksi/:id" element={<PrintTransaksi />} />
      <Route path="/print-service/:id" element={<PrintService />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="new-transaksi" element={<TransaksiPageNew />} />
        <Route path="new-transaksi2" element={<Transaksi2 />} />
        <Route path="form-service" element={<ServiceHPPage />} />
        <Route path="penggabungan" element={<Penggabungan />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="history" element={<HistoryTransaksi />} />
        <Route path="logs" element={<HistoryLogs />} />
        <Route path="overview" element={<DashboardKeuntungan />} />
        <Route
          path="history/service"
          element={<HistoryTransaksiService />}
        />{" "}
        <Route path="history/trx" element={<HistoryTransaksiHarian />} />
        <Route
          path="history/voucher-harian"
          element={<HistoryTransaksiVoucher />}
        />
        <Route
          path="detail/voucher-harian/:id"
          element={<DetailPenjualanVoucherHarian />}
        />
        <Route path="detail/transaksi/:id" element={<DetailTransaksi />} />
        <Route
          path="detail/jualan-harian/:id"
          element={<DetailJualanHarian />}
        />
        <Route path="member/trx/:id" element={<MemberTransactionHistory />} />
        <Route path="detail/service-hp/:id" element={<DetailService />} />
        <Route path="detail/uang-keluar/:id" element={<DetailUangKeluar />} />
        <Route path="barang-keluar" element={<HistoryBarangKeluar />} />
        <Route path="product" element={<Product />} />
        <Route path="keuntungan" element={<KeuntunganPage />} />
        <Route path="log" element={<LogPage />} />
        <Route path="user" element={<SettingUser />} />
        <Route path="user/:id" element={<LaporanUser />} />
        <Route path="transaksi" element={<TransaksiPage />} />
      </Route>
    </Routes>
  );
}

export default App;
