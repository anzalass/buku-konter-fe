import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import { NumericFormat } from "react-number-format";
import {
  ChevronLeft,
  User,
  Smartphone,
  FileText,
  Wrench,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Search,
  X,
  QrCode,
  Minus,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

// ─── style helpers ────────────────────────────────────────────────────────────
const BG = "#181820";
const BDR = "1px solid #232330";

const inp =
  "w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors";
const inpStyle = {
  background: "#111118",
  border: "1px solid #2A2A38",
  color: "#ECEAE3",
  fontFamily: "inherit",
};
const inpFocus = { borderColor: "#4A4A68" };

function Field({ label, error, children }) {
  return (
    <div>
      <p className="text-[11px] mb-1.5" style={{ color: "#6A6870" }}>
        {label}
      </p>
      {children}
      {error && (
        <p className="text-[10px] mt-1" style={{ color: "#D07070" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={13} color="#818cf8" />
      <p
        className="text-[11px] uppercase tracking-widest font-medium"
        style={{ color: "#5A5868" }}
      >
        {label}
      </p>
    </div>
  );
}

const STATUS_OPTS = ["Pending", "Proses", "Selesai", "Gagal", "Batal"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServiceHPPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      namaPelanggan: "",
      noHP: "",
      brandHP: "",
      keterangan: "",
      status: "Pending",
      biayaJasa: 0,
    },
  });

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sparepartMaster, setSparepartMaster] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [searchSp, setSearchSp] = useState("");
  const [showSpDrop, setShowSpDrop] = useState(false);
  const [selectedSp, setSelectedSp] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDrop, setShowMemberDrop] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const biayaJasa = watch("biayaJasa") || 0;
  const keuntungan =
    spareparts.reduce(
      (s, sp) => s + (sp.hargaEceran - sp.hargaModal) * sp.qty,
      0
    ) + parseFloat(biayaJasa);

  const filteredSp = sparepartMaster.filter((sp) =>
    sp.nama.toLowerCase().includes(searchSp.toLowerCase())
  );

  useEffect(() => {
    let html5QrCode = null;

    if (isScanning) {
      // Tunggu sedikit agar DOM selesai render
      const timer = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          console.error("Elemen #reader tidak ditemukan!");
          return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        html5QrCode = new Html5Qrcode("reader");
        html5QrCode
          .start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              const cleaned = decodedText.trim();
              const matched = membersList.find(
                (m) => m.noTelp === cleaned || m.kodeMember === cleaned
              );

              if (matched) {
                setSelectedMember(matched);
                Swal.fire({
                  title: "Berhasil!",
                  text: `${matched.nama} Telah mmelakukan transaksi`,
                  icon: "success",
                  timer: 1500,
                  showConfirmButton: false,
                });
              } else {
                Swal.fire({
                  title: "Member Tidak Ditemukan!",
                  text: `Kode "${cleaned}" tidak terdaftar.`,
                  icon: "error",
                });
              }
              setIsScanning(false);
            },
            (errorMessage) => {
              // Opsional: log error
              console.log(errorMessage);
            }
          )
          .catch((err) => {
            console.error("Gagal mulai scanner:", err);
            Swal.fire("Error", "Gagal membuka kamera", "error");
            setIsScanning(false);
          });
      }, 100); // Delay kecil agar DOM siap

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          html5QrCode.stop().then(() => html5QrCode.clear());
        }
      };
    }
  }, [isScanning, membersList]); // ✅ Tambahkan membersList

  // fetch
  useEffect(() => {
    Promise.all([
      api.get("member", { headers: { Authorization: `Bearer ${user.token}` } }),
      api.get("produk-sparepart", {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    ])
      .then(([mRes, spRes]) => {
        setMembersList(mRes.data.data || []);
        setSparepartMaster(spRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingMaster(false));
  }, [user.token]);

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

  const removeSparepart = (id) =>
    setSpareparts((p) => p.filter((s) => s.id !== id));

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
                    sparepartMaster.find((m) => m.id === id)?.stok ?? 99
                  )
                ),
              }
            : s
        )
        .filter((s) => s.qty > 0)
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post(
        "service-hp",
        {
          ...data,
          biayaJasa: Number(data.biayaJasa),
          sparePart: spareparts.map((s) => ({ id: s.id, qty: s.qty })),
          ...(selectedMember && { idMember: selectedMember.id }),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      await Swal.fire({
        title: "Berhasil!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      reset();
      setSpareparts([]);
      setSelectedMember(null);
      navigate(-1);
    } catch (err) {
      Swal.fire(
        "Oops!",
        err.response?.data?.error || "Gagal menyimpan",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMaster)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0D0D10" }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "#252838", borderTopColor: "#818cf8" }}
          />
          <p className="text-[12px]" style={{ color: "#5A5868" }}>
            Memuat data...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen py-5 px-4 pb-10 dark:bg-[#0D0D10]"
      style={{
        fontFamily: "'Sora', sans-serif",
        color: "#ECEAE3",
      }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Member */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130]">
            <SectionTitle icon={User} label="Member (opsional)" />
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#111118] border-2 border-gray-200 dark:border-[#2A2A38]">
                <Search
                  size={13}
                  className="text-gray-400 dark:text-[#4A4858] shrink-0"
                />
                <input
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setSelectedMember(null);
                    setShowMemberDrop(true);
                  }}
                  onFocus={() => setShowMemberDrop(true)}
                  placeholder="Cari nama atau nomor HP..."
                  className="flex-1 bg-transparent border-none outline-none text-[12px] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858]"
                />
                <QrCode
                  onClick={() => setIsScanning(true)}
                  size={13}
                  className="text-gray-400 dark:text-[#5A5868] cursor-pointer"
                />
              </div>

              <div
                id="reader"
                className={`w-full mx-auto transition-opacity duration-300 ${isScanning ? "block opacity-100" : "hidden opacity-0"}`}
              />

              {isScanning && (
                <button
                  type="button"
                  onClick={() => setIsScanning(false)}
                  className="w-full mt-3 py-2 bg-red-500 text-white rounded-lg text-sm"
                >
                  Batal Scan
                </button>
              )}

              {showMemberDrop && memberSearch && (
                <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] shadow-lg">
                  {membersList
                    .filter(
                      (m) =>
                        m.nama
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase()) ||
                        m.noTelp?.includes(memberSearch)
                    )
                    .slice(0, 6)
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m);
                          setMemberSearch("");
                          setShowMemberDrop(false);
                        }}
                        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E2C] transition-colors border-b border-gray-100 dark:border-[#1E1E2C] last:border-0"
                      >
                        <span className="text-[12px] text-gray-700 dark:text-[#DBD9D2]">
                          {m.nama}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                          {m.noTelp}
                        </span>
                      </div>
                    ))}
                  {membersList.filter((m) =>
                    m.nama.toLowerCase().includes(memberSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-[11px] text-center py-3 text-gray-400 dark:text-[#5A5868]">
                      Tidak ditemukan
                    </p>
                  )}
                </div>
              )}

              {selectedMember && (
                <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-[#052e16] border border-emerald-200 dark:border-[#1a3a20]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold bg-emerald-100 dark:bg-[#0a2012] text-emerald-600 dark:text-emerald-400">
                      {selectedMember.nama.charAt(0)}
                    </div>
                    <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      {selectedMember.nama}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedMember(null)}>
                    <X
                      size={12}
                      className="text-emerald-500 dark:text-emerald-400"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Pelanggan */}
          <div className="rounded-2xl p-4 space-y-4 bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130]">
            <SectionTitle icon={User} label="Info Pelanggan" />

            <Field
              label="Nama Pelanggan *"
              error={errors.namaPelanggan?.message}
            >
              <input
                {...register("namaPelanggan", { required: "Nama wajib diisi" })}
                placeholder="Masukkan nama pelanggan"
                className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </Field>

            <Field label="No HP *" error={errors.noHP?.message}>
              <input
                {...register("noHP", { required: "No HP wajib diisi" })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </Field>

            <Field label="Brand HP *" error={errors.brandHP?.message}>
              <input
                {...register("brandHP", { required: "Brand wajib diisi" })}
                placeholder="Contoh: iPhone 13, Samsung A54"
                className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              />
            </Field>
          </div>

          {/* Detail Kerusakan */}
          <div className="rounded-2xl p-4 space-y-4 bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130]">
            <SectionTitle icon={FileText} label="Detail Kerusakan" />

            <Field label="Keterangan *" error={errors.keterangan?.message}>
              <textarea
                {...register("keterangan", {
                  required: "Keterangan wajib diisi",
                })}
                placeholder="Jelaskan kerusakan atau keluhan..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors resize-none"
              />
            </Field>

            <Field label="Status *" error={errors.status?.message}>
              <select
                {...register("status", { required: true })}
                className="w-full px-3 py-2.5 rounded-xl text-[12px] appearance-none cursor-pointer bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Sparepart */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130]">
            <SectionTitle icon={Wrench} label="Sparepart" />

            <div className="relative mb-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38]">
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
                <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden bg-white dark:bg-[#181820] border border-gray-200 dark:border-[#2A2A38] shadow-lg">
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
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Rp {sp.hargaEceran?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                  {filteredSp.length === 0 && (
                    <p className="text-[11px] text-center py-3 text-gray-400 dark:text-[#5A5868]">
                      Tidak ditemukan
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addSparepart}
              disabled={!selectedSp}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium mb-3 transition-all border cursor-pointer disabled:opacity-40
        ${
          selectedSp
            ? "bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-500 dark:text-indigo-400 border-indigo-200 dark:border-[#2a2a38]"
            : "bg-gray-50 dark:bg-[#1a1a28] text-gray-400 dark:text-[#4A4858] border-gray-200 dark:border-[#2A2A38]"
        }`}
            >
              <Plus size={13} /> Tambah Sparepart
            </button>

            {spareparts.length > 0 && (
              <div className="flex flex-col gap-2">
                {spareparts.map((sp) => (
                  <div
                    key={sp.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-3 bg-gray-50 dark:bg-[#111118] border border-gray-100 dark:border-[#1E1E2C]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate text-gray-800 dark:text-[#DBD9D2]">
                        {sp.nama}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-[#5A5868]">
                        Rp {sp.hargaEceran?.toLocaleString("id-ID")} × {sp.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                      <span className="text-[13px] font-semibold w-5 text-center text-gray-800 dark:text-[#ECEAE3]">
                        {sp.qty}
                      </span>
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
                      <button
                        type="button"
                        onClick={() => removeSparepart(sp.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ml-1 bg-red-50 dark:bg-[#2a1515] border border-red-100 dark:border-[#3b1515] hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Biaya Jasa */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#13151f] border border-gray-100 dark:border-[#1e2130]">
            <SectionTitle icon={DollarSign} label="Biaya Jasa" />
            <NumericFormat
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              prefix="Rp "
              placeholder="Rp 0"
              className="w-full px-3 py-2.5 rounded-xl text-[12px] bg-gray-50 dark:bg-[#111118] border border-gray-200 dark:border-[#2A2A38] text-gray-800 dark:text-[#ECEAE3] placeholder:text-gray-400 dark:placeholder:text-[#4A4858] outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
              onValueChange={(v) => setValue("biayaJasa", v.floatValue ?? 0)}
            />
          </div>

          {/* Estimasi Keuntungan */}
          <div className="rounded-2xl px-4 py-3.5 flex items-center justify-between bg-emerald-50 dark:bg-[#052e16] border border-emerald-200 dark:border-[#1a3a20]">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={14}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Estimasi Keuntungan
              </p>
            </div>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Rp {keuntungan.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl text-[13px] font-medium cursor-pointer bg-gray-100 dark:bg-[#1a1a28] text-gray-500 dark:text-[#6A6878] border border-gray-200 dark:border-[#2A2A38] hover:bg-gray-200 dark:hover:bg-[#222232] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-opacity disabled:opacity-60 bg-green-600 dark:bg-indigo-600 hover:bg-green-700 dark:hover:bg-indigo-700"
            >
              {submitting ? "Menyimpan..." : "Simpan Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
