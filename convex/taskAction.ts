"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { genAI } from "@/lib/gemini-ai";
import { api } from "./_generated/api";
import { TaskInsightStatus, TaskStatus, Role } from "@/lib/constants";

export const processTaskWithAI = internalAction({
  args: {
    taskId: v.id("tasks"),
    userId: v.string(),
    projectDescription: v.string(),
  },
  handler: async (ctx, args) => {
    let tasksList = [];
    try {
      const prompt = `
      Based on the project description below, please generate a list of actionable tasks. Return the output as a JSON object with a single key "tasks", which should be an array of strings.

      Project Description:
      "${args.projectDescription}"
      `;
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 2000,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      if (response.text) {
        const parsedResponse = JSON.parse(response.text);
        tasksList = parsedResponse.tasks;
      }
    } catch (error) {
      console.log("AI processing failed", error);
    }

    await ctx.runMutation(api.task.updateTask, {
      taskId: args.taskId,
      tasksList: tasksList,
      status: TaskStatus.READY,
    });

    // Send welcome message
    await ctx.scheduler.runAfter(0, api.taskConversation.create, {
      userId: args.userId,
      taskId: args.taskId,
      text: "Welcome to your Task Management Assistant!",
      role: Role.AI,
      status: TaskInsightStatus.COMPLETED,
    });
  },
});

export const generateTaskInsightWithAI = internalAction({
  args: {
    userId: v.string(),
    taskId: v.id("tasks"),
    text: v.string(),
    conversationId: v.id("taskConversations"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.runQuery(api.task.getTask, { taskId: args.taskId });
    if (!task) {
      // Handle case where task is not found
      return;
    }

    const prompt = `
    The user is asking for insight about their project.
    Project Description: "${task.projectDescription}"
    Generated Tasks: ${JSON.stringify(task.tasksList)}
    User's question: "${args.text}"

    Please provide a helpful response to the user's question based on the project context.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 1000,
        temperature: 0.5,
      },
    });

    await ctx.runMutation(api.taskConversation.create, {
      userId: args.userId,
      taskId: args.taskId,
      text: response.text || "Sorry, I couldn't generate a response.",
      role: Role.AI,
      status: TaskInsightStatus.COMPLETED,
    });

    await ctx.runMutation(api.taskConversation.updateConversationStatus, {
      conversationId: args.conversationId,
      status: TaskInsightStatus.COMPLETED,
    });
  },
});