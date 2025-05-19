'use client'
import React from "react";
import Text from "@/components/text/text";
import ImageUploader from "@/components/image-uploader/image-uploader";
import { CarPhotosSectionProps } from "./types";

/**
 * Car photos section component for uploading different types of car images
 */
const CarPhotosSection: React.FC<CarPhotosSectionProps> = ({
  labels,
  coverImageRef,
  coverImage,
  onCoverImageChange,
  setIsFormDisabled
}) => {
  return (
    <div className="gap-6 p-4  ">
      {/* Cover Image */}
      <div>
        <Text className="text-lg font-semibold mb-2 text-primary">
          {labels.coverImage} <span className="text-red-500">*</span>
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          {labels.oneImage}
        </Text>
        <ImageUploader
          ref={coverImageRef}
          maxImages={10}
          onChange={onCoverImageChange}
          setDisableForm={setIsFormDisabled}
          value={coverImage}
          dropzoneClassName="min-h-[200px]"
          name="coverImage"
          
        />
      </div>

    


      
    </div>
  );
};

export default React.memo(CarPhotosSection);