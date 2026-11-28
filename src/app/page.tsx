"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity, CheckSquare, Target, Flame, BarChart3,
  CalendarDays, Bell, ArrowRight, Zap, Shield, Users,
} from "lucide-react";

const features = [
  { icon: CheckSquare, title: "Task Management", description: "Organize your daily tasks with priorities, deadlines, and categories." },
  { icon: Target, title: "Goal Setting", description: "Define personal and professional goals with measurable milestones." },
  { icon: Flame, title: "Habit Tracking", description: "Build consistent habits and track your daily streaks." },
  { icon: CalendarDays, title: "Calendar View", description: "See all your tasks and deadlines in a beautiful calendar layout." },
  { icon: Bell, title: "Smart Reminders", description: "Never miss a deadline with intelligent notification reminders." },
];

const steps = [
  { num: "01", title: "Sign Up", description: "Create your free account in seconds." },
  { num: "02", title: "Set Goals", description: "Define your tasks, goals, and habits." },
  { num: "03", title: "Track Progress", description: "Monitor your productivity and achievements." },
];

export default function LandingPage() {
  return (
    <div className="app-dark min-h-screen bg-[#090D19]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#090D19]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00B4F0] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#05080B]">TrackMate</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-[#05080B] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-[#05080B] transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-[#05080B] transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium text-white bg-[#00B4F0] hover:bg-[#009DD0] px-5 py-2.5 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00B4F0]/10 text-[#00B4F0] text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> Your Productivity Companion
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#05080B] leading-tight mb-6">
            Track Your Progress,{" "}
            <span className="text-[#00B4F0]">Achieve Your Goals</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            TrackMate helps you organize tasks, set goals, build habits, and monitor your productivity — all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00B4F0] text-white font-semibold rounded-xl hover:bg-[#009DD0] transition-all shadow-lg shadow-[#00B4F0]/25"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#00B4F0] hover:text-[#00B4F0] transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 relative"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 border border-gray-100 overflow-hidden p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Tasks Done", value: "128", color: "bg-green-500/10 text-green-400" },
                { label: "Active Goals", value: "5", color: "bg-[#00B4F0]/10 text-[#00B4F0]" },
                { label: "Day Streak", value: "21", color: "bg-orange-500/10 text-orange-400" },
                { label: "Productivity", value: "87%", color: "bg-purple-500/10 text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-75">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="h-32 bg-gradient-to-r from-[#00B4F0]/10 to-[#00B4F0]/5 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-[#00B4F0]/20" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#05080B] mb-4">Everything You Need to Stay Productive</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powerful features designed to help you focus on what matters most.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00B4F0]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#00B4F0]" />
                </div>
                <h3 className="text-lg font-semibold text-[#05080B] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#05080B] mb-4">How It Works</h2>
            <p className="text-gray-600">Get started in three simple steps.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#00B4F0] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-[#05080B] mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#0F1424] rounded-3xl p-12 sm:p-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Boost Your Productivity?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join thousands of users who are tracking their progress and achieving their goals with TrackMate.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00B4F0] text-white font-semibold rounded-xl hover:bg-[#009DD0] transition-all"
              >
                Start Free Today <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Fast</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Free to Start</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00B4F0]" />
            <span className="font-semibold text-[#05080B]">TrackMate</span>
          </div>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} TrackMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
