import toast from "react-hot-toast";

/**
 * Toast helper utilities for consistent toast management
 * Handles proper cleanup and prevents hanging loading toasts
 */

/**
 * Show a loading toast and return its ID for later updates
 * @param {string} message - Loading message
 * @returns {string} Toast ID
 */
export const showLoadingToast = (message) => {
  return toast.loading(message);
};

/**
 * Update a loading toast to success
 * @param {string} toastId - ID of the loading toast
 * @param {string} message - Success message
 */
export const showSuccessToast = (toastId, message) => {
  toast.success(message, { id: toastId });
};

/**
 * Update a loading toast to error and ensure it dismisses
 * @param {string} toastId - ID of the loading toast
 * @param {string} message - Error message
 */
export const showErrorToast = (toastId, message) => {
  // First dismiss the loading toast
  if (toastId) {
    toast.dismiss(toastId);
  }
  // Then show error toast
  toast.error(message, {
    duration: 4000,
  });
};

/**
 * Show a standalone error toast (without updating a loading toast)
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
  });
};

/**
 * Show a standalone success toast
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
  });
};

/**
 * Show an info toast
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast(message, {
    icon: "ℹ️",
    duration: 3000,
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Execute an async transaction with proper toast handling
 * @param {Function} transactionFn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {string} options.loadingMessage - Loading toast message
 * @param {string} options.successMessage - Success toast message
 * @param {string} options.errorMessage - Error toast message prefix
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Promise<any>} Transaction result
 */
export const executeWithToast = async (transactionFn, options = {}) => {
  const {
    loadingMessage = "Processing...",
    successMessage = "Success!",
    errorMessage = "Operation failed",
    onSuccess,
    onError,
  } = options;

  const toastId = showLoadingToast(loadingMessage);

  try {
    const result = await transactionFn();

    showSuccessToast(toastId, successMessage);

    if (onSuccess) {
      await onSuccess(result);
    }

    return result;
  } catch (error) {
    console.error("Transaction error:", error);

    const errorMsg = error.message || "Unknown error";
    showErrorToast(toastId, `${errorMessage}: ${errorMsg}`);

    if (onError) {
      onError(error);
    }

    throw error;
  }
};
