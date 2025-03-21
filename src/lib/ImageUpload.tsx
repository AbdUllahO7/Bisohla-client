import { FileIcon, Sparkles, XIcon, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useLocale } from "next-intl";
import Image from "next/image";

interface ImageUploadProps {
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    setUploadedImageUrl: (url: string) => void;
    setImageLoadingState: (state: boolean) => void;
    imageLoadingState: boolean;
    isEditMode: boolean;
    isCustomStyling?: boolean;
    urlToUpload: string;
    className?: string;
    labelText?: string;
    labelDescription?: string;
}

function ImageUpload({
    imageFile = null,
    setImageFile,
    setUploadedImageUrl,
    setImageLoadingState,
    imageLoadingState,
    isEditMode,
    urlToUpload,
    className = "",
    labelText = "Upload Image",
    labelDescription,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setImageFile(selectedFile);
            createPreviewUrl(selectedFile);
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
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
            setImageFile(droppedFile);
            createPreviewUrl(droppedFile);
        }
    }

    function handleRemoveImage() {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    function createPreviewUrl(file: File) {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }

    function handleBrowseClick() {
        if (!isEditMode && inputRef.current) {
            inputRef.current.click();
        }
    }

    useEffect(() => {
        if (imageFile !== null) uploadImageToCloudinary();
        
        // Cleanup function to revoke object URL when component unmounts
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [imageFile]);

    async function uploadImageToCloudinary() {
        if (!urlToUpload) return; // Skip if no URL is provided
        
        try {
            setImageLoadingState(true);
            const data = new FormData();
            data.append("my_file", imageFile as Blob);
            const response = await axios.post(urlToUpload, data);

            if (response.data?.success) {
                setUploadedImageUrl(response.data.result.url);
            } else {
                throw new Error("Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setImageLoadingState(false);
        }
    }

    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    const translations = {
        dragAndDrop: direction === 'ltr' ? "Drag & drop or click to upload image" : 'اسحب وأفلِت أو انقر لتحميل الصورة',
        browse: direction === 'ltr' ? "Browse Files" : 'تصفح الملفات',
    };

    return (
        <div className="w-full mt-4 mx-auto">
            <div className="flex items-center justify-between mb-2">
                <label className="text-lg font-semibold border-b border-primary-light w-fit pb-2 flex items-center gap-2">
                    <Sparkles className="text-primary-light" />
                    {labelText}
                </label>
            </div>
            
            {labelDescription && (
                <label className="text-sm text-gray-500 mb-3 block">{labelDescription}</label>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${className} ${isDragging ? "border-primary bg-primary/5" : ""} 
                    ${isEditMode ? "opacity-50 cursor-not-allowed" : "transition-all duration-200"}`}
            >
                <input
                    type="file"
                    disabled={isEditMode}
                    id="image-upload"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                />
                
                {!imageFile ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <UploadCloud className="w-12 h-12 text-primary mb-4" />
                        <p className="mb-4">{translations.dragAndDrop}</p>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleBrowseClick}
                            disabled={isEditMode}
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                            {translations.browse}
                        </Button>
                    </div>
                ) : imageLoadingState ? (
                    <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-16 w-full max-w-md bg-gray-100" />
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-grow overflow-hidden">
                                {previewUrl ? (
                                    <div className="w-16 h-16 relative rounded overflow-hidden mr-3 flex-shrink-0 border border-gray-200">
                                        <Image 
                                            src={previewUrl} 
                                            alt={imageFile.name}
                                            layout="fill" 
                                            objectFit="cover"
                                        />
                                    </div>
                                ) : (
                                    <FileIcon className="w-12 h-12 text-primary mr-3 flex-shrink-0" />
                                )}
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate line-clamp-1 max-w-[100px]">{imageFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(imageFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-red-500 ml-2"
                                onClick={handleRemoveImage}
                            >
                                <XIcon className="w-5 h-5" />
                                <span className="sr-only">Remove File</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUpload;