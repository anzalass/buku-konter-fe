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
      setTimeout(() => {
        window.open(
          "https://play.google.com/store/apps/details?id=com.shopee.mitra.id",
          "_blank"
        );
        setLoading(false);
      }, 1500);
    } else if (isIOS) {
      // ❌ iOS ga support intent
      window.open(
        "https://apps.apple.com/id/app/shopee-mitra/id1528703883",
        "_blank"
      );
      setLoading(false);
    } else {
      // 🌐 desktop fallback
      window.open("https://mitra.shopee.co.id", "_blank");
      setLoading(false);
    }
  };
  const { user } = useAuthStore();
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const [uangKeluarForm, setOpenModalUangKeluarForm] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard2", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!user?.token,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post("uang-modal", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uang-modal"] });
      Swal.fire("Berhasil!", "Data uang keluar ditambahkan", "success");
      setOpenModalUangKeluarForm(false);
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="fixed bottom-16 left-0 right-0 z-50 px-3">
        <div className="grid grid-cols-5  max-w-md mx-auto">
          <ActionButton
            onClick={() => nav("/dashboard/new-transaksi")}
            label="Penjualan"
          />{" "}
          <ActionButton
            onClick={() => nav("/dashboard/new-transaksi2")}
            label="Transaksi"
          />{" "}
          <ActionButton onClick={openPPOB} label="PPOB" />
          <ActionButton
            onClick={() => nav("/dashboard/form-service")}
            label="Service HP"
          />
          <ActionButton
            onClick={() => setOpenModalUangKeluarForm(true)}
            label="Uang Keluar"
          />
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
        onClose={() => {
          setOpenModalUangKeluarForm(false);
        }}
        initial={null}
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
      className="flex flex-col items-center justify-center gap-1.5 p-3 bg-[#1e2130] hover:bg-[#25283a] active:scale-95 transition-all"
    >
      {ACTION_ICONS[label] || <LayoutGrid className="w-5 h-5 text-gray-400" />}

      <span className="text-[9px] text-gray-400 text-center leading-tight">
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

function ModalFormUangKeluar({ open, onClose, onSubmit, initial }) {
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
      tanggal: initial?.tanggal
        ? new Date(initial.tanggal).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  const today = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (open) {
      setValue(
        "tanggal",
        initial?.tanggal
          ? new Date(initial.tanggal).toISOString().split("T")[0]
          : today()
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#181820", border: "1px solid #2A2A38" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-0.5"
              style={{ color: "#5A5868" }}
            >
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold" style={{ color: "#ECEAE3" }}>
              Uang Keluar
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: "#252530" }}
          >
            <X size={12} color="#6A6878" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Keterangan */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Keterangan <span style={{ color: "#D07070" }}>*</span>
            </p>
            <input
              {...register("keterangan")}
              placeholder="Contoh: Beli perlengkapan toko..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={{
                ...inp,
                borderColor: errors.keterangan ? "#D07070" : "#2A2A38",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.keterangan
                  ? "#D07070"
                  : "#2A2A38")
              }
            />
            {errors.keterangan && (
              <p className="text-[10px] mt-1" style={{ color: "#D07070" }}>
                {errors.keterangan.message}
              </p>
            )}
          </div>

          {/* Jumlah */}
          <Controller
            name="jumlah"
            control={control}
            render={({ field }) => (
              <NumericFormat
                value={field.value}
                onValueChange={(values) => {
                  field.onChange(values.floatValue || 0);
                }}
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                prefix="Rp "
                placeholder="Rp 0"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
                style={{
                  ...inp,
                  borderColor: errors.jumlah ? "#D07070" : "#2A2A38",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.jumlah
                    ? "#D07070"
                    : "#2A2A38")
                }
              />
            )}
          />

          {/* Tanggal */}
          <div className="mb-5">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Tanggal
            </p>
            <input
              {...register("tanggal")}
              type="date"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium"
              style={{
                background: "#1A1A28",
                color: "#6A6878",
                border: "1px solid #2A2A38",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-opacity"
              style={{ background: "#4f46e5" }}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
