"use client";

import { config } from "@/lib/config";
import React, { useState } from "react";

interface GenerationItem {
    id: string;
    content: string;
    timestamp: number;
    model?: string;
    tokenUsage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
    };
}

interface OutputSectionProps {
    generationHistory: GenerationItem[];
    currentGenerationContent: string;
    isGenerating: boolean;
    onRegenerate: () => void;
    onSave: () => void;
    onUpdateHistory: (history: GenerationItem[]) => void;
}

export default function OutputSection({
    generationHistory,
    currentGenerationContent,
    isGenerating,
    onRegenerate,
    onSave,
    onUpdateHistory,
}: OutputSectionProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (content: string, id: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleEdit = (id: string, content: string) => {
        setEditingId(id);
        setEditedContent(content);
    };

    const handleSaveEdit = () => {
        if (editingId) {
            const updated = generationHistory.map((item) =>
                item.id === editingId
                    ? { ...item, content: editedContent }
                    : item,
            );
            onUpdateHistory(updated);
            setEditingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedContent("");
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const hasContent = generationHistory.length > 0 || isGenerating;

    return (
        <div className="bg-gray-50 p-6 space-y-6 flex-1 overflow-y-auto dark:bg-[rgb(15,15,15)]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    What I Learned
                </h2>
                <div className="flex gap-2">
                    {hasContent && !isGenerating && (
                        <>
                            <button
                                type="button"
                                onClick={onRegenerate}
                                className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors shadow-sm"
                            >
                                Regenerate
                            </button>
                            <button
                                type="button"
                                onClick={onSave}
                                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                            >
                                Save Log
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {isGenerating && (
                    <div className="border border-blue-200 rounded-md p-5 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700/50">
                        <div className="flex items-start gap-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                    Generating...
                                </div>
                                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                                    {currentGenerationContent || "Thinking..."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {hasContent
                    ? generationHistory.map((item, index) => (
                          <div
                              key={item.id}
                              className={`rounded-md p-4 border ${
                                  index === 0
                                      ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/50"
                                      : "border-gray-200 bg-gray-50 dark:bg-[rgb(20,20,20)] dark:border-gray-800"
                              }`}
                          >
                              <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                      <span
                                          className={`px-2 py-1 text-xs font-semibold rounded ${
                                              index === 0
                                                  ? "bg-blue-600 text-white dark:bg-blue-500"
                                                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                          }`}
                                      >
                                          Version{" "}
                                          {generationHistory.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatTimestamp(item.timestamp)}
                                      </span>
                                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded border border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
                                          {config.allowedModels.find(
                                              (m) => m.id === item.model,
                                          )?.icon && (
                                              <img
                                                  src={
                                                      config.allowedModels.find(
                                                          (m) =>
                                                              m.id ===
                                                              item.model,
                                                      )?.icon
                                                  }
                                                  alt="Model Icon"
                                                  className="inline-block w-4 h-4 mr-1 align-text-bottom"
                                              />
                                          )}

                                          {(config.allowedModels.find(
                                              (m) => m.id === item.model,
                                          )?.label ||
                                              item.model) ??
                                              "Unknown Model"}
                                      </span>
                                  </div>
                                  <div className="flex gap-2">
                                      <button
                                          type="button"
                                          onClick={() =>
                                              handleCopy(item.content, item.id)
                                          }
                                          className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800"
                                      >
                                          {copiedId === item.id
                                              ? "Copied!"
                                              : "Copy"}
                                      </button>
                                      {editingId === item.id ? (
                                          <>
                                              <button
                                                  type="button"
                                                  onClick={handleSaveEdit}
                                                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded transition-colors"
                                              >
                                                  Done
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={handleCancelEdit}
                                                  className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800"
                                              >
                                                  Cancel
                                              </button>
                                          </>
                                      ) : (
                                          <button
                                              type="button"
                                              onClick={() =>
                                                  handleEdit(
                                                      item.id,
                                                      item.content,
                                                  )
                                              }
                                              className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800"
                                          >
                                              Edit
                                          </button>
                                      )}
                                  </div>
                              </div>
                              {editingId === item.id ? (
                                  <textarea
                                      value={editedContent}
                                      onChange={(e) =>
                                          setEditedContent(e.target.value)
                                      }
                                      rows={8}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[rgb(30,30,30)] dark:border-gray-700 dark:text-gray-200 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                  />
                              ) : (
                                  <div className="space-y-2">
                                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm dark:text-gray-200">
                                          {item.content}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {item.content.split(/\s+/).length}{" "}
                                          words
                                          {item.tokenUsage && (
                                              <span className="ml-2">
                                                  •{" "}
                                                  {item.tokenUsage.totalTokens.toLocaleString()}{" "}
                                                  tokens (in:{" "}
                                                  {item.tokenUsage.inputTokens.toLocaleString()}
                                                  , out:{" "}
                                                  {item.tokenUsage.outputTokens.toLocaleString()}
                                                  ) • $
                                                  {item.tokenUsage.estimatedCost.toFixed(
                                                      4,
                                                  )}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              )}
                          </div>
                      ))
                    : !isGenerating && (
                          <div className="text-center py-12 text-gray-400">
                              <p className="text-sm">
                                  Fill in the form and click "Generate" to
                                  create your learning reflection
                              </p>
                          </div>
                      )}
            </div>
        </div>
    );
}
