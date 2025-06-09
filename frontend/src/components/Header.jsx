// src/components/Header.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header on login or register routes
  if (["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">Dashboard</Link>
          <Link to="/history" className="text-blue-600 hover:underline font-semibold">History</Link>
          <Link to="/suggestion" className="text-blue-600 hover:underline font-semibold">Suggestion</Link>
          <Link to="/profile" className="text-blue-600 hover:underline font-semibold">Profile</Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
