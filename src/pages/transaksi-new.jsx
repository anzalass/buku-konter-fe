import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  TrendingUp,
  User,
  Search,
  Plus,
  Minus,
  Receipt,
  X,
  CheckCircle,
  DollarSign,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2"; // ✅ Import SweetAlert
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";

const FILTER_CONFIG = {
  Voucher: {
    type: "brand",
    options: ["Telkomsel", "XL", "Axis", "Indosat", "Tri", "Smartfren", "By.U"],
    default: "Axis",
  },
  Sparepart: {
    type: "sub_kategori",
    options: ["LCD", "Baterai", "Papan Cas", "Flexibel", "Speaker"],
    default: "LCD",
  },
  Aksesoris: {
    type: "sub_kategori",
    options: ["Casing", "Kaca", "Charger", "Kabel Data", "Earphone"],
    default: "Casing",
  },
  Handphone: {
    type: "brand",
    options: ["Samsung", "Oppo", "Vivo", "Xiaomi", "Realme", "Apple"],
    default: "Samsung",
  },
};

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function TransaksiPage() {
  const [keranjang, setKeranjang] = useState([]);
  const { user, isCheckingAuth, fetchUser } = useAuthStore();
  const queryClient = useQueryClient();
  const nav = useNavigate();

  const [uangBayar, setUangBayar] = useState(0);
  const [showKembalianModal, setShowKembalianModal] = useState(false);
  const [member, setMember] = useState("");
  const [potonganHarga, setPotonganHarga] = useState(0);
  const [search, setSearch] = useState("");
  const [sukses, setSukses] = useState(false);
  const [flash, setFlash] = useState(null);
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedFilter, setSelectedFilter] = useState("Axis");
  const [selectedHarga, setSelectedHarga] = useState("eceran");
  const [membersList, setMembersList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const selectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch(``);
    setShowMemberDropdown(false);
  };

  const searchRef = useRef(null);

  // ... (useEffect tetap sama)

  const getHarga = (produk) => {
    if (selectedHarga === "grosir") {
      return produk.hargaGrosir ?? produk.hargaEceran;
    }
    return produk.hargaEceran;
  };

  const { data: PRODUK_TERLARIS = [], isLoading } = useQuery({
    queryKey: ["produk-active"],
    queryFn: async () => {
      const res = await api.get("produk-active", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5, // 🔥 cache 5 menit (biar POS cepat)
  });

  // Fetch members
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await api.get("member", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMembersList(res.data.data || []);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    fetchAllMembers();
  }, [user.token]);

  useEffect(() => {
    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  }, []);

  const [searchDebounce, setSearchDebounce] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounce(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  // Handle scan barcode (tetap sama)
  const handleInputChange = (value) => {
    const cleaned = value.trim().toUpperCase();
    setSearch(value);
    if (!cleaned) return;

    const produkMap = useMemo(() => {
      const map = new Map();
      PRODUK_TERLARIS.forEach((p) => {
        if (p.barcode) {
          map.set(p.barcode.toUpperCase(), p);
        }
      });
      return map;
    }, [PRODUK_TERLARIS]);

    const produk = produkMap.get(cleaned);
    if (produk) {
      tambahKeKeranjang(produk); // ✅ Gunakan fungsi yang sama
      setSearch("");
    }
  };

  // Filter produk (tetap sama)
  const produkFiltered = PRODUK_TERLARIS.filter((p) => {
    const matchSearch =
      p.nama?.toLowerCase().includes(searchDebounce.toLowerCase()) ||
      p.kategori?.toLowerCase().includes(searchDebounce.toLowerCase());

    if (selectedKategori !== "Semua" && p.kategori !== selectedKategori) {
      return false;
    }

    if (selectedKategori !== "Semua" && selectedFilter) {
      const config = FILTER_CONFIG[selectedKategori];

      if (config?.type === "brand" && p.brand !== selectedFilter) {
        return false;
      }

      if (
        config?.type === "sub_kategori" &&
        p.sub_kategori !== selectedFilter
      ) {
        return false;
      }
    }

    return matchSearch;
  });
  // ✅ FUNGSI TAMBAH KE KERANJANG DENGAN VALIDASI STOK
  const tambahKeKeranjang = (produk) => {
    // Cek stok
    if (produk.stok !== undefined && produk.stok <= 0) {
      Swal.fire({
        title: "Stok Habis!",
        text: `Stok ${produk.nama} sudah habis.`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    // Cek stok di keranjang
    const existing = keranjang.find((item) => item.id === produk.id);
    const currentQty = existing ? existing.qty : 0;

    if (produk.stok !== undefined && currentQty >= produk.stok) {
      Swal.fire({
        title: "Stok Tidak Cukup!",
        text: `Stok ${produk.nama} hanya tersisa ${produk.stok} pcs.`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Tambah ke keranjang
    setFlash(produk.id);
    setTimeout(() => setFlash(null), 400);
    setKeranjang((prev) => {
      const ada = prev.find((k) => k.id === produk.id);
      if (ada) {
        // Validasi stok saat tambah qty
        if (produk.stok !== undefined && ada.qty >= produk.stok) {
          Swal.fire({
            title: "Stok Maksimal!",
            text: `Tidak bisa menambah ${produk.nama}. Stok maksimal ${produk.stok} pcs.`,
            icon: "info",
            confirmButtonText: "OK",
          });
          return prev;
        }
        return prev.map((k) =>
          k.id === produk.id ? { ...k, qty: k.qty + 1 } : k
        );
      }
      return [...prev, { ...produk, qty: 1 }];
    });
  };

  // ✅ VALIDASI STOK SAAT UBAH QTY
  const ubahQty = (id, delta) => {
    setKeranjang((prev) => {
      return prev
        .map((k) => {
          if (k.id === id) {
            const newQty = k.qty + delta;

            // Validasi stok
            if (k.stok !== undefined) {
              if (newQty > k.stok) {
                Swal.fire({
                  title: "Stok Tidak Cukup!",
                  text: `Stok ${k.nama} hanya tersisa ${k.stok} pcs.`,
                  icon: "error",
                  confirmButtonText: "OK",
                });
                return k; // Batalkan perubahan
              }
              if (newQty <= 0) {
                return null; // Hapus jika qty <= 0
              }
            } else if (newQty <= 0) {
              return null;
            }

            return { ...k, qty: newQty };
          }
          return k;
        })
        .filter(Boolean); // Hapus item null
    });
  };

  const hapus = (id) => setKeranjang((prev) => prev.filter((k) => k.id !== id));

  const total = keranjang.reduce((s, k) => s + getHarga(k) * k.qty, 0);
  const totalItem = keranjang.reduce((s, k) => s + k.qty, 0);

  const {
    mutate: bayarMutate,
    isPending, // 🔥 ini loading state
  } = useMutation({
    mutationFn: async (payload) => {
      return await api.post("/transaksi-new", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["history"]);

      setSukses(true);

      setTimeout(() => {
        setSukses(false);
        setKeranjang([]);
        setSelectedMember(null);
        setMemberSearch("");

        nav("/dashboard/penggabungan");
      }, 500);
    },
    onError: (err) => {
      console.error(err);

      Swal.fire({
        title: "Gagal!",
        text: err?.response?.data?.message || "Terjadi kesalahan",
        icon: "error",
      });
    },
  });

  const bayar = () => {
    if (!keranjang.length) return;

    const payload = {
      idMember: selectedMember?.id || null,
      namaPembeli: selectedMember === null ? memberSearch : null,
      type: selectedHarga,
      potonganHarga: potonganHarga,
      keranjang: keranjang.map((item) => ({
        idProduk: item.id,
        qty: item.qty,
      })),
    };

    bayarMutate(payload);
  };

  const grandTotal = total - potonganHarga;
  const kembalian = uangBayar - grandTotal;
  const keyword = memberSearch.toLowerCase();

  return (
    <div className="min-h-screen px-2 mt-2">
      <div className="max-w-7xl mx-auto">
        {/* Search + Cart */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex relative items-center gap-2 px-3.5 py-2.5 rounded-xl flex-1 bg-gray-100 dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e]">
            <Search
              size={15}
              className="text-gray-400 dark:text-[#4a4d62] shrink-0"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Cari produk / scan barcode..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-[#e2e4ef] placeholder:text-gray-400 dark:placeholder:text-[#4a4d62]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 p-0 bg-transparent border-none cursor-pointer"
              >
                <X size={13} className="text-gray-400 dark:text-[#4a4d62]" />
              </button>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer bg-gray-100 dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e]">
              <span className="text-sm font-medium whitespace-nowrap text-gray-700 dark:text-[#e2e4ef]">
                {totalItem} item
              </span>
            </div>
            {totalItem > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold text-white bg-indigo-500">
                {totalItem}
              </div>
            )}
          </div>
        </div>

        {/* Filter Kategori */}
        <div className="mb-4">
          <div className="flex w-full overflow-x-auto gap-2 pb-1">
            {["Semua", "Voucher", "Sparepart", "Aksesoris", "Handphone"].map(
              (kat) => (
                <label
                  key={kat}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    selectedKategori === kat
                      ? "bg-green-600 dark:bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="kategori"
                    checked={selectedKategori === kat}
                    onChange={() => setSelectedKategori(kat)}
                    className="hidden"
                  />
                  {kat}
                </label>
              )
            )}
          </div>
        </div>

        {/* Filter Dinamis */}
        {selectedKategori !== "Semua" && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {FILTER_CONFIG[selectedKategori]?.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedFilter === opt
                      ? "bg-green-600 dark:bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Harga */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="harga"
                checked={selectedHarga === "grosir"}
                onChange={() => setSelectedHarga("grosir")}
                className="accent-emerald-500"
              />
              <span className="text-gray-700 dark:text-[#e2e4ef]">
                Harga Grosir
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="harga"
                checked={selectedHarga === "eceran"}
                onChange={() => setSelectedHarga("eceran")}
                className="accent-blue-500"
              />
              <span className="text-gray-700 dark:text-[#e2e4ef]">
                Harga Eceran
              </span>
            </label>
          </div>
        </div>

        {/* Produk */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-emerald-400" />
            <p className="text-[11px] tracking-widest uppercase text-gray-400 dark:text-[#4a4d62]">
              {search
                ? `hasil pencarian (${produkFiltered.length})`
                : "produk terlaris"}
            </p>
          </div>

          {produkFiltered.length === 0 ? (
            <div className="rounded-xl py-8 text-center bg-gray-50 dark:bg-[#1a1c29] border border-dashed border-gray-200 dark:border-[#2a2d3e]">
              <p className="text-sm text-gray-400 dark:text-[#4a4d62]">
                Produk tidak ditemukan
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {produkFiltered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => tambahKeKeranjang(p)}
                  className={`flex flex-col gap-1 px-3 py-3 rounded-2xl text-left w-full transition-all duration-150 cursor-pointer border
                ${
                  flash === p.id
                    ? "bg-indigo-50 dark:bg-[#1e2540] border-indigo-300 dark:border-[#818cf8]"
                    : "bg-gray-50 dark:bg-[#1a1c29] border-gray-200 dark:border-[#2a2d3e] hover:border-gray-300 dark:hover:border-[#3a3d52]"
                }`}
                >
                  <p className="text-[14px] font-medium truncate text-gray-800 dark:text-[#e2e4ef]">
                    {p.nama}
                  </p>
                  <p className="text-[12px] font-medium truncate text-gray-800 dark:text-[#e2e4ef]">
                    {p.brand}
                  </p>
                  <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">
                    {fmt(getHarga(p))}
                  </p>
                  {p.stok !== undefined && (
                    <p className="text-[12px] text-gray-700 dark:text-zinc-400">
                      Stok: {p.stok}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nama Pembeli */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <User size={13} className="text-violet-400" />
            <p className="text-[11px] tracking-widest uppercase text-gray-400 dark:text-[#4a4d62]">
              nama pembeli
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gray-100 dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e]">
            <User size={14} className="text-gray-400 dark:text-[#4a4d62]" />
            <input
              value={memberSearch}
              onChange={(e) => {
                const val = e.target.value;
                setMemberSearch(val);
                setSelectedMember(null);

                const cleaned = val.trim().toLowerCase();

                if (!cleaned) return;

                const matched = membersList.find(
                  (m) =>
                    m.noTelp === cleaned ||
                    m.kodeMember?.toLowerCase() === cleaned ||
                    m.nama?.toLowerCase() === cleaned
                );

                if (matched) {
                  setSelectedMember(matched);
                  setMemberSearch(""); // optional: kosongin biar clean
                  setShowMemberDropdown(false);
                } else {
                  setShowMemberDropdown(true);
                }
              }}
              placeholder="Nama pembeli (opsional)..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-[#e2e4ef]"
              onFocus={() =>
                membersList.length > 0 && setShowMemberDropdown(true)
              }
            />
          </div>

          {showMemberDropdown && (
            <div className="absolute z-50 w-[90%] mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-52 overflow-y-auto">
              {membersList
                .filter((m) => {
                  if (!keyword) return false; // biar kosong = ga muncul list

                  return (
                    m.nama?.toLowerCase().includes(keyword) ||
                    m.noTelp?.includes(keyword) ||
                    m.kodeMember?.toLowerCase().includes(keyword)
                  );
                })
                .slice(0, 6) // optional: limit biar ga kepanjangan
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMember(m)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {m.nama} {m.kodeMember ? `- ${m.kodeMember}` : ""}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {m.noTelp || "-"}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {selectedMember && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {selectedMember.nama}
                </span>
                {selectedMember.noTelp && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedMember.noTelp}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setMemberSearch("");
                }}
                className="ml-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Potongan Harga */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <DollarSign size={13} className="text-violet-400" />
            <p className="text-[11px] tracking-widest uppercase text-gray-400 dark:text-[#4a4d62]">
              Potongan Harga
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gray-100 dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e]">
            <DollarSign
              size={14}
              className="text-gray-400 dark:text-[#4a4d62]"
            />
            <NumericFormat
              value={potonganHarga}
              onValueChange={(values) =>
                setPotonganHarga(values.floatValue || 0)
              }
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              prefix="Rp "
              placeholder="Rp 0"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-[#e2e4ef] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Keranjang */}
        <div className={`pb-72 ${selectedMember ? "mt-5" : "mt-0"}`}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <ShoppingCart size={13} className="text-orange-400" />
            <p className="text-[11px] tracking-widest uppercase text-gray-400 dark:text-[#4a4d62]">
              keranjang
            </p>
          </div>

          {keranjang.length === 0 ? (
            <div className="rounded-xl py-7 text-center bg-gray-50 dark:bg-[#1a1c29] border border-dashed border-gray-200 dark:border-[#2a2d3e]">
              <ShoppingCart
                size={26}
                className="mx-auto mb-2 text-gray-300 dark:text-[#2a2d3e]"
              />
              <p className="text-xs text-gray-400 dark:text-[#4a4d62]">
                Keranjang masih kosong
              </p>
              <p className="text-xs mt-1 text-gray-300 dark:text-[#333647]">
                Pilih kategori dan produk untuk menambahkan
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {keranjang.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-0.5 text-gray-800 dark:text-[#c8cce0]">
                      {k.nama}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      {fmt(getHarga(k) * k.qty)}
                    </p>
                    {k.stok !== undefined && (
                      <p className="text-[10px] text-gray-700 dark:text-zinc-400">
                        Stok:{" "}
                        {k.stok -
                          (keranjang.find((item) => item.id === k.id)?.qty ||
                            0)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => ubahQty(k.id, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-[#252838] border border-gray-200 dark:border-[#2a2d3e] hover:bg-gray-200 dark:hover:bg-[#2a2d3e] transition-colors"
                    >
                      <Minus
                        size={10}
                        className="text-gray-500 dark:text-[#6b7080]"
                      />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center text-gray-800 dark:text-[#e2e4ef]">
                      {k.qty}
                    </span>
                    <button
                      onClick={() => ubahQty(k.id, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer bg-gray-100 dark:bg-[#252838] border border-gray-200 dark:border-[#2a2d3e] hover:bg-gray-200 dark:hover:bg-[#2a2d3e] transition-colors"
                    >
                      <Plus
                        size={10}
                        className="text-gray-500 dark:text-[#6b7080]"
                      />
                    </button>
                    <button
                      onClick={() => hapus(k.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ml-1 bg-red-50 dark:bg-[#2a1515] border border-red-100 dark:border-[#3b1515] hover:bg-red-100 dark:hover:bg-[#3b1515] transition-colors"
                    >
                      <Trash2 size={10} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total + Bayar */}
        {keranjang.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 p-4 z-10">
            <div className="max-w-lg mx-auto">
              <div className="rounded-2xl p-4 bg-white dark:bg-[#1a1c29] border border-gray-200 dark:border-[#2a2d3e] shadow-lg dark:shadow-none">
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <DollarSign size={13} className="text-emerald-400" />
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-[#4a4d62]">
                      Uang Customer
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl
  bg-gray-100 dark:bg-[#1a1c29]
  border border-gray-200 dark:border-[#2a2d3e]"
                  >
                    {/* INPUT UANG */}
                    <NumericFormat
                      value={uangBayar}
                      onValueChange={(values) =>
                        setUangBayar(values.floatValue || 0)
                      }
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      placeholder="Masukkan uang customer..."
                      disabled={isPending}
                      className="flex-1 bg-transparent outline-none
    text-lg font-semibold tracking-wide
    text-gray-900 dark:text-[#e2e4ef]
    placeholder:text-gray-400"
                    />

                    {/* 🔥 BUTTON UANG PAS */}
                    <button
                      disabled={isPending}
                      onClick={() => {
                        if (isPending) return;

                        setUangBayar(grandTotal);

                        // langsung proses
                        setTimeout(() => {
                          bayar();
                        }, 100);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg font-semibold transition-all
    ${
      isPending
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
    }`}
                    >
                      {isPending ? "Processing..." : "Uang Pas / Proses"}
                    </button>
                  </div>
                </div>
                {kembalian >= 0 && uangBayar > 0 && (
                  <div className="mb-3 text-right">
                    <p className="text-xs text-gray-500">Kembalian</p>
                    <p className="text-lg font-bold text-emerald-500">
                      {fmt(kembalian)}
                    </p>
                  </div>
                )}

                {kembalian < 0 && (
                  <p className="text-xs text-red-500 mb-3">
                    Uang kurang {fmt(Math.abs(kembalian))}
                  </p>
                )}
                {showKembalianModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white dark:bg-[#181820] rounded-2xl p-6 w-[90%] max-w-sm text-center">
                      <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                        Kembalian
                      </h2>

                      <p className="text-3xl font-bold text-emerald-500 mb-4">
                        {fmt(kembalian)}
                      </p>

                      <button
                        onClick={() => {
                          setShowKembalianModal(false);
                          setUangBayar(0);
                        }}
                        className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-[#4a4d62]">
                    {totalItem} item
                  </span>
                  {member && (
                    <span className="text-sm px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-[#2d1657] text-violet-600 dark:text-violet-300">
                      {member}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-sm text-gray-700 dark:text-[#6b7080]">
                    Total
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[#e2e4ef]">
                    {fmt(total - potonganHarga)}
                  </span>
                </div>
                <button
                  onClick={bayar}
                  disabled={isPending}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
  ${
    sukses
      ? "bg-emerald-950 text-emerald-400"
      : isPending
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-700 text-white hover:bg-indigo-600"
  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Memproses...
                    </>
                  ) : sukses ? (
                    <>
                      <CheckCircle size={15} /> Transaksi Berhasil!
                    </>
                  ) : (
                    <>
                      <Receipt size={15} /> Proses Pembayaran
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// import { useState, useRef, useEffect } from "react";
// import {
//   ShoppingCart,
//   Trash2,
//   TrendingUp,
//   User,
//   Search,
//   Plus,
//   Minus,
//   Receipt,
//   X,
//   CheckCircle,
// } from "lucide-react";

// const PRODUK_TERLARIS = [
//   {
//     id: 1,
//     nama: "Voucher Telkomsel 10K",
//     hargaGrosir: 10500,
//     hargaEceran: 11000,
//     kategori: "Voucher",
//     sub_kategori: "",
//     brand: "Telkomsel",
//     iconBg: "#1e1b4b",
//     iconColor: "#818cf8",
//     icon: "V",
//     barcode: "VT10K001",
//   },
//   {
//     id: 2,
//     nama: "Voucher XL 25K",
//     hargaGrosir: 25500,
//     hargaEceran: 26500,
//     kategori: "Voucher",
//     sub_kategori: "",
//     brand: "XL",
//     iconBg: "#1e1b4b",
//     iconColor: "#818cf8",
//     icon: "V",
//     barcode: "VXL25K002",
//   },
//   {
//     id: 3,
//     nama: "Voucher Axis 10K",
//     hargaGrosir: 10000,
//     hargaEceran: 11000,
//     kategori: "Voucher",
//     sub_kategori: "",
//     brand: "Axis",
//     iconBg: "#1e1b4b",
//     iconColor: "#818cf8",
//     icon: "V",
//     barcode: "VAX10K003",
//   },
//   {
//     id: 4,
//     nama: "Casing iPhone 14",
//     hargaGrosir: 75000,
//     hargaEceran: 85000,
//     kategori: "Aksesoris",
//     sub_kategori: "Casing",
//     brand: "Apple",
//     iconBg: "#2d1657",
//     iconColor: "#a78bfa",
//     icon: "A",
//     barcode: "CASIP14004",
//   },
//   {
//     id: 5,
//     nama: "Tempered Glass",
//     hargaGrosir: 20000,
//     hargaEceran: 25000,
//     kategori: "Aksesoris",
//     sub_kategori: "Kaca",
//     brand: "Universal",
//     iconBg: "#2d1657",
//     iconColor: "#a78bfa",
//     icon: "A",
//     barcode: "TEMGLS005",
//   },
//   {
//     id: 6,
//     nama: "Charger Type-C 25W",
//     hargaGrosir: 110000,
//     hargaEceran: 120000,
//     kategori: "Aksesoris",
//     sub_kategori: "Charger",
//     brand: "Samsung",
//     iconBg: "#2d1657",
//     iconColor: "#a78bfa",
//     icon: "A",
//     barcode: "CHGTC25W006",
//   },
//   {
//     id: 7,
//     nama: "LCD Samsung A12",
//     hargaGrosir: 250000,
//     hargaEceran: 280000,
//     kategori: "Sparepart",
//     sub_kategori: "LCD",
//     brand: "Samsung",
//     iconBg: "#431407",
//     iconColor: "#fb923c",
//     icon: "P",
//     barcode: "LCDSA12007",
//   },
//   {
//     id: 8,
//     nama: "Baterai Xiaomi Redmi 9",
//     hargaGrosir: 60000,
//     hargaEceran: 65000,
//     kategori: "Sparepart",
//     sub_kategori: "Baterai",
//     brand: "Xiaomi",
//     iconBg: "#431407",
//     iconColor: "#fb923c",
//     icon: "P",
//     barcode: "BATXM9008",
//   },
//   {
//     id: 9,
//     nama: "Papan Cas Oppo A54",
//     hargaGrosir: 85000,
//     hargaEceran: 95000,
//     kategori: "Sparepart",
//     sub_kategori: "Papan Cas",
//     brand: "Oppo",
//     iconBg: "#431407",
//     iconColor: "#fb923c",
//     icon: "P",
//     barcode: "PCOPA54009",
//   },
//   {
//     id: 10,
//     nama: "HP Samsung A12",
//     hargaGrosir: 1800000,
//     hargaEceran: 1900000,
//     kategori: "Handphone",
//     sub_kategori: "",
//     brand: "Samsung",
//     iconBg: "#052e16",
//     iconColor: "#34d399",
//     icon: "H",
//     barcode: "HPSAMA12010",
//   },
//   {
//     id: 11,
//     nama: "HP Oppo A54",
//     hargaGrosir: 1700000,
//     hargaEceran: 1800000,
//     kategori: "Handphone",
//     sub_kategori: "",
//     brand: "Oppo",
//     iconBg: "#052e16",
//     iconColor: "#34d399",
//     icon: "H",
//     barcode: "HPOPA54011",
//   },
// ];

// // Konfigurasi filter
// const FILTER_CONFIG = {
//   Voucher: {
//     type: "brand",
//     options: ["Telkomsel", "XL", "Axis", "Indosat", "Tri", "Smartfren", "By.U"],
//     default: "Axis",
//   },
//   Sparepart: {
//     type: "sub_kategori",
//     options: ["LCD", "Baterai", "Papan Cas", "Flexibel", "Speaker"],
//     default: "LCD",
//   },
//   Aksesoris: {
//     type: "sub_kategori",
//     options: ["Casing", "Kaca", "Charger", "Kabel Data", "Earphone"],
//     default: "Casing",
//   },
//   Handphone: {
//     type: "brand",
//     options: ["Samsung", "Oppo", "Vivo", "Xiaomi", "Realme", "Apple"],
//     default: "Samsung",
//   },
// };

// const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

// export default function TransaksiPage() {
//   const [keranjang, setKeranjang] = useState([]);
//   const [member, setMember] = useState("");
//   const [search, setSearch] = useState("");
//   const [sukses, setSukses] = useState(false);
//   const [flash, setFlash] = useState(null);
//   const [selectedKategori, setSelectedKategori] = useState("Semua");
//   const [selectedFilter, setSelectedFilter] = useState("Axis"); // Default untuk Voucher
//   const [selectedHarga, setSelectedHarga] = useState("eceran"); // 'grosir' | 'eceran'
//   const searchRef = useRef(null);

//   // Update filter saat ganti kategori
//   useEffect(() => {
//     if (selectedKategori === "Semua") {
//       setSelectedFilter("");
//     } else {
//       const config = FILTER_CONFIG[selectedKategori];
//       setSelectedFilter(config?.default || "");
//     }
//   }, [selectedKategori]);

//   // Fokus otomatis ke input
//   useEffect(() => {
//     if (searchRef.current) {
//       searchRef.current.focus();
//     }
//   }, []);

//   // Handle scan barcode
//   const handleInputChange = (value) => {
//     const cleaned = value.trim().toUpperCase();
//     setSearch(value);
//     if (!cleaned) return;

//     const produk = PRODUK_TERLARIS.find(
//       (p) => p.barcode && p.barcode.toUpperCase() === cleaned
//     );

//     if (produk) {
//       setFlash(produk.id);
//       setTimeout(() => setFlash(null), 400);
//       setKeranjang((prev) => {
//         const ada = prev.find((k) => k.id === produk.id);
//         if (ada)
//           return prev.map((k) =>
//             k.id === produk.id ? { ...k, qty: k.qty + 1 } : k
//           );
//         return [...prev, { ...produk, qty: 1 }];
//       });
//       setSearch("");
//     }
//   };

//   // Filter produk
//   const produkFiltered = PRODUK_TERLARIS.filter((p) => {
//     // Cari teks
//     const matchSearch =
//       p.nama.toLowerCase().includes(search.toLowerCase()) ||
//       p.kategori.toLowerCase().includes(search.toLowerCase());

//     // Filter kategori
//     if (selectedKategori !== "Semua" && p.kategori !== selectedKategori) {
//       return false;
//     }

//     // Filter sub_kategori/brand
//     if (selectedKategori !== "Semua" && selectedFilter) {
//       const config = FILTER_CONFIG[selectedKategori];
//       if (config?.type === "brand" && p.brand !== selectedFilter) {
//         return false;
//       }
//       if (
//         config?.type === "sub_kategori" &&
//         p.sub_kategori !== selectedFilter
//       ) {
//         return false;
//       }
//     }

//     return matchSearch;
//   });

//   const tambahKeKeranjang = (produk) => {
//     setFlash(produk.id);
//     setTimeout(() => setFlash(null), 400);
//     setKeranjang((prev) => {
//       const ada = prev.find((k) => k.id === produk.id);
//       if (ada)
//         return prev.map((k) =>
//           k.id === produk.id ? { ...k, qty: k.qty + 1 } : k
//         );
//       return [...prev, { ...produk, qty: 1 }];
//     });
//   };

//   const ubahQty = (id, delta) =>
//     setKeranjang((prev) =>
//       prev
//         .map((k) => (k.id === id ? { ...k, qty: k.qty + delta } : k))
//         .filter((k) => k.qty > 0)
//     );

//   const hapus = (id) => setKeranjang((prev) => prev.filter((k) => k.id !== id));

//   const total = keranjang.reduce((s, k) => s + k.hargaEceran * k.qty, 0);
//   const totalItem = keranjang.reduce((s, k) => s + k.qty, 0);

//   const bayar = () => {
//     if (!keranjang.length) return;
//     setSukses(true);
//     setTimeout(() => {
//       setSukses(false);
//       setKeranjang([]);
//       setMember("");
//     }, 2200);
//   };

//   // Dapatkan harga yang ditampilkan
//   const getHarga = (produk) => {
//     return selectedHarga === "grosir" ? produk.hargaGrosir : produk.hargaEceran;
//   };

//   return (
//     <div className="min-h-screen px-4 py-5" style={{ background: "#0e1018" }}>
//       <div className="max-w-lg mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <p
//               className="text-[11px] tracking-widest uppercase mb-0.5"
//               style={{ color: "#4a4d62" }}
//             >
//               kasir
//             </p>
//             <h1
//               className="text-xl font-semibold tracking-tight"
//               style={{ color: "#e2e4ef" }}
//             >
//               Transaksi Baru
//             </h1>
//           </div>
//           <div className="relative">
//             <div
//               className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
//               style={{ background: "#1a1c29", border: "1px solid #2a2d3e" }}
//             >
//               <ShoppingCart size={16} color="#818cf8" />
//               <span
//                 className="text-sm font-medium"
//                 style={{ color: "#e2e4ef" }}
//               >
//                 {totalItem} item
//               </span>
//             </div>
//             {totalItem > 0 && (
//               <div
//                 className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
//                 style={{ background: "#818cf8" }}
//               >
//                 {totalItem}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Input Pencarian */}
//         <div
//           className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mb-4"
//           style={{ background: "#1a1c29", border: "1px solid #2a2d3e" }}
//         >
//           <Search size={15} color="#4a4d62" />
//           <input
//             ref={searchRef}
//             value={search}
//             onChange={(e) => handleInputChange(e.target.value)}
//             placeholder="Cari produk / scan barcode..."
//             className="flex-1 bg-transparent border-none outline-none text-sm"
//             style={{ color: "#e2e4ef" }}
//           />
//           {search && (
//             <button
//               onClick={() => setSearch("")}
//               className="flex p-0 bg-transparent border-none cursor-pointer"
//             >
//               <X size={13} color="#4a4d62" />
//             </button>
//           )}
//         </div>

//         {/* Filter Kategori */}
//         <div className="mb-4">
//           <div className="flex w-full overflow-x-auto  gap-2">
//             {["Semua", "Voucher", "Sparepart", "Aksesoris", "Handphone"].map(
//               (kat) => (
//                 <label
//                   key={kat}
//                   className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
//                     selectedKategori === kat
//                       ? "bg-indigo-600 text-white"
//                       : "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="kategori"
//                     checked={selectedKategori === kat}
//                     onChange={() => setSelectedKategori(kat)}
//                     className="hidden"
//                   />
//                   {kat}
//                 </label>
//               )
//             )}
//           </div>
//         </div>

//         {/* Filter Dinamis */}
//         {selectedKategori !== "Semua" && (
//           <div className="mb-4">
//             <div className="flex flex-wrap gap-2">
//               {FILTER_CONFIG[selectedKategori]?.options.map((opt) => (
//                 <button
//                   key={opt}
//                   onClick={() => setSelectedFilter(opt)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
//                     selectedFilter === opt
//                       ? "bg-emerald-600 text-white"
//                       : "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                   }`}
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Filter Harga */}
//         <div className="mb-5">
//           <div className="flex items-center gap-3">
//             <label className="flex items-center gap-2 text-xs">
//               <input
//                 type="radio"
//                 name="harga"
//                 checked={selectedHarga === "grosir"}
//                 onChange={() => setSelectedHarga("grosir")}
//                 className="form-radio text-emerald-500"
//               />
//               <span style={{ color: "#e2e4ef" }}>Harga Grosir</span>
//             </label>
//             <label className="flex items-center gap-2 text-xs">
//               <input
//                 type="radio"
//                 name="harga"
//                 checked={selectedHarga === "eceran"}
//                 onChange={() => setSelectedHarga("eceran")}
//                 className="form-radio text-blue-500"
//               />
//               <span style={{ color: "#e2e4ef" }}>Harga Eceran</span>
//             </label>
//           </div>
//         </div>

//         {/* Produk Terlaris */}
//         <div className="mb-5">
//           <div className="flex items-center gap-1.5 mb-3">
//             <TrendingUp size={13} color="#34d399" />
//             <p
//               className="text-[11px] tracking-widest uppercase"
//               style={{ color: "#4a4d62" }}
//             >
//               {search
//                 ? `hasil pencarian (${produkFiltered.length})`
//                 : "produk terlaris"}
//             </p>
//           </div>

//           {produkFiltered.length === 0 ? (
//             <div
//               className="rounded-xl py-8 text-center"
//               style={{ background: "#1a1c29", border: "1px dashed #2a2d3e" }}
//             >
//               <p className="text-sm" style={{ color: "#4a4d62" }}>
//                 Produk tidak ditemukan
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-2">
//               {produkFiltered.map((p) => (
//                 <button
//                   key={p.id}
//                   onClick={() => tambahKeKeranjang(p)}
//                   className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left w-full transition-all duration-150 cursor-pointer"
//                   style={{
//                     background: flash === p.id ? "#1e2540" : "#1a1c29",
//                     border: `1px solid ${flash === p.id ? "#818cf8" : "#2a2d3e"}`,
//                   }}
//                 >
//                   <div
//                     className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold"
//                     style={{ background: p.iconBg, color: p.iconColor }}
//                   >
//                     {p.icon}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p
//                       className="text-[11px] font-medium truncate mb-0.5"
//                       style={{ color: "#c8cce0" }}
//                     >
//                       {p.nama}
//                     </p>
//                     <p
//                       className="text-[11px] font-semibold"
//                       style={{ color: p.iconColor }}
//                     >
//                       {fmt(getHarga(p))}
//                     </p>
//                   </div>
//                   <div
//                     className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
//                     style={{ background: "#2a2d3e" }}
//                   >
//                     <Plus size={11} color="#6b7080" />
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Input Nama Pembeli */}
//         <div className="mb-5">
//           <div className="flex items-center gap-1.5 mb-2.5">
//             <User size={13} color="#a78bfa" />
//             <p
//               className="text-[11px] tracking-widest uppercase"
//               style={{ color: "#4a4d62" }}
//             >
//               nama pembeli
//             </p>
//           </div>
//           <div
//             className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
//             style={{ background: "#1a1c29", border: "1px solid #2a2d3e" }}
//           >
//             <User size={14} color="#4a4d62" />
//             <input
//               value={member}
//               onChange={(e) => setMember(e.target.value)}
//               placeholder="Nama pembeli (opsional)..."
//               className="flex-1 bg-transparent border-none outline-none text-sm"
//               style={{ color: "#e2e4ef" }}
//             />
//             {member && (
//               <button
//                 onClick={() => setMember("")}
//                 className="flex p-0 bg-transparent border-none cursor-pointer"
//               >
//                 <X size={13} color="#4a4d62" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Keranjang */}
//         <div className="mb-32">
//           <div className="flex items-center gap-1.5 mb-2.5">
//             <ShoppingCart size={13} color="#fb923c" />
//             <p
//               className="text-[11px] tracking-widest uppercase"
//               style={{ color: "#4a4d62" }}
//             >
//               keranjang
//             </p>
//           </div>

//           {keranjang.length === 0 ? (
//             <div
//               className="rounded-xl py-7 text-center"
//               style={{ background: "#1a1c29", border: "1px dashed #2a2d3e" }}
//             >
//               <ShoppingCart
//                 size={26}
//                 color="#2a2d3e"
//                 className="mx-auto mb-2"
//               />
//               <p className="text-xs" style={{ color: "#4a4d62" }}>
//                 Keranjang masih kosong
//               </p>
//               <p className="text-xs mt-1" style={{ color: "#333647" }}>
//                 Pilih kategori dan produk untuk menambahkan
//               </p>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-2">
//               {keranjang.map((k) => (
//                 <div
//                   key={k.id}
//                   className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
//                   style={{ background: "#1a1c29", border: "1px solid #2a2d3e" }}
//                 >
//                   <div
//                     className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold"
//                     style={{ background: k.iconBg, color: k.iconColor }}
//                   >
//                     {k.icon}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p
//                       className="text-xs font-medium truncate mb-0.5"
//                       style={{ color: "#c8cce0" }}
//                     >
//                       {k.nama}
//                     </p>
//                     <p className="text-xs" style={{ color: k.iconColor }}>
//                       {fmt(k.hargaEceran * k.qty)}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <button
//                       onClick={() => ubahQty(k.id, -1)}
//                       className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
//                       style={{
//                         background: "#252838",
//                         border: "1px solid #2a2d3e",
//                       }}
//                     >
//                       <Minus size={10} color="#6b7080" />
//                     </button>
//                     <span
//                       className="text-sm font-semibold w-5 text-center"
//                       style={{ color: "#e2e4ef" }}
//                     >
//                       {k.qty}
//                     </span>
//                     <button
//                       onClick={() => ubahQty(k.id, 1)}
//                       className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
//                       style={{
//                         background: "#252838",
//                         border: "1px solid #2a2d3e",
//                       }}
//                     >
//                       <Plus size={10} color="#6b7080" />
//                     </button>
//                     <button
//                       onClick={() => hapus(k.id)}
//                       className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ml-1"
//                       style={{
//                         background: "#2a1515",
//                         border: "1px solid #3b1515",
//                       }}
//                     >
//                       <Trash2 size={10} color="#f87171" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Total + Bayar */}
//         {keranjang.length > 0 && (
//           <div className="fixed bottom-10 left-0 right-0 p-4 z-10">
//             <div className="max-w-lg mx-auto">
//               <div
//                 className="rounded-2xl p-4"
//                 style={{ background: "#1a1c29", border: "1px solid #2a2d3e" }}
//               >
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-xs" style={{ color: "#4a4d62" }}>
//                     {totalItem} item
//                   </span>
//                   {member && (
//                     <span
//                       className="text-xs px-2.5 py-0.5 rounded-full"
//                       style={{ background: "#2d1657", color: "#a78bfa" }}
//                     >
//                       {member}
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-baseline justify-between mb-4">
//                   <span className="text-sm" style={{ color: "#6b7080" }}>
//                     Total
//                   </span>
//                   <span
//                     className="text-2xl font-bold tracking-tight"
//                     style={{ color: "#e2e4ef" }}
//                   >
//                     {fmt(total)}
//                   </span>
//                 </div>
//                 <button
//                   onClick={bayar}
//                   className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer border-none"
//                   style={{
//                     background: sukses ? "#052e16" : "#4f46e5",
//                     color: sukses ? "#34d399" : "#fff",
//                   }}
//                 >
//                   {sukses ? (
//                     <>
//                       <CheckCircle size={15} /> Transaksi Berhasil!
//                     </>
//                   ) : (
//                     <>
//                       <Receipt size={15} /> Proses Pembayaran
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
