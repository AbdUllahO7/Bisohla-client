export interface UploadResponse {
  images: Array<{
    imageName: string;
    imageUrl: string;
  }>;
}

export interface UploadSingleImageResponse {
  url: string;
}
