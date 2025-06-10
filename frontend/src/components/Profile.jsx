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
    <div className="max-w-xl mx-auto mt-16 p-8 bg-yellow-50 rounded-xl shadow-lg font-sans border border-yellow-200">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">User Profile</h2>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin h-6 w-6 border-4 border-yellow-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-yellow-800">Loading user details...</span>
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        user && (
          <div className="space-y-5 text-gray-700">
            <div className="flex justify-center">
              <img
                src={`https://ui-avatars.com/api/?name=${user.username}&background=facc15&color=000&size=128`}
                alt="User Avatar"
                className="rounded-full shadow-md"
              />
            </div>
            <p className="text-lg">
              <span className="font-semibold">Username:</span> {user.username || "N/A"}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Email:</span> {user.email || "N/A"}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
