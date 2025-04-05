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
  carImagesRef,
  documentsRef,
  additionalImagesRef,
  coverImage,
  carImages,
  documents,
  additionalImages,
  onCoverImageChange,
  onCarImagesChange,
  onDocumentsChange,
  onAdditionalImagesChange,
  isFormDisabled,
  setIsFormDisabled
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Cover Image */}
      <div>
        <Text className="text-lg font-semibold mb-2">
          {labels.coverImage} <span className="text-red-500">*</span>
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          {labels.oneImage}
        </Text>
        <ImageUploader
          ref={coverImageRef}
          maxImages={1}
          onChange={onCoverImageChange}
          setDisableForm={setIsFormDisabled}
          value={coverImage}
          dropzoneClassName="min-h-[200px]"
          name="coverImage"
        />
      </div>

      {/* Car Images */}
      <div>
        <Text className="text-lg font-semibold mb-2">
          {labels.carImages} <span className="text-red-500">*</span>
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          {labels.tenImages}
        </Text>
        <ImageUploader
          ref={carImagesRef}
          maxImages={10}
          onChange={onCarImagesChange}
          setDisableForm={setIsFormDisabled}
          value={carImages}
          dropzoneClassName="min-h-[200px]"
          name="carImages"
        />
      </div>

      {/* Documents */}
      <div>
        <Text className="text-lg font-semibold mb-2">
          {labels.documents}
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          {labels.tenFiles}
        </Text>
        <ImageUploader
          ref={documentsRef}
          maxImages={10}
          onChange={onDocumentsChange}
          setDisableForm={setIsFormDisabled}
          value={documents}
          acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
          dropzoneClassName="min-h-[200px]"
          name="documents"
        />
      </div>

      {/* Additional Images */}
      <div>
        <Text className="text-lg font-semibold mb-2">
          {labels.additionalImages}
        </Text>
        <Text className="text-sm text-gray-500 mb-3">
          {labels.tenImages}
        </Text>
        <ImageUploader
          ref={additionalImagesRef}
          maxImages={10}
          onChange={onAdditionalImagesChange}
          setDisableForm={setIsFormDisabled}
          value={additionalImages}
          dropzoneClassName="min-h-[200px]"
          name="additionalImages"
        />
      </div>
    </div>
  );
};

export default React.memo(CarPhotosSection);