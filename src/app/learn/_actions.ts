"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateLearningProgress(
  courseId: string,
  lessonId: string,
  completed: boolean
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  let learningProgress = await db.learningProgress.findFirst({
    where: {
      userId,
      courseId,
    },
  });

  let completedLessons: string[] = [];
  if (learningProgress?.data) {
    completedLessons = JSON.parse(learningProgress.data);
  }

  if (completed) {
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }
  } else {
    completedLessons = completedLessons.filter((id) => id !== lessonId);
  }

  const totalLessons = 12; // Replace with actual total lessons for the course
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  if (!learningProgress) {
    learningProgress = await db.learningProgress.create({
      data: {
        userId,
        courseId,
        progress,
        data: JSON.stringify(completedLessons),
      },
    });
  } else {
    await db.learningProgress.update({
      where: {
        id: learningProgress.id,
      },
      data: {
        progress,
        data: JSON.stringify(completedLessons),
      },
    });
  }

  revalidatePath(`/learn/${courseId}`);
  return { success: true };
}
