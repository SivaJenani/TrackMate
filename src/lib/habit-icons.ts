import {
  Activity, Apple, BookOpen, Bike, Brain, Camera, CheckCircle2, Clock, Coffee, Crosshair,
  Droplet, Dumbbell, Flame, Footprints, Heart, Laptop, Moon, Music, PenLine, Sunrise, Target, TreePine,
  type LucideIcon,
} from "lucide-react";

export interface HabitIconOption { name: string; label: string; icon: LucideIcon; keywords: string[] }

export const HABIT_ICONS: HabitIconOption[] = [
  { name: "reading", label: "Reading", icon: BookOpen, keywords: ["read", "book", "study", "learn"] },
  { name: "meditation", label: "Meditation", icon: Brain, keywords: ["meditat", "mindful", "breath", "yoga"] },
  { name: "deep-work", label: "Deep work", icon: Laptop, keywords: ["code", "coding", "work", "dsa", "project", "deep"] },
  { name: "exercise", label: "Exercise", icon: Dumbbell, keywords: ["gym", "workout", "exercise", "lift", "train", "pushup"] },
  { name: "water", label: "Water", icon: Droplet, keywords: ["water", "hydrat", "drink"] },
  { name: "sleep", label: "Sleep", icon: Moon, keywords: ["sleep", "bed", "nap", "rest"] },
  { name: "walking", label: "Walking", icon: Footprints, keywords: ["walk", "steps", "run", "jog"] },
  { name: "journaling", label: "Journaling", icon: PenLine, keywords: ["journal", "write", "diary", "note"] },
  { name: "streaks", label: "Streaks", icon: Flame, keywords: ["streak", "daily"] },
  { name: "wellness", label: "Wellness", icon: Heart, keywords: ["health", "wellness", "care", "vitamin", "skin"] },
  { name: "goals", label: "Goals", icon: Target, keywords: ["goal", "plan", "target"] },
  { name: "music", label: "Music", icon: Music, keywords: ["music", "guitar", "piano", "sing", "practice"] },
  { name: "photography", label: "Photography", icon: Camera, keywords: ["photo", "camera"] },
  { name: "cycling", label: "Cycling", icon: Bike, keywords: ["cycl", "bike"] },
  { name: "healthy-eating", label: "Healthy eating", icon: Apple, keywords: ["eat", "fruit", "diet", "meal", "food"] },
  { name: "coffee", label: "Coffee", icon: Coffee, keywords: ["coffee", "tea"] },
  { name: "activity", label: "Activity", icon: Activity, keywords: ["activity", "cardio", "sport"] },
  { name: "morning", label: "Morning", icon: Sunrise, keywords: ["morning", "wake", "early"] },
  { name: "focus", label: "Focus", icon: Crosshair, keywords: ["focus", "pomodoro", "distract"] },
  { name: "time", label: "Time", icon: Clock, keywords: ["time", "schedule", "routine"] },
  { name: "outdoors", label: "Outdoors", icon: TreePine, keywords: ["outdoor", "nature", "garden", "hike", "sun"] },
];

export function getHabitIcon(habit: { name: string; icon?: string | null }): LucideIcon {
  if (habit.icon) {
    const chosen = HABIT_ICONS.find((i) => i.name === habit.icon);
    if (chosen) return chosen.icon;
  }
  const n = habit.name.toLowerCase();
  const match = HABIT_ICONS.find((i) => i.keywords.some((k) => n.includes(k)));
  return match ? match.icon : CheckCircle2;
}
