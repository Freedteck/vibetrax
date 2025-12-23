import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FiHome,
  FiMusic,
  FiUser,
  FiUpload,
  FiHeart,
  FiRadio,
} from "react-icons/fi";
import { MdLibraryMusic } from "react-icons/md";
import vibetraxLogo from "../../assets/vibetraxlogo2.png";
import SubscribeModal from "../../modals/subscribe-modal/SubscribeModal";
import { useMovementWallet } from "../../hooks/useMovementWallet";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { walletAddress } = useMovementWallet();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const mainNav = [
    { to: "/", icon: FiHome, label: "Home" },
    { to: "/discover", icon: FiMusic, label: "Browse" },
    { to: "/library", icon: MdLibraryMusic, label: "Your Library" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        {/* Logo */}
        <div className={styles.logo}>
          <img src={vibetraxLogo} alt="VibeTrax" />
          <span className={styles.logoText}>VibeTrax</span>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              end={item.to === "/"}
            >
              <item.icon className={styles.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* User Actions */}
        <nav className={styles.secondaryNav}>
          {walletAddress && (
            <>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <FiUpload className={styles.navIcon} />
                <span>Upload Music</span>
              </NavLink>
              <NavLink
                to={`/profile/${walletAddress}`}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <FiUser className={styles.navIcon} />
                <span>Profile</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={styles.sidebarFooter}>
        <div
          className={styles.premiumPromo}
          onClick={() => setShowSubscribeModal(true)}
        >
          <FiRadio className={styles.promoIcon} />
          <div className={styles.promoText}>
            <h4>Go Premium</h4>
            <p>Ad-free music & more</p>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
