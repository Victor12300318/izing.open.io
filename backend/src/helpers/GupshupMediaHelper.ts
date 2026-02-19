import axios from "axios";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";

interface DownloadedMedia {
  filename: string;
  originalname: string;
  mimeType: string;
  path: string;
  buffer: Buffer;
}

/**
 * Faz download de mídia do URL fornecido pelo Gupshup
 * @param mediaUrl - URL da mídia
 * @returns Dados da mídia baixada
 */
export const downloadMedia = async (
  mediaUrl: string
): Promise<DownloadedMedia> => {
  try {
    logger.info(`[GupshupMediaHelper] Downloading media from: ${mediaUrl}`);

    const response = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const contentType = response.headers["content-type"];
    const buffer = Buffer.from(response.data, "binary");

    let extension = ".bin";
    if (contentType) {
      const mimeToExt: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "video/ogg": ".ogg",
        "audio/ogg": ".ogg",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "text/plain": ".txt"
      };
      extension = mimeToExt[contentType] || ".bin";
    }

    const filename = `gupshup_${Date.now()}${extension}`;
    const originalname = filename;

    logger.info(`[GupshupMediaHelper] Downloaded: ${filename} (${buffer.length} bytes)`);

    return {
      filename,
      originalname,
      mimeType: contentType || "application/octet-stream",
      path: path.join("public", filename),
      buffer
    };
  } catch (error: any) {
    logger.error(`[GupshupMediaHelper] Download error: ${error.message}`);
    throw error;
  }
};

/**
 * Salva a mídia no disco
 * @param media - Dados da mídia
 * @returns Caminho do arquivo salvo
 */
export const saveMedia = async (media: DownloadedMedia): Promise<string> => {
  try {
    const publicPath = path.resolve(__dirname, "..", "..", "public");
    
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const filePath = path.join(publicPath, media.filename);
    fs.writeFileSync(filePath, media.buffer);

    logger.info(`[GupshupMediaHelper] Media saved to: ${filePath}`);
    return filePath;
  } catch (error: any) {
    logger.error(`[GupshupMediaHelper] Save error: ${error.message}`);
    throw error;
  }
};
