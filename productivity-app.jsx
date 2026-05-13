import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, BarChart3, Flame, BookOpen,
  Target, Settings, Moon, Sun, Download, Plus, X, ChevronRight,
  TrendingUp, Zap, Clock, Dumbbell, Code, Send, FileText,
  Briefcase, Brain, AlertCircle, Star, Trophy, Calendar,
  ChevronDown, Edit3, Save, Trash2, Activity, Menu, Bell,
  Coffee, ArrowUp, ArrowDown, Minus, Check, SkipForward
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const HABITS = [
  { id: "dms", label: "DMs Sent", icon: Send, unit: "msgs", goal: 10, color: "#6366f1" },
  { id: "dsa", label: "DSA Practice", icon: Brain, unit: "hrs", goal: 2, color: "#8b5cf6" },
  { id: "webdev", label: "Web Dev", icon: Code, unit: "hrs", goal: 2, color: "#06b6d4" },
  { id: "workout", label: "Workout", icon: Dumbbell, unit: "done", goal: 1, color: "#10b981" },
  { id: "content", label: "Content Posted", icon: FileText, unit: "posts", goal: 1, color: "#f59e0b" },
  { id: "portfolio", label: "Portfolio Work", icon: Briefcase, unit: "hrs", goal: 1, color: "#ec4899" },
  { id: "deepwork", label: "Deep Work", icon: Zap, unit: "hrs", goal: 4, color: "#f97316" },
  { id: "sleep", label: "Sleep Hours", icon: Coffee, unit: "hrs", goal: 7, color: "#3b82f6" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const generateFreshData = () => {
  const key = new Date().toISOString().split("T")[0];
  return {
    [key]: {
      habits: {},
      journal: { did: "", distracted: "", learned: "", improve: "" },
      notes: "",
      missedReasons: {},
    },
  };
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const calcCompletion = (dayData) => {
  if (!dayData) return 0;
  let score = 0;
  HABITS.forEach(h => {
    const val = dayData.habits?.[h.id] ?? 0;
    if (val >= h.goal) score++;
    else if (val > 0) score += val / h.goal;
  });
  return Math.round((score / HABITS.length) * 100);
};

const calcStreak = (allData) => {
  const d = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().split("T")[0];
    const pct = calcCompletion(allData[key]);
    if (pct >= 60) streak++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const GlowCard = ({ children, className = "", gradient = false, onClick }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: onClick ? 1.02 : 1, y: onClick ? -2 : 0 }}
    transition={{ type: "spring", stiffness: 300 }}
    className={`relative rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden ${gradient ? "bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent" : "bg-white/5"} ${className} ${onClick ? "cursor-pointer" : ""}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    {children}
  </motion.div>
);

const CircularProgress = ({ pct, size = 120, stroke = 10, color = "#6366f1", label, sublabel }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{pct}%</span>
        </div>
      </div>
      {label && <p className="text-sm font-semibold text-white/80">{label}</p>}
      {sublabel && <p className="text-xs text-white/40">{sublabel}</p>}
    </div>
  );
};

const AnimatedNumber = ({ value, suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (end === 0) { setDisplay(0); return; }
    const dur = 1000;
    const step = dur / 60;
    const inc = end / (dur / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
};

const GlowBar = ({ pct, color }) => (
  <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(pct, 100)}%` }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    />
  </div>
);

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tracking", label: "Daily Tracking", icon: CheckSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "goals", label: "Goals", icon: Target },
];

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

const Dashboard = ({ allData, streak }) => {
  const todayData = allData[today()];
  const pct = calcCompletion(todayData);
  const todayDate = new Date();

  const weekData = DAYS.map((day, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return { day, score: calcCompletion(allData[key]) };
  });

  const statsCards = [
    { label: "Current Streak", value: streak, suffix: " days", icon: Flame, color: "#f97316", bg: "from-orange-500/20" },
    { label: "Today's Score", value: pct, suffix: "%", icon: TrendingUp, color: "#10b981", bg: "from-emerald-500/20" },
    { label: "Tasks Done", value: HABITS.filter(h => (todayData?.habits?.[h.id] ?? 0) >= h.goal).length, suffix: `/${HABITS.length}`, icon: CheckSquare, color: "#6366f1", bg: "from-indigo-500/20" },
    { label: "Deep Work", value: todayData?.habits?.deepwork ?? 0, suffix: " hrs", icon: Zap, color: "#f59e0b", bg: "from-amber-500/20" },
  ];

  const customTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-900/90 border border-white/20 rounded-xl px-3 py-2 text-sm">
          <p className="text-white font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
            {todayDate.toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <h1 className="text-3xl font-black text-white mt-1">
            {todayDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {pct === 0 ? "🚀 Day 1 starts now. Fill in your first entry!" : pct >= 80 ? "🔥 Crushing it today!" : pct >= 50 ? "⚡ Good progress, keep going!" : "💪 Time to lock in, let's go!"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Weekly Score</p>
          <p className="text-2xl font-black text-white">{Math.round(weekData.reduce((a,b)=>a+b.score,0)/7)}%</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlowCard className={`p-4 bg-gradient-to-br ${s.bg} to-transparent`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs font-medium mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-white">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                  </p>
                </div>
                <div className="p-2 rounded-xl" style={{ background: `${s.color}20` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Progress */}
        <GlowCard className="p-6 lg:col-span-1" gradient>
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Today's Progress</h3>
          <div className="flex justify-center mb-6">
            <CircularProgress pct={pct} size={140} color="#6366f1" label="Completion" />
          </div>
          <div className="space-y-3">
            {HABITS.slice(0, 5).map(h => {
              const val = todayData?.habits?.[h.id] ?? 0;
              const p = Math.min((val / h.goal) * 100, 100);
              return (
                <div key={h.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70 flex items-center gap-1">
                      <h.icon size={10} style={{ color: h.color }} />
                      {h.label}
                    </span>
                    <span className="text-white/50">{val}/{h.goal}</span>
                  </div>
                  <GlowBar pct={p} color={h.color} />
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Weekly Chart */}
        <GlowCard className="p-6 lg:col-span-2">
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Weekly Consistency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#scoreGrad)" dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#818cf8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Habit Grid */}
      <GlowCard className="p-6">
        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Habit Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {HABITS.map(h => {
            const val = todayData?.habits?.[h.id] ?? 0;
            const done = val >= h.goal;
            const partial = val > 0 && !done;
            return (
              <div key={h.id} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${done ? "" : partial ? "opacity-70" : "opacity-30"}`}
                  style={{ background: done ? `${h.color}30` : partial ? `${h.color}15` : "rgba(255,255,255,0.05)", border: `1px solid ${done ? h.color : "rgba(255,255,255,0.1)"}`, boxShadow: done ? `0 0 16px ${h.color}40` : "none" }}>
                  {done ? <Check size={20} style={{ color: h.color }} /> : <h.icon size={20} style={{ color: done ? h.color : partial ? h.color : "rgba(255,255,255,0.3)" }} />}
                </div>
                <p className="text-[10px] text-center text-white/50 leading-tight">{h.label}</p>
              </div>
            );
          })}
        </div>
      </GlowCard>

      {/* Motivation Quote */}
      <GlowCard className="p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" gradient>
        <div className="flex items-center gap-3">
          <Star size={20} className="text-amber-400 flex-shrink-0" />
          <p className="text-white/80 text-sm italic">"Discipline is choosing between what you want now and what you want most."</p>
        </div>
      </GlowCard>
    </div>
  );
};

// ─── DAILY TRACKING ───────────────────────────────────────────────────────────

const DailyTracking = ({ allData, setAllData }) => {
  const key = today();
  const dayData = allData[key] || { habits: {}, notes: "", missedReasons: {} };
  const [editNote, setEditNote] = useState(dayData.notes || "");
  const [showReasonFor, setShowReasonFor] = useState(null);
  const [reasonText, setReasonText] = useState("");

  const update = (habitId, value) => {
    const updated = {
      ...allData,
      [key]: {
        ...dayData,
        habits: { ...dayData.habits, [habitId]: value },
      },
    };
    setAllData(updated);
    save("ptrack_data", updated);
  };

  const saveNote = () => {
    const updated = { ...allData, [key]: { ...dayData, notes: editNote } };
    setAllData(updated);
    save("ptrack_data", updated);
  };

  const saveReason = (habitId) => {
    const updated = {
      ...allData,
      [key]: { ...dayData, missedReasons: { ...dayData.missedReasons, [habitId]: reasonText } },
    };
    setAllData(updated);
    save("ptrack_data", updated);
    setShowReasonFor(null);
    setReasonText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Daily Tracking</h1>
        <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      <GlowCard className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr,100px,100px,80px] gap-4 px-6 py-3 bg-white/5 text-xs font-bold text-white/40 uppercase tracking-wider">
          <span>Habit</span>
          <span className="text-center">Value</span>
          <span className="text-center">Goal</span>
          <span className="text-center">Status</span>
        </div>

        <div className="divide-y divide-white/5">
          {HABITS.map((h, i) => {
            const val = dayData.habits?.[h.id] ?? "";
            const numVal = Number(val) || 0;
            const done = numVal >= h.goal;
            const missed = val !== "" && numVal === 0;
            const partial = numVal > 0 && !done;

            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[1fr,100px,100px,80px] gap-4 items-center px-6 py-4 hover:bg-white/3 transition-colors"
              >
                {/* Habit */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${h.color}20`, border: `1px solid ${h.color}40` }}>
                    <h.icon size={14} style={{ color: h.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{h.label}</p>
                    <p className="text-white/30 text-xs">{h.unit}</p>
                  </div>
                </div>

                {/* Input */}
                <div className="flex justify-center">
                  {h.unit === "done" ? (
                    <button
                      onClick={() => update(h.id, numVal === 1 ? 0 : 1)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${done ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 bg-white/5"}`}
                    >
                      {done ? <Check size={14} className="text-emerald-400" /> : <Minus size={14} className="text-white/30" />}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => update(h.id, Math.max(0, numVal - (h.unit === "hrs" ? 0.5 : 1)))}
                        className="w-6 h-6 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 flex items-center justify-center text-xs">
                        <Minus size={10} />
                      </button>
                      <input
                        type="number"
                        value={val}
                        onChange={e => update(h.id, e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-12 text-center bg-white/10 rounded-lg py-1 text-white text-sm font-bold border border-white/10 focus:border-indigo-500 focus:outline-none"
                        placeholder="0"
                        step={h.unit === "hrs" ? 0.5 : 1}
                        min={0}
                      />
                      <button onClick={() => update(h.id, numVal + (h.unit === "hrs" ? 0.5 : 1))}
                        className="w-6 h-6 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 flex items-center justify-center text-xs">
                        <Plus size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Goal */}
                <div className="text-center">
                  <span className="text-white/40 text-sm">{h.goal} {h.unit}</span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-1">
                  {val === "" ? (
                    <span className="text-white/20 text-xs">—</span>
                  ) : done ? (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Check size={10} />Done</span>
                  ) : partial ? (
                    <button onClick={() => { setShowReasonFor(h.id); setReasonText(dayData.missedReasons?.[h.id] || ""); }}
                      className="text-amber-400 text-xs flex items-center gap-1 hover:text-amber-300">
                      <AlertCircle size={10} />Partial
                    </button>
                  ) : (
                    <button onClick={() => { setShowReasonFor(h.id); setReasonText(dayData.missedReasons?.[h.id] || ""); }}
                      className="text-red-400 text-xs flex items-center gap-1 hover:text-red-300">
                      <X size={10} />Missed
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlowCard>

      {/* Notes */}
      <GlowCard className="p-6">
        <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Day Notes</h3>
        <textarea
          value={editNote}
          onChange={e => setEditNote(e.target.value)}
          onBlur={saveNote}
          placeholder="Add any notes, reflections, or context for today..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/80 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-white/20 h-28"
        />
      </GlowCard>

      {/* Missed Reason Modal */}
      <AnimatePresence>
        {showReasonFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReasonFor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-white font-bold mb-1">Why did you miss this?</h3>
              <p className="text-white/40 text-sm mb-4">{HABITS.find(h => h.id === showReasonFor)?.label}</p>
              <textarea
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
                placeholder="Be honest with yourself..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/80 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-white/20 h-28 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setShowReasonFor(null)} className="flex-1 py-2 rounded-xl border border-white/20 text-white/60 text-sm hover:border-white/40 transition-colors">Cancel</button>
                <button onClick={() => saveReason(showReasonFor)} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors">Save Reason</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

const Analytics = ({ allData }) => {
  const keys = Object.keys(allData).sort();
  const weekKeys = keys.slice(-7);

  const weeklyData = weekKeys.map(k => ({
    day: DAYS[new Date(k).getDay() === 0 ? 6 : new Date(k).getDay() - 1],
    score: calcCompletion(allData[k]),
    dms: allData[k]?.habits?.dms || 0,
    deepwork: allData[k]?.habits?.deepwork || 0,
    dsa: allData[k]?.habits?.dsa || 0,
    webdev: allData[k]?.habits?.webdev || 0,
  }));

  const habitAverages = HABITS.map(h => ({
    name: h.label.split(" ")[0],
    avg: Math.round(weekKeys.reduce((a, k) => a + (allData[k]?.habits?.[h.id] || 0), 0) / weekKeys.length * 10) / 10,
    goal: h.goal,
    color: h.color,
    pct: Math.min(Math.round(weekKeys.reduce((a, k) => a + Math.min((allData[k]?.habits?.[h.id] || 0) / h.goal, 1), 0) / weekKeys.length * 100), 100),
  }));

  const pieData = habitAverages.map(h => ({ name: h.name, value: h.pct, color: HABITS.find(x => x.label.startsWith(h.name))?.color }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-900/95 border border-white/20 rounded-xl p-3 text-xs">
          <p className="text-white/60 mb-1">{label}</p>
          {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>)}
        </div>
      );
    }
    return null;
  };

  const heatmapData = keys.map(k => ({ date: k, score: calcCompletion(allData[k]) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Your performance insights</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Daily Score", value: Math.round(weekKeys.reduce((a,k) => a + calcCompletion(allData[k]), 0) / weekKeys.length) + "%", color: "#6366f1" },
          { label: "Total DMs Sent", value: weekKeys.reduce((a,k) => a + (allData[k]?.habits?.dms || 0), 0), color: "#8b5cf6" },
          { label: "Deep Work Hrs", value: Math.round(weekKeys.reduce((a,k) => a + (allData[k]?.habits?.deepwork || 0), 0)), color: "#f59e0b" },
          { label: "Perfect Days", value: weekKeys.filter(k => calcCompletion(allData[k]) >= 90).length, color: "#10b981" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GlowCard className="p-4">
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Time Spent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-6">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Weekly Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Score" radius={[6,6,0,0]}>
                {weeklyData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 80 ? "#6366f1" : entry.score >= 50 ? "#8b5cf6" : "#4338ca"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-6">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Time Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="deepwork" name="Deep Work" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
              <Line type="monotone" dataKey="dsa" name="DSA" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
              <Line type="monotone" dataKey="webdev" name="Web Dev" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Habit Completion Pie + Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowCard className="p-6">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Habit Completion %</h3>
          <div className="space-y-3">
            {habitAverages.map(h => (
              <div key={h.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{h.name}</span>
                  <span className="text-white/50">{h.pct}%</span>
                </div>
                <GlowBar pct={h.pct} color={HABITS.find(x => x.label.startsWith(h.name))?.color || "#6366f1"} />
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Habit Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={pieData}>
              <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.05)" }} cornerRadius={4}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </RadialBar>
              <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Productivity Heatmap */}
      <GlowCard className="p-6">
        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Consistency Heatmap</h3>
        <div className="flex flex-wrap gap-1.5">
          {heatmapData.map((d, i) => {
            const score = d.score;
            const opacity = score === 0 ? 0.1 : score < 40 ? 0.3 : score < 60 ? 0.5 : score < 80 ? 0.75 : 1;
            return (
              <div key={i} title={`${d.date}: ${score}%`}
                className="w-5 h-5 rounded-sm transition-all hover:scale-125"
                style={{ background: `rgba(99, 102, 241, ${opacity})` }} />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="text-white/30 text-xs">Less</span>
          {[0.1, 0.3, 0.5, 0.75, 1].map(o => (
            <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(99, 102, 241, ${o})` }} />
          ))}
          <span className="text-white/30 text-xs">More</span>
        </div>
      </GlowCard>
    </div>
  );
};

// ─── STREAKS ──────────────────────────────────────────────────────────────────

const Streaks = ({ allData }) => {
  const streak = calcStreak(allData);
  const keys = Object.keys(allData).sort();
  const totalDays = keys.length;
  const daysAbove60 = keys.filter(k => calcCompletion(allData[k]) >= 60).length;
  const consistency = totalDays > 0 ? Math.round((daysAbove60 / totalDays) * 100) : 0;
  const missed = totalDays - daysAbove60;

  const habitStreaks = HABITS.map(h => {
    let s = 0;
    const sortedKeys = keys.slice().reverse();
    for (const k of sortedKeys) {
      const val = allData[k]?.habits?.[h.id] || 0;
      if (val >= h.goal) s++;
      else break;
    }
    return { ...h, streak: s };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Streak Tracker</h1>
        <p className="text-white/40 text-sm mt-1">Your consistency records</p>
      </div>

      {/* Main Streak */}
      <GlowCard className="p-8 text-center bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent" gradient>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <div className="text-7xl mb-2">🔥</div>
          <p className="text-8xl font-black text-white mb-2">{streak}</p>
          <p className="text-xl font-bold text-white/60">Day Streak</p>
          <p className="text-white/30 text-sm mt-2">Keep the fire burning!</p>
        </motion.div>
      </GlowCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Days Tracked", value: totalDays, icon: Calendar, color: "#6366f1" },
          { label: "Consistency Rate", value: consistency + "%", icon: TrendingUp, color: "#10b981" },
          { label: "Days Missed", value: missed, icon: AlertCircle, color: "#f97316" },
        ].map((s, i) => (
          <GlowCard key={s.label} className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: `${s.color}20` }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-white/40 text-xs">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Per-Habit Streaks */}
      <GlowCard className="p-6">
        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Habit Streaks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {habitStreaks.map(h => (
            <div key={h.id} className="flex flex-col items-center p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${h.color}20` }}>
                <h.icon size={18} style={{ color: h.color }} />
              </div>
              <p className="text-2xl font-black text-white">{h.streak}</p>
              <p className="text-xs text-white/40 text-center mt-1">{h.label}</p>
              {h.streak >= 3 && <span className="text-xs mt-1">🔥</span>}
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Achievement Badges */}
      <GlowCard className="p-6">
        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Achievements</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "7-Day Streak", icon: "🔥", earned: streak >= 7 },
            { label: "30-Day Warrior", icon: "⚔️", earned: streak >= 30 },
            { label: "Consistent 70%", icon: "⚡", earned: consistency >= 70 },
            { label: "100 DMs Club", icon: "📨", earned: Object.values(allData).reduce((a, d) => a + (d.habits?.dms || 0), 0) >= 100 },
            { label: "Gym Rat", icon: "💪", earned: habitStreaks.find(h => h.id === "workout")?.streak >= 5 },
            { label: "Code Daily", icon: "💻", earned: habitStreaks.find(h => h.id === "webdev")?.streak >= 5 },
          ].map(a => (
            <div key={a.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${a.earned ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-white/10 bg-white/5 text-white/20"}`}>
              <span className={a.earned ? "" : "grayscale opacity-30"}>{a.icon}</span>
              {a.label}
              {a.earned && <Check size={12} className="text-amber-400" />}
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
};

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

const Journal = ({ allData, setAllData }) => {
  const key = today();
  const dayData = allData[key] || {};
  const [form, setForm] = useState(dayData.journal || { did: "", distracted: "", learned: "", improve: "" });
  const [saved, setSaved] = useState(false);

  const saveJournal = () => {
    const updated = { ...allData, [key]: { ...dayData, journal: form } };
    setAllData(updated);
    save("ptrack_data", updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: "did", label: "What did I accomplish today?", placeholder: "List your wins, big or small...", icon: Trophy, color: "#10b981" },
    { key: "distracted", label: "What distracted me?", placeholder: "Be honest — awareness is the first step...", icon: AlertCircle, color: "#f97316" },
    { key: "learned", label: "What did I learn today?", placeholder: "Any skill, insight, or lesson...", icon: Brain, color: "#6366f1" },
    { key: "improve", label: "What will I do better tomorrow?", placeholder: "One clear intention for tomorrow...", icon: ArrowUp, color: "#8b5cf6" },
  ];

  const recentJournals = Object.keys(allData)
    .sort((a,b) => b.localeCompare(a))
    .slice(1, 5)
    .filter(k => allData[k]?.journal?.did);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Journal</h1>
          <p className="text-white/40 text-sm mt-1">Daily reflection & reflection</p>
        </div>
        <motion.button
          onClick={saveJournal}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
        >
          {saved ? <><Check size={14} />Saved!</> : <><Save size={14} />Save Journal</>}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {fields.map((f, i) => (
          <motion.div key={f.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlowCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg" style={{ background: `${f.color}20` }}>
                  <f.icon size={14} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-semibold text-sm">{f.label}</h3>
              </div>
              <textarea
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/80 text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-white/20 h-28"
              />
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Past Journals */}
      {recentJournals.length > 0 && (
        <GlowCard className="p-6">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Recent Entries</h3>
          <div className="space-y-3">
            {recentJournals.map(k => (
              <div key={k} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs mb-2">{new Date(k).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                <p className="text-white/70 text-sm line-clamp-2">{allData[k]?.journal?.did}</p>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
};

// ─── GOALS ────────────────────────────────────────────────────────────────────

const Goals = ({ allData, setAllData }) => {
  const [goals, setGoals] = useState(() => load("ptrack_goals", HABITS.map(h => ({ id: h.id, label: h.label, goal: h.goal, unit: h.unit, color: h.color }))));
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const saveGoals = (updated) => {
    setGoals(updated);
    save("ptrack_goals", updated);
  };

  const thisWeekKeys = Object.keys(allData).sort().slice(-7);
  const avgPerHabit = (habitId) => thisWeekKeys.length > 0
    ? Math.round((thisWeekKeys.reduce((a, k) => a + (allData[k]?.habits?.[habitId] || 0), 0) / thisWeekKeys.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Goals</h1>
        <p className="text-white/40 text-sm mt-1">Your daily targets and progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((g, i) => {
          const avg = avgPerHabit(g.id);
          const pct = Math.min(Math.round((avg / g.goal) * 100), 100);
          const habit = HABITS.find(h => h.id === g.id);
          const Icon = habit?.icon || Target;

          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlowCard className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${g.color}20` }}>
                      <Icon size={18} style={{ color: g.color }} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{g.label}</p>
                      <p className="text-white/40 text-xs">7-day avg: {avg} {g.unit}</p>
                    </div>
                  </div>
                  <button onClick={() => { setEditing(g.id); setEditVal(String(g.goal)); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-black text-white">{pct}%</span>
                  {editing === g.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm">Goal:</span>
                      <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                        className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-indigo-500" />
                      <span className="text-white/40 text-xs">{g.unit}</span>
                      <button onClick={() => {
                        const updated = goals.map(x => x.id === g.id ? { ...x, goal: Number(editVal) } : x);
                        saveGoals(updated); setEditing(null);
                      }} className="p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500">
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-white/40 text-sm">Target: {g.goal} {g.unit}/day</span>
                  )}
                </div>

                <GlowBar pct={pct} color={g.color} />

                <div className="flex justify-between mt-2 text-xs text-white/30">
                  <span>{avg} avg</span>
                  <span>{pct >= 100 ? "✅ On track!" : pct >= 70 ? "⚡ Getting there" : "❌ Needs work"}</span>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [allData, setAllData] = useState(() => load("ptrack_data", generateFreshData()));
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const streak = calcStreak(allData);

  // Ensure today's entry exists (no demo data injected)
  useEffect(() => {
    const key = today();
    if (!allData[key]) {
      const updated = {
        ...allData,
        [key]: { habits: {}, notes: "", missedReasons: {}, journal: { did: "", distracted: "", learned: "", improve: "" } },
      };
      setAllData(updated);
      save("ptrack_data", updated);
    }
  }, []);

  const hardReset = () => {
    localStorage.removeItem("ptrack_data");
    localStorage.removeItem("ptrack_goals");
    const fresh = generateFreshData();
    setAllData(fresh);
    save("ptrack_data", fresh);
    setPage("dashboard");
    setShowResetConfirm(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "productivity-data.json"; a.click();
  };

  const pages = { dashboard: Dashboard, tracking: DailyTracking, analytics: Analytics, streaks: Streaks, journal: Journal, goals: Goals };
  const PageComponent = pages[page];
  const todayPct = calcCompletion(allData[today()]);

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`} style={{
      background: darkMode
        ? "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), #070a14"
        : "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 60%), #f8fafc",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&display=swap" rel="stylesheet" />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== "undefined" && window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:relative z-40 h-full w-64 flex-shrink-0"
            >
              <div className="h-full flex flex-col py-6 px-4 border-r border-white/5 bg-black/20 backdrop-blur-2xl">
                {/* Logo */}
                <div className="flex items-center gap-3 px-2 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none">FlowTrack</p>
                    <p className="text-white/30 text-xs">Productivity OS</p>
                  </div>
                </div>

                {/* Streak pill */}
                <div className="mx-2 mb-6 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-orange-300 text-sm font-bold">{streak} Day Streak</span>
                  <div className="ml-auto w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-xs text-orange-400 font-black">{todayPct}%</span>
                  </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                  {NAV.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setPage(n.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${page === n.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                    >
                      <n.icon size={16} />
                      {n.label}
                      {page === n.id && <ChevronRight size={12} className="ml-auto opacity-60" />}
                    </button>
                  ))}
                </nav>

                {/* Bottom actions */}
                <div className="space-y-1 mt-4 pt-4 border-t border-white/10">
                  <button onClick={exportData} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <Download size={16} />Export Data
                  </button>
                  <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                  <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all">
                    <Trash2 size={16} />Reset All Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-white/5 backdrop-blur-xl bg-black/10 flex-shrink-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <p className="text-white/30 text-sm">
                {NAV.find(n => n.id === page)?.label}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Activity size={12} className="text-emerald-400" />
                <span className="text-white/60 text-xs">{todayPct}% today</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">ME</span>
              </div>
            </div>
          </div>

          {/* Page */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <PageComponent allData={allData} setAllData={setAllData} streak={streak} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-4">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-white font-black text-lg text-center mb-1">Reset All Data?</h3>
              <p className="text-white/40 text-sm text-center mb-6">This will permanently delete all your tracking history, streaks, and journal entries. Cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm font-semibold hover:border-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={hardReset}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black transition-colors"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
