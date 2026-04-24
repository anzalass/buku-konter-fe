import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

export default function MemberTransactionHistory() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [filterJenis, setFilterJenis] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["member-transactions", { id, token: user?.token }],
    queryFn: async () => {
      const res = await api.get(`/member/trx/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return res.data.data;
    },
    enabled: !!id && !!user?.token,
  });

  const transactions = data?.result || [];

  // 🔥 DATE RANGE
  const getDateRange = () => {
    const now = new Date();
    let start = new Date(0);
    let end = new Date(now);

    if (filterPeriod === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filterPeriod === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filterPeriod === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (filterPeriod === "custom" && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  // 🔥 FILTER
  const filtered = useMemo(() => {
    const { start, end } = getDateRange();

    return transactions.filter((trx) => {
      if (filterJenis !== "all" && trx.jenis !== filterJenis) return false;

      const tgl = new Date(trx.tanggal);
      return tgl >= start && tgl <= end;
    });
  }, [transactions, filterJenis, filterPeriod, customStart, customEnd]);

  // 🔥 TOTAL
  const totalKeuntungan = useMemo(() => {
    return filtered.reduce((sum, trx) => sum + (trx.keuntungan || 0), 0);
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto p-2 pb-20">
      {/* HEADER */}
      <div className="mb-4">
        <p className="text-base text-gray-600 dark:text-gray-400">
          {data?.nama || "-"}
        </p>
      </div>

      {/* SUMMARY */}
      <div
        className="mb-4 rounded-xl p-4 border transition-colors
    bg-green-50   dark dark:bg-indigo-700
    border-green-200 dark:border-green-800"
      >
        <p className="text-xs text-green-600 dark:text-green-300 mb-1">
          Total Keuntungan
        </p>
        <p className="text-xl font-bold text-green-600 dark:text-green-400">
          Rp {totalKeuntungan.toLocaleString("id-ID")}
        </p>
      </div>

      {/* FILTER PERIODE */}
      <div className="flex gap-2 overflow-x-auto mb-3">
        {["all", "today", "month", "year", "custom"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPeriod(p)}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors
        ${
          filterPeriod === p
            ? "bg-green-600 text-white"
            : "bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2f3245]"
        }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* CUSTOM DATE */}
      {filterPeriod === "custom" && (
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="w-full px-2 py-2 rounded-lg text-xs outline-none transition-colors
        bg-gray-50 dark:bg-[#111118]
        text-gray-800 dark:text-white
        border border-gray-200 dark:border-[#2A2A38]"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="w-full px-2 py-2 rounded-lg text-xs outline-none transition-colors
        bg-gray-50 dark:bg-[#111118]
        text-gray-800 dark:text-white
        border border-gray-200 dark:border-[#2A2A38]"
          />
        </div>
      )}

      {/* FILTER JENIS */}
      <div className="flex gap-2 overflow-x-auto mb-4">
        {["all", "voucher", "penjualan", "transaksi"].map((j) => (
          <button
            key={j}
            onClick={() => setFilterJenis(j)}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors
        ${
          filterJenis === j
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2f3245]"
        }`}
          >
            {j}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-2">
        {filtered.map((trx) => (
          <div
            key={trx.id}
            className="rounded-xl p-3 transition-colors
        bg-white dark:bg-[#181820]
        border border-gray-200 dark:border-[#232330]"
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {trx.jenis}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {new Date(trx.tanggal).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Untung
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Rp {trx.keuntungan?.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-2 border-t border-gray-200 dark:border-[#2a2a38] pt-2 space-y-1">
              {trx.items?.length > 0 ? (
                trx.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.nama} {item.qty ? `×${item.qty}` : ""}
                    </span>
                    {item.harga && (
                      <span className="text-gray-500">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic">
                  Tidak ada item
                </p>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Rp {trx.totalHarga?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
          Tidak ada transaksi
        </div>
      )}
    </div>
  );
}
