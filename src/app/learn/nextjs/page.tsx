"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/custom-accordion";
import { Progress } from "@/components/ui/custom-progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

const modules: Module[] = [
  {
    id: "m1",
    title: "Getting Started with Next.js 14",
    description: "Learn the basics of Next.js and set up your development environment",
    lessons: [
      {
        id: "l1",
        title: "Introduction to Next.js",
        duration: "10 mins",
        completed: false,
      },
      {
        id: "l2",
        title: "Setting Up Your Development Environment",
        duration: "15 mins",
        completed: false,
      },
      {
        id: "l3",
        title: "Creating Your First Next.js Project",
        duration: "20 mins",
        completed: false,
      },
    ],
  },
  {
    id: "m2",
    title: "App Router & Server Components",
    description: "Master the new App Router and Server Components in Next.js 14",
    lessons: [
      {
        id: "l4",
        title: "Understanding the App Router",
        duration: "15 mins",
        completed: false,
      },
      {
        id: "l5",
        title: "Server Components vs Client Components",
        duration: "20 mins",
        completed: false,
      },
      {
        id: "l6",
        title: "Data Fetching in Next.js 14",
        duration: "25 mins",
        completed: false,
      },
    ],
  },
];

export default function NextJsCoursePage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const toggleLesson = (lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const totalLessons = modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const progressValue = (completedLessons.length / totalLessons) * 100;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Next.js Development Course</h1>
          <p className="text-muted-foreground mt-2">
            Master modern web development with Next.js 14
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">Course Progress</p>
          <Progress value={progressValue} className="w-[200px]" />
          <p className="text-sm mt-2">
            {completedLessons.length} of {totalLessons} lessons completed
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-lg">
              {module.title}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground mb-4">{module.description}</p>
              <div className="space-y-4">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lesson.duration}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Lesson
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
