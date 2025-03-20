import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { FileIcon, X } from 'lucide-react'

interface DatasetFileUploadProps {
  datasetId: string
  onUploadComplete?: () => void // Callback to refresh file list
}

const DatasetFileUpload: React.FC<DatasetFileUploadProps> = ({ datasetId, onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
  }

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      alert('Please select files to upload.')
      return
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`/api/datasets/${datasetId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('File upload failed:', errorData)
        alert(`File upload failed: ${errorData.error || 'Unknown error'}`)
      } else {
        console.log('Files uploaded successfully!')
        setFiles([]) // Clear files after successful upload
        if (onUploadComplete) {
          onUploadComplete() // Refresh file list in parent component
        }
        alert('Files uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files! Please check the console.')
    }
  }

  return (
    <div>
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 cursor-pointer ${isDragActive ? 'border-primary-500' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary-500">Drop files here...</p>
        ) : (
          <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Files to upload:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-4 w-4" />
                  <span>{file.name} ({file.type}) - {(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button onClick={handleUploadFiles} className="mt-4">
            Upload Files
          </Button>
        </div>
      )}
    </div>
  )
}

export default DatasetFileUpload