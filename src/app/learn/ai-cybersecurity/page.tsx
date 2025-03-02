import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/custom-accordion";
import { Progress } from "@/components/ui/custom-progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

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
}

const modules: Module[] = [
  {
    id: "m1",
    title: "AI Security Fundamentals",
    description: "Learn the basics of AI security and potential vulnerabilities",
    lessons: [
      {
        id: "l1",
        title: "Introduction to AI Security",
        duration: "15 mins",
      },
      {
        id: "l2",
        title: "Common AI Attack Vectors",
        duration: "20 mins",
      },
      {
        id: "l3",
        title: "AI Model Vulnerabilities",
        duration: "25 mins",
      },
    ],
  },
  {
    id: "m2",
    title: "Defensive AI Techniques",
    description: "Learn how to protect AI systems from attacks",
    lessons: [
      {
        id: "l4",
        title: "Model Hardening Techniques",
        duration: "30 mins",
      },
      {
        id: "l5",
        title: "Input Validation and Sanitization",
        duration: "25 mins",
      },
      {
        id: "l6",
        title: "Monitoring and Anomaly Detection",
        duration: "30 mins",
      },
    ],
  },
  {
    id: "m3",
    title: "AI for Cybersecurity",
    description: "Using AI to enhance cybersecurity measures",
    lessons: [
      {
        id: "l7",
        title: "AI-Powered Threat Detection",
        duration: "35 mins",
      },
      {
        id: "l8",
        title: "Automated Response Systems",
        duration: "30 mins",
      },
      {
        id: "l9",
        title: "Future of AI in Cybersecurity",
        duration: "25 mins",
      },
    ],
  },
  {
    id: "m4",
    title: "Practical Applications",
    description: "Real-world applications and case studies",
    lessons: [
      {
        id: "l10",
        title: "Building Secure AI Systems",
        duration: "40 mins",
      },
      {
        id: "l11",
        title: "Security Testing for AI Models",
        duration: "35 mins",
      },
      {
        id: "l12",
        title: "Incident Response for AI Systems",
        duration: "30 mins",
      },
    ],
  },
];

export default async function AICybersecurityCoursePage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return (
            <div className="container py-8">
                <p>You must be logged in to view this page.</p>
            </div>
        )
    }

    const userId = session.user.id;

    let learningProgress = await db.learningProgress.findFirst({
        where: {
            userId,
            courseId: "ai-cybersecurity",
        },
    });

    let completedLessons: string[] = [];
    if (learningProgress?.data) {
        completedLessons = JSON.parse(learningProgress.data);
    }

    const totalLessons = modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
    );
    const progressValue = learningProgress?.progress || 0;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">AI & Cybersecurity Course</h1>
          <p className="text-muted-foreground mt-2">
            Master AI security concepts and practices
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
                      <ClientAICybersecurityCoursePage lessonId={lesson.id} completed={completedLessons.includes(lesson.id)}/>
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

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateLearningProgress } from "../_actions";

interface ClientAICybersecurityCoursePageProps {
    lessonId: string;
    completed: boolean;
}

"use client"
const ClientAICybersecurityCoursePage = ({ lessonId, completed }: ClientAICybersecurityCoursePageProps) => {
    const { toast } = useToast();
    const [isCompleted, setIsCompleted] = useState(completed);

    useEffect(() => {
        setIsCompleted(completed);
    }, [completed])

    const toggleLesson = async () => {
        try {
            const res = await updateLearningProgress(
                "ai-cybersecurity",
                lessonId,
                !isCompleted
            );
            if (res?.success) {
                setIsCompleted(!isCompleted);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error updating progress",
                    description: "Please try again later.",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error updating progress",
                description: "Please try again later.",
            })
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLesson}
        >
            {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <Circle className="h-5 w-5" />
            )}
        </Button>
    )
}
