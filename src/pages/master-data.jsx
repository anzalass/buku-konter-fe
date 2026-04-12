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
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

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
        <p
          className="text-[11px] md:text-sm uppercase tracking-widest mb-0.5"
          style={{ color: "#fff" }}
        >
          {title}
        </p>
        <p className="text-[10px]" style={{ color: "#fff" }}>
          {count} data
        </p>
      </div>
      <div className="flex gap-1.5">
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm cursor-pointer hover:opacity-80"
          style={{
            background: "#1a1a28",
            color: "#9a9aae",
            border: "1px solid #2e2e42",
          }}
          onClick={onFilter}
        >
          {activeFilters > 0 && (
            <span
              className="ml-1 px-1.5 py-px rounded text-[9px]"
              style={{
                background: "#4A4A68",
                color: "#ECEAE3",
              }}
            >
              {activeFilters}
            </span>
          )}
          <SlidersHorizontal size={12} /> Filter
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] md:text-sm font-semibold cursor-pointer"
          style={{ background: "#ECEAE3", color: "#0D0D10" }}
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
        className="w-7 h-7 rounded-[7px] flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
        style={{ background: "#1a1204", border: "1px solid #3a2a08" }}
      >
        <Pencil size={11} color="#ca8030" />
      </button>
      <button
        onClick={onDelete}
        className="w-7 h-7 rounded-[7px] flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
        style={{ background: "#1c0808", border: "1px solid #3a1010" }}
      >
        <Trash2 size={11} color="#d07070" />
      </button>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div
      className="rounded-xl py-10 text-center"
      style={{ background: BG, border: "1px dashed #232330" }}
    >
      <p className="text-xs" style={{ color: "#4a4858" }}>
        Belum ada {label}
      </p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 transition-all"
      style={{ background: BG, border: BDR }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = BDR_H)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#232330")}
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
  ];

  const current = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* TABS */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-3.5 py-1.5 rounded-full text-[11px] md:text-sm"
              style={{
                background: activeTab === t.id ? "#ECEAE3" : "#181820",
                color: activeTab === t.id ? "#0D0D10" : "#fff",
                border: "1px solid #252530",
              }}
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
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ background: "#1e1b4b", color: "#818cf8" }}
                  >
                    {m.nama.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#dbd9d2] truncate">{m.nama}</p>

                    <div className="flex gap-3 text-[10px] md:text-[12px] text-zinc-300">
                      <span className="flex items-center gap-1">
                        <Phone size={9} /> {m.noTelp || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px]"
                      style={{ background: "#0a1828", color: "#5a9ade" }}
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
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ background: "#0A2012", border: "1px solid #1E3A28" }}
                >
                  <Eye size={11} color="#5AC47A" />
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5"
        style={{ background: "#181820", border: "1px solid #2A2A38" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-0.5"
              style={{ color: "#5A5868" }}
            >
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold" style={{ color: "#ECEAE3" }}>
              Member
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

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          {/* Nama */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Nama <span style={{ color: "#D07070" }}>*</span>
            </p>
            <input
              {...register("nama", { required: "Nama wajib diisi" })}
              placeholder="Masukkan nama member..."
              className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
              style={{
                ...inp,
                border: `1px solid ${errors.nama ? "#D07070" : "#2A2A38"}`,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.nama
                  ? "#D07070"
                  : "#2A2A38")
              }
            />
            {errors.nama && (
              <p className="text-[10px] mt-1" style={{ color: "#D07070" }}>
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* No Telp */}
          <div className="mb-5">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              No Telepon
            </p>
            <input
              {...register("noTelp")}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer"
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
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white cursor-pointer transition-opacity disabled:opacity-60"
              style={{ background: "#4f46e5" }}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
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
        <p className="text-sm text-white mb-4">Filter Member</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Nama */}
          <div className="mb-3">
            <label className="text-[10px] text-[#6A6870]">Nama</label>
            <input
              {...register("search")}
              placeholder="Cari nama..."
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={{
                background: "#111118",
                border: "1px solid #2A2A38",
                color: "#ECEAE3",
              }}
            />
          </div>

          {/* No Telp */}
          <div className="mb-4">
            <label className="text-[10px] text-[#6A6870]">No Telepon</label>
            <input
              {...register("noTelp")}
              placeholder="08xxxx..."
              className="w-full px-3 py-2 rounded-lg text-xs"
              style={{
                background: "#111118",
                border: "1px solid #2A2A38",
                color: "#ECEAE3",
              }}
            />
          </div>

          {/* ACTION */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onApply({ nama: "", noTelp: "" }); // reset filter
                onClose();
              }}
              className="flex-1 py-2 rounded-lg text-xs"
              style={{
                background: "#252530",
                color: "#6A6870",
              }}
            >
              Reset
            </button>

            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: "#ECEAE3",
                color: "#0D0D10",
              }}
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
                  <p className="text-sm text-[#dbd9d2]">{d.nama}</p>
                  <p className="text-[10px] text-[#5a5868]">{d.nomor}</p>
                  {d.Member && (
                    <span className="text-[9px] text-purple-400">
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

function ModalDataMember({ open, onClose, onSubmit, initial, user }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#181820", border: "1px solid #2A2A38" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-0.5"
              style={{ color: "#5A5868" }}
            >
              {initial ? "edit" : "tambah"}
            </p>
            <p className="text-sm font-semibold" style={{ color: "#ECEAE3" }}>
              Data Member
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

        <form onSubmit={handleSubmit((d) => onSubmit(d))}>
          {/* 🔥 AUTOCOMPLETE MEMBER (FILTER DI FE) */}
          <div className="mb-3 relative">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Cari Member
            </p>
            <input
              value={searchMember}
              onChange={(e) => {
                setSearchMember(e.target.value);
                setShowDropdown(true);
                setValue("idMember", ""); // reset ID jika user ketik manual
              }}
              placeholder="Ketik nama member..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={{
                ...inp,
                borderColor: "#2A2A38",
              }}
              onFocus={() => setShowDropdown(true)}
            />

            {/* Dropdown Member */}
            {showDropdown && filteredMembers.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 bg-[#111118] border border-[#2A2A38] rounded-xl max-h-40 overflow-y-auto"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
              >
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSearchMember(m.nama);
                      setValue("idMember", m.id);
                      // setValue("nama", m.nama);
                      // setValue("nomor", m.noTelp || "");
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 text-[13px] text-white hover:bg-[#1A1A28] cursor-pointer transition-colors"
                  >
                    {m.nama} {m.noTelp && `(${m.noTelp})`}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nama */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Nama <span style={{ color: "#D07070" }}>*</span>
            </p>
            <input
              {...register("nama", { required: "Nama wajib diisi" })}
              placeholder="Masukkan nama lengkap..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={{
                ...inp,
                borderColor: errors.nama ? "#D07070" : "#2A2A38",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.nama
                  ? "#D07070"
                  : "#2A2A38")
              }
            />
            {errors.nama && (
              <p className="text-[10px] mt-1" style={{ color: "#D07070" }}>
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* Nomor */}
          <div className="mb-5">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Nomor HP
            </p>
            <input
              {...register("nomor")}
              placeholder="08xxxxxxxxxx"
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
            />
          </div>

          {/* Action Buttons */}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#181820", border: "1px solid #2A2A38" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-0.5"
              style={{ color: "#5A5868" }}
            >
              filter
            </p>
            <p className="text-sm font-semibold" style={{ color: "#ECEAE3" }}>
              Member
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

        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
        >
          {/* Pencarian */}
          <div className="mb-5">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Cari Nama / No HP
            </p>
            <input
              {...register("search")}
              placeholder="Ketik nama atau nomor..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ search: "" });
                onApply({ search: "" });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium"
              style={{
                background: "#1A1A28",
                color: "#6A6878",
                border: "1px solid #2A2A38",
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-opacity"
              style={{ background: "#4f46e5" }}
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
    <div>
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
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: BG, border: BDR }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#200808" }}
          >
            <Wallet size={14} color="#d07070" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: "#5a5868" }}>
              Total Keluar
            </p>
            <p className="text-sm font-semibold" style={{ color: "#d07070" }}>
              {fmt(total)}
            </p>
          </div>
        </div>
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: BG, border: BDR }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#1e1b4b" }}
          >
            <Hash size={14} color="#818cf8" />
          </div>
          <div>
            <p className="text-[10px] mb-0.5" style={{ color: "#5a5868" }}>
              Total Transaksi
            </p>
            <p className="text-sm font-semibold" style={{ color: "#818cf8" }}>
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
                  <p
                    className="text-sm font-medium mb-0.5 truncate"
                    style={{ color: "#dbd9d2" }}
                  >
                    {u.keterangan}
                  </p>
                  <p
                    className="text-[10px] mb-2 flex items-center gap-1"
                    style={{ color: "#5a5868" }}
                  >
                    <Calendar size={9} />{" "}
                    {new Date(u.tanggal).toLocaleDateString("id-ID")}
                  </p>
                  <span
                    className="px-2 py-0.5 rounded-md text-[11px] md:text-sm font-semibold"
                    style={{ background: "#200808", color: "#d07070" }}
                  >
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
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Prev
        </button>

        <p className="text-xs text-gray-400">
          Page {meta.page || 1} / {meta.totalPages || 1}
        </p>

        <button
          disabled={page === meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Next
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
            updateMutation.mutate({ id: editItem.id, ...data });
          } else {
            createMutation.mutate(data);
          }
        }}
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

function ModalFormUangKeluar({ open, onClose, onSubmit, initial }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      keterangan: initial?.keterangan || "",
      jumlah: initial?.jumlah || "",
      tanggal: initial?.tanggal
        ? new Date(initial.tanggal).toISOString().split("T")[0]
        : "",
    },
  });

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
          <div className="mb-3">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Jumlah (Rp) <span style={{ color: "#D07070" }}>*</span>
            </p>
            <input
              {...register("jumlah")}
              type="number"
              placeholder="100000"
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
            {errors.jumlah && (
              <p className="text-[10px] mt-1" style={{ color: "#D07070" }}>
                {errors.jumlah.message}
              </p>
            )}
          </div>

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
              filter
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

        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
        >
          {/* Pencarian */}
          <div className="mb-3">
            <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
              Cari Keterangan
            </p>
            <input
              {...register("search")}
              placeholder="Ketik keterangan..."
              className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
              onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
            />
          </div>

          {/* Rentang Tanggal */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div>
              <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
                Dari
              </p>
              <input
                {...register("startDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
              />
            </div>
            <div>
              <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
                Sampai
              </p>
              <input
                {...register("endDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-[#111118] text-white outline-none transition-colors"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#4A4A68")}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A38")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset({ search: "", startDate: "", endDate: "" });
                onApply({ search: "", startDate: "", endDate: "" });
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-medium"
              style={{
                background: "#1A1A28",
                color: "#6A6878",
                border: "1px solid #2A2A38",
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-opacity"
              style={{ background: "#4f46e5" }}
            >
              Terapkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
