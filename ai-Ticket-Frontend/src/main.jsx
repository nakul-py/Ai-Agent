import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import React from "react";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TicketPage from "./pages/Ticket.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Tickets from "./pages/Tickets.jsx";
import Admin from "./pages/Admin.jsx";
import Auth from "./components/Auth.jsx";
import Navbar from "./components/Navbar.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />} />
        <Route
          path="/"
          element={
            <Auth protected={true}>
              <Tickets />
            </Auth>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <Auth protected={true}>
              <TicketPage />
            </Auth>
          }
        />
        <Route
          path="/login"
          element={
            <Auth protected={false}>
              <Login />
            </Auth>
          }
        />
        <Route
          path="/signup"
          element={
            <Auth protected={false}>
              <SignUp />
            </Auth>
          }
        />
        <Route
          path="/admin"
          element={
            <Auth protected={true} admin={true}>
              <Admin />
            </Auth>
          }
        />

      </Routes>
    </BrowserRouter>
    </Provider>
  </StrictMode>
);
