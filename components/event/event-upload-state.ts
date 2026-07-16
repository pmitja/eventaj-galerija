export type ClientUploadStatus = "ready" | "uploading" | "done" | "error";

export type UploadItemState = {
  status: ClientUploadStatus;
  hasValidationError: boolean;
};

export function getUploadActionState(items: UploadItemState[]) {
  const readyCount = items.filter((item) => item.status === "ready").length;
  const retryableCount = items.filter(
    (item) => item.status === "error" && !item.hasValidationError,
  ).length;
  const doneCount = items.filter((item) => item.status === "done").length;
  const isUploading = items.some((item) => item.status === "uploading");

  return {
    readyCount,
    retryableCount,
    actionableCount: readyCount + retryableCount,
    doneCount,
    isUploading,
    isComplete: items.length > 0 && doneCount === items.length,
  };
}
