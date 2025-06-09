import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import Profile from "./components/Profile";
import Suggestion from "./components/Suggestion";

import AppLayout from "./components/AppLayout";
import PlainLayout from "./components/PlainLayout";

import './tailwind-output.css';
import './index.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/login"
        element={
          <PlainLayout>
            <Login />
          </PlainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PlainLayout>
            <Register />
          </PlainLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/suggestion"
        element={
          <PrivateRoute>
            <AppLayout>
              <Suggestion />
            </AppLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
