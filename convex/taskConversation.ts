import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { TaskInsightStatus, Role } from "@/lib/constants";
import { CREDIT_COST } from "@/lib/api-limits";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    userId: v.string(),
    taskId: v.id("tasks"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    status: v.union(
      v.literal(TaskInsightStatus.PENDING),
      v.literal(TaskInsightStatus.COMPLETED),
      v.literal(TaskInsightStatus.FAILED)
    ),
  },
  handler: async (ctx, args) => {
    const { userId, taskId, text, role, status } = args;
    const conversationId = await ctx.db.insert("taskConversations", {
      userId,
      taskId,
      text,
      role,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (role === Role.USER) {
      await ctx.runMutation(api.apiLimit.deductCredit, {
        userId,
        credit: CREDIT_COST.TASK_CHAT_MESSAGE,
      });

      // AI processing
      await ctx.scheduler.runAfter(
        0,
        internal.taskAction.generateTaskInsightWithAI,
        {
          userId,
          taskId,
          text,
          conversationId,
        }
      );
    }

    return conversationId;
  },
});

export const getConversationsByTask = query({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const taskId = args.taskId as Id<"tasks">;
      return await ctx.db
        .query("taskConversations")
        .withIndex("by_task", (q) => q.eq("taskId", taskId))
        .collect();
    } catch (e) {
      return [];
    }
  },
});

export const updateConversationStatus = mutation({
  args: {
    conversationId: v.id("taskConversations"),
    status: v.union(
      v.literal(TaskInsightStatus.PENDING),
      v.literal(TaskInsightStatus.COMPLETED),
      v.literal(TaskInsightStatus.FAILED)
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});