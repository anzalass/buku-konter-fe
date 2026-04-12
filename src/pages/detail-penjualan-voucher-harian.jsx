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
    <div className="min-h-screen p-2 pb-20 text-white">
      {/* HEADER */}

      {/* STATUS */}
      <div
        className="mb-4 px-3 py-2 rounded-lg text-xs font-semibold inline-block"
        style={{
          background: isVoid ? "#200808" : "#0A2012",
          color: isVoid ? "#D07070" : "#5AC47A",
        }}
      >
        {isVoid ? "VOID" : "AKTIF"}
      </div>

      {/* INFO */}
      <div
        className="rounded-xl p-4 mb-4 space-y-2"
        style={{ background: "#181820", border: "1px solid #232330" }}
      >
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <User size={14} />
          {data.namaMember}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Package size={14} />
          {data.Produk?.nama}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          {new Date(data.createdAt).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* DETAIL HARGA */}
      <div
        className="rounded-xl p-4 mb-4 text-xs"
        style={{ background: "#181820", border: "1px solid #232330" }}
      >
        <div className="flex justify-between mb-1">
          <span className="text-gray-400">Harga Jual</span>
          <span className="text-blue-400 font-semibold">
            Rp {harga.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-gray-400">Keuntungan</span>
          <span className="text-green-400 font-semibold">
            +Rp {keuntungan.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="grid grid-cols-2 gap-2">
        {/* WHATSAPP */}
        <button
          onClick={handleWA}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs"
          style={{
            background: "#0A2012",
            color: "#5AC47A",
          }}
        >
          <MessageCircle size={14} /> WhatsApp
        </button>

        {/* PRINT */}
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs"
          style={{
            background: "#0A1828",
            color: "#5A9ADE",
          }}
        >
          <Printer size={14} /> Print
        </button>

        {/* DELETE */}
        {!isVoid && (
          <button
            onClick={handleDelete}
            className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg text-xs"
            style={{
              background: "#200808",
              color: "#D07070",
            }}
          >
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
    </div>
  );
}
