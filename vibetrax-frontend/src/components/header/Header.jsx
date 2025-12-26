import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiZap,
  FiStar,
  FiShoppingBag,
} from "react-icons/fi";
import Jazzicon from "react-jazzicon";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import { useAppContext } from "../../hooks/useAppContext";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletModal from "../wallet/WalletModal";
import BuyTokensModal from "../../modals/buy-tokens-modal/BuyTokensModal";
import Button from "../button/Button";

const Header = () => {
  const { walletAddress, disconnectWallet } = useMovementWallet();
  const { tokenBalance } = useAppContext();
  const { authenticated, logout: privyLogout } = usePrivy();
  const { connected, disconnect: nativeDisconnect } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Determine wallet type
  const isPrivyWallet = authenticated;
  const isNativeWallet = connected && !authenticated;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      if (isPrivyWallet) {
        await privyLogout();
      } else if (isNativeWallet) {
        await nativeDisconnect();
      }
      disconnectWallet();
      setShowDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

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
          <Button
            btnClass="primary"
            text="Connect Wallet"
            onClick={() => setShowWalletModal(true)}
          />
        ) : (
          <div className={styles.walletInfo} ref={dropdownRef}>
            {/* Token Balance */}
            <div className={styles.tokenBalance}>
              <FiZap className={styles.tokenIcon} />
              <span className={styles.tokenAmount}>
                {tokenBalance.toLocaleString()}
              </span>
              <span className={styles.tokenLabel}>VIBE</span>
            </div>

            {(isPrivyWallet || isNativeWallet) && (
              <span
                className={`${styles.walletBadge} ${
                  isPrivyWallet ? styles.privyBadge : styles.nativeBadge
                }`}
              >
                {isPrivyWallet ? "Privy" : "Native"}
              </span>
            )}
            <div
              className={styles.userProfile}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Jazzicon
                diameter={32}
                seed={parseInt(walletAddress.slice(2, 10), 16)}
              />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownBalance}>
                    <FiZap className={styles.dropdownTokenIcon} />
                    <div>
                      <div className={styles.dropdownTokenAmount}>
                        {tokenBalance.toLocaleString()} VIBE
                      </div>
                      <div className={styles.dropdownTokenLabel}>
                        Platform Tokens
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.dropdownDivider}></div>
                <div
                  className={`${styles.dropdownItem} ${styles.buyTokensItem}`}
                  onClick={() => {
                    setShowBuyTokensModal(true);
                    setShowDropdown(false);
                  }}
                >
                  <FiShoppingBag />
                  <span>Buy VIBE Tokens</span>
                </div>
                <div className={styles.dropdownDivider}></div>
                <div
                  className={styles.dropdownItem}
                  onClick={() => {
                    navigate(`/profile/${walletAddress}`);
                    setShowDropdown(false);
                  }}
                >
                  <span>View Profile</span>
                </div>
                <div className={styles.dropdownDivider}></div>
                <div
                  className={`${styles.dropdownItem} ${styles.disconnectItem}`}
                  onClick={handleDisconnect}
                >
                  <FiLogOut />
                  <span>{isPrivyWallet ? "Logout" : "Disconnect"}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
      <BuyTokensModal
        isOpen={showBuyTokensModal}
        onClose={() => setShowBuyTokensModal(false)}
      />
    </header>
  );
};

export default Header;
