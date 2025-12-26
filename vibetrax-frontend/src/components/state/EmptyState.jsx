import { FiMusic, FiPlus, FiDisc, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "./StateStyles.module.css";

export const EmptyState = ({
  message = "No music found",
  subMessage = "Start exploring or upload your own tracks",
  actionText,
  onAction,
  variant = "default", // default, discover, library, profile
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (variant) {
      case "discover":
        return <FiDisc className={styles.emptyIcon} />;
      case "library":
        return <FiMusic className={styles.emptyIcon} />;
      case "profile":
        return <FiUpload className={styles.emptyIcon} />;
      default:
        return <FiMusic className={styles.emptyIcon} />;
    }
  };

  const getDefaultAction = () => {
    if (onAction && actionText) {
      return { text: actionText, action: onAction };
    }

    switch (variant) {
      case "discover":
        return {
          text: "Browse All Music",
          action: () => navigate("/discover"),
        };
      case "library":
        return {
          text: "Discover Music",
          action: () => navigate("/discover"),
        };
      case "profile":
        return {
          text: "Upload Track",
          action: () => navigate("/upload"),
        };
      default:
        return null;
    }
  };

  const defaultAction = getDefaultAction();

  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.emptyIconWrapper}>{getIcon()}</div>
      <h3 className={styles.emptyTitle}>{message}</h3>
      <p className={styles.emptySubMessage}>{subMessage}</p>
      {defaultAction && (
        <button
          onClick={defaultAction.action}
          className={styles.emptyActionButton}
        >
          <FiPlus />
          {defaultAction.text}
        </button>
      )}
    </div>
  );
};

