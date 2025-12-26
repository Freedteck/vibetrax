import { useContext } from "react";
import { AppContext } from "../context/AppContext";

/**
 * Custom hook to access the global app context
 * @returns {Object} The app context value
 * @throws {Error} If used outside of AppProvider
 */
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};
