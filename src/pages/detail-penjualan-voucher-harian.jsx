import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  User,
  Package,
  Calendar,
  Printer,
  Trash2,
  MessageCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DetailPenjualanVoucherHarian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["detail-voucher-harian", id],
    queryFn: async () => {
      const res = await api.get(`detail/voucher-harian/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`voucher-harian/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["history"]);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      // 🔥 AUTO WA + REDIRECT
      //       const text = `Halo ${data.namaMember},
      // Status transaksi voucher ${data.Produk?.nama} telah diperbarui (VOID).`;

      //       window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");

      navigate(-1);
    },

    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus data",
      });
    },
  });

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan di-VOID dan tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate();
      }
    });
  };

  // 🔥 WHATSAPP
  const handleWA = () => {
    const text = `Halo ${data.namaMember},
Pembelian voucher ${data.Produk?.nama} berhasil.
Terima kasih 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

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

  const harga = data.Produk?.hargaEceran || 0;
  const keuntungan = data.keuntungan || 0;
  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto p-3 sm:p-4 pb-24 dark:text-white text-gray-900 transition-colors duration-300">
      {/* STATUS */}
      <div
        className={`mb-4 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold inline-block transition-colors duration-300 ${
          isVoid
            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50"
            : "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50"
        }`}
      >
        {isVoid ? "VOID" : "AKTIF"}
      </div>

      {/* INFO */}
      <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] rounded-xl p-4 mb-4 space-y-3 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
          <User size={16} />
          <span className="dark:text-gray-200 text-gray-800 font-medium">
            {data.namaMember}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
          <Package size={16} />
          <span className="dark:text-gray-200 text-gray-800 font-medium">
            {data.Produk?.nama}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
          <Calendar size={16} />
          <span className="dark:text-gray-200 text-gray-800">
            {new Date(data.createdAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* DETAIL HARGA */}
      <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] rounded-xl p-4 mb-4 text-xs sm:text-sm shadow-sm transition-colors duration-300">
        <div className="flex justify-between mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100 dark:border-[#2A2A38]">
          <span className="dark:text-gray-400 text-gray-500">Harga Jual</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">
            Rp {harga.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="dark:text-gray-400 text-gray-500">Keuntungan</span>
          <span className="text-green-600 dark:text-green-400 font-bold text-base sm:text-lg">
            +Rp {keuntungan.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="grid grid-cols-2 gap-3">
        {/* WHATSAPP */}
        <button
          onClick={handleWA}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-all active:scale-[0.98] border border-green-100 dark:border-green-900/30"
        >
          <MessageCircle size={16} /> WhatsApp
        </button>

        {/* PRINT */}
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all active:scale-[0.98] border border-blue-100 dark:border-blue-900/30"
        >
          <Printer size={16} /> Print
        </button>

        {/* DELETE */}
        {!isVoid && (
          <button
            onClick={handleDelete}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all active:scale-[0.98] border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} /> Hapus
          </button>
        )}
      </div>
    </div>
  );
}
