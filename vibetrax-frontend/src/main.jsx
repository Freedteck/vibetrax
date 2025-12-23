import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router.jsx";
import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "./components/providers/WalletProvider";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID || "YOUR_PRIVY_APP_ID"}
          config={{
            loginMethods: ["email", "google", "twitter", "discord", "github"],
            appearance: {
              theme: "light",
              accentColor: "#6366F1",
            },
          }}
        >
          <RouterProvider router={router} />
        </PrivyProvider>
      </WalletProvider>
    </QueryClientProvider>
  </StrictMode>
);
