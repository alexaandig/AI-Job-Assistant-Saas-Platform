import { CREDIT_COST, FREE_TIER_CREDITS } from "@/lib/api-limits";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { TaskStatus } from "@/lib/constants";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createTask = mutation({
  args: {
    userId: v.string(),
    projectDescription: v.string(),
  },
  handler: async (ctx, args) => {
    let apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!apiLimits) {
      const newLimitsId = await ctx.db.insert("apiLimits", {
        userId: args.userId,
        credits: FREE_TIER_CREDITS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      apiLimits = await ctx.db.get(newLimitsId);
    }

    if (!apiLimits) {
      throw new ConvexError("Failed to initialize your account");
    }

    if (apiLimits.credits < CREDIT_COST.TASK_CREATION) {
      return {
        data: null,
        message: "You have run out of credits. Buy more to continue.",
        requiresUpgrade: true,
      };
    }

    const taskId = await ctx.db.insert("tasks", {
      userId: args.userId,
      projectDescription: args.projectDescription,
      status: TaskStatus.PROCESSING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.runMutation(api.apiLimit.deductCredit, {
      userId: args.userId,
      credit: CREDIT_COST.TASK_CREATION,
    });

    // AI processing
    await ctx.scheduler.runAfter(0, internal.taskAction.processTaskWithAI, {
      taskId: taskId,
      userId: args.userId,
      projectDescription: args.projectDescription,
    });

    return { data: taskId, success: true };
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    tasksList: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal(TaskStatus.PROCESSING),
        v.literal(TaskStatus.READY),
        v.literal(TaskStatus.FAILED)
      )
    ),
  },
  handler: async (ctx, args) => {
    const { taskId, ...rest } = args;
    await ctx.db.patch(taskId, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

export const getAllTasks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getTask = query({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.taskId) {
        return null;
      }
      const taskId = args.taskId as Id<"tasks">;
      return await ctx.db.get(taskId);
    } catch (error) {
      // It's better to check for specific error types
      // and handle them accordingly.
      if (error instanceof ConvexError && error.data.code === "invalid_id") {
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },
});