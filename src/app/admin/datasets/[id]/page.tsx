import React, { useState, useEffect, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'; // Correct import for NextRequest and NextResponse
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma' // Import prisma
import { authOptions } from '@/lib/auth'
import DatasetFileList from '@/components/datasets/dataset-file-list'
import DatasetFileUpload from '@/components/datasets/dataset-file-upload'
import { Dataset, DatasetFile } from '@prisma/client'


interface DatasetDetailPageProps {
  params: { id: string }
  dataset: Dataset & { files: DatasetFile[] } | null // Dataset prop
  session: any // Add session prop type
}

// Fetch dataset data outside the component
async function getDatasetData(datasetId: string, userId: string) {
  const fetchedDataset = await prisma.dataset.findUnique({
    where: {
      id: datasetId,
      userId: userId,
    },
    include: {
      files: true,
    },
  })
  return fetchedDataset as Dataset & { files: DatasetFile[] } | null; // Explicitly cast
}


const DatasetDetailPage: React.FC<DatasetDetailPageProps> = ({ params, dataset: initialDataset, session }) => { // Receive dataset and session as props
  const [dataset, setDataset] = useState<Dataset & { files: DatasetFile[] } | null>(initialDataset)
  const [isLoading, setIsLoading] = useState(false) // No longer loading initially
  const [error, setError] = useState<string | null>(null)

  const fetchDataset = useCallback(async () => {
    if (!session?.user) return; // Exit if no session
    setIsLoading(true)
    setError(null)
    try {
      const fetchedDataset = await getDatasetData(params.id, session.user.id)
      if (!fetchedDataset) {
        notFound()
      }
      setDataset(fetchedDataset)
    } catch (e) {
      console.error("Failed to fetch dataset", e)
      setError('Failed to load dataset. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [params.id, session?.user?.id])

  useEffect(() => {
    if (!initialDataset) {
      fetchDataset() // Only fetch if no initial dataset
    }
  }, [initialDataset, fetchDataset])

  const refreshDataset = useCallback(() => {
    fetchDataset()
  }, [fetchDataset])


  if (isLoading || !dataset) { // Handle null dataset during initial load
    return <div>Loading dataset details...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{dataset.title}</h2>
      <p className="mb-4">{dataset.description}</p>

      <h3 className="text-lg font-semibold mb-2">Files</h3>
      <DatasetFileList files={dataset.files} datasetId={params.id} onFileDeleted={refreshDataset} /> {/* Pass refreshDataset as onFileDeleted */}

      <h3 className="text-lg font-semibold mb-2 mt-4">Upload Files</h3>
      <DatasetFileUpload datasetId={params.id} onUploadComplete={refreshDataset} />
    </div>
  )
}

// Use getServerSideProps to fetch data server-side
export async function getServerSideProps({ params, req, res }: { params: { id: string }, req: NextRequest, res: NextResponse }) { // Added res to context
  const session = await getServerSession(req, res, authOptions) // Correct getServerSession call with separate arguments
  if (!session?.user) {
    return {
      notFound: true,
    }
  }

  const dataset = await getDatasetData(params.id, session.user.id);

  return {
    props: {
      dataset: dataset, // Pass dataset data as prop
      params: params, // Pass params to the page
      session: session, // Pass session as prop
    },
  }
}


export default DatasetDetailPage