"use client";

import { analytics } from "@/lib/analytics";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface AnalyticsSummary {
  totalEvents: number;
  eventTypes: { [key: string]: number };
  recentEvents: any[];
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalEvents: 0,
    eventTypes: {},
    recentEvents: [],
  });

  // Update summary with current events
  const updateSummary = () => {
    const events = analytics.getEvents();
    const eventTypes: { [key: string]: number } = {};

    // Count events by type
    events.forEach((event) => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });

    setSummary({
      totalEvents: events.length,
      eventTypes,
      recentEvents: events.slice(-10).reverse(), // Get last 10 events
    });
  };

  // Initial load and set up polling
  useEffect(() => {
    updateSummary();

    // Poll for updates every 5 seconds
    const interval = setInterval(updateSummary, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Total Events</h2>
          <p className="text-4xl">{summary.totalEvents}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-2">Event Types</h2>
          <div className="space-y-2">
            {Object.entries(summary.eventTypes).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span>{type}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
        <div className="space-y-4">
          {summary.recentEvents.map((event, index) => (
            <div key={index} className="p-4 border rounded">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{event.type}</span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              {event.data && (
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
