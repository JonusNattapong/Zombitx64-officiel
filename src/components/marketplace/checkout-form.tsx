"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema for payment form validation
const paymentSchema = z.object({
  paymentMethod: z.enum(["credit_card", "bank_transfer", "wallet"]),
  savePaymentInfo: z.boolean().optional(),
  // Credit card fields
  cardNumber: z.string().regex(/^\d{16}$/, "หมายเลขบัตรต้องมี 16 หลัก").optional(),
  cardName: z.string().min(3, "กรุณาระบุชื่อบนบัตร").optional(),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, "รูปแบบวันหมดอายุไม่ถูกต้อง (MM/YY)").optional(),
  cardCvc: z.string().regex(/^\d{3,4}$/, "CVC ต้องมี 3-4 หลัก").optional(),
  // Bank transfer fields
  bankName: z.string().min(3, "กรุณาระบุชื่อธนาคาร").optional(),
  accountName: z.string().min(3, "กรุณาระบุชื่อบัญชี").optional(),
  accountNumber: z.string().min(10, "เลขบัญชีไม่ถูกต้อง").optional(),
});

// Refine the schema based on selected payment method
const refinedPaymentSchema = paymentSchema.superRefine((data, ctx) => {
  if (data.paymentMethod === "credit_card") {
    if (!data.cardNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุหมายเลขบัตร",
        path: ["cardNumber"],
      });
    }
    if (!data.cardName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุชื่อบนบัตร",
        path: ["cardName"],
      });
    }
    if (!data.cardExpiry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุวันหมดอายุ",
        path: ["cardExpiry"],
      });
    }
    if (!data.cardCvc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุ CVC",
        path: ["cardCvc"],
      });
    }
  } else if (data.paymentMethod === "bank_transfer") {
    if (!data.bankName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุชื่อธนาคาร",
        path: ["bankName"],
      });
    }
    if (!data.accountName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุชื่อบัญชี",
        path: ["accountName"],
      });
    }
    if (!data.accountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "จำเป็นต้องระบุเลขบัญชี",
        path: ["accountNumber"],
      });
    }
  }
});

export function CheckoutForm({ productId, productType, finalPrice, subscriptionType }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentTab, setPaymentTab] = useState("new-payment");
  
  const form = useForm({
    resolver: zodResolver(refinedPaymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      savePaymentInfo: false,
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvc: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    },
  });
  
  const selectedPaymentMethod = form.watch("paymentMethod");
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsProcessing(true);
    
    try {
      // ในสถานการณ์จริงควรส่งข้อมูลไปที่ payment gateway API
      // แต่ในตัวอย่างนี้จะจำลองการชำระเงินสำเร็จ
      
      // สร้าง transaction ในฐานข้อมูล
      const purchaseResponse = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          paymentMethod: data.paymentMethod,
          amount: finalPrice,
          ...(productType === "subscription" && { subscriptionType }),
        }),
      });
      
      if (!purchaseResponse.ok) {
        throw new Error("การชำระเงินล้มเหลว โปรดลองอีกครั้ง");
      }
      
      const { purchaseId, redirectUrl } = await purchaseResponse.json();
      
      // แสดงข้อความสำเร็จ
      toast.success("การชำระเงินสำเร็จ! กำลังเปลี่ยนเส้นทาง...");
      
      // บันทึกข้อมูลการชำระเงินถ้าผู้ใช้เลือก
      if (data.savePaymentInfo) {
        await fetch("/api/user/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethod: data.paymentMethod,
            ...(data.paymentMethod === "credit_card" && {
              cardName: data.cardName,
              cardNumberLast4: data.cardNumber.slice(-4),
              cardExpiry: data.cardExpiry,
            }),
            ...(data.paymentMethod === "bank_transfer" && {
              bankName: data.bankName,
              accountName: data.accountName,
              accountNumberLast4: data.accountNumber.slice(-4),
            }),
          }),
        });
      }
      
      // เปลี่ยนเส้นทางไปยังหน้ายืนยันการสั่งซื้อ
      router.push(redirectUrl || `/marketplace/purchase-success?id=${purchaseId}`);
    } catch (error) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>วิธีการชำระเงิน</CardTitle>
            <CardDescription>
              เลือกวิธีการชำระเงินที่คุณต้องการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="new-payment" onValueChange={setPaymentTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-payment">ชำระเงินใหม่</TabsTrigger>
                <TabsTrigger value="saved-payment">วิธีการชำระเงินที่บันทึกไว้</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new-payment" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>เลือกวิธีการชำระเงิน</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="credit_card" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              บัตรเครดิต / เดบิต
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="bank_transfer" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              โอนเงินผ่านธนาคาร
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="wallet" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <Wallet className="mr-2 h-4 w-4" />
                              กระเป๋าเงินอิเล็กทรอนิกส์
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Credit Card Form */}
                {selectedPaymentMethod === "credit_card" && (
                  <div className="space-y-4 mt-6 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หมายเลขบัตร</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1234 5678 9012 3456" maxLength={16} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อบนบัตร</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="JOHN DOE" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>วันหมดอายุ</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="MM/YY" maxLength={5} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardCvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123" maxLength={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Bank Transfer Form */}
                {selectedPaymentMethod === "bank_transfer" && (
                  <div className="space-y-4 mt-6 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ธนาคาร</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ชื่อธนาคาร" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อบัญชี</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ชื่อเจ้าของบัญชี" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เลขบัญชี</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="เลขบัญชี 10-12 หลัก" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* E-Wallet Form */}
                {selectedPaymentMethod === "wallet" && (
                  <div className="space-y-4 mt-6 p-4 border rounded-md">
                    <p className="text-center">คุณจะถูกเปลี่ยนเส้นทางไปยังหน้าชำระเงินของกระเป๋าเงินอิเล็กทรอนิกส์</p>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="savePaymentInfo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>บันทึกข้อมูลการชำระเงินนี้สำหรับการซื้อครั้งต่อไป</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="saved-payment" className="mt-4">
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">คุณยังไม่มีวิธีการชำระเงินที่บันทึกไว้</p>
                  <Button 
                    variant="link" 
                    onClick={() => setPaymentTab("new-payment")}
                  >
                    เพิ่มวิธีการชำระเงินใหม่
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>ยืนยันการสั่งซื้อ</CardTitle>
            <CardDescription>
              ตรวจสอบรายละเอียดการสั่งซื้อก่อนยืนยันการชำระเงิน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className="font-medium">{formatCurrency(finalPrice)}</span>
              </div>
              {productType === "subscription" && (
                <p className="text-sm text-muted-foreground">
                  {subscriptionType === "monthly" && "คุณจะถูกเรียกเก็บเงินรายเดือน"}
                  {subscriptionType === "yearly" && "คุณจะถูกเรียกเก็บเงินรายปี"}
                  {subscriptionType === "quarterly" && "คุณจะถูกเรียกเก็บเงินรายไตรมาส"}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังดำเนินการ...
                </>
              ) : (
                `ชำระเงิน ${formatCurrency(finalPrice)}`
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
