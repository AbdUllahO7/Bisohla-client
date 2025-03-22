// MultiImageUpload.tsx
"use client";

import { FileIcon, Sparkles, XIcon, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useLocale } from "next-intl";
import axios from "axios";

type FileWithStatus = {
  file: File;
  url?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
};

type MultiImageUploadProps = {
  imageFiles: FileWithStatus[];
  setImageFiles: (files: FileWithStatus[]) => void;
  setImageLoadingState: (loading: boolean) => void;
  imageLoadingState: boolean;
  isEditMode: boolean;
  isCustomStyling?: boolean;
  className?: string;
  labelText?: string;
  labelDescription?: string;
  maxFiles?: number;
  urlToUpload: string;  // API endpoint for Cloudinary upload
  onUrlsChange?: (urls: string[]) => void;  // Optional callback for when URLs change
};

export function MultiImageUpload({
  imageFiles,
  setImageFiles,
  setImageLoadingState,
  imageLoadingState,
  isEditMode,
  className = "",
  labelText = "Upload Image",
  labelDescription,
  maxFiles = 10,
  urlToUpload,
  onUrlsChange,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // When image files change, extract and pass the URLs to the parent component
  useEffect(() => {
    if (onUrlsChange) {
      // Only trigger the callback if we have success status files with URLs
      const successFiles = imageFiles.filter(item => item.status === 'success' && item.url);
      if (successFiles.length > 0) {
        const urls = successFiles.map(item => item.url as string);
        onUrlsChange(urls);
      }
    }
  // We're intentionally only running this when imageFiles changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles]);

  async function uploadToCloudinary(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("my_file", file);
      
      const response = await axios.post(urlToUpload, formData);
      
      if (response.data?.success) {
        return response.data.result.url;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  async function uploadFiles(filesToUpload: FileWithStatus[]) {
    setIsUploading(true);
    setImageLoadingState(true);
    
    // Create a fresh copy to avoid stale closures
    const currentFiles = [...imageFiles];
    
    // Mark all new files as uploading
    filesToUpload.forEach(fileItem => {
      const index = currentFiles.findIndex(item => 
        item.file.name === fileItem.file.name && 
        item.file.size === fileItem.file.size
      );
      if (index !== -1) {
        currentFiles[index] = { ...currentFiles[index], status: 'uploading', progress: 0 };
      }
    });
    setImageFiles([...currentFiles]);

    // Upload each file and update status
    for (const fileItem of filesToUpload) {
      try {
        const url = await uploadToCloudinary(fileItem.file);
        
        // Get the latest state again for each update
        setImageFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          const index = updatedFiles.findIndex(item => 
            item.file.name === fileItem.file.name && 
            item.file.size === fileItem.file.size
          );
          
          if (index !== -1) {
            updatedFiles[index] = { 
              ...updatedFiles[index], 
              status: 'success', 
              url, 
              progress: 100 
            };
          }
          return updatedFiles;
        });
      } catch (error) {
        // Get the latest state again for each update
        setImageFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          const index = updatedFiles.findIndex(item => 
            item.file.name === fileItem.file.name && 
            item.file.size === fileItem.file.size
          );
          
          if (index !== -1) {
            updatedFiles[index] = { 
              ...updatedFiles[index], 
              status: 'error', 
              progress: 0 
            };
          }
          return updatedFiles;
        });
      }
    }
    
    setIsUploading(false);
    setImageLoadingState(false);
  }

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Check if adding these files would exceed the limit
    if (imageFiles.length + selectedFiles.length > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Add files with pending status
    const newFileItems = selectedFiles.map(file => ({
      file,
      status: 'pending' as const,
    }));
    
    // Use functional update to ensure we're working with the latest state
    setImageFiles(prevFiles => {
      const updatedFiles = [...prevFiles, ...newFileItems];
      
      // We'll upload the files in the next tick to avoid state conflicts
      setTimeout(() => {
        uploadFiles(newFileItems);
      }, 0);
      
      return updatedFiles;
    });
    
    // Reset the input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    
    // Check if adding these files would exceed the limit
    if (imageFiles.length + droppedFiles.length > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} files`);
      return;
    }
    
    if (droppedFiles.length) {
      // Add files with pending status
      const newFileItems = droppedFiles.map(file => ({
        file,
        status: 'pending' as const,
      }));
      
      // Use functional update to ensure we're working with the latest state
      setImageFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newFileItems];
        
        // We'll upload the files in the next tick to avoid state conflicts
        setTimeout(() => {
          uploadFiles(newFileItems);
        }, 0);
        
        return updatedFiles;
      });
    }
  }

  function handleRemoveImage(index: number) {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  }
  
  function handleBrowseClick() {
    if (!isEditMode && !isUploading && inputRef.current) {
      inputRef.current.click();
    }
  }
  
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const translations = {
    dragAndDrop: direction === 'ltr' ? "Drag & drop or click to upload" : 'اسحب وأفلِت أو انقر للتحميل',
    browse: direction === 'ltr' ? "Browse Files" : 'تصفح الملفات',
    filesSelected: direction === 'ltr' ? "files selected" : 'الملفات المحددة',
    uploading: direction === 'ltr' ? "Uploading..." : 'جارٍ التحميل...',
    retryUpload: direction === 'ltr' ? "Retry" : 'إعادة المحاولة',
    uploadFailed: direction === 'ltr' ? "Upload failed" : 'فشل التحميل',
  };

  function getStatusIcon(status: string) {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Skeleton className="w-4 h-4 rounded-full" />;
      default:
        return null;
    }
  }

  return (
    <div className="w-full mt-4 mx-auto">
      <div className="flex items-center justify-between mb-2">
        <label className="text-lg font-semibold border-b border-primary-light w-fit pb-2 flex items-center gap-2">
          <Sparkles className="text-primary-light" />
          {labelText}
        </label>
        {imageFiles.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {imageFiles.length}/{maxFiles} {translations.filesSelected}
          </span>
        )}
      </div>
      
      {labelDescription && (
        <label className="text-sm text-gray-500 mb-3 block">{labelDescription}</label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${className} ${isDragging ? "border-primary bg-primary/5" : ""} 
          ${isEditMode || isUploading ? "opacity-50 cursor-not-allowed" : "transition-all duration-200"}`}
      >
        <input
          type="file"
          disabled={isEditMode || isUploading}
          id="image-upload"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple
          accept="image/*,.pdf,.doc,.docx"
        />
        
        {!imageFiles.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <UploadCloud className="w-12 h-12 text-primary mb-4" />
            <p className="mb-4">{translations.dragAndDrop}</p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBrowseClick}
              disabled={isEditMode || isUploading}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              {translations.browse}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
            {imageFiles.map((fileItem, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                <div className="flex items-center overflow-hidden flex-grow">
                  {fileItem.file.type.startsWith('image/') ? (
                    <div className="w-10 h-10 relative rounded overflow-hidden mr-3 flex-shrink-0">
                      <Image 
                        src={URL.createObjectURL(fileItem.file)} 
                        alt={fileItem.file.name}
                        layout="fill" 
                        objectFit="cover"
                      />
                    </div>
                  ) : (
                    <FileIcon className="w-8 h-8 text-primary mr-3 flex-shrink-0" />
                  )}
                  <div className="overflow-hidden flex-grow">
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate mr-2">{fileItem.file.name}</p>
                      {getStatusIcon(fileItem.status)}
                    </div>
                    {fileItem.status === 'uploading' && (
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${fileItem.progress || 0}%` }}
                        />
                      </div>
                    )}
                    {fileItem.status === 'error' && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-red-500 mr-2">{translations.uploadFailed}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs text-primary hover:text-primary-dark"
                          onClick={() => uploadFiles([fileItem])}
                        >
                          {translations.retryUpload}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-500 flex-shrink-0"
                  onClick={() => handleRemoveImage(index)}
                  disabled={fileItem.status === 'uploading'}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </div>
            ))}
            
            {/* Add more button at the bottom */}
            {imageFiles.length < maxFiles && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBrowseClick}
                disabled={isEditMode || isUploading}
                className="w-full mt-2 border-dashed border-primary text-primary hover:bg-primary/10"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                {translations.browse}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}