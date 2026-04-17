"use client";

import { Loader2 } from "lucide-react";

const toolLabels: Record<string, { pending: string; done: string }> = {
  str_replace_editor: { pending: "Editing files...", done: "Files edited" },
  file_manager: { pending: "Managing files...", done: "Files updated" },
};

export function getToolLabel(toolName: string, done: boolean): string {
  const labels = toolLabels[toolName];
  if (!labels) return toolName;
  return done ? labels.done : labels.pending;
}

interface ToolCallLabelProps {
  toolName: string;
  done: boolean;
}

export function ToolCallLabel({ toolName, done }: ToolCallLabelProps) {
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getToolLabel(toolName, done)}</span>
    </div>
  );
}
