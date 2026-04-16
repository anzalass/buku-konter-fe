import { useEffect, useMemo } from "react";
import { Package, TrendingUp } from "lucide-react";
import { Filter, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";

const DUMMY_BARANG_KELUAR = [
  {
    nama: "5 GB 1 Hari · Axis",
    modal: 9000,
    jual: 11000,
    qty: 2,
  },
  {
    nama: "3 GB 3 Hari · XL",
    modal: 9000,
    jual: 12000,
    qty: 1,
  },
];

// const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function HistoryBarangKeluar() {
  const { user } = useAuthStore();

  const [openFilter, setOpenFilter] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [debouncedNama, setDebouncedNama] = useState("");
  const [kategori, setKategori] = useState("all");
  const [namaFilter, setNamaFilter] = useState("");
  const [qtyMin, setQtyMin] = useState("");
  const [periode, setPeriode] = useState("harian");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortQty, setSortQty] = useState("desc"); // desc = terbanyak

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNama(namaFilter), 500);
    return () => clearTimeout(t);
  }, [namaFilter]);
  const { data: dataBarang = [], isLoading } = useQuery({
    queryKey: [
      "barang-keluar",
      debouncedNama,
      qtyMin,
      periode,
      startDate,
      endDate,
      sortQty,
      kategori, // 🔥 TAMBAHIN
    ],
    queryFn: async () => {
      const res = await api.get("barang-keluar", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          search: namaFilter,
          qtyMin,
          periode,
          startDate,
          endDate,
          sort: sortQty,
          kategori, // 🔥 TAMBAHIN
        },
      });

      // 🔥 mapping + hitung untung
      return res.data.data.map((d) => ({
        ...d,
        untung: (d.jual - d.modal) * d.qty,
      }));
    },
    enabled: !!user?.token,
  });

  const totalQty = dataBarang.reduce((s, d) => s + d.qty, 0);
  const totalUntung = dataBarang.reduce((s, d) => s + d.untung, 0);
  console.log(dataBarang);

  // if (!dataBarang.length) {
  //   return (
  //     <div className="p-4 text-center text-gray-500 text-sm">
  //       Tidak ada data
  //     </div>
  //   );
  // }
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
    );
  }

  return (
    <div className="max-w-[430px] p-2 mx-auto">
      {/* Header */}

      {/* 🔥 ACTION BUTTON */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-gray-800 dark:text-zinc-200">
          {dataBarang.length} produk keluar
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setOpenFilter(true)}
            className="flex bg-blue-200 items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] text-blue-900"
            // style={{
            //   background: "#252530",
            //   color: "#ECEAE3",
            //   border: "1px solid #2A2A38",
            // }}
          >
            <Filter size={11} /> Filter
          </button>

          <button
            onClick={() => setOpenExport(true)}
            className="flex bg-green-200 text-green-800 items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px]"
            // style={{
            //   background: "#0A2012",
            //   color: "#5AC47A",
            //   border: "1px solid #1E3A28",
            // }}
          >
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      {/* 🔥 Stats */}
      {/* <div className="flex gap-2 mb-4">
        <div
          className="flex-1 rounded-xl px-3 py-2"
          style={{ background: "#181820", border: "1px solid #232330" }}
        >
          <p className="text-[9px] text-gray-400">Total Qty</p>
          <p className="text-sm font-semibold text-blue-400">{totalQty} pcs</p>
        </div>

        <div
          className="flex-1 rounded-xl px-3 py-2"
          style={{ background: "#181820", border: "1px solid #232330" }}
        >
          <p className="text-[9px] text-gray-400">Total Untung</p>
          <p className="text-sm font-semibold text-green-400">
            {fmt(totalUntung)}
          </p>
        </div>
      </div> */}

      {/* 🔥 List */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {dataBarang.map((b, i) => (
          <div
            key={i}
            className="rounded-xl bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] px-3 sm:px-4 py-2.5 transition-colors duration-300 hover:border-gray-300 dark:hover:border-[#2f3245]"
          >
            <div className="flex items-center justify-between gap-3">
              {/* kiri */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {b.brand} - {b.nama}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {/* Modal {fmt(b.modal)} · Jual {fmt(b.jual)} */}
                </p>
              </div>

              {/* kanan */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                    Qty
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">
                    {b.totalKeluar}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalFilterBarang
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={() => setOpenFilter(false)}
        nama={namaFilter}
        setNama={setNamaFilter}
        qtyMin={qtyMin}
        setQtyMin={setQtyMin}
        sortQty={sortQty}
        setSortQty={setSortQty}
        kategori={kategori} // 🔥
        setKategori={setKategori} // 🔥
        periode={periode}
        setPeriode={setPeriode}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />

      <ModalExport
        open={openExport}
        onClose={() => setOpenExport(false)}
        onExport={(type) => {
          console.log("EXPORT:", type);
          setOpenExport(false);
        }}
      />
    </div>
  );
}

function ModalFilterBarang({
  open,
  onClose,
  onApply,
  sortQty,
  setSortQty,
  kategori,
  setKategori,
  nama,
  setNama,
  qtyMin,
  setQtyMin,
  periode,
  setPeriode,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm transition-colors duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl p-4 sm:p-5 dark:bg-[#181820] bg-white dark:border-[#2A2A38] border-gray-200 border shadow-xl transition-colors duration-300">
        <h2 className="text-sm sm:text-base font-semibold mb-4 dark:text-white text-gray-900 pr-6">
          Filter Barang Keluar
        </h2>

        {/* Nama */}
        <p className="text-xs mb-1 dark:text-gray-400 text-gray-600 font-medium">
          Nama Barang
        </p>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-xs mb-3 dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
          placeholder="Cari nama..."
        />

        {/* Kategori */}
        <p className="text-xs mb-2 dark:text-gray-400 text-gray-600 font-medium">
          Kategori
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {["all", "Aksesoris", "Sparepart", "Handphone", "Voucher"].map(
            (k) => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                className={`py-2 rounded-lg text-xs capitalize font-medium transition-all active:scale-[0.98] ${
                  kategori === k
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200"
                }`}
              >
                {k}
              </button>
            )
          )}
        </div>

        {/* Sort Qty */}
        <p className="text-xs mb-2 dark:text-gray-400 text-gray-600 font-medium">
          Urutkan Qty
        </p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSortQty("desc")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
              sortQty === "desc"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200"
            }`}
          >
            Terbanyak
          </button>

          <button
            onClick={() => setSortQty("asc")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
              sortQty === "asc"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200"
            }`}
          >
            Tersedikit
          </button>
        </div>

        {/* Periode */}
        <p className="text-xs mb-2 dark:text-gray-400 text-gray-600 font-medium">
          Periode
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {["harian", "mingguan", "bulanan", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
                periode === p
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Custom date */}
        {periode === "custom" && (
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            />
          </div>
        )}

        {/* Action */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2a2d42] hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalExport({ open, onClose, onExport }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm transition-colors duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl p-4 sm:p-5 dark:bg-[#181820] bg-white dark:border-[#2A2A38] border-gray-200 border shadow-xl transition-colors duration-300">
        <h2 className="text-sm sm:text-base font-semibold mb-4 dark:text-white text-gray-900 pr-6">
          Export Data
        </h2>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onExport("filtered")}
            className="py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Export Sesuai Filter
          </button>

          <button
            onClick={() => onExport("all")}
            className="py-2 rounded-lg text-xs font-medium dark:bg-[#252530] bg-gray-100 dark:text-gray-300 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Export Semua Data
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 rounded-lg text-xs font-medium dark:text-gray-400 text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
