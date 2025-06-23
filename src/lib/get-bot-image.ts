'use server';

/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import axios from 'axios';

interface TelegramFileResponse {
  ok: boolean;
  result: {
    file_id: string;
    file_unique_id: string;
    file_size: number;
    file_path: string;
  };
}

interface BotAvatar {
  token: string;
  image: string | null;
}

export async function getBotAvatarsFromTokens(tokens: string[]): Promise<BotAvatar[]> {
  const results: BotAvatar[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const token of tokens) {
    try {
      // 1. Get bot info
      const getMeRes = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
      const botId = getMeRes.data.result.id;

      // 2. Get profile photos
      const photosRes = await axios.get(`https://api.telegram.org/bot${token}/getUserProfilePhotos`, {
        params: { user_id: botId, limit: 1 }
      });

      const photoArray = photosRes.data.result.photos?.[0];

      if (!photoArray || photoArray.length === 0) {
        results.push({ token, image: null });
        continue;
      }

      // 3. Get the largest photo
      const fileId = photoArray[photoArray.length - 1].file_id;

      // 4. Get file path
      const fileRes = await axios.get<TelegramFileResponse>(`https://api.telegram.org/bot${token}/getFile`, { params: { file_id: fileId } });

      const filePath = fileRes.data.result.file_path;
      const imageUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

      results.push({ token, image: imageUrl });
    } catch (error) {
      console.error(`Error fetching image for token ${token}:`, error);
      results.push({ token, image: null });
    }
  }

  return results;
}
