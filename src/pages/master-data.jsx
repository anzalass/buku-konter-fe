import {
  Plus,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Wallet,
  User,
  FileText,
  Phone,
  Calendar,
  Hash,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";

const SEED_MEMBER = [
  {
    id: "1",
    nama: "Leonardo Messi",
    noTelp: "087811226622",
    kodeMember: "JAVACELL-1773816367",
    createdAt: "18 Mar 2026",
  },
  {
    id: "2",
    nama: "Aufaa Rahmi",
    noTelp: "087877308846",
    kodeMember: "JAVACELL-1773816256",
    createdAt: "18 Mar 2026",
  },
  {
    id: "3",
    nama: "Budi Santoso",
    noTelp: "081234567890",
    kodeMember: "JAVACELL-1773820001",
    createdAt: "19 Mar 2026",
  },
];

const SEED_DATA_MEMBER = [
  {
    id: "1",
    nama: "PLN Aufaa",
    nomor: "766778113800",
    memberNama: "Aufaa Rahmi",
  },
  {
    id: "2",
    nama: "BPJS Messi",
    nomor: "0001234567890",
    memberNama: "Leonardo Messi",
  },
  {
    id: "3",
    nama: "Token Budi",
    nomor: "123456789012",
    memberNama: "Budi Santoso",
  },
];

const SEED_UANG_KELUAR = [
  {
    id: "1",
    keterangan: "Beli stok voucher",
    jumlah: 500000,
    tanggal: "20 Mar 2026",
  },
  {
    id: "2",
    keterangan: "Servis peralatan",
    jumlah: 150000,
    tanggal: "19 Mar 2026",
  },
  {
    id: "3",
    keterangan: "Bayar listrik toko",
    jumlah: 300000,
    tanggal: "18 Mar 2026",
  },
];

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const BG = "#181820";
const BDR = "1px solid #232330";
const BDR_H = "#383848";

function SectionHeader({ title, count, onAdd, onFilter, activeFilters }) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <div>
        <p className="text-[11px] md:text-sm uppercase tracking-widest mb-0.5 text-gray-800 dark:text-white">
          {title}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          {count} data
        </p>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={onFilter}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm cursor-pointer transition-colors
            bg-gray-100 dark:bg-[#1a1a28]
            text-gray-500 dark:text-[#9a9aae]
            border border-gray-200 dark:border-[#2e2e42]
            hover:bg-gray-200 dark:hover:bg-[#222232]"
        >
          <SlidersHorizontal size={12} />
          Filter
          {activeFilters > 0 && (
            <span
              className="ml-1 px-1.5 py-px rounded text-[9px]
              bg-indigo-200 dark:bg-[#4A4A68]
              text-indigo-700 dark:text-[#ECEAE3]"
            >
              {activeFilters}
            </span>
          )}
        </button>

        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm font-semibold cursor-pointer transition-colors
            bg-green-700 dark:bg-[#ECEAE3]
            text-white dark:text-[#0D0D10]
            hover:bg-gray-700 dark:hover:bg-white"
        >
          <Plus size={12} strokeWidth={2.5} /> Tambah
        </button>
      </div>
    </div>
  );
}

function Acts({ onEdit, onDelete }) {
  return (
    <div className="flex gap-1.5 flex-shrink-0">
      <button
        onClick={onEdit}
        className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors
          bg-amber-50 dark:bg-[#1a1204]
          border border-amber-200 dark:border-[#3a2a08]
          hover:bg-amber-100 dark:hover:bg-[#251a06]"
      >
        <Pencil size={11} className="text-amber-500 dark:text-[#ca8030]" />
      </button>

      <button
        onClick={onDelete}
        className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors
          bg-red-50 dark:bg-[#1c0808]
          border border-red-200 dark:border-[#3a1010]
          hover:bg-red-100 dark:hover:bg-[#2a1010]"
      >
        <Trash2 size={11} className="text-red-400 dark:text-[#d07070]" />
      </button>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div className="rounded-xl py-10 text-center bg-gray-50 dark:bg-[#181820] border border-dashed border-gray-200 dark:border-[#232330] transition-colors">
      <Package className="mx-auto mb-2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Belum ada {label}
      </p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      className="
      rounded-2xl px-4 py-3.5
      bg-white dark:bg-[#181820]
      border border-gray-200 dark:border-[#232330]
      hover:border-gray-300 dark:hover:border-[#2f3245]
      shadow-sm hover:shadow-md
      transition-all duration-200
      "
    >
      {children}
    </div>
  );
}
// ─── panels ───────────────────────────────────────────────────────────────────

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("member");

  const TABS = [
    { id: "member", label: "Member", panel: <PanelMember /> },
    { id: "data-member", label: "No Trx Member", panel: <PanelDataMember /> },
    { id: "uang-modal", label: "Uang Keluar", panel: <PanelUangKeluar /> },
    {
      id: "kejadian-tak-terduga",
      label: "Kejadian Tak Terduga",
      panel: <PanelKejadianTakTerduga />,
    },
  ];

  const current = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* TABS */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] md:text-sm whitespace-nowrap transition-colors border
            ${
              activeTab === t.id
                ? "bg-green-700 dark:bg-[#ECEAE3] text-white dark:text-[#0D0D10] dark:border-[#ECEAE3]"
                : "bg-white dark:bg-[#181820] text-gray-600 dark:text-white border-gray-200 dark:border-[#252530] hover:bg-gray-100 dark:hover:bg-[#222232]"
            }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>{current?.panel}</div>
      </div>
    </div>
  );
}

function PanelMember() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const nav = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState({
    search: "",
    noTelp: "",
  });

  const cleanParams = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== "" && v !== null)
    );

  const [openFilter, setOpenFilter] = useState(false);

  // =========================
  // 🔥 GET DATA
  // =========================
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["member", filter, page],
    queryFn: async () => {
      const res = await api.get("member/filter", {
        params: cleanParams({
          ...filter,
          page,
          pageSize,
        }),
        headers: { Authorization: `Bearer ${user.token}` },
      });

      return res.data;
    },
    keepPreviousData: true,
    enabled: !!user?.token,
  });

  const list = data?.data || [];
  const meta = data?.meta || {};
  // =========================
  // 🔥 DELETE
  // =========================
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`member/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["member"],
        exact: false,
      });
      Swal.fire("Berhasil", "Member dihapus", "success");
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

  const handleEdit = (item) => {
    setEditItem(item);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setOpenModal(true);
  };

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const activeFilters = Object.values(filter).filter(Boolean).length;

  return (
    <>
      <SectionHeader
        title="Member"
        count={meta.total || 0}
        onAdd={handleAdd}
        onFilter={handleOpenFilter}
        activeFilters={activeFilters}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <Empty label="member" />
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
          {list.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold  dark:bg-[#1e1b4b] text-indigo-500 dark:text-[#818cf8] shrink-0">
                    {m.nama.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-green-900 font-bold dark:text-[#dbd9d2] truncate">
                      {m.nama}
                    </p>

                    <div className="flex gap-3 text-[10px] md:text-[12px] text-gray-800 dark:text-zinc-200 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone size={9} /> {m.noTelp || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] mt-1
                bg-blue-50 dark:bg-[#0a1828]
                text-blue-500 dark:text-[#5a9ade]"
                    >
                      <Hash size={8} /> {m.kodeMember}
                    </span>
                  </div>
                </div>

                <Acts
                  onEdit={() => handleEdit(m)}
                  onDelete={() => handleDelete(m.id)}
                />

                <button
                  onClick={() => nav(`/dashboard/member/trx/${m.id}`)}
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center cursor-pointer transition-colors
              bg-emerald-50 dark:bg-[#0A2012]
              border border-emerald-200 dark:border-[#1E3A28]
              hover:bg-emerald-100 dark:hover:bg-[#0e2a18]"
                >
                  <Eye
                    size={11}
                    className="text-emerald-500 dark:text-[#5AC47A]"
                  />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          disabled={!meta.hasPrev}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          <ChevronLeft />
        </button>

        <p className="text-xs text-gray-400">
          Page {meta.page || 1} / {meta.totalPages || 1}
        </p>

        <button
          disabled={!meta.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          <ChevronRight />
        </button>
      </div>

      <p className="text-[10px] text-gray-500 mt-2">
        Total Member: {meta.total || 0}
      </p>

      {/* MODAL */}
      <ModalMember
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditItem(null);
        }}
        initial={editItem}
        user={user}
      />

      <ModalFilterMember
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(val) => {
          setFilter(val);
          setPage(1); // 🔥 penting
        }}
        initial={filter}
      />
    </>
  );
}

function ModalMember({ open, onClose, initial, user }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { nama: "", noTelp: "" },
  });

  useEffect(() => {
    reset(
      initial
        ? { nama: initial.nama, noTelp: initial.noTelp || "" }
        : { nama: "", noTelp: "" }
    );
  }, [initial, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      initial
        ? api.put(`member/${initial.id}`, data, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
        : api.post(`member`, data, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["member"],
        exact: false,
      });
      onClose();
      Swal.fire("Berhasil", "Data tersimpan", "success");
    },
  });

  if (!open) return null;

  const inp = {
    background: "#111118",
    border: "1px solid #2A2A38",
    color: "#ECEAE3",
    fontFamily: "inherit",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5
    bg-white dark:bg-[#181820]
    border border-gray-100 dark:border-[#2A2A38]
    shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Member
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
          bg-gray-100 dark:bg-[#252530]
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-3"
        >
          {/* Nama */}
          <div>
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Nama <span className="text-red-400">*</span>
            </p>
            <input
              {...register("nama", { required: "Nama wajib diisi" })}
              placeholder="Masukkan nama member..."
              className={`w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-[#ECEAE3]
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border focus:border-indigo-400 dark:focus:border-[#4A4A68]
            ${
              errors.nama
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-[#2A2A38]"
            }`}
            />
            {errors.nama && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* No Telp */}
          <div className="pb-2">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              No Telepon
            </p>
            <input
              {...register("noTelp")}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-[#ECEAE3]
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Buttons */}
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
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white 
  flex items-center justify-center gap-2
  transition-all disabled:opacity-60 disabled:cursor-not-allowed
  bg-green-600 dark:bg-indigo-600
  hover:bg-green-700 dark:hover:bg-indigo-700"
            >
              {mutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalFilterMember({ open, onClose, onApply, initial }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: "",
      noTelp: "",
    },
  });

  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  if (!open) return null;

  const onSubmit = (data) => {
    onApply(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5
    bg-white dark:bg-[#181820]
    border border-gray-100 dark:border-[#2A2A38]
    shadow-xl"
      >
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
          Filter Member
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Nama */}
          <div>
            <label className="text-[10px] text-gray-500 dark:text-[#6A6870] block mb-1.5">
              Nama
            </label>
            <input
              {...register("search")}
              placeholder="Cari nama..."
              className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            border border-gray-200 dark:border-[#2A2A38]
            text-gray-800 dark:text-[#ECEAE3]
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* No Telp */}
          <div className="pb-2">
            <label className="text-[10px] text-gray-500 dark:text-[#6A6870] block mb-1.5">
              No Telepon
            </label>
            <input
              {...register("noTelp")}
              placeholder="08xxxx..."
              className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            border border-gray-200 dark:border-[#2A2A38]
            text-gray-800 dark:text-[#ECEAE3]
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onApply({ nama: "", noTelp: "" });
                onClose();
              }}
              className="flex-1 py-2 rounded-lg text-xs cursor-pointer transition-colors
            bg-gray-100 dark:bg-[#252530]
            text-gray-500 dark:text-[#6A6870]
            hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors
            bg-green-600 dark:bg-[#ECEAE3]
            text-white dark:text-[#0D0D10]
            hover:bg-green-700 dark:hover:bg-white"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PanelDataMember() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [filter, setFilter] = useState({
    search: "",
  });

  // 🔥 CLEAN PARAMS
  const cleanParams = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== "" && v !== null)
    );

  // =========================
  // 🔥 GET DATA
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["data-member", filter, page],
    queryFn: async () => {
      const res = await api.get("data-member", {
        params: cleanParams({
          ...filter,
          page,
          pageSize,
        }),
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return res.data;
    },
    keepPreviousData: true, // 🔥 smooth pagination
    enabled: !!user?.token,
  });

  const list = data?.data || [];
  const meta = data?.pagination || {};
  // =========================
  // 🔥 CREATE / UPDATE
  // =========================
  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editItem) {
        return api.put(`data-member/${editItem.id}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      return api.post(`data-member`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["data-member"],
        exact: false,
      });
      setOpenModal(false);
      setEditItem(null);

      Swal.fire("Berhasil", "Data tersimpan", "success");
    },
  });

  // =========================
  // 🔥 DELETE
  // =========================
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`data-member/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["data-member"],
        exact: false,
      });
      Swal.fire("Berhasil", "Data dihapus", "success");
    },
  });

  return (
    <>
      <SectionHeader
        title="No Trx Member"
        count={list.length}
        onAdd={() => {
          setEditItem(null);
          setOpenModal(true);
        }}
        onFilter={() => setOpenFilter(true)}
        activeFilters={Object.values(filter).filter(Boolean).length}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <Empty label="data member" />
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
          {list.map((d) => (
            <Card key={d.id}>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-green-900 font-bold dark:text-[#dbd9d2]">
                    {d.nama}
                  </p>
                  <p className="text-[10px] dark:text-[#5a5868]">{d.nomor}</p>
                  {d.Member && (
                    <span className="text-[9px] dark:text-purple-400 text-green-900">
                      {d.Member.nama}
                    </span>
                  )}
                </div>

                <Acts
                  onEdit={() => {
                    setEditItem(d);
                    setOpenModal(true);
                  }}
                  onDelete={() => deleteMutation.mutate(d.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Prev
        </button>

        <p className="text-xs text-gray-400">
          Page {meta.page || 1} / {meta.totalPages || 1}
        </p>

        <button
          disabled={page >= meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Total Data: {meta.total || 0}
      </p>

      <ModalDataMember
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditItem(null);
        }}
        initial={editItem}
        onSubmit={mutation.mutate}
        user={user}
        isLoading={mutation.isPending} // 🔥 TAMBAHIN
      />
      <ModalFilterDataMember
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(val) => {
          setFilter(val);
          setPage(1); // 🔥 reset page
        }}
        initial={filter}
      />
    </>
  );
}

function ModalDataMember({
  open,
  onClose,
  onSubmit,
  initial,
  user,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama: "",
      nomor: "",
      idMember: "",
    },
  });

  const inp = {
    background: "#111118",
    color: "#ECEAE3",
    borderColor: "#2A2A38",
  };

  const [searchMember, setSearchMember] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allMembers, setAllMembers] = useState([]); // ✅ Simpan semua member

  // 🔥 FETCH SEMUA MEMBER SEKALI SAAT MODAL DIBUKA
  useEffect(() => {
    if (open && user?.token) {
      const fetchAllMembers = async () => {
        try {
          const res = await api.get("member", {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setAllMembers(res.data.data || []);
        } catch (err) {
          console.error("Gagal fetch member:", err);
          setAllMembers([]);
        }
      };
      fetchAllMembers();
    }
  }, [open, user?.token]);

  // 🔥 FILTER DI FRONTEND
  const filteredMembers = useMemo(() => {
    if (!searchMember.trim()) return allMembers;
    const term = searchMember.toLowerCase();
    return allMembers.filter(
      (m) =>
        m.nama.toLowerCase().includes(term) ||
        (m.noTelp && m.noTelp.includes(term))
    );
  }, [searchMember, allMembers]);

  useEffect(() => {
    if (initial) {
      reset({
        nama: initial.nama,
        nomor: initial.nomor,
        idMember: initial.idMember || "",
      });
      setSearchMember(initial.Member?.nama || "");
    } else {
      reset({
        nama: "",
        nomor: "",
        idMember: "",
      });
      setSearchMember("");
    }
  }, [initial, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5
    bg-white dark:bg-[#181820]
    border border-gray-100 dark:border-[#2A2A38]
    shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Data Member
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
          bg-gray-100 dark:bg-[#252530]
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => onSubmit(d))}
          className={`space-y-3 transition-opacity ${
            isLoading ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          {" "}
          {/* Cari Member */}
          <div className="relative">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Cari Member
            </p>
            <input
              value={searchMember}
              disabled={isLoading}
              onChange={(e) => {
                setSearchMember(e.target.value);
                setShowDropdown(true);
                setValue("idMember", "");
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Ketik nama member..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />

            {showDropdown && filteredMembers.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 rounded-xl max-h-40 overflow-y-auto shadow-lg
            bg-white dark:bg-[#111118]
            border border-gray-200 dark:border-[#2A2A38]"
              >
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSearchMember(m.nama);
                      setValue("idMember", m.id);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 text-[13px] cursor-pointer transition-colors
                  text-gray-700 dark:text-white
                  hover:bg-gray-50 dark:hover:bg-[#1A1A28]
                  border-b border-gray-100 dark:border-[#1E1E2C] last:border-0"
                  >
                    {m.nama}{" "}
                    {m.noTelp && (
                      <span className="text-gray-400 dark:text-[#5A5868]">
                        ({m.noTelp})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Nama */}
          <div>
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Nama <span className="text-red-400">*</span>
            </p>
            <input
              disabled={isLoading}
              {...register("nama", { required: "Nama wajib diisi" })}
              placeholder="Masukkan nama lengkap..."
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border focus:border-indigo-400 dark:focus:border-[#4A4A68]
            ${
              errors.nama
                ? "border-red-400 dark:border-red-500"
                : "border-gray-200 dark:border-[#2A2A38]"
            }`}
            />
            {errors.nama && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.nama.message}
              </p>
            )}
          </div>
          {/* Nomor HP */}
          <div className="pb-2">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Nomor HP
            </p>
            <input
              disabled={isLoading}
              {...register("nomor")}
              placeholder="08xxxxxxxxxx"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
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
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white 
  flex items-center justify-center gap-2
  transition-all disabled:opacity-60 disabled:cursor-not-allowed
  bg-indigo-500 dark:bg-indigo-600
  hover:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalFilterDataMember({ open, onClose, onApply, initial }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const inp = {
    background: "#111118",
    color: "#ECEAE3",
    borderColor: "#2A2A38",
  };

  useEffect(() => {
    if (initial) reset(initial);
  }, [initial]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5
    bg-white dark:bg-[#181820]
    border border-gray-100 dark:border-[#2A2A38]
    shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              filter
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Member
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors
          bg-gray-100 dark:bg-[#252530]
          hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
          className="space-y-4"
        >
          {/* Pencarian */}
          <div className="pb-2">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Cari Nama / No HP
            </p>
            <input
              {...register("search")}
              placeholder="Ketik nama atau nomor..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ search: "" });
                onApply({ search: "" });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-colors
            bg-gray-100 dark:bg-[#1A1A28]
            text-gray-500 dark:text-[#6A6878]
            border border-gray-200 dark:border-[#2A2A38]
            hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white cursor-pointer transition-opacity
            bg-indigo-500 dark:bg-indigo-600
            hover:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PanelUangKeluar() {
  const BG = "#181820";
  const BDR = "1px solid #2A2A38";

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ["uang-modal", filters, page],
    queryFn: async () => {
      const params = {
        ...filters,
        page,
        pageSize,
      };

      const res = await api.get("uang-modal", {
        params,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      return res.data;
    },
    keepPreviousData: true, // 🔥 biar smooth pagination
    enabled: !!user?.token,
  });
  const uangKeluar = data?.data || [];
  const meta = data?.meta || {};
  const total = uangKeluar.reduce((s, d) => s + d.jumlah, 0);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post("uang-modal", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uang-modal"] });
      Swal.fire("Berhasil!", "Data uang keluar ditambahkan", "success");
      setOpenForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...formData }) =>
      api.put(`uang-modal/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uang-modal"] });
      Swal.fire("Berhasil!", "Data uang keluar diperbarui", "success");
      setOpenForm(false);
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`uang-modal/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uang-modal"] });
      Swal.fire("Berhasil!", "Data uang keluar dihapus", "success");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="">
      {/* <SectionHeader title="Uang Keluar" count={uangKeluar.length} /> */}
      <SectionHeader
        title="Uang Keluar"
        count={uangKeluar.length}
        onAdd={() => {
          setEditItem(null);
          setOpenForm(true);
        }}
        onFilter={() => setOpenFilter(true)}
        activeFilters={Object.values(filters).filter(Boolean).length}
      />
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3
    bg-white dark:bg-[#13151f]
    border border-gray-100 dark:border-[#1e2130]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
      bg-red-50 dark:bg-[#200808]"
          >
            <Wallet size={14} className="text-red-400 dark:text-[#d07070]" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5 text-gray-800 dark:text-[#fff]">
              Total Keluar
            </p>
            <p className="text-sm font-semibold text-red-400 dark:text-[#d07070]">
              {fmt(total)}
            </p>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3
    bg-white dark:bg-[#13151f]
    border border-gray-100 dark:border-[#1e2130]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
      bg-indigo-50 dark:bg-[#1e1b4b]"
          >
            <Hash size={14} className="text-indigo-400 dark:text-[#818cf8]" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5 text-gray-800 dark:text-[#fff]">
              Total Transaksi
            </p>
            <p className="text-sm font-semibold text-indigo-400 dark:text-[#818cf8]">
              {uangKeluar.length}
            </p>
          </div>
        </div>
      </div>
      {/* List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : uangKeluar.length === 0 ? (
        <Empty label="uang keluar" />
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
          {uangKeluar.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm  mb-0.5 truncate text-green-700 font-bold dark:text-zinc-100">
                    {u.keterangan}
                  </p>
                  <p
                    className="text-[10px] mb-2 flex items-center gap-1"
                    style={{ color: "#5a5868" }}
                  >
                    <Calendar size={9} />{" "}
                    {new Date(u.tanggal).toLocaleDateString("id-ID")}
                  </p>
                  <span className="p-2 rounded-md text-[11px] md:text-sm font-semibold bg-red-300">
                    {fmt(u.jumlah)}
                  </span>
                </div>
                <Acts
                  onEdit={() => {
                    setEditItem(u);
                    setOpenForm(true);
                  }}
                  onDelete={() => handleDelete(u.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-green-700 dark:bg-indigo-700 disabled:opacity-50"
        >
          <ChevronLeft className="text-white" />
        </button>

        <p className="text-xs text-gray-400">
          Page {meta.page || 1} / {meta.totalPages || 1}
        </p>

        <button
          disabled={page === meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-green-700 dark:bg-indigo-700 disabled:opacity-50"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Total Data: {meta.total || 0}
      </p>
      {/* Modals */}
      <ModalFormUangKeluar
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditItem(null);
        }}
        initial={editItem}
        onSubmit={(data) => {
          if (editItem) {
            updateMutation.mutate(data);
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending} // 🔥 TAMBAH
      />
      <ModalFilterUangKeluar
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1); // 🔥 reset ke page 1
          setOpenFilter(false);
        }}
        currentFilters={filters}
      />
    </div>
  );
}

function ModalFormUangKeluar({ open, onClose, onSubmit, initial, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      keterangan: initial?.keterangan || "",
      jumlah: initial?.jumlah || "",
      tanggal: initial?.tanggal
        ? new Date(initial.tanggal).toISOString().split("T")[0]
        : "",
    },
  });
  const nominal = watch("jumlah");

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 transition-colors
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    shadow-xl"
      >
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
            disabled={isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        bg-gray-100 dark:bg-[#252530]
        hover:bg-gray-200 dark:hover:bg-[#2e2e3e]
        disabled:opacity-50"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Keterangan */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Keterangan <span className="text-red-400">*</span>
            </p>

            <input
              {...register("keterangan")}
              placeholder="Contoh: Beli perlengkapan toko..."
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border
          ${
            errors.keterangan
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-400 dark:focus:border-[#4A4A68]`}
            />

            {errors.keterangan && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.keterangan.message}
              </p>
            )}
          </div>

          {/* Jumlah */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Jumlah (Rp) <span className="text-red-400">*</span>
            </p>

            <NumericFormat
              value={nominal}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              allowNegative={false}
              onValueChange={(values) => {
                setValue("jumlah", values.floatValue, { shouldValidate: true });
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border
          ${
            errors.jumlah
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-400 dark:focus:border-[#4A4A68]`}
              placeholder="Rp 0"
            />
            {/* 
            <input
              {...register("jumlah")}
              type="number"
              placeholder="100000"
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border
          ${
            errors.jumlah
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-400 dark:focus:border-[#4A4A68]`}
            /> */}

            {errors.jumlah && (
              <p className="text-[10px] mt-1 text-red-400">
                {errors.jumlah.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div className="mb-5">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Tanggal
            </p>

            <input
              {...register("tanggal")}
              type="date"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          border border-gray-200 dark:border-[#2A2A38]
          focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-colors
          bg-gray-100 dark:bg-[#1A1A28]
          text-gray-500 dark:text-[#6A6878]
          border border-gray-200 dark:border-[#2A2A38]
          hover:bg-gray-200 dark:hover:bg-[#222232]
          disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white
          flex items-center justify-center gap-2
          bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalFilterUangKeluar({ open, onClose, onApply, currentFilters }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: currentFilters?.search || "",
      startDate: currentFilters?.startDate || "",
      endDate: currentFilters?.endDate || "",
    },
  });

  const inp = {
    background: "#111118",
    color: "#ECEAE3",
    borderColor: "#2A2A38",
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 transition-colors
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              filter
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Uang Keluar
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        bg-gray-100 dark:bg-[#252530]
        hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
        >
          {/* Search */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Cari Keterangan
            </p>

            <input
              {...register("search")}
              placeholder="Ketik keterangan..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border border-gray-200 dark:border-[#2A2A38]
          focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div>
              <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
                Dari
              </p>

              <input
                {...register("startDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
              />
            </div>

            <div>
              <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
                Sampai
              </p>

              <input
                {...register("endDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ search: "", startDate: "", endDate: "" });
                onApply({ search: "", startDate: "", endDate: "" });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-colors
          bg-gray-100 dark:bg-[#1A1A28]
          text-gray-500 dark:text-[#6A6878]
          border border-gray-200 dark:border-[#2A2A38]
          hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              Reset
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-colors
          bg-indigo-600 hover:bg-indigo-700"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PanelKejadianTakTerduga() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  // 🔥 FETCH
  const { data, isLoading } = useQuery({
    queryKey: ["kejadian", filters, page],
    queryFn: async () => {
      const params = {
        q: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        pageSize,
      };

      const res = await api.get("kejadian-tak-terduga", {
        params,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      return res.data;
    },
    keepPreviousData: true,
    enabled: !!user?.token,
  });

  const kejadian = data?.data || [];
  const meta = data?.meta || {};

  const total = kejadian.reduce((s, d) => s + d.nominal, 0);

  // 🔥 CREATE
  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post("kejadian-tak-terduga", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejadian"] });
      Swal.fire("Berhasil!", "Data berhasil ditambahkan", "success");
      setOpenForm(false);
    },
  });

  // 🔥 UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, ...formData }) =>
      api.put(`kejadian-tak-terduga/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejadian"] });
      Swal.fire("Berhasil!", "Data berhasil diperbarui", "success");
      setOpenForm(false);
      setEditItem(null);
    },
  });

  // 🔥 DELETE
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`kejadian-tak-terduga/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kejadian"] });
      Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then((res) => {
      if (res.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div>
      {/* HEADER */}
      <SectionHeader
        title="Kejadian Tak Terduga"
        count={kejadian.length}
        onAdd={() => {
          setEditItem(null);
          setOpenForm(true);
        }}
        onFilter={() => setOpenFilter(true)}
        activeFilters={Object.values(filters).filter(Boolean).length}
      />

      {/* STATS */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3
    bg-white dark:bg-[#13151f]
    border border-gray-100 dark:border-[#1e2130]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
      bg-red-50 dark:bg-[#200808]"
          >
            <Wallet size={14} className="text-red-400 dark:text-[#d07070]" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5 text-gray-800 dark:text-[#fff]">
              Total Keluar
            </p>
            <p className="text-sm font-semibold text-red-400 dark:text-[#d07070]">
              {fmt(total)}
            </p>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3
    bg-white dark:bg-[#13151f]
    border border-gray-100 dark:border-[#1e2130]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
      bg-indigo-50 dark:bg-[#1e1b4b]"
          >
            <Hash size={14} className="text-indigo-400 dark:text-[#818cf8]" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5 text-gray-800 dark:text-[#fff]">
              Total Transaksi
            </p>
            <p className="text-sm font-semibold text-indigo-400 dark:text-[#818cf8]">
              {kejadian.length}
            </p>
          </div>
        </div>
      </div>

      {/* LIST */}
      {isLoading ? (
        <p>Loading...</p>
      ) : kejadian.length === 0 ? (
        <Empty label="kejadian" />
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {kejadian.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm  mb-0.5 truncate text-green-700 font-bold dark:text-zinc-100">
                    {u.keterangan}
                  </p>
                  <p
                    className="text-[10px] mb-2 flex items-center gap-1"
                    style={{ color: "#5a5868" }}
                  >
                    <Calendar size={9} />{" "}
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <span className="p-2 rounded-md text-[11px] md:text-sm font-semibold bg-red-300">
                    {fmt(u.nominal)}
                  </span>
                </div>
                <Acts
                  onEdit={() => {
                    setEditItem(u);
                    setOpenForm(true);
                  }}
                  onDelete={() => handleDelete(u.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between mt-4">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span>
          {meta.page} / {meta.totalPages}
        </span>

        <button
          disabled={page === meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      <ModalFormKejadianTakTerduga
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditItem(null);
        }}
        initial={editItem}
        onSubmit={(data) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.id, ...data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ModalFilterKejadianTakTerduga
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
        currentFilters={filters}
      />
    </div>
  );
}

function ModalFormKejadianTakTerduga({
  open,
  onClose,
  onSubmit,
  initial,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      keterangan: initial?.keterangan || "",
      nominal: initial?.nominal || 0,
    },
  });

  const nominal = watch("nominal");

  if (!open) return null;

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.keterangan.trim()) {
      newErrors.keterangan = "Keterangan wajib diisi";
    }

    if (!data.nominal || data.nominal < 1) {
      newErrors.nominal = "Nominal minimal Rp 1";
    }

    return newErrors;
  };

  const handleFormSubmit = (data) => {
    clearErrors();

    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, { type: "manual", message });
      });
      return;
    }

    onSubmit({
      keterangan: data.keterangan,
      nominal: Number(data.nominal),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl p-5 bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase text-gray-400">
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold">Kejadian Tak Terduga</p>
          </div>

          <button onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* KETERANGAN */}
          <div className="mb-3">
            <p className="text-[11px] mb-1">Keterangan *</p>

            <input
              {...register("keterangan")}
              placeholder="Contoh: Kehilangan barang..."
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border
          ${
            errors.keterangan
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-400 dark:focus:border-[#4A4A68]`}
            />

            {errors.keterangan && (
              <p className="text-[10px] text-red-400">
                {errors.keterangan.message}
              </p>
            )}
          </div>

          {/* NOMINAL (🔥 NumericFormat) */}
          <div className="mb-5">
            <p className="text-[11px] mb-1">Nominal *</p>

            <NumericFormat
              value={nominal}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              allowNegative={false}
              onValueChange={(values) => {
                setValue("nominal", values.floatValue || 0);
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border
          ${
            errors.jumlah
              ? "border-red-400 dark:border-red-500"
              : "border-gray-200 dark:border-[#2A2A38]"
          }
          focus:border-indigo-400 dark:focus:border-[#4A4A68]`}
              placeholder="Rp 0"
            />

            {errors.nominal && (
              <p className="text-[10px] text-red-400">
                {errors.nominal.message}
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-colors
          bg-gray-100 dark:bg-[#1A1A28]
          text-gray-500 dark:text-[#6A6878]
          border border-gray-200 dark:border-[#2A2A38]
          hover:bg-gray-200 dark:hover:bg-[#222232]
          disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white
          flex items-center justify-center gap-2
          bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalFilterKejadianTakTerduga({
  open,
  onClose,
  onApply,
  currentFilters,
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: currentFilters?.search || "",
      startDate: currentFilters?.startDate || "",
      endDate: currentFilters?.endDate || "",
    },
  });

  const inp = {
    background: "#111118",
    color: "#ECEAE3",
    borderColor: "#2A2A38",
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 transition-colors
    bg-white dark:bg-[#181820]
    border border-gray-200 dark:border-[#2A2A38]
    shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest mb-0.5 text-gray-400 dark:text-[#5A5868]">
              filter
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#ECEAE3]">
              Uang Keluar
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        bg-gray-100 dark:bg-[#252530]
        hover:bg-gray-200 dark:hover:bg-[#2e2e3e]"
          >
            <X size={12} className="text-gray-500 dark:text-[#6A6878]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
        >
          {/* Search */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
              Cari Keterangan
            </p>

            <input
              {...register("search")}
              placeholder="Ketik keterangan..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
          bg-gray-50 dark:bg-[#111118]
          text-gray-800 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-[#4A4858]
          border border-gray-200 dark:border-[#2A2A38]
          focus:border-indigo-400 dark:focus:border-[#4A4A68]"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div>
              <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
                Dari
              </p>

              <input
                {...register("startDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
              />
            </div>

            <div>
              <p className="text-[11px] mb-1.5 text-gray-500 dark:text-[#6A6870]">
                Sampai
              </p>

              <input
                {...register("endDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors
            bg-gray-50 dark:bg-[#111118]
            text-gray-800 dark:text-white
            border border-gray-200 dark:border-[#2A2A38]
            focus:border-indigo-400 dark:focus:border-[#4A4A68]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ search: "", startDate: "", endDate: "" });
                onApply({ search: "", startDate: "", endDate: "" });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-colors
          bg-gray-100 dark:bg-[#1A1A28]
          text-gray-500 dark:text-[#6A6878]
          border border-gray-200 dark:border-[#2A2A38]
          hover:bg-gray-200 dark:hover:bg-[#222232]"
            >
              Reset
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-colors
          bg-indigo-600 hover:bg-indigo-700"
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
