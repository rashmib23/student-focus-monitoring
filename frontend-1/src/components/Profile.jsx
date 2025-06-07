import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchUserProfile } from "../api";  // import the axios function

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

     fetchUserProfile()
    .then((data) => {
      console.log("Fetched user profile:", data);  // 👈 Add this
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      setError("Unable to load profile.");
      setLoading(false);
    });
}, [navigate]);

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <nav
        style={{
          marginBottom: 20,
          borderBottom: "1px solid #ccc",
          paddingBottom: 10,
        }}
      >
        <Link to="/dashboard" style={{ marginRight: 15 }}>
          Dashboard
        </Link>
        <Link to="/history" style={{ marginRight: 15 }}>
          History
        </Link>
        <Link to="/profile" style={{ marginRight: 15 }}>
          Profile
        </Link>
        <button onClick={handleLogout} style={{ float: "right" }}>
          Logout
        </button>
      </nav>

      <h2>User Profile</h2>

      {loading && <p>Loading user details...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user && (
        <div style={{ marginBottom: 40 }}>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
