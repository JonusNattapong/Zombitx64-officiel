"use client"

import { useRef, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ใช้ Chart.js จำลองกราฟ (คุณต้องติดตั้งไลบรารี่นี้)
// npm install chart.js
import Chart from 'chart.js/auto';

export function DashboardChart({ data }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // ทำความสะอาดกราฟเก่าถ้ามี
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // สร้างข้อมูลกราฟ
    const labels = data.map(item => item.date);
    const salesData = data.map(item => item.sales);
    const revenueData = data.map(item => item.revenue);
    
    // สร้างกราฟใหม่
    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'รายได้',
            data: revenueData,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'จำนวนการขาย',
            data: salesData,
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderDash: [5, 5],
            tension: 0.3,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.dataset.label === 'รายได้') {
                  label += formatCurrency(context.parsed.y);
                } else {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'รายได้ (บาท)',
            },
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'จำนวนการขาย',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            title: {
              display: true,
              text: 'วันที่',
            },
          }
        }
      }
    });
    
    // ทำความสะอาดเมื่อ component ถูกทำลาย
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);
  
  // กรณีไม่มีข้อมูล
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">ไม่มีข้อมูลการขายในช่วงเวลาที่เลือก</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}
