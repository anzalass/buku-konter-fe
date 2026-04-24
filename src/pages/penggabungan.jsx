import React, { useEffect, useState } from "react";
import JualanVoucher from "./jualan-voucher";
import TransaksiPage from "./transaksi";

import PencarianCepat from "../components/pencarian-cepat";
import {
  PlusCircle,
  Receipt,
  Ticket,
  LayoutGrid,
  X,
  Smartphone,
  Wallet,
  ArrowRight,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import HistoryTransaksiHome from "../components/history-home";
import Swal from "sweetalert2";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";

export default function Penggabungan() {
  const [loading, setLoading] = useState(false);
  const openPPOB = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    setLoading(true);

    // tandai keluar app
    localStorage.setItem("leaveApp", Date.now());

    if (isAndroid) {
      // 🔥 intent Android
      window.location.href = "https://mitra.bukalapak.com";

      // fallback ke PlayStore
      // setTimeout(() => {
      //   window.open(
      //     "https://play.google.com/store/apps/details?id=com.shopee.mitra.id",
      //     "_blank"
      //   );
      //   setLoading(false);
      // }, 1500);
    } else if (isIOS) {
      // ❌ iOS ga support intent
      window.location.href = "https://mitra.bukalapak.com";
    } else {
      // 🌐 desktop fallback
      window.location.href = "https://mitra.bukalapak.com";
    }
  };
  const { user } = useAuthStore();
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const [uangKeluarForm, setOpenModalUangKeluarForm] = useState(false);
  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post("uang-modal", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      Swal.fire("Berhasil!", "Data uang keluar ditambahkan", "success");
      setOpenModalUangKeluarForm(false);
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="fixed bottom-16 left-0 right-0 z-50 px-3">
        <div className="grid grid-cols-4 max-w-md mx-auto gap-2 px-2">
          {/* Penjualan */}
          <button
            onClick={() => nav("/dashboard/new-transaksi")}
            className="flex flex-col border-2 items-center justify-center gap-1.5 p-3 bg-white dark:bg-[#1e2130]  border-green-500 dark:border-[#2a2d42] rounded-xl hover:border-gray-300 dark:hover:bg-[#25283a] active:scale-95 transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 text-center leading-tight">
              Penjualan
            </span>
          </button>

          {/* Transaksi */}
          <button
            onClick={() => nav("/dashboard/new-transaksi2")}
            className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white dark:bg-[#1e2130] border border-green-500 dark:border-[#2a2d42] rounded-xl hover:border-gray-300 dark:hover:bg-[#25283a] active:scale-95 transition-all"
          >
            <LayoutGrid className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 text-center leading-tight">
              Transaksi
            </span>
          </button>

          {/* PPOB */}
          {/* <button
            onClick={openPPOB}
            className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white dark:bg-[#1e2130] border border-green-500 dark:border-[#2a2d42] rounded-xl hover:border-gray-300 dark:hover:bg-[#25283a] active:scale-95 transition-all"
          >
            <CreditCard className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 text-center leading-tight">
              PPOB
            </span>
          </button> */}

          {/* Service HP */}
          <button
            onClick={() => nav("/dashboard/form-service")}
            className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white dark:bg-[#1e2130] border border-green-500 dark:border-[#2a2d42] rounded-xl hover:border-gray-300 dark:hover:bg-[#25283a] active:scale-95 transition-all"
          >
            <Smartphone className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 text-center leading-tight">
              Service HP
            </span>
          </button>

          {/* Uang Keluar */}
          <button
            onClick={() => setOpenModalUangKeluarForm(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white dark:bg-[#1e2130] border border-green-500 dark:border-[#2a2d42] rounded-xl hover:border-gray-300 dark:hover:bg-[#25283a] active:scale-95 transition-all"
          >
            <Wallet className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 text-center leading-tight">
              Uang Keluar
            </span>
          </button>
        </div>
      </div>

      {/* <div className="my-2">
        <PencarianCepat />
      </div> */}
      {/* <div className="flex  gap-2  justify-center sm:justify-start">
        <ToggleViewButton
          active={viewMode === "transaksi"}
          onClick={() => setViewMode("transaksi")}
          icon={<Receipt className="w-4 h-4" />}
          label="Transaksi"
        />
        <ToggleViewButton
          active={viewMode === "voucher"}
          onClick={() => setViewMode("voucher")}
          icon={<Ticket className="w-4 h-4" />}
          label="Voucher"
        />
        <ToggleViewButton
          active={viewMode === "all"}
          onClick={() => setViewMode("all")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Semua"
        />
        <ToggleViewButton
          active={viewMode === "all"}
          onClick={() => setViewMode("all")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Laporan"
        />
      </div> */}
      {/* === KONTEN DENGAN LAYOUT DINAMIS === */}
      {/* <div className="w-full mt-4">
        {viewMode === "all" ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/2 w-full">
              <JualanVoucher />
            </div>
            <div className="sm:w-1/2 w-full">
              <TransaksiPage />
            </div>
          </div>
        ) : viewMode === "voucher" ? (
          <div className="w-full">
            <JualanVoucher />
          </div>
        ) : (
          <div className="w-full">
            <TransaksiPage />
          </div>
        )}
      </div> */}

      <HistoryTransaksiHome />

      {/* MODALS */}

      <ModalFormUangKeluar
        open={uangKeluarForm}
        onClose={() => setOpenModalUangKeluarForm(false)}
        initial={null}
        isLoading={createMutation.isPending} // 🔥 ini
        onSubmit={(data) => {
          createMutation.mutate(data);
        }}
      />
    </div>
  );
}

const ACTION_ICONS = {
  Penjualan: <ShoppingCart className="w-5 h-5 text-indigo-400" />,
  Transaksi: <LayoutGrid className="w-5 h-5 text-blue-400" />,
  PPOB: <CreditCard className="w-5 h-5 text-purple-400" />,
  "Service HP": <Smartphone className="w-5 h-5 text-emerald-400" />,
  "Uang Keluar": <Wallet className="w-5 h-5 text-amber-400" />,
};

function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-3 bg-green-700 dark:bg-[#1e2130] hover:bg-[#25283a] active:scale-95 transition-all"
    >
      {ACTION_ICONS[label] || <LayoutGrid className="w-5 h-5 text-gray-400" />}

      <span className="text-[12px] text-white text-center leading-tight">
        {label}
      </span>
    </button>
  );
}
function ToggleViewButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 border
      ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      }
      active:scale-95`}
    >
      {/* Icon */}

      {/* Label */}
      <span className="truncate ">{label}</span>
    </button>
  );
}

function ModalFormUangKeluar({ open, onClose, onSubmit, initial, isLoading }) {
  const getTodayLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split("T")[0];
  };
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      keterangan: initial?.keterangan || "",
      jumlah: initial?.jumlah || "",
      defaultValues: {
        keterangan: initial?.keterangan || "",
        jumlah: initial?.jumlah || "",
        tanggal: initial?.tanggal
          ? new Date(initial.tanggal).toISOString().split("T")[0]
          : getTodayLocal(),
      },
    },
  });

  const today = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      setValue(
        "tanggal",
        initial?.tanggal
          ? new Date(initial.tanggal).toISOString().split("T")[0]
          : getTodayLocal()
      );
    }
  }, [open, initial, setValue]);

  const inp = {
    background: "#111118",
    color: "#ECEAE3",
    borderColor: "#2A2A38",
  };

  if (!open) return null;

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.keterangan.trim()) {
      newErrors.keterangan = "Keterangan wajib diisi";
    }

    const jumlahNum = Number(data.jumlah);
    if (!data.jumlah || isNaN(jumlahNum) || jumlahNum < 1) {
      newErrors.jumlah = "Jumlah minimal Rp 1";
    }

    return newErrors;
  };

  const handleFormSubmit = (data) => {
    // Clear error sebelumnya
    clearErrors();

    // Validasi manual
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, { type: "manual", message });
      });
      return;
    }

    // Kirim ke parent
    onSubmit({
      ...data,
      jumlah: Number(data.jumlah),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl p-5 bg-white dark:bg-[#181820] border border-gray-100 dark:border-[#2A2A38] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Uang Keluar
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-[#252530] hover:bg-gray-200 dark:hover:bg-[#2e2e3e] transition-colors"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
          {/* Keterangan */}
          <div>
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Keterangan <span className="text-red-400">*</span>
            </p>
            <input
              {...register("keterangan")}
              disabled={isLoading}
              placeholder="Contoh: Beli perlengkapan toko..."
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border focus:border-indigo-400 dark:focus:border-[#4A4A68]
            ${
              errors.keterangan
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-[#2A2A38]"
            }`}
            />
            {errors.keterangan && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.keterangan.message}
              </p>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Jumlah <span className="text-red-400">*</span>
            </p>
            <Controller
              name="jumlah"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  value={field.value}
                  disabled={isLoading}
                  onValueChange={(values) =>
                    field.onChange(values.floatValue || 0)
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  prefix="Rp "
                  placeholder="Rp 0"
                  className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
                bg-gray-50 dark:bg-[#111118]
                text-gray-800 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
                border focus:border-indigo-400 dark:focus:border-[#4A4A68]
                ${
                  errors.jumlah
                    ? "border-red-400 dark:border-red-500"
                    : "border-gray-200 dark:border-[#2A2A38]"
                }`}
                />
              )}
            />
            {errors.jumlah && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.jumlah.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div className="pb-2">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Tanggal
            </p>
            <input
              disabled={isLoading}
              {...register("tanggal")}
              type="date"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]
            [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-colors
            bg-gray-100 dark:bg-[#1A1A28]
            text-gray-500 dark:text-[#6A6878]
            border border-gray-200 dark:border-[#2A2A38]
            hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
