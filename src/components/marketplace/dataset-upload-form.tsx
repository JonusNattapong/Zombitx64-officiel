"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = [".csv", ".json", ".txt", ".zip", ".npy", ".pkl", ".h5", ".npz"];

const datasetSchema = z.object({
  title: z.string().min(5, "ชื่อต้องมีความยาวอย่างน้อย 5 ตัวอักษร").max(100, "ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร"),
  description: z.string().min(20, "คำอธิบายต้องมีความยาวอย่างน้อย 20 ตัวอักษร").max(5000, "คำอธิบายต้องมีความยาวไม่เกิน 5000 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  tags: z.string().optional(),
  price: z.coerce.number().min(0, "ราคาต้องไม่ต่ำกว่า 0").max(100000, "ราคาต้องไม่เกิน 100,000"),
  licenseType: z.string().min(1, "กรุณาเลือกประเภทลิขสิทธิ์"),
  visibility: z.enum(["public", "private", "unlisted"]),
  pricingModel: z.enum(["one-time", "subscription", "free"]),
  subscriptionPeriod: z.string().optional(),
});

export function DatasetUploadForm({ userId }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [datasetFiles, setDatasetFiles] = useState([]);
  const [uploadStep, setUploadStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
      price: 0,
      licenseType: "",
      visibility: "public",
      pricingModel: "one-time",
      subscriptionPeriod: "monthly",
    },
  });
  
  const pricingModel = form.watch("pricingModel");
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("รูปภาพปกต้องมีขนาดไม่เกิน 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("ไฟล์ต้องเป็นรูปภาพเท่านั้น");
      return;
    }
    
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };
  
  const handleFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Validate files
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 100MB`);
        return;
      }
      
      const fileExt = `.${file.name.split(".").pop().toLowerCase()}`;
      if (!ACCEPTED_FILE_TYPES.includes(fileExt)) {
        toast.error(`ไฟล์ ${file.name} ไม่ได้รับการสนับสนุน ประเภทไฟล์ที่รองรับ: ${ACCEPTED_FILE_TYPES.join(", ")}`);
        return;
      }
    }
    
    setDatasetFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };
  
  const removeFile = (indexToRemove) => {
    setDatasetFiles((prevFiles) => 
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };
  
  const generatePreview = async () => {
    if (datasetFiles.length === 0) {
      toast.error("กรุณาอัพโหลดไฟล์อย่างน้อย 1 ไฟล์เพื่อดูตัวอย่าง");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", datasetFiles[0]);
      
      const response = await fetch("/api/marketplace/dataset/preview", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("ไม่สามารถสร้างตัวอย่างได้");
      }
      
      const data = await response.json();
      setPreviewData(data.preview);
      setShowPreview(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSubmit = async (formData) => {
    if (datasetFiles.length === 0) {
      toast.error("กรุณาอัพโหลดไฟล์อย่างน้อย 1 ไฟล์");
      return;
    }
    
    setIsSubmitting(true);
    setUploadStep(2);
    
    try {
      // Step 1: Upload dataset metadata
      const metadataResponse = await fetch("/api/marketplace/dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(tag => tag.trim()),
          userId,
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error("เกิดข้อผิดพลาดในการสร้าง dataset");
      }
      
      const { datasetId } = await metadataResponse.json();
      
      // Step 2: Upload cover image if exists
      if (coverImage) {
        const imageFormData = new FormData();
        imageFormData.append("datasetId", datasetId);
        imageFormData.append("coverImage", coverImage);
        
        const imageResponse = await fetch("/api/marketplace/dataset/cover-image", {
          method: "POST",
          body: imageFormData,
        });
        
        if (!imageResponse.ok) {
          throw new Error("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ");
        }
      }
      
      // Step 3: Upload dataset files with progress tracking
      setUploadProgress(0);
      
      for (let i = 0; i < datasetFiles.length; i++) {
        const fileFormData = new FormData();
        fileFormData.append("datasetId", datasetId);
        fileFormData.append("file", datasetFiles[i]);
        
        const xhr = new XMLHttpRequest();
        
        // Setup progress event
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = ((i / datasetFiles.length) + (event.loaded / event.total / datasetFiles.length)) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };
        
        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error("Upload failed"));
          
          xhr.open("POST", "/api/marketplace/dataset/files");
          xhr.send(fileFormData);
        });
      }
      
      setUploadProgress(100);
      toast.success("อัพโหลด Dataset สำเร็จ");
      
      // Create product for marketplace listing
      const productResponse = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          tags: formData.tags.split(",").map(tag => tag.trim()),
          datasetId,
          pricingModel: formData.pricingModel,
          subscriptionPeriod: formData.subscriptionPeriod,
        }),
      });
      
      if (!productResponse.ok) {
        throw new Error("เกิดข้อผิดพลาดในการสร้างสินค้าในตลาด");
      }
      
      const { productId } = await productResponse.json();
      
      // Navigate to the product page
      router.push(`/marketplace/product-listing/${productId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form based on current upload step
  if (uploadStep === 2) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">กำลังอัพโหลด Dataset</h2>
          <p className="text-muted-foreground mb-4">โปรดรอสักครู่ ระบบกำลังอัพโหลดไฟล์ของคุณ</p>
          <Progress value={uploadProgress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{uploadProgress}% เสร็จสิ้น</p>
        </div>
      </Card>
    );
  }
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">รายละเอียดพื้นฐาน</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ Dataset</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ชื่อที่ดึงดูดและอธิบายชุดข้อมูลของคุณ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>คำอธิบาย</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="อธิบายรายละเอียดของข้อมูล, วิธีรวบรวม และการใช้งานที่เป็นไปได้" 
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        สนับสนุนการใช้ Markdown
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมวดหมู่</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="image">ภาพ (Image)</SelectItem>
                          <SelectItem value="text">ข้อความ (Text)</SelectItem>
                          <SelectItem value="audio">เสียง (Audio)</SelectItem>
                          <SelectItem value="tabular">ตารางข้อมูล (Tabular)</SelectItem>
                          <SelectItem value="mixed">ผสม (Mixed)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แท็ก</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="nlp, computer-vision, sentiment-analysis (คั่นด้วยเครื่องหมายจุลภาค)"
                        />
                      </FormControl>
                      <FormDescription>
                        แท็กช่วยให้ผู้ใช้ค้นหา dataset ของคุณได้ง่ายขึ้น
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>การมองเห็น</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกการมองเห็น" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">สาธารณะ (สามารถค้นหาได้)</SelectItem>
                          <SelectItem value="unlisted">ไม่แสดงในการค้นหา (เข้าถึงด้วยลิงก์โดยตรง)</SelectItem>
                          <SelectItem value="private">ส่วนตัว (เฉพาะคุณเท่านั้น)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        กำหนดว่าใครสามารถมองเห็นข้อมูลชุดนี้ได้
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ประเภทลิขสิทธิ์</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภทลิขสิทธิ์" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CC0">CC0 (Public Domain)</SelectItem>
                          <SelectItem value="CC-BY">CC-BY (Attribution)</SelectItem>
                          <SelectItem value="CC-BY-SA">CC-BY-SA (Attribution-ShareAlike)</SelectItem>
                          <SelectItem value="CC-BY-NC">CC-BY-NC (Attribution-NonCommercial)</SelectItem>
                          <SelectItem value="custom">กำหนดเอง</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        เลือกลิขสิทธิ์ที่จะใช้กับ dataset ของคุณ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">รูปปกและไฟล์</h2>

                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">รูปภาพปก</p>
                  {coverImagePreview ? (
                    <div className="relative aspect-video mb-2 bg-muted rounded-md overflow-hidden">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById("cover-upload").click()}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">คลิกเพื่ออัพโหลดรูปภาพปก</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG หรือ JPEG (สูงสุด 5MB)
                        </p>
                      </div>
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">ไฟล์ข้อมูล</p>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
                    onClick={() => document.getElementById("files-upload").click()}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">คลิกเพื่ออัพโหลดไฟล์</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        CSV, JSON, TXT, ZIP, NPY, PKL, H5, NPZ (สูงสุด 100MB ต่อไฟล์)
                      </p>
                    </div>
                    <input
                      id="files-upload"
                      type="file"
                      multiple
                      accept=".csv,.json,.txt,.zip,.npy,.pkl,.h5,.npz"
                      className="hidden"
                      onChange={handleFilesChange}
                    />
                  </div>

                  {datasetFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">ไฟล์ที่เลือก ({datasetFiles.length})</p>
                      <div className="max-h-40 overflow-auto">
                        {datasetFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded bg-muted mb-1">
                            <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {datasetFiles.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generatePreview}
                          disabled={isSubmitting}
                          className="mt-2"
                        >
                          สร้างตัวอย่างข้อมูล
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">การกำหนดราคา</h2>
                
                <FormField
                  control={form.control}
                  name="pricingModel"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>รูปแบบการคิดราคา</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรูปแบบการคิดราคา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-time">จ่ายครั้งเดียว</SelectItem>
                          <SelectItem value="subscription">เป็นสมาชิกรายเดือน/รายปี</SelectItem>
                          <SelectItem value="free">ฟรี</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        กำหนดวิธีการคิดราคาสำหรับ dataset ของคุณ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {pricingModel === "subscription" && (
                  <FormField
                    control={form.control}
                    name="subscriptionPeriod"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>ระยะเวลาสมาชิก</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกระยะเวลา" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">รายเดือน</SelectItem>
                            <SelectItem value="yearly">รายปี</SelectItem>
                            <SelectItem value="quarterly">รายไตรมาส</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ราคา (บาท)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={pricingModel === "free"}
                        />
                      </FormControl>
                      <FormDescription>
                        {pricingModel === "free" 
                          ? "Dataset ฟรีไม่ต้องระบุราคา" 
                          : pricingModel === "subscription" 
                            ? "ราคาต่อหนึ่งรอบการสมัครสมาชิก"
                            : "ราคาสำหรับการซื้อครั้งเดียว"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังประมวลผล...</> : 
                "อัพโหลดและลงขาย"
              }
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Preview Data Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>ตัวอย่างข้อมูล</DialogTitle>
            <DialogDescription>
              นี่คือตัวอย่างข้อมูลจากไฟล์ของคุณ
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">{previewData ? JSON.stringify(previewData, null, 2) : "ไม่มีข้อมูลตัวอย่าง"}</pre>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
