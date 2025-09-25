import React from "react";
import TaskList from "./TaskList";

const RightSidePanel = (props: { taskId: string }) => {
  return (
    <div className="flex w-full h-screen overflow-y-auto">
      <div className="w-full">
        {/* {Task List} */}
        <TaskList taskId={props.taskId} />
      </div>
    </div>
  );
};

export default RightSidePanel;