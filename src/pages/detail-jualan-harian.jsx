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
      {/* INFO */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: "#181820", border: "1px solid #232330" }}
      >
        <p className="text-xs text-gray-400 mb-1">Kategori</p>
        <p className="text-sm font-semibold text-white">{data.kategori}</p>

        <p className="text-xs text-gray-400 mt-3 mb-1">Nominal</p>
        <p className="text-lg font-bold text-blue-400">
          Rp {(data.nominal || 0).toLocaleString("id-ID")}
        </p>

        <p className="text-xs text-gray-400 mt-3 mb-1">Member</p>
        <p className="text-sm text-white">{data.namaMember}</p>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex gap-2">
        {/* PRINT */}
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium"
          style={{
            background: "#0A1828",
            color: "#5A9ADE",
            border: "1px solid #1A2A48",
          }}
        >
          <Printer size={14} /> Print
        </button>

        {/* DELETE */}
        {!isVoid && (
          <button
            onClick={async () => {
              const result = await Swal.fire({
                title: "Yakin hapus?",
                text: "Data yang sudah dihapus tidak bisa dikembalikan",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Ya, hapus!",
                cancelButtonText: "Batal",
                background: "#181820",
                color: "#fff",
              });

              if (result.isConfirmed) {
                deleteMutation.mutate();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium"
            style={{
              background: "#200808",
              color: "#D07070",
              border: "1px solid #3A1A1A",
            }}
          >
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
    </div>
  );
}
