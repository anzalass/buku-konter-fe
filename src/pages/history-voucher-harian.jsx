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

const PERIODS = [
  { key: "hari", label: "Hari Ini" },
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
];

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function HistoryTransaksiVoucher() {
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
      const res = await api.get("history/voucher", {
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

  const exportToExcel = (data) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const formatted = data.map((d) => ({
      ID: d.id,
      Nama: d.namaPembeli || d.Member?.nama || "Umum",
      Tanggal: new Date(d.createdAt).toLocaleString("id-ID"),
      Total: d.hargaJual || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    XLSX.writeFile(workbook, "transaksi.xlsx");
  };

  const exportAllData = async () => {
    try {
      const res = await api.get("history/voucher", {
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

  //   const filtered = useMemo(() => {
  //     return DUMMY.filter((d) => {
  //       const matchNama = d.nama.toLowerCase().includes(search.toLowerCase());
  //       const tgl = new Date(d.tanggal);
  //       const s = start ? new Date(start) : null;
  //       const e = end ? new Date(end) : null;
  //       return matchNama && (!s || tgl >= s) && (!e || tgl <= e);
  //     });
  //   }, [search, start, end]);

  const inp =
    "bg-transparent border-none outline-none text-[11px] w-full placeholder:text-[#333240]";
  const dateInp =
    "px-2.5 py-2 rounded-xl text-[11px] appearance-none outline-none cursor-pointer";

  return (
    <div
      className="min-h-screen p-2 pb-20 max-w-7xl mx-auto"
      style={{
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
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
      </div>

      <div className="w-full mx-auto">
        {/* Topbar */}

        {/* Period tabs */}

        {/* Stats scroll */}
        {/* <div className="grid grid-cols-3 gap-1 mb-4">
          {[
            {
              label: "Total Trx",
              value: stats.totalTransaksi,
              color: "#9A8ACE",
            },
            {
              label: "Total Omset",
              value: fmt(stats.totalOmset),
              color: "#5A9ADE",
            },
            {
              label: "Keuntungan",
              value: fmt(stats.totalKeuntungan),
              color: "#5AC47A",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-2 py-2"
              style={{
                background: "#181820",
                border: "1px solid #232330",
              }}
            >
              <p
                className="text-[10px] md:text-[11px] mb-1"
                style={{ color: "#5A5868" }}
              >
                {s.label}
              </p>

              <p
                className="text-xs md:text-sm font-semibold tracking-tight"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div> */}

        <div className="w-full mx-auto mb-2">
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

        {/* Toolbar: count + buttons */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px]" style={{ color: "#5A5868" }}>
            {transaksi.length} transaksi
          </span>
          <div className="flex gap-1.5">
            {/* <button
              onClick={() => navigate("/dashboard/barang-keluar")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                background: "#0A1828",
                color: "#5A9ADE",
                border: "1px solid #1A2A48",
              }}
            >
              <FileText size={11} /> Barang Keluar
            </button> */}
            <button
              onClick={() => setOpenExport(true)} // 🔥 INI YANG KURANG
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

        {/* Barang Keluar section */}

        {/* Search + date filter */}
        <div className="rounded-xl px-3 dark:bg-[#181820] bg-white border-[1px] dark:border-gray-400 py-2.5 mb-4 flex items-center gap-2 dark:text-white text-black">
          <Search size={14} color="#4A4858" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pembeli..."
            className={`${inp} flex-1 dark:placeholder:text-white text-black dark:text-white`}
          />

          {/* 🔥 BUTTON FILTER */}
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
              const nama =
                d.namaPembeli ||
                d.Member?.nama ||
                (d.kategori && d.Member?.nama
                  ? `${d.kategori} ${d.Member.nama}`
                  : "Umum");
              const tanggal = new Date(d.tanggal).toLocaleDateString("id-ID");
              const total = d.totalHarga || 0;
              const keuntungan = d.keuntungan || 0;
              const items = d.items?.length || 0;
              return (
                <div
                  onClick={() =>
                    navigate(`/dashboard/detail/voucher-harian/${d.id}`)
                  }
                  key={d.id}
                  className="rounded-2xl px-4 py-3.5 dark:bg-[#181820] bg-white border-[1px] border-gray-400 dark:border-[#232330]"
                  // style={{ background: "#181820", border: "1px solid #232330" }}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs leading-7 md:text-sm dark:text-white text-green-800 font-bold">
                        {d?.Member
                          ? `Member: ${d?.Member?.nama} - ${d?.Produk?.nama}`
                          : d?.Produk?.brand +
                            " " +
                            "-" +
                            " " +
                            d?.Produk?.nama}
                        <span
                          className={`px-2 ${d.deletedAt ? "bg-red-200" : "bg-green-300"} ${d.deletedAt ? "text-red-800" : "text-green-700"} py-1 ml-3 rounded-md text-[10px] font-semibold`}
                          // style={{
                          //   background: d.deletedAt ? "#200808" : "#0A2012",
                          //   color: d.deletedAt ? "#D07070" : "#5AC47A",
                          // }}
                        >
                          {d.deletedAt ? "VOID" : "SUCSESS"}
                        </span>{" "}
                      </p>
                      <p className="text-[10px] md:text-[11px] mt-1 text-gray-900 dark:text-gray-200">
                        {new Date(d.createdAt).toLocaleString("id-ID", {
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
                      {/* <p className="text-xs text-blue-400 font-semibold">
                        Rp {d.nominal.toLocaleString("id-ID")}
                      </p> */}
                      <p className="text-[14px] md:text-[16px] mt-1.5 font-bold text-green-700">
                        +Rp {(d.keuntungan || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* 🔥 BUTTON SECTION */}
                  {/* <div className="flex gap-2 mt-3 pt-2 border-t border-[#232330]">
                    <button className="flex-1 text-[11px] bg-[#15163a] text-indigo-400 py-1.5 rounded-md">
                      Detail
                    </button>

                    <button className="flex-1 text-[11px] bg-[#0b2018] text-emerald-400 py-1.5 rounded-md">
                      Print
                    </button>

                    <button className="flex-1 text-[11px] bg-[#2a0a12] text-red-400 py-1.5 rounded-md">
                      Hapus
                    </button>
                  </div> */}
                </div>
              );
            })
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs rounded bg-[#252530] text-white disabled:opacity-50"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="text-xs text-gray-400">
            Page {page} / {totalPage || 1}
          </span>

          <button
            disabled={page === totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs rounded bg-[#252530] text-white disabled:opacity-50"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-5 shadow-xl
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    transition-all"
      >
        {/* Header */}
        <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-white">
          Filter Transaksi
        </h2>

        {/* STATUS */}
        <p className="text-xs mb-2 text-gray-500 dark:text-[#6A6870]">Status</p>
        <div className="flex gap-2 mb-4">
          {["active", "void"].map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252530] dark:text-[#6A6870] dark:hover:bg-[#2e2e3e]"
              }
            `}
              >
                {s.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* NAMA */}
        <p className="text-xs mb-2 text-gray-500 dark:text-[#6A6870]">
          Nama Pembeli
        </p>
        <input
          value={namaFilter}
          onChange={(e) => setNamaFilter(e.target.value)}
          placeholder="Cari nama..."
          className="w-full px-3 py-2 rounded-lg text-xs mb-4 outline-none transition
      bg-gray-50 text-gray-800 placeholder:text-gray-400
      border border-gray-200 focus:ring-2 focus:ring-indigo-500
      dark:bg-[#111118] dark:text-[#ECEAE3] dark:border-[#2A2A38] dark:placeholder:text-[#6A6870]"
        />

        {/* PERIODE */}
        <p className="text-xs mb-2 text-gray-500 dark:text-[#6A6870]">
          Periode
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["harian", "mingguan", "bulanan", "custom"].map((p) => {
            const active = periode === p;
            return (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`py-2 rounded-lg text-xs font-medium transition-all
              ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252530] dark:text-[#6A6870] dark:hover:bg-[#2e2e3e]"
              }
            `}
              >
                {p.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* CUSTOM DATE */}
        {periode === "custom" && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none
          bg-gray-50 border border-gray-200 text-gray-800
          focus:ring-2 focus:ring-indigo-500
          dark:bg-[#111118] dark:border-[#2A2A38] dark:text-[#ECEAE3]"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none
          bg-gray-50 border border-gray-200 text-gray-800
          focus:ring-2 focus:ring-indigo-500
          dark:bg-[#111118] dark:border-[#2A2A38] dark:text-[#ECEAE3]"
            />
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition
        bg-gray-100 text-gray-600 hover:bg-gray-200
        dark:bg-[#252530] dark:text-[#6A6870] dark:hover:bg-[#2e2e3e]"
          >
            Batal
          </button>

          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition
        bg-indigo-600 text-white hover:bg-indigo-700"
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
