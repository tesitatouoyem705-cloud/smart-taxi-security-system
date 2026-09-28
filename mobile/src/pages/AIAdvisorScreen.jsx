import React from "react";
import MobileAIGuardian from "../components/ai/MobileAIGuardian";

export default function AIAdvisorScreen() {
  return (
    <div className="flex-1 p-4 pb-20 flex flex-col h-[calc(100dvh-130px)]">
      <MobileAIGuardian embedded={true} />
    </div>
  );
}
