import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  User,
  Mail,
  Key,
  MapPin,
  Filter,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import api from "../api/client"; // sesuaikan path API client
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // filter
  const [search, setSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [role, setRole] = useState("");
  const [penempatan, setPenempatan] = useState("");
  const [penempatanQ, setPenempatanQ] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);

  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);

  /* =============================
     FETCH USERS (React Query)
  ============================= */

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", page, pageSize, search, role, penempatan],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("pageSize", pageSize);

      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (penempatan) params.append("penempatan", penempatan);

      const { data } = await api.get(`auth?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      return data;
    },
    keepPreviousData: true,
  });

  /* =============================
     DELETE USER
  ============================= */

  const deleteUserMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`auth/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      Swal.fire({
        icon: "success",
        text: "User Berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
    },
  });

  /* =============================
     STATS
  ============================= */

  const stats = useMemo(() => {
    const totalUsers = users?.data?.length || 0;

    const adminCount =
      users?.data?.filter((u) => u.role === "admin").length || 0;

    const userCount = users?.data?.filter((u) => u.role === "user").length || 0;

    return { totalUsers, adminCount, userCount };
  }, [users]);

  /* =============================
     HANDLERS
  ============================= */

  const handleSearch = () => {
    setPage(1);
    setSearch(searchQ);
    setPenempatan(penempatanQ);
  };

  const handleReset = () => {
    setSearch("");
    setRole("");
    setSearchQ("");
    setPenempatan("");
    setPenempatanQ("");
    setPage(1);
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus user ini? Tindakan tidak bisa dibatalkan!"))
      return;

    deleteUserMutation.mutate(id);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenModal(true);
  };

  /* =============================
     LOADING / ERROR
  ============================= */

  if (isLoading) {
    return <div className="p-6 text-center">Memuat data user...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">Gagal memuat data user</div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 dark:text-white text-gray-900">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-sm sm:text-base font-semibold flex items-center gap-2 dark:text-white text-gray-900">
          <User size={16} className="text-blue-500" />
          Manajemen User
        </h1>

        {user.role === "Owner" && (
          <button
            onClick={() => {
              setEditUser(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition active:scale-[0.98] shadow-md shadow-blue-600/20"
          >
            <Plus size={14} />
            User
          </button>
        )}
      </div>

      {/* FILTER */}
      <div className="dark:bg-[#181820] bg-white dark:border-[#232330] border-gray-200 border rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 space-y-3 transition-colors duration-300 shadow-sm">
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Cari nama / email..."
          className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:placeholder-gray-500 placeholder-gray-400 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors duration-300"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg dark:bg-[#111118] bg-gray-50 dark:border-[#2A2A38] border-gray-200 border dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors duration-300"
        >
          <option value="">Semua Role</option>
          <option value="Owner">Owner</option>
          <option value="Crew">Crew</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition active:scale-[0.98]"
          >
            Cari
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 text-xs font-medium rounded-lg dark:bg-[#252530] bg-gray-100 dark:text-gray-300 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200 transition active:scale-[0.98]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* LIST CARD */}
      {users.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-xs text-center dark:text-gray-500 text-gray-400">
            Tidak ada data user
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {users.data.map((u) => (
            <div
              key={u.id}
              className="dark:bg-[#181820] bg-white dark:border-[#232330] border-gray-200 border rounded-xl p-3 dark:hover:border-[#2f3245] hover:border-gray-300 transition-all duration-300 shadow-sm"
            >
              {/* HEADER CARD */}
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate dark:text-gray-100 text-gray-800">
                    {u.nama}
                  </p>
                  <p className="text-[10px] truncate text-blue-500 dark:text-blue-400">
                    {u.email}
                  </p>
                </div>

                {/* ROLE BADGE */}
                <span
                  className={`shrink-0 px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors duration-300 ${
                    u.role === "Owner"
                      ? "dark:bg-purple-900/40 bg-purple-100 dark:text-purple-300 text-purple-700"
                      : "dark:bg-blue-900/40 bg-blue-100 dark:text-blue-300 text-blue-700"
                  }`}
                >
                  {u.role}
                </span>
              </div>

              {/* ACTION */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* DETAIL */}
                <button
                  onClick={() => navigate(`/dashboard/user/${u.id}`)}
                  className="flex-1 sm:flex-none sm:px-3 py-1.5 text-[10px] rounded-lg dark:bg-[#252530] bg-gray-100 dark:text-gray-300 text-gray-600 hover:dark:bg-[#2f3245] hover:bg-gray-200 transition active:scale-[0.98]"
                >
                  Detail
                </button>

                {/* EDIT / PASSWORD / DELETE */}
                {user.role === "Owner" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="px-2.5 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition active:scale-[0.98]"
                      title="Edit"
                    >
                      <Edit3 size={12} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setIsUpdatePasswordModalOpen(true);
                        setUserData(user);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition active:scale-[0.98]"
                      title="Reset Password"
                    >
                      <Lock size={12} />
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition active:scale-[0.98]"
                      title="Hapus"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {users.meta && users.meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-[10px] dark:text-gray-400 text-gray-500">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg dark:bg-[#252530] bg-gray-100 dark:text-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
          >
            Prev
          </button>

          <span className="font-medium">
            {page} / {users.meta.totalPages}
          </span>

          <button
            disabled={page >= users.meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg dark:bg-[#252530] bg-gray-100 dark:text-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      )}

      {openModal && (
        <UserModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSubmitSuccess={() => queryClient.invalidateQueries(["users"])}
          user={editUser}
          token={user?.token}
        />
      )}
      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => {
          setIsUpdatePasswordModalOpen(false);
          setEditingUserId(null);
        }}
        onUpdateSuccess={() => {}}
        userId={editingUserId}
        user={userData}
      />
    </div>
  );
}

// Stat Card Component

// Modal Form Component
function UserModal({ isOpen, onClose, onSubmitSuccess, user, token }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form saat buka modal
  useEffect(() => {
    if (user) {
      reset({
        nama: user.nama,
        email: user.email,
        role: user.role,
        penempatan: user.penempatan || "",
        password: "", // Biarkan kosong untuk edit
      });
    } else {
      reset({
        nama: "",
        email: "",
        password: "",
        role: "user",
        penempatan: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      // Tampilkan loading
      Swal.fire({
        title: user ? "Memperbarui Akun..." : "Membuat Akun...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      if (user) {
        // Update
        await api.put(
          `auth/${user.id}`,
          {
            nama: data.nama,
            email: data.email,
            role: data.role,
            penempatan: data.penempatan || null,
            ...(data.password && { password: data.password }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create
        await api.post(
          "auth",
          {
            nama: data.nama,
            email: data.email,
            password: data.password,
            role: data.role,
            penempatan: data.penempatan || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      Swal.close();

      // Tampilkan sukses
      await Swal.fire({
        title: "Berhasil!",
        text: user
          ? "Data akun berhasil diperbarui."
          : "Akun baru berhasil dibuat.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onSubmitSuccess();
      onClose();
    } catch (err) {
      Swal.close();

      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat menyimpan data.";

      await Swal.fire({
        title: "Gagal Menyimpan",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-colors duration-300">
      <div className="dark:bg-[#13151f] bg-white dark:border-[#1e2130] border-gray-200 rounded-2xl w-full max-w-md p-4 sm:p-5 relative shadow-xl transition-colors duration-300">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 dark:text-gray-400 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <h2 className="text-base sm:text-lg font-semibold dark:text-white text-gray-900 mb-4 pr-8">
          {user ? "Edit User" : "Tambah User"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* NAMA */}
          <div>
            <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
              Nama Lengkap
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-2.5 w-4 h-4 dark:text-gray-500 text-gray-400" />
              <input
                type="text"
                {...register("nama", { required: "Nama wajib diisi" })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 dark:border-[#23263a] border-gray-200 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors duration-300"
                placeholder="John Doe"
              />
            </div>
            {errors.nama && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
              Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 dark:text-gray-500 text-gray-400" />
              <input
                type="email"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Format email tidak valid",
                  },
                })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 dark:border-[#23263a] border-gray-200 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors duration-300"
                placeholder="john@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          {!user && (
            <div>
              <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
                Password
              </label>
              <div className="relative mt-1.5">
                <Key className="absolute left-3 top-2.5 w-4 h-4 dark:text-gray-500 text-gray-400" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password wajib",
                    minLength: { value: 6, message: "Min 6 karakter" },
                  })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 dark:border-[#23263a] border-gray-200 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors duration-300"
                  placeholder="••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* ROLE */}
          <div>
            <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
              Role
            </label>
            <select
              {...register("role", { required: "Role wajib dipilih" })}
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 dark:border-[#23263a] border-gray-200 border dark:text-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors duration-300 appearance-none cursor-pointer"
            >
              <option value="">Pilih Role</option>
              <option value="Crew">Crew</option>
              <option value="Owner">Owner</option>
            </select>
            {errors.role && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex gap-2 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-medium dark:bg-[#1e2130] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2a2d42] hover:bg-gray-200 transition-colors active:scale-[0.98]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-md shadow-blue-600/20"
            >
              {isSubmitting ? "Loading..." : user ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const UpdatePasswordModal = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  userId,
  user,
}) => {
  if (!isOpen || !userId) return null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) =>
      api.put(`owner/users/${userId}/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),

    onSuccess: async () => {
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onUpdateSuccess();
      onClose();
    },

    onError: async (error) => {
      const message =
        error.response?.data?.message || "Gagal memperbarui password";

      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    },
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      Swal.fire({
        icon: "error",
        text: "Password tidak sama ",
      });
      return;
    }
    updatePasswordMutation.mutate({ password: data.password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl dark:bg-[#13151f] bg-white dark:border-[#1e2130] border-gray-200 shadow-xl transition-colors duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 dark:border-[#1e2130] border-gray-200 border-b transition-colors duration-300">
          <h3 className="text-sm sm:text-base font-semibold dark:text-white text-gray-900">
            Update Password
            <span className="block text-[10px] sm:text-xs dark:text-gray-400 text-gray-500 font-normal mt-0.5">
              {user.nama}
            </span>
          </h3>

          <button
            onClick={onClose}
            className="dark:text-gray-400 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-5 space-y-4"
        >
          {/* PASSWORD */}
          <div>
            <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
              Password Baru
            </label>

            <div className="relative mt-1.5">
              <input
                {...register("password", {
                  required: "Password wajib diisi",
                  minLength: {
                    value: 8,
                    message: "Minimal 8 karakter",
                  },
                })}
                type={showPassword ? "text" : "password"}
                className={`w-full pl-3 pr-9 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 outline-none transition-colors duration-300
              ${errors.password ? "border-red-500" : "dark:border-[#23263a] border-gray-200"}
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50`}
                placeholder="Minimal 8 karakter"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-xs dark:text-gray-400 text-gray-600 font-medium">
              Konfirmasi Password
            </label>

            <div className="relative mt-1.5">
              <input
                {...register("confirmPassword", {
                  required: "Konfirmasi wajib",
                  validate: (value) =>
                    value === watch("password") || "Password tidak sama",
                })}
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full pl-3 pr-9 py-2 text-xs rounded-lg dark:bg-[#0f111a] bg-gray-50 border dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 outline-none transition-colors duration-300
              ${errors.confirmPassword ? "border-red-500" : "dark:border-[#23263a] border-gray-200"}
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50`}
                placeholder="Ulangi password"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ACTION */}
          <div className="flex gap-2 pt-2 sm:pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg text-xs font-medium dark:bg-[#1e2130] bg-gray-100 dark:text-gray-400 text-gray-600 hover:dark:bg-[#2a2d42] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-[0.98] shadow-md shadow-purple-600/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
