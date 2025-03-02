import { FileIcon, Sparkles, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
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
    labelDescription?:string;
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

    function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) setImageFile(selectedFile);
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) setImageFile(droppedFile);
    }

    function handleRemoveImage() {
        setImageFile(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    useEffect(() => {
        if (imageFile !== null) uploadImageToCloudinary();
    }, [imageFile]);

    async function uploadImageToCloudinary() {
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

    return (
        <div className={`w-full mt-4   mx-auto `}>
            <label className="text-lg font-semibold mb-2  border-b border-primary-light w-fit pb-2 flex items-center gap-2">
            <Sparkles className="text-primary-light"/>
                {labelText}</label>
            <label className="text-md text-gray-50 mb-2 block">{labelDescription}</label>

            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`  ${className}${isEditMode ? "opacity-50 cursor-not-allowed " : ""}`}
            >
                <input
                    type="file"
                    disabled={isEditMode}
                    id="image-upload"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleImageFileChange}
                    
                />
                {!imageFile ? (
                    <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center cursor-pointer h-full ${
                            isEditMode ? "cursor-not-allowed opacity-50" : ""
                        }`}
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FileIcon className="w-8 h-8 text-primary mr-2" />
                        </div>
                        <p className="text-sm font-medium">{imageFile?.name}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={handleRemoveImage}
                        >
                            <XIcon className="w-4 h-4" />
                            <span className="sr-only">Remove File</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUpload;
