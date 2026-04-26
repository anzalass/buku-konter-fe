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
  X,
  Plus,
  Minus,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function DetailService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [openStatus, setOpenStatus] = useState(false);
  const [openGaransi, setOpenGaransi] = useState(false);
  const [sparepartMaster, setSparepartMaster] = useState();
  const [loadingMaster, setLoadingMaster] = useState(false);

  useEffect(() => {
    api
      .get("produk-sparepart", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((spRes) => {
        console.log(spRes);

        setSparepartMaster(spRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingMaster(false));
  }, [user.token]);

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
    mutationFn: async ({ status, garansiDate }) => {
      const res = await api.patch(
        `/service-hp/${id}/status`,
        { status, garansiDate }, // 🔥 kirim juga
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

  const createKlaimMutation = useMutation({
    mutationFn: async (payload) => {
      console.log(payload);

      const res = await api.post(`/klaim-garansi`, payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Klaim garansi berhasil",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries(["detail-service", id]);
      setOpenGaransi(false);
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal klaim garansi",
      });
    },
  });

  const deleteKlaimMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/klaim-garansi/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Klaim garansi berhasil",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries(["detail-service", id]);
      setOpenGaransi(false);
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal klaim garansi",
      });
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

  const today = new Date();

  const isSudahDiambil = data.statusAmbil === "SudahDiambil";

  const tanggalAmbil = data.tanggalAmbil ? new Date(data.tanggalAmbil) : null;

  const garansiBerakhir = data.garansiBerakhir
    ? new Date(data.garansiBerakhir)
    : null;

  const isGaransiAktif = garansiBerakhir && garansiBerakhir >= today;

  const isTanpaGaransi = isSudahDiambil && !garansiBerakhir;

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
    const phone = data.noHP?.replace(/^0/, "62");

    const text = `Halo ${data.namaMember},\nService HP kamu sudah ${data.status}.\nTotal: Rp ${total.toLocaleString("id-ID")}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
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
        {isVoid ? "VOID" : `${data.statusServis} - ${data.statusAmbil}`}
      </div>
      {isSudahDiambil && (
        <div className="mb-4 flex flex-wrap gap-2 text-[11px] sm:text-xs">
          {/* TANGGAL AMBIL */}
          {tanggalAmbil && (
            <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-300">
              Diambil:{" "}
              {tanggalAmbil.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}

          {/* GARANSI */}
          {isTanpaGaransi ? (
            <div className="px-2 py-1 rounded-md bg-gray-200 dark:bg-[#2f3245] text-gray-500 dark:text-gray-400">
              Tanpa Garansi
            </div>
          ) : (
            garansiBerakhir && (
              <div
                className={`px-2 py-1 rounded-md font-medium ${
                  isGaransiAktif
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {isGaransiAktif ? "Garansi Aktif" : "Garansi Habis"} •{" "}
                {garansiBerakhir.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )
          )}
        </div>
      )}
      {isSudahDiambil && isGaransiAktif ? (
        <button
          onClick={() => setOpenGaransi(true)}
          className="flex px-2 my-3 items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-all active:scale-[0.98] border border-yellow-100 dark:border-yellow-900/30"
        >
          Klaim Garansi
        </button>
      ) : null}
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
      <div className="space-y-3 my-3">
        {data.klaimGaransi.map((klaim, idx) => {
          const totalHarga = klaim.item.reduce(
            (sum, i) => sum + i.Product.hargaEceran * i.quantityProduct,
            0
          );
          const hasItem = klaim.item.length > 0;
          const tgl = new Date(klaim.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const jam = new Date(klaim.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          if (klaim.deletedAt) return null;
          return (
            <div
              key={klaim.id}
              className="rounded-2xl bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130] overflow-hidden"
            >
              {/* ── HEADER ── */}
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      hasItem
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-gray-100 dark:bg-[#1e2130]"
                    }`}
                  >
                    <span className="text-base">{hasItem ? "🛡️" : "📋"}</span>
                  </div>

                  {/* Klaim info */}
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-[#ECEAE3] leading-tight mb-0.5">
                      {klaim.keterangan}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                        {tgl}
                      </span>
                      <span className="text-[10px] text-gray-300 dark:text-[#3A3848]">
                        ·
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                        {jam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <span
                  className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    hasItem
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-[#1e2130] text-gray-400 dark:text-[#5A5868]"
                  }`}
                >
                  {hasItem ? `${klaim.item.length} item` : "Tanpa item"}
                </span>
              </div>

              {/* ── ITEM LIST ── */}
              {hasItem && (
                <>
                  <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-gray-100 dark:border-[#1e2130] bg-gray-50 dark:bg-[#0d0f18]">
                    {klaim.item.map((item, i) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between px-3 py-2.5 gap-3 ${
                          i < klaim.item.length - 1
                            ? "border-b border-gray-100 dark:border-[#1e2130]"
                            : ""
                        }`}
                      >
                        {/* Product info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#181820] border border-gray-100 dark:border-[#252838] flex items-center justify-center shrink-0">
                            <span className="text-xs">🔩</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-gray-800 dark:text-[#DBD9D2] truncate">
                              {item.Product.nama}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                                {item.Product.brand}
                              </span>
                              <span className="text-[10px] text-gray-300 dark:text-[#3A3848]">
                                ·
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                                {item.Product.kategori}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Qty + harga */}
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-semibold text-gray-900 dark:text-[#ECEAE3]">
                            Rp{" "}
                            {(
                              item.Product.hargaEceran * item.quantityProduct
                            ).toLocaleString("id-ID")}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-[#5A5868] mt-0.5">
                            Rp{" "}
                            {item.Product.hargaEceran.toLocaleString("id-ID")} ×{" "}
                            {item.quantityProduct}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── TOTAL ── */}
                  <div className="mx-4 mb-3 flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Total Klaim
                      </span>
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-600">
                        ({klaim.item.length} sparepart)
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                      Rp {totalHarga.toLocaleString("id-ID")}
                    </span>
                  </div>
                </>
              )}

              {/* ── EMPTY STATE ── */}
              {!hasItem && (
                <div className="mx-4 mb-3 flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gray-50 dark:bg-[#0d0f18] border border-gray-100 dark:border-[#1e2130]">
                  <span className="text-base opacity-40">📦</span>
                  <p className="text-[11px] text-gray-400 dark:text-[#5A5868]">
                    Tidak ada sparepart pada klaim ini
                  </p>
                </div>
              )}

              {/* ── FOOTER ── */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50 dark:border-[#1e2130] bg-gray-50/50 dark:bg-[#0d0f18]/50">
                <span className="text-[10px] font-mono text-gray-300 dark:text-[#3A3848] truncate max-w-[180px]">
                  #{klaim.id.split("-")[0].toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteKlaimMutation.mutate(klaim.id)}
                    className="flex items-center gap-1 text-[10px] font-medium text-red-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/15"
                  >
                    <span>🗑️</span> Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
        isLoading={updateStatusMutation.isPending}
        onSave={(payload) => updateStatusMutation.mutate(payload)}
      />
      <ModalKlaimGaransi
        open={openGaransi}
        products={sparepartMaster}
        onClose={() => setOpenGaransi(false)}
        // products={products}
        isLoading={createKlaimMutation.isPending}
        onSubmit={(payload) =>
          createKlaimMutation.mutate({
            ...payload,
            idService: id, // 🔥 WAJIB
          })
        }
      />{" "}
    </div>
  );
}

function ModalEditStatus({ open, onClose, data, onSave, isLoading }) {
  const [status, setStatus] = useState(data?.statusServis || "Pending");

  useEffect(() => {
    if (data) setStatus(data.status);
  }, [data]);

  const STATUS_LIST = [
    "Proses",
    "Selesai",
    "Gagal",
    "Batal",
    "Pending",
    "Sudah Diambil",
  ];

  const [garansiDate, setGaransiDate] = useState("");
  const addDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0]; // format yyyy-mm-dd
  };

  if (!open) return null;

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

        {status === "Sudah Diambil" && (
          <div className="mb-4">
            <p className="text-xs mb-2 text-gray-500 dark:text-gray-400">
              Garansi sampai
            </p>

            {/* INPUT DATE */}
            <input
              type="date"
              value={garansiDate || ""} // 🔥 penting
              onChange={(e) => setGaransiDate(e.target.value)}
              className="w-full mb-2 px-3 py-2 rounded-lg text-xs 
      bg-gray-100 dark:bg-[#252530] 
      text-gray-700 dark:text-white 
      border border-gray-200 dark:border-[#2A2A38] outline-none"
            />

            {/* QUICK BUTTON */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tanpa Garansi", val: 0 },
                { label: "1 Hari", val: 1 },
                { label: "3 Hari", val: 3 },
                { label: "1 Minggu", val: 7 },
                { label: "2 Minggu", val: 14 },
                { label: "1 Bulan", val: 30 },
                { label: "2 Bulan", val: 60 },
                { label: "3 Bulan", val: 90 },
                { label: "4 Bulan", val: 120 },
                { label: "5 Bulan", val: 150 },
              ].map((item) => {
                const isActive =
                  item.val === 0
                    ? garansiDate === null
                    : garansiDate === addDays(item.val);

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.val === 0) {
                        setGaransiDate(null);
                      } else {
                        setGaransiDate(addDays(item.val));
                      }
                    }}
                    className={`px-2 py-1 text-[10px] rounded-md transition-all
        ${
          isActive
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 dark:bg-[#2f3245] text-gray-700 dark:text-gray-300"
        }
      `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-medium dark:bg-[#252530] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2a2d42] hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            onClick={() => onSave({ status, garansiDate })}
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalKlaimGaransi({
  open,
  onClose,
  products = [],
  onSubmit,
  isLoading,
}) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [keterangan, setKeterangan] = useState("");
  const [items, setItems] = useState([]);
  const [searchSp, setSearchSp] = useState("");
  const [showSpDrop, setShowSpDrop] = useState(false);
  const [selectedSp, setSelectedSp] = useState(null);
  const [spareparts, setSpareparts] = useState([]);

  const handleAdd = () => {
    if (!selectedProduct || qty <= 0) return;

    const product = products.find((p) => p.id === selectedProduct);

    setItems((prev) => [
      ...prev,
      {
        idProduct: product.id,
        nama: product.nama,
        quantityProduct: qty,
        keterangan,
      },
    ]);

    // reset
    setSelectedProduct("");
    setQty(1);
    setKeterangan("");
  };

  const removeSparepart = (id) =>
    setSpareparts((p) => p.filter((s) => s.id !== id));

  const handleRemove = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQty = (id, delta) => {
    setSpareparts((p) =>
      p
        .map((s) =>
          s.id === id
            ? {
                ...s,
                qty: Math.max(
                  1,
                  Math.min(
                    s.qty + delta,
                    products.find((m) => m.id === id)?.stok ?? 99
                  )
                ),
              }
            : s
        )
        .filter((s) => s.qty > 0)
    );
  };

  const handleSubmit = () => {
    const mappedItems = spareparts.map((sp) => ({
      idProduct: sp.id,
      quantityProduct: sp.qty,
      // keterangan: keterangan || "Klaim garansi",
    }));

    onSubmit({
      items: mappedItems,
      keterangan,
    });
  };

  const addSparepart = () => {
    if (!selectedSp) return;
    const existing = spareparts.find((s) => s.id === selectedSp.id);
    if (existing) {
      if (existing.qty + 1 > selectedSp.stok)
        return Swal.fire("Stok habis", "", "error");
      setSpareparts((p) =>
        p.map((s) => (s.id === selectedSp.id ? { ...s, qty: s.qty + 1 } : s))
      );
    } else {
      if (selectedSp.stok <= 0) return Swal.fire("Stok habis", "", "error");
      setSpareparts((p) => [...p, { ...selectedSp, qty: 1 }]);
    }
    setSearchSp("");
    setSelectedSp(null);
    setShowSpDrop(false);
  };

  const filteredSp = products?.filter((sp) =>
    sp.nama.toLowerCase().includes(searchSp.toLowerCase())
  );
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-[#13151f] sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 dark:border-[#1e2130] max-h-[90vh] flex flex-col">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#1e2130] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-sm">🛡️</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-[#ECEAE3]">
              Klaim Garansi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-[#1e2130] hover:bg-gray-200 dark:hover:bg-[#252838] transition-colors"
          >
            <X size={14} className="text-gray-500 dark:text-[#6b7080]" />
          </button>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* KETERANGAN */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 dark:text-[#5A5868] uppercase tracking-wider mb-1.5 block">
              Keterangan
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] focus-within:border-emerald-400 dark:focus-within:border-emerald-600 transition-colors">
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[12px] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858]"
                placeholder="Tulis keterangan klaim garansi..."
              />
            </div>
          </div>

          {/* SPAREPART SECTION */}
          <div className="rounded-xl bg-gray-50 dark:bg-[#0d0f18] border border-gray-100 dark:border-[#1e2130] p-4 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-[#5A5868] uppercase tracking-wider">
              Sparepart
            </p>

            {/* Search sparepart */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] focus-within:border-emerald-400 dark:focus-within:border-emerald-600 transition-colors">
                <Search
                  size={13}
                  className="text-gray-400 dark:text-[#4A4858] shrink-0"
                />
                <input
                  value={searchSp}
                  onChange={(e) => {
                    setSearchSp(e.target.value);
                    setSelectedSp(null);
                    setShowSpDrop(true);
                  }}
                  onFocus={() => setShowSpDrop(true)}
                  placeholder="Ketik nama sparepart..."
                  className="flex-1 bg-transparent border-none outline-none text-[12px] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858]"
                />
              </div>

              {showSpDrop && searchSp && (
                <div className="absolute z-20 w-full mt-1.5 rounded-xl overflow-hidden bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] shadow-xl">
                  {filteredSp.slice(0, 6).map((sp) => (
                    <div
                      key={sp.id}
                      onClick={() => {
                        setSelectedSp(sp);
                        setSearchSp(sp.nama);
                        setShowSpDrop(false);
                      }}
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2C] transition-colors border-b border-gray-100 dark:border-[#1E1E2C] last:border-0"
                    >
                      <span className="text-[12px] text-gray-700 dark:text-[#DBD9D2]">
                        {sp.nama}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Rp {sp.hargaEceran?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                  {filteredSp.length === 0 && (
                    <p className="text-[11px] text-center py-4 text-gray-400 dark:text-[#5A5868]">
                      Tidak ditemukan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tambah button */}
            <button
              type="button"
              onClick={addSparepart}
              disabled={!selectedSp}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                selectedSp
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  : "bg-gray-50 dark:bg-[#1a1a28] text-gray-400 dark:text-[#4A4858] border-gray-200 dark:border-[#2A2A38]"
              }`}
            >
              <Plus size={13} />
              Tambah Sparepart
            </button>

            {/* Sparepart list */}
            {spareparts?.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                {spareparts.map((sp) => (
                  <div
                    key={sp.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-3 bg-white dark:bg-[#111118] border border-gray-100 dark:border-[#1E1E2C]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate text-gray-800 dark:text-[#DBD9D2]">
                        {sp.nama}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-[#5A5868] mt-0.5">
                        Rp {sp.hargaEceran?.toLocaleString("id-ID")} × {sp.qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Minus */}
                      <button
                        type="button"
                        onClick={() => updateQty(sp.id, -1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-[#252838] border border-gray-200 dark:border-[#2a2d3e] hover:bg-gray-200 dark:hover:bg-[#2a2d3e] transition-colors"
                      >
                        <Minus
                          size={10}
                          className="text-gray-500 dark:text-[#6b7080]"
                        />
                      </button>

                      <span className="text-[13px] font-bold w-5 text-center text-gray-800 dark:text-[#ECEAE3]">
                        {sp.qty}
                      </span>

                      {/* Plus */}
                      <button
                        type="button"
                        onClick={() => updateQty(sp.id, 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-[#252838] border border-gray-200 dark:border-[#2a2d3e] hover:bg-gray-200 dark:hover:bg-[#2a2d3e] transition-colors"
                      >
                        <Plus
                          size={10}
                          className="text-gray-500 dark:text-[#6b7080]"
                        />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeSparepart(sp.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ml-1 bg-red-50 dark:bg-[#2a1515] border border-red-100 dark:border-[#3b1515] hover:bg-red-100 dark:hover:bg-[#3a1818] transition-colors"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between items-center px-3 py-2 mt-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Total Sparepart
                  </span>
                  <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
                    Rp{" "}
                    {spareparts
                      .reduce((sum, sp) => sum + sp.hargaEceran * sp.qty, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-[#1e2130] flex gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#1e2130] text-gray-600 dark:text-[#6b7080] hover:bg-gray-200 dark:hover:bg-[#252838] transition-colors"
          >
            Batal
          </button>
          <button
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>🛡️ Simpan Klaim</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
