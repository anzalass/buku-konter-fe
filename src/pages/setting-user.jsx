import React, { useEffect, useState } from "react";
import StoreSettingsPage from "./setting";
import UserManagementPage from "./user";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Moon, Sun } from "lucide-react";

export default function SettingUser() {
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin mau keluar?",
      text: "Session kamu akan diakhiri",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post("auth/logout");

      await Swal.fire({
        title: "Berhasil Logout",
        text: "Kamu akan diarahkan ke halaman login",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.href = "/";
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Gagal Logout",
        text: "Terjadi kesalahan, coba lagi",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex flex-col pb-20 justify-between mx-auto max-w-7xl ">
      <StoreSettingsPage />
      <UserManagementPage />
      <div className="px-4">
        <button
          onClick={handleLogout}
          className="text-white w-full text-sm bg-red-500 p-2 mt-2 rounded-md"
        >
          Logout / Keluar
        </button>
      </div>
      {/* <ThemeToggle /> */}
    </div>
  );
}
