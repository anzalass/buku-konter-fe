import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function LaporanUser() {
  const { user } = useAuthStore();
  const { id } = useParams();
  const nav = useNavigate();

  const [kategori, setKategori] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isReady = startDate && endDate;

  useEffect(() => {
    if (!startDate && !endDate) {
      const now = new Date();
      const last7 = new Date();
      last7.setDate(now.getDate() - 7);

      setStartDate(last7.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    }
  }, []);

  // 🔥 FETCH
  const { data, isLoading } = useQuery({
    queryKey: ["laporan-user", kategori, startDate, endDate],
    queryFn: async () => {
      const res = await api.get(`laporan-user/${id}`, {
        params: { kategori, startDate, endDate },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data;
    },
    enabled: !!user?.token && !!id && (!!isReady || (!startDate && !endDate)),
  });

  // 🔥 GABUNGIN DATA BIAR KE TABLE
  const mergedData = [
    ...(data?.data?.transaksi || []).map((d) => ({
      id: d.id,
      tanggal: d.tanggal,
      kategori: "Transaksi",
      nominal: d.totalHarga,
      keuntungan: d.keuntungan,
    })),
    ...(data?.data?.service || []).map((d) => ({
      id: d.id,
      tanggal: d.tanggal,
      kategori: "Service",
      nominal: d.biayaJasa,
      keuntungan: d.keuntungan,
    })),
    ...(data?.data?.jualan || []).map((d) => ({
      id: d.id,
      tanggal: d.tanggal,
      kategori: "Jualan",
      nominal: d.nominal,
      keuntungan: d.nominal,
    })),
    ...(data?.data?.voucher || []).map((d) => ({
      id: d.id,
      tanggal: d.createdAt,
      kategori: "Voucher",
      nominal: d.keuntungan,
      keuntungan: d.keuntungan,
    })),
  ];

  // 🔥 EXPORT PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text("Laporan User", 14, 10);

    autoTable(doc, {
      head: [["Tanggal", "Kategori", "Nominal", "Keuntungan"]],
      body: mergedData.map((d) => [
        new Date(d.tanggal).toLocaleDateString("id-ID"),
        d.kategori,
        `Rp ${Number(d.nominal || 0).toLocaleString("id-ID")}`,
        `Rp ${Number(d.keuntungan || 0).toLocaleString("id-ID")}`,
      ]),
    });

    doc.save("laporan-user.pdf");
  };

  const handleDetail = (r) => {
    console.log(r);

    if (r.kategori === "Transaksi") {
      nav(`/dashboard/detail/transaksi/${r.id}`);
    } else if (r.kategori === "Jualan") {
      nav(`/dashboard/detail/jualan-harian/${r.id}`);
    } else if (r.kategori === "Voucher") {
      nav(`/dashboard/detail/voucher-harian/${r.id}`);
    } else if (r.kategori === "Service") {
      nav(`/dashboard/detail/service-hp/${r.id}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 dark:text-white text-gray-900 space-y-4">
      {/* 🔥 HEADER */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <button
          onClick={handleExportPDF}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition active:scale-[0.98] shadow-md shadow-green-600/20"
        >
          Export PDF
        </button>

        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300"
        >
          <option value="all">Semua</option>
          <option value="transaksi">Transaksi</option>
          <option value="service">Service</option>
          <option value="jualan">Jualan</option>
          <option value="voucher">Voucher</option>
        </select>
      </div>

      {/* 🔥 FILTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300"
        />
      </div>

      {/* 🔥 SUMMARY */}
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] p-3 sm:p-4 rounded-xl shadow-sm transition-colors duration-300">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Transaksi
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
              {data.summary.totalTransaksi}
            </p>
          </div>

          <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] p-3 sm:p-4 rounded-xl shadow-sm transition-colors duration-300">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total Keuntungan
            </p>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-1">
              Rp {data.summary.totalKeuntungan.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}

      {/* 🔥 TABLE */}
      <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-[#111118] border-b border-gray-200 dark:border-[#2A2A38]">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600 dark:text-gray-400">
                  Tanggal
                </th>
                <th className="p-3 text-left font-semibold text-gray-600 dark:text-gray-400">
                  Kategori
                </th>
                <th className="p-3 text-right font-semibold text-gray-600 dark:text-gray-400">
                  Nominal
                </th>
                <th className="p-3 text-right font-semibold text-gray-600 dark:text-gray-400">
                  Keuntungan
                </th>
                <th className="p-3 text-center font-semibold text-gray-600 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A38]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : mergedData.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                mergedData.map((d, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 dark:hover:bg-[#1a1a24] transition-colors"
                  >
                    <td className="p-3 text-gray-900 dark:text-gray-200 whitespace-nowrap">
                      {new Date(d.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 text-gray-900 dark:text-gray-200 capitalize">
                      {d.kategori}
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                      Rp {Number(d.nominal || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-right text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                      Rp {Number(d.keuntungan || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDetail(d)}
                        className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-[10px] font-medium transition active:scale-[0.98]"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
