import { useState } from "react";
import { uploadCurriculum } from "../../api.js";

function getBackendErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  const message = err?.response?.data?.message;
  const error = err?.response?.data?.error;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg ?? String(item)).join(" ");
  if (typeof message === "string") return message;
  if (typeof error === "string") return error;

  return "Upload failed. Please try again.";
}

export default function UploadCurriculum({ token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const statusType = errorMessage ? "error" : "success";
  const statusMessage = errorMessage || successMessage;

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] ?? null);
    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setSuccessMessage("");
      setErrorMessage("Choose a file before uploading.");
      return;
    }

    setIsUploading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // The backend returns the number of curriculum chunks added by ingestion.
      const response = await uploadCurriculum(selectedFile, token);
      const chunksAdded = response?.chunks_added;

      setSuccessMessage(
        typeof chunksAdded === "number"
          ? `Successfully added ${chunksAdded} chunks.`
          : "Curriculum uploaded successfully."
      );
      setSelectedFile(null);
      setInputKey((currentKey) => currentKey + 1);
    } catch (err) {
      console.error(err);
      // Prefer backend validation or upload errors when the API provides them.
      setErrorMessage(getBackendErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="curriculum-upload" onSubmit={handleUpload}>
      <label htmlFor="curriculum-upload-input">Upload Curriculum</label>
      <input
        key={inputKey}
        id="curriculum-upload-input"
        type="file"
        accept=".md,.txt,.pdf,.docx,.csv"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button className="ghost-button" type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      <p className={`upload-status ${statusType}`} aria-live="polite">
        {statusMessage}
      </p>
    </form>
  );
}
