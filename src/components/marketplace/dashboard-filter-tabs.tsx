"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardFilterTabsProps {
  currentPeriod: string;
}

export function DashboardFilterTabs({ currentPeriod }: DashboardFilterTabsProps) {
  return (
    <Tabs defaultValue={currentPeriod} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="week" asChild>
          <Link href="?period=week">7 วัน</Link>
        </TabsTrigger>
        <TabsTrigger value="month" asChild>
          <Link href="?period=month">30 วัน</Link>
        </TabsTrigger>
        <TabsTrigger value="year" asChild>
          <Link href="?period=year">1 ปี</Link>
        </TabsTrigger>
        <TabsTrigger value="all" asChild>
          <Link href="?period=all">ทั้งหมด</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
