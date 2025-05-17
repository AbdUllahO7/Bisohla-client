export interface UploadResponse {
  images: Array<{
    imageName: string;
    imageUrl: string;
  }>;
}

export interface UploadSingleImageResponse {
  url: string;
}

export interface GetUserUploadsResponse {
  id: number;
  userId: number;
  uploadPath: string;
  uploadName: string;
  uploadType: string;
  uploadSize: number;
  updatedAt: string;
  createdAt: string;
}
