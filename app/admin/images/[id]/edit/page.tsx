"use client";

import { useState, FormEvent, useCallback } from "react";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea, Checkbox } from "@heroui/react";
import { Form } from "@heroui/form";
import { useDropzone } from "react-dropzone";

interface PhotoData {
  id: number;
  title: string;
  files: File[];
  description: string;
  isCover: boolean;
  previews: string[];
}

interface RepositoryFormData {
  title: string;
  photos: PhotoData[];
}

export default function EditNewsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [action, setAction] = useState<string | null>(null);
  const [photoCounter, setPhotoCounter] = useState(1);
  const [formData, setFormData] = useState<RepositoryFormData>({
    title: "",
    photos: [],
  });

  const handleBack = (): void => {
    router.push("/images");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Prepare final data for backend submission
    const submitData = {
      ...formData,
      // Convert files to base64 or file objects as needed for your backend
      // For file uploads, you might want to use FormData instead
    };

    console.log("✅ Form submitted:", submitData);
    setAction(`submit ${JSON.stringify(submitData)}`);

    // Example: Send to backend
    // sendToBackend(submitData);
  };

  // Example backend submission function
  const sendToBackend = async (data: RepositoryFormData) => {
    try {
      // If you need to upload files, use FormData
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append(
        "photos",
        JSON.stringify(
          data.photos.map((photo) => ({
            id: photo.id,
            title: photo.title,
            description: photo.description,
            isCover: photo.isCover,
            // Don't include files in JSON, upload them separately
          })),
        ),
      );

      // Append files
      data.photos.forEach((photo, photoIndex) => {
        photo.files.forEach((file, fileIndex) => {
          formData.append(`photo_${photoIndex}_file_${fileIndex}`, file);
        });
      });

      // const response = await fetch('/api/repository', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (response.ok) {
      //   console.log('Successfully saved to backend');
      // }
    } catch (error) {
      console.error("Error submitting to backend:", error);
    }
  };

  const handleCancel = (): void => {
    router.push("/images");
  };

  const handleTitleChange = (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      title: value,
    }));
  };

  const handleAddPhoto = (): void => {
    const newPhoto: PhotoData = {
      id: Date.now(),
      title: `Photo ${photoCounter}`,
      files: [],
      description: "",
      isCover: false,
      previews: [],
    };

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
    setPhotoCounter((prev) => prev + 1);
  };

  const handleDeletePhoto = (id: number): void => {
    const photo = formData.photos.find((p) => p.id === id);

    if (photo?.previews) {
      photo.previews.forEach((preview) => URL.revokeObjectURL(preview));
    }
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== id),
    }));
  };

  const handlePhotoTitleChange = (id: number, title: string): void => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === id ? { ...photo, title } : photo,
      ),
    }));
  };

  const handlePhotoDescriptionChange = (
    id: number,
    description: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === id ? { ...photo, description } : photo,
      ),
    }));
  };

  const handleCoverPhotoChange = (id: number, isCover: boolean): void => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === id ? { ...photo, isCover } : { ...photo, isCover: false },
      ),
    }));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], photoId: number) => {
      if (acceptedFiles.length > 0) {
        const newPreviews = acceptedFiles.map((file) =>
          URL.createObjectURL(file),
        );

        setFormData((prev) => ({
          ...prev,
          photos: prev.photos.map((photo) => {
            if (photo.id === photoId) {
              // Clean up old previews
              photo.previews.forEach((preview) => URL.revokeObjectURL(preview));

              return {
                ...photo,
                files: [...photo.files, ...acceptedFiles],
                previews: [...photo.previews, ...newPreviews],
              };
            }

            return photo;
          }),
        }));
      }
    },
    [formData.photos],
  );

  const removeImagePreview = (photoId: number, previewIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) => {
        if (photo.id === photoId) {
          // Clean up the specific preview URL
          URL.revokeObjectURL(photo.previews[previewIndex]);

          return {
            ...photo,
            files: photo.files.filter((_, index) => index !== previewIndex),
            previews: photo.previews.filter(
              (_, index) => index !== previewIndex,
            ),
          };
        }

        return photo;
      }),
    }));
  };

  const clearAllImages = (photoId: number) => {
    const photo = formData.photos.find((p) => p.id === photoId);

    if (photo?.previews) {
      photo.previews.forEach((preview) => URL.revokeObjectURL(preview));
    }
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === photoId ? { ...photo, files: [], previews: [] } : photo,
      ),
    }));
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center justify-center p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Go back"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Repository
          </h1>
          <p className="mt-1 text-gray-500">Manage your photo collection</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Repository Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Repository Title */}
              <Input
                isRequired
                errorMessage="Please enter a title"
                label="Repository Title"
                labelPlacement="outside"
                name="title"
                placeholder="e.g., Community Events 2025"
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />

              {/* Photos Section */}
              <div className="w-full">
                <Card className="p-4">
                  <CardHeader className="flex w-full justify-between items-center px-0 py-2">
                    <p className="font-semibold text-lg">Photos</p>

                    <button
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition border shadow-orange-500 px-3 py-1 rounded-full"
                      type="button"
                      onClick={handleAddPhoto}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add Photo</span>
                    </button>
                  </CardHeader>

                  <CardBody className="overflow-visible py-2">
                    {/* Dynamic Photos */}
                    {formData.photos.map((photo, index) => (
                      <Card key={photo.id} className="mb-4 border">
                        <CardHeader className="flex w-full justify-between items-center px-4 py-3">
                          <Input
                            className="font-semibold text-md border-none p-0"
                            classNames={{
                              input: "font-semibold text-md",
                            }}
                            value={photo.title}
                            onChange={(e) =>
                              handlePhotoTitleChange(photo.id, e.target.value)
                            }
                          />
                          <button
                            className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600 transition cursor-pointer"
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </CardHeader>
                        <CardBody className="px-4 pb-4">
                          <div className="flex flex-col gap-4">
                            {/* Image Preview Section - Horizontal Scroll */}
                            {photo.previews.length > 0 && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium">
                                    Selected Images ({photo.previews.length})
                                  </label>
                                  <button
                                    className="text-xs text-red-500 hover:text-red-700"
                                    type="button"
                                    onClick={() => clearAllImages(photo.id)}
                                  >
                                    Clear All
                                  </button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {photo.previews.map(
                                    (preview, previewIndex) => (
                                      <div
                                        key={previewIndex}
                                        className="relative flex-shrink-0"
                                      >
                                        <img
                                          alt={`Preview ${previewIndex + 1}`}
                                          className="w-20 h-20 object-cover rounded-lg border"
                                          src={preview}
                                        />
                                        <button
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition text-xs"
                                          type="button"
                                          onClick={() =>
                                            removeImagePreview(
                                              photo.id,
                                              previewIndex,
                                            )
                                          }
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                        <div className="text-xs text-center mt-1 truncate w-20">
                                          {photo.files[previewIndex]?.name}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Drag & Drop File Upload */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Upload Images
                              </label>
                              <PhotoDropzone
                                photo={photo}
                                onDrop={(files) => onDrop(files, photo.id)}
                              />
                            </div>

                            <Textarea
                              className="w-full"
                              minRows={2}
                              placeholder="Photo description (optional)"
                              value={photo.description}
                              variant="flat"
                              onChange={(e) =>
                                handlePhotoDescriptionChange(
                                  photo.id,
                                  e.target.value,
                                )
                              }
                            />
                            <Checkbox
                              isSelected={photo.isCover}
                              onChange={(e) =>
                                handleCoverPhotoChange(
                                  photo.id,
                                  e.target.checked,
                                )
                              }
                            >
                              Set as cover photo
                            </Checkbox>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </CardBody>

                  <CardFooter className="px-4 pb-2">
                    {/* Footer content here (optional) */}
                  </CardFooter>
                </Card>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" type="submit">
                  Save Repository
                </Button>
                <Button type="button" variant="flat" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </CardBody>

        <CardFooter />
      </Card>
    </div>
  );
}

// Separate component for the dropzone
interface PhotoDropzoneProps {
  photo: PhotoData;
  onDrop: (files: File[]) => void;
}

function PhotoDropzone({ photo, onDrop }: PhotoDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }
        ${photo.previews.length > 0 ? "bg-green-50 border-green-300" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload
          className={`w-8 h-8 ${photo.previews.length > 0 ? "text-green-500" : "text-gray-400"}`}
        />
        {photo.previews.length > 0 ? (
          <div>
            <p className="text-green-600 font-medium">
              {photo.previews.length} image(s) selected
            </p>
            <p className="text-sm text-green-500">
              Click or drag to add more images
            </p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the images here...</p>
        ) : (
          <div>
            <p className="font-medium">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, GIF, WEBP (Max 5MB each)
            </p>
            <p className="text-sm text-blue-500">
              You can select multiple images
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
