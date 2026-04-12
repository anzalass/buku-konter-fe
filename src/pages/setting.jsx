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
    <div className="w-full mx-auto p-2 text-white">
      <div className="bg-[#181820] border border-[#232330] p-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* LOGO */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-3">Logo Toko</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group"
            >
              <div className="w-32 h-32 rounded-full bg-[#111118] border border-[#2A2A38] overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-3xl">+</span>
                )}
              </div>

              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
                <span className="text-xs opacity-0 group-hover:opacity-100">
                  Ganti
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={user.role === "Crew"}
              className="hidden"
            />
          </div>

          {/* FORM */}
          <div className="md:col-span-2 space-y-4">
            {/* STATUS */}
            <div className="flex justify-between items-center bg-[#111118] border border-[#2A2A38] rounded-xl p-3">
              <div>
                <p className="text-[10px] text-gray-400">Langganan</p>
                <p className="text-xs">
                  {new Date(subscribeTime).toLocaleString("id-ID", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                </p>
              </div>

              <span
                className={`px-2 py-1 text-[10px] rounded ${
                  isActive
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                }`}
              >
                {isActive ? "Aktif" : "Non Aktif"}
              </span>
            </div>

            {/* NAMA */}
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={user.role === "Crew"}
              className="w-full px-3 py-2 text-xs rounded bg-[#111118] border border-[#2A2A38]"
              placeholder="Nama toko"
            />

            {/* ALAMAT */}
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={user.role === "Crew"}
              className="w-full px-3 py-2 text-xs rounded bg-[#111118] border border-[#2A2A38]"
              placeholder="Alamat toko"
            />

            {/* BUTTON */}
            {user.role === "Owner" && (
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-2 rounded bg-blue-600 text-xs font-semibold hover:bg-blue-700 disabled:bg-gray-500"
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
