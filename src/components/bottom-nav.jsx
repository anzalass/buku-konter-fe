import { Home, Package, History, Activity, Database } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { label: "Beranda", icon: Home, path: "/dashboard/penggabungan" },
    { label: "Produk", icon: Package, path: "/dashboard/product" },
    { label: "Master Data", icon: Database, path: "/dashboard/master-data" },
    { label: "History", icon: History, path: "/dashboard/history" },
    { label: "Log", icon: Activity, path: "/dashboard/logs" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 
      bg-green-700 dark:bg-indigo-800 
      border-t border-gray-200 dark:border-gray-700 
      shadow-md "
    >
      <div className="grid grid-cols-5">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;
          const Icon = menu.icon;

          return (
            <button
              key={menu.path}
              onClick={() => navigate(menu.path)}
              className={`flex flex-col items-center justify-center py-3 md:text-xs text-[8px] transition
                ${
                  isActive
                    ? "text-white dark:text-blue-400 font-semibold"
                    : "text-white dark:text-gray-400"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition ${
                  isActive ? "scale-110" : ""
                }`}
              />
              {menu.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
