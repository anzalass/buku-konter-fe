import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

const KATEGORI_OPTIONS = [
  "all",
  "Transaksi",
  "Voucher",
  "Service",
  "Pengeluaran",
  "Login",
];

export default function HistoryLogs() {
  const { user } = useAuthStore();

  // =========================
  // STATE FILTER
  // =========================
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("all");
  const [keterangan, setKeterangan] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  // =========================
  // GET USER (DROPDOWN)
  // =========================
  const { data: users = [] } = useQuery({
    queryKey: ["users-toko"],
    queryFn: async () => {
      const res = await api.get("user-toko-master", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!user?.token,
  });

  // =========================
  // GET LOGS
  // =========================
  const { data, isLoading } = useQuery({
    queryKey: ["logs", nama, kategori, keterangan, startDate, endDate, page],
    queryFn: async () => {
      const res = await api.get("/logs", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          nama,
          kategori,
          keterangan,
          startDate,
          endDate,
          page,
          pageSize: 10,
        },
      });

      return res.data;
    },
    keepPreviousData: true,
    enabled: !!user?.token,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  // =========================
  // UI
  // =========================
  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 dark:text-white text-gray-900 transition-colors duration-300">
      {/* 🔥 FILTER */}
      <div className="grid grid-cols-2  gap-3 mb-4">
        {/* NAMA (DROPDOWN) */}
        <select
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
        >
          <option value="">Semua User</option>
          {users.map((u) => (
            <option key={u.id} value={u.nama}>
              {u.nama}
            </option>
          ))}
        </select>

        {/* KATEGORI */}
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
        >
          {KATEGORI_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        {/* KETERANGAN */}
      </div>
      <input
        value={keterangan}
        onChange={(e) => setKeterangan(e.target.value)}
        placeholder="Cari keterangan..."
        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
      />

      {/* DATE RANGE */}
      <div className="flex mt-2 gap-2 sm:col-span-2 lg:col-span-1">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
        />
      </div>

      {/* 🔥 LIST */}
      {isLoading ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">
          Loading...
        </p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">
          Tidak ada data
        </p>
      ) : (
        <div className="grid mt-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-white dark:bg-[#13151f] border border-gray-200 dark:border-[#1e2130] hover:dark:border-[#2a2d42] hover:border-gray-300 shadow-sm transition-all duration-300"
            >
              {/* 🔹 ROW ATAS */}
              <div className="flex justify-between items-center gap-2 mb-2">
                {/* kiri - BADGE */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    log.kategori === "Pengeluaran"
                      ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                      : log.kategori === "Transaksi"
                        ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {log.kategori}
                </span>

                {/* kanan (nominal) */}
                {log.nominal !== null && (
                  <span
                    className={`text-xs font-semibold ${
                      log.kategori === "Pengeluaran"
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    Rp {(log.nominal || 0).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* 🔹 NAMA */}
              <p className="text-xs font-medium dark:text-gray-200 text-gray-800 truncate">
                {log.nama}
              </p>

              {/* 🔹 KETERANGAN */}
              <p className="text-[11px] dark:text-gray-400 text-gray-600 mt-0.5 line-clamp-2">
                {log.keterangan}
              </p>

              {/* 🔹 FOOTER */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-[#1e2130]">
                <span className="text-[10px] dark:text-gray-500 text-gray-400">
                  {new Date(log.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <span className="text-[10px] dark:text-gray-500 text-gray-400">
                  {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 PAGINATION */}
      <div className="flex justify-between items-center mt-6 text-xs">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#252530] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2A2A38] hover:bg-gray-50 dark:hover:bg-[#2f3245] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Prev
        </button>

        <span className="dark:text-gray-400 text-gray-600 font-medium">
          {page} / {pagination.totalPage || 1}
        </span>

        <button
          disabled={page === pagination.totalPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#252530] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2A2A38] hover:bg-gray-50 dark:hover:bg-[#2f3245] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
