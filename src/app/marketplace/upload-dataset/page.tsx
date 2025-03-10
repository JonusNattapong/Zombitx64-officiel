"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import CoverImageUpload from "@/components/ui/cover-image-upload";
import { useRouter } from "next/navigation";

const UploadDatasetPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [metadata, setMetadata] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (tags) {
      formData.append("tags", tags);
    }
    if (metadata) {
      formData.append("metadata", metadata);
    }
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/datasets", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Handle success (e.g., redirect to a success page)
          router.push("/marketplace");
          
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to upload dataset");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Dataset</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            required
            placeholder="Enter dataset title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            required
            placeholder="Enter dataset description"
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            type="text"
            value={tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTags(e.target.value)
            }
            placeholder="e.g., image, classification, cats, dogs"
          />
        </div>
        <div>
          <Label htmlFor="metadata">Metadata (JSON format)</Label>
          <Textarea
            id="metadata"
            value={metadata}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMetadata(e.target.value)
            }
            placeholder='{ "key": "value" }'
          />
        </div>
        <div>
          <Label>Files</Label>
          <FileUpload onFileSelect={(selectedFiles) => setFiles(selectedFiles)} />
        </div>
        <div>
          <Label>Cover Image</Label>
          <CoverImageUpload onFileSelect={(selectedFile) => setCoverImage(selectedFile)} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Dataset"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default UploadDatasetPage;
