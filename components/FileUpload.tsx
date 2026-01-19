"use client";

import React, { useState } from "react";
import { UploadedFile } from "@/lib/types";
import dynamic from "next/dynamic";

const DocViewer = dynamic(() => import("@cyntler/react-doc-viewer"), {
    ssr: false,
});

interface FileUploadProps {
    files: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
}

// Modal component for full document view
function DocumentModal({
    file,
    onClose,
}: {
    file: UploadedFile | null;
    onClose: () => void;
}) {
    if (!file) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[rgb(30,30,30)] rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-clip"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[rgb(61,61,61)]">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {file.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {file.type} • {formatFileSize(file.size)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-[rgb(40,40,40)] rounded-full transition-colors"
                        title="Close"
                    >
                        <svg
                            className="w-6 h-6 text-gray-600 dark:text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {file.type.startsWith("image/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-white dark:bg-black p-4 dark:bg-[url(/noise.png)] bg-[url(/noise-light.png)]">
                            <img
                                src={file.dataUrl}
                                alt={file.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ) : file.type === "application/pdf" ? (
                        <iframe
                            src={file.dataUrl}
                            className="w-full h-full border-0"
                            title={file.name}
                        />
                    ) : (
                        <DocViewer
                            documents={[
                                { uri: file.dataUrl, fileName: file.name },
                            ]}
                            config={{
                                header: {
                                    disableHeader: false,
                                    disableFileName: false,
                                },
                            }}
                            style={{ height: "100%" }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Image preview component
const ImagePreview = React.memo(
    ({ dataUrl, name }: { dataUrl: string; name: string }) => {
        return (
            <img
                src={dataUrl}
                alt={name}
                className="w-full h-full object-cover"
            />
        );
    },
);
ImagePreview.displayName = "ImagePreview";

// Document preview using react-doc-viewer (supports PDF, DOCX, XLSX, etc.)
const DocumentPreview = React.memo(({ file }: { file: UploadedFile }) => {
    return (
        <div className="w-full h-full overflow-hidden pointer-events-none">
            <DocViewer
                documents={[{ uri: file.dataUrl, fileName: file.name }]}
                config={{
                    loadingRenderer: {
                        overrideComponent: () => <></>,
                    },
                    header: {
                        disableHeader: true,
                        disableFileName: true,
                    },
                }}
                style={{ height: 80 }}
            />
        </div>
    );
});
DocumentPreview.displayName = "DocumentPreview";

export default function FileUpload({ files, onChange }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB

        const uploadedFiles: UploadedFile[] = [];

        for (const file of newFiles) {
            if (file.size > MAX_SIZE) {
                alert(`${file.name} is too large. Max size is 10MB.`);
                continue;
            }

            // Read file as data URL for preview
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            const id = `${Date.now()}-${Math.random()}`;
            uploadedFiles.push({
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl,
            });
        }

        onChange([...files, ...uploadedFiles]);
        e.target.value = ""; // Reset input
    };

    const handleRemoveFile = (fileId: string) => {
        onChange(files.filter((f) => f.id !== fileId));
    };

    const handleFileClick = (file: UploadedFile) => {
        setSelectedFile(file);
    };

    const formatFileSizeLocal = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
        );
    };

    const getFileIcon = React.useCallback((type: string) => {
        if (type.startsWith("image/")) return "🖼️";
        if (type === "application/pdf") return "📄";
        if (
            type.includes("word") ||
            type.includes("document") ||
            type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
            return "📝";
        if (
            type.includes("presentation") ||
            type.includes("powerpoint") ||
            type ===
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
            return "📊";
        if (
            type.includes("sheet") ||
            type.includes("excel") ||
            type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
            return "📗";
        if (type.includes("text")) return "📃";
        return "📎";
    }, []);

    const renderPreview = React.useCallback(
        (file: UploadedFile) => {
            // Image preview
            if (file.type.startsWith("image/")) {
                return <ImagePreview dataUrl={file.dataUrl} name={file.name} />;
            }

            // PDF and document preview using react-doc-viewer
            if (
                file.type === "application/pdf" ||
                file.type.includes("word") ||
                file.type.includes("document") ||
                file.type.includes("presentation") ||
                file.type.includes("sheet") ||
                file.type.includes("excel") ||
                file.type.includes("officedocument")
            ) {
                return <DocumentPreview file={file} />;
            }

            // Document icons with better styling
            return (
                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <span className="text-[8px] text-gray-500 font-medium uppercase tracking-wide">
                        {file.name.split(".").pop()}
                    </span>
                </div>
            );
        },
        [getFileIcon],
    );

    return (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <DocumentModal
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
            />

            <div className="flex mb-4 flex-col">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Supporting Attachments
                </h3>
                <small className="text-gray-600 dark:text-gray-400">
                    Add any relevant files to support your record
                </small>
            </div>

            {/* File Upload Area */}
            <div className="relative">
                <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-[rgb(20,20,20)] transition-all duration-200">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Screenshots, PDFs, slides, documents (Max 10
                                    MB each)
                                </p>
                            </div>
                        </div>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>
            </div>

            {/* File Previews Grid */}
            {files.length > 0 && (
                <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            title={file.name}
                            className="relative group bg-gray-50 dark:bg-[rgb(15,15,15)] rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => handleFileClick(file)}
                        >
                            {/* Preview */}
                            <div className="h-20 bg-gray-100 dark:bg-[rgb(20,20,20)] flex items-center justify-center overflow-hidden">
                                {renderPreview(file)}
                            </div>

                            {/* File Info */}
                            <div className="p-1.5 flex gap-0.5 flex-col">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate leading-tight">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSizeLocal(file.size)}
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(file.id);
                                }}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                title="Remove file"
                            >
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
