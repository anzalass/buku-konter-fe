"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Wallet,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function DetailUangKeluar() {
  const { id } = useParams();
  const router = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 🔥 FETCH DATA
  const { data, isLoading, isError } = useQuery({
    queryKey: ["detailUangKeluar", id],
    queryFn: async () => {
      const res = await api.get(`detail/uang-keluar/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id && !!user?.token,
  });

  // 🔥 DELETE
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`uang-keluar/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["uangKeluar"]);
      router.back();
    },
  });

  const formatCurrency = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const formatDate = (date) =>
    new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
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

  return (
    <div className="min-h-screen p-2 pb-20 bg-[#0D0D10] text-white">
      {/* 🔙 HEADER */}

      {/* 💳 CARD */}
      <div className="rounded-2xl p-4 bg-[#181820] border border-[#232330] shadow-md">
        {/* JUMLAH */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Jumlah</p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(data.jumlah)}
          </p>
        </div>

        {/* KETERANGAN */}
        <div className="flex items-start gap-3 mb-4">
          <FileText className="text-gray-400 mt-1" size={18} />
          <div>
            <p className="text-xs text-gray-400">Keterangan</p>
            <p className="text-sm">{data.keterangan}</p>
          </div>
        </div>

        {/* TANGGAL */}
        <div className="flex items-start gap-3 mb-4">
          <Calendar className="text-gray-400 mt-1" size={18} />
          <div>
            <p className="text-xs text-gray-400">Tanggal</p>
            <p className="text-sm">{formatDate(data.tanggal)}</p>
          </div>
        </div>

        {/* KATEGORI / LABEL */}
        <div className="flex items-start gap-3">
          <Wallet className="text-gray-400 mt-1" size={18} />
          <div>
            <p className="text-xs text-gray-400">Tipe</p>
            <p className="text-sm text-red-400 font-medium">Pengeluaran</p>
          </div>
        </div>
      </div>

      {/* 🔥 ACTION BUTTON */}
      <div className="fixed bottom-5 left-0 right-0 px-4">
        <div className="flex gap-3">
          {/* EDIT */}
          <button
            onClick={() => router.push(`/dashboard/uang-keluar/edit/${id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1A40] text-indigo-400 border border-[#2A2A60]"
          >
            <Pencil size={16} />
            Edit
          </button>

          {/* DELETE */}
          <button
            onClick={() => {
              if (confirm("Yakin mau hapus data ini?")) {
                deleteMutation.mutate();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2A0A12] text-red-400 border border-[#3A1A22]"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
