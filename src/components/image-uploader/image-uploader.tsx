import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ImagePlus,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileIcon,
  Camera,
  History,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetUserUploads, useUploadSingleImage } from './use-actions';
import {
  UploadSingleImageDto,
} from '@/core/entities/models/file-manager/upload.dto';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { GetUserUploadsResponse } from '@/core/entities/models/file-manager/upload-res.domain';

// Define file status for tracking uploads
interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  progress?: number; // Added for progress animation
}

interface ImageUploaderProps {
  maxImages?: number;
  onChange?: (value: string[]) => void;
  setDisableForm?: (disabled: boolean) => void;
  value?: string[];
  className?: string;
  containerClassName?: string;
  previewClassName?: string;
  buttonClassName?: string;
  dropzoneClassName?: string;
  acceptedFileTypes?: string[];
  maxSizeInMB?: number;
  showPreview?: boolean;
  name?: string;
  error?: string;
}

export interface ImageUploaderRef {
  reset: () => void;
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  (
    {
      maxImages = 5,
      onChange,
      value = [],
      className,
      containerClassName,
      previewClassName,
      buttonClassName,
      dropzoneClassName,
      acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeInMB = 5,
      showPreview = true,
      name = 'images',
      setDisableForm,
      error: propError,
    },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
      null,
    );
    const [activeTab, setActiveTab] = useState<string>('upload');
    const [selectedPreviousImages, setSelectedPreviousImages] = useState<
      GetUserUploadsResponse[]
    >([]);

    // Track uploaded image URLs internally
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const didInitialize = useRef(false);
    const uploadInProgressRef = useRef(false);
    
    // Track file preview cleanup
    const filePreviewUrls = useRef<Map<string, string>>(new Map());

    // For simulating upload progress animation
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const uploadMutation = useUploadSingleImage();

    const { data: userFilesResponse, isLoading: isLoadingUserFiles } =
      useGetUserUploads();

    // Initialize from value prop ONLY ONCE
    useEffect(() => {
      if (!didInitialize.current && value?.length) {
        setImageUrls(value);
        didInitialize.current = true;
      }
    }, [value]);
    
    // Cleanup preview URLs when component unmounts
    useEffect(() => {
      return () => {
        // Clean up any object URLs to prevent memory leaks
        filePreviewUrls.current.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        // Clear any progress intervals
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }, []);

    // Count of files in each state
    const uploadCounts = {
      pending: uploadingFiles.filter((f) => f.status === 'pending').length,
      uploading: uploadingFiles.filter((f) => f.status === 'uploading').length,
      success: uploadingFiles.filter((f) => f.status === 'success').length,
      error: uploadingFiles.filter((f) => f.status === 'error').length,
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        // Clean up any object URLs first
        filePreviewUrls.current.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        filePreviewUrls.current.clear();
        
        // Clear any progress intervals
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        
        setUploadingFiles([]);
        setImageUrls([]);
        setSelectedPreviousImages([]);
        uploadInProgressRef.current = false;
        onChange?.([]);
      },
    }));

    // Start progress animation for uploading files
    const startProgressAnimation = useCallback((uploadingFileId: string) => {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Start a new interval to simulate progress
      progressIntervalRef.current = setInterval(() => {
        setUploadingFiles(prev => {
          return prev.map(file => {
            if (file.id === uploadingFileId && file.status === 'uploading') {
              // Calculate new progress
              const currentProgress = file.progress || 0;
              // Slow down as we approach 90%
              const increment = currentProgress < 30 ? 5 : 
                               currentProgress < 60 ? 3 : 
                               currentProgress < 80 ? 1 : 0.5;
              
              const newProgress = Math.min(90, currentProgress + increment);
              
              return { ...file, progress: newProgress };
            }
            return file;
          });
        });
      }, 200);
    }, []);

    // Process pending uploads one by one
    useEffect(() => {
      const processUploads = async () => {
        // Safety check - if already processing an upload, don't start another
        if (uploadInProgressRef.current || !isUploading) {
          return;
        }

        // Find the first pending file
        const pendingFile = uploadingFiles.find((f) => f.status === 'pending');

        if (!pendingFile) {
          // If no more pending files and we were uploading, check if we're done
          const allDone = !uploadingFiles.some(
            (f) => f.status === 'pending' || f.status === 'uploading',
          );

          if (allDone) {
            console.log('All uploads completed or failed');
            setIsUploading(false);
            if (setDisableForm) setDisableForm(false);
            
            // Clear any progress interval
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }

          return;
        }

        // Mark as uploading to prevent multiple uploads
        uploadInProgressRef.current = true;

        // Update file status to uploading and initialize progress
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id ? { ...f, status: 'uploading', progress: 0 } : f,
          ),
        );
        
        // Start progress animation
        startProgressAnimation(pendingFile.id);

        try {
          // Prepare the DTO with the file object
          const uploadDto: UploadSingleImageDto = {
            file: pendingFile.file,
          };

          const response = await uploadMutation.mutateAsync(uploadDto);

          if (response.success && response.data && response.data.url) {
            queryClient.invalidateQueries({ queryKey: ['user-uploads'] });
            const url = response.data.url;
            
            // Clear progress interval
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }

            // Update with success status, URL and 100% progress
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === pendingFile.id ? { ...f, status: 'success', url, progress: 100 } : f,
              ),
            );

            // Add to image URLs
            const newUrls = [...imageUrls, url];
            setImageUrls(newUrls);

            // Notify parent
            if (onChange) {
              onChange(newUrls);
            }
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (err) {
          console.error('Upload error:', err);
          
          // Clear progress interval
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }

          // Update with error status
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === pendingFile.id
                ? {
                    ...f,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Upload failed',
                    progress: 0,
                  }
                : f,
            ),
          );
        } finally {
          // Clear the upload in progress flag
          uploadInProgressRef.current = false;
        }
      };

      processUploads();
    }, [
      isUploading,
      uploadingFiles,
      uploadMutation,
      imageUrls,
      onChange,
      setDisableForm,
      startProgressAnimation,
      queryClient,
    ]);

    const handleImageChange = useCallback(
      (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles = newFiles.filter((file) => {
          if (!acceptedFileTypes.includes(file.type)) {
            setError(
              `Invalid file type. Accepted types: ${acceptedFileTypes.map(type => 
                type.replace('image/', '.').replace('application/', '.')
              ).join(', ')}`,
            );
            return false;
          }

          if (file.size > maxSizeInMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeInMB}MB`);
            return false;
          }

          return true;
        });

        if (imageUrls.length + validFiles.length > maxImages) {
          setError(`Maximum ${maxImages} images allowed`);
          return;
        }

        setError(null);

        // Create UploadingFile objects for each file
        const newUploadingFiles: UploadingFile[] = [];

        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const newFile: UploadingFile = {
              id: crypto.randomUUID(),
              file,
              preview: reader.result as string,
              status: 'pending',
              progress: 0,
            };

            // Store the preview URL for cleanup
            filePreviewUrls.current.set(newFile.id, reader.result as string);
            
            newUploadingFiles.push(newFile);

            // Add to uploading files state
            setUploadingFiles((prev) => [...prev, newFile]);

            // If this is the last file to be prepared, start the upload process
            if (newUploadingFiles.length === validFiles.length) {
              setIsUploading(true);
              if (setDisableForm) setDisableForm(true);
            }
          };
          reader.readAsDataURL(file);
        });
      },
      [
        maxImages,
        acceptedFileTypes,
        maxSizeInMB,
        setDisableForm,
        imageUrls.length,
      ],
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
      const newUrls = [...imageUrls];
      newUrls.splice(index, 1);
      setImageUrls(newUrls);
      onChange?.(newUrls);
    };

    const removeUploadingFile = (id: string) => {
      // If the file is currently uploading, we can't remove it
      const fileToRemove = uploadingFiles.find((f) => f.id === id);
      if (fileToRemove?.status === 'uploading') {
        return;
      }

      // Clean up preview URL
      const previewUrl = filePreviewUrls.current.get(id);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
        filePreviewUrls.current.delete(id);
      }

      // Remove from uploadingFiles array
      setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const retryUpload = (id: string) => {
      // Reset file to pending status
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'pending', error: undefined, progress: 0 } : f,
        ),
      );

      // Ensure uploading is active
      if (!isUploading) {
        setIsUploading(true);
        if (setDisableForm) setDisableForm(true);
      }
    };

    const handlePrevImage = () => {
      if (selectedImageIndex === null || imageUrls.length <= 1) return;
      const newIndex =
        selectedImageIndex === 0
          ? imageUrls.length - 1
          : selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
    };

    const handleNextImage = () => {
      if (selectedImageIndex === null || imageUrls.length <= 1) return;
      const newIndex =
        selectedImageIndex === imageUrls.length - 1
          ? 0
          : selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setSelectedImageIndex(null);
    };

    // Handle toggling selection of previous images
    const togglePreviousImageSelection = (file: GetUserUploadsResponse) => {
      // Check if we're at the max images allowed
      if (
        selectedPreviousImages.findIndex((f) => f.id === file.id) === -1 &&
        imageUrls.length + selectedPreviousImages.length >= maxImages
      ) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      setError(null);

      setSelectedPreviousImages((prev) => {
        const isAlreadySelected =
          prev.findIndex((f) => f.id === file.id) !== -1;

        if (isAlreadySelected) {
          // Remove the image if already selected
          return prev.filter((f) => f.id !== file.id);
        } else {
          // Add the image if not already selected
          return [...prev, file];
        }
      });
    };

    // Apply selected previous images
    const applySelectedPreviousImages = () => {
      const newUrls = [
        ...imageUrls,
        ...selectedPreviousImages.map((file) => file.uploadPath),
      ];

      setImageUrls(newUrls);
      onChange?.(newUrls);
      setActiveTab('upload'); // Switch back to the upload tab
    };
    
    // Function to safely render an image or document preview
    const renderPreview = (src: string, alt: string) => {
      // Check if it's an image type URL (based on extension or URL pattern)
      const isImageUrl = 
        /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(src) || 
        /image\/upload/i.test(src) ||
        src.startsWith('data:image/');
        
      if (isImageUrl) {
        return (
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.error('Image loading error:', src);
                // Fallback to a file icon if image loading fails
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const iconEl = document.createElement('div');
                  iconEl.className = "flex h-full w-full items-center justify-center bg-muted/20";
                  iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
                  parent.appendChild(iconEl);
                }
              }}
            />
          </div>
        );
      } else {
        // Render a file icon for non-image files
        return (
          <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-md">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      }
    };

    // Helper function to check if a file is an image based on fileType
    const isImageFile = (fileType: string) => {
      return fileType.startsWith('image/');
    };

    return (
      <div className={cn('space-y-4', className)}>
        <AnimatePresence>
          {(error || propError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || propError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <input type="hidden" name={name} value={imageUrls.join(',')} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span>Upload New</span>
            </TabsTrigger>
            <TabsTrigger value="previous" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>Previous Uploads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <div
              className={cn(
                'flex flex-col items-center justify-center',
                containerClassName,
              )}
            >
              <motion.div
                whileHover={{ boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' }}
                animate={{ 
                  borderColor: isDragging ? 'rgba(59, 130, 246, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                  backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'transparent' 
                }}
                transition={{ duration: 0.2 }}
                onDrop={handleDrop}
                onDragOver={(e: { preventDefault: () => void; }) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  'w-full p-8 border-2 border-dashed rounded-lg transition-all duration-200',
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted',
                  isUploading ? 'opacity-90' : '',
                  dropzoneClassName,
                )}
              >
                <div className="flex flex-col items-center space-y-4">
                  <AnimatePresence mode="wait">
                    {isUploading ? (
                      <motion.div 
                        key="uploading"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-sm text-center mt-2">
                          Uploading {uploadCounts.uploading + uploadCounts.pending}{' '}
                          files
                          {uploadCounts.success > 0 &&
                            `, ${uploadCounts.success} completed`}
                          {uploadCounts.error > 0 && `, ${uploadCounts.error} failed`}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-primary/10 p-4 rounded-full"
                      >
                        <Camera className="h-12 w-12 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Drag & drop files here, or
                    </p>
                    <label htmlFor={`${name}-input`} className="cursor-pointer">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="secondary"
                          className={cn('mt-2 bg-primary text-white hover:bg-primary/90', buttonClassName)}
                          type="button"
                          disabled={isUploading}
                          asChild
                        >
                          <Label htmlFor={`${name}-input`} className="cursor-pointer">
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Select Files
                          </Label>
                        </Button>
                      </motion.div>
                      <Input
                        id={`${name}-input`}
                        type="file"
                        accept={acceptedFileTypes.join(',')}
                        multiple={maxImages > 1}
                        className="hidden"
                        onChange={(e) => handleImageChange(e.target.files)}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum {maxImages} {maxImages === 1 ? 'file' : 'files'}, up to {maxSizeInMB}MB each
                  </p>
                </div>
              </motion.div>

              {/* Uploading Files Preview */}
              <AnimatePresence>
                {uploadingFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full mt-4"
                  >
                    <h3 className="text-sm font-medium mb-2">Upload Queue</h3>
                    <ScrollArea className="h-40 w-full rounded-md border border-muted shadow-sm">
                      <div className="p-4 space-y-3">
                        <AnimatePresence>
                          {uploadingFiles.map((file) => (
                            <motion.div 
                              key={file.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center space-x-3 bg-white p-2 rounded-lg shadow-sm border border-muted"
                            >
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                                {file.preview.startsWith('data:image/') ? (
                                  <Image
                                    src={file.preview}
                                    alt={file.file.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted/20">
                                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                  <p className="text-sm font-medium truncate max-w-[180px]">
                                    {file.file.name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    {file.status === 'error' && (
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => retryUpload(file.id)}
                                        >
                                          Retry
                                        </Button>
                                      </motion.div>
                                    )}
                                    {file.status !== 'uploading' && (
                                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => removeUploadingFile(file.id)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Progress bar */}
                                {file.status === 'uploading' && typeof file.progress === 'number' && (
                                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 mb-1 overflow-hidden">
                                    <motion.div 
                                      className="h-full bg-primary rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${file.progress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                )}
                                
                                <div className="flex items-center text-xs mt-1">
                                  {file.status === 'uploading' && (
                                    <div className="flex items-center text-blue-600">
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />{' '}
                                      Uploading {file.progress ? `(${Math.round(file.progress)}%)` : '...'}
                                    </div>
                                  )}
                                  {file.status === 'success' && (
                                    <p className="text-green-600 flex items-center">
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Upload
                                      complete
                                    </p>
                                  )}
                                  {file.status === 'error' && (
                                    <p className="text-red-600">{file.error}</p>
                                  )}
                                  {file.status === 'pending' && (
                                    <p className="text-muted-foreground">
                                      Waiting to upload...
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="previous" className="mt-2">
            <div className="flex flex-col">
              {isLoadingUserFiles ? (
                <div className="flex justify-center items-center h-40">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </motion.div>
                </div>
              ) : userFilesResponse?.data?.data &&
                userFilesResponse.data.data.length > 0 ? (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      Your Previous Uploads
                    </h3>
                    <AnimatePresence>
                      {selectedPreviousImages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            size="sm"
                            onClick={applySelectedPreviousImages}
                            className="text-xs bg-primary text-white hover:bg-primary/90"
                          >
                            Use Selected ({selectedPreviousImages.length})
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <ScrollArea className="h-64 w-full rounded-md border">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
                      <AnimatePresence>
                        {userFilesResponse.data.data
                          .filter((file) => isImageFile(file.uploadType))
                          .map((file) => {
                            const isSelected = selectedPreviousImages.some(
                              (f) => f.id === file.id,
                            );
                            return (
                              <motion.div
                                key={file.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.03, zIndex: 1 }}
                              >
                                <Card
                                  className={cn(
                                    'cursor-pointer group relative transition-all overflow-hidden',
                                    isSelected 
                                      ? 'ring-2 ring-primary border-primary' 
                                      : 'hover:border-primary/50',
                                  )}
                                  onClick={() => togglePreviousImageSelection(file)}
                                >
                                  <CardContent className="p-2">
                                    <div className="relative aspect-square mb-1">
                                      {renderPreview(file.uploadPath, file.uploadName)}
                                      <AnimatePresence>
                                        {isSelected && (
                                          <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center shadow-md"
                                          >
                                            <CheckCircle2 className="h-4 w-4" />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <div className="text-xs truncate mt-1">
                                      {file.uploadName}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                      <span>{formatBytes(file.uploadSize)}</span>
                                      <span>
                                        {new Date(
                                          file.createdAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-40 text-center"
                >
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No previous uploads found
                  </p>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Uploaded Images Preview */}
        {showPreview && (
          <AnimatePresence>
            {imageUrls.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 mb-2"
              >
                <h3 className="text-sm font-medium">Selected Images</h3>
                <div
                  className={cn(
                    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 w-full',
                    previewClassName,
                  )}
                >
                  <AnimatePresence>
                    {imageUrls.map((preview, index) => (
                      <motion.div
                        key={`${index}-${preview.substring(0, 20)}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                      >
                        <Card className="group relative overflow-hidden border-2 hover:border-primary transition-colors duration-200">
                          <CardContent className="p-0">
                            <div className="relative aspect-square">
                              {renderPreview(preview, `Preview ${index + 1}`)}
                              <div 
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"
                                onClick={() => setSelectedImageIndex(index)}
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                disabled={isUploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Full-size Image Preview Dialog */}
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <DialogOverlay className="bg-black/80" />
          <DialogContent
            className="max-w-[90vw] w-[90vw] h-[90vh] bg-transparent border-none shadow-none"
            onKeyDown={handleKeyDown}
          >
            <DialogHeader>
              <DialogTitle className="sr-only">Image Preview</DialogTitle>
            </DialogHeader>
            {selectedImageIndex !== null && imageUrls.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={imageUrls[selectedImageIndex]}
                    alt={`Full preview ${selectedImageIndex + 1}`}
                    className="object-contain"
                    fill
                    quality={100}
                  />
                </div>

                {imageUrls.length > 1 && (
                  <>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-4"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </motion.div>
                  </>
                )}

                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    onClick={() => setSelectedImageIndex(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

// Utility functions if not available in your project
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;