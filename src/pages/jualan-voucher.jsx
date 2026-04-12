// src/pages/JualanVoucher.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  X,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { Html5Qrcode } from "html5-qrcode";

export default function JualanVoucher() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersList, setMembersList] = useState([]);
  const memberInputRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("member", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setMembersList(res.data.data || []);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    if (user?.token) fetchMembers();
  }, [user]);

  const tambahKeKeranjang = (voucher) => {
    if (voucher.stok <= 0) {
      Swal.fire("Stok Habis!", "Voucher ini stoknya habis.", "warning");
      return;
    }

    setSelectedVoucher(voucher);
    setTimeout(() => {
      memberInputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    // ✅ TAMBAH DI SINI
    if (isScanning) return;

    if (!memberSearch || !selectedVoucher) return;

    const cleaned = memberSearch.trim();

    const matched = membersList.find(
      (m) => m.noTelp === cleaned || m.kodeMember === cleaned
    );

    if (matched) {
      jualVoucherMutation.mutate(
        {
          idVoucher: selectedVoucher.id,
          idMember: matched.id,
        },
        {
          onSuccess: () => {
            setSelectedVoucher(null);
            setMemberSearch("");
          },
        }
      );
    }
  }, [memberSearch]); // ❗ HAPUS isScanning === false

  // === QUERY: Ambil Voucher Master ===
  const {
    data: voucherMaster,
    isLoading: loadingMaster,
    isError: errorMaster,
    refetch: refetchMaster,
  } = useQuery({
    queryKey: ["voucherMaster"],
    queryFn: async () => {
      const res = await api.get("produk-voucher", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    staleTime: 5000,
  });

  console.log(voucherMaster);

  // === QUERY: Ambil Transaksi Hari Ini ===
  // const {
  //   data: transaksiHarian,
  //   isLoading: loadingTransaksi,
  //   isError: errorTransaksi,
  //   refetch: refetchTransaksi,
  // } = useQuery({
  //   queryKey: ["transaksiHarian"],
  //   queryFn: async () => {
  //     const res = await api.get("voucher-harian", {
  //       headers: { Authorization: `Bearer ${user?.token}` },
  //     });
  //     return res.data;
  //   },
  // });

  const vouchers = voucherMaster?.data || [];
  // const keranjang = transaksiHarian?.data.transaksi || [];

  // console.log(transaksiHarian);

  // Brand unik
  const brands = [...new Set(vouchers.map((v) => v.brand))];

  // Filter voucher berdasarkan brand
  const filteredVouchers = selectedBrand
    ? vouchers.filter((v) => v.brand === selectedBrand)
    : vouchers;

  // Hitung statistik
  // const stats = useMemo(() => {
  //   let omset = 0;
  //   let keuntungan = 0;
  //   keranjang.forEach((item) => {
  //     omset += item.hargaJual;
  //     keuntungan += item.keuntungan;
  //   });
  //   return { omset, keuntungan };
  // }, [keranjang]);

  // === MUTATION: Jual Voucher ===
  const jualVoucherMutation = useMutation({
    mutationFn: ({ idVoucher, idMember }) =>
      api.post(
        `voucher-harian`,
        {
          idVoucher: idVoucher,
          idMember: idMember,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiHarian"] });
      queryClient.invalidateQueries({ queryKey: ["voucherMaster"] });

      Swal.fire({
        title: "Berhasil!",
        text: "Voucher berhasil dijual.",
        icon: "success",
        timer: 200,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menjual voucher.",
        icon: "error",
      });
    },
  });

  // === MUTATION: Hapus Transaksi ===
  const hapusTransaksiMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`voucher-harian/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiHarian"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Transaksi berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus transaksi.",
        icon: "error",
      });
    },
  });

  // Tambah ke keranjang (jual)

  // Hapus dari keranjang
  const hapusDariKeranjang = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus dan stok dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        hapusTransaksiMutation.mutate(id);
      }
    });
  };

  // const isLoading = loadingMaster || loadingTransaksi;
  // const isError = errorMaster || errorTransaksi;

  // Tambahkan state untuk scanner
  const scannerInstance = useRef(null);

  // Fungsi bantu: cari member by noTelp atau kodeMember
  const findMemberByCode = (code) => {
    return membersList.find((m) => m.noTelp === code || m.kodeMember === code);
  };

  // Mulai scan
  // Tambahkan useEffect untuk handle scan
  useEffect(() => {
    try {
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
                if (isProcessingRef.current) return;
                isProcessingRef.current = true;

                try {
                  // ✅ STOP SCANNER DULU (INI KUNCI)
                  if (html5QrCode) {
                    await html5QrCode.stop().catch(() => {});
                  }

                  setIsScanning(false);

                  const cleaned = decodedText.trim();
                  const matched = membersList.find(
                    (m) => m.noTelp === cleaned || m.kodeMember === cleaned
                  );

                  if (matched) {
                    await jualVoucherMutation.mutateAsync({
                      idVoucher: selectedVoucher.id,
                      idMember: matched.id,
                    });

                    Swal.fire({
                      title: "Berhasil!",
                      text: `Voucher terjual ke ${matched.nama}`,
                      icon: "success",
                      timer: 1200,
                      showConfirmButton: false,
                    });

                    setSelectedVoucher(null);
                    setMemberSearch("");
                  } else {
                    Swal.fire({
                      title: "Member Tidak Ditemukan!",
                      text: `Kode "${cleaned}" tidak terdaftar.`,
                      icon: "error",
                    });
                  }
                } finally {
                  isProcessingRef.current = false;
                }
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
            if (html5QrCode.isScanning) {
              html5QrCode
                .stop()
                .then(() => html5QrCode.clear())
                .catch(() => {});
            }
          }
        };
      }
    } catch (error) {
      console.log(error);
    }
  }, [isScanning, selectedVoucher, membersList]);

  {
    /* Color Configuration untuk setiap brand */
  }
  const brandColors = {
    Axis: {
      active: "from-purple-900 to-fuchsia-900",
      inactive: "from-purple-500 to-fuchsia-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    Smartfren: {
      active: "from-pink-900 to-rose-900",
      inactive: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    XL: {
      active: "from-blue-900 to-cyan-900",
      inactive: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    Tri: {
      active: "from-violet-900 to-purple-900",
      inactive: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
    },
    "Indosat / IM3": {
      active: "from-amber-900 to-yellow-900",
      inactive: "from-amber-500 to-yellow-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    Telkomsel: {
      active: "from-red-900 to-rose-900",
      inactive: "from-red-500 to-rose-500",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
  };

  // Helper untuk mendapatkan warna brand
  const getBrandColor = (brandName) => {
    return (
      brandColors[brandName] || {
        active: "from-gray-900 to-slate-900",
        inactive: "from-gray-500 to-slate-500",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      }
    );
  };

  if (loadingMaster) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin w-8 h-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (errorMaster) {
    return (
      <div className="p-6 text-center text-red-500">
        Gagal memuat data. Silakan coba lagi.
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-20 ">
      <div className="grid-cols-1 gap-6">
        {/* === KIRI: BRAND & VOUCHER === */}
        <div className="lg:col-span-2 space-y-2">
          {/* Brand */}
          <div>
            <div className="flex gap-2 overflow-x-auto text-xs pb-1">
              <button
                onClick={() => setSelectedBrand("")}
                className={`flex-shrink-0 px-4 py-2 text-xs rounded-full  transition ${
                  !selectedBrand
                    ? "bg-gray-200  dark:bg-white text-gray-900"
                    : "bg-transparent text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                }`}
              >
                Semua
              </button>

              {brands.map((brand) => {
                const isSelected = selectedBrand === brand;
                const displayName =
                  brand === "Indosat / IM3" ? "Indosat" : brand;

                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`flex-shrink-0 px-4 py-2 text-xs rounded-full  transition ${
                      isSelected
                        ? "bg-gray-200 dark:bg-white text-gray-900"
                        : "bg-transparent text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voucher */}
          <div>
            <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Daftar Voucher {selectedBrand && `(${selectedBrand})`}
            </h2>

            {filteredVouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada voucher tersedia
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredVouchers.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => v.stok > 0 && tambahKeKeranjang(v)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer
    ${
      v.stok <= 0
        ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700"
        : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
    } bg-white dark:bg-gray-800`}
                  >
                    <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                      {v.nama}
                    </p>
                    <p className="text-[11px] text-green-600 mt-0.5">
                      Rp {v.hargaEceran?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-gray-400">
                        {v.brand}
                      </span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full
      ${
        v.stok <= 0
          ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
          : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
      }`}
                      >
                        {v.stok <= 0 ? "Habis" : `Stok ${v.stok}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === KANAN: RINGKASAN === */}
        {/* <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Ringkasan Hari Ini
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Omset</span>
                <span className="font-bold text-blue-600">
                  Rp {stats.omset.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Keuntungan
                </span>
                <span className="font-bold text-green-600">
                  Rp {stats.keuntungan.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Item
                </span>
                <span className="font-bold text-purple-600">
                  {keranjang.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Penjualan Hari Ini ({keranjang.length})
            </h2>

            {keranjang.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Belum ada penjualan
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {keranjang.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div>
                      <p className="text-sm  text-gray-800 dark:text-white">
                        {item.voucher.nama}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {item.voucher.brand}
                      </p>
                    </div>

                    <span className="text-green-600 text-sm ">
                      Rp {item.hargaJual?.toLocaleString() || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div> */}
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-2 shadow-xl relative">
            <h2 className="text-lg font-bold mb-4">Jual Voucher</h2>

            <p className="text-sm text-gray-600 mb-4">
              {selectedVoucher.nama} - Rp{" "}
              {selectedVoucher.hargaEceran?.toLocaleString()}
            </p>

            {/* Input + Tombol Kamera */}
            <div className="relative">
              <input
                ref={memberInputRef}
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Masukkan No Telp / Kode Member (Opsional)"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsScanning(true)} // ✅ BENAR
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
              >
                📷
              </button>
            </div>

            {/* Area Scanner — selalu ada di DOM, tapi hidden jika tidak scan */}
            <div
              id="reader"
              className={`w-full mx-auto transition-opacity duration-300 ${
                isScanning ? "block opacity-100" : "hidden opacity-0"
              }`}
            ></div>

            {isScanning && (
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="w-full mt-3 py-2 bg-red-500 text-white rounded-lg"
              >
                Batal Scan
              </button>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  jualVoucherMutation.mutate({
                    idVoucher: selectedVoucher.id,
                    idMember: memberSearch
                      ? findMemberByCode(memberSearch)?.id
                      : null,
                  });
                  setSelectedVoucher(null);
                  setMemberSearch("");
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
              >
                Simpan Tanpa Member
              </button>

              <button
                onClick={() => {
                  setSelectedVoucher(null);
                  setMemberSearch("");
                  setIsScanning(false); // ✅ Cukup ini
                }}
                className="flex-1 py-3 bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
