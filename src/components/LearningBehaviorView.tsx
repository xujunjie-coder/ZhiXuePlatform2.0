import React, { useState } from 'react';
import { 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Play, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle,
  AlertTriangle,
  Send,
  Zap,
  TrendingUp,
  User,
  Users,
  Check,
  MapPin,
  HelpCircle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Activity,
  Award
} from 'lucide-react';

interface TimelineItem {
  date: string;
  time: string;
  type: 'login' | 'video' | 'quiz' | 'chat' | 'download' | 'homework';
  title: string;
  detail?: string;
}

interface WarningItem {
  id: number;
  title: string;
  status: 'unhandled' | 'reminded';
  date: string;
  type: 'login' | 'homework' | 'score' | 'hours';
}

interface StudentBehaviorData {
  id: string;
  name: string;
  studentNo: string;
  avatarUrl: string;
  warningsCount: number;
  overallStatus: string;
  metrics: {
    totalLearningHours: number;
    totalLearningHoursChangePct: number;
    avgDailyOnlineHours: number;
    avgDailyOnlineHoursChangePct: number;
    courseCompletionPct: number;
    courseCompletionPctChangePct: number;
    totalInteractions: number;
    totalInteractionsChangePct: number;
    homeworkOnTimeRate: number;
    homeworkOnTimeRateChangePct: number;
  };
  timeline: TimelineItem[];
  timeDistValues: number[]; // 14 items representing segments across the day
  resourcesPct: {
    video: { pct: number; hours: number };
    slides: { pct: number; hours: number };
    quiz: { pct: number; hours: number };
    animation: { pct: number; hours: number };
    other: { pct: number; hours: number };
  };
  concentrationTrend: Array<{ date: string; score: number }>;
  warnings: WarningItem[];
  habits: {
    patternName: string;
    resourcePref: string;
    evaluationText: string;
    videoWatchRate: number;
    videoWatchClassAvg: number;
    avgPageTime: string;
    avgPageTimeClassAvg: string;
    pageSwitches: number;
    pageSwitchesClassAvg: number;
    reWatchCount: number;
    reWatchClassAvg: number;
  };
  weakPoint: {
    title: string;
    desc: string;
    score: number;
  };
  aiReport: {
    summary: string;
    suggestions: string[];
    comparisonChips: Array<{ label: string; offset: string; isPositive: boolean }>;
  };
}

const BEHAVIOR_DATA_STORE: Record<string, StudentBehaviorData> = {
  xiaoming: {
    id: 'xiaoming',
    name: '张晓明',
    studentNo: '2024010101',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ-gM2EK7zWQZu9gKsOIx3lIHA6kS6g9KFVEi9V6l_ekcYxWfY9HGm6lcgW51PgNnEE5EbwLtXFOZSqxbXWqRQy2XfSj6AWZSYmEHlu5Rkj8gv9cmXrTL4IEZwQptWVjWiVisbafNxVtV23ucndVlAfRaiBfnClf69L5uNvfaUGcwTjVk9BzBlrCXKS0kwARidKfB6RW3ZsYj5-jo2qc8nisKdcEcRNt-ZQau7UINtf3ZfOrjJXKRlPyr09YX9R_3-XkpFImaqqM',
    warningsCount: 2,
    overallStatus: '正常 (轻微预警)',
    metrics: {
      totalLearningHours: 28.6,
      totalLearningHoursChangePct: 18,
      avgDailyOnlineHours: 1.36,
      avgDailyOnlineHoursChangePct: 12,
      courseCompletionPct: 72,
      courseCompletionPctChangePct: 8,
      totalInteractions: 86,
      totalInteractionsChangePct: 15,
      homeworkOnTimeRate: 78,
      homeworkOnTimeRateChangePct: -5,
    },
    timeline: [
      { date: '05-10', time: '20:45', type: 'login', title: '登录学习平台', detail: '设备: Chrome (PC)' },
      { date: '05-11', time: '21:12', type: 'video', title: '观看 第2章 视频', detail: '时长: 32 分钟' },
      { date: '05-12', time: '09:30', type: 'quiz', title: '完成 练习题 2.1', detail: '正确率: 80%' },
      { date: '05-13', time: '22:18', type: 'chat', title: '参与课堂答题', detail: '正确 3 / 5 题' },
      { date: '05-14', time: '10:05', type: 'download', title: '下载 课件 PPT', detail: '文件: 第3章.pptx' },
      { date: '05-15', time: '21:40', type: 'homework', title: '提交 作业 第3章', detail: '状态: 准时提交' },
      { date: '05-16', time: '23:05', type: 'video', title: '观看 第3章 视频', detail: '时长: 41 分钟' }
    ],
    timeDistValues: [12, 5, 2, 8, 14, 20, 48, 65, 80, 95, 90, 85, 100, 45], // peak in late evening
    resourcesPct: {
      video: { pct: 58, hours: 16.6 },
      slides: { pct: 18, hours: 5.1 },
      quiz: { pct: 14, hours: 4.0 },
      animation: { pct: 6, hours: 1.7 },
      other: { pct: 4, hours: 1.2 }
    },
    concentrationTrend: [
      { date: '05-10', score: 65 },
      { date: '05-12', score: 75 },
      { date: '05-14', score: 72 },
      { date: '05-16', score: 60 },
      { date: '05-18', score: 78 },
      { date: '05-20', score: 76 },
      { date: '05-22', score: 82 },
      { date: '05-24', score: 76 }
    ],
    warnings: [
      { id: 1, title: '连续 3 天未登录', status: 'unhandled', date: '2024-05-20 00:00', type: 'login' },
      { id: 2, title: '作业多次逾期', status: 'reminded', date: '2024-05-18 23:59', type: 'homework' },
      { id: 3, title: '测验正确率骤降', status: 'unhandled', date: '2024-05-17 10:30', type: 'score' },
      { id: 4, title: '学习时长异常减少', status: 'reminded', date: '2024-05-16 00:00', type: 'hours' }
    ],
    habits: {
      patternName: '规律型学习者',
      resourcePref: '偏好视频学习',
      evaluationText: '学习时间分布均匀，习惯良好，能保持稳定的学习节奏。视频类资源使用占比 58%，显著高于班级平均的 42%。平均专注度 76 分，高于班级平均的 65 分，继续保持！',
      videoWatchRate: 78,
      videoWatchClassAvg: 62,
      avgPageTime: '3分24秒',
      avgPageTimeClassAvg: '2分10秒',
      pageSwitches: 18,
      pageSwitchesClassAvg: 26,
      reWatchCount: 6,
      reWatchClassAvg: 3
    },
    weakPoint: {
      title: '第3章 树与二叉树',
      desc: '反复回看 "第3章 树与二叉树" 相关视频 5 次，正确率仅 62%，可能对该知识点掌握不够透彻。',
      score: 62
    },
    aiReport: {
      summary: '张晓明同学是 规律型学习者，学习习惯总体优良，专注度在黄金时段较高。资源使用以视频为主，课堂互动较主动，能够独立突破大题思维卡点。',
      suggestions: [
        '建议增加课后精选算法模拟卷训练时间，加深对二叉树中序遍历的编译模拟。',
        '在每周一至周五的学习高峰段（21:00-23:00）之外，可适当调节前置预习频率。',
        '针对第 3 章数据结构薄弱概念，建议开启「专项互动关卡」进行渐进式攻关。'
      ],
      comparisonChips: [
        { label: '学习时长', offset: '+18%', isPositive: true },
        { label: '专注度', offset: '+11分', isPositive: true },
        { label: '互动次数', offset: '+22%', isPositive: true },
        { label: '作业及时率', offset: '-5%', isPositive: false }
      ]
    }
  },
  lilei: {
    id: 'lilei',
    name: '李雷',
    studentNo: '2024010102',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3rh-sXphfPxUvFNgV0aBnP5Fhk-HU5WOGNMu38QPfX3ECedAKE9YXXG-YVD6G2ReE4TamK2CWXxd-CDtGB9i3AllicuFQZ9wUxrtJ9Ms9dJAt5LPEXrdEeS1r1vfQn6T49rf09MlDLwx0s4W1RE3gJHOzc-6VingrmpRHOIrmY6nKxYHRb69ZXFeMI5yJLobOaWEaGBxj_NlQUPx5uxvxWoxtsvJLCc8_dQEPEZNErMwz8OLWl043hJFNR7sKLC1RF61tZCF0gC4',
    warningsCount: 0,
    overallStatus: '极优 (无风险)',
    metrics: {
      totalLearningHours: 42.1,
      totalLearningHoursChangePct: 24,
      avgDailyOnlineHours: 2.15,
      avgDailyOnlineHoursChangePct: 15,
      courseCompletionPct: 95,
      courseCompletionPctChangePct: 12,
      totalInteractions: 145,
      totalInteractionsChangePct: 35,
      homeworkOnTimeRate: 100,
      homeworkOnTimeRateChangePct: 0,
    },
    timeline: [
      { date: '05-10', time: '14:30', type: 'login', title: '登录云端智慧课堂', detail: '设备: MacOS (Safari)' },
      { date: '05-11', time: '15:15', type: 'video', title: '观看 第3章 树拓扑视频', detail: '时长: 55 分钟' },
      { date: '05-12', time: '16:00', type: 'quiz', title: '完成 树迭代专项金牌考题', detail: '正确率: 100%' },
      { date: '05-13', time: '20:10', type: 'chat', title: '在线解答同伴答疑板 3 次', detail: '荣获学长助研星章' },
      { date: '05-14', time: '11:12', type: 'download', title: '下载 ACM/ICPC 竞赛资料', detail: '文件: binary_tree_advanced.pdf' },
      { date: '05-15', time: '18:30', type: 'homework', title: '超前提交 第4章 深度习题', detail: '状态: 超值优异满分' },
      { date: '05-16', time: '14:40', type: 'video', title: '观看 穿梭树指针3D动画示范', detail: '时长: 35 分钟' }
    ],
    timeDistValues: [5, 2, 10, 25, 45, 60, 55, 40, 30, 25, 12, 8, 4, 2], // peak in afternoon and early evening
    resourcesPct: {
      video: { pct: 42, hours: 17.6 },
      slides: { pct: 28, hours: 11.8 },
      quiz: { pct: 20, hours: 8.4 },
      animation: { pct: 8, hours: 3.4 },
      other: { pct: 2, hours: 0.9 }
    },
    concentrationTrend: [
      { date: '05-10', score: 88 },
      { date: '05-12', score: 92 },
      { date: '05-14', score: 90 },
      { date: '05-16', score: 95 },
      { date: '05-18', score: 91 },
      { date: '05-20', score: 93 },
      { date: '05-22', score: 96 },
      { date: '05-24', score: 94 }
    ],
    warnings: [],
    habits: {
      patternName: '高效进阶学霸',
      resourcePref: '全维均衡深度钻研',
      evaluationText: '学习模式规律且深度高阶。对多项技术探索表现出强烈驱动性，文档阅读及专项代码级练习总时长显著超前，页面切换停留极其稳定，专注度长效保持。',
      videoWatchRate: 94,
      videoWatchClassAvg: 62,
      avgPageTime: '5分48秒',
      avgPageTimeClassAvg: '2分10s',
      pageSwitches: 10,
      pageSwitchesClassAvg: 26,
      reWatchCount: 2,
      reWatchClassAvg: 3
    },
    weakPoint: {
      title: '第8章 动态规划状态压缩',
      desc: '在多维数组状态滚动压缩大题上耗时较长，通过智能答疑助手调阅了 3 篇课外高阶指引。',
      score: 85
    },
    aiReport: {
      summary: '李雷同学展现出极高阶的代码钻研及学习能动性。不仅能满产满载通过历次随堂测验，还在讨论社区扮演了核心领学者，解答他生各类卡点。',
      suggestions: [
        '推荐下发「ACM/ICPC大专院校大厂蓝桥杯金牌大题海」作为其个性化自选赛道。',
        '建议引导其担当常态化课后辅导学伴，在解答中温故知新提升非凡领导力优势。',
        '免修基础概念，直接进入高阶「Tarjan强连通拓扑、红黑树插入删除平衡机制」深度课。'
      ],
      comparisonChips: [
        { label: '学习时长', offset: '+47%', isPositive: true },
        { label: '专注度', offset: '+18分', isPositive: true },
        { label: '互动次数', offset: '+68%', isPositive: true },
        { label: '作业及时率', offset: '+22%', isPositive: true }
      ]
    }
  }
};

interface LearningBehaviorViewProps {
  currentUser?: { name?: string; email?: string; role?: string };
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function LearningBehaviorView({ currentUser, triggerToast }: LearningBehaviorViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('xiaoming');
  const [timeRange, setTimeRange] = useState<string>('month'); // week, month, semester, custom
  const [behaviorType, setBehaviorType] = useState<string>('all'); // all, base, interact, efficiency, warning
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [remindedList, setRemindedList] = useState<number[]>([]);
  const [studentDb, setStudentDb] = useState<Record<string, StudentBehaviorData>>(BEHAVIOR_DATA_STORE);

  const student = studentDb[selectedStudent] || studentDb.xiaoming;

  // Handles export report action
  const handleExport = () => {
    setIsExporting(true);
    triggerToast(`📊 正在为您即时提取「${student.name}」的 "${timeRange === 'month' ? '本月' : timeRange === 'week' ? '本周' : '本学期'}" 学习行为多维关联诊断分析PDF...`, 'info');
    setTimeout(() => {
      setIsExporting(false);
      triggerToast(`🎉 已成功导出 「${student.name}_单人行为报告_${timeRange}.pdf」!`, 'success');
    }, 1500);
  };

  // Handles quick action sending reminder for unhandled warnings
  const handleSendReminder = () => {
    const unhandledList = student.warnings.filter(w => w.status === 'unhandled' && !remindedList.includes(w.id));
    if (unhandledList.length === 0) {
      triggerToast('✨ 所有当前警示行为均已提醒处理完毕！', 'success');
      return;
    }
    
    setRemindedList(prev => [...prev, ...unhandledList.map(w => w.id)]);
    triggerToast(`✉️ 已通过系统气泡通知、钉钉应用直通口，成功一键发出 ${unhandledList.length} 项行为干预预警！`, 'success');
  };

  // Handles toggle single warning remind state
  const toggleReminder = (id: number) => {
    if (remindedList.includes(id)) return;
    setRemindedList(prev => [...prev, id]);
    const matched = student.warnings.find(w => w.id === id);
    triggerToast(`📬 已对「张晓明」发送了「${matched?.title || '异常干预提醒'}」的针对性通知`, 'success');
  };

  // Radial Donut chart configuration coordinates for resources (total stroke is 100)
  let accumulatedOffset = 0;

  // Time Distribution SVG Bar calculation helpers
  const maxBarValue = 100;
  const barChartWidth = 420;
  const barChartHeight = 160;

  // Concentration Line SVG helpers
  const pointSpacing = 50;
  const lineChartHeight = 140;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none text-left font-sans text-slate-800 pb-16 animate-fadeIn">
      
      {/* 🚀 Top Header / Selector Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            <span>学习行为分析</span>
          </h1>
          <span className="text-slate-300 hidden sm:inline text-sm">/</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            多维度洞察学生学习行为，识别风险，精准干预
          </span>

          {/* Interactive Multi-Selectors */}
          <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-4">
            {/* Student Dropdown selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-3xs px-3 py-1.5 rounded-xl">
              <span className="text-2xs text-slate-400 font-extrabold uppercase">选人</span>
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  triggerToast(`🎯 已切换数据看板至：${BEHAVIOR_DATA_STORE[e.target.value].name} 的全景行为档案`);
                }}
                className="border-none bg-transparent py-0 pl-0.5 pr-6 text-xs font-black text-slate-800 focus:ring-0 cursor-pointer focus:outline-none"
              >
                <option value="xiaoming">张晓明 (学号: 2024010101)</option>
                <option value="lilei">李雷 (学号: 2024010102)</option>
              </select>
            </div>

            {/* Course Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-3xs px-3 py-1.5 rounded-xl">
              <span className="text-2xs text-slate-400 font-extrabold uppercase font-sans">课程</span>
              <select className="border-none bg-transparent py-0 pl-0.5 pr-6 text-xs font-black text-slate-800 focus:ring-0 cursor-pointer focus:outline-none">
                <option>数据结构与算法 (2024春)</option>
              </select>
            </div>

            {/* Class Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-3xs px-3 py-1.5 rounded-xl">
              <span className="text-2xs text-slate-400 font-extrabold uppercase font-sans">班级</span>
              <select className="border-none bg-transparent py-0 pl-0.5 pr-6 text-xs font-black text-slate-800 focus:ring-0 cursor-pointer focus:outline-none">
                <option>2024级计算机1班 (48人)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global actions: Update dates, download reports */}
        <div className="flex items-center gap-3.5 text-xs">
          <span className="text-slate-400 font-semibold font-sans">数据更新：2024-05-25 10:30</span>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-750 font-extrabold rounded-xl shadow-3xs transition-all cursor-pointer"
          >
            <Download className={`w-4 h-4 text-blue-600 ${isExporting ? 'animate-spin' : ''}`} />
            <span>{isExporting ? '生成中...' : '导出报告'}</span>
          </button>
        </div>
      </div>

      {/* 🧭 Filter Bar: Time scope and behavior categories */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <span className="text-slate-500 font-black flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block"></span>
            选择时间跨度
          </span>
          <div className="flex bg-white rounded-xl border border-slate-200 shadow-3xs p-1 gap-1">
            <button
              onClick={() => {
                setTimeRange('week');
                triggerToast('📅 已为您加载当前学生本周级行为明细视图');
              }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'week' ? 'bg-blue-600 text-white shadow-3xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => {
                setTimeRange('month');
                triggerToast('📅 已为您加载当前学生本月级多维行为聚类视图');
              }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'month' ? 'bg-blue-600 text-white shadow-3xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              本月
            </button>
            <button
              onClick={() => {
                setTimeRange('semester');
                triggerToast('📅 已为您加载全学期综合时空行为趋势轨迹档案');
              }}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'semester' ? 'bg-blue-600 text-white shadow-3xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              本学期
            </button>
            <button
              onClick={() => {
                setTimeRange('custom');
                triggerToast('📅 自定义时间筛选已就绪：2024-05-01 至 24-05-25');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                timeRange === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>自定义</span>
              <Calendar className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Behavior metrics dynamic category filter */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs">
          <span className="text-slate-500 font-black flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
            行为类型
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: '全部' },
              { id: 'base', label: '基础行为' },
              { id: 'interact', label: '互动行为' },
              { id: 'efficiency', label: '效率分析' },
              { id: 'warning', label: '预警分析' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setBehaviorType(cat.id);
                  triggerToast(`🔍 已为您成功过滤 "${cat.label}" 细化指标`);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  behaviorType === cat.id
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-black'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-55'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 Summary Metrics Cards (Grid with 6 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Total Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">总学习时长</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-black text-slate-850 tracking-tight">{student.metrics.totalLearningHours}</span>
              <span className="text-[10px] font-bold text-slate-400">小时</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
              较上月 
              <span className="text-emerald-500 font-black flex items-center">
                <ArrowUp className="w-2.5 h-2.5 inline" /> {student.metrics.totalLearningHoursChangePct}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Avg Daily Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">平均每日在线</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-black text-slate-850 tracking-tight">{student.metrics.avgDailyOnlineHours}</span>
              <span className="text-[10px] font-bold text-slate-400">小时</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
              较上月 
              <span className="text-emerald-500 font-black flex items-center">
                <ArrowUp className="w-2.5 h-2.5 inline" /> {student.metrics.avgDailyOnlineHoursChangePct}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: Completion Pct */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className="w-11 h-11 rounded-full bg-indigo-50/70 flex items-center justify-center text-indigo-500 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">课程完成率</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-black text-slate-850 tracking-tight">{student.metrics.courseCompletionPct}</span>
              <span className="text-[10px] font-bold text-slate-400">%</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
              较上月 
              <span className="text-emerald-500 font-black flex items-center">
                <ArrowUp className="w-2.5 h-2.5 inline" /> {student.metrics.courseCompletionPctChangePct}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Interactions */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">互动总次数</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-black text-slate-850 tracking-tight">{student.metrics.totalInteractions}</span>
              <span className="text-[10px] font-bold text-slate-400">次</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
              较上月 
              <span className="text-emerald-500 font-black flex items-center">
                <ArrowUp className="w-2.5 h-2.5 inline" /> {student.metrics.totalInteractionsChangePct}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 5: Homework Timeliness */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <CheckCircle className="w-5 h-5 text-orange-550" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">作业提交及时率</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-black text-slate-850 tracking-tight">{student.metrics.homeworkOnTimeRate}</span>
              <span className="text-[10px] font-bold text-slate-400">%</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-0.5">
              较上月 
              {student.metrics.homeworkOnTimeRateChangePct >= 0 ? (
                <span className="text-emerald-555 font-black flex items-center">
                  <ArrowUp className="w-2.5 h-2.5 inline" /> +{student.metrics.homeworkOnTimeRateChangePct}%
                </span>
              ) : (
                <span className="text-red-500 font-black flex items-center">
                  <ArrowDown className="w-2.5 h-2.5 inline" /> {student.metrics.homeworkOnTimeRateChangePct}%
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Card 6: Alert Status */}
        <div className="bg-white rounded-2xl p-5 shadow-3xs border border-slate-150 flex items-center gap-3.5 hover:shadow-2xs transition-all">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
            student.warningsCount > 0 ? 'bg-amber-50 text-amber-550' : 'bg-emerald-50/70 text-emerald-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-450 font-black uppercase tracking-wider">预警状态</p>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className={`text-[15px] font-black tracking-tight ${
                student.warningsCount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {student.warningsCount > 0 ? '轻微预警' : '正常'}
              </span>
            </div>
            <p className="text-[9px] text-slate-405 font-bold mt-1.5">
              {student.warningsCount > 0 ? `有 ${student.warningsCount} 项风险待点干预` : '暂无风险异常信号'}
            </p>
          </div>
        </div>

      </div>

      {/* 🧭 Timeline and Alerts Section (4-column grid layout where main is col-span-3, sidebar is col-span-1) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left main: Learning event trajectory timeline */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-150 p-6 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>行为轨迹 <span className="text-xs font-semibold text-slate-400 ml-1">(关键学习事件时间轴)</span></span>
              </h3>
              <button 
                onClick={() => triggerToast('📅 已为您调阅该生成绩与行为交叉融合的10周超长事件序列大表面板')}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
              >
                <span>查看完整轨迹</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* High Fidelity timeline graphic timeline representation */}
            <div className="relative pt-6 pb-4">
              {/* Central axis line across the events */}
              <div className="absolute top-[52px] left-8 right-8 h-1 bg-slate-100 rounded-full" />

              {/* Flex row with responsive events */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-y-8 gap-x-2 relative z-10 text-center">
                
                {student.timeline.map((event, i) => {
                  // Icon mapping logic
                  let iconBg = 'bg-slate-100 text-slate-500';
                  let iconElem = <User className="w-3.5 h-3.5" />;
                  
                  if (event.type === 'login') {
                    iconBg = 'bg-blue-100 text-blue-600';
                    iconElem = <Zap className="w-3.5 h-3.5" />;
                  } else if (event.type === 'video') {
                    iconBg = 'bg-emerald-100 text-emerald-600';
                    iconElem = <Play className="w-3.5 h-3.5" />;
                  } else if (event.type === 'quiz') {
                    iconBg = 'bg-indigo-100 text-indigo-600';
                    iconElem = <FileSpreadsheet className="w-3.5 h-3.5" />;
                  } else if (event.type === 'chat') {
                    iconBg = 'bg-purple-100 text-purple-600';
                    iconElem = <MessageSquare className="w-3.5 h-3.5" />;
                  } else if (event.type === 'download') {
                    iconBg = 'bg-orange-100 text-orange-600';
                    iconElem = <Download className="w-3.5 h-3.5" />;
                  } else if (event.type === 'homework') {
                    iconBg = 'bg-pink-100 text-pink-600';
                    iconElem = <CheckCircle className="w-3.5 h-3.5" />;
                  }

                  return (
                    <div key={i} className="flex flex-col items-center group px-1">
                      {/* Date Header */}
                      <span className="text-[10px] text-slate-400 font-extrabold tracking-tight mb-2.5">{event.date}</span>
                      
                      {/* Node circle */}
                      <div className={`w-8 h-8 rounded-full ${iconBg} border-2 border-white shadow-3xs flex items-center justify-center mb-2.5 transition-all group-hover:scale-110 cursor-pointer`}>
                        {iconElem}
                      </div>

                      {/* Time Marker */}
                      <span className="text-2xs font-extrabold text-slate-800 leading-none mb-1">{event.time}</span>
                      
                      {/* Event Title */}
                      <span className="text-xs font-bold text-slate-700 leading-normal mb-0.5 group-hover:text-blue-600 transition-colors uppercase">
                        {event.title}
                      </span>

                      {/* Optional metadata info description */}
                      {event.detail && (
                        <span className="text-[9px] text-slate-400 font-medium block whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                          {event.detail}
                        </span>
                      )}
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Abnormal behavior warnings box */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                <span>异常行为预警</span>
              </h3>
              <button 
                onClick={() => triggerToast('🔍 查阅此生自秋季档案记录以来的所有 8 项历史回溯预警')}
                className="text-[11px] font-black text-blue-600 hover:text-blue-700 hover:underline"
              >
                查看全部
              </button>
            </div>

            {/* List of warning cards */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {student.warnings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p>极其省心！该学生暂无任何行为偏离警示信号。</p>
                </div>
              ) : (
                student.warnings.map((warn) => {
                  const isReminded = remindedList.includes(warn.id) || warn.status === 'reminded';
                  return (
                    <div 
                      key={warn.id} 
                      className={`p-2.5 rounded-xl border text-xs flex gap-2 w-full transition-all hover:bg-slate-50/50 ${
                        warn.type === 'login' || warn.type === 'score'
                          ? 'bg-rose-50/30 border-rose-100'
                          : 'bg-amber-50/30 border-amber-100'
                      }`}
                    >
                      {/* Warning color indicator icon */}
                      <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        warn.type === 'login' || warn.type === 'score'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title and Badge */}
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <h4 className="font-black text-slate-800 truncate leading-tight pr-1" title={warn.title}>
                            {warn.title}
                          </h4>
                          <button
                            onClick={() => toggleReminder(warn.id)}
                            disabled={isReminded}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${
                              isReminded
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-600 cursor-pointer'
                            }`}
                          >
                            {isReminded ? '已提醒' : '未处理'}
                          </button>
                        </div>
                        {/* Metadata snippet */}
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight">
                          {student.name} | {warn.date}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action trigger button */}
          {student.warnings.length > 0 && (
            <button 
              onClick={handleSendReminder}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black hover:shadow-2xs shadow-3xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-white/90" />
              <span>一键发送干预提醒 ({student.warnings.filter(w => w.status === 'unhandled' && !remindedList.includes(w.id)).length} 项)</span>
            </button>
          )}
        </div>

      </div>

      {/* 📊 Charts Row: Hour Segment Dist, Resource Type Donut, Attention Level Line Graph */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Box 1: Learning Hourly peak Distribution (24 Hours layout SVG represent) */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                <span>学习时段分布</span>
                <span className="text-[9px] text-slate-400 font-bold">(24小时区间)</span>
              </h3>
              <span className="text-[9px] text-blue-600 bg-blue-50 font-black px-2 py-0.5 rounded-full">
                高峰时段: {student.id === 'xiaoming' ? '21:00 - 23:00' : '15:00 - 18:00'}
              </span>
            </div>

            {/* Custom high fidelity responsive SVG Bar coordinates graph */}
            <div className="w-full h-40 flex items-end justify-center py-2 relative">
              {/* Y Axis line guides */}
              <div className="absolute left-0 right-0 top-2 border-t border-slate-100 border-dashed" />
              <div className="absolute left-0 right-0 top-14 border-t border-slate-100 border-dashed" />
              <div className="absolute left-0 right-0 top-26 border-t border-slate-100 border-dashed" />

              <svg className="w-full h-full" viewBox="0 0 420 160">
                {student.timeDistValues.map((val, idx) => {
                  const barWidth = 16;
                  const barGap = 12;
                  const startX = 15 + idx * (barWidth + barGap);
                  const scaledHeight = (val / 100) * 115;
                  const roundRadius = 3;
                  const startY = 135 - scaledHeight;
                  
                  return (
                    <g key={idx} className="group cursor-pointer">
                      {/* Bar body */}
                      <rect
                        x={startX}
                        y={startY}
                        width={barWidth}
                        height={scaledHeight}
                        rx={roundRadius}
                        fill={idx >= 7 && idx < 11 && student.id === 'xiaoming' ? '#186BFD' : '#93C5FD'}
                        className="transition-all duration-500 group-hover:fill-blue-600"
                      />
                      {/* Hover tooltip logic helper */}
                      <text
                        x={startX + barWidth / 2}
                        y={startY - 6}
                        textAnchor="middle"
                        className="text-[8px] font-black fill-slate-700 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        {val}m
                      </text>
                    </g>
                  );
                })}

                {/* Draw X-axis label indicators */}
                {[
                  { label: '0:00', x: 25 },
                  { label: '4:00', x: 85 },
                  { label: '8:00', x: 145 },
                  { label: '12:00', x: 205 },
                  { label: '16:00', x: 265 },
                  { label: '20:00', x: 325 },
                  { label: '24:00', x: 385 }
                ].map((pos, i) => (
                  <text
                    key={i}
                    x={pos.x}
                    y="155"
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-slate-450 uppercase"
                  >
                    {pos.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
          <div className="text-[9px] font-bold text-slate-400 mt-2 text-center border-t border-slate-50 pt-2 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm bg-blue-500"></span>黄金高能段</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm bg-blue-200"></span>辅助平缓段</div>
          </div>
        </div>

        {/* Box 2: Resource Pct Usage Breakdown Donut */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs mb-4 flex items-center gap-1.5">
              <span>资料模块使用时间占比</span>
            </h3>
            
            <div className="flex items-center gap-6 py-2">
              {/* Doughnut SVG layout */}
              <div className="w-24 h-24 relative shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer circle layout */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  
                  {/* Dynamic segments based on student statistics */}
                  {[
                    { val: student.resourcesPct.video.pct, color: '#186BFD' },
                    { val: student.resourcesPct.slides.pct, color: '#f87171' },
                    { val: student.resourcesPct.quiz.pct, color: '#fbbf24' },
                    { val: student.resourcesPct.animation.pct, color: '#34d399' },
                    { val: student.resourcesPct.other.pct, color: '#cbd5e1' }
                  ].map((seg, idx) => {
                    const dashArray = `${seg.val} ${100 - seg.val}`;
                    const offsetValue = -accumulatedOffset;
                    accumulatedOffset += seg.val;
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="3.2"
                        strokeDasharray={dashArray}
                        strokeDashoffset={offsetValue}
                        className="transition-all duration-700 hover:stroke-[4]"
                      />
                    );
                  })}
                </svg>

                {/* Central overlay text with general statistics */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-sm font-black text-slate-850 leading-none">{student.metrics.totalLearningHours}</span>
                  <span className="text-[7px] text-slate-400 font-extrabold mt-0.5 uppercase tracking-tighter">总时长 (小时)</span>
                </div>
              </div>

              {/* Dynamic Legend and detailed parameters labels list */}
              <div className="flex-1 flex flex-col justify-center gap-1.5 text-[9px] font-bold text-slate-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span>视频</span></div>
                  <div><span>{student.resourcesPct.video.pct}%</span> <span className="text-slate-350">({student.resourcesPct.video.hours}h)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span><span>课件/文档</span></div>
                  <div><span>{student.resourcesPct.slides.pct}%</span> <span className="text-slate-350">({student.resourcesPct.slides.hours}h)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400"></span><span>随习/测试</span></div>
                  <div><span>{student.resourcesPct.quiz.pct}%</span> <span className="text-slate-350">({student.resourcesPct.quiz.hours}h)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span>互动动画</span></div>
                  <div><span>{student.resourcesPct.animation.pct}%</span> <span className="text-slate-350">({student.resourcesPct.animation.hours}h)</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span><span>其它资源</span></div>
                  <div><span>{student.resourcesPct.other.pct}%</span> <span className="text-slate-350">({student.resourcesPct.other.hours}h)</span></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold leading-relaxed border-t border-slate-50 pt-2">
            * 学习引擎自动根据其观看流转页面停留进行深度时长聚合
          </p>
        </div>

        {/* Box 3: Concentration level scale trend (Line Chart SVG represent) */}
        <div className="bg-white rounded-2xl border border-slate-150 p-5 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                <span>专注度趋势详情</span>
              </h3>
              <span className="text-[9px] text-indigo-600 bg-indigo-50 font-black px-2 py-0.5 rounded-full">
                平均专注: {student.id === 'xiaoming' ? '76分' : '92分'}
              </span>
            </div>

            {/* Custom high fidelity responsive SVG Line area chart */}
            <div className="w-full h-40 flex items-end justify-center py-2 relative">
              <div className="absolute left-0 right-0 top-3 border-t border-slate-100 border-dashed" />
              <div className="absolute left-0 right-0 top-14 border-t border-slate-100 border-dashed" />
              <div className="absolute left-0 right-0 top-26 border-t border-slate-100 border-dashed" />

              <svg className="w-full h-full" viewBox="0 0 380 140">
                {/* 1. Draw the gradient area fill backdrop */}
                <path
                  d={`
                    M 15 ${140 - (student.concentrationTrend[0].score / 100) * 110} 
                    L 65 ${140 - (student.concentrationTrend[1].score / 100) * 110} 
                    L 115 ${140 - (student.concentrationTrend[2].score / 100) * 110} 
                    L 165 ${140 - (student.concentrationTrend[3].score / 100) * 110} 
                    L 215 ${140 - (student.concentrationTrend[4].score / 100) * 110} 
                    L 265 ${140 - (student.concentrationTrend[5].score / 100) * 110} 
                    L 315 ${140 - (student.concentrationTrend[6].score / 100) * 110} 
                    L 365 ${140 - (student.concentrationTrend[7].score / 100) * 110} 
                    L 365 140 L 15 140 Z
                  `}
                  fill="url(#indigoGrad)"
                  className="opacity-20"
                />

                {/* 2. Draw the stroke line indicator path */}
                <path
                  d={`
                    M 15 ${140 - (student.concentrationTrend[0].score / 100) * 110} 
                    L 65 ${140 - (student.concentrationTrend[1].score / 100) * 110} 
                    L 115 ${140 - (student.concentrationTrend[2].score / 100) * 110} 
                    L 165 ${140 - (student.concentrationTrend[3].score / 100) * 110} 
                    L 215 ${140 - (student.concentrationTrend[4].score / 100) * 110} 
                    L 265 ${140 - (student.concentrationTrend[5].score / 100) * 110} 
                    L 315 ${140 - (student.concentrationTrend[6].score / 100) * 110} 
                    L 365 ${140 - (student.concentrationTrend[7].score / 100) * 110}
                  `}
                  fill="transparent"
                  stroke="#186BFD"
                  strokeWidth="2.5"
                />

                {/* Constant reference line representing average */}
                <line x1="15" y1="52" x2="365" y2="52" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="3,3" />

                {/* 3. Draw circles overlay for coordinates */}
                {student.concentrationTrend.map((pt, i) => {
                  const xPos = 15 + i * 50;
                  const yPos = 140 - (pt.score / 100) * 110;
                  return (
                    <g key={i} className="group cursor-pointer">
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r="3.5"
                        fill="#186BFD"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                      <text
                        x={xPos}
                        y={yPos - 7}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {pt.score}
                      </text>
                    </g>
                  );
                })}

                {/* Y-axis gradient definition tags */}
                <defs>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#186BFD" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>

                {/* 4. Labels */}
                {student.concentrationTrend.map((pt, i) => (
                  <text
                    key={i}
                    x={15 + i * 50}
                    y="138"
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-slate-400 pointer-events-none"
                  >
                    {pt.date.substring(3)}
                  </text>
                ))}
              </svg>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold leading-relaxed border-t border-slate-50 pt-2">
            * 专注度基于眼动捕获、网页交互频率及测验平均答题间隔融合计算
          </p>
        </div>

      </div>

      {/* 🔮 Bottom Section: Efficiency, Habit mapping & AI detailed actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Row Left (Custom col-span-2 component block) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-2xs transition-all">
          
          {/* Half Part 1: Study Habits & Patterns parameters */}
          <div className="flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 pr-0 md:pr-6 whitespace-normal">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-4">学习效率与习惯分析</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-3 h-3" />
                    </span>
                    <span>学习模式识别</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 ml-6.5 block">
                    {student.habits.patternName}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Play className="w-3 h-3" />
                    </span>
                    <span>资源偏好类型</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 ml-6.5 block">
                    {student.habits.resourcePref}
                  </span>
                </div>
              </div>

              {/* Muted description textbox */}
              <div className="bg-slate-50 border border-slate-100 text-xs text-slate-650 leading-relaxed font-semibold p-3.5 rounded-xl">
                {student.habits.evaluationText}
              </div>
            </div>

            {/* Metrics parameters comparison panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-black uppercase leading-tight mb-1">视频观看率</p>
                <p className="text-sm font-black text-slate-800 leading-none">{student.habits.videoWatchRate}%</p>
                <p className="text-[8px] text-slate-400 font-bold mt-1">班级平均 {student.habits.videoWatchClassAvg}%</p>
                <p className="text-[8px] text-emerald-500 font-black mt-0.5 flex items-center">
                  <ArrowUp className="w-2 h-2" /> +{student.habits.videoWatchRate - student.habits.videoWatchClassAvg}%
                </p>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-black uppercase leading-tight mb-1">页面停留时</p>
                <p className="text-sm font-black text-slate-800 leading-none">{student.habits.avgPageTime}</p>
                <p className="text-[8px] text-slate-400 font-bold mt-1">班级平均 2分10s</p>
                <p className="text-[8px] text-emerald-500 font-black mt-0.5 flex items-center">
                  <ArrowUp className="w-2 h-2" /> 明显更长
                </p>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-black uppercase leading-tight mb-1">网页切换频</p>
                <p className="text-sm font-black text-slate-800 leading-none">{student.habits.pageSwitches} 次/h</p>
                <p className="text-[8px] text-slate-400 font-bold mt-1">班级平均 {student.habits.pageSwitchesClassAvg} 次</p>
                <p className="text-[8px] text-emerald-555 font-black mt-0.5 flex items-center">
                  <ArrowDown className="w-2 h-2" /> 少 {student.habits.pageSwitchesClassAvg - student.habits.pageSwitches}次 (高静专注)
                </p>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-black uppercase leading-tight mb-1">重复回看频</p>
                <p className="text-sm font-black text-slate-800 leading-none">{student.habits.reWatchCount} 次</p>
                <p className="text-[8px] text-slate-400 font-bold mt-1">班级平均 {student.habits.reWatchClassAvg} 次</p>
                <p className={`text-[8px] font-black mt-0.5 flex items-center ${
                  student.habits.reWatchCount > student.habits.reWatchClassAvg ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {student.habits.reWatchCount > student.habits.reWatchClassAvg ? (
                    <>
                      <ArrowUp className="w-2 h-2 mr-0.5" />
                      多 {student.habits.reWatchCount - student.habits.reWatchClassAvg}次 (探究攻坚)
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-2 h-2 mr-0.5" />
                      少 {student.habits.reWatchClassAvg - student.habits.reWatchCount}次
                    </>
                  )}
                </p>
              </div>
            </div>

          </div>

          {/* Half Part 2: Behavioral correlation & Performance linking with Radial Progress block */}
          <div className="flex-1 flex flex-col justify-between whitespace-normal">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-2">行为 - 成绩关联分析</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-3">行为指标与周测绩点相关系数 (与班级对比)</p>
              
              <ul className="space-y-2.5 text-xs text-slate-600 font-bold leading-tight">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span>视频完整观看率极高者，其周考平均得分富余 <span className="text-blue-600 font-black">+15%</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>每日自主累积用功时 &gt; 1h者，平均绩点超额 <span className="text-emerald-600 font-black">+12%</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>课堂社区高频发布问答互动者，综合实力高出 <span className="text-amber-600 font-black">+10%</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                  <span>历次周作业首发快速批阅卡通过者，期末胜率 <span className="text-purple-600 font-black">+18%</span></span>
                </li>
              </ul>
            </div>

            {/* Down block: Weakpoint focus progress ring */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-4 mt-5">
              <div className="flex-1">
                <h4 className="text-xs font-black text-rose-600 mb-1">薄弱环节精准定位</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mb-2">
                  {student.weakPoint.desc}
                </p>
                <button
                  onClick={() => triggerToast(`💡 正在基于「${student.weakPoint.title}」为该生定制AI翻转补漏练习集...`)}
                  className="text-[10px] text-blue-600 font-extrabold hover:underline block text-left"
                >
                  推送该模块专项互动卡 &gt;
                </button>
              </div>

              {/* Progress Ring with score overlay */}
              <div className="w-16 h-16 shrink-0 relative">
                <svg className="w-full h-full text-blue-500 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Backdrop ring */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="2.8" />
                  {/* Colored progress */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke={student.weakPoint.score >= 80 ? '#10b981' : '#f59e0b'}
                    strokeWidth="3.2" 
                    strokeDasharray={`${student.weakPoint.score} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-800">{student.weakPoint.score}%</span>
                  <span className="text-[7px] text-slate-400 font-bold scale-90 mt-0.5 whitespace-nowrap">正确率</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Row Right: AI Behavioral analytical assessment report (Gradient Backdrop Card) */}
        <div className="bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/20 rounded-2xl border border-blue-100 p-5 flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden">
          
          {/* Decorative graphic backdrop illustration */}
          <div className="absolute top-5 right-5 text-blue-400/20 pointer-events-none scale-110">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 border-b border-blue-50 pb-3 mb-4">
              <div className="p-1 rounded bg-blue-100 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-[#0053d0] text-sm">AI 行为分析诊断报告</h3>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {/* Habits Summary block */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-1.5">学习习惯综合概括</h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  {student.aiReport.summary}
                </p>
              </div>

              {/* Suggestions bullets */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-1.5">改进调优行动建议</h4>
                <ul className="space-y-1.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                  {student.aiReport.suggestions.map((sug, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="w-4.5 h-4.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Multi-chips statistics segment */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-1.5">关键行为同班对比偏度</h4>
                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                  {student.aiReport.comparisonChips.map((chip, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-white border border-slate-150 rounded-lg text-slate-600 shadow-3xs"
                    >
                      {chip.label}：
                      <span className={chip.isPositive ? 'text-emerald-500' : 'text-red-500'}>
                        {chip.offset}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Paths trigger block below */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-black text-slate-850 block">推荐专属智习课前路径</span>
              <button 
                onClick={() => triggerToast(`🧭 已为您生成并向「${student.name}」极速派发了 1 份定制 AI 前置微路径方案`)}
                className="text-[10px] text-blue-600 font-black hover:underline mt-1 text-left block"
              >
                推送定制个性化微路径 &gt;
              </button>
            </div>

            {/* Fine decorative image symbol hotlinked */}
            <img 
              alt="Document Illustration Symbol"
              className="w-12 h-12 object-contain opacity-50 select-none pointer-events-none" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH82W_OgwPdE-saE4MoCN6IKvHXE76Z_mSOTiPvVY7wglptdDbqsi1hy7xjtG5cYpFCbREq-yGYhWCo4e9u90FLXpT6ulxGHda7RxTare0Hozxu2aZbD2u_z6E_XeZXpoT_CKG1oZNlEe6q3AaIOGhao9VSQ38FCuPjS1Gv6Hr4zT8a0YvQ0hKt-XPs7XSrY9myX2Nk9NFDQdOujVh3A9WGKRDMJrlzbnSx2fL1M7tMpJhHIIK8ocGY6S1yVyimepl1UgwQrHoHzo"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

      </div>

    </div>
  );
}
