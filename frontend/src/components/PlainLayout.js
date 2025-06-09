// components/PlainLayout.js
import React from "react";

const PlainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center animate-bg-shift">
      {children}
    </div>
  );
};

export default PlainLayout;
