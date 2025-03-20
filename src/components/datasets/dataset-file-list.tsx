import React from 'react'
import { DatasetFile } from '@prisma/client'
import { Button } from '@/components/ui/button'

interface DatasetFileListProps {
  files: DatasetFile[]
  datasetId: string
  onFileDeleted: () => void;
}

const DatasetFileList: React.FC<DatasetFileListProps> = ({ files, datasetId, onFileDeleted }) => {
  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/datasets/files/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to delete file:', errorData)
        // TODO: Implement better error handling (e.g., toast notification)
        alert(`Failed to delete file: ${errorData.error || 'Unknown error'}`)
      } else {
        // File deleted successfully, refresh file list or update UI
        console.log('File deleted successfully')
        // TODO: Refresh file list in UI - now implemented by onFileDeleted callback
        alert('File deleted successfully! (UI refresh should now be implemented)')
        onFileDeleted() // Call the onFileDeleted callback to refresh dataset
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file! Please check the console.')
    }
  }

  return (
    <div>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between py-2">
              <span>{file.filename} ({file.fileType}) - {file.fileSize} bytes</span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDeleteFile(file.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DatasetFileList