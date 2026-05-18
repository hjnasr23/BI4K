import { apiClient } from './apiClient';

export const generateImage = async (prompt: string): Promise<string> => {
  const res = await apiClient.post<{ imageUrl: string }>('/ai/generate', { prompt });
  return res.data.imageUrl;
};
