import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Printer,
  Trash2,
  User,
  Calendar,
  Package,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DetailJualanHarian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["detail-jualan-harian", id],
    queryFn: async () => {
      const res = await api.get(`detail/jualan-harian/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`jualan-harian/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["history"]);
      queryClient.invalidateQueries(["detail-jualan-harian", id]);

      Swal.fire({
        title: "Berhasil!",
        text: "Transaksi berhasil dihapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#181820",
        color: "#fff",
      });

      navigate(-1);
    },

    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
        background: "#181820",
        color: "#fff",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-red-400 text-sm">
        Data tidak ditemukan
      </div>
    );
  }

  const isVoid = data.deletedAt !== null;

  const total = data.totalHarga || 0;
  const keuntungan = data.keuntungan || 0;

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto p-3 sm:p-4 pb-24 dark:text-white text-gray-900 transition-colors duration-300">
      {/* STATUS */}
      <div
        className={`mb-4 px-3 py-1.5 rounded-lg text-xs font-semibold inline-block transition-colors duration-300 ${
          isVoid
            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50"
            : "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50"
        }`}
      >
        {isVoid ? "VOID" : "AKTIF"}
      </div>

      {/* INFO */}
      <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] rounded-xl p-4 mb-4 shadow-sm transition-colors duration-300">
        <div className="mb-3">
          <p className="text-xs dark:text-gray-400 text-gray-500 mb-1">
            Kategori
          </p>
          <p className="text-sm font-semibold dark:text-white text-gray-800">
            {data.kategori}
          </p>
        </div>

        <div className="mb-3">
          <p className="text-xs dark:text-gray-400 text-gray-500 mb-1">
            Nominal
          </p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Rp {(data.nominal || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-xs dark:text-gray-400 text-gray-500 mb-1">
            Member
          </p>
          <p className="text-sm dark:text-gray-200 text-gray-700">
            {data.namaMember}
          </p>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* PRINT */}
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all active:scale-[0.98] border border-blue-100 dark:border-blue-900/30"
        >
          <Printer size={16} /> Print
        </button>

        {/* DELETE */}
        {!isVoid && (
          <button
            onClick={async () => {
              const isDark =
                document.documentElement.classList.contains("dark");
              const result = await Swal.fire({
                title: "Yakin hapus?",
                text: "Data yang sudah dihapus tidak bisa dikembalikan",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: isDark ? "#991b1b" : "#ef4444",
                cancelButtonColor: isDark ? "#3b82f6" : "#2563eb",
                confirmButtonText: "Ya, hapus!",
                cancelButtonText: "Batal",
                background: isDark ? "#181820" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              });

              if (result.isConfirmed) {
                deleteMutation.mutate();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all active:scale-[0.98] border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} /> Hapus
          </button>
        )}
      </div>
    </div>
  );
}
