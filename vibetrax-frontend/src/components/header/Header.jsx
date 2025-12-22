import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import { useState, useEffect } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Jazzicon from "react-jazzicon";

const Header = () => {
  const currentAccount = useCurrentAccount();
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
        <ConnectButton className={styles.connectButton} />
        {currentAccount?.address && (
          <div
            className={styles.userProfile}
            onClick={() => navigate(`/profile/${currentAccount.address}`)}
          >
            <Jazzicon diameter={32} seed={currentAccount.address} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
