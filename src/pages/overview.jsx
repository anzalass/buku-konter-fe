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
    <div className="min-h-screen max-w-7xl mx-auto p-2  text-white">
      {" "}
      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-4">
        {/* <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Dashboard Keuntungan
          </h1>
          <p className="text-[11px] text-gray-400">
            Monitoring performa bisnis
          </p>
        </div> */}

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
          className="bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-xl backdrop-blur-lg"
        >
          <option value="harian">Harian</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {periode === "custom" && (!startDate || !endDate) && (
        <p className="text-xs text-gray-500 mt-2">
          Pilih tanggal dulu untuk melihat data
        </p>
      )}
      {periode === "custom" && (
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#181820] border border-[#2A2A38] text-white text-xs px-2 py-2 rounded-lg w-full"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#181820] border border-[#2A2A38] text-white text-xs px-2 py-2 rounded-lg w-full"
          />
        </div>
      )}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-2 mt-4">
        {[
          { label: "Service", value: total.service, color: "text-green-400" },
          {
            label: "Penjualan",
            value: total.penjualan,
            color: "text-indigo-400",
          },
          {
            label: "Harian",
            value: total.jualanHarian,
            color: "text-yellow-400",
          },
          { label: "Voucher", value: total.voucher, color: "text-red-400" },
        ].map((item, i) => (
          <div key={i} className={`${cardStyle} p-3`}>
            <p className="text-[10px] text-gray-400">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color}`}>
              Rp {item.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
      {/* ======================= */}
      {/* 🔥 SKELETON */}
      {/* ======================= */}
      {isLoading ? (
        <div className="space-y-3  mx-auto md:grid md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#181820] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="gap-3  mx-auto md:grid md:grid-cols-2">
          {/* ======================= */}
          {/* 🔥 LINE CHART */}
          {/* ======================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardStyle} p-2 mt-4`}
          >
            <p className="text-xs text-gray-400 mb-2">Trend Keuntungan</p>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                {!isMobile && <YAxis />}
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="keuntunganService"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="penjualan"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="jualanHarian"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="voucherHarian"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ======================= */}
          {/* 🔥 BAR CHART */}
          {/* ======================= */}
          <motion.div className={`${cardStyle} p-4 mt-4`}>
            <p className="text-xs text-gray-400 mb-2">Perbandingan</p>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                {!isMobile && <YAxis />}
                <Tooltip />

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

          {/* ======================= */}
          <motion.div className={`${cardStyle} p-4 mt-4`}>
            <p className="text-xs text-gray-400 mb-2">Distribusi</p>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60} // 🔥 donut
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ======================= */}
          {/* 🔥 TABLE */}
          {/* ======================= */}
          <motion.div className={`${cardStyle} mt-4 overflow-hidden`}>
            <table className="w-full text-xs">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="p-3 text-left">Tanggal</th>
                  <th>Service</th>
                  <th>Penjualan</th>
                  <th>Harian</th>
                  <th>Voucher</th>
                </tr>
              </thead>

              <tbody>
                {data?.map((d, i) => (
                  <tr
                    key={i}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-3">{d.tanggal}</td>
                    <td className="text-green-400">
                      Rp {d.keuntunganService.toLocaleString("id-ID")}
                    </td>
                    <td className="text-indigo-400">
                      Rp {d.penjualan.toLocaleString("id-ID")}
                    </td>
                    <td className="text-yellow-400">
                      Rp {d.jualanHarian.toLocaleString("id-ID")}
                    </td>
                    <td className="text-red-400">
                      Rp {d.voucherHarian.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}
    </div>
  );
}
