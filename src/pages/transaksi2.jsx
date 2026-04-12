import React, { useState } from "react";
import JualanVoucher from "./jualan-voucher";
import TransaksiPage from "./transaksi";
import { LayoutGrid, Receipt, Ticket } from "lucide-react";

export default function Transaksi2() {
  const [viewMode, setViewMode] = useState("transaksi");

  return (
    <div className="w-full mt-4">
      <div className="flex  mb-2 gap-2  justify-center sm:justify-start">
        <ToggleViewButton
          active={viewMode === "transaksi"}
          onClick={() => setViewMode("transaksi")}
          icon={<Receipt className="w-4 h-4" />}
          label="Transaksi"
        />
        <ToggleViewButton
          active={viewMode === "voucher"}
          onClick={() => setViewMode("voucher")}
          icon={<Ticket className="w-4 h-4" />}
          label="Voucher"
        />
        <ToggleViewButton
          active={viewMode === "all"}
          onClick={() => setViewMode("all")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Semua"
        />
        {/* <ToggleViewButton
          active={viewMode === "all"}
          onClick={() => setViewMode("all")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Laporan"
        /> */}
      </div>
      {viewMode === "all" ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2 w-full">
            <JualanVoucher />
          </div>
          <div className="sm:w-1/2 w-full">
            <TransaksiPage />
          </div>
        </div>
      ) : viewMode === "voucher" ? (
        <div className="w-full">
          <JualanVoucher />
        </div>
      ) : (
        <div className="w-full">
          <TransaksiPage />
        </div>
      )}
    </div>
  );
}

function ToggleViewButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 border
      ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      }
      active:scale-95`}
    >
      {/* Icon */}

      {/* Label */}
      <span className="truncate ">{label}</span>
    </button>
  );
}
