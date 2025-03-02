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
    title: "Introduction to Blockchain & Smart Contracts",
    description:
      "Learn the fundamentals of blockchain technology and smart contracts",
    lessons: [
      {
        id: "l1",
        title: "Understanding Blockchain Technology",
        duration: "15 mins",
      },
      {
        id: "l2",
        title: "What are Smart Contracts?",
        duration: "10 mins",
      },
      {
        id: "l3",
        title: "Setting Up Your Solidity Development Environment",
        duration: "20 mins",
      },
    ],
  },
  {
    id: "m2",
    title: "Solidity Basics",
    description: "Master the fundamentals of Solidity programming",
    lessons: [
      {
        id: "l4",
        title: "Solidity Data Types",
        duration: "20 mins",
      },
      {
        id: "l5",
        title: "Functions and Modifiers",
        duration: "25 mins",
      },
      {
        id: "l6",
        title: "State Variables and Storage",
        duration: "20 mins",
      },
    ],
  },
  {
    id: "m3",
    title: "Advanced Smart Contract Development",
    description: "Learn advanced concepts in smart contract development",
    lessons: [
      {
        id: "l7",
        title: "Contract Inheritance and Interfaces",
        duration: "25 mins",
      },
      {
        id: "l8",
        title: "Gas Optimization Techniques",
        duration: "30 mins",
      },
      {
        id: "l9",
        title: "Security Best Practices",
        duration: "35 mins",
      },
    ],
  },
  {
    id: "m4",
    title: "Personal Security in Smart Contracts",
    description: "Learn best practices for personal security when developing and interacting with smart contracts.",
    lessons: [
      {
        id: "l10",
        title: "Wallet Security",
        duration: "20 mins",
      },
      {
        id: "l11",
        title: "Protecting Private Keys",
        duration: "25 mins",
      },
      {
        id: "l12",
        title: "Avoiding Phishing and Scams",
        duration: "15 mins",
      }
    ]
  }
];

export default async function SolidityCoursePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return (
      <div className="container py-8">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  const userId = session.user.id;

  let learningProgress = await db.learningProgress.findFirst({
    where: {
      userId,
      courseId: "solidity",
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
          <h1 className="text-4xl font-bold">Solidity Development Course</h1>
          <p className="text-muted-foreground mt-2">
            Master blockchain development with Solidity and web3
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
                      <ClientSolidityCoursePage
                        lessonId={lesson.id}
                        completed={completedLessons.includes(lesson.id)}
                      />
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

interface ClientSolidityCoursePageProps {
  lessonId: string;
  completed: boolean;
}

"use client";
const ClientSolidityCoursePage = ({
  lessonId,
  completed,
}: ClientSolidityCoursePageProps) => {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(completed);

    useEffect(() => {
        setIsCompleted(completed);
    }, [completed])

  const toggleLesson = async () => {
    try {
      const res = await updateLearningProgress("solidity", lessonId, !isCompleted);
      if (res?.success) {
        setIsCompleted(!isCompleted);
      } else {
        toast({
          variant: "destructive",
          title: "Error updating progress",
          description: "Please try again later.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating progress",
        description: "Please try again later.",
      });
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLesson}>
      {isCompleted ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <Circle className="h-5 w-5" />
      )}
    </Button>
  );
};
