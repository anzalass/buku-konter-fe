"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Calendar,
  User,
  Package,
  Printer,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DetailTransaksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 🔥 FETCH DETAIL
  const { data, isLoading, isError } = useQuery({
    queryKey: ["detailTransaksi", id],
    queryFn: async () => {
      const res = await api.get(`detail/transaksi/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id && !!user?.token,
  });

  // 🔥 DELETE / VOID
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`transaksi-new/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transaksi"]);
    },
  });

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Yakin batalin transaksi?",
      text: "Stok akan dikembalikan & transaksi dibatalkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync();

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Transaksi berhasil dibatalkan",
        timer: 1500,
        showConfirmButton: false,
      });

      // navigate di sini biar smooth
      navigate(-1);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err?.response?.data?.message || "Terjadi kesalahan",
      });
    }
  };

  const formatCurrency = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const formatDate = (date) =>
    new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return <div className="p-5 text-center text-gray-400">Loading...</div>;
  }

  if (isError || !data) {
    return <div className="p-5 text-center text-red-400">Gagal ambil data</div>;
  }

  const isVoid = data.deletedAt !== null;

  return (
    <div className="min-h-screen p-2 pb-24 bg-[#0D0D10] text-white">
      {/* 🔙 HEADER */}

      {/* 💳 CARD HEADER */}
      <div className="rounded-2xl p-4 bg-[#181820] border border-[#232330] mb-4">
        {/* STATUS */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs text-gray-400">Nama</p>
            <p className="text-sm font-medium">{data.namaMember}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isVoid ? "bg-red-900 text-red-400" : "bg-green-900 text-green-400"
            }`}
          >
            {isVoid ? "VOID" : "SUCCESS"}
          </span>
        </div>

        {/* TANGGAL */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          {formatDate(data.tanggal)}
        </div>

        {/* TOTAL */}
        <div className="mt-4">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(data.totalHarga)}
          </p>
          <p className="text-xs text-green-400 mt-1">
            +{formatCurrency(data.keuntungan)}
          </p>
        </div>
      </div>

      {/* 📦 LIST ITEM */}
      <div className="rounded-2xl bg-[#181820] border border-[#232330] p-4">
        <p className="text-xs text-gray-400 mb-3">Items</p>

        <div className="flex flex-col gap-3">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b border-[#232330] pb-2"
            >
              <div>
                <p className="text-sm">{item.Produk?.nama}</p>
                <p className="text-[10px] text-gray-400">
                  {item.quantity} x {formatCurrency(item.Produk?.hargaEceran)}
                </p>
              </div>

              <p className="text-xs text-blue-400">
                {formatCurrency(item.quantity * item.Produk?.hargaEceran)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 ACTION BUTTON */}
      <div className="mt-2">
        <div className="flex gap-3">
          {/* PRINT */}
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0A1828] text-blue-400 border border-[#1A2A48]"
          >
            <Printer size={16} />
            Print
          </button>

          {/* DELETE / VOID */}
          {!isVoid && (
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2A0A12] text-red-400 border border-[#3A1A22]"
            >
              <Trash2 size={16} />
              Void
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
