"use client";

import { useState } from "react";

interface CoverImageUploadProps {
  onFileSelect: (file: File | null) => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    } else {
        setSelectedFile(null);
        onFileSelect(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    } else {
        setSelectedFile(null);
        onFileSelect(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border p-4 rounded-md cursor-pointer"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="cover-image-upload"
      />
      <label htmlFor="cover-image-upload" className="cursor-pointer">
        <p className="text-muted-foreground">
          Drag and drop an image here, or click to select an image.
        </p>
        {selectedFile && (
          <p>Selected file: {selectedFile.name}</p>
        )}
      </label>
    </div>
  );
};

export default CoverImageUpload;
