import * as Yup from "yup";
import { RemoteConfig } from "./remoteConfig";
import deepmerge from "deepmerge";

export interface TrainingMethod {
    id: string;
    label: string;
    emoji: string;
    description: string;
}

export interface AllowedModel {
    id: string;
    model: string;
    label: string;
    icon: string;
    inputCostPerMillion: number;
    outputCostPerMillion: number;
}

export type AllowedModelId = string;

export const DEFAULT_CONFIG = {
    builtInWho: ["Me"],
    builtInWhere: ["Home", "Office", "Campus"],
    builtInActivities: [] as string[],
    validationOptions: [
        { value: "Assessor", label: "Assessor" },
        { value: "Employer", label: "Employer" },
    ],
    defaultFormValues: {
        model: "gemini-2.5" as AllowedModelId,
        who: "Me",
        where: "Home",
        validatedBy: "",
    },
    minDuration: 0.5,
    defaultUseStreaming: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "application/pdf",
    ],
    apiTimeout: 60000,
    exportJsonSpacing: 2,
    trainingMethods: [
        {
            id: "assessment",
            label: "Assessment",
            emoji: "📝",
            description: "Formal evaluation of skills or knowledge",
        },
        {
            id: "assignments",
            label: "Assignments",
            emoji: "📋",
            description: "Structured coursework or project tasks",
        },
        {
            id: "classroom",
            label: "Classroom Training",
            emoji: "🎓",
            description: "Structured group learning environment",
        },
        {
            id: "coaching",
            label: "Coaching",
            emoji: "🎯",
            description: "One-on-one guidance on specific skills",
        },
        {
            id: "conferences",
            label: "Conferences",
            emoji: "🎤",
            description: "Professional events with presentations",
        },
        {
            id: "contextualised",
            label: "Contextualised Literacy and Numeracy",
            emoji: "🔢",
            description: "Applied basic skills in work context",
        },
        {
            id: "field-visits",
            label: "Field visits",
            emoji: "🚶",
            description: "Observational learning at external location",
        },
        {
            id: "placements",
            label: "In Work Placements",
            emoji: "💼",
            description: "Supervised learning in work environment",
        },
        {
            id: "industry-visits",
            label: "Industry Visits",
            emoji: "🏭",
            description: "Site visit to observe industry practices",
        },
        {
            id: "projects",
            label: "Job Related Projects",
            emoji: "🛠️",
            description: "Practical project work relevant to role",
        },
        {
            id: "manufacturer",
            label: "Manufacturer training or learning how to use new machinery",
            emoji: "⚙️",
            description: "Technical training on equipment/tools",
        },
        {
            id: "meetings",
            label: "Meetings",
            emoji: "💬",
            description: "Structured discussion or planning session",
        },
        {
            id: "mentoring",
            label: "Mentoring",
            emoji: "🤝",
            description: "Guidance from experienced professional",
        },
        {
            id: "online",
            label: "Online Training",
            emoji: "💻",
            description: "Digital learning platforms or courses",
        },
        {
            id: "new-elements",
            label: "Performing New Elements of The Job",
            emoji: "🆕",
            description: "Learning through doing new tasks",
        },
        {
            id: "reading",
            label: "Reading",
            emoji: "📖",
            description: "Independent study of written materials",
        },
        {
            id: "research",
            label: "Research",
            emoji: "🔍",
            description: "Self-directed investigation of topics",
        },
        {
            id: "self-study",
            label: "Self-directed study",
            emoji: "📚",
            description: "Independent learning at own pace",
        },
        {
            id: "simulations",
            label: "Simulations and demonstrations",
            emoji: "🎮",
            description: "Practical demos or simulated scenarios",
        },
        {
            id: "testing",
            label: "Testing",
            emoji: "🧪",
            description: "Evaluation or trial of new approaches",
        },
    ] as TrainingMethod[],
    allowedModels: [
        {
            id: "gemini-2.5",
            model: "google/gemini-2.5-flash-lite",
            label: "Google Gemini 2.5",
            icon: "/gemini.png",
            inputCostPerMillion: 0.075,
            outputCostPerMillion: 0.3,
        },
        {
            id: "claude-3.5",
            model: "anthropic/claude-3.5-sonnet",
            label: "Claude Sonnet 3.5",
            icon: "/claude.png",
            inputCostPerMillion: 3.0,
            outputCostPerMillion: 15.0,
        },
    ] as AllowedModel[],
};

export let config = { ...DEFAULT_CONFIG };

export function applyRemoteConfig(remoteConfig: RemoteConfig | null) {
    if (!remoteConfig) {
        config = { ...DEFAULT_CONFIG };
        return;
    }

    config = remoteConfig as typeof DEFAULT_CONFIG;
}

export const getFormValidationSchema = () =>
    Yup.object({
        date: Yup.string().required("Date is required"),
        duration: Yup.number()
            .min(
                config.minDuration,
                `Duration must be at least ${config.minDuration} hours`,
            )
            .required("Duration is required"),
        method: Yup.string().required("Training method is required"),
        otherActivity: Yup.string().required("Activity is required"),
        who: Yup.string().required("Who field is required"),
        where: Yup.string().required("Where field is required"),
        validatedBy: Yup.string().required("Validated by is required"),
    });

export const STORAGE_KEYS = {
    PRESETS: "otj_presets",
    LOGS: "otj_logs",
    ACTIVITIES: "otj_saved_activities",
    WHO: "otj_saved_who",
    WHERE: "otj_saved_where",
    THEME: "otj_theme",
} as const;

export const LOG_PREVIEW_LENGTH = 100;
export const THEME_MODES = ["light", "dark", "system"] as const;
export const DEFAULT_THEME = "system";
export const DATE_FORMAT = "yyyy-MM-dd";
export const TIME_FORMAT = "HH:mm";

export const getExportFileName = () =>
    `otj-logs-${new Date().toISOString().split("T")[0]}.json`;
