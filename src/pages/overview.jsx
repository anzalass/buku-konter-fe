import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardKeuntungan() {
  const { user } = useAuthStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [periode, setPeriode] = useState("mingguan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isCustomReady = Boolean(startDate && endDate);
  const FIVE_HOURS = 1000 * 60 * 60 * 5;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-keuntungan", periode, startDate, endDate],
    queryFn: async () => {
      const res = await api.get("keuntungan-new", {
        params: { periode, startDate, endDate },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },

    enabled: !!user?.token && (periode !== "custom" || isCustomReady),
    staleTime: FIVE_HOURS,
    cacheTime: FIVE_HOURS,
    refetchOnWindowFocus: false,
    placeholderData: [],
    refetchOnReconnect: false,
    // refetchInterval: FIVE_HOURS, // optional
  });
  // 🔥 TOTAL UNTUK PIE
  const total = (data || []).reduce(
    (acc, item) => {
      acc.service += item.keuntunganService || 0;
      acc.penjualan += item.penjualan || 0;
      acc.jualanHarian += item.jualanHarian || 0;
      acc.voucher += item.voucherHarian || 0;
      return acc;
    },
    { service: 0, penjualan: 0, jualanHarian: 0, voucher: 0 }
  );

  const pieData = total
    ? [
        { name: "Service", value: total.service },
        { name: "Penjualan", value: total.penjualan },
        { name: "Harian", value: total.jualanHarian },
        { name: "Voucher", value: total.voucher },
      ]
    : [];

  useEffect(() => {
    if (periode === "custom" && !startDate && !endDate) {
      const now = new Date();
      const last7 = new Date();
      last7.setDate(now.getDate() - 7);

      setStartDate(last7.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    }
  }, [periode]);

  const cardStyle =
    "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)]";

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-3 sm:p-4 dark:text-white text-gray-900 transition-colors duration-300">
      {/* 🔥 HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <select
          value={periode}
          onChange={(e) => {
            const val = e.target.value;
            setPeriode(val);
            if (val !== "custom") {
              setStartDate("");
              setEndDate("");
            }
          }}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300 appearance-none shadow-sm"
        >
          <option value="harian">Harian</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {periode === "custom" && (!startDate || !endDate) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Pilih tanggal dulu untuk melihat data
        </p>
      )}

      {periode === "custom" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-300"
          />
        </div>
      )}

      {/* 🔥 METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {[
          {
            label: "Service",
            value: total.service,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Penjualan",
            value: total.penjualan,
            color: "text-indigo-600 dark:text-indigo-400",
          },
          {
            label: "Harian",
            value: total.jualanHarian,
            color: "text-yellow-600 dark:text-yellow-400",
          },
          {
            label: "Voucher",
            value: total.voucher,
            color: "text-red-600 dark:text-red-400",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
              {item.label}
            </p>
            <p className={`text-sm sm:text-lg font-bold mt-1 ${item.color}`}>
              Rp {item.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      {/* 🔥 SKELETON / CONTENT */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 sm:h-64 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {/* 🔥 LINE CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl shadow-sm transition-colors duration-300"
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Trend Keuntungan
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  stroke="#E5E7EB"
                />
                {!isMobile && (
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    stroke="#E5E7EB"
                  />
                )}
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F9FAFB",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="keuntunganService"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="penjualan"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="jualanHarian"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="voucherHarian"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 🔥 BAR CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl shadow-sm transition-colors duration-300"
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Perbandingan
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  stroke="#E5E7EB"
                />
                {!isMobile && (
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                    stroke="#E5E7EB"
                  />
                )}
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F9FAFB",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
                  }}
                />
                <Bar
                  dataKey="keuntunganService"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="penjualan" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar
                  dataKey="jualanHarian"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="voucherHarian"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 🔥 PIE CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl shadow-sm transition-colors duration-300"
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Distribusi
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F9FAFB",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 🔥 TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors duration-300"
          >
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Rincian Data
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-3 text-left font-medium">Tanggal</th>
                    <th className="p-3 text-right font-medium">Service</th>
                    <th className="p-3 text-right font-medium">Penjualan</th>
                    <th className="p-3 text-right font-medium">Harian</th>
                    <th className="p-3 text-right font-medium">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {data?.map((d, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-3 text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                        {d.tanggal}
                      </td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                        Rp {d.keuntunganService.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right text-indigo-600 dark:text-indigo-400 font-medium whitespace-nowrap">
                        Rp {d.penjualan.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right text-yellow-600 dark:text-yellow-400 font-medium whitespace-nowrap">
                        Rp {d.jualanHarian.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                        Rp {d.voucherHarian.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
