import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function StoreSettingsPage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);

  const [storeName, setStoreName] = useState("");
  const [isActive, setIsActive] = useState();
  const [subscribeTime, setSubscribeTime] = useState("");
  const [address, setAddress] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // =========================
  // 🔥 GET TOKO
  // =========================
  const { data: toko, isLoading } = useQuery({
    queryKey: ["toko-user"],
    queryFn: async () => {
      const res = await api.get("/toko-user", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return res.data.data;
    },
    enabled: !!user?.token,
  });

  // =========================
  // SET STATE AWAL
  // =========================
  useEffect(() => {
    if (toko) {
      setStoreName(toko.namaToko || "");
      setIsActive(toko.isActive);
      setSubscribeTime(toko.SubscribeTime);
      setAddress(toko.alamat || "");
      if (toko.logoToko) {
        setLogoPreview(toko.logoToko);
      }
    }
  }, [toko]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let logoUrl = null;

      // upload logo
      if (logoFile) {
        const formData = new FormData();
        formData.append("logoToko", logoFile);

        const uploadRes = await api.put("/update-foto-toko", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        });

        logoUrl = uploadRes.data.url;
      }

      // update toko
      return await api.put(
        "/update-toko",
        {
          namaToko: storeName,
          alamat: address,
          ...(logoUrl && { logoToko: logoUrl }),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
    },

    onSuccess: () => {
      alert("Berhasil disimpan 🔥");
    },

    onError: (err) => {
      alert(err?.response?.data?.message || "Gagal update");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!storeName.trim()) {
      alert("Nama toko wajib diisi");
      return;
    }

    updateMutation.mutate();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harus gambar!");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  // Handle pilih gambar

  // Trigger input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Simpan perubahan

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        Loading toko...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 md:p-6 dark:text-white text-gray-900">
      <div className="dark:bg-[#181820] bg-white dark:border-[#232330] border-gray-200 border rounded-xl p-4 sm:p-5 md:p-6 shadow-sm dark:shadow-none transition-colors duration-300">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
        >
          {/* LOGO */}
          <div className="flex flex-col items-center">
            <p className="text-xs dark:text-gray-400 text-gray-500 mb-3">
              Logo Toko
            </p>

            <div
              onClick={triggerFileInput}
              className="relative cursor-pointer group mx-auto"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border-2 overflow-hidden flex items-center justify-center transition-colors duration-300">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    className="w-full h-full object-cover"
                    alt="Logo toko"
                  />
                ) : (
                  <span className="dark:text-gray-500 text-gray-400 text-3xl select-none">
                    +
                  </span>
                )}
              </div>

              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200">
                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Ganti
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={user.role === "Crew"}
              accept="image/*"
              className="hidden"
            />

            <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-2">
              Klik untuk upload
            </p>
          </div>

          {/* FORM */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {/* STATUS */}
            <div className="flex flex-wrap justify-between items-center gap-2 dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border rounded-xl p-3 transition-colors duration-300">
              <div>
                <p className="text-[10px] dark:text-gray-400 text-gray-500">
                  Langganan
                </p>
                <p className="text-xs dark:text-white text-gray-10">
                  {new Date(subscribeTime).toLocaleString("id-ID", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <span
                className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors duration-300 ${
                  isActive
                    ? "bg-green-200 text-green-800"
                    : "bg-red-900/40 text-red-400"
                }`}
              >
                {isActive ? "Aktif" : "Non Aktif"}
              </span>
            </div>

            {/* NAMA */}
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">
                Nama Toko
              </label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={user.role === "Crew"}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:placeholder-gray-500 placeholder-gray-400 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 transition-colors duration-300"
                placeholder="Nama toko"
              />
            </div>

            {/* ALAMAT */}
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">
                Alamat Toko
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={user.role === "Crew"}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:placeholder-gray-500 placeholder-gray-400 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 transition-colors duration-300 resize-none"
                placeholder="Alamat toko"
              />
            </div>

            {/* BUTTON */}
            {user.role === "Owner" && (
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-600/20"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
