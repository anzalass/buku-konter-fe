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
    <div className="p-2 space-y-4 text-white">
      {/* 🔥 HEADER */}
      <div className="flex flex-row gap-2 md:items-center md:justify-between">
        <button
          onClick={handleExportPDF}
          className="bg-green-500 px-4 py-2 rounded-lg text-xs"
        >
          Export PDF
        </button>

        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="bg-[#181820] border border-[#2A2A38] text-xs p-2 rounded-lg"
        >
          <option value="all">Semua</option>
          <option value="transaksi">Transaksi</option>
          <option value="service">Service</option>
          <option value="jualan">Jualan</option>
          <option value="voucher">Voucher</option>
        </select>
      </div>

      {/* 🔥 FILTER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-[#181820] border border-[#2A2A38] text-xs p-2 rounded-lg"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-[#181820] border border-[#2A2A38] text-xs p-2 rounded-lg"
        />
      </div>

      {/* 🔥 SUMMARY */}
      {data?.summary && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#181820] p-3 rounded-xl">
            <p className="text-xs text-gray-400">Total Transaksi</p>
            <p className="text-lg font-bold">{data.summary.totalTransaksi}</p>
          </div>

          <div className="bg-[#181820] p-3 rounded-xl">
            <p className="text-xs text-gray-400">Total Keuntungan</p>
            <p className="text-lg font-bold text-green-400">
              Rp {data.summary.totalKeuntungan.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}

      {/* 🔥 TABLE */}
      <div className="bg-[#181820] rounded-xl overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#111118]">
            <tr>
              <th className="p-2">Tanggal</th>
              <th>Kategori</th>
              <th>Nominal</th>
              <th>Keuntungan</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : mergedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              mergedData.map((d, i) => (
                <tr key={i} className="text-center border-t border-[#2A2A38]">
                  <td className="p-2">
                    {new Date(d.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td>{d.kategori}</td>
                  <td>Rp {Number(d.nominal || 0).toLocaleString("id-ID")}</td>
                  <td className="text-green-400">
                    Rp {Number(d.keuntungan || 0).toLocaleString("id-ID")}
                  </td>
                  <td
                    className="cursor-pointer"
                    onClick={() => handleDetail(d)}
                  >
                    detail
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
