// src/components/MasterDataFilterModal.jsx
import React, { useState } from "react";

const BRANDS = [
  "Axis",
  "Indosat",
  "XL",
  "Telkomsel",
  "Smartfren",
  "Tri",
  "By.U",
];
const SUB_KATEGORI_VOUCHER = [""]; // Kosong karena voucher tidak punya sub-kategori
const SUB_KATEGORI_SPAREPART = [
  "LCD",
  "Baterai",
  "Papan Cas",
  "Flexibel",
  "Speaker",
];
const SUB_KATEGORI_AKSESORIS = [
  "Casing",
  "Kaca",
  "Charger",
  "Kabel Data",
  "Earphone",
];

export default function MasterDataFilterModal({
  isOpen,
  onClose,
  onApply,
  type,
}) {
  const [filters, setFilters] = useState({
    nama: "",
    kategori: type,
    sub_kategori: "",
    brand: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getSubKategoriOptions = () => {
    if (type === "voucher") return SUB_KATEGORI_VOUCHER;
    if (type === "sparepart") return SUB_KATEGORI_SPAREPART;
    if (type === "aksesoris") return SUB_KATEGORI_AKSESORIS;
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Filter {type}</h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nama</label>
            <input
              name="nama"
              value={filters.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Brand</label>
            <select
              name="brand"
              value={filters.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Semua Brand</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {type !== "voucher" && (
            <div>
              <label className="block text-sm mb-1">Sub Kategori</label>
              <select
                name="sub_kategori"
                value={filters.sub_kategori}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Semua</option>
                {getSubKategoriOptions().map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || "—"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 rounded"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 bg-blue-600 text-white rounded"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
