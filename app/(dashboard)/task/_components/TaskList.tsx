"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "@/convex/_generated/api";
import { TaskStatus } from "@/lib/constants";
import { Loader2 } from "lucide-react";

const TaskList = (props: { taskId: string }) => {
  const task = useQuery(api.task.getTask, { taskId: props.taskId });

  if (!task) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (task.status === TaskStatus.PROCESSING) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
        <p className="ml-2">AI is generating tasks...</p>
      </div>
    );
  }

  if (task.status === TaskStatus.FAILED) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <p>Failed to generate tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Generated Tasks</h2>
      <ul className="list-disc pl-5">
        {task.tasksList?.map((task, index) => (
          <li key={index} className="mb-2">
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;