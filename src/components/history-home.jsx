import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Printer,
  Trash2,
  Eye,
  ChevronDown,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CalendarDays,
  Clock,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const KATEGORI_OPTIONS = [
  "Semua",
  "Penjualan - eceran",
  "Penjualan - grosir",
  "Service",
  "Top-Up",
  "Tarik Tunai",
  "Transfer",
  "Voucher Harian",
  "PPOB",
  "Pengeluaran",
];

const DEFAULT_ICON = <Receipt size={13} />;
const DEFAULT_BADGE = {
  bg: "bg-gray-100 dark:bg-[#1e2130]",
  text: " dark:text-[#9ca3af]",
  dot: " dark:text-[#9ca3af]",
};

const BADGE = {
  "Penjualan - eceran": {
    bg: "bg-emerald-50 dark:bg-[#0f2318]",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "text-emerald-500 dark:text-emerald-400",
  },
  "Penjualan - grosir": {
    bg: "bg-emerald-50 dark:bg-[#0f2318]",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "text-emerald-500 dark:text-emerald-400",
  },
  "Voucher Harian": {
    bg: "bg-emerald-50 dark:bg-[#0f2318]",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "text-emerald-500 dark:text-emerald-400",
  },
  Pembelian: {
    bg: "bg-blue-50 dark:bg-[#0c1a2e]",
    text: "text-blue-600 dark:text-blue-400",
    dot: "text-blue-500 dark:text-blue-400",
  },
  Retur: {
    bg: "bg-orange-50 dark:bg-[#1f1206]",
    text: "text-orange-500 dark:text-orange-400",
    dot: "text-orange-400 dark:text-orange-400",
  },
  Pengeluaran: {
    bg: "bg-pink-50 dark:bg-[#1f0a14]",
    text: "text-pink-500 dark:text-pink-400",
    dot: "text-pink-400 dark:text-pink-400",
  },
};

const ICON_MAP = {
  "Penjualan - eceran": <TrendingUp size={13} />,
  "Penjualan - grosir": <TrendingUp size={13} />,
  "Voucher Harian": <Ticket size={13} />,

  Pembelian: <TrendingDown size={13} />,
  Retur: <RefreshCw size={13} />,
  Pengeluaran: <TrendingDown size={13} />,
};

function formatRp(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTs(ts) {
  const d = new Date(ts);
  const tgl = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { tgl, jam };
}

export default function HistoryTransaksiHome() {
  const { user } = useAuthStore();
  const nav = useNavigate();

  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [deleteId, setDeleteId] = useState(null);
  const [tanggalOpen, setTanggalOpen] = useState(false);
  const [tanggalMode, setTanggalMode] = useState("Hari Ini");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const tanggalRef = useRef(null);
  const mapPeriode = (mode) => {
    if (mode === "Hari Ini") return "harian";
    if (mode === "Minggu Ini") return "mingguan";
    if (mode === "Bulan Ini") return "bulanan";
    if (mode === "Custom") return "custom";
    return "harian";
  };

  const mapKategori = (k) => {
    switch (k) {
      case "Semua":
        return "all";
      case "Penjualan - eceran":
      case "Penjualan - grosir":
        return "penjualan";
      case "Voucher Harian":
        return "voucher";
      case "Service":
        return "service";
      case "Pengeluaran":
        return "pengeluaran";
      default:
        return "all";
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "history",
      tanggalMode,
      customRange.from,
      customRange.to,
      kategori, // 🔥 TAMBAHIN INI
    ],
    queryFn: async () => {
      const params = {
        periode: mapPeriode(tanggalMode),
        kategori: mapKategori(kategori), // 🔥 KIRIM KE BACKEND
      };

      if (tanggalMode === "Custom") {
        if (customRange.from) params.startDate = customRange.from;
        if (customRange.to) params.endDate = customRange.to;
      }

      const res = await api.get("dashboard3", {
        params,
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      return res.data;
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
    placeholderData: (prev) => prev,
  });

  const rows = data?.data || [];
  const summary = data?.summary || {
    pemasukan: 0,
    pengeluaran: 0,
    keuntungan: 0,
  };

  const summaryCards = [
    {
      label: "Pemasukan",
      nominal: summary.pemasukan,
      color: "text-blue-500",
      bg: "bg-blue-500",
    },
    {
      label: "Pengeluaran",
      nominal: summary.pengeluaran,
      color: "text-red-500",
      bg: "bg-red-500",
    },
    {
      label: "Keuntungan",
      nominal: summary.keuntungan,
      color: "text-green-500",
      bg: "bg-green-500",
    },
  ];
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ =
        !query.trim() ||
        r.nama.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());

      return matchQ;
    });
  }, [rows, query]);

  function doDelete() {
    setRows((p) => p.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  }

  const handleDetail = (r) => {
    if (r.type === "penjualan") {
      nav(`/dashboard/detail/transaksi/${r.id}`);
    } else if (r.type === "jualan-harian") {
      nav(`/dashboard/detail/jualan-harian/${r.id}`);
    } else if (r.type === "voucher") {
      nav(`/dashboard/detail/voucher-harian/${r.id}`);
    } else if (r.type === "service") {
      nav(`/dashboard/detail/service-hp/${r.id}`);
    } else if (r.type === "pengeluaran") {
      nav(`/dashboard/detail/uang-keluar/${r.id}`);
    }
  };

  // Tambahkan state dan logic berikut ke component kamu:

  const TANGGAL_OPTIONS = ["Hari Ini", "Minggu Ini", "Bulan Ini", "Custom"];

  useEffect(() => {
    const handler = (e) => {
      if (tanggalRef.current && !tanggalRef.current.contains(e.target))
        setTanggalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  {
    isLoading && (
      <p className="text-center text-xs text-[#3a3d52] py-4">Loading...</p>
    );
  }

  {
    isError && (
      <p className="text-center text-xs text-red-400 py-4">Gagal ambil data</p>
    );
  }

  return (
    <div className="min-h-screen w-full pb-14 dark:bg-[#0b0d14] dark:text-[#c8cce0]  px-0  font-[DM_Sans]">
      {/* Header */}
      <div className="bg-green-600 dark:bg-indigo-800 rounded-b-2xl p-4">
        <div className="rounded-xl relative bg-white dark:bg-[#13151f] border border-gray-600 dark:border-[#1e2130] p-4 mb-0 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-[#1e2130] mb-3">
            {summaryCards?.map(({ label, nominal, color, bg }) => (
              <div
                key={label}
                className="flex flex-col gap-1.5 px-4 first:pl-0 last:pr-0"
              >
                <div className="flex items-center gap-1.5">
                  <div className={`${bg} w-1.5 h-1.5 rounded-full shrink-0`} />
                  <p className="text-[12px] md:text-xs  dark:text-[#6b7280] truncate">
                    {label}
                  </p>
                </div>
                <p
                  className={`${color} text-[14px] md:text-sm font-semibold tracking-tight`}
                >
                  Rp {nominal.toLocaleString("id-ID")}
                </p>
                {/* Light mode accent bar */}
                <div className={`${bg} h-1 w-full rounded-full  dark:hidden`} />
              </div>
            ))}
          </div>

          <div className="absolute border-[#1e2130] pt-2.5 bottom-2 right-3">
            <button
              onClick={() => nav("/dashboard/overview")}
              className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 dark:text-[#6b7280] hover:text-gray-700 dark:hover:text-[#c8cce0] transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              Lihat Semua <ArrowRight size={9} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 rounded-xl w-full">
          <div className="flex flex-col w-full gap-2  px-6">
            {/* 🔹 Search (FULL) */}
            <div className="flex items-center gap-2 w-full dark:bg-[#13151f] border bg-white dark:border-[#1e2130] rounded-lg px-3 py-2">
              <Search size={14} className="text-[#3a3d52] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama / ID..."
                className="flex-1 min-w-0 bg-transparent outline-none text-xs dark:text-[#c8cce0] placeholder:text-[#3a3d52]"
              />
            </div>

            <div className="flex gap-2">
              {/* Kategori */}
              <div className="relative w-full">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full appearance-none dark:bg-[#13151f] border rounded-lg px-3 pr-6 py-2 text-xs dark:text-[#c8cce0]"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-[#3a3d52]"
                />
              </div>

              {/* Tanggal */}
              <div className="relative w-full" ref={tanggalRef}>
                <button
                  onClick={() => setTanggalOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 dark:bg-[#13151f] bg-white border  rounded-lg px-3 py-2 text-xs dark:text-[#c8cce0]"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={13} className="dark:text-[#3a3d52]" />
                    <span className="truncate">
                      {tanggalMode === "Custom" &&
                      (customRange.from || customRange.to)
                        ? `${customRange.from || "..."} – ${customRange.to || "..."}`
                        : tanggalMode}
                    </span>
                  </div>

                  <ChevronDown
                    size={12}
                    className={`text-[#3a3d52] transition-transform ${
                      tanggalOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 🔥 DROPDOWN PINDAH KE SINI */}
                {tanggalOpen && (
                  <div className="absolute left-0 top-full mt-2 w-full dark:bg-[#13151f] bg-white border border-[#1e2130] rounded-lg shadow-lg p-2 z-50">
                    {TANGGAL_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTanggalMode(opt);

                          // ❌ jangan langsung close kalau custom
                          if (opt !== "Custom") {
                            setTanggalOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md dark:hover:bg-[#1e2130] hover:bg-zinc-500${
                          tanggalMode === opt
                            ? "dark:text-indigo-400"
                            : "dark:text-[#c8cce0]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}

                    {/* Custom Range */}
                    {tanggalMode === "Custom" && (
                      <div className="mt-2 border-t border-[#1e2130] pt-2 flex flex-col gap-2">
                        <input
                          type="date"
                          value={customRange.from}
                          onChange={(e) =>
                            setCustomRange((p) => ({
                              ...p,
                              from: e.target.value,
                            }))
                          }
                          className="dark:bg-[#0b0d14] bg-white border border-[#1e2130] rounded px-2 py-1 text-xs"
                        />
                        <input
                          type="date"
                          value={customRange.to}
                          onChange={(e) =>
                            setCustomRange((p) => ({
                              ...p,
                              to: e.target.value,
                            }))
                          }
                          className="dark:bg-[#0b0d14] bg-white border border-[#1e2130] rounded px-2 py-1 text-xs"
                        />

                        {/* 🔥 BUTTON TERAPKAN */}
                        <button
                          onClick={() => {
                            setTanggalOpen(false); // close dropdown
                            // refetch otomatis karena queryKey berubah
                          }}
                          className="mt-1 py-1.5 rounded-md text-xs bg-indigo-500 text-white hover:opacity-90"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* 🔹 Select Kategori (FULL) */}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-[13px] text-[#3a3d52] px-4 py-2 mb-2">
        {filtered.length} transaksi ditemukan
      </p>

      {/* List */}
      <div className="flex flex-col px-2 md:grid md:grid-cols-3 gap-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm  dark:text-[#3a3d52] py-8">
            Tidak ada transaksi
          </p>
        )}

        {filtered?.map((r) => {
          const s = BADGE[r.kategori] || DEFAULT_BADGE;
          const icon = ICON_MAP[r.kategori] || DEFAULT_ICON;
          const { tgl, jam } = formatTs(r.ts);
          const isDebit =
            r.kategori === "Pengeluaran" || r.kategori === "Pembelian";

          return (
            <div
              onClick={() => handleDetail(r)}
              key={r.id}
              className="bg-white dark:bg-[#13151f] border border-gray-400 dark:border-[#1e2130] rounded-xl p-3 hover:border-gray-300 dark:hover:border-[#2a2d42] hover:shadow-sm dark:hover:shadow-none transition cursor-pointer"
            >
              {/* Row 1 */}
              <div className="flex justify-between items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}
                >
                  <span className={s.dot}>{icon}</span>
                  {r.kategori}
                </span>

                <span
                  className={`text-sm md:text-sm font-semibold ${
                    isDebit
                      ? "text-pink-500 dark:text-pink-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isDebit ? "−" : "+"}
                  {formatRp(r.nominal)}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between mt-1.5 gap-2">
                <span className="text-sm md:text-sm text-gray-500 dark:text-[#9095b0] font-medium truncate">
                  {r.nama}
                </span>
                <span className="text-[12px]  dark:text-[#9095b0] whitespace-nowrap">
                  {tgl} · {jam}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 px-4 pb-6">
          <div className="w-full max-w-sm bg-[#13151f] border border-[#1e2130] rounded-2xl p-5">
            <p className="text-sm font-semibold text-[#e2e4f0] mb-1">
              Hapus transaksi?
            </p>
            <p className="text-xs text-[#4a4d62] mb-4">
              <span className="text-[#9095b0] font-mono">{deleteId}</span> akan
              dihapus permanen.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-xs border border-[#1e2130] rounded-lg text-[#6b7080]"
              >
                Batal
              </button>
              <button
                onClick={doDelete}
                className="flex-1 py-2 text-xs rounded-lg bg-[#2a0a12] text-red-400 font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
