import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Jazzicon from "react-jazzicon";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import WalletModal from "../wallet/WalletModal";

const Header = () => {
  const { walletAddress, disconnectWallet } = useMovementWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || location.pathname !== "/discover") return;

    const timeoutId = setTimeout(() => {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, location.pathname, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return (
    <header className={styles.header}>
      {/* Navigation Controls */}
      <div className={styles.navControls}>
        <button className={styles.navButton} onClick={goBack}>
          <FiChevronLeft />
        </button>
        <button className={styles.navButton} onClick={goForward}>
          <FiChevronRight />
        </button>
      </div>

      {/* Search Bar */}
      {location.pathname === "/discover" && (
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search for songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>
      )}

      {/* Right Section */}
      <div className={styles.rightSection}>
        {!walletAddress ? (
          <button
            className={styles.connectButton}
            onClick={() => setShowWalletModal(true)}
          >
            Connect Wallet
          </button>
        ) : (
          <div
            className={styles.userProfile}
            onClick={() => navigate(`/profile/${walletAddress}`)}
          >
            <Jazzicon
              diameter={32}
              seed={parseInt(walletAddress.slice(2, 10), 16)}
            />
          </div>
        )}
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </header>
  );
};

export default Header;
