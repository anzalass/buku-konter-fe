import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Plus,
  SlidersHorizontal,
  Pencil,
  Trash2,
  X,
  Eye,
  PackagePlus,
  User,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { NumericFormat } from "react-number-format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

// ─── colour helpers ───────────────────────────────────────────────────────────
const BRAND_DOT = {
  Axis: "#8A5A9A",
  Indosat: "#D4A030",
  Telkomsel: "#5A8ABA",
  XL: "#5A9ADE",
  Smartfren: "#D07070",
  Tri: "#5AC47A",
  Byu: "#9A8ACE",
};
const BADGE = {
  blue: "bg-[#0A1828] text-[#5A9ADE]",
  green: "bg-[#0A2012] text-[#5AC47A]",
  amber: "bg-[#1E1204] text-[#CA8030]",
  purple: "bg-[#160C2C] text-[#8A6ACE]",
  red: "bg-[#200808] text-[#D07070]",
};
const KATEGORI_BADGE = {
  Voucher: "blue",
  Sparepart: "purple",
  Aksesoris: "green",
};

const fmt = (n) => (n ? "Rp " + Number(n).toLocaleString("id-ID") : "-");

// ─── seed data ────────────────────────────────────────────────────────────────

// ─── small reusable pieces ────────────────────────────────────────────────────
function Badge({ variant = "blue", children }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded-[5px] text-[9px] font-medium ${BADGE[variant]}`}
    >
      {children}
    </span>
  );
}

function IconBtn({ onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function ModalForm({ open, onClose, onSave, initial, user }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control, // 🔥 WAJIB
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama: "",
      kategori: "",
      sub_kategori: "",
      brand: "",
      stok: "",
      hargaModal: "",
      hargaGrosir: "",
      hargaEceran: "",
      penempatan: "",
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        nama: initial.nama || "",
        kategori: initial.kategori || "",
        sub_kategori: initial.sub_kategori || "",
        brand: initial.brand || "",
        stok: initial.stok || "",
        hargaModal: initial.hargaModal || "",
        hargaGrosir: initial.hargaGrosir || "",
        hargaEceran: initial.hargaEceran || "",
        penempatan: initial.penempatan || "",
      });
    } else {
      reset({
        nama: "",
        kategori: "",
        sub_kategori: "",
        brand: "",
        stok: "",
        hargaModal: "",
        hargaGrosir: "",
        hargaEceran: "",
        penempatan: "",
      });
    }
  }, [initial, reset]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => {
      if (initial) {
        return api.put(`produk/${initial.id}`, data, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
      return api.post(`produk`, data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },

    onSuccess: (res) => {
      queryClient.invalidateQueries(["produk"]);
      reset();
      onClose();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Produk berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
        background: "#181820",
        color: "#ECEAE3",
      });
    },

    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan produk",
        background: "#181820",
        color: "#ECEAE3",
      });
    },
  });

  const isLoading = mutation.isPending;
  const onSubmit = (data) => {
    const payload = {
      ...data,

      stok:
        data.stok !== "" && data.stok !== undefined
          ? Number(data.stok)
          : (initial?.stok ?? 0),

      hargaModal: data.hargaModal ?? initial?.hargaModal ?? null,
      hargaGrosir: data.hargaGrosir ?? initial?.hargaGrosir ?? null,
      hargaEceran: data.hargaEceran ?? initial?.hargaEceran ?? null,
    };

    mutation.mutate(payload);
  };
  const kategori = watch("kategori");
  if (!open) return null;

  const CurrencyField = ({ label, name, required }) => (
    <div className="mb-3">
      <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <Controller
        control={control}
        name={name}
        rules={{
          required: required ? `${label} wajib diisi` : false,
        }}
        render={({ field }) => (
          <NumericFormat
            value={field.value ?? ""}
            thousandSeparator="."
            decimalSeparator=","
            prefix="Rp "
            allowNegative={false}
            placeholder="Rp 0"
            onValueChange={(values) =>
              field.onChange(values.floatValue ?? null)
            }
            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          border ${
            errors[name]
              ? "border-red-400"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-500`}
          />
        )}
      />

      {errors[name] && (
        <p className="text-xs mt-1 text-red-400">{errors[name].message}</p>
      )}
    </div>
  );

  const Field = ({ label, name, type = "text", placeholder, required }) => (
    <div className="mb-3">
      <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...register(
          name,
          required ? { required: `${label} wajib diisi` } : {}
        )}
        className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors
      bg-gray-50 dark:bg-[#111118]
      text-gray-800 dark:text-white
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      border ${
        errors[name]
          ? "border-red-400"
          : "border-gray-200 dark:border-[#2A2A38]"
      }
      focus:border-indigo-500`}
      />

      {errors[name] && (
        <p className="text-xs mt-1 text-red-400">{errors[name].message}</p>
      )}
    </div>
  );

  const SelectField = ({ label, name, options, required }) => (
    <div className="mb-3">
      <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <select
        {...register(
          name,
          required ? { required: `${label} wajib diisi` } : {}
        )}
        className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors
      bg-gray-50 dark:bg-[#111118]
      text-gray-800 dark:text-white
      border ${
        errors[name]
          ? "border-red-400"
          : "border-gray-200 dark:border-[#2A2A38]"
      }
      focus:border-indigo-500`}
      >
        <option value="">Pilih {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {errors[name] && (
        <p className="text-xs mt-1 text-red-400">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-5 overflow-y-auto shadow-xl
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-semibold text-gray-800 dark:text-white">
            {initial ? "Edit Produk" : "Tambah Produk"}
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
    bg-gray-100 dark:bg-[#252530]
    hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={14} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field
            label="Nama"
            name="nama"
            placeholder="Nama produk..."
            required
          />
          <SelectField
            label="Kategori"
            name="kategori"
            options={["Voucher", "Sparepart", "Aksesoris"]}
            required
          />
          <Field
            label="Sub Kategori"
            name="sub_kategori"
            placeholder="Data, LCD, Kabel..."
          />
          {kategori === "Voucher" ? (
            <SelectField
              label="Provider"
              name="brand"
              options={[
                "Axis",
                "Smartfren",
                "XL",
                "Telkomsel",
                "Byu",
                "Tri",
                "Indosat",
              ]}
              required
            />
          ) : (
            <Field
              label="Brand"
              name="brand"
              placeholder="MacPlus, Robot, Vgen..."
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Stok" name="stok" type="number" placeholder="0" />
            <Field
              label="Penempatan"
              name="penempatan"
              placeholder="Etalase 22..."
            />
          </div>

          <div className="h-px my-3" style={{ background: "#232330" }} />
          <p
            className="text-[10px] mb-2 tracking-widest uppercase"
            style={{ color: "#5A5868" }}
          >
            Harga
          </p>

          <div className="gap-2">
            <CurrencyField label="Modal" name="hargaModal" required={true} />
            <CurrencyField label="Grosir" name="hargaGrosir" />
            <CurrencyField label="Eceran" name="hargaEceran" required={true} />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="py-2.5 rounded-xl text-sm font-medium
    bg-gray-100 dark:bg-[#1A1A28]
    text-gray-600 dark:text-gray-400
    border border-gray-200 dark:border-[#2A2A38]
    hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
    }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : initial ? (
                "Simpan"
              ) : (
                "Tambah"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Product List Item ────────────────────────────────────────────────────────
function ProdukItem({ item, onEdit, onDelete, onUpdateStok }) {
  const badgeVariant = KATEGORI_BADGE[item.kategori] ?? "blue";
  const dot = BRAND_DOT[item.brand];

  return (
    <div
      className="rounded-xl px-3 py-3 mb-1.5 flex items-center gap-2.5 transition-colors
      bg-white dark:bg-[#181820]
      border border-gray-100 dark:border-[#232330]
      hover:border-gray-300 dark:hover:border-[#383848]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-medium mb-1 truncate text-gray-800 dark:text-[#DBD9D2]">
          {item.nama}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {dot && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dot }}
            />
          )}

          <span
            className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: dot ?? "#7A7888" }}
          >
            {item.brand}
          </span>

          {item.stok != null && (
            <span
              className="px-1.5 py-px rounded text-[9px]
              bg-gray-100 dark:bg-[#1E1E2A]
              border border-gray-200 dark:border-[#2E2E3E]
              text-gray-500 dark:text-[#7A7888]"
            >
              Stok {item.stok}
            </span>
          )}

          <Badge variant={badgeVariant}>{item.penempatan}</Badge>
          {item.sub_kategori && (
            <Badge variant="purple">{item.sub_kategori}</Badge>
          )}
        </div>

        <p className="text-[10px] md:text-sm text-gray-500 dark:text-zinc-300">
          Modal {fmt(item.hargaModal)}
          {item.hargaGrosir && (
            <>
              {" "}
              · Grosir{" "}
              <span className="text-blue-500 dark:text-[#5A9ADE]">
                {fmt(item.hargaGrosir)}
              </span>
            </>
          )}
          {item.hargaEceran && (
            <>
              {" "}
              · Ecer{" "}
              <span className="text-emerald-500 dark:text-[#5AC47A]">
                {fmt(item.hargaEceran)}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
            bg-amber-50 dark:bg-[#1A1204]
            border border-amber-200 dark:border-[#3A2A08]
            hover:bg-amber-100 dark:hover:bg-[#251A06]"
        >
          <Pencil size={14} className="text-amber-500 dark:text-[#CA8030]" />
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
            bg-red-50 dark:bg-[#1C0808]
            border border-red-200 dark:border-[#3A1010]
            hover:bg-red-100 dark:hover:bg-[#2a1010]"
        >
          <Trash2 size={14} className="text-red-400 dark:text-[#D07070]" />
        </button>

        <button
          onClick={() => onUpdateStok?.(item)}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
            bg-blue-50 dark:bg-[#0A1828]
            border border-blue-200 dark:border-[#1A2A48]
            hover:bg-blue-100 dark:hover:bg-[#0e2038]"
        >
          <PackagePlus
            size={14}
            className="text-blue-500 dark:text-[#5A9ADE]"
          />
        </button>
      </div>
    </div>
  );
}

export default function Product() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  // State utama
  const [modalForm, setModalForm] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openStok, setOpenStok] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // State pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Sesuaikan dengan default di service

  // State filter
  const [filter, setFilter] = useState({
    search: "",
    brand: "",
    kategori: "",
    penempatan: "",
    subKategori: "",
    createdStart: "",
    createdEnd: "",
    updatedStart: "",
    updatedEnd: "",
  });

  // Reset ke halaman 1 saat filter berubah
  const applyFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // 🔥 Reset halaman
    setModalFilter(false);
  };

  // =========================
  // 🔥 GET PRODUK DENGAN PAGINATION
  // =========================
  const { data: produkData, isLoading } = useQuery({
    queryKey: ["produk", page, pageSize, filter],
    queryFn: async () => {
      const params = {
        ...filter,
        page,
        pageSize,
      };
      const res = await api.get("produk", {
        params,
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data;
    },
    enabled: !!user?.token,
  });

  const data = produkData?.data || [];
  const total = produkData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // =========================
  // 🔥 DELETE
  // =========================
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`produk/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produk"] });
      Swal.fire("Berhasil", "Produk dihapus", "success");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      icon: "warning",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) deleteMutation.mutate(id);
    });
  };

  // =========================
  // 🔥 UPDATE STOK
  // =========================
  const updateStokMutation = useMutation({
    mutationFn: ({ id, qty, type }) =>
      api.patch(
        `produk/${id}/stok`,
        { qty, type },
        { headers: { Authorization: `Bearer ${user.token}` } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produk"] });
      Swal.fire("Berhasil", "Stok diperbarui", "success");
    },
  });

  const handleUpdateStok = (item) => {
    setSelectedItem(item);
    setOpenStok(true);
  };

  // =========================
  // 🔥 EDIT / CREATE
  // =========================
  const handleEdit = (item) => {
    setEditItem(item);
    setModalForm(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setModalForm(true);
  };

  const activeFilters = Object.values(filter).filter(Boolean).length;

  return (
    <div>
      <div className="max-w-7xl p-2 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-0 py-2">
          <div>
            <p className="text-[11px] md:text-sm font-medium tracking-wider text-gray-500 dark:text-[#7A7888]">
              Produk
            </p>
            <p className="text-[10px] md:text-sm mt-0.5 text-gray-400 dark:text-[#4A4858]">
              {data.length} dari {total}{" "}
              {activeFilters > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-px rounded text-[9px]
          bg-gray-100 dark:bg-[#1A1A28]
          text-gray-500 dark:text-[#8A8AAE]
          border border-gray-200 dark:border-[#2A2A38]"
                >
                  {activeFilters} filter aktif
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => navigate("/dashboard/barang-keluar")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] md:text-sm font-medium cursor-pointer transition-colors
        bg-blue-50 dark:bg-[#0A1828]
        text-blue-500 dark:text-[#5A9ADE]
        border border-blue-200 dark:border-[#1A2A48]
        hover:bg-blue-100 dark:hover:bg-[#0e2038]"
            >
              <FileText size={11} /> Barang Keluar
            </button>

            <button
              onClick={() => setModalFilter(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm cursor-pointer transition-colors
        bg-gray-100 dark:bg-[#1A1A28]
        text-gray-500 dark:text-[#9A9AAE]
        border border-gray-200 dark:border-[#2E2E42]
        hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              <SlidersHorizontal size={12} />
              Filter
              {activeFilters > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center
          bg-indigo-200 dark:bg-[#4A4A68]
          text-indigo-700 dark:text-[#ECEAE3]"
                >
                  {activeFilters}
                </span>
              )}
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm font-semibold cursor-pointer transition-colors
        bg-green-700 dark:bg-[#ECEAE3]
        text-white dark:text-[#0D0D10]
        hover:bg-gray-700 dark:hover:bg-white"
            >
              <Plus size={12} strokeWidth={2.5} />
              Tambah
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-2">
          {isLoading ? (
            <p>Loading...</p>
          ) : data.length === 0 ? (
            <p>Tidak ada data</p>
          ) : (
            data.map((item) => (
              <ProdukItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStok={handleUpdateStok}
              />
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs md:text-sm text-gray-400">
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} dari {total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} className="dark:text-white" />
              </button>
              <span className="px-2 py-0.5 bg-gray-800 text-white rounded text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="dark:text-white" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <ModalForm
        user={user}
        open={modalForm}
        onClose={() => {
          setModalForm(false);
          setEditItem(null);
        }}
        initial={editItem}
      />

      <ModalFilter
        open={modalFilter}
        onClose={() => setModalFilter(false)}
        onApply={applyFilter} // 🔥 Gunakan fungsi yang reset halaman
      />

      <ModalUpdateStok
        open={openStok}
        onClose={() => setOpenStok(false)}
        item={selectedItem}
        onSave={(updated) => {
          updateStokMutation.mutate({
            id: updated.id,
            qty: Number(updated.qty),
            type: updated.mode,
          });
        }}
      />
    </div>
  );
}

function ModalUpdateStok({ open, onClose, item, onSave }) {
  const [mode, setMode] = useState("tambah"); // tambah | kurang | set
  const [qty, setQty] = useState("");

  if (!open || !item) return null;

  const handleSubmit = () => {
    const value = Number(qty);
    if (!value && value !== 0) return;

    onSave({
      ...item,
      qty: value, // 🔥 kirim qty asli
      mode, // 🔥 kirim type
    });

    setQty("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{
          background: "#181820",
          border: "1px solid #2A2A38",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-white font-medium">Update Stok</p>
          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>

        {/* INFO PRODUK */}
        <div className="mb-4">
          <p className="text-xs text-gray-400">Produk</p>
          <p className="text-sm text-white font-medium">{item.nama}</p>
          <p className="text-[11px] text-blue-400">
            Stok sekarang: {item.stok ?? 0}
          </p>
        </div>

        {/* MODE */}
        <div className="flex gap-2 mb-4">
          {["tambah", "kurang", "set"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-xs"
              style={{
                background: mode === m ? "#4f46e5" : "#252530",
                color: mode === m ? "#fff" : "#6A6870",
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Masukkan jumlah..."
          className="w-full px-3 py-2 rounded-lg text-xs mb-4"
          style={{
            background: "#111118",
            border: "1px solid #2A2A38",
            color: "#ECEAE3",
          }}
        />

        {/* PREVIEW */}
        <p className="text-[11px] text-gray-400 mb-4">
          Stok setelah update:{" "}
          <span className="text-green-400">
            {(() => {
              const val = Number(qty || 0);
              let result = item.stok ?? 0;

              if (mode === "tambah") result += val;
              if (mode === "kurang") result -= val;
              if (mode === "set") result = val;

              return result < 0 ? 0 : result;
            })()}
          </span>
        </p>

        {/* ACTION */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs"
            style={{ background: "#252530", color: "#6A6870" }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg text-xs font-semibold"
            style={{ background: "#ECEAE3", color: "#0D0D10" }}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalFilter({ open, onClose, onApply }) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [penempatan, setPenempatan] = useState("");
  const [kategori, setKategori] = useState("");
  const [subKategori, setSubKategori] = useState("");

  // 🔥 DATE FILTER
  const [createdStart, setCreatedStart] = useState("");
  const [createdEnd, setCreatedEnd] = useState("");
  const [updatedStart, setUpdatedStart] = useState("");
  const [updatedEnd, setUpdatedEnd] = useState("");

  if (!open) return null;

  const reset = () => {
    setSearch("");
    setBrand("");
    setPenempatan("");
    setKategori("");
    setSubKategori("");
    setCreatedStart("");
    setCreatedEnd("");
    setUpdatedStart("");
    setUpdatedEnd("");
  };

  const apply = () => {
    // 🔥 VALIDASI BASIC
    if (createdStart && createdEnd && createdStart > createdEnd) {
      alert("Created date tidak valid");
      return;
    }
    if (updatedStart && updatedEnd && updatedStart > updatedEnd) {
      alert("Updated date tidak valid");
      return;
    }

    onApply({
      search,
      brand,
      penempatan,
      kategori,
      subKategori,
      createdStart,
      createdEnd,
      updatedStart,
      updatedEnd,
    });

    onClose();
  };

  const inputClass = `
w-full px-3 py-2 rounded-lg text-[11px] mb-3
bg-gray-50 dark:bg-[#111118]
border border-gray-200 dark:border-[#2A2A38]
text-gray-900 dark:text-[#ECEAE3]
placeholder-gray-400 dark:placeholder-gray-500
focus:outline-none focus:ring-2 focus:ring-indigo-500/40
focus:border-indigo-500
transition-colors duration-200
`;
  const providerList = [
    "Axis",
    "Smartfren",
    "XL",
    "Telkomsel",
    "Byu",
    "Tri",
    "Indosat",
  ];

  const subKategoriList = [
    "LCD",
    "Baterai",
    "Charger",
    "Kabel",
    "Casing",
    "Tempered Glass",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-4 sm:p-5 overflow-y-auto max-h-[90vh]
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    shadow-xl transition-colors duration-300"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Filter Produk
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center
        bg-gray-100 dark:bg-[#252530]
        text-gray-600 dark:text-gray-400
        hover:bg-gray-200 dark:hover:bg-[#2f3245]
        transition"
          >
            ✕
          </button>
        </div>

        {/* 🔍 NAMA */}
        <label className="text-[10px] text-gray-500 dark:text-gray-400">
          Nama Produk
        </label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk..."
          className={inputClass}
        />

        {/* 📂 KATEGORI */}
        <label className="text-[10px] text-gray-500 dark:text-gray-400">
          Kategori
        </label>
        <select
          value={kategori}
          onChange={(e) => {
            setKategori(e.target.value);
            setBrand("");
            setSubKategori("");
          }}
          className={inputClass}
        >
          <option value="">Semua</option>
          {["Voucher", "Sparepart", "Aksesoris"].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        {/* 🔥 CONDITIONAL */}
        {kategori === "Voucher" && (
          <>
            <label className="text-[10px] bg-white text-gray-500 dark:text-gray-400">
              Provider
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            >
              <option value="">Semua</option>
              {providerList.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </>
        )}

        {(kategori === "Aksesoris" || kategori === "Sparepart") && (
          <>
            <label className="text-[10px] text-gray-500 dark:text-gray-400">
              Sub Kategori
            </label>
            <select
              value={subKategori}
              onChange={(e) => setSubKategori(e.target.value)}
              className={inputClass}
            >
              <option value="">Semua</option>
              {subKategoriList.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </>
        )}

        {/* 📍 PENEMPATAN */}
        <label className="text-[10px] text-gray-500 dark:text-gray-400">
          Penempatan
        </label>
        <input
          value={penempatan}
          onChange={(e) => setPenempatan(e.target.value)}
          placeholder="Cari etalase..."
          className={inputClass}
        />

        {/* 📅 CREATED */}
        <label className="text-[10px] text-gray-500 dark:text-gray-400">
          Created At
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="date"
            value={createdStart}
            onChange={(e) => setCreatedStart(e.target.value)}
            className={inputClass}
          />
          <input
            type="date"
            value={createdEnd}
            onChange={(e) => setCreatedEnd(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 🔄 UPDATED */}
        <label className="text-[10px] text-gray-500 dark:text-gray-400">
          Updated At
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="date"
            value={updatedStart}
            onChange={(e) => setUpdatedStart(e.target.value)}
            className={inputClass}
          />
          <input
            type="date"
            value={updatedEnd}
            onChange={(e) => setUpdatedEnd(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* ACTION */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={reset}
            className="py-2 rounded text-xs font-medium
        bg-gray-100 dark:bg-[#252530]
        text-gray-600 dark:text-gray-400
        hover:bg-gray-200 dark:hover:bg-[#2f3245]
        transition"
          >
            Reset
          </button>

          <button
            onClick={apply}
            className="py-2 rounded text-xs font-semibold
        bg-indigo-600 hover:bg-indigo-700
        text-white shadow-md shadow-indigo-500/20
        transition"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
