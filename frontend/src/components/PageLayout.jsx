// src/components/PageLayout.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";

const PageLayout = ({ children }) => {
  const location = useLocation();

  const backgroundByRoute = {
    "/dashboard": "bg-gray-100",
    "/history": "bg-indigo-50",
    "/suggestion": "bg-green-50",
    "/profile": "bg-yellow-50",
    // fallback
    default: "bg-white",
  };

  const currentBg = backgroundByRoute[location.pathname] || backgroundByRoute.default;

  return (
    <div className={`${currentBg} min-h-screen`}>
      <Header />
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
};

export default PageLayout;
