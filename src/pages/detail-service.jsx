import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
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
      return res.data;
    },

    onSuccess: (res, newStatus) => {
      const svc = res.data || data;
      const total = (svc.hargaSparePart || 0) + (svc.biayaJasa || 0);
      const text = `Halo ${svc.namaMember || "Pelanggan"} 👋\n\nService HP kamu sudah diperbarui.\n\n📱 HP: ${svc.brandHP}\n🛠️ Status: ${newStatus}\n\n💰 Total: Rp ${total.toLocaleString("id-ID")}\n\nTerima kasih 🙏`;
      const phone = svc.noHP?.replace(/^0/, "62");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      queryClient.invalidateQueries(["detail-service", id]);
      setOpenStatus(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`service-hp/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
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
      navigate(-1);
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
      if (result.isConfirmed) deleteMutation.mutate();
    });
  };

  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
    );
  if (!data)
    return (
      <div className="p-4 text-center text-red-400 text-sm">
        Data tidak ditemukan
      </div>
    );

  const isVoid = data.deletedAt !== null;

  // 🔥 HITUNG TOTAL HARGA SPAREPART DARI HARGA ECERAN * QTY
  const totalSparepart =
    data.Sparepart?.reduce((sum, sp) => {
      const harga = Number(sp.Produk?.hargaEceran) || 0;
      const qty = Number(sp.quantity) || 0;
      return sum + harga * qty;
    }, 0) || 0;

  const jasa = data.biayaJasa || 0;
  const keuntungan = data.keuntungan || 0;
  const total = totalSparepart + jasa;

  const handleWA = () => {
    const text = `Halo ${data.namaMember},\nService HP kamu sudah ${data.status}.\nTotal: Rp ${total.toLocaleString("id-ID")}`;
    const url = `https://wa.me/${data.noHP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

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
        {isVoid ? "VOID" : data.status}
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
          <Phone size={16} />
          <span className="dark:text-gray-200 text-gray-800">{data.noHP}</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
          <Wrench size={16} />
          <span className="dark:text-gray-200 text-gray-800">
            {data.brandHP} - {data.keterangan}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm dark:text-gray-400 text-gray-500">
          <Calendar size={16} />
          <span className="dark:text-gray-200 text-gray-800">
            {new Date(data.tanggal).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* SPAREPART LIST */}
      <div className="mb-4 space-y-2">
        {data.Sparepart?.map((sp) => {
          const harga = Number(sp.Produk?.hargaEceran) || 0;
          const qty = Number(sp.quantity) || 0;
          return (
            <div
              key={sp.id}
              className="flex flex-wrap justify-between items-center gap-2 text-xs sm:text-sm p-3 rounded-lg bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] shadow-sm transition-colors duration-300"
            >
              <span className="dark:text-gray-200 text-gray-800 font-medium flex-1 min-w-[120px]">
                {sp.Produk?.nama}
                <span className="dark:text-gray-400 ml-3 text-gray-600 bg-gray-100 dark:bg-[#252530] px-2 py-0.5 rounded-md">
                  x{qty}
                </span>
              </span>

              <span className="dark:text-gray-200 text-gray-800 bg-gray-100 dark:bg-[#252530] px-2 py-0.5 rounded-md">
                Rp {harga.toLocaleString()}
              </span>
              <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
                Rp {(harga * qty).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* TOTAL */}
      <div className="bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#232330] rounded-xl p-4 mb-4 text-xs sm:text-sm shadow-sm transition-colors duration-300">
        <div className="flex justify-between mb-2 pb-2 border-b border-gray-100 dark:border-[#2A2A38]">
          <span className="dark:text-gray-400 text-gray-500">Sparepart</span>
          <span className="dark:text-gray-200 text-gray-800 font-medium">
            Rp {totalSparepart.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between mb-2 pb-2 border-b border-gray-100 dark:border-[#2A2A38]">
          <span className="dark:text-gray-400 text-gray-500">Jasa</span>
          <span className="dark:text-gray-200 text-gray-800 font-medium">
            Rp {jasa.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2 mb-1">
          <span className="dark:text-gray-200 text-gray-800">Total</span>
          <span className="text-blue-600 dark:text-blue-400">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="dark:text-gray-400 text-gray-500">Keuntungan</span>
          <span className="text-green-600 dark:text-green-400 font-medium">
            +Rp {keuntungan.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setOpenStatus(true)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-all active:scale-[0.98] border border-indigo-100 dark:border-indigo-900/30"
        >
          <Pencil size={16} /> Edit
        </button>
        <button
          onClick={handleWA}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-all active:scale-[0.98] border border-green-100 dark:border-green-900/30"
        >
          <MessageCircle size={16} /> WhatsApp
        </button>
        <button
          onClick={() => navigate(`/print-service/${id}`)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all active:scale-[0.98] border border-blue-100 dark:border-blue-900/30"
        >
          <Printer size={16} /> Print
        </button>
        {!isVoid && (
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all active:scale-[0.98] border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} /> Hapus
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm transition-colors duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl p-4 sm:p-5 dark:bg-[#181820] bg-white dark:border-[#2A2A38] border-gray-200 border shadow-xl transition-colors duration-300">
        <h2 className="text-sm font-semibold mb-4 dark:text-white text-gray-900 pr-6">
          Ubah Status Service
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
                status === s
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2a2d42] hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(status)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
