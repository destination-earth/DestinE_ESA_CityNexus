import React, {useState} from "react";
import {FaDownload, FaSpinner} from "react-icons/fa";
import {DATA_URL} from "../../../../constants/default-settings";
import { saveAs } from 'file-saver';

const handleDownload = async (item, userId, setLoading) => {
  const { id, dayType, name } = item;
  setLoading(true);

  try {
    const response = await fetch(`${DATA_URL}/predictions/${id}/xai?day_type=${dayType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${userId}`,
        'Content-Type': 'application/zip'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const fileName = `xaiOutput_${name}_${dayType}.zip`;
      saveAs(blob, fileName);
    }
  } catch (error) {
    console.error('Download error:', error);
  } finally {
    setLoading(false);
  }
};

export const DownloadXaiButton = ({ item, userId }) => {
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={item.processingStatus !== "DONE"}
      className={"empty-table empty-table-button"}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering row click event
        handleDownload(item, userId, setLoading);
      }}
      title={item.processingStatus === "DONE" ? "Download simulation as JSON" : "Simulation is not ready to be downloaded yet"}
    >
      {loading ? <FaSpinner className="spinner"/> : <FaDownload />}
    </button>
  );
};