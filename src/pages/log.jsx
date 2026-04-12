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
    <div className="p-2 text-white max-w-7xl mx-auto">
      {/* 🔥 FILTER */}
      <div className="space-y-2 mb-4">
        {/* NAMA (DROPDOWN) */}
        <select
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded bg-[#181820] border border-[#2A2A38]"
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
          className="w-full px-3 py-2 text-xs rounded bg-[#181820] border border-[#2A2A38]"
        >
          {KATEGORI_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        {/* KETERANGAN */}
        <input
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Cari keterangan..."
          className="w-full px-3 py-2 text-xs rounded bg-[#181820] border border-[#2A2A38]"
        />

        {/* DATE RANGE */}
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2 py-2 text-xs rounded bg-[#181820] border border-[#2A2A38]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-2 text-xs rounded bg-[#181820] border border-[#2A2A38]"
          />
        </div>
      </div>

      {/* 🔥 LIST */}
      {isLoading ? (
        <p className="text-xs text-gray-400 text-center">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-gray-500 text-center">Tidak ada data</p>
      ) : (
        <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#13151f] border border-[#1e2130] hover:border-[#2a2d42] transition"
            >
              {/* 🔹 ROW ATAS */}
              <div className="flex justify-between items-center gap-2">
                {/* kiri */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* BADGE */}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        log.kategori === "Pengeluaran"
                          ? "#2a0a12"
                          : log.kategori === "Transaksi"
                            ? "#0f2318"
                            : "#1e2130",
                      color:
                        log.kategori === "Pengeluaran"
                          ? "#f87171"
                          : log.kategori === "Transaksi"
                            ? "#34d399"
                            : "#9ca3af",
                    }}
                  >
                    {log.kategori}
                  </span>
                </div>

                {/* kanan (nominal) */}
                {log.nominal !== null && (
                  <span
                    className={`text-xs font-semibold ${
                      log.kategori === "Pengeluaran"
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    Rp {(log.nominal || 0).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* 🔹 NAMA */}
              <p className="text-xs font-medium text-[#c8cce0] mt-1 truncate">
                {log.nama}
              </p>

              {/* 🔹 KETERANGAN */}
              <p className="text-[11px] text-[#9095b0] mt-0.5 line-clamp-2">
                {log.keterangan}
              </p>

              {/* 🔹 FOOTER */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-[#4a4d62]">
                  {new Date(log.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                <span className="text-[10px] text-[#4a4d62]">
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
      <div className="flex justify-between items-center mt-4 text-xs">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-[#252530] rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          {page} / {pagination.totalPage || 1}
        </span>

        <button
          disabled={page === pagination.totalPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-[#252530] rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
