import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button, Input } from "@/components/ui";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface EbookReaderProps {
  fileUrl: string;
  fileType: string;
  title: string;
}

export function EbookReader({ fileUrl, fileType, title }: EbookReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    setPageNumber(1);
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function goToPrevPage() {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  }

  function handlePageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newPageNumber = parseInt(event.target.value, 10);
    if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
      setPageNumber(newPageNumber);
    }
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0));
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  }

  if (fileType === "pdf") {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 2.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            className="w-16 text-center"
            value={pageNumber}
            onChange={handlePageChange}
            min="1"
            max={numPages || 1}
          />
          <span className="text-sm text-muted-foreground">/ {numPages || 1}</span>
          <Button variant="outline" size="icon" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <p className="text-lg font-bold">ไม่รองรับไฟล์ประเภทนี้</p>
          <p className="mt-2">โปรดตรวจสอบว่าไฟล์ E-Book เป็น PDF, EPUB หรือ MOBI</p>
        </div>
      </div>
    );
  }
}