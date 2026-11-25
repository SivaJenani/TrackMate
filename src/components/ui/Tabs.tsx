"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn("flex gap-1 p-1 bg-gray-100 rounded-xl", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
            activeTab === tab.id ? "text-[#00B4F0]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
