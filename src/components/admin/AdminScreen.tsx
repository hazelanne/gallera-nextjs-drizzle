"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import EventTab from "@/components/admin/EventTab";
import FundsTab from "@/components/admin/FundsTab";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"events" | "funds">(
    "events"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { key: "events", label: "Event" },
    { key: "funds", label: "Funds" },
  ] as const;
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gallera Admin</h1>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Tab navigation */}
      <div className="border-b pb-2">
        <div className="hidden md:flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="flex flex-col gap-2 mt-2 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setMenuOpen(false);
                }}
                className={`px-4 py-2 rounded ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {activeTab === "events" && <EventTab />}
          {activeTab === "funds" && <FundsTab />}
        </div>
      </div>
    </div>
  );
}
