import { useState, useMemo, useEffect } from "react";
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
  Pencil,
  Printer,
  MessageCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const getMessageByStatus = (trx, status) => {
  const nama = trx.namaPelangan || "Customer";
  const brand = trx.brandHP || "-";
  const ket = trx.keterangan || "-";
  const biaya =
    (trx.biayaJasa + trx.hargaSparePart)?.toLocaleString("id-ID") || "0";

  return `Halo ${nama} 👋

📱 *Detail Service*
• HP : ${brand}
• Kerusakan : ${ket}
• Biaya : Rp ${biaya}

📌 *Status : ${status}*

${
  status === "Selesai"
    ? "✅ Service sudah selesai, silakan diambil ya 🙏"
    : status === "Proses"
      ? "🔧 Service sedang dalam proses"
      : status === "Pending"
        ? "⏳ Service masih pending"
        : status === "Gagal"
          ? "❌ Service tidak dapat dilanjutkan"
          : ""
}

Terima kasih sudah menggunakan layanan kami 🙏`;
};

const openWhatsApp = (phone, message) => {
  if (!phone) {
    Swal.fire({
      icon: "warning",
      title: "No HP kosong",
      text: "Nomor customer tidak tersedia",
    });
    return;
  }

  let formatted = phone
    .replace(/\D/g, "") // hapus semua selain angka
    .replace(/^0/, "62"); // ubah 08 → 628

  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};
export default function HistoryTransaksiService() {
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
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);

  const {
    data: serviceData,
    isLoading: loadingService,
    refetch,
  } = useQuery({
    queryKey: [
      "history-service",
      page,
      search,
      status,
      periode,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const res = await api.get("history/service", {
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

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`service-hp/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Service berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries(["history"]);
    },

    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus service",
      });
    },
  });

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data service akan dibatalkan & stok dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const exportToExcel = (data) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const formatted = data.map((d) => ({
      ID: d.id,
      Nama: d.namaPelangan || "Umum",
      HP: d.brandHP,
      Kerusakan: d.keterangan,
      Tanggal: new Date(d.tanggal).toLocaleString("id-ID"),
      BiayaJasa: d.biayaJasa || 0,
      SparePart: d.hargaSparePart || 0,
      Total: (d.biayaJasa || 0) + (d.hargaSparePart || 0),
      Keuntungan: d.keuntungan || 0,
      Status: d.deletedAt ? "VOID" : d.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Service");

    XLSX.writeFile(workbook, "service.xlsx");
  };

  const exportAllData = async () => {
    try {
      const res = await api.get("history/service", {
        params: {
          isExport: true,
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

  const services = serviceData?.data || [];
  const summary = serviceData?.summary || {};
  const totalPage = Math.ceil((serviceData?.total || 0) / 10);

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

  const statusStats = useMemo(() => {
    const result = {
      pending: 0,
      proses: 0,
      selesai: 0,
    };

    services.forEach((s) => {
      if (s.deletedAt) return; // skip VOID

      if (s.status === "Pending") result.pending++;
      else if (s.status === "Proses") result.proses++;
      else if (s.status === "Selesai") result.selesai++;
    });

    return result;
  }, [services]);

  const ITEMS = [
    {
      label: "Pending",
      value: statusStats.pending,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500",
    },
    {
      label: "Proses",
      value: statusStats.proses,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500",
    },
    {
      label: "Selesai",
      value: statusStats.selesai,
      color: "text-green-500 dark:text-green-400",
      bg: "bg-green-500",
    },
  ];

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
        {/* Topbar */}

        {/* Period tabs */}

        {/* Stats scroll */}
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
        {/* Toolbar: count + buttons */}
        <div className="flex mt-2 items-center justify-between mb-3">
          <span className="text-[10px]" style={{ color: "#5A5868" }}>
            {summary.totalTransaksi} transaksi
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

        {/* Barang Keluar section */}

        {/* Search + date filter */}
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
          {services.length === 0 ? (
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
            services.map((s) => {
              const nama = s.namaPelangan || "Umum";
              const hp = s.brandHP;
              const ket = s.keterangan;
              const totalHarga =
                parseInt(s.biayaJasa) + parseInt(s.hargaSparePart);

              return (
                <div
                  key={s.id}
                  className="rounded-2xl px-4 py-3.5 bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {nama}
                      </p>
                      <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {hp} • {ket}
                      </p>
                      <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(s.tanggal).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[13px] md:text-sm text-blue-600 dark:text-blue-400 font-semibold">
                        Rp {s.biayaJasa.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[12px] md:text-[11px] text-green-600 dark:text-green-400 mt-1 font-medium">
                        +Rp {(s.keuntungan || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-3">
                    {(() => {
                      const isVoid = s.deletedAt !== null;
                      const badgeClass = isVoid
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        : s.status === "Selesai"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : s.status === "Proses"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";

                      return (
                        <span
                          className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${badgeClass}`}
                        >
                          {isVoid ? "VOID" : s.status}
                        </span>
                      );
                    })()}
                  </div>

                  {/* ACTION */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-[#232330]">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/detail/service-hp/${s.id}`)
                      }
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                      title="Detail"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTrx(s);
                        setOpenStatus(true);
                      }}
                      className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                      title="Print"
                    >
                      <Printer size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => {
                        const message = getMessageByStatus(s, s.status);
                        openWhatsApp(s.noHP, message);
                      }}
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
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
      <ModalEditStatus
        open={openStatus}
        onClose={() => setOpenStatus(false)}
        trx={selectedTrx}
        token={user.token}
        refetch={refetch}
      />
      <ModalExport
        open={openExport}
        onClose={() => setOpenExport(false)}
        onExportFiltered={() => exportToExcel(services)}
        onExportAll={exportAllData}
      />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-3 z-50">
        <div className="rounded-xl bg-white dark:bg-[#13151f] border border-gray-200 dark:border-[#1e2130] p-3 shadow-lg backdrop-blur">
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-[#1e2130]">
            {ITEMS.map(({ label, value, color, bg }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <div className={`${bg} w-1.5 h-1.5 rounded-full`} />
                  <p className="text-[10px] text-gray-500 dark:text-[#6b7280]">
                    {label}
                  </p>
                </div>

                <p className={`${color} text-sm font-semibold`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
        className="w-full max-w-md rounded-2xl p-5 
    bg-white dark:bg-[#181820] 
    border border-gray-200 dark:border-[#2A2A38] 
    shadow-xl"
      >
        {/* HEADER */}
        <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-white">
          Filter Transaksi
        </h2>

        {/* STATUS */}
        <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">Status</p>
        <div className="flex gap-2 mb-4">
          {["active", "void"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
            ${
              status === s
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
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
          className="w-full px-3 py-2 rounded-lg text-xs mb-4 outline-none transition
        bg-gray-50 dark:bg-[#111118]
        border border-gray-200 dark:border-[#2A2A38]
        text-gray-800 dark:text-white
        placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
        focus:ring-2 focus:ring-indigo-500"
        />

        {/* PERIODE */}
        <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">Periode</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["harian", "mingguan", "bulanan", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`py-2 rounded-lg text-xs font-medium transition
            ${
              periode === p
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
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
              className="w-full px-2 py-2 rounded-lg text-xs outline-none
            bg-gray-50 dark:bg-[#111118]
            border border-gray-200 dark:border-[#2A2A38]
            text-gray-800 dark:text-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 rounded-lg text-xs outline-none
            bg-gray-50 dark:bg-[#111118]
            border border-gray-200 dark:border-[#2A2A38]
            text-gray-800 dark:text-white"
            />
          </div>
        )}

        {/* ACTION */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition
          bg-gray-100 dark:bg-[#252530]
          text-gray-600 dark:text-gray-400
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            Batal
          </button>

          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition
          bg-indigo-500 text-white hover:bg-indigo-600"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditStatus({ open, onClose, trx, token, refetch }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trx) {
      setStatus(trx.status || "");
    }
  }, [trx]);

  if (!open || !trx) return null;

  const STATUS_OPTIONS = ["Sukses", "Pending", "Gagal"];

  const handleSave = async () => {
    try {
      setLoading(true);

      await api.patch(
        `service-hp/${trx.id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      refetch();

      const message = getMessageByStatus(trx, status);
      openWhatsApp(trx.noHP, message);

      onClose();
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-xl
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    transition-all"
      >
        {/* Header */}
        <h2 className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">
          Edit Status
        </h2>
        <p className="text-xs mb-4 text-gray-500 dark:text-[#6A6870]">
          {trx.namaPembeli || trx.Member?.nama || "Transaksi"}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {["Selesai", "Proses", "Pending", "Gagal", "Batal"].map((s) => {
            const active = status === s;

            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all
              
              ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252530] dark:text-[#6A6870] dark:hover:bg-[#2e2e3e]"
              }
            `}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition
        bg-gray-100 text-gray-600 hover:bg-gray-200
        dark:bg-[#252530] dark:text-[#6A6870] dark:hover:bg-[#2e2e3e]"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition
          ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }
        `}
          >
            {loading ? "Menyimpan..." : "Simpan"}
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
