"use client";

import React, { useState } from "react";
import { Preset, DEFAULT_PRESETS, FormData } from "@/lib/types";

interface PresetManagerProps {
    presets: Preset[];
    onLoadPreset: (preset: Preset) => void;
    onSavePreset: (preset: Preset) => void;
    onDeletePreset: (id: string) => void;
    currentFormData: FormData;
}

export default function PresetManager({
    presets,
    onLoadPreset,
    onSavePreset,
    onDeletePreset,
    currentFormData,
}: PresetManagerProps) {
    const [showModal, setShowModal] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetEmoji, setNewPresetEmoji] = useState("📝");

    const handleSaveNewPreset = () => {
        if (!newPresetName.trim()) return;

        const newPreset: Preset = {
            id: Date.now().toString(),
            name: newPresetName.trim(),
            emoji: newPresetEmoji,
            method: currentFormData.method,
            activityTypes: currentFormData.activityTypes,
            who: currentFormData.who,
            where: currentFormData.where,
            otherActivity: currentFormData.otherActivity,
        };

        onSavePreset(newPreset);
        setNewPresetName("");
        setNewPresetEmoji("📝");
        setShowModal(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                    Quick Presets
                </h2>
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                    + Create Preset
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                    <div key={preset.id} className="relative group">
                        <button
                            type="button"
                            onClick={() => onLoadPreset(preset)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all shadow-sm hover:shadow-md border border-blue-200"
                        >
                            <span className="text-lg mr-2">{preset.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">
                                {preset.name}
                            </span>
                        </button>
                        {!DEFAULT_PRESETS.find((p) => p.id === preset.id) && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePreset(preset.id);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center hover:bg-red-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Preset Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            Create New Preset
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preset Name
                                </label>
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) =>
                                        setNewPresetName(e.target.value)
                                    }
                                    placeholder="e.g., React Workshop"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Emoji
                                </label>
                                <input
                                    type="text"
                                    value={newPresetEmoji}
                                    onChange={(e) =>
                                        setNewPresetEmoji(e.target.value)
                                    }
                                    placeholder="📝"
                                    maxLength={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                                <p className="font-medium mb-1">
                                    This preset will save:
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        Training method:{" "}
                                        {currentFormData.method || "None"}
                                    </li>
                                    <li>
                                        Activity:{" "}
                                        {currentFormData.otherActivity ||
                                            "None"}
                                    </li>
                                    <li>
                                        Who: {currentFormData.who || "None"}
                                    </li>
                                    <li>
                                        Where: {currentFormData.where || "None"}
                                    </li>
                                    <li>
                                        Activities:{" "}
                                        {currentFormData.activityTypes.length}{" "}
                                        items
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveNewPreset}
                                disabled={!newPresetName.trim()}
                                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                            >
                                Create Preset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
