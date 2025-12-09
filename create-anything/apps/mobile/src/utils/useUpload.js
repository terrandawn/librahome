import * as React from 'react';
import { UploadClient } from '@uploadcare/upload-client'
import { actionLogger } from './actionLogger';
const client = new UploadClient({ publicKey: process.env.EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY });

function useUpload() {
  const [loading, setLoading] = React.useState(false);
  const upload = React.useCallback(async (input) => {
    const startTime = Date.now();
    let fileType = 'unknown';
    let fileName = 'unknown';
    let fileSize = 0;
    
    try {
      setLoading(true);
      
      // Extract file information for logging
      if ("reactNativeAsset" in input && input.reactNativeAsset) {
        const asset = input.reactNativeAsset;
        fileName = asset.name || asset.uri?.split('/').pop() || 'unknown';
        fileSize = asset.size || 0;
        fileType = asset.mimeType || 'unknown';
        actionLogger.logUploadStart(fileType, fileName, fileSize);
      } else if ("url" in input) {
        fileType = 'url';
        fileName = input.url;
        actionLogger.logUploadStart(fileType, fileName, 0);
      } else if ("base64" in input) {
        fileType = 'base64';
        fileSize = input.base64.length;
        fileName = 'base64_data';
        actionLogger.logUploadStart(fileType, fileName, fileSize);
      }
      
      let response;

      if ("reactNativeAsset" in input && input.reactNativeAsset) {
        let asset = input.reactNativeAsset;

        if (asset.file) {
          const formData = new FormData();
          formData.append("file", asset.file);

          response = await fetch("/_create/api/upload/", {
            method: "POST",
            body: formData,
          });
        } else {
          // Fallback to presigned Uploadcare upload
          const presignRes = await fetch("/_create/api/upload/presign/", {
            method: "POST",
          });
          const { secureSignature, secureExpire } = await presignRes.json();

          const result = await client.uploadFile(asset, {
            fileName: asset.name ?? asset.uri.split("/").pop(),
            contentType: asset.mimeType,
            secureSignature,
            secureExpire
          });
          return { url: `${process.env.EXPO_PUBLIC_BASE_CREATE_USER_CONTENT_URL}/${result.uuid}/`, mimeType: result.mimeType || null };
        }
      } else if ("url" in input) {
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: input.url })
        });
      } else if ("base64" in input) {
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ base64: input.base64 })
        });
      } else {
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: input.buffer
        });
      }
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Upload failed: File too large.");
        }
        throw new Error("Upload failed");
      }
      const data = await response.json();
      const duration = Date.now() - startTime;
      actionLogger.logUploadSuccess(fileType, fileName, data.url, duration);
      return { url: data.url, mimeType: data.mimeType || null };
    } catch (uploadError) {
      const duration = Date.now() - startTime;
      actionLogger.logUploadError(fileType, fileName, uploadError);
      
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === "string") {
        return { error: uploadError };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;