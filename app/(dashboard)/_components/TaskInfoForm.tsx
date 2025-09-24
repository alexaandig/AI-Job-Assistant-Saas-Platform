"use client";
import React, { useRef, useState } from "react";
import {
  AutosizeTextarea,
  AutosizeTextAreaRef,
} from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Loader, SendIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSignInModal } from "@/hooks/use-signin-modal";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

const TaskInfoForm = () => {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { open: openSignInModal } = useSignInModal();
  const { openModal } = useUpgradeModal();

  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<AutosizeTextAreaRef>(null);

  const createTask = useMutation(api.task.createTask);

  const handleChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setProjectDescription(e.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isSignedIn || !user) {
      openSignInModal();
      return;
    }

    if (!projectDescription.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createTask({
        userId: user.id,
        projectDescription: projectDescription,
      });
      if (!response.data && response.requiresUpgrade) {
        // uggradModal hook
        openModal();
        return;
      }
      router.push(`task/${response.data}`);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError && error.data?.message
          ? error.data.message
          : "Failed to create Task";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div
      className="pt-3 mb-3 z-10 mx-auto
  w-full max-w-2xl
    "
    >
      <div
        className="flex flex-col border-[0.5px]
          border-zine-300 mx-2 md:mx-0 items-stretch
          transition-all duration-200
          relative shadow-md
          rounded-2xl bg-white
          "
      >
        <div className="flex flex-col gap-3.5 m-3.5">
          <AutosizeTextarea
            ref={textareaRef}
            rows={3}
            maxHeight={180}
            minHeight={100}
            value={projectDescription}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            placeholder="Paste your project description here..."
            className="resize-none pr-12 text-base !border-0
                      font-normal !shadow-none !ring-0
                      focus-visible:!ring-offset-0
                      focus-visible:!ring-0
                      "
          />
        </div>
        <div
          className="flex w-full items-center
              justify-end px-5 py-2
              "
        >
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={isSubmitting || !projectDescription?.trim()}
          >
            {isSubmitting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskInfoForm;