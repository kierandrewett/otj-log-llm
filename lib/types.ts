import { AllowedModelId } from "./config";

// Token Usage
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
}

// Uploaded File
export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    dataUrl: string;
}

// Form Data
export interface FormData {
    model: AllowedModelId;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    method: string;
    otherActivity: string;
    who: string;
    where: string;
    validatedBy: string;
    prompt: string;
    activityTypes: string[];
    uploadedFiles: UploadedFile[];
    includeHistory: boolean;
}

// API Request/Response
export interface GenerateRequest {
    model: AllowedModelId;
    date: string;
    duration: number;
    method?: string;
    otherActivity?: string;
    who: string;
    where: string;
    validatedBy?: string;
    prompt?: string;
    activityTypes?: string[];
    uploadedFiles?: UploadedFile[];
    previousGenerations?: string[];
}

export interface GenerateResponse {
    success: boolean;
    content?: {
        whatLearned: string;
        suggestedMethod?: string;
        suggestedOtherActivity?: string;
    };
    tokenUsage?: TokenUsage;
    error?: string;
}

// Presets
export interface Preset {
    id: string;
    name: string;
    emoji: string;
    method: string;
    activityTypes: string[];
    who?: string;
    where?: string;
    otherActivity?: string;
}

// Saved Log
export interface SavedLog {
    id: string;
    timestamp: number;
    formData: FormData;
    whatLearned: string;
    generatedVersions?: Array<{
        id: string;
        content: string;
        timestamp: number;
        model: string;
        tokenUsage?: TokenUsage;
    }>;
}

// Default Presets
export const DEFAULT_PRESETS: Preset[] = [
    {
        id: "university",
        name: "University Lecture",
        emoji: "🎓",
        method: "classroom",
        activityTypes: [
            "Attended lecture",
            "Took notes",
            "Participated in discussions",
        ],
        who: "University Lecturer",
        where: "Campus",
    },
    {
        id: "react-dev",
        name: "React Development",
        emoji: "💻",
        method: "self-study",
        activityTypes: [
            "Built React components",
            "Learned hooks",
            "Practiced state management",
        ],
        who: "Me",
        where: "Home",
    },
    {
        id: "technical-reading",
        name: "Technical Reading",
        emoji: "📚",
        method: "reading",
        activityTypes: [
            "Read documentation",
            "Studied examples",
            "Researched best practices",
        ],
        who: "Me",
        where: "Home",
    },
    {
        id: "project-work",
        name: "Project Work",
        emoji: "🛠️",
        method: "projects",
        activityTypes: [
            "Planned project",
            "Implemented features",
            "Tested functionality",
        ],
        who: "Team Lead",
        where: "Office",
    },
    {
        id: "mentoring",
        name: "Mentoring Session",
        emoji: "👥",
        method: "mentoring",
        activityTypes: [
            "Discussed career goals",
            "Reviewed progress",
            "Received guidance",
        ],
        who: "Mentor",
        where: "Office",
    },
];

// Validation
export interface ValidationError {
    field: string;
    message: string;
}

export function validateFormData(formData: FormData): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!formData.date) {
        errors.push({ field: "date", message: "Date is required" });
    }

    if (formData.duration <= 0) {
        errors.push({
            field: "duration",
            message: "Duration must be greater than 0",
        });
    }

    if (!formData.method) {
        errors.push({
            field: "method",
            message: "Training method is required",
        });
    }

    if (!formData.otherActivity.trim()) {
        errors.push({
            field: "otherActivity",
            message: "Activity is required",
        });
    }

    if (!formData.who.trim()) {
        errors.push({ field: "who", message: "Who field is required" });
    }

    if (!formData.where.trim()) {
        errors.push({ field: "where", message: "Where field is required" });
    }

    if (!formData.validatedBy) {
        errors.push({
            field: "validatedBy",
            message: "Validated by is required",
        });
    }

    // Time validation
    if (formData.startTime && formData.endTime) {
        const [startHour, startMin] = formData.startTime.split(":").map(Number);
        const [endHour, endMin] = formData.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (startMinutes >= endMinutes) {
            errors.push({
                field: "endTime",
                message: "End time must be after start time",
            });
        }
    }

    return errors;
}
