import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  User,
  Phone,
  Wrench,
  Calendar,
  Printer,
  Trash2,
  Pencil,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function DetailService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [openStatus, setOpenStatus] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["detail-service", id],
    queryFn: async () => {
      const res = await api.get(`detail/service/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id,
  });

  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.patch(
        `/service-hp/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      return res.data; // pastikan backend return data terbaru
    },

    onSuccess: (res, newStatus) => {
      const svc = res.data || data; // fallback kalau backend ga return

      // 🔥 FORMAT PESAN WA
      const total = (svc.hargaSparePart || 0) + (svc.biayaJasa || 0);

      const text = `Halo ${svc.namaMember || "Pelanggan"} 👋

Service HP kamu sudah diperbarui.

📱 HP: ${svc.brandHP}
🛠️ Status: ${newStatus}

💰 Total: Rp ${total.toLocaleString("id-ID")}

Terima kasih 🙏`;

      const phone = svc.noHP?.replace(/^0/, "62"); // auto convert 08 → 628

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

      // 🔥 OPEN WA
      window.open(url, "_blank");

      queryClient.invalidateQueries(["detail-service", id]);
      setOpenStatus(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`service-hp/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Service berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries(["history"]);
      navigate(-1); // 🔥 balik ke halaman sebelumnya
    },

    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus service",
      });
    },
  });

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data service akan dibatalkan & stok dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate();
      }
    });
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

  const totalSparepart = data.hargaSparePart || 0;
  const jasa = data.biayaJasa || 0;
  const keuntungan = data.keuntungan || 0;
  const total = totalSparepart + jasa;

  // 🔥 WHATSAPP
  const handleWA = () => {
    const text = `Halo ${data.namaMember},
Service HP kamu sudah ${data.status}.
Total: Rp ${total.toLocaleString("id-ID")}`;
    const url = `https://wa.me/${data.noHP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

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
        {isVoid ? "VOID" : data.status}
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
          <Phone size={14} />
          {data.noHP}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Wrench size={14} />
          {data.brandHP} - {data.keterangan}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          {new Date(data.tanggal).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* SPAREPART */}
      <div className="mb-4 space-y-2">
        {data.Sparepart?.map((sp) => (
          <div
            key={sp.id}
            className="flex justify-between text-xs p-3 rounded-lg"
            style={{
              background: "#181820",
              border: "1px solid #232330",
            }}
          >
            <span>{sp.Produk?.nama}</span>
            <span>x{sp.quantity}</span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div
        className="rounded-xl p-4 mb-4 text-xs"
        style={{ background: "#181820", border: "1px solid #232330" }}
      >
        <div className="flex justify-between mb-1">
          <span className="text-gray-400">Sparepart</span>
          <span>Rp {totalSparepart.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between mb-1">
          <span className="text-gray-400">Jasa</span>
          <span>Rp {jasa.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between font-semibold text-blue-400 mt-2">
          <span>Total</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between text-green-400 mt-1">
          <span>Keuntungan</span>
          <span>+Rp {keuntungan.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setOpenStatus(true)}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs"
          style={{
            background: "#15163a",
            color: "#818cf8",
          }}
        >
          <Pencil size={14} /> Edit
        </button>

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

        {!isVoid && (
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs"
            style={{
              background: "#200808",
              color: "#D07070",
            }}
          >
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
      <ModalEditStatus
        open={openStatus}
        onClose={() => setOpenStatus(false)}
        data={data}
        onSave={(status) => updateStatusMutation.mutate(status)}
      />
    </div>
  );
}

function ModalEditStatus({ open, onClose, data, onSave }) {
  const [status, setStatus] = useState(data?.status || "Pending");

  useEffect(() => {
    if (data) setStatus(data.status);
  }, [data]);

  if (!open) return null;

  const STATUS_LIST = ["Proses", "Selesai", "Gagal", "Batal", "Pending"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl p-5"
        style={{
          background: "#181820",
          border: "1px solid #2A2A38",
        }}
      >
        <h2 className="text-sm font-semibold mb-4 text-white">
          Ubah Status Service
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="py-2 rounded-lg text-xs font-medium"
              style={{
                background: status === s ? "#4f46e5" : "#252530",
                color: status === s ? "#fff" : "#6A6870",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs"
            style={{
              background: "#252530",
              color: "#6A6870",
            }}
          >
            Batal
          </button>

          <button
            onClick={() => onSave(status)}
            className="flex-1 py-2 rounded-lg text-xs"
            style={{
              background: "#ECEAE3",
              color: "#0D0D10",
            }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
