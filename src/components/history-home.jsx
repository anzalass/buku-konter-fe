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

const DEFAULT_BADGE = {
  bg: "#1e2130",
  text: "#9ca3af",
  dot: "#9ca3af",
};

const DEFAULT_ICON = <Receipt size={13} />;

const BADGE = {
  "Penjualan - eceran": { bg: "#0f2318", text: "#34d399", dot: "#34d399" },
  "Penjualan - grosir": { bg: "#0f2318", text: "#34d399", dot: "#34d399" },
  "Voucher Harian": { bg: "#0f2318", text: "#34d399", dot: "#34d399" },

  Pembelian: { bg: "#0c1a2e", text: "#60a5fa", dot: "#60a5fa" },
  Retur: { bg: "#1f1206", text: "#fb923c", dot: "#fb923c" },
  Pengeluaran: { bg: "#1f0a14", text: "#f472b6", dot: "#f472b6" },
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
      color: "#60a5fa",
    },
    {
      label: "Pengeluaran",
      nominal: summary.pengeluaran,
      color: "#f87171",
    },
    {
      label: "Keuntungan",
      nominal: summary.keuntungan,
      color: "#34d399",
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
    console.log(r);
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
    <div className="min-h-screen w-full pb-14 bg-[#0b0d14] text-[#c8cce0] px-0  font-[DM_Sans]">
      {/* Header */}

      <div className="grid grid-cols-3 gap-2 mb-3 ">
        {summaryCards?.map(({ label, nominal, color, trend }) => (
          <div
            onClick={() => nav("/dashboard/overview")}
            key={label}
            className="rounded-xl flex flex-col  gap-1.5"
            style={{
              background: "#13151f",
              border: "1px solid #2a2d3e",
              padding: "10px",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] md:text-sm" style={{ color: "white" }}>
                {label}
              </p>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: color }}
              />
            </div>
            <p
              className="text-[10px] md:text-base font-semibold tracking-tight"
              style={{ color }}
            >
              Rp {nominal.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onDetail(label)}
                className="flex items-center gap-1 text-[10px]  md:text-sm bg-transparent border-none cursor-pointer p-0"
                style={{ color }}
              >
                Lihat <ArrowRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col w-full gap-2 mb-3">
        {/* 🔹 Search (FULL) */}
        <div className="flex items-center gap-2 w-full bg-[#13151f] border border-[#1e2130] rounded-lg px-3 py-2">
          <Search size={14} className="text-[#3a3d52] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama / ID..."
            className="flex-1 min-w-0 bg-transparent outline-none text-xs text-[#c8cce0] placeholder:text-[#3a3d52]"
          />
        </div>

        <div className="flex gap-2">
          {/* Kategori */}
          <div className="relative w-full">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full appearance-none bg-[#13151f] border border-[#1e2130] rounded-lg px-3 pr-6 py-2 text-xs text-[#c8cce0]"
            >
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a3d52]"
            />
          </div>

          {/* Tanggal */}
          <div className="relative w-full" ref={tanggalRef}>
            <button
              onClick={() => setTanggalOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 bg-[#13151f] border border-[#1e2130] rounded-lg px-3 py-2 text-xs text-[#c8cce0]"
            >
              <div className="flex items-center gap-2">
                <CalendarDays size={13} className="text-[#3a3d52]" />
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
              <div className="absolute left-0 top-full mt-2 w-full bg-[#13151f] border border-[#1e2130] rounded-lg shadow-lg p-2 z-50">
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
                    className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-[#1e2130] ${
                      tanggalMode === opt ? "text-indigo-400" : "text-[#c8cce0]"
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
                        setCustomRange((p) => ({ ...p, from: e.target.value }))
                      }
                      className="bg-[#0b0d14] border border-[#1e2130] rounded px-2 py-1 text-xs"
                    />
                    <input
                      type="date"
                      value={customRange.to}
                      onChange={(e) =>
                        setCustomRange((p) => ({ ...p, to: e.target.value }))
                      }
                      className="bg-[#0b0d14] border border-[#1e2130] rounded px-2 py-1 text-xs"
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
      {/* Count */}
      <p className="text-[11px] text-[#3a3d52] mb-2">
        {filtered.length} transaksi ditemukan
      </p>

      {/* List */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#3a3d52] py-8">
            Tidak ada transaksi
          </p>
        )}

        {filtered?.map((r) => {
          const s = BADGE[r.kategori] || DEFAULT_BADGE;
          const icon = ICON_MAP[r.kategori] || DEFAULT_ICON;
          const { tgl, jam } = formatTs(r.ts);

          return (
            <div
              onClick={() => handleDetail(r)}
              key={r.id}
              className="bg-[#13151f] border border-[#1e2130] rounded-xl p-3 hover:border-[#2a2d42] transition"
            >
              {/* Row 1 */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* <span className="text-[11px] font-semibold text-[#4a4d62] font-mono truncate">
                    {r.id}
                  </span> */}

                  <span
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.text }}
                  >
                    <span style={{ color: s.dot }}>{icon}</span> {r.kategori}
                  </span>
                </div>

                <span
                  className={`text-xs md:text-sm font-semibold ${
                    r.kategori === "Pengeluaran" || r.kategori === "Pembelian"
                      ? "text-pink-400"
                      : "text-emerald-400"
                  }`}
                >
                  {(r.kategori === "Pengeluaran" || r.kategori === "Pembelian"
                    ? "−"
                    : "+") + formatRp(r.nominal)}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between mt-1">
                <span className="text-xs md:text-sm text-[#9095b0] font-medium truncate">
                  {r.nama}
                </span>
                <span className="text-[11px] text-[#9095b0] whitespace-nowrap">
                  {tgl} · {jam}
                </span>
              </div>

              {/* Actions */}
              {/* <div className="flex gap-2 mt-3 pt-2 border-t border-[#1a1c2a]">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] bg-[#15163a] text-indigo-400 py-1.5 rounded-md hover:opacity-80">
                  <Eye size={12} />
                  Detail
                </button>

                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] bg-[#0b2018] text-emerald-400 py-1.5 rounded-md hover:opacity-80">
                  <Printer size={12} />
                  Print
                </button>

                <button
                  onClick={() => confirmDelete(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] bg-[#2a0a12] text-red-400 py-1.5 rounded-md hover:opacity-80"
                >
                  <Trash2 size={12} />
                  Hapus
                </button>
              </div> */}
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
