"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import { useEffect } from "react";

export default function PrintService() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["print-service", id],
    queryFn: async () => {
      const res = await api.get(`detail/service/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!id && !!user?.token,
  });

  // 🔥 AUTO PRINT
  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [data]);

  if (isLoading || !data) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  // 🔥 HITUNG TOTAL
  const totalSparepart =
    data.Sparepart?.reduce((sum, sp) => {
      const harga = Number(sp.Produk?.hargaEceran) || 0;
      const qty = Number(sp.quantity) || 0;
      return sum + harga * qty;
    }, 0) || 0;

  const jasa = data.biayaJasa || 0;
  const total = totalSparepart + jasa;

  const format = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <>
      <style>{`
        @media screen {
          body {
            background: #f5f5f5;
            padding: 20px;
          }
          .print-container {
            width: 80mm;
            margin: auto;
            background: white;
            padding: 15px;
          }
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
          }
        }

        body {
          font-family: monospace;
          font-size: 13px;
        }

        .center { text-align: center; }
        .bold { font-weight: bold; }

        .divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
      `}</style>

      <div className="print-container">
        {/* HEADER */}
        <div className="center bold" style={{ fontSize: 16 }}>
          {user.namaToko}
        </div>

        <div className="center" style={{ marginBottom: 6 }}>
          Service HP
        </div>

        <div className="divider" />

        {/* INFO */}
        <div className="row">
          <span>ID</span>
          <span>{data.id.slice(0, 8)}</span>
        </div>

        <div className="row">
          <span>Tanggal</span>
          <span>{new Date(data.tanggal).toLocaleString("id-ID")}</span>
        </div>

        <div className="row">
          <span>Nama</span>
          <span>{data.namaMember}</span>
        </div>

        <div className="row">
          <span>No HP</span>
          <span>{data.noHP}</span>
        </div>

        <div className="row">
          <span>HP</span>
          <span>{data.brandHP}</span>
        </div>

        <div className="divider" />

        {/* KETERANGAN */}
        <div style={{ marginBottom: 6 }}>
          <span className="bold">Kerusakan:</span>
          <div>{data.keterangan}</div>
        </div>

        <div className="divider" />

        {/* SPAREPART */}
        {data.Sparepart?.map((sp) => {
          const harga = Number(sp.Produk?.hargaEceran) || 0;
          const qty = Number(sp.quantity) || 0;

          return (
            <div key={sp.id} className="row">
              <span>
                {sp.Produk?.nama} x{qty}
              </span>
              <span>{format(harga * qty)}</span>
            </div>
          );
        })}

        {/* JASA */}
        <div className="row">
          <span>Jasa</span>
          <span>{format(jasa)}</span>
        </div>

        <div className="divider" />

        {/* TOTAL */}
        <div className="row bold">
          <span>TOTAL</span>
          <span>{format(total)}</span>
        </div>

        <div className="divider" />

        {/* STATUS */}
        <div className="center">
          Status: <b>{data.status}</b>
        </div>

        {/* FOOTER */}
        <div className="center" style={{ marginTop: 10 }}>
          Terima kasih 🙏
        </div>

        <div className="center" style={{ fontSize: 11 }}>
          {user.alamat}
        </div>

        <div className="center" style={{ fontSize: 11 }}>
          Telp: {user.noTelp}
        </div>
      </div>
    </>
  );
}
