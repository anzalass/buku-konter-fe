import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function PrintTransaksi() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["detailTransaksiPrint", id],
    queryFn: async () => {
      const res = await api.get(`detail/transaksi/${id}`, {
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

  console.log(user);

  if (isLoading || !data) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  const formatCurrency = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <>
      {/* 🔥 STYLE PRINT */}
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
          <span>Pembeli</span>
          <span>{data.namaMember || "-"}</span>
        </div>

        <div className="divider" />

        {/* ITEMS */}
        {data.items.map((item) => (
          <div key={item.id} className="row">
            <span>
              {item.Produk?.nama} x{item.quantity}
            </span>
            <span>
              {formatCurrency(item.quantity * item.Produk?.hargaEceran)}
            </span>
          </div>
        ))}

        <div className="divider" />

        {/* TOTAL */}
        <div className="row bold">
          <span>TOTAL</span>
          <span>{formatCurrency(data.totalHarga)}</span>
        </div>

        <div className="divider" />

        <div className="divider" />

        <div className="center" style={{ marginTop: 10 }}>
          Simpan struk ini ya 👍
        </div>

        {/* 🔥 PINDAHAN KE FOOTER */}
        <div className="center" style={{ marginTop: 8, fontSize: 11 }}>
          {user.alamat}
        </div>

        <div className="center" style={{ fontSize: 11 }}>
          Telp: {user.noTelp}
        </div>
      </div>
    </>
  );
}
