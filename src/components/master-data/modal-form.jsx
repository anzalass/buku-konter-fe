// src/components/MasterDataModalForm.jsx
import React, { useState } from "react";

const BRANDING_OPTIONS = [
  "Axis",
  "Indosat",
  "XL",
  "Telkomsel",
  "Smartfren",
  "Tri",
  "By.U",
];
const PENEMPATAN_OPTIONS = ["Etalase 1", "Etalase 2", "Java 1", "Java 2"];

export default function MasterDataModalForm({
  isOpen,
  onClose,
  onSubmit,
  type,
}) {
  const [formData, setFormData] = useState({
    nama: "",
    kategori: type.charAt(0).toUpperCase() + type.slice(1),
    sub_kategori: "",
    brand: "",
    stok: "",
    hargaModal: "",
    hargaGrosir: "",
    hargaEceran: "",
    penempatan: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      stok: formData.stok ? parseInt(formData.stok) : null,
      hargaModal: formData.hargaModal ? parseInt(formData.hargaModal) : null,
      hargaGrosir: formData.hargaGrosir ? parseInt(formData.hargaGrosir) : null,
      hargaEceran: formData.hargaEceran ? parseInt(formData.hargaEceran) : null,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Tambah {type}</h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Namaa</label>
            <input
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Brand / Provider</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Pilih Brand</option>
              {BRANDING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {type !== "member" && (
            <>
              <div>
                <label className="block text-sm mb-1">Sub Kategori</label>
                <input
                  name="sub_kategori"
                  value={formData.sub_kategori}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Stok</label>
                <input
                  name="stok"
                  type="number"
                  value={formData.stok}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm mb-1">Modal</label>
                  <input
                    name="hargaModal"
                    type="number"
                    value={formData.hargaModal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Grosir</label>
                  <input
                    name="hargaGrosir"
                    type="number"
                    value={formData.hargaGrosir}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Eceran</label>
                  <input
                    name="hargaEceran"
                    type="number"
                    value={formData.hargaEceran}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Penempatan</label>
                <select
                  name="penempatan"
                  value={formData.penempatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Pilih Penempatan</option>
                  {PENEMPATAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-200 rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
