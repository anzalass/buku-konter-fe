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

const PERIODS = [
  { key: "hari", label: "Hari Ini" },
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
];

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function HistoryTransaksiHarian() {
  const { user } = useAuthStore();

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
      const res = await api.get("history/jualan-harian", {
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
      className="min-h-screen pb-20 max-w-7xl mx-auto"
      style={{
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-1.5  overflow-x-auto pb-0.5">
          {TABS.map((t) => {
            const active = location.pathname === t.path;

            return (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] md:text-[12px] font-medium transition-all"
                style={{
                  background: active ? "#ECEAE3" : "#181820",
                  color: active ? "#0D0D10" : "#fff",
                  border: active
                    ? "1px solid transparent"
                    : "1px solid #252530",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full mx-auto">
        {/* Topbar */}

        {/* Period tabs */}

        {/* Stats scroll */}
        <div className="grid grid-cols-3 gap-1 mb-4">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                background: "#0A2012",
                color: "#5AC47A",
                border: "1px solid #1E3A28",
              }}
            >
              <TrendingUp size={11} /> Export
            </button>
          </div>
        </div>

        {/* Barang Keluar section */}

        {/* Search + date filter */}
        <div
          className="rounded-xl px-3 py-2.5 mb-4 flex items-center gap-2"
          style={{ background: "#181820", border: "1px solid #232330" }}
        >
          <Search size={14} color="#4A4858" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pembeli..."
            className={`${inp} flex-1 placeholder:text-white`}
            style={{ color: "#ECEAE3" }}
          />

          {/* 🔥 BUTTON FILTER */}
          <button
            onClick={() => setOpenFilter(true)}
            className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background: "#252530",
              color: "#ECEAE3",
              border: "1px solid #2A2A38",
            }}
          >
            Filter
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-2">
          {transaksi.length === 0 ? (
            <div
              className="rounded-xl py-10 text-center"
              style={{ background: "#181820", border: "1px dashed #232330" }}
            >
              <p className="text-xs" style={{ color: "#4A4858" }}>
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
                    navigate(`/dashboard/detail/jualan-harian/${d.id}`)
                  }
                  key={d.id}
                  className="rounded-2xl px-4 py-3.5"
                  style={{ background: "#181820", border: "1px solid #232330" }}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs md:text-sm text-white">
                        {d.Member?.nama
                          ? `Member: ${d.Member.nama} - ${d.kategori}`
                          : d.kategori || "Transaksi"}
                      </p>
                      <p className="text-[10px] md:text-[11px] mt-1 text-gray-400">
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
                      {/* <p className="text-xs text-blue-400 font-semibold">
                        Rp {d.nominal.toLocaleString("id-ID")}
                      </p> */}
                      <p className="text-[10px] md:text-sm mt-1.5 text-green-400">
                        +Rp {(d.nominal || 0).toLocaleString("id-ID")}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl p-5"
        style={{
          background: "#181820",
          border: "1px solid #2A2A38",
        }}
      >
        <h2 className="text-sm font-semibold mb-4 text-white">
          Filter Transaksi
        </h2>

        {/* 🔥 STATUS */}
        <p className="text-xs mb-2 text-gray-400">Status</p>
        <div className="flex gap-2 mb-4">
          {["active", "void"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium`}
              style={{
                background: status === s ? "#4f46e5" : "#252530",
                color: status === s ? "#fff" : "#6A6870",
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 🔥 NAMA */}
        <p className="text-xs mb-2 text-gray-400">Nama Pembeli</p>
        <input
          value={namaFilter}
          onChange={(e) => setNamaFilter(e.target.value)}
          placeholder="Cari nama..."
          className="w-full px-3 py-2 rounded-lg text-xs mb-4"
          style={{
            background: "#111118",
            border: "1px solid #2A2A38",
            color: "#ECEAE3",
          }}
        />

        {/* 🔥 PERIODE */}
        <p className="text-xs mb-2 text-gray-400">Periode</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["harian", "mingguan", "bulanan", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className="py-2 rounded-lg text-xs"
              style={{
                background: periode === p ? "#4f46e5" : "#252530",
                color: periode === p ? "#fff" : "#6A6870",
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 🔥 CUSTOM DATE */}
        {periode === "custom" && (
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-2 rounded-lg text-xs"
              style={{
                background: "#111118",
                border: "1px solid #2A2A38",
                color: "#ECEAE3",
              }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 rounded-lg text-xs"
              style={{
                background: "#111118",
                border: "1px solid #2A2A38",
                color: "#ECEAE3",
              }}
            />
          </div>
        )}

        {/* 🔥 ACTION */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs"
            style={{
              background: "#252530",
              color: "#6A6870",
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-2 rounded-lg text-xs"
            style={{
              background: "#ECEAE3",
              color: "#0D0D10",
            }}
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
