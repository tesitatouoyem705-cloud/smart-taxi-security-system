import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import { EmergencyProvider } from "./context/EmergencyContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <EmergencyProvider>
            <App />
          </EmergencyProvider>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
