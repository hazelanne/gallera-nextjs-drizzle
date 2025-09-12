"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/Header";
import EventTab from "@/components/admin/EventTab";
import FundsTab from "@/components/admin/FundsTab";

export default function AdminScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "funds">("events");

  async function showEventPage() {
    setActiveTab("events");
  }

  async function showFundsPage() {
    setActiveTab("funds");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen p-4 space-y-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <Header
          onShowEvent={() => showEventPage()}
          onShowFunds={() => showFundsPage()}
          onLogout={() => handleLogout()}
        />

        {/* Tab content */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {activeTab === "events" && <EventTab />}
            {activeTab === "funds" && <FundsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
