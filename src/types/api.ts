export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface GenerateImageRequest {
  prompt: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
}
