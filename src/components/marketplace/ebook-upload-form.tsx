'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload, Book, FileText, ChevronRight, ChevronLeft } from "lucide-react";

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
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_EBOOK_TYPES = [".pdf", ".epub", ".mobi"];
const ACCEPTED_COVER_TYPES = [".jpg", ".jpeg", ".png"];

const ebookSchema = z.object({
  title: z.string().min(5, "ชื่อต้องมีความยาวอย่างน้อย 5 ตัวอักษร").max(100, "ชื่อต้องมีความยาวไม่เกิน 100 ตัวอักษร"),
  description: z.string().min(20, "รายละเอียดต้องมีความยาวอย่างน้อย 20 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  tags: z.string(),
  language: z.string().min(1, "กรุณาเลือกภาษา"),
  author: z.string().min(1, "กรุณาระบุชื่อผู้เขียน"),
  publishYear: z.string().regex(/^\d{4}$/, "ปีที่พิมพ์ต้องเป็นตัวเลข 4 หลัก"),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  pages: z.string().optional(),
  tableOfContents: z.string().optional(),
  sampleContent: z.string().optional(),
  licenseType: z.string().min(1, "กรุณาเลือกประเภทลิขสิทธิ์"),
  visibility: z.enum(["public", "private", "unlisted"] as const),
  pricingModel: z.enum(["one-time", "subscription", "free"]),
  subscriptionPeriod: z.string().optional(),
  price: z.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
  allowPreview: z.boolean().default(false),
});

interface EbookUploadFormProps {
  userId: string; // Assuming userId is a string, adjust if needed
}

export function EbookUploadForm({ userId }: EbookUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState(1);
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<z.infer<typeof ebookSchema>>({
    resolver: zodResolver(ebookSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
      language: "",
      author: "",
      publishYear: new Date().getFullYear().toString(),
      publisher: "",
      isbn: "",
      pages: "",
      tableOfContents: "",
      sampleContent: "",
      licenseType: "",
      visibility: "public",
      pricingModel: "one-time",
      subscriptionPeriod: "monthly",
      price: 0,
      allowPreview: false,
    },
  });
  
  const pricingModel = form.watch("pricingModel");
  const allowPreview = form.watch("allowPreview");
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("รูปภาพปกต้องมีขนาดไม่เกิน 5MB");
      return;
    }
    
    const fileExt = file?.name ? `.${file.name.split(".").pop().toLowerCase()}` : '';
    if (!fileExt || !ACCEPTED_COVER_TYPES.includes(fileExt)) {
      toast.error(`ไฟล์ภาพปกไม่ได้รับการสนับสนุน ประเภทไฟล์ที่รองรับ: ${ACCEPTED_COVER_TYPES.join(", ")}`);
      return;
    }
    
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setCoverImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleEbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 100MB`);
      return;
    }
    
    const fileExt = file?.name ? `.${file.name.split(".").pop().toLowerCase()}` : '';
    if (!fileExt || !ACCEPTED_EBOOK_TYPES.includes(fileExt)) {
      toast.error(`ไฟล์ E-Book ไม่ได้รับการสนับสนุน ประเภทไฟล์ที่รองรับ: ${ACCEPTED_EBOOK_TYPES.join(", ")}`);
      return;
    }
    
    setEbookFile(file);
  };
  
  const handlePreviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`ไฟล์ตัวอย่างต้องมีขนาดไม่เกิน 10MB`);
      return;
    }
    
    const fileExt = file?.name ? `.${file.name.split(".").pop().toLowerCase()}` : '';
    if (!fileExt || !ACCEPTED_EBOOK_TYPES.includes(fileExt)) {
      toast.error(`ไฟล์ตัวอย่างไม่ได้รับการสนับสนุน ประเภทไฟล์ที่รองรับ: ${ACCEPTED_EBOOK_TYPES.join(", ")}`);
      return;
    }
    
    setPreviewFile(file);
  };
  
  const onSubmit = async (formData: z.infer<typeof ebookSchema>) => {
    if (!ebookFile) {
      toast.error("กรุณาอัพโหลดไฟล์ E-Book");
      return;
    }
    
    if (!coverImage) {
      toast.error("กรุณาอัพโหลดรูปภาพปก");
      return;
    }
    
    if (allowPreview && !previewFile) {
      toast.error("กรุณาอัพโหลดไฟล์ตัวอย่าง หรือปิดการเปิดให้ดูตัวอย่าง");
      return;
    }
    
    setIsSubmitting(true);
    setUploadStep(2);
    
    try {
      // Step 1: Upload ebook metadata
      const metadataResponse = await fetch("/api/marketplace/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((tag: string) => tag.trim()),
          userId,
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error("เกิดข้อผิดพลาดในการสร้าง E-Book");
      }
      
      const { ebookId } = await metadataResponse.json();
      
      // Step 2: Upload cover image
      const imageFormData = new FormData();
      imageFormData.append("ebookId", ebookId);
      imageFormData.append("coverImage", coverImage);
      
      const imageResponse = await fetch("/api/marketplace/ebook/cover-image", {
        method: "POST",
        body: imageFormData,
      });
      
      if (!imageResponse.ok) {
        throw new Error("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ");
      }
      
      setUploadProgress(30);
      
      // Step 3: Upload ebook file with progress tracking
      const fileFormData = new FormData();
      fileFormData.append("ebookId", ebookId);
      fileFormData.append("file", ebookFile);
      
      const ebookXhr = new XMLHttpRequest();
      
      // Setup progress event
      ebookXhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = 30 + (event.loaded / event.total * 40);
          setUploadProgress(Math.round(percentComplete));
        }
      };
      
      await new Promise((resolve, reject) => {
        ebookXhr.onload = () => {
          if (ebookXhr.status >= 200 && ebookXhr.status < 300) {
            resolve(ebookXhr.response);
          } else {
            reject(new Error(`Upload failed with status ${ebookXhr.status}`));
          }
        };
        
        ebookXhr.onerror = () => reject(new Error("Upload failed"));
        
        ebookXhr.open("POST", "/api/marketplace/ebook/file");
        ebookXhr.send(fileFormData);
      });
      
      setUploadProgress(70);
      
      // Step 4: Upload preview file if needed
      if (allowPreview && previewFile) {
        const previewFormData = new FormData();
        previewFormData.append("ebookId", ebookId);
        previewFormData.append("file", previewFile);
        previewFormData.append("isPreview", "true");
        
        const previewXhr = new XMLHttpRequest();
        
        // Setup progress event
        previewXhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = 70 + (event.loaded / event.total * 20);
            setUploadProgress(Math.round(percentComplete));
          }
        };
        
        await new Promise((resolve, reject) => {
          previewXhr.onload = () => {
            if (previewXhr.status >= 200 && previewXhr.status < 300) {
              resolve(previewXhr.response);
            } else {
              reject(new Error(`Preview upload failed with status ${previewXhr.status}`));
            }
          };
          
          previewXhr.onerror = () => reject(new Error("Preview upload failed"));
          
          previewXhr.open("POST", "/api/marketplace/ebook/file");
          previewXhr.send(previewFormData);
        });
      }
      
      setUploadProgress(90);
      
      // Step 5: Create product for marketplace listing
      const productResponse = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          tags: formData.tags.split(",").map((tag: string) => tag.trim()),
          productType: "ebook",
          ebookId: ebookId,
          pricingModel: formData.pricingModel,
          subscriptionPeriod: formData.subscriptionPeriod,
          author: formData.author,
          language: formData.language,
          publishYear: formData.publishYear,
          visibility: formData.visibility,
        }),
      });
      
      if (!productResponse.ok) {
        throw new Error("เกิดข้อผิดพลาดในการสร้างสินค้าในตลาด");
      }
      
      setUploadProgress(100);
      const { productId } = await productResponse.json();
      
      toast.success("อัพโหลด E-Book สำเร็จ");
      
      // Navigate to the product page
      router.push(`/marketplace/product-listing/${productId}`);
    } catch (error) {
      toast.error((error as Error).message);
      setUploadStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form based on current upload step
  if (uploadStep === 2) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">กำลังอัพโหลด E-Book</h2>
          <p className="text-muted-foreground mb-4">โปรดรอสักครู่ ระบบกำลังอัพโหลดไฟล์ของคุณ</p>
          <Progress value={uploadProgress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{uploadProgress}% เสร็จสิ้น</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
            <TabsTrigger value="details">รายละเอียด</TabsTrigger>
            <TabsTrigger value="files">ไฟล์</TabsTrigger>
            <TabsTrigger value="pricing">ราคา</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลพื้นฐาน</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ E-Book</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ชื่อหนังสือของคุณ" />
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
                          placeholder="อธิบายรายละเอียดของหนังสือ เนื้อหา และประโยชน์ที่ผู้อ่านจะได้รับ" 
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
                          <SelectItem value="fiction">นวนิยาย (Fiction)</SelectItem>
                          <SelectItem value="non-fiction">สารคดี (Non-Fiction)</SelectItem>
                          <SelectItem value="technical">เทคนิคและวิชาการ (Technical)</SelectItem>
                          <SelectItem value="education">การศึกษา (Education)</SelectItem>
                          <SelectItem value="business">ธุรกิจและการเงิน (Business)</SelectItem>
                          <SelectItem value="self-help">พัฒนาตนเอง (Self-Help)</SelectItem>
                          <SelectItem value="biography">ชีวประวัติ (Biography)</SelectItem>
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
                          placeholder="self-improvement, programming, fantasy (คั่นด้วยเครื่องหมายจุลภาค)"
                        />
                      </FormControl>
                      <FormDescription>
                        แท็กช่วยให้ผู้ใช้ค้นหา E-Book ของคุณได้ง่ายขึ้น
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้เขียน</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ชื่อผู้เขียนหนังสือ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ภาษา</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกภาษา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="thai">ไทย</SelectItem>
                          <SelectItem value="english">อังกฤษ</SelectItem>
                          <SelectItem value="chinese">จีน</SelectItem>
                          <SelectItem value="japanese">ญี่ปุ่น</SelectItem>
                          <SelectItem value="korean">เกาหลี</SelectItem>
                          <SelectItem value="other">อื่นๆ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">รายละเอียดหนังสือ</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="publishYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ปีที่พิมพ์</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="ปี ค.ศ." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>จำนวนหน้า</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="จำนวนหน้า" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="publisher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สำนักพิมพ์</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ชื่อสำนักพิมพ์ (ถ้ามี)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ISBN (ถ้ามี)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tableOfContents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สารบัญ</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="สารบัญหนังสือ (รูปแบบ Markdown)" 
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        สามารถใช้รูปแบบ Markdown ได้
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sampleContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เนื้อหาตัวอย่าง</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="เนื้อหาตัวอย่างหรือบทคัดย่อ" 
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        เนื้อหาส่วนนี้จะแสดงในหน้าสินค้าเพื่อให้ผู้ซื้อได้ทราบเกี่ยวกับเนื้อหาของหนังสือ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </TabsContent>
          
          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 pt-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">ไฟล์ E-Book และรูปภาพปก</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-2">รูปภาพปก</p>
                  
                  {coverImagePreview ? (
                    <div className="relative aspect-[3/4] max-w-xs mb-2 bg-muted rounded-md overflow-hidden">
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
                      className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors aspect-[3/4] max-w-xs"
                      onClick={() => document.getElementById("cover-upload")?.click()}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
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
                  <p className="text-sm font-medium mb-2">ไฟล์ E-Book</p>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
                    onClick={() => document.getElementById("ebook-upload")?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <Book className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">คลิกเพื่ออัพโหลดไฟล์ E-Book</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, EPUB, MOBI (สูงสุด 100MB)
                      </p>
                    </div>
                    <input
                      id="ebook-upload"
                      type="file"
                      accept=".pdf,.epub,.mobi"
                      className="hidden"
                      onChange={handleEbookFileChange}
                    />
                  </div>
                  
                  {ebookFile && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted mb-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[80%]">{ebookFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEbookFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="allowPreview"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          เปิดให้ดูตัวอย่างหนังสือ
                        </FormLabel>
                        <FormDescription>
                          อนุญาตให้ผู้ใช้สามารถดูตัวอย่างหนังสือก่อนซื้อได้
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {allowPreview && (
                  <div className="mt-4 ml-7">
                    <p className="text-sm font-medium mb-2">ไฟล์ตัวอย่าง</p>
                    
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
                      onClick={() => document.getElementById("preview-upload")?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">คลิกเพื่ออัพโหลดไฟล์ตัวอย่าง</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, EPUB, MOBI (สูงสุด 10MB) - ควรเป็นบางส่วนของหนังสือ
                        </p>
                      </div>
                      <input
                        id="preview-upload"
                        type="file"
                        accept=".pdf,.epub,.mobi"
                        className="hidden"
                        onChange={handlePreviewFileChange}
                      />
                    </div>
                    
                    {previewFile && (
                      <div className="flex items-center justify-between p-2 rounded bg-muted mb-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[80%]">{previewFile.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 pt-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">การกำหนดราคาและการเข้าถึง</h2>
              
              <div className="space-y-4">
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
                        กำหนดว่าใครสามารถมองเห็น E-Book นี้ได้
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
                          <SelectItem value="standard">ลิขสิทธิ์มาตรฐาน (อ่านเท่านั้น)</SelectItem>
                          <SelectItem value="extended">ลิขสิทธิ์แบบขยาย (พิมพ์ได้)</SelectItem>
                          <SelectItem value="commercial">ลิขสิทธิ์เชิงพาณิชย์</SelectItem>
                          <SelectItem value="custom">กำหนดเอง</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        เลือกลิขสิทธิ์ที่จะใช้กับ E-Book ของคุณ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        กำหนดวิธีการคิดราคาสำหรับ E-Book ของคุณ
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
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        {pricingModel === "free" 
                          ? "E-Book ฟรีไม่ต้องระบุราคา" 
                          : pricingModel === "subscription" 
                            ? "ราคาต่อหนึ่งรอบการสมัครสมาชิก"
                            : "ราคาสำหรับการซื้อครั้งเดียว"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
            
            <div className="flex justify-end gap-4">
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
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}