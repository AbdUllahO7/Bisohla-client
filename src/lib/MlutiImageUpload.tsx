// MultiImageUpload.tsx
"use client";

import { FileIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useLocale } from "next-intl";

type MultiImageUploadProps = {
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  setImageLoadingState: (loading: boolean) => void;
  imageLoadingState: boolean;
  isEditMode: boolean;
  isCustomStyling?: boolean;
  className?: string;
  labelText?: string;
  labelDescription?:string;
  
};

export function MultiImageUpload({
  imageFiles,
  setImageFiles,
  imageLoadingState,
  isEditMode,
  className = "",
  labelText = "Upload Image",
  labelDescription,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    setImageFiles([...imageFiles, ...selectedFiles]);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length) {
      setImageFiles([...imageFiles, ...droppedFiles]);
    }
  }

  function handleRemoveImage(index: number) {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  }
   const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className={`w-full mt-4  max-w-md mx-auto `}>
            <label className="text-lg font-semibold mb-2 block">{labelText}</label>
            <label className="text-md text-gray-50 mb-2 block">{labelDescription}</label>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${className} ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
        >
        <input
          type="file"
          disabled={isEditMode}
          id="image-upload"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple
        />
        {!imageFiles.length ? (
          <label
            htmlFor="image-upload"
            className={`${isEditMode ? "cursor-not-allowed" : "cursor-pointer"} flex flex-col items-center justify-center h-full`}
          >
                <Image 
                            src="/assets/icons/upload.png"
                            alt="upload"
                            width={30}
                            height={30}
                            className="mb-4"
                        />            
              <span>{direction === 'ltr' ? "Drag & drop or click to upload image"  : 'اسحب وأفلِت أو انقر لتحميل الصورة'}</span>
            </label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="space-y-2">
            {imageFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileIcon className="w-8 h-8 text-primary mr-2" />
                  <p className="text-sm font-medium">{file.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}