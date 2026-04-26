import { useState, useEffect } from "react";

// Tailwind config — tambahkan ini ke tailwind.config.js jika pakai Vite/CRA:
// colors: { hijau: { 50:'#f0fdf4', ... } }
// fontFamily: { jakarta: ['"Plus Jakarta Sans"', 'sans-serif'], serif: ['"Instrument Serif"', 'serif'] }

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #052e16; color: #f0fdf4; overflow-x: hidden; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .fade-up { animation: fadeUp 0.7s ease both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .float-anim { animation: float 4s ease-in-out infinite; }
  .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
  .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
  .btn-primary { background: linear-gradient(135deg, #22c55e, #16a34a); transition: all 0.2s; }
  .btn-primary:hover { background: linear-gradient(135deg, #4ade80, #22c55e); transform: scale(1.03); }
  .nav-glass { background: rgba(5, 46, 22, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(34,197,94,0.15); }
  .hero-bg { background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.18) 0%, transparent 70%); }
  .section-divider { background: linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent); height: 1px; }
  .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); transition: all 0.3s; }
  .feature-card:hover { background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.3); }
  .price-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); }
  .price-featured { background: linear-gradient(145deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08)); border: 1.5px solid rgba(34,197,94,0.5); }
  .testimonial-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s; }
  .step-line { background: linear-gradient(to bottom, rgba(34,197,94,0.5), rgba(34,197,94,0.1)); }
`;

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8l3.5 3.5L13 4.5"
      stroke="#22c55e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="3" width="14" height="22" rx="2" fill="#22c55e" />
    <rect x="10" y="3" width="14" height="22" rx="2" fill="#16a34a" />
    <line
      x1="13"
      y1="8"
      x2="21"
      y2="8"
      stroke="#bbf7d0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="13"
      y1="12"
      x2="21"
      y2="12"
      stroke="#bbf7d0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="13"
      y1="16"
      x2="19"
      y2="16"
      stroke="#86efac"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const features = [
  {
    icon: "📊",
    title: "Laporan Real-time",
    desc: "Pantau penjualan harian, mingguan, dan bulanan dalam satu dashboard yang mudah dipahami.",
  },
  {
    icon: "📦",
    title: "Manajemen Stok",
    desc: "Catat keluar masuk barang otomatis setiap kali ada transaksi. Tidak ada lagi stok menumpuk.",
  },
  {
    icon: "💰",
    title: "Rekap Keuntungan",
    desc: "Hitung margin keuntungan per produk secara otomatis tanpa perlu rumus Excel yang rumit.",
  },
  {
    icon: "🧾",
    title: "Cetak Nota Digital",
    desc: "Kirim nota ke pelanggan langsung via WhatsApp. Profesional dan praktis di genggaman.",
  },
  {
    icon: "📱",
    title: "Akses Multi-perangkat",
    desc: "Pantau kontermu dari mana saja — HP, tablet, atau laptop. Data selalu sinkron real-time.",
  },
  {
    icon: "👥",
    title: "Manajemen Member Profesional",
    desc: "Pantau dan kelola pelanggan dengan sistem terintegrasi mendukung operasional bisnis yang lebih efisien.",
  },
];

const serviceFeatures = [
  // {
  //   icon: "🔧",
  //   title: "Antrian Servis",
  //   desc: "Catat HP masuk dengan nomor antrian otomatis. Pelanggan tidak perlu khawatir HP-nya tertukar.",
  // },
  {
    icon: "📋",
    title: "Keluhan & Diagnosa",
    desc: "Dokumentasikan keluhan, kondisi HP saat masuk, dan hasil diagnosa teknisi dalam satu form.",
  },
  // {
  //   icon: "⏱️",
  //   title: "Estimasi & Deadline",
  //   desc: "Tetapkan estimasi biaya dan tenggat waktu pengerjaan. Pelanggan bisa pantau status servisnya.",
  // },
  {
    icon: "💬",
    title: "Update Status via WA",
    desc: "Kirim notifikasi otomatis ke pelanggan saat HP selesai diservis — langsung ke WhatsApp mereka.",
  },
  {
    icon: "🛠️",
    title: "Riwayat Servis",
    desc: "Simpan riwayat servis per pelanggan dan per perangkat. Berguna untuk garansi dan servis berulang.",
  },
  {
    icon: "📈",
    title: "Laporan Pendapatan Servis",
    desc: "Pisahkan laporan omzet penjualan dan pendapatan servis agar keuangan kontermu lebih transparan.",
  },
];

const posFeatures = [
  {
    icon: "🛒",
    title: "Kasir Cepat",
    desc: "Tambah produk ke keranjang dengan sekali tap. Proses transaksi selesai dalam hitungan detik.",
  },
  {
    icon: "🔍",
    title: "Cari Produk Instan",
    desc: "Cari barang lewat nama, barcode, atau kategori. Tidak perlu scroll panjang satu per satu.",
  },
  {
    icon: "⚡",
    title: "Transaksi < 10 detik",
    desc: "Terima pembayaran tunai, QRIS, transfer bank, dan dompet digital dalam satu sistem.",
  },

  {
    icon: "⚡",
    title: "Sinkron Ke laporan",
    desc: "Otomatis masuk ke rekap harian & bulanan",
  },

  {
    icon: "🎟️",
    title: "Diskon & Promo Fleksibel",
    desc: "Terapkan diskon per transaksi, Cocok untuk promo harian.",
  },
  {
    icon: "📑",
    title: "Struk Digital & Cetak",
    desc: "Kirim struk via WhatsApp atau cetak ke printer thermal. Dua opsi dalam satu klik.",
  },
];

const steps = [
  {
    num: "01",
    title: "Daftar Gratis",
    desc: "Buat akun dalam 2 menit, tanpa kartu kredit, langsung bisa dipakai.",
  },
  {
    num: "02",
    title: "Input Produk",
    desc: "Masukkan daftar produk kontermu beserta harga beli dan harga jual.",
  },
  {
    num: "03",
    title: "Catat Penjualan",
    desc: "Setiap ada transaksi, catat dalam hitungan detik lewat tampilan yang simpel.",
  },
  {
    num: "04",
    title: "Pantau Laporan",
    desc: "Lihat rekap lengkap penjualan dan keuntunganmu kapan saja dan di mana saja.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "Rp0",
    per: "selamanya",
    features: [
      "1 kasir POS",
      "100 transaksi/bulan",
      "Laporan mingguan",
      "Notifikasi stok",
      "10 tiket servis/bulan",
    ],
    cta: "Mulai Gratis",
    featured: false,
  },
  {
    name: "Pro",
    price: "Rp49.000",
    per: "per bulan",
    features: [
      "5 kasir POS",
      "Transaksi tidak terbatas",
      "Multi metode bayar & QRIS",
      "Laporan real-time",
      "Servis HP tidak terbatas",
      "Struk WA & cetak thermal",
      "Dukungan prioritas",
    ],
    cta: "Coba 14 Hari Gratis",
    featured: true,
  },
  //   {
  //     name: "Bisnis",
  //     price: "Rp129.000",
  //     per: "per bulan",
  //     features: [
  //       "Kasir tidak terbatas",
  //       "Multi-cabang & multi-kasir",
  //       "Laporan analitik lanjutan",
  //       "Export Excel & PDF",
  //       "Manajemen teknisi",
  //       "API integrasi",
  //       "Manajer akun khusus",
  //     ],
  //     cta: "Hubungi Kami",
  //     featured: false,
  //   },
];

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Pemilik Konter Pulsa, Bekasi",
    text: "Dulu sering rugi karena tidak tahu stok yang sudah lama numpuk. Sejak pakai Diginova Konter, semua tercatat rapi dan saya tahu persis kapan harus restock.",
    avatar: "BS",
  },
  {
    name: "Siti Rahayu",
    role: "Konter HP & Aksesori, Surabaya",
    text: "Fitur servis HP-nya luar biasa! Pelanggan senang karena dapat WA otomatis pas HP-nya sudah selesai. Tidak ada lagi yang bolak-balik nanya 'udah jadi belum?'",
    avatar: "SR",
  },
  {
    name: "Rizky Firmansyah",
    role: "Reseller & Konter, Bandung",
    text: "Nota WhatsApp jadi favorit pelanggan saya. Riwayat servis per pelanggan juga membantu banget waktu ada klaim garansi. Profesional banget!",
    avatar: "RF",
  },
];

export default function App() {
  const [activeNav, setActiveNav] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  useEffect(() => {
    // Inject global styles
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);

    const handleScroll = () => setActiveNav(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    // Counter animation
    setTimeout(() => {
      const d1 = setInterval(
        () => setCount1((p) => (p < 12000 ? p + 200 : 12000)),
        20
      );
      const d2 = setInterval(() => setCount2((p) => (p < 98 ? p + 2 : 98)), 40);
      const d3 = setInterval(
        () => setCount3((p) => (p < 500 ? p + 10 : 500)),
        30
      );
      setTimeout(() => {
        clearInterval(d1);
        clearInterval(d2);
        clearInterval(d3);
      }, 3000);
    }, 600);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${activeNav ? "nav-glass" : ""}`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookIcon />
            <span className="font-bold text-xl" style={{ color: "#dcfce7" }}>
              Diginova<span style={{ color: "#4ade80" }}>Konter</span>
            </span>
          </div>
          <div
            className="hidden md:flex items-center gap-8 text-sm"
            style={{ color: "#86efac" }}
          >
            {[
              ["fitur", "Fitur"],
              ["pos", "POS Kasir"],
              ["servis-hp", "Servis HP"],
              ["cara-kerja", "Cara Kerja"],
              ["harga", "Harga"],
              ["testimoni", "Testimoni"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="hover:opacity-80 transition-opacity"
              >
                {label}
              </a>
            ))}
          </div>
          <button
            className="btn-primary text-white text-sm font-semibold px-5 py-2"
            style={{ borderRadius: 12 }}
          >
            Coba Gratis →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-bg min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            {/* <div
              className="inline-flex items-center gap-2 mb-6 fade-up"
              style={{
                background: "#052e16",
                border: "1px solid #15803d",
                borderRadius: 999,
                padding: "6px 16px",
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "block",
                }}
              />
              <span style={{ color: "#86efac", fontSize: 13 }}>
                Baru: Fitur Nota WhatsApp tersedia!
              </span>
            </div> */}

            {/* Heading */}
            <h1
              className="fade-up delay-1"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                color: "#f0fdf4",
                lineHeight: 1.15,
                marginBottom: 24,
              }}
            >
              Catat Penjualan
              <br />
              <span style={{ color: "#4ade80", fontStyle: "italic" }}>
                Kontermu
              </span>
              <br />
              Tanpa Ribet
            </h1>

            <p
              className="fade-up delay-2"
              style={{
                color: "#86efac",
                fontSize: 17,
                lineHeight: 1.75,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              Diginova Konter adalah aplikasi pencatatan penjualan dan transaksi
              khusus untuk konter pulsa, Voucher, HP, aksesoris, sparepart dan
              Servis HP, Dari stok hingga laporan laba — semua dalam satu
              genggaman.
            </p>

            <div className="flex flex-wrap gap-4 fade-up delay-3">
              <button
                className="btn-primary text-white font-bold px-7 py-3"
                style={{ borderRadius: 12, fontSize: 15 }}
              >
                Mulai Gratis Sekarang
              </button>
              <button
                style={{
                  border: "1px solid #15803d",
                  color: "#86efac",
                  padding: "12px 28px",
                  borderRadius: 12,
                  fontSize: 15,
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Lihat Demo →
              </button>
            </div>
            <p
              className="fade-up delay-4"
              style={{ color: "#166534", fontSize: 13, marginTop: 14 }}
            >
              ✓ Gratis 14 hari · Tidak perlu kartu kredit · Setup 2 menit
            </p>
          </div>

          {/* Mock Dashboard */}
          <div className="float-anim ">
            <div
              style={{
                background: "#16a34a",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Green header bar */}
              <div style={{ background: "#16a34a", padding: "14px 16px 0" }}>
                {/* Summary cards */}
                <div
                  style={{
                    background: "#f0fdf4",
                    borderRadius: 14,
                    padding: "12px 14px 14px",
                    marginBottom: 0,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 0,
                      borderBottom: "none",
                      marginBottom: 10,
                    }}
                  >
                    {[
                      {
                        label: "Pemasukan",
                        nominal: 1240000,
                        dot: "#22c55e",
                        color: "#15803d",
                      },
                      {
                        label: "Pengeluaran",
                        nominal: 320000,
                        dot: "#f43f5e",
                        color: "#be123c",
                      },
                      {
                        label: "Keuntungan",
                        nominal: 920000,
                        dot: "#3b82f6",
                        color: "#1d4ed8",
                      },
                    ].map(({ label, nominal, dot, color }, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "0 12px",
                          borderRight: i < 2 ? "1px solid #dcfce7" : "none",
                          paddingLeft: i === 0 ? 0 : 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: dot,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 10, color: "#6b7280" }}>
                            {label}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color,
                            marginBottom: 4,
                          }}
                        >
                          Rp {nominal.toLocaleString("id-ID")}
                        </p>
                        <div
                          style={{
                            height: 3,
                            borderRadius: 99,
                            background: dot,
                            opacity: 0.35,
                            width: "100%",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "absolute", bottom: 8, right: 12 }}>
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>
                      Lihat Semua →
                    </span>
                  </div>
                </div>

                {/* Search + Filter toolbar */}
                <div style={{ padding: "10px 0 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      background: "#f0fdf4",
                      borderRadius: 8,
                      padding: "7px 10px",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6b7280" }}>🔍</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      Cari nama / ID...
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <div
                      style={{
                        flex: 1,
                        background: "#f0fdf4",
                        borderRadius: 8,
                        padding: "6px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 10, color: "#374151" }}>
                        Semua Kategori
                      </span>
                      <span style={{ fontSize: 9, color: "#9ca3af" }}>▾</span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#f0fdf4",
                        borderRadius: 8,
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span style={{ fontSize: 11 }}>📅</span>
                      <span style={{ fontSize: 10, color: "#374151" }}>
                        Hari ini
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction count */}
              <div style={{ background: "#f0fdf4", padding: "6px 16px" }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  4 transaksi ditemukan
                </span>
              </div>

              {/* Transaction list */}
              <div
                style={{
                  background: "#f0fdf4",
                  padding: "4px 10px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {[
                  {
                    kat: "Penjualan",
                    icon: "🛒",
                    nama: "Umum",
                    nominal: 51500,
                    ts: "Hari ini · 10:42",
                    debit: false,
                    dot: "#22c55e",
                    dotBg: "#dcfce7",
                    textClr: "#15803d",
                  },
                  {
                    kat: "Tarik Tunai",
                    icon: "🛒",
                    nama: "Lesti",
                    nominal: 5000,
                    ts: "Hari ini · 11:42",
                    debit: false,
                    dot: "#22c55e",
                    dotBg: "#dcfce7",
                    textClr: "#15803d",
                  },
                  {
                    kat: "Pembelian",
                    icon: "📦",
                    nama: "Restock Casing iPhone",
                    nominal: 275000,
                    ts: "Hari ini · 09:55",
                    debit: true,
                    dot: "#f43f5e",
                    dotBg: "#ffe4e6",
                    textClr: "#9f1239",
                  },
                  {
                    kat: "Top Up",
                    icon: "🛒",
                    nama: "Abdul",
                    nominal: 2000,
                    ts: "Hari ini · 11:42",
                    debit: false,
                    dot: "#22c55e",
                    dotBg: "#dcfce7",
                    textClr: "#15803d",
                  },
                  {
                    kat: "Transfer",
                    icon: "🛒",
                    nama: "Nurul",
                    nominal: 2000,
                    ts: "Hari ini · 11:42",
                    debit: false,
                    dot: "#22c55e",
                    dotBg: "#dcfce7",
                    textClr: "#15803d",
                  },
                  {
                    kat: "Service HP",
                    icon: "🔧",
                    nama: "Ganti Layar Samsung A54",
                    nominal: 350000,
                    ts: "Hari ini · 10:18",
                    debit: false,
                    dot: "#10b981",
                    dotBg: "#d1fae5",
                    textClr: "#065f46",
                  },

                  {
                    kat: "Pengeluaran",
                    icon: "💸",
                    nama: "Bayar Listrik Konter",
                    nominal: 45000,
                    ts: "Hari ini · 09:10",
                    debit: true,
                    dot: "#f59e0b",
                    dotBg: "#fef3c7",
                    textClr: "#92400e",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "9px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          background: r.dotBg,
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          color: r.textClr,
                        }}
                      >
                        <span>{r.icon}</span>
                        {r.kat}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: r.debit ? "#f43f5e" : "#16a34a",
                        }}
                      >
                        {r.debit ? "−" : "+"}Rp{" "}
                        {r.nominal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        {r.nama}
                      </span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>
                        {r.ts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick action buttons */}
              <div
                style={{
                  background: "#f0fdf4",
                  borderTop: "1px solid #dcfce7",
                  padding: "10px 12px 14px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                  }}
                >
                  {[
                    {
                      icon: "🛒",
                      label: "Penjualan",
                      clr: "#6366f1",
                      border: "#22c55e",
                    },
                    {
                      icon: "⚡",
                      label: "Transaksi",
                      clr: "#3b82f6",
                      border: "#d1d5db",
                    },
                    {
                      icon: "💳",
                      label: "PPOB",
                      clr: "#a855f7",
                      border: "#d1d5db",
                    },
                    {
                      icon: "📱",
                      label: "Service HP",
                      clr: "#10b981",
                      border: "#d1d5db",
                    },
                    {
                      icon: "👛",
                      label: "Uang Keluar",
                      clr: "#f59e0b",
                      border: "#d1d5db",
                    },
                  ].map(({ icon, label, clr, border }, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "8px 4px",
                        background: "#fff",
                        border: `1.5px solid ${border}`,
                        borderRadius: 10,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "#4b5563",
                          textAlign: "center",
                          lineHeight: 1.3,
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {/* <section
        style={{
          padding: "56px 0",
          borderTop: "1px solid rgba(22,163,74,0.15)",
          borderBottom: "1px solid rgba(22,163,74,0.15)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            [count1.toLocaleString("id") + "+", "Konter Aktif"],
            [count2 + "%", "Kepuasan Pengguna"],
            [count3 + "+", "Kota di Indonesia"],
          ].map(([v, l], i) => (
            <div key={i}>
              <p
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 800,
                  color: "#4ade80",
                }}
              >
                {v}
              </p>
              <p style={{ color: "#86efac", fontSize: 13, marginTop: 4 }}>
                {l}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── FEATURES ── */}
      <section id="fitur" style={{ padding: "96px 0" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Fitur Unggulan
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              Semua yang Kamu Butuhkan
            </h2>
            <p style={{ color: "#86efac", maxWidth: 480, margin: "0 auto" }}>
              Dirancang khusus untuk pemilik konter — bukan software akuntansi
              yang bikin pusing.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card card-hover"
                style={{ padding: 24, borderRadius: 20 }}
              >
                <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                <h3
                  style={{
                    color: "#dcfce7",
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "#4ade80", fontSize: 14, lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* ── POS KASIR ── */}
      <section id="pos" style={{ padding: "96px 0" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.35)",
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 999,
              }}
            >
              🛒 Point of Sales
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              Kasir Digital yang Ngebut
            </h2>
            <p
              style={{
                color: "#86efac",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Proses transaksi penjualan langsung dari layar kontermu. Tanpa
              antrian panjang, tanpa salah kembalian, tanpa ribet.
            </p>
          </div>
          {/* Feature grid + POS mock UI */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* POS feature cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {posFeatures.map((f, i) => (
                <div
                  key={i}
                  className="feature-card card-hover"
                  style={{ padding: 18, borderRadius: 16 }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                  <h3
                    style={{
                      color: "#dcfce7",
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{ color: "#4ade80", fontSize: 12, lineHeight: 1.65 }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mock POS UI */}
            {/* Mock POS UI */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
                border: "1px solid #e5e7eb",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {/* Green top bar */}
              <div style={{ background: "#16a34a", height: 5 }} />

              {/* Search + item count */}
              <div
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>🔍</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    Cari produk / scan barcode...
                  </span>
                </div>
                <div
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "5px 8px",
                    borderRadius: 999,
                    minWidth: 42,
                    textAlign: "center",
                  }}
                >
                  15 item
                </div>
              </div>

              {/* Category tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "8px 12px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {[
                  "Semua",
                  "Voucher",
                  "Sparepart",
                  "Aksesoris",
                  "Handphone",
                ].map((t, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: i === 0 ? "#16a34a" : "transparent",
                      color: i === 0 ? "#fff" : "#6b7280",
                      border: i === 0 ? "none" : "1px solid #e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Harga toggle */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "6px 14px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {[
                  ["Harga Grosir", false],
                  ["Harga Eceran", true],
                ].map(([l, active], i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        border: `2px solid ${active ? "#16a34a" : "#d1d5db"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#16a34a",
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: "#374151" }}>{l}</span>
                  </div>
                ))}
              </div>

              {/* Produk Terlaris label */}
              <div style={{ padding: "6px 14px 4px" }}>
                <span
                  style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}
                >
                  🔥 PRODUK TERLARIS
                </span>
              </div>

              {/* Product grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 1,
                  padding: "0 12px 8px",
                  background: "#f9fafb",
                }}
              >
                {[
                  ["6 GB 2 HARI", "Rp 9.000", "77"],
                  ["6 GB 1 Tahun", "Rp 4.000", "9999912"],
                  ["3 GB 3 Hari", "Rp 3.000", "43"],
                  ["5 GB 5 Hari", "Rp 5.000", "142"],
                  ["3 GB 3 Hari", "Rp 3.000", "66"],
                  ["5 GB 5 Tahun", "Rp 10.000", "968"],
                  ["Baterai BLP 789", "Rp 12.000", "9999961"],
                  ["Headset", "Rp 7.999", "9999975"],
                  ["LCD Meeto", "Rp 120.000", "9999977"],
                ].map(([nama, harga, stok], i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "8px 9px",
                      cursor: "pointer",
                      margin: 2,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {nama}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16a34a",
                        marginBottom: 2,
                      }}
                    >
                      {harga}
                    </p>
                    <p style={{ fontSize: 9, color: "#9ca3af" }}>
                      Stok: {stok}
                    </p>
                  </div>
                ))}
              </div>

              {/* Nama pembeli */}
              <div style={{ padding: "6px 14px 4px" }}>
                <span
                  style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}
                >
                  👤 NAMA PEMBELI
                </span>
              </div>
              <div
                style={{
                  margin: "0 12px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "7px 10px",
                }}
              >
                <span style={{ fontSize: 11, color: "#d1d5db" }}>
                  👤 Nama pembeli (opsional)...
                </span>
              </div>

              {/* Potongan harga */}
              <div style={{ padding: "4px 14px 4px" }}>
                <span
                  style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}
                >
                  $ POTONGAN HARGA
                </span>
              </div>
              <div
                style={{
                  margin: "0 12px 8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "7px 10px",
                }}
              >
                <span style={{ fontSize: 11, color: "#d1d5db" }}>$ Rp 0</span>
              </div>

              {/* Keranjang label */}
              <div style={{ padding: "4px 14px 4px" }}>
                <span
                  style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}
                >
                  🛒 KERANJANG
                </span>
              </div>

              {/* Cart items */}
              <div
                style={{
                  padding: "0 12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {[
                  ["6 GB 2 HARI", "Rp 36.000", "73", 4],
                  ["6 GB 1 Tahun", "Rp 16.000", "9999908", 4],
                  ["3 GB 3 Hari", "Rp 9.000", "42", 3],
                  ["5 GB 5 Hari", "Rp 20.000", "138", 4],
                ].map(([nama, total, stok, qty], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 10px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      background: "#fff",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {nama}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#16a34a",
                          fontWeight: 700,
                          marginBottom: 1,
                        }}
                      >
                        {total}
                      </p>
                      <p style={{ fontSize: 9, color: "#9ca3af" }}>
                        Stok: {stok}
                      </p>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#111827",
                          minWidth: 14,
                          textAlign: "center",
                        }}
                      >
                        {qty}
                      </span>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </div>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: "#fff0f0",
                          border: "1px solid #fecaca",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        🗑
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + Checkout bar */}
              <div
                style={{
                  margin: "4px 12px 12px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    15 item
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 14px 10px",
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}
                  >
                    Total
                  </span>
                  <span
                    style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}
                  >
                    Rp 81.000
                  </span>
                </div>
                <div
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "center",
                    padding: "12px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>🧾</span> Proses Pembayaran
                </div>
              </div>
            </div>
          </div>
          {/* Bottom highlight strip
          <div
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                icon: "⚡",
                label: "Transaksi < 10 detik",
                sub: "Dari pilih produk sampai struk terkirim",
              },
              {
                icon: "📶",
                label: "Offline-ready",
                sub: "Tetap berfungsi meski internet putus",
              },
              {
                icon: "🖨️",
                label: "Cetak Struk Thermal",
                sub: "Kompatibel dengan printer 58mm & 80mm",
              },
              {
                icon: "📊",
                label: "Sinkron ke Laporan",
                sub: "Otomatis masuk ke rekap harian & bulanan",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(22,163,74,0.07)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <p
                    style={{
                      color: "#dcfce7",
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 3,
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{ color: "#4ade80", fontSize: 12, lineHeight: 1.55 }}
                  >
                    {s.sub}
                  </p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* ── SERVICE HP ── */}
      <section
        id="servis-hp"
        style={{ padding: "96px 0", background: "rgba(5,46,22,0.5)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.4)",
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: 999,
              }}
            >
              🔧 Fitur Baru
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 16,
                marginBottom: 12,
              }}
            >
              Manajemen Servis HP
            </h2>
            <p
              style={{
                color: "#86efac",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Bukan cuma jualan — kontermu juga terima servis? Kelola semua
              antrian, status pengerjaan, dan riwayat servis dalam satu tempat.
            </p>
          </div>

          {/* Two-col: mock UI + feature list */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Mock Service UI — mirip screenshot */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Summary header */}
              <div
                style={{
                  background: "#fff",
                  borderBottom: "1px solid #f3f4f6",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 0,
                  }}
                >
                  {[
                    {
                      label: "Total Trx",
                      val: "Rp 5",
                      dot: "#8b5cf6",
                      color: "#7c3aed",
                      bar: "#8b5cf6",
                    },
                    {
                      label: "Total Omset",
                      val: "Rp 470.000",
                      dot: "#3b82f6",
                      color: "#1d4ed8",
                      bar: "#3b82f6",
                    },
                    {
                      label: "Keuntungan",
                      val: "Rp 414.000",
                      dot: "#22c55e",
                      color: "#15803d",
                      bar: "#22c55e",
                    },
                  ].map(({ label, val, dot, color, bar }, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0 10px",
                        borderRight: i < 2 ? "1px solid #f3f4f6" : "none",
                        paddingLeft: i === 0 ? 4 : 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginBottom: 3,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: dot,
                          }}
                        />
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                          {label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color,
                          marginBottom: 5,
                        }}
                      >
                        {val}
                      </p>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 99,
                          background: bar,
                          opacity: 0.4,
                          width: "100%",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toolbar row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 14px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span
                  style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}
                >
                  transaksi
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontSize: 11,
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  <span>↗</span>
                  <span>Export</span>
                </div>
              </div>

              {/* Search bar */}
              <div
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "7px 10px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>🔍</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      Cari nama pembeli...
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 7,
                    }}
                  >
                    Filter
                  </div>
                </div>
              </div>

              {/* Service cards */}
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "#f9fafb",
                }}
              >
                {[
                  {
                    nama: "Abdul",
                    hp: "iphone 17 promax cash",
                    ket: "error",
                    tgl: "16 Apr 2026, 01.11",
                    harga: "Rp 100.000",
                    untung: "+Rp 102.000",
                    status: "Selesai",
                    statusClr: "#15803d",
                    statusBg: "#dcfce7",
                  },
                  {
                    nama: "testtt",
                    hp: "Redmi 10",
                    ket: "error",
                    tgl: "12 Apr 2026, 19.14",
                    harga: "Rp 50.000",
                    untung: "+Rp 52.000",
                    status: "Selesai",
                    statusClr: "#15803d",
                    statusBg: "#dcfce7",
                  },
                  {
                    nama: "Test",
                    hp: "Redmuy",
                    ket: "error",
                    tgl: "12 Apr 2026, 19.10",
                    harga: "Rp 50.000",
                    untung: "+Rp 52.000",
                    status: "Proses",
                    statusClr: "#92400e",
                    statusBg: "#fef3c7",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: "10px 12px",
                    }}
                  >
                    {/* Row 1: nama + harga */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {r.nama}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {r.harga}
                      </span>
                    </div>
                    {/* Row 2: detail + untung */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>
                          {r.hp} • {r.ket}
                        </span>
                        <br />
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                          {r.tgl}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#16a34a",
                        }}
                      >
                        {r.untung}
                      </span>
                    </div>
                    {/* Status badge */}
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          background: r.statusBg,
                          color: r.statusClr,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                    {/* Action icons */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        borderTop: "1px solid #f3f4f6",
                        paddingTop: 8,
                      }}
                    >
                      {[
                        ["👁️", "#6366f1"],
                        ["✏️", "#f59e0b"],
                        ["🖨️", "#374151"],
                        ["🗑️", "#ef4444"],
                        ["💬", "#22c55e"],
                      ].map(([ic, clr], j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 15,
                            cursor: "pointer",
                            opacity: 0.85,
                          }}
                        >
                          {ic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary bar — 3 Antri / Dikerjakan / Selesai */}
              <div
                style={{
                  background: "#fff",
                  borderTop: "1px solid #f3f4f6",
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: "3 Antri",
                      icon: "🕐",
                      color: "#7c3aed",
                      bg: "rgba(139,92,246,0.1)",
                    },
                    {
                      label: "5 Dikerjakan",
                      icon: "⚙️",
                      color: "#d97706",
                      bg: "rgba(234,179,8,0.12)",
                    },
                    {
                      label: "12 Selesai",
                      icon: "✅",
                      color: "#15803d",
                      bg: "rgba(34,197,94,0.12)",
                    },
                  ].map(({ label, icon, color, bg }, i) => (
                    <div
                      key={i}
                      style={{
                        background: bg,
                        borderRadius: 10,
                        padding: "8px 6px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 15 }}>{icon}</div>
                      <div
                        style={{
                          color,
                          fontSize: 10,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service features grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {serviceFeatures.map((f, i) => (
                <div
                  key={i}
                  className="feature-card card-hover"
                  style={{ padding: 18, borderRadius: 16 }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                  <h3
                    style={{
                      color: "#dcfce7",
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{ color: "#4ade80", fontSize: 12, lineHeight: 1.65 }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA strip */}
          {/* <div
            style={{
              marginTop: 56,
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20,
              padding: "28px 32px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  color: "#dcfce7",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                Gratis untuk pengguna paket Pro & Bisnis
              </p>
              <p style={{ color: "#4ade80", fontSize: 14 }}>
                Fitur Servis HP sudah termasuk tanpa biaya tambahan.
              </p>
            </div>
            <button
              className="btn-primary"
              style={{
                color: "#fff",
                fontWeight: 700,
                padding: "12px 32px",
                borderRadius: 12,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Coba Fitur Servis →
            </button>
          </div> */}
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" style={{ padding: "96px 0" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Cara Kerja
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              Mulai dalam 4 Langkah
            </h2>
            <p style={{ color: "#86efac" }}>
              Tanpa pelatihan, tanpa instalasi rumit. Langsung jalan.
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <div
              className="step-line"
              style={{
                position: "absolute",
                left: 31,
                top: 40,
                bottom: 40,
                width: 2,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {steps.map((s, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 24, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      background: "#052e16",
                      border: "2px solid #16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#86efac",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {s.num}
                    </span>
                  </div>
                  <div style={{ paddingTop: 12 }}>
                    <h3
                      style={{
                        color: "#f0fdf4",
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 4,
                      }}
                    >
                      {s.title}
                    </h3>
                    <p style={{ color: "#4ade80", lineHeight: 1.7 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* ── PRICING ── */}
      <section id="harga" style={{ padding: "96px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Harga
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              Harga yang Jujur
            </h2>
            <p style={{ color: "#86efac" }}>
              Tidak ada biaya tersembunyi. Tidak ada kontrak jangka panjang.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((p, i) => (
              <div
                key={i}
                className={`card-hover ${p.featured ? "price-featured" : "price-card"}`}
                style={{
                  borderRadius: 20,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {p.featured && (
                  <div
                    style={{
                      background: "#22c55e",
                      color: "#052e16",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 999,
                      alignSelf: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    ⭐ Paling Populer
                  </div>
                )}
                <h3
                  style={{
                    color: "#dcfce7",
                    fontWeight: 700,
                    fontSize: 20,
                    marginBottom: 6,
                  }}
                >
                  {p.name}
                </h3>
                <div style={{ marginBottom: 20 }}>
                  <span
                    style={{ color: "#4ade80", fontSize: 30, fontWeight: 800 }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{ color: "#16a34a", fontSize: 13, marginLeft: 4 }}
                  >
                    /{p.per}
                  </span>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                    marginBottom: 20,
                  }}
                >
                  {p.features.map((feat, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#86efac",
                        fontSize: 13,
                      }}
                    >
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className={p.featured ? "btn-primary" : ""}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    ...(p.featured
                      ? { color: "#fff", border: "none" }
                      : {
                          background: "transparent",
                          border: "1px solid #15803d",
                          color: "#86efac",
                          transition: "all 0.2s",
                        }),
                  }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimoni"
        style={{ padding: "96px 0", background: "rgba(5,46,22,0.4)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 56 }}>
            <span
              style={{
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Testimoni
            </span>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginTop: 12,
              }}
            >
              Kata Mereka yang Sudah Pakai
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial-card card-hover"
                style={{ padding: 24, borderRadius: 20 }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: "#4ade80", fontSize: 13 }}>
                      ★
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    color: "#bbf7d0",
                    fontSize: 13,
                    lineHeight: 1.75,
                    marginBottom: 20,
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#15803d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#bbf7d0",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#dcfce7",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {t.name}
                    </p>
                    <p style={{ color: "#16a34a", fontSize: 11 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {/* <section style={{ padding: "96px 0" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            style={{
              background: "rgba(22,163,74,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 28,
              padding: "64px 48px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                color: "#f0fdf4",
                marginBottom: 16,
              }}
            >
              Siap Rapikan Kontermu?
            </h2>
            <p
              style={{
                color: "#86efac",
                fontSize: 17,
                lineHeight: 1.75,
                marginBottom: 32,
              }}
            >
              Bergabung bersama 12.000+ pemilik konter yang sudah merasakan
              manfaatnya. Gratis selama 14 hari, tanpa kartu kredit.
            </p>
            <button
              className="btn-primary"
              style={{
                color: "#fff",
                fontWeight: 700,
                padding: "16px 48px",
                borderRadius: 14,
                fontSize: 17,
                border: "none",
                cursor: "pointer",
              }}
            >
              Daftar Sekarang — Gratis!
            </button>
            <p style={{ color: "#166534", fontSize: 13, marginTop: 16 }}>
              atau hubungi kami di WhatsApp: 0821-XXXX-XXXX
            </p>
          </div>
        </div>
      </section> */}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #14532d", padding: "40px 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookIcon />
            <span style={{ fontWeight: 700, color: "#dcfce7" }}>
              Diginova<span style={{ color: "#4ade80" }}>Konter</span>
            </span>
          </div>
          <p style={{ color: "#166534", fontSize: 13 }}>
            © 2025 DiginovaKonter. Dibuat dengan ❤️ untuk pemilik konter
            Indonesia.
          </p>
          <div className="flex gap-5">
            {["Privasi", "Syarat", "Kontak"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  color: "#16a34a",
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
