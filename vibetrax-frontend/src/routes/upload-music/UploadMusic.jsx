import { useState } from "react";
import Form from "../../components/form/Form";
import Preview from "../../components/preview/Preview";
import styles from "./UploadMusic.module.css";
import { useCurrentAccount } from "@iota/dapp-kit";
import { UnconnectedState } from "../../components/state/UnconnectedState";
import {
  FiUploadCloud,
  FiMusic,
  FiDollarSign,
  FiUsers,
  FiInfo,
} from "react-icons/fi";

const UploadMusic = () => {
  const [previewClicked, setPreviewClicked] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [PreviewGenre, setPreviewGenre] = useState(null);
  const [highQuality, setHighQuality] = useState(null);
  const [lowQuality, setLowQuality] = useState(null);
  const currentAccount = useCurrentAccount();

  const showPreview = (e) => {
    e.preventDefault();
    setPreviewClicked(!previewClicked);
  };

  if (!currentAccount) {
    return <UnconnectedState />;
  }

  return (
    <div className={styles.uploadPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FiUploadCloud />
          </div>
          <h1 className={styles.pageTitle}>Upload Your Music</h1>
          <p className={styles.pageSubtitle}>
            Share your music with the world and set up fair revenue distribution
            for all your contributors
          </p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiMusic />
            </div>
            <h3>High Quality</h3>
            <p>
              Upload your tracks in premium quality for the best listening
              experience
            </p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiDollarSign />
            </div>
            <h3>Set Your Price</h3>
            <p>Choose to sell your music or make it free for everyone</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FiUsers />
            </div>
            <h3>Revenue Split</h3>
            <p>Add contributors and distribute royalties fairly</p>
          </div>
        </div>

        <div className={styles.gasFeeNotice}>
          <div className={styles.noticeIcon}>
            <FiInfo />
          </div>
          <div className={styles.noticeContent}>
            <h4>Gas Fee Required</h4>
            <p>
              You need at least <strong>0.1 IOTA</strong> for transaction fees.{" "}
              <a href="#" target="_blank" rel="noopener noreferrer">
                Get Gas Fee
              </a>
            </p>
          </div>
        </div>

        <div className={styles.uploadContainer}>
          <Form
            showPreview={showPreview}
            setPreviewTitle={setPreviewTitle}
            setPreviewImage={setPreviewImage}
            setPreviewGenre={setPreviewGenre}
            setHighQuality={setHighQuality}
            setLowQuality={setLowQuality}
          />
        </div>
      </div>

      {previewClicked && (
        <Preview
          previewTitle={previewTitle}
          PreviewImage={previewImage}
          PreviewGenre={PreviewGenre}
          highQuality={highQuality}
          lowQuality={lowQuality}
        />
      )}
    </div>
  );
};

export default UploadMusic;
