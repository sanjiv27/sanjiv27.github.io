import type { Metadata } from "next";
import { Research } from "@/components/research";

export const metadata: Metadata = {
  title: "Research",
  description: "Research projects and supporting materials by Sanjiv Kumaran Mohanraj.",
};

export default function ResearchPage() {
  return (
    <main className="min-h-[100dvh] py-16 pb-28">
      <Research />
    </main>
  );
}
