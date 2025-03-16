export interface UploadImagesDto {
  images: Array<{
    imageName: string;
    image: File;
  }>;
}

export interface UploadSingleImageDto {
  file: File;
}
