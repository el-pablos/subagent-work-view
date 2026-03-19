import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Users, ListTodo, MessageSquare, Clock } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({
  value,
  suffix = "",
}) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  bgColor,
  suffix,
}) => {
  const prevValue = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 300);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-slate-800/50 border border-slate-700/50
        hover:border-slate-600/50 transition-colors
        ${flash ? "ring-2 ring-offset-2 ring-offset-slate-900" : ""}
      `}
      style={{
        boxShadow: flash ? `0 0 20px ${color}40` : undefined,
      }}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 opacity-10 ${bgColor}`}
        style={{
          background: `radial-gradient(circle at top right, ${color}30, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <span className={`text-2xl font-bold ${color}`}>
            <AnimatedCounter value={value} suffix={suffix} />
          </span>
        </div>
        <div
          className={`p-2 rounded-lg ${bgColor} bg-opacity-20`}
          style={{ color }}
        >
          {icon}
        </div>
      </div>

      {/* Pulse indicator for changes */}
      {flash && (
        <motion.div
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </motion.div>
  );
};

export interface StatsOverviewProps {
  activeAgents: number;
  runningTasks: number;
  messagesPerMinute: number;
  sessionUptime: number; // in seconds
}

const formatUptime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMinutes}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

const StatsOverview: React.FC<StatsOverviewProps> = ({
  activeAgents,
  runningTasks,
  messagesPerMinute,
  sessionUptime,
}) => {
  const [uptime, setUptime] = useState(sessionUptime);

  // Update uptime every second
  useEffect(() => {
    setUptime(sessionUptime);
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionUptime]);

  const stats = [
    {
      icon: <Users className="w-5 h-5" />,
      label: "Active Agents",
      value: activeAgents,
      color: "text-purple-400",
      bgColor: "bg-purple-500",
    },
    {
      icon: <ListTodo className="w-5 h-5" />,
      label: "Running Tasks",
      value: runningTasks,
      color: "text-blue-400",
      bgColor: "bg-blue-500",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Msgs/min",
      value: messagesPerMinute,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Uptime",
      value: uptime,
      color: "text-amber-400",
      bgColor: "bg-amber-500",
      isTime: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {stat.isTime ? (
            <div
              className={`
                relative overflow-hidden rounded-xl p-4
                bg-slate-800/50 border border-slate-700/50
                hover:border-slate-600/50 transition-colors
              `}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(circle at top right, ${stat.color.replace("text-", "")}30, transparent 70%)`,
                }}
              />
              <div className="relative flex items-start justify-between">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className={`text-2xl font-bold ${stat.color}`}>
                    {formatUptime(stat.value)}
                  </span>
                </div>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} bg-opacity-20 ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ) : (
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
