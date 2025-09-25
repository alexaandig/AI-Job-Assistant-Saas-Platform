"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const TaskSidebarList = (props: { userId: string }) => {
  const pathname = usePathname();
  const tasks = useQuery(api.task.getAllTasks, {
    userId: props.userId,
  });

  if (tasks === undefined) {
    return (
      <div className="w-full flex flex-col gap-3 px-2">
        <Skeleton className="h-[20px] w-full bg-gray-600" />
        <Skeleton className="h-[20px] w-full bg-gray-600" />
        <Skeleton className="h-[20px] w-full bg-gray-600" />
      </div>
    );
  }

  if (tasks?.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/80 mt-0">
        Task List
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu
          className="min-h-[180px] max-h-[350px]
             scrollbar overflow-y-auto pb-2
              "
        >
          {tasks?.map((item) => {
            const taskPageUrl = `/task/${item._id}`;
            return (
              <SidebarMenuItem key={item._id}>
                <SidebarMenuButton
                  className={cn(
                    `
            !bg-transparent !text-white hover:!bg-gray-700
            transition-colors
            `,
                    taskPageUrl === pathname && "!bg-gray-700"
                  )}
                  asChild
                >
                  <Link href={taskPageUrl} className="text-white">
                    <ListTodo className="w-4 h-4" />
                    <span>{item.projectDescription.substring(0, 20)}...</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default TaskSidebarList;