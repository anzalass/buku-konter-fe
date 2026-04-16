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
    <div className="min-h-screen w-full max-w-2xl mx-auto p-3 sm:p-4 pb-28 bg-gray-50 dark:bg-[#0D0D10] dark:text-white text-gray-900 transition-colors duration-300">
      {/* 💳 CARD */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] shadow-sm transition-colors duration-300">
        {/* JUMLAH */}
        <div className="mb-4 pb-4 border-b border-gray-100 dark:border-[#232330]">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
            Jumlah
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(data.jumlah)}
          </p>
        </div>

        {/* KETERANGAN */}
        <div className="flex items-start gap-3 mb-4">
          <FileText
            className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
            size={18}
          />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
              Keterangan
            </p>
            <p className="text-sm dark:text-gray-200 text-gray-800">
              {data.keterangan}
            </p>
          </div>
        </div>

        {/* TANGGAL */}
        <div className="flex items-start gap-3 mb-4">
          <Calendar
            className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
            size={18}
          />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
              Tanggal
            </p>
            <p className="text-sm dark:text-gray-200 text-gray-800">
              {formatDate(data.tanggal)}
            </p>
          </div>
        </div>

        {/* KATEGORI / LABEL */}
        <div className="flex items-start gap-3">
          <Wallet
            className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
            size={18}
          />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
              Tipe
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Pengeluaran
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 ACTION BUTTON */}
      <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-6 md:px-0 md:max-w-2xl md:mx-auto z-10">
        <div className="flex gap-3">
          {/* EDIT */}
          <button
            onClick={() => router.push(`/dashboard/uang-keluar/edit/${id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30 transition-all active:scale-[0.98]"
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
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-100 dark:border-red-900/30 transition-all active:scale-[0.98]"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
