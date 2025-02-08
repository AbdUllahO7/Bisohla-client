import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ImagePlus, X, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { Label } from './ui/label';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange?: (files: File[]) => void;
  className?: string;
  containerClassName?: string;
  previewClassName?: string;
  buttonClassName?: string;
  dropzoneClassName?: string;
  acceptedFileTypes?: string[];
  maxSizeInMB?: number;
  showPreview?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: any[];
  id?: string;
}

const ImageUploader = ({
  maxImages = 5,
  onImagesChange,
  className,
  containerClassName,
  previewClassName,
  buttonClassName,
  dropzoneClassName,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeInMB = 5,
  showPreview = true,
  defaultValues = [],
  id = 'image-upload',
}: ImageUploaderProps) => {
  const [images, setImages] = useState<File[]>(defaultValues);
  const [previews, setPreviews] = useState<string[]>(defaultValues);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files);
      const validFiles = newFiles.filter((file) => {
        // Check file type
        if (!acceptedFileTypes.includes(file.type)) {
          setError(
            `Invalid file type. Accepted types: ${acceptedFileTypes.join(
              ', ',
            )}`,
          );
          return false;
        }

        // Check file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
          setError(`File size must be less than ${maxSizeInMB}MB`);
          return false;
        }

        return true;
      });

      if (images.length + validFiles.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      setError(null);
      const newImages = [...images, ...validFiles];
      setImages(newImages);

      // Generate previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      onImagesChange?.(newImages);
    },
    [images, maxImages, onImagesChange, acceptedFileTypes, maxSizeInMB],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageChange(e.dataTransfer.files);
    },
    [handleImageChange],
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
    onImagesChange?.(newImages);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          'flex flex-col items-center justify-center',
          containerClassName,
        )}
      >
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            'w-full p-8 border-2 border-dashed rounded-lg transition-colors',
            isDragging ? 'border-primary bg-primary/10' : 'border-muted',
            dropzoneClassName,
          )}
        >
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Drag & drop images here, or
              </p>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button
                  variant="secondary"
                  className={cn('mt-2', buttonClassName)}
                  type="button"
                  asChild
                >
                  <Label htmlFor={id} className="cursor-pointer">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Select Files
                  </Label>
                </Button>
                <Input
                  id={id}
                  type="file"
                  accept={acceptedFileTypes.join(',')}
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files)}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum {maxImages} images, up to {maxSizeInMB}MB each
            </p>
          </div>
        </div>

        {showPreview && previews.length > 0 && (
          <div
            className={cn(
              'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 w-full',
              previewClassName,
            )}
          >
            {previews.map((preview, index) => (
              <Card key={index} className="group relative">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      fill
                      quality={100}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
