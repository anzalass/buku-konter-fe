import { useState, useRef } from "react";
import { Search, X } from "lucide-react";

const BADGE_STYLES = {
  Voucher: { bg: "#1a1f35", text: "#818cf8" },
  Produk: { bg: "#0f2318", text: "#34d399" },
  Member: { bg: "#1f1206", text: "#fb923c" },
  Promo: { bg: "#1f0a14", text: "#f472b6" },
};

const SAMPLE_DATA = [
  {
    label: "Voucher Diskon 50%",
    sub: "Berlaku s.d. 30 Apr",
    kategori: "Voucher",
    onClick: () => {},
  },
  {
    label: "Produk A – Paket Hemat",
    sub: "Stok: 120",
    kategori: "Produk",
    onClick: () => {},
  },
  {
    label: "Member Gold",
    sub: "Aktif sejak Jan 2024",
    kategori: "Member",
    onClick: () => {},
  },
  {
    label: "Promo Akhir Bulan",
    sub: "Min. pembelian 100rb",
    kategori: "Promo",
    onClick: () => {},
  },
  {
    label: "Voucher Cashback 10%",
    sub: "Berlaku s.d. 15 Mei",
    kategori: "Voucher",
    onClick: () => {},
  },
];

export default function PencarianCepat() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? SAMPLE_DATA.filter(
        (d) =>
          d.label.toLowerCase().includes(query.toLowerCase()) ||
          d.kategori.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showResults = query.trim().length > 0;

  return (
    <div
      style={{
        background: "#0c0e17",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div style={{ width: "100%", maxWidth: 390 }}>
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#13151f",
            border: `1px solid ${focused ? "#4f46e5" : "#1e2130"}`,
            borderRadius: 10,
            padding: "9px 12px",
            transition: "border-color 0.15s",
          }}
        >
          <Search
            size={14}
            color={focused ? "#6366f1" : "#3a3d52"}
            style={{ flexShrink: 0, transition: "color 0.15s" }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Cari produk, voucher..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#c8cce0",
              minWidth: 0,
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={13} color="#3a3d52" />
            </button>
          )}
        </div>

        {/* Results */}
        {showResults && (
          <div style={{ marginTop: 6 }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#3a3d52",
                  padding: "20px 0",
                }}
              >
                Tidak ada hasil
              </p>
            ) : (
              filtered.map((item, i) => {
                const s = BADGE_STYLES[item.kategori] ?? BADGE_STYLES.Voucher;
                return (
                  <div
                    key={i}
                    onClick={() => item.onClick?.()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#13151f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Icon dot */}
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: s.text,
                        flexShrink: 0,
                      }}
                    />

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#c8cce0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          color: "#3a3d52",
                          marginTop: 1,
                        }}
                      >
                        {item.sub}
                      </p>
                    </div>

                    {/* Badge */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: s.text,
                        background: s.bg,
                        padding: "2px 7px",
                        borderRadius: 5,
                        flexShrink: 0,
                      }}
                    >
                      {item.kategori}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
