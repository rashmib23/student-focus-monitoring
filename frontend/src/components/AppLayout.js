// components/AppLayout.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen animate-bg-shift">
      <header className="bg-white/80 backdrop-blur-md shadow px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex gap-6 text-blue-800 font-semibold text-lg">
          <Link to="/dashboard" className="hover:underline transition">Dashboard</Link>
          <Link to="/history" className="hover:underline transition">History</Link>
          <Link to="/suggestion" className="hover:underline transition">Suggestion</Link>
          <Link to="/profile" className="hover:underline transition">Profile</Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
};

export default AppLayout;
