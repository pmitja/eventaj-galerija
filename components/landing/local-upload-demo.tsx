"use client";

import { useEffect, useId, useState } from "react";
import type { WeddingConversionCopy } from "./wedding-conversion-copy";

export function LocalUploadDemo({ copy }: { copy: WeddingConversionCopy }) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  return (
    <div className="local-upload-demo">
      <div className="local-upload-demo__phone">
        <div className="local-upload-demo__topbar" aria-hidden="true"><span /><span /><span /></div>
        <div className="local-upload-demo__copy">
          <span className="local-upload-demo__mark">GM</span>
          <h3>{copy.uploadTitle}</h3>
          <p>{copy.uploadText}</p>
        </div>
        {previewUrl ? (
          <div className="local-upload-demo__preview">
            {/* A blob URL is intentionally local-only and never sent to Next/Image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" />
            <div>
              <strong>{copy.uploadReady}</strong>
              <small>{file?.name}</small>
            </div>
          </div>
        ) : (
          <div className="local-upload-demo__empty" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
          </div>
        )}
        <label className="button local-upload-demo__button" htmlFor={inputId}>
          {previewUrl ? copy.uploadReset : copy.uploadButton}
        </label>
        <input
          id={inputId}
          className="local-upload-demo__input"
          type="file"
          accept="image/*"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />
        <small className="local-upload-demo__privacy">{copy.uploadLocalOnly}</small>
      </div>
    </div>
  );
}
