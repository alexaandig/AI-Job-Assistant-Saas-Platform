import React from "react";
import TaskResizablePanel from "../_components/TaskResizablePanel";

async function Page({ params }: any) {
  const { id } = await params;
  return (
    <div
      className="flex-1 bg-white justify-between flex
    flex-col h-screen overflow-hidden
    "
    >
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        <TaskResizablePanel taskId={id} />
      </div>
    </div>
  );
}

export default Page;