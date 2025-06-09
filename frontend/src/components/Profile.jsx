import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile()
      .then((res) => {
        if (res.data && res.data.username && res.data.email) {
          setUser(res.data);
        } else {
          setError("Invalid profile data received.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setError("Unable to load profile.");
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow-md font-sans">
      <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>

      {loading && <p className="text-gray-600">Loading user details...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {user && (
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Username:</span> {user.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
