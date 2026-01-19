import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ConfigProvider from "@/components/ConfigProvider";

export const metadata: Metadata = {
    title: "OTJ Log LLM Assistant",
    description:
        "An AI assistant to help you fill out your on-the-job training logs.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`antialiased`}>
                <ThemeProvider>
                    <ConfigProvider>
                        <div className="[@media(min-width:1564px)]:px-8 min-h-screen">
                            {children}
                        </div>
                    </ConfigProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
