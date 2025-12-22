import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMusic,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import styles from "./Footer.module.css";

const Footer = ({
  companyName = "VibeTrax",
  year = new Date().getFullYear(),
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const links = [
    { name: "Home", url: "/" },
    { name: "Discover", url: "/discover" },
    { name: "Upload", url: "/upload" },
    { name: "About", url: "/about" },
    { name: "Help", url: "/help" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: FiFacebook, url: "#" },
    { name: "Twitter", icon: FiTwitter, url: "#" },
    { name: "Instagram", icon: FiInstagram, url: "#" },
    { name: "YouTube", icon: FiYoutube, url: "#" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <Link to="/" className={styles.footerLogo}>
              <FiMusic className={styles.logoIcon} />
              {companyName}
            </Link>
            <p className={styles.tagline}>
              Your soundtrack to life. Stream unlimited music.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={styles.socialLink}
                  aria-label={social.name}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footerCenter}>
            <h4>Quick Links</h4>
            <nav className={styles.footerNav}>
              <ul className={styles.footerLinks}>
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.url}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                      className={hoverIndex === index ? styles.linkActive : ""}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className={styles.footerRight}>
            <h4>For Artists</h4>
            <ul className={styles.artistLinks}>
              <li>
                <Link to="/upload">Upload Music</Link>
              </li>
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
              <li>
                <Link to="/support">Artist Support</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {year} {companyName}. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
