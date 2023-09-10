import React from "react";
import ReactDOM from "react-dom/client";
import { RouterConfig } from "./Routes.tsx";
import AuthProvider from "./AuthProvider.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterConfig />
    </AuthProvider>
  </React.StrictMode>
);
