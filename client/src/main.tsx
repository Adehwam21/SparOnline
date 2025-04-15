
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import { Provider } from "react-redux";
import { store } from "./redux/reduxStore";
import "./index.css";
import "./config/axiosConfig.js";
import { Toaster } from "react-hot-toast";
import React from "react";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <Toaster toastOptions={{ duration: 5000 }} />
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
