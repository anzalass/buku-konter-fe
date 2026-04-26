import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Trash2,
  FileText,
  TrendingUp,
  Hash,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import * as XLSX from "xlsx";

const DUMMY = [
  {
    id: 1,
    nama: "Budi",
    tanggal: "2026-03-20",
    total: 120000,
    keuntungan: 15000,
    items: 3,
    status: "Sukses",
  },
  {
    id: 2,
    nama: "Siti",
    tanggal: "2026-03-21",
    total: 85000,
    keuntungan: 10000,
    items: 2,
    status: "Pending",
  },
  {
    id: 3,
    nama: "Andi",
    tanggal: "2026-03-22",
    total: 200000,
    keuntungan: 30000,
    items: 5,
    status: "Sukses",
  },
];

export default function HistoryTransaksi() {
  const { user } = useAuthStore();

  const [openExport, setOpenExport] = useState(false);

  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [period, setPeriod] = useState("hari");
  const [showBk, setShowBk] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [status, setStatus] = useState("active"); // active | void
  const [periode, setPeriode] = useState("harian");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [namaFilter, setNamaFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transaksi", page, search, status, periode, startDate, endDate],
    queryFn: async () => {
      const res = await api.get("history/transaksi", {
        params: {
          search,
          isActive: status === "active",
          periode,
          startDate,
          endDate,
          page,
          pageSize: 10,
        },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      return res.data;
    },
    enabled: !!user?.token,
  });

  const transaksi = data?.data || [];
  const summary = data?.summary || {};
  const totalPage = Math.ceil((data?.total || 0) / 10);

  const stats = {
    totalTransaksi: summary.totalData || 0,
    totalOmset: summary.omset || 0,
    totalKeuntungan: summary.keuntungan || 0,
  };

  const navigate = useNavigate();
  const location = useLocation();

  const TABS = [
    { path: "/dashboard/history", label: "Penjualan" },
    { path: "/dashboard/history/trx", label: "Transaksi" },
    { path: "/dashboard/history/service", label: "Service" },
    { path: "/dashboard/history/voucher-harian", label: "Voucher Harian" },
  ];

  const exportToCSV = (data) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const headers = ["ID", "Nama", "Tanggal", "Total", "Keuntungan"];

    const rows = data.map((d) => [
      d.id,
      d.namaPembeli || d.Member?.nama || "Umum",
      new Date(d.tanggal).toLocaleString("id-ID"),
      d.totalHarga || 0,
      d.keuntungan || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaksi.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const formatted = data.map((d) => ({
      ID: d.id,
      Nama: d.namaPembeli || d.Member?.nama || "Umum",
      Tanggal: new Date(d.tanggal).toLocaleString("id-ID"),
      Total: d.totalHarga || 0,
      Keuntungan: d.keuntungan || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    XLSX.writeFile(workbook, "transaksi.xlsx");
  };

  const exportAllData = async () => {
    try {
      const res = await api.get("history/transaksi", {
        params: {
          isExport: true, // ✅ cukup ini
        },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      exportToExcel(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };
  const filtered = useMemo(() => {
    return DUMMY.filter((d) => {
      const matchNama = d.nama.toLowerCase().includes(search.toLowerCase());
      const tgl = new Date(d.tanggal);
      const s = start ? new Date(start) : null;
      const e = end ? new Date(end) : null;
      return matchNama && (!s || tgl >= s) && (!e || tgl <= e);
    });
  }, [search, start, end]);

  const inp =
    "bg-transparent border-none outline-none text-[11px] w-full placeholder:text-[#333240]";
  const dateInp =
    "px-2.5 py-2 rounded-xl text-[11px] appearance-none outline-none cursor-pointer";

  return (
    <div className="min-h-screen pb-20 p-2 max-w-7xl mx-auto">
      {/* TABS */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map((t) => {
            const active = location.pathname === t.path;
            return (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] md:text-[12px] font-medium transition-all border
              ${
                active
                  ? "bg-green-700 dark:bg-[#ECEAE3] text-white dark:text-[#0D0D10] border-transparent"
                  : "bg-white dark:bg-[#181820] text-gray-600 dark:text-white border-gray-200 dark:border-[#252530] hover:bg-gray-400 dark:hover:bg-[#222232]"
              }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="w-full mx-auto">
          <div className="rounded-xl relative bg-white dark:bg-[#13151f] border border-gray-200 dark:border-[#1e2130] p-4 shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-[#1e2130]">
              {[
                {
                  label: "Total Trx",
                  value: stats.totalTransaksi,
                  color: "text-violet-500 dark:text-[#9A8ACE]",
                  bg: "bg-violet-500",
                },
                {
                  label: "Total Omset",
                  value: stats.totalOmset,
                  color: "text-blue-500 dark:text-[#5A9ADE]",
                  bg: "bg-blue-500",
                },
                {
                  label: "Keuntungan",
                  value: stats.totalKeuntungan,
                  color: "text-emerald-500 dark:text-[#5AC47A]",
                  bg: "bg-emerald-500",
                },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 px-4 first:pl-0 last:pr-0"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`${bg} w-1.5 h-1.5 rounded-full`} />
                    <p className="text-[11px] text-gray-500 dark:text-[#6b7280] truncate">
                      {label}
                    </p>
                  </div>

                  <p
                    className={`${color} text-sm font-semibold tracking-tight`}
                  >
                    {typeof value === "number"
                      ? `Rp ${value.toLocaleString("id-ID")}`
                      : value}
                  </p>

                  {/* accent bar (light only) */}
                  <div
                    className={`${bg} h-1 w-full rounded-full dark:hidden`}
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
          </div>
        </div>
        {/* Toolbar */}
        <div className="flex items-center mt-2 justify-between mb-3">
          <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
            {transaksi.length} transaksi
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setOpenExport(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer transition-colors
  bg-emerald-50 dark:bg-[#0A2012]
  text-emerald-600 dark:text-[#5AC47A]
  border border-emerald-200 dark:border-[#1E3A28]
  hover:bg-emerald-100 dark:hover:bg-[#0e2a18]"
            >
              <TrendingUp size={11} /> Export
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div
          className="rounded-xl mt-2 px-3 py-2.5 mb-4 flex items-center gap-2
      bg-white dark:bg-[#181820]
      border border-gray-400 dark:border-[#232330]"
        >
          <Search
            size={14}
            className="text-gray-400 dark:text-[#4A4858] shrink-0"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pembeli..."
            className="flex-1 bg-transparent outline-none text-sm
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]"
          />
          <button
            onClick={() => setOpenFilter(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors
          bg-green-800 dark:bg-[#252530]
          text-white hover:bg-green-500 dark:text-[#ECEAE3]
          border border-gray-200 dark:border-[#2A2A38]
           dark:hover:bg-[#2e2e3e]"
          >
            Filter
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
          {transaksi.length === 0 ? (
            <div
              className="rounded-xl py-10 text-center
          bg-white dark:bg-[#181820]
          border border-dashed border-gray-200 dark:border-[#232330]"
            >
              <p className="text-xs text-gray-400 dark:text-[#4A4858]">
                Tidak ada data
              </p>
            </div>
          ) : (
            transaksi.map((d) => {
              const nama = d.namaPembeli || d.Member?.nama || "Umum";
              return (
                <div
                  onClick={() =>
                    navigate(`/dashboard/detail/transaksi/${d.id}`)
                  }
                  key={d.id}
                  className="rounded-2xl px-4 py-3.5 cursor-pointer transition-colors
                bg-white dark:bg-[#181820]
                border border-gray-400 dark:border-[#232330]
                hover:border-gray-300 dark:hover:border-[#383848]"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs md:text-sm text-gray-800 dark:text-white">
                          {nama}
                        </p>
                        {d.deletedAt && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold
                        bg-red-50 dark:bg-[#200808]
                        text-red-400 dark:text-[#D07070]"
                          >
                            VOID
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] md:text-[11px] mt-1 text-gray-700">
                        {new Date(d.tanggal).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-12 md:text-sm text-blue-500 dark:text-blue-400 font-semibold">
                        Rp {(d?.totalHarga || 0).toLocaleString("id-ID")}
                      </p>
                      <p className="text-[12px] md:text-sm mt-1.5 text-emerald-500 dark:text-emerald-400">
                        +Rp {(d?.keuntungan || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs rounded cursor-pointer transition-colors
          bg-gray-400 dark:bg-[#252530]
          text-gray-700 dark:text-white
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]
          disabled:opacity-50"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="text-xs text-gray-400">
            Page {page} / {totalPage || 1}
          </span>

          <button
            disabled={page === totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs rounded cursor-pointer transition-colors
          bg-gray-400 dark:bg-[#252530]
          text-gray-700 dark:text-white
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]
          disabled:opacity-50"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <ModalFilter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={() => {
          setPage(1);
          refetch();
        }}
        status={status}
        setStatus={setStatus}
        periode={periode}
        setPeriode={setPeriode}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        namaFilter={namaFilter}
        setNamaFilter={setNamaFilter}
      />

      <ModalExport
        open={openExport}
        onClose={() => setOpenExport(false)}
        onExportFiltered={() => exportToExcel(transaksi)}
        onExportAll={exportAllData}
      />
    </div>
  );
}

function ModalFilter({
  open,
  onClose,
  onApply,
  status,
  setStatus,
  periode,
  setPeriode,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  namaFilter,
  setNamaFilter,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl p-5 bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] shadow-xl">
        <h2 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
          Filter Transaksi
        </h2>

        {/* STATUS */}
        <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">Status</p>
        <div className="flex gap-2 mb-4">
          {["active", "void"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                status === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-[#252530] text-gray-400 dark:text-[#6A6870] hover:bg-gray-200 dark:hover:bg-[#2e2e3d]"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* NAMA */}
        <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">
          Nama Pembeli
        </p>
        <input
          value={namaFilter}
          onChange={(e) => setNamaFilter(e.target.value)}
          placeholder="Cari nama..."
          className="w-full px-3 py-2 rounded-lg text-xs mb-4 bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />

        {/* PERIODE */}
        <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">Periode</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["harian", "mingguan", "bulanan", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                periode === p
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-[#252530] text-gray-400 dark:text-[#6A6870] hover:bg-gray-200 dark:hover:bg-[#2e2e3d]"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CUSTOM DATE */}
        {periode === "custom" && (
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-2 rounded-lg text-xs bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 rounded-lg text-xs bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-[#252530] text-gray-500 dark:text-[#6A6870] hover:bg-gray-200 dark:hover:bg-[#2e2e3d] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-2 rounded-lg text-xs font-medium bg-gray-900 dark:bg-[#ECEAE3] text-white dark:text-[#0D0D10] hover:opacity-90 transition-opacity"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalExport({ open, onClose, onExportFiltered, onExportAll }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl p-5 bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38]">
        <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-white">
          Export Data
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Pilih jenis data yang ingin di-export
        </p>

        <div className="flex flex-col gap-2">
          {/* FILTER */}
          <button
            onClick={() => {
              onExportFiltered();
              onClose();
            }}
            className="w-full py-2 rounded-lg text-xs font-medium
            bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            Export Sesuai Filter
          </button>

          {/* ALL */}
          <button
            onClick={() => {
              onExportAll();
              onClose();
            }}
            className="w-full py-2 rounded-lg text-xs font-medium
            bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Export Semua Data
          </button>

          {/* CANCEL */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-xs font-medium
            bg-gray-200 dark:bg-[#252530]
            text-gray-700 dark:text-gray-300"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
