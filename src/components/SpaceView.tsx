import React, { useState, useEffect } from 'react';
import { 
  Download, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown,
  Star,
  CheckCircle,
  FileQuestion,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Percent,
  Clock,
  Check,
  AlertTriangle,
  Calendar,
  Folder,
  PenTool,
  Bot,
  Search,
  Sigma,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Users,
  Activity,
  History,
  Goal,
  Filter,
  Trash2,
  Plus,
  PlusCircle,
  CalendarRange,
  Bell,
  FileText,
  MessageSquare,
  Share2,
  MoreHorizontal,
  CheckSquare,
  Square,
  Brain
} from 'lucide-react';
import { Course, ActiveView } from '../types';
import { 
  CourseProgressDetail,
  TaskItem,
  Chapter
} from '../spaceData';

interface SpaceViewProps {
  courses: Course[];
  setActiveView: (view: ActiveView) => void;
  setSelectedCourseId: (id: string | null) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  selectedHistoryId?: string;
  setSelectedHistoryId?: (id: string) => void;
  historyLogs?: any[];
  setHistoryLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  tasks?: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
  onSetReminder?: (taskId: string, seconds: number, customLabel: string) => void;
}

export default function SpaceView({ 
  courses, 
  setActiveView, 
  setSelectedCourseId,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  selectedHistoryId: externalSelectedHistoryId,
  setSelectedHistoryId: externalSetSelectedHistoryId,
  historyLogs: externalHistoryLogs,
  setHistoryLogs: externalSetHistoryLogs,
  tasks: externalTasks,
  setTasks: externalSetTasks,
  onSetReminder
}: SpaceViewProps) {
  // Navigation tabs (matching design guide and layout)
  const [internalActiveTab, setInternalActiveTab] = useState('学情概览');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;

  // Tasks state fallback
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const tasks = externalTasks !== undefined ? externalTasks : localTasks;
  const setTasks = externalSetTasks !== undefined ? externalSetTasks : setLocalTasks;

  // Task list sub-tab states and filter controls
  const [taskFilterStatus, setTaskFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskFilterCategory, setTaskFilterCategory] = useState<string>('all');
  const [taskSearchText, setTaskSearchText] = useState<string>('');
  const [taskIsAdding, setTaskIsAdding] = useState<boolean>(false);
  const [taskNewTitle, setTaskNewTitle] = useState<string>('');
  const [taskNewType, setTaskNewType] = useState<'作业' | '考试' | '学习'>('学习');
  const [taskNewDeadline, setTaskNewDeadline] = useState<string>('2026-06-05 23:59');
  const [taskActiveSetupId, setTaskActiveSetupId] = useState<string | null>(null);
  const [taskToastMsg, setTaskToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (taskToastMsg) {
      const t = setTimeout(() => setTaskToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [taskToastMsg]);

  // Filter chips state
  const [filterStatus, setFilterStatus] = useState<'全部' | '进行中' | '已完成'>('全部');
  const [semesterFilter, setSemesterFilter] = useState('全部学期');

  // Selected course ID inside the Course Progress view (defaults to 'ds' - Data Structures)
  const [selectedCourseIdLocal, setSelectedCourseIdLocal] = useState('ds');

  // Chapter accordion expansion state
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>(['ch3', 'os_ch2', 'net_ch3', 'db_ch4', 'ai_ch2']);

  // Calendar Heatmap hover state for simulated analytics
  const [hoveredHeatday, setHoveredHeatday] = useState<{ day: number; hours: number } | null>(null);

  // Dynamic dynamic favorites bookmarks list
  const [favoriteIdToRemove, setFavoriteIdToRemove] = useState<string | null>(null);

  // Interactive mistakes redo center state (triggers from other components or locally)
  const [SPACE_COURSES, setSpaceCourses] = useState<CourseProgressDetail[]>([]);
  const [MOCK_RESOURCES, setMockResources] = useState<any[]>([]);
  const [mistakesList, setMistakesList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/space/courses')
      .then(res => res.json())
      .then(data => setSpaceCourses(data))
      .catch(err => console.error("Failed to fetch space courses:", err));
    fetch('/api/space/resources')
      .then(res => res.json())
      .then(data => setMockResources(data))
      .catch(err => console.error("Failed to fetch space resources:", err));
    fetch('/api/space/mistakes')
      .then(res => res.json())
      .then(data => setMistakesList(data))
      .catch(err => console.error("Failed to fetch space mistakes:", err));
    fetch('/api/space/reviews')
      .then(res => res.json())
      .then(data => setReviewList(data))
      .catch(err => console.error("Failed to fetch space reviews:", err));
  }, []);

  // Alert dismiss
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Find currently active course detail data
  const currentCourseDetail = SPACE_COURSES.find(c => c.id === selectedCourseIdLocal) || SPACE_COURSES[0];

  // Map courses based on filter status
  const filteredCoursesList = SPACE_COURSES.filter(course => {
    if (filterStatus === '进行中') return course.status === 'studying' || course.status === 'behind';
    if (filterStatus === '已完成') return course.status === 'completed';
    return true; // value '全部'
  });

  const toggleChapterExpanded = (chapterId: string) => {
    if (expandedChapterIds.includes(chapterId)) {
      setExpandedChapterIds(expandedChapterIds.filter(id => id !== chapterId));
    } else {
      setExpandedChapterIds([...expandedChapterIds, chapterId]);
    }
  };

  const handleSolveMistake = (id: string, codeName: string) => {
    const confirmSol = window.confirm(`是否一键开启针对「${codeName}」的仿真复习卡片？`);
    if (confirmSol) {
      setMistakesList(mistakesList.filter(m => m.id !== id));
      alert('已圆满攻克该薄弱顽固错题！知识掌握度提升，已录入“掌握知识点”。');
    }
  };

  // Precalculated Calendar definition
  const mayDays = [
    { day: 1, hours: 2, level: 'bg-blue-50 text-blue-600' },
    { day: 2, hours: 4, level: 'bg-blue-100 text-blue-800' },
    { day: 3, hours: 8, level: 'bg-blue-600 font-bold text-white' },
    { day: 4, hours: 5, level: 'bg-blue-300 text-blue-900' },
    { day: 5, hours: 10, level: 'bg-blue-700 font-bold text-white shadow-sm' },
    { day: 6, hours: 5, level: 'bg-blue-300 text-blue-900' },
    { day: 7, hours: 3, level: 'bg-blue-100 text-blue-800' },
    { day: 8, hours: 1, level: 'bg-blue-50/70 text-blue-600' },
    { day: 9, hours: 8, level: 'bg-blue-600 font-bold text-white' },
    { day: 10, hours: 9, level: 'bg-blue-600 font-semibold text-white' },
    { day: 11, hours: 4, level: 'bg-blue-200 text-blue-900' },
    { day: 12, hours: 2, level: 'bg-blue-50 text-blue-600' },
    { day: 13, hours: 3, level: 'bg-blue-100 text-blue-800' },
    { day: 14, hours: 5, level: 'bg-blue-300 text-blue-900' },
    { day: 15, hours: 7, level: 'bg-blue-500 font-semibold text-white' },
    { day: 16, hours: 12, level: 'bg-blue-800 font-bold text-white border-2 border-blue-400' },
    { day: 17, hours: 0, level: 'bg-slate-50 text-slate-300' },
    { day: 18, hours: 0, level: 'bg-slate-50 text-slate-300' },
    { day: 19, hours: 1, level: 'bg-blue-50/50 text-blue-600' },
    { day: 20, hours: 6, level: 'bg-blue-400 text-white' },
    { day: 21, hours: 8, level: 'bg-blue-600 font-bold text-white' },
    { day: 22, hours: 2, level: 'bg-blue-50 text-blue-600' },
    { day: 23, hours: 3, level: 'bg-blue-100 text-blue-800' },
    { day: 24, hours: 0, level: 'bg-slate-50 text-slate-300' },
    { day: 25, hours: 8, level: 'bg-blue-600 font-bold text-white' },
    { day: 26, hours: 10, level: 'bg-blue-700 font-bold text-white shadow-sm' },
    { day: 27, hours: 4, level: 'bg-blue-200 text-blue-900' }
  ];

  // ======= STUDY HISTORY STATE DEFINITIONS =======
  const [historyActiveSubTab, setHistoryActiveSubTab] = useState<'学习记录' | '学习统计' | '复习清单' | '导出报告'>('学习记录');
  const [historySearch, setHistorySearch] = useState('');
  const [historyCourseFilter, setHistoryCourseFilter] = useState('全部课程');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('全部类型');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('全部状态');
  const [historyDateFilter, setHistoryDateFilter] = useState('本学期');
  const [internalSelectedHistoryId, setInternalSelectedHistoryId] = useState('h1');
  const selectedHistoryId = externalSelectedHistoryId !== undefined ? externalSelectedHistoryId : internalSelectedHistoryId;
  const setSelectedHistoryId = externalSetSelectedHistoryId !== undefined ? externalSetSelectedHistoryId : setInternalSelectedHistoryId;
  const [detailTabsActiveTab, setDetailTabsActiveTab] = useState<'学习详情' | '关联内容' | 'AI 学习复盘'>('学习详情');

  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponseList, setAiResponseList] = useState<Record<string, string[]>>({});

  const handleAskAICustom = (logId: string) => {
    if (!customPrompt.trim()) return;
    const userQ = customPrompt;
    let answer = "";
    if (logId === 'h1') {
      answer = "针对您对栈应用的追问：“" + userQ + "”，在算术求值中，双栈通常是Dijkstra双栈：一个存数据，一个存符号。只有遇到低/等优先级运算符或者右括号时，才触发出栈单步执行运算。可以把递归比作硬件层面的局部堆栈保存。";
    } else if (logId === 'h2') {
      answer = "针对您的作业追问：“" + userQ + "”，在单向、双向链表析构丢节点时，务必要先缓存 next 后续句柄指针，避免“释放后释放或内存泄露”。";
    } else {
      answer = "对知识点“" + userQ + "”：建议多关注该学期平时测试中的经典边界问题。推荐将其加入下方的复习清单以定期温习。";
    }

    setAiResponseList(prev => ({
      ...prev,
      [logId]: [...(prev[logId] || []), "问：" + userQ, "答：" + answer]
    }));
    setCustomPrompt('');
  };

  const [reviewList, setReviewList] = useState<any[]>([]);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewPriority, setNewReviewPriority] = useState('中');

  const [localHistoryLogs, setLocalHistoryLogs] = useState<any[]>([]);

  const historyLogs = externalHistoryLogs !== undefined ? externalHistoryLogs : localHistoryLogs;
  const setHistoryLogs = externalSetHistoryLogs !== undefined ? externalSetHistoryLogs : setLocalHistoryLogs;

  if (SPACE_COURSES.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-semibold text-sm">
        正在加载学情空间数据...
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-[1500px] mx-auto animate-fadeIn pb-16">
      
      {/* 1. Page Header & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span>学习空间</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">专属智能学业诊断看板与各科课程进度跟踪</p>
          
          {/* Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-200 mt-5 overflow-x-auto scroller-hidden">
            {[
              { id: '学情概览', name: '学情概览' },
              { id: '课程进度', name: '课程进度' },
              { id: '学习历史', name: '学习历史' },
              { id: '个人待办', name: '个人待办' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`pb-3 pt-1 px-4 text-xs md:text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-blue-600 font-bold' 
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER VIEW BASED ON TAB */}

      {/* VIEW A: LEARNING SPACE & PROGRESS FLOW */}
      {(activeTab === '学情概览' || activeTab === '课程进度') && (
        <div className="space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['全部课程', '进行中', '已完成'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status === '全部课程' ? '全部' : status)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                    (status === '全部课程' && filterStatus === '全部') || (status === '进行中' && filterStatus === '进行中') || (status === '已完成' && filterStatus === '已完成')
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700 font-medium">
              <span>当前学期: </span>
              <select 
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="bg-transparent border-none p-0 pr-6 text-xs text-blue-600 font-bold focus:ring-0 cursor-pointer"
              >
                <option value="全部学期">全部学期 (2024春-当前)</option>
                <option value="2024春">2024春季班级</option>
                <option value="2023秋">2023秋季全学期</option>
              </select>
            </div>
          </div>

          {/* KPI Overview Cards */}
          {activeTab === '学情概览' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Card 1: 课程总数 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium">我的总选修课程</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">8</span>
                <span className="text-[10px] text-slate-400">门在读</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-50 pt-2 flex items-center justify-between">
                <span>进行中 <span className="text-blue-600 font-bold">5 门</span></span>
                <span>|</span>
                <span>已结课 1 门</span>
              </div>
            </div>

            {/* Card 2: 平均完成率 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium">学时平均化完成率</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">62.8%</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-2 border-t border-slate-50 pt-2 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>比上周同期提升 +8.2%</span>
              </div>
            </div>

            {/* Card 3: 已完成任务 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium">已通关学时节点</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">48</span>
                <span className="text-xs text-slate-400">/ 86 个</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-2 border-t border-slate-50 pt-2 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>本周新增攻克 7 个</span>
              </div>
            </div>

            {/* Card 4: 待办任务 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium">各科待上交作业</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">38</span>
                <span className="text-xs text-slate-400">个任务待办</span>
              </div>
              <div className="text-[10px] text-amber-600 mt-2 border-t border-slate-50 pt-2 flex items-center gap-1 font-semibold">
                <span>较往周已递减 -5 个</span>
              </div>
            </div>

            {/* Card 5: 学习总时长 */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium">线上连续学习时长</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">236.4</span>
                <span className="text-xs text-slate-400">小时</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-2 border-t border-slate-50 pt-2 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>昨日在线学习 12.5 小时</span>
              </div>
            </div>
          </div>
          )}

          {/* Interactive Core Progress Dashboard Layout Grid (3 columns) */}
          {activeTab === '课程进度' && (
            <div className="grid grid-cols-12 gap-6">

            {/* A1: LEFT COLUMN - COURSE LIST SELECTOR */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col h-[580px]">
              <div className="mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-50">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span>课程目录进度总览</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredCoursesList.map((course) => {
                  const isSelected = course.id === selectedCourseIdLocal;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseIdLocal(course.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50/55 border-blue-200 shadow-2xs' 
                          : 'border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white shrink-0 font-bold text-sm ${
                          course.status === 'completed' 
                            ? 'bg-emerald-500' 
                            : course.status === 'behind' 
                            ? 'bg-red-500' 
                            : 'bg-blue-600'
                        }`}>
                          {course.id.toUpperCase().substring(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{course.title}</h4>
                            {course.status === 'behind' && (
                              <span className="text-[9px] scale-90 px-1 py-0.2 bg-red-50 text-red-600 rounded font-medium ml-1 flex items-center">
                                落后
                              </span>
                            )}
                            {course.status === 'completed' && (
                              <span className="text-[9px] scale-90 px-1 py-0.2 bg-emerald-50 text-emerald-600 rounded font-medium ml-1 flex items-center">
                                已修完
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            已学完 {course.completedChapters} 章 | 待办 {course.todoCount} 个
                          </p>
                        </div>
                      </div>

                      {/* Micro Progress Bar inside selector item */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              course.status === 'completed' 
                                ? 'bg-emerald-500' 
                                : course.status === 'behind' 
                                ? 'bg-red-500' 
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 w-8 text-right shrink-0">
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredCoursesList.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    没有当前状态分类下的课程进度。
                  </div>
                )}
              </div>

              <div className="sub-footer border-t border-slate-100 pt-3 mt-2 text-center">
                <button 
                  onClick={() => setActiveView('courses')}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-center mx-auto gap-0.5"
                >
                  <span>直达我的所有选课课程</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* A2: MIDDLE COLUMN - COURSE PROGRESS DETAILS & ACCORDION CHAPTER TREE */}
            <div className="col-span-12 md:col-span-7 lg:col-span-5 xl:col-span-6 bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col h-[580px]">
              <div className="shrink-0 mb-3">
                <span className="text-[10px] tracking-wider text-blue-600 font-bold uppercase block mb-1">
                  正在聚焦课程评估
                </span>
                <h3 className="font-bold text-slate-950 text-base flex items-center gap-1">
                  <span>章卡详情：</span>
                  <span className="text-slate-700 font-medium">{currentCourseDetail.title}</span>
                </h3>
              </div>

              {/* Big central progress banner */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4 shrink-0">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs text-slate-500 font-bold">总体学时通关度</span>
                  <span className="text-xs text-slate-400">目前阶段通关 78%</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300 relative"
                      style={{ width: `${currentCourseDetail.progress}%` }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <span className="font-black text-lg text-slate-900 w-12 text-right">
                    {currentCourseDetail.progress}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-600 mt-2">
                  <span>累积听课章节: <span className="font-bold text-slate-800">{currentCourseDetail.completedChapters} 章</span></span>
                  <span>|</span>
                  <span>连播累积计时: <span className="font-bold text-slate-800">{currentCourseDetail.hours} hrs</span></span>
                </div>
              </div>

              {/* Accordion Chapter Tree Container */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <p className="text-[10px] text-slate-400 font-semibold mb-2">章节通关路线（点击可收折叠）：</p>
                
                {currentCourseDetail.chapters.map((chapter) => {
                  const isExpanded = expandedChapterIds.includes(chapter.id);
                  const hasSubItems = chapter.subItems && chapter.subItems.length > 0;
                  
                  return (
                    <div 
                      key={chapter.id}
                      className="border border-slate-100 rounded-lg overflow-hidden transition-all bg-slate-50/20"
                    >
                      <div 
                        onClick={() => toggleChapterExpanded(chapter.id)}
                        className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {hasSubItems ? (
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          )}
                          
                          {chapter.status === 'completed' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] shrink-0 font-bold" />
                          )}
                          <span className={`text-xs font-bold ${chapter.status === 'completed' ? 'text-slate-800' : 'text-slate-600'}`}>
                            {chapter.title}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold ${chapter.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {chapter.status === 'completed' ? '章通关完成' : '未开始'}
                        </span>
                      </div>

                      {/* Expanded Sub items listing */}
                      {hasSubItems && isExpanded && (
                        <div className="bg-slate-50/50 p-2 pl-8 border-t border-slate-50 space-y-2 text-xs">
                          {chapter.subItems?.map((sub) => (
                            <div 
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-slate-100/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {sub.status === 'completed' ? (
                                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] shrink-0 font-bold">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : sub.status === 'studying' ? (
                                  <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] shrink-0 font-bold animate-pulse">
                                    <Play className="w-2.5 h-2.5" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                                )}
                                <span className={`text-xs truncate ${sub.status === 'studying' ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                                  {sub.title}
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                {sub.status === 'completed' && <span className="text-emerald-600 scale-90 block">已完满</span>}
                                {sub.status === 'studying' && (
                                  <span className="text-amber-600 font-bold scale-90 flex items-center gap-1">
                                    <span>在看</span>
                                    <span>{sub.progress}%</span>
                                  </span>
                                )}
                                {sub.status === 'not-started' && <span className="text-slate-400 scale-90 block">未开播</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Chapter Card Bottom Actions */}
              <div className="shrink-0 pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">共计包含 29 个二级知识节点</span>
                <button
                  onClick={() => {
                    // Match course selection and redirect
                    let matchId = '3';
                    if (selectedCourseIdLocal === 'ds') matchId = '3';
                    else if (selectedCourseIdLocal === 'os') matchId = '8';
                    else if (selectedCourseIdLocal === 'ai') matchId = '1';
                    else if (selectedCourseIdLocal === 'math') matchId = '6';
                    setSelectedCourseId(matchId);
                    setActiveView('studying');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <span>继续学习当前二级卡点</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* A3: RIGHT COLUMN - PROGRESS WARNINGS & RECOMMENDATION PANEL */}
            <div className="col-span-12 md:col-span-5 lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between h-[580px] overflow-y-auto space-y-4">
              
              {/* Box 1: Progress Warning Alerts */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>智学学情红色预警</span>
                  </h3>
                  <span className="text-[9px] text-slate-400">自动检测</span>
                </div>

                <div className="space-y-3">
                  
                  {/* Alert Item 1 */}
                  {!dismissedAlerts.includes('os') && (
                    <div className="p-3 bg-red-50/50 border border-red-100/70 rounded-lg">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-red-50">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-bold text-slate-800">操作系统原理</span>
                        </div>
                        <button 
                          onClick={() => setDismissedAlerts([...dismissedAlerts, 'os'])}
                          className="text-[10px] text-slate-400 hover:text-red-500 px-1"
                        >
                          忽略
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        当前通关率落后本班基准均值线 <span className="text-red-600 font-extrabold">-23%</span>。
                      </p>
                      <p className="text-[9.5px] text-slate-500 mt-1.5 font-medium">
                        ✦ 建议今天加餐通关: 进程管理第三大章
                      </p>
                    </div>
                  )}

                  {/* Alert Item 2 */}
                  {!dismissedAlerts.includes('net') && (
                    <div className="p-3 bg-amber-50/40 border border-amber-100/70 rounded-lg">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-amber-50">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold text-slate-800">计算机网络课程</span>
                        </div>
                        <button 
                          onClick={() => setDismissedAlerts([...dismissedAlerts, 'net'])}
                          className="text-[10px] text-slate-400 hover:text-amber-500 px-1"
                        >
                          忽略
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        您有 <span className="text-amber-600 font-black">2</span> 个核心作业包面临截止。
                      </p>
                      <p className="text-[9.5px] text-slate-500 mt-1.5 font-medium">
                        ⏳ 最早截止物理秒杀时间: 本周五
                      </p>
                    </div>
                  )}

                  {dismissedAlerts.length >= 2 && (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      所有红色预警已被归档忽略。
                    </div>
                  )}

                </div>
              </div>

              {/* Box 2: AI Learning Robot Coach Suggestions */}
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-xl p-4 border border-indigo-100/40 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                    <h3 className="font-bold text-indigo-950 text-xs">AI 助学辅导建议</h3>
                  </div>
                  
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    李同学，根据您过去30天的随堂题错题谱分析，建议您每日保持在
                    <span className="font-bold text-blue-700">1.5小时</span> 
                    以上的高效答题节奏。如果遇到数学求导和栈嵌套偏导符号疑惑，您可以随时召唤 AI 老师进行交互解释！
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourseIdLocal('ai');
                        alert('已为您预选加载人工智能导论篇，正在为您开启聊天窗口');
                      }}
                      className="px-3 py-1.5 bg-white text-indigo-600 text-[10px] font-bold rounded shadow-2xs hover:bg-slate-50"
                    >
                      AI 一键答疑
                    </button>
                    <button
                      onClick={() => alert('已为您量身定做生成每日一练打卡试卷。')}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded shadow-2xs hover:bg-indigo-700"
                    >
                      获取精刷考点
                    </button>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 pointer-events-none opacity-20">
                  <Bot className="w-20 h-20 text-indigo-500 transform translate-x-2 translate-y-2" />
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Bottom Analytics Row (Task Completion + Knowledge Mastery SVG + Learning Trend Chart) */}
          {activeTab === '学情概览' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* B1: TASK COMPLETION TABLE */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                  任务完成指标分析
                </h3>
                <p className="text-[10px] text-slate-400 mb-3">基于"{currentCourseDetail.title}"的日常考核统计</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <th className="py-2">任务类型</th>
                        <th className="py-2 text-center">发布数</th>
                        <th className="py-2 text-center">已缴交</th>
                        <th className="py-2 text-center">扣分/未交</th>
                        <th className="py-2 text-right">交付率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentCourseDetail.tasksTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-semibold text-slate-700">{row.type}</td>
                          <td className="py-2.5 text-center text-slate-600">{row.total}</td>
                          <td className="py-2.5 text-center text-emerald-600 font-bold">{row.completed}</td>
                          <td className="py-2.5 text-center text-slate-400">{row.uncompleted}</td>
                          <td className="py-2.5 text-right text-blue-600 font-extrabold">{row.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* B2: KNOWLEDGE MASTERY DONUT CHART */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">
                  知识点维度覆盖图
                </h3>
                <p className="text-[10px] text-slate-400 mb-2">检测库考核心能力深度评级</p>
                
                <div className="flex items-center justify-center gap-6 py-2">
                  
                  {/* Dynamic conic-gradient donut chart */}
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                    style={{
                      background: `conic-gradient(
                        #2563eb 0% ${currentCourseDetail.mastery.overall}%, 
                        #f59e0b ${currentCourseDetail.mastery.overall}% ${currentCourseDetail.mastery.overall + 15}%, 
                        #e2e8f0 ${currentCourseDetail.mastery.overall + 15}% 100%
                      )`
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-2xs">
                      <span className="text-lg font-black text-slate-900">{currentCourseDetail.mastery.overall}%</span>
                      <span className="text-[8px] text-slate-400 transform scale-90">综合掌握率</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="space-y-1.5 text-[11px] flex-1">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span className="text-slate-600 font-medium">完全通关掌握</span>
                      </div>
                      <span className="font-bold text-slate-800">{currentCourseDetail.mastery.mastered} 个</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-600 font-medium">需抓紧重做</span>
                      </div>
                      <span className="font-bold text-slate-800">{currentCourseDetail.mastery.weak} 个</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <span className="text-slate-600 font-medium">尚未解锁考章节</span>
                      </div>
                      <span className="font-bold text-slate-800">{currentCourseDetail.mastery.unlearned} 个</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-2 text-center">
                <button
                  onClick={() => alert(`已根据「${currentCourseDetail.title}」掌握率，自动整理推荐了7个薄弱环节随堂重考。`)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  详情分析：导出知识考点缺陷列表➔
                </button>
              </div>
            </div>

            {/* B3: LEARNING PROGRESS TREND LINE CHART (DYNAMIC SVG COORDS!) */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      课程通晓度走势对比
                    </h3>
                    <p className="text-[10px] text-slate-400">对比同班前10%学霸均线差异</p>
                  </div>
                  
                  {/* Legends */}
                  <div className="text-[9px] flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1 font-bold text-blue-600">
                      <span className="w-2 h-0.5 bg-blue-600 inline-block" /> 我的完成率 
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2 h-0.5 bg-emerald-500 inline-block border-dashed border-t" /> 班均线
                    </span>
                  </div>
                </div>

                {/* SVG Live Render */}
                <div className="relative h-28 w-full border-b border-l border-slate-100 mt-2 bg-slate-50/20">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                    <div className="border-t border-slate-100 w-full" />
                    <div className="border-t border-slate-100 w-full" />
                    <div className="border-t border-slate-100 w-full" />
                  </div>

                  {/* SVG responsive box */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    
                    {/* My Progress Path */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points={currentCourseDetail.trend.myProgress.map((val, idx) => {
                        const x = idx * 14.28; // Spaced symmetrically 0 to 100
                        const y = 100 - val; // Invert progress
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* Class Average Path */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      points={currentCourseDetail.trend.classAvg.map((val, idx) => {
                        const x = idx * 14.28;
                        const y = 100 - val;
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* My Progress points circles */}
                    {currentCourseDetail.trend.myProgress.map((val, idx) => (
                      <circle
                        key={`m-${idx}`}
                        cx={idx * 14.28}
                        cy={100 - val}
                        r="2.5"
                        fill="#2563eb"
                      />
                    ))}

                  </svg>
                  
                  {/* Weeks indicators footer */}
                  <div className="absolute -bottom-5 inset-x-0 flex justify-between text-[8px] text-slate-400 font-bold">
                    <span>w1</span>
                    <span>w2</span>
                    <span>w3</span>
                    <span>w4</span>
                    <span>w5</span>
                    <span>w6</span>
                    <span>w7</span>
                    <span>现期</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3 pt-3 shrink-0">
                <button 
                  onClick={() => alert('学前趋势分析：因中考难关重点，本周进度曲线呈现平滑上升趋势，后劲十足。')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  对标班均优势诊断➔
                </button>
              </div>
            </div>
          </div>
          )}

        </div>
      )}

      {/* VIEW C: LEARNING REPORT (KPI & CALENDAR HEATMAP) */}
      {activeTab === '学习报告' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
              <History className="w-5 h-5 text-blue-600" />
              <span>本期连续学习学时日历</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">汇总您每日在线上学习、章节看播、错题演练、模拟测试等累计投入时长统计（5月度）</p>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Daily calendar heatmap block */}
              <div className="xl:col-span-3 border border-slate-100 rounded-xl p-5 bg-slate-50/20 select-none relative">
                
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-4 px-2">
                  <span>2026年5月 ➔</span>
                  <span className="text-[10.5px] text-slate-400 font-normal">鼠标悬浮可查看具体看播计时</span>
                </div>

                {/* Days LETTERS heading */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2 font-bold uppercase">
                  <div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div>
                </div>

                <div className="grid grid-cols-7 gap-2.5 text-center text-xs">
                  {/* Offsets */}
                  <div className="aspect-square flex items-center justify-center text-slate-300">29</div>
                  <div className="aspect-square flex items-center justify-center text-slate-300">30</div>

                  {mayDays.map((item) => (
                    <div 
                      key={item.day}
                      onMouseEnter={() => setHoveredHeatday({ day: item.day, hours: item.hours })}
                      onMouseLeave={() => setHoveredHeatday(null)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transform hover:scale-105 shadow-3xs transition-all ${item.level}`}
                    >
                      <span className="text-xs font-bold">{item.day}</span>
                      {item.hours > 0 && <span className="text-[8px] opacity-90 font-mono scale-90">{item.hours}h</span>}
                    </div>
                  ))}
                </div>

                {/* Legend bar */}
                <div className="mt-6 flex items-center justify-end gap-2 text-[10px] text-slate-400">
                  <span>学时: 零次或低活</span>
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center font-bold text-[8.5px]">0</div>
                    <div className="w-3.5 h-3.5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[8.5px]">2</div>
                    <div className="w-3.5 h-3.5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[8.5px]">4</div>
                    <div className="w-3.5 h-3.5 rounded bg-blue-300 text-blue-900 flex items-center justify-center font-bold text-[8.5px]">5</div>
                    <div className="w-3.5 h-3.5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[8.5px]">8</div>
                    <div className="w-3.5 h-3.5 rounded bg-blue-800 text-white flex items-center justify-center font-bold text-[8.5px]">12</div>
                  </div>
                  <span>满产功臣</span>
                </div>

                {/* Tooltip Hover display */}
                {hoveredHeatday && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 text-white rounded-xl p-3 border border-slate-700 shadow-xl text-xs leading-relaxed z-30 w-32 text-center pointer-events-none animate-fadeIn">
                    <p className="font-extrabold text-blue-300">5月 {hoveredHeatday.day} 日</p>
                    <p className="border-t border-slate-700 mt-1.5 pt-1.5">
                      累计在线: <span className="font-bold text-orange-400 font-mono">{hoveredHeatday.hours}</span> 小时
                    </p>
                  </div>
                )}
              </div>

              {/* Learning stats summary commentary */}
              <div className="p-5 bg-blue-50/40 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm mb-2">
                    5月学期看播简评
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
                    <li>🟢 您保持了高强度复习打卡，平均每周累积自习 <span className="font-bold text-slate-800">42小时</span>。</li>
                    <li>🟠 特别是 <span className="font-bold text-slate-800">5月16日</span>（周学期前夜）连续攻克12h，对高数第12章拉格朗日进行了通宵击穿。</li>
                    <li>🔴 过去三天您的活性略微衰退，建议今日复课：继续机器学习。</li>
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      10
                    </div>
                    <div>
                      <p className="text-[10.5px] font-black text-slate-900">学霸五星勋章评级</p>
                      <p className="text-[9.5px] text-slate-400">系统评定：处于班级前线4.2%</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW D: MISTAKES SECTION */}
      {activeTab === '错题本精选' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">精选重温错案攻关</h2>
              <p className="text-xs text-slate-500">点击「模拟纠正重新作答」归功该考点</p>
            </div>
            
            <button 
              onClick={() => alert('错题本导出成功，共计3个错案已更新入李同学复习本。')}
              className="text-xs bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg font-extrabold hover:bg-red-500 hover:text-white hover:border-red-500 cursor-pointer"
            >
              错题本一键打包下载
            </button>
          </div>

          <div className="space-y-4">
            {mistakesList.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-4 hover:border-red-300 transition-all">
                <div className="w-9 h-9 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-extrabold text-xs">
                  WR
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{m.courseName}</span>
                    <span className="text-[9.5px] text-slate-400">|</span>
                    <span className="text-[10px] text-blue-600 font-bold">{m.subSection}</span>
                    <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 rounded px-1">{m.level}</span>
                  </div>

                  <p className="text-[11.5px] text-slate-600 mt-2 font-medium">
                    错因难点：<span className="text-slate-800 font-bold">「{m.detail}」</span>
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleSolveMistake(m.id, m.courseName)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded text-xs font-bold shadow-3xs"
                    >
                      重新解答答复考卷 ➔
                    </button>
                    <button 
                      onClick={() => alert('已为您调阅针对本节的知识交互说明卡。')}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                    >
                      查阅相关推荐知识卡片
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {mistakesList.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <p>🎉 太棒了，所有的精选错题案均已被您彻底击穿掌握！</p>
                <button 
                  onClick={() => setMistakesList([
                    { id: 'm1', courseName: '数据结构与算法', subSection: '4.2 KMP算法主位指偏移推导', level: '高频核心', detail: '链队列头尾指针出队时的空解引用判断失误' },
                    { id: 'm2', courseName: '机器学习基础', subSection: '1.3 MSE与MAE评估损失', level: '中等难度', detail: '均方误差残差对于极端异常值梯度爆炸符号解析错误' }
                  ])}
                  className="mx-auto block text-blue-600 text-xs hover:underline flex items-center justify-center gap-1 font-bold mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>一键复原顽固错题案重做</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW E: RESOURCE FAVORITES BOOKMARKS */}
      {activeTab === '收藏夹' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">学业参考资料极速库</h2>
          <p className="text-xs text-slate-500 mb-6">您收藏的书籍、课堂课件、PPT、随堂录音等，支持点击下载到本地</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_RESOURCES.map((r) => (
              <div key={r.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                      {r.group}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1.5">{r.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">{r.size} | {r.count}</span>
                  </div>
                </div>

                <div className="shrink-0 flex gap-1">
                  <button 
                    onClick={() => alert(`正在调阅资源: 「${r.name}」`)}
                    className="p-1 px-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded text-[11px] font-bold"
                  >
                    阅
                  </button>
                  <button 
                    onClick={() => alert(`已为李同学打包传输 ${r.name}，请检查游览器底部弹框。`)}
                    className="p-1 px-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-[11px] font-bold"
                  >
                    下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW F: STUDY HISTORY LOGS */}
      {activeTab === '学习历史' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Page Title & Tab Nav Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>学习历史</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">回顾李同学在平台的看播行为、随堂测试、AI答疑及课堂互动足迹。</p>
            </div>

            {/* Minor Navigation under History */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start md:self-auto select-none">
              {(['学习记录', '学习统计', '复习清单', '导出报告'] as const).map((sub) => {
                const isActive = historyActiveSubTab === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setHistoryActiveSubTab(sub)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-blue-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {sub === '学习记录' && '📝 学习记录'}
                    {sub === '学习统计' && '📊 学习统计'}
                    {sub === '复习清单' && '🧠 复习清单'}
                    {sub === '导出报告' && '📥 导出报告'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB CONTENT RENDERING */}
          {historyActiveSubTab === '学习记录' && (
            <div className="space-y-6">
              {/* Filters Panel Bar */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Subject Course select */}
                  <div className="relative">
                    <select
                      value={historyCourseFilter}
                      onChange={(e) => setHistoryCourseFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="全部课程">全部课程</option>
                      <option value="数据结构与算法">数据结构与算法</option>
                      <option value="操作系统原理">操作系统原理</option>
                      <option value="计算机网络">计算机网络</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Type Filter dropdown */}
                  <div className="relative">
                    <select
                      value={historyTypeFilter}
                      onChange={(e) => setHistoryTypeFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="全部类型">全部类型</option>
                      <option value="课程学习">课程学习</option>
                      <option value="作业提交">作业提交</option>
                      <option value="AI 辅导">AI 辅导</option>
                      <option value="测验">测验</option>
                      <option value="课件浏览">课件浏览</option>
                      <option value="课堂互动">课堂互动</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={historyStatusFilter}
                      onChange={(e) => setHistoryStatusFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="全部状态">全部状态</option>
                      <option value="已完成">已完成</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Semester and date filter description */}
                  <div className="relative">
                    <select
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-28"
                    >
                      <option value="本学期">本学期</option>
                      <option value="全部历史">全部历史</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Date range picker simulator */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 flex items-center gap-2 select-none font-semibold">
                    <span>2024-09-01 ~ 2024-12-31</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                  {/* Fuzz search input */}
                  <div className="relative flex-1 xl:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="搜索知识点、课程、作业标题..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-205 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-750 font-medium"
                    />
                  </div>

                  {/* Reset Filters CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryCourseFilter('全部课程');
                      setHistoryTypeFilter('全部类型');
                      setHistoryStatusFilter('全部状态');
                      setHistoryDateFilter('本学期');
                      alert('已重置过滤器。显示李同学本学期全部看播及做题痕迹！');
                    }}
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* Three-Column Work Area */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* 1. LEFT COLUMN: TIMELINE LIST (Col span 4) */}
                <div className="xl:col-span-4 lg:col-span-12 space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-500 px-1 font-bold">
                    <span>共 {historyLogs.filter(log => {
                      const matchesSearch = log.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                            log.course.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            log.subtitle.toLowerCase().includes(historySearch.toLowerCase());
                      const matchesCourse = historyCourseFilter === '全部课程' || log.course.includes(historyCourseFilter);
                      const matchesType = historyTypeFilter === '全部类型' || log.type === historyTypeFilter;
                      const matchesStatus = historyStatusFilter === '全部状态' || log.status === historyStatusFilter;
                      return matchesSearch && matchesCourse && matchesType && matchesStatus;
                    }).length} 条过滤后记录 / 累计 128 条</span>
                  </div>

                  {/* Timeline containers */}
                  <div className="space-y-6">
                    {/* Render helper: unique dates grouping */}
                    {['今天', '昨天', '12-18 星期三'].map((dateGroupKey) => {
                      // Filter items for this key group
                      const groupedLogs = historyLogs.filter(log => {
                        if (log.dateGroup !== dateGroupKey) return false;
                        const matchesSearch = log.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                              log.course.toLowerCase().includes(historySearch.toLowerCase()) ||
                                              log.subtitle.toLowerCase().includes(historySearch.toLowerCase());
                        const matchesCourse = historyCourseFilter === '全部课程' || log.course.includes(historyCourseFilter);
                        const matchesType = historyTypeFilter === '全部类型' || log.type === historyTypeFilter;
                        const matchesStatus = historyStatusFilter === '全部状态' || log.status === historyStatusFilter;
                        return matchesSearch && matchesCourse && matchesType && matchesStatus;
                      });

                      if (groupedLogs.length === 0) return null;

                      return (
                        <div key={dateGroupKey} className="space-y-3 font-sans animate-fadeIn">
                          {/* Mini Header Badge for date group */}
                          <div className="flex items-center text-xs font-bold text-slate-700 select-none">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white mr-3"></div>
                            <span className="mr-2">{dateGroupKey}</span>
                            <span className="text-slate-400 text-[10px] font-normal font-mono">
                              {dateGroupKey === '今天' ? '2024-12-20' : dateGroupKey === '昨天' ? '2024-12-19' : '2024-12-18'}
                            </span>
                          </div>

                          {/* Time cards stacks under date badge */}
                          <div className="pl-1 border-l-2 border-slate-200 space-y-4 ml-1.5 relative py-1">
                            {groupedLogs.map((log) => {
                              const isSelected = selectedHistoryId === log.id;
                              
                              // Visual colors based on category
                              const typeColorMap: Record<string, { bg: string, text: string, textBase: string }> = {
                                '课程学习': { bg: 'bg-blue-150/40 text-blue-600', text: 'text-brand', textBase: 'text-blue-500' },
                                '作业提交': { bg: 'bg-green-100/50 text-green-700', text: 'text-green-600', textBase: 'text-green-500' },
                                'AI 辅导': { bg: 'bg-purple-100/50 text-purple-700', text: 'text-purple-600', textBase: 'text-purple-500' },
                                '测验': { bg: 'bg-orange-100/50 text-orange-700', text: 'text-orange-600', textBase: 'text-orange-500' },
                                '课件浏览': { bg: 'bg-cyan-100/50 text-cyan-700', text: 'text-cyan-600', textBase: 'text-cyan-500' },
                                '课堂互动': { bg: 'bg-amber-100/50 text-amber-900', text: 'text-amber-700', textBase: 'text-amber-500' }
                              };
                              const col = typeColorMap[log.type] || { bg: 'bg-slate-100', text: 'text-slate-700', textBase: 'text-slate-500' };

                              return (
                                <div key={log.id} className="relative z-10 group">
                                  {/* Custom bullet dot inside timeline connector */}
                                  <div className={`absolute -left-[18px] top-4 w-2 h-2 rounded-full transition-all border ${
                                    isSelected ? 'bg-blue-600 border-white ring-2 ring-blue-400/40 scale-125' : 'bg-slate-350 border-slate-200'
                                  }`} />

                                  {/* The Clickable card */}
                                  <div
                                    onClick={() => setSelectedHistoryId(log.id)}
                                    className={`ml-5 w-full rounded-xl p-4 flex items-center justify-between cursor-pointer border transition-all ${
                                      isSelected
                                        ? 'bg-blue-50/75 border-blue-300 shadow-xs'
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center flex-1 min-w-0 mr-2">
                                      {/* Timestamp */}
                                      <div className="text-slate-500 text-xs w-10 shrink-0 font-bold font-mono">
                                        {log.time}
                                      </div>

                                      {/* Icon Badge */}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mx-3 ${col.bg}`}>
                                        {log.type === '课程学习' && <Play className="w-4 h-4 ml-0.5 fill-blue-600" />}
                                        {log.type === '作业提交' && <CheckSquare className="w-4 h-4" />}
                                        {log.type === 'AI 辅导' && <Bot className="w-4 h-4 animate-pulse" />}
                                        {log.type === '测验' && <FileText className="w-4 h-4" />}
                                        {log.type === '课件浏览' && <Sliders className="w-4 h-4" />}
                                        {log.type === '课堂互动' && <Users className="w-4 h-4" />}
                                      </div>

                                      {/* Main Text block */}
                                      <div className="flex-1 min-w-0">
                                        <div className={`text-[10px] font-bold uppercase tracking-tight mb-0.5 ${col.text}`}>
                                          {log.type}
                                        </div>
                                        <h4 className="text-slate-800 font-bold text-xs truncate max-w-[200px]">
                                          {log.title}
                                        </h4>
                                        <p className="text-slate-450 text-[11px] mt-0.5 truncate max-w-[190px]">
                                          {log.subtitle}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Score or Stats block */}
                                    <div className="flex items-center text-right ml-2 shrink-0 font-sans">
                                      <div className="mr-3">
                                        <div className="text-[10px] text-slate-400 font-bold select-none">{log.metricLabel}</div>
                                        <div className="text-xs font-extrabold text-slate-700">
                                          {log.metricVal} <span className="text-[10px] font-normal text-slate-450">{log.metricUnit}</span>
                                        </div>
                                      </div>
                                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-white text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:text-blue-500'
                                      }`}>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Fallback when search list empty */}
                    {historyLogs.filter(log => {
                      const matchesSearch = log.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                            log.course.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            log.subtitle.toLowerCase().includes(historySearch.toLowerCase());
                      const matchesCourse = historyCourseFilter === '全部课程' || log.course.includes(historyCourseFilter);
                      const matchesType = historyTypeFilter === '全部类型' || log.type === historyTypeFilter;
                      const matchesStatus = historyStatusFilter === '全部状态' || log.status === historyStatusFilter;
                      return matchesSearch && matchesCourse && matchesType && matchesStatus;
                    }).length === 0 && (
                      <div className="bg-white p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-450 space-y-2 select-none">
                        <History className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1} />
                        <p className="text-xs font-bold text-slate-600">未检索到任何符合条件的学习日志迹痕</p>
                        <p className="text-[11px]">请尝试更改右上角的课系筛选器、类型、状态或输入词重置！</p>
                      </div>
                    )}
                  </div>

                  {/* Load More Button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => alert('✨ 已加载李同学在平台本学期的所有 128 条核心看播与诊断测验日志。系统运转正常！')}
                      className="text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold px-4 py-2 transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-3xs"
                    >
                      <span>加载更多</span>
                      <ChevronDown className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
                    </button>
                  </div>
                </div>

                {/* 2. MIDDLE COLUMN: DETAIL WORKSPACE PANEL (Col span 5) */}
                <div className="xl:col-span-5 lg:col-span-6 space-y-4 xl:sticky xl:top-6 xl:self-start max-h-[calc(100vh-150px)] overflow-y-auto pr-1">
                  {(() => {
                    // Find selected log
                    const log = historyLogs.find(l => l.id === selectedHistoryId) || historyLogs[0];
                    if (!log) {
                      return (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 h-[550px] flex flex-col items-center justify-center text-slate-400 text-center select-none">
                          <Sliders className="w-12 h-12 text-slate-300 mb-2 animate-spin" />
                          <h3 className="font-bold text-slate-800 text-sm">学业追踪端已准备就绪</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-[250px]">请在左侧时间轴点选某一条看播流，以展示全维学理诊断指标和AI互动督导。</p>
                        </div>
                      );
                    }

                    // Simulated AI suggestions per event
                    const getLogAISuggestions = (id: string): string => {
                      const suggestions: Record<string, string> = {
                        'h1': '看播良好！判定在「括号匹配」与「中缀求值」部分有较高把握。但在「非递归模拟递归」场景存在栈爆上限风险。建议课后到 错题本 中检索 "递归栈上溢" 作仿真解答。',
                        'h2': '由于链栈指针边界条件误判，遗留的空野指针导致丢掉末题。建议回顾单链表删除尾结点的逻辑机制，强化 delete 析构操作意识。',
                        'h3': '出栈合法规律解答完美！ Catalan数 h(n)=C(2n, n)/(n+1) 解法您已熟练记忆，下章可在“自测考核”中直接尝试困难度习题挑战。',
                        'h4': '关于双端队列两端增删判定丢了分。老师在 12-19 讲习PPT中针对 "循环队列假溢出判别首端指针" 做了全面图解，建议调阅 PPT 第25页温习。',
                        'h5': '精看了中断发生时硬件把PC、PSW、通用寄存器直接压入核心栈（Kernel Stack）这重要原理。考研中常涉及核心栈与进程栈切换考点，掌握极其到位！',
                        'h6': '蓝牙定位考勤已生效，课堂先序深度遍历的教师随堂抽问您答对并加了星星。平时绩点加权已更新至98分。',
                        'h7': '成功对单链表挂载了 Dummy Root 哨兵辅助首节点，能彻底省去 node.next == null 的特判。代码架构成熟敏捷，判定掌握值完美！',
                        'h8': '网络信道载波碰撞检测指数退避丢分，本周末在【考试中心】有一场局域网多路传输的随堂自测，建议完成相应前驱补足。'
                      };
                      return suggestions[id] || '看播记录完成良好，本次掌握度变化曲线在科学预测值之内。建议继续高标准打卡学习！';
                    };

                    return (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Detail Header wrapper */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
                          <div className="absolute top-6 right-6">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                              <Check className="w-3 h-3 mr-1" />
                              <span>已完成</span>
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-mono tracking-wider select-none mb-2.5 inline-block">
                            {log.type}
                          </span>
                          <h2 className="text-base font-extrabold text-slate-800 pr-20 leading-snug">
                            {log.title}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400 font-semibold font-mono">
                            <span>科目: {log.course}</span>
                            <span>•</span>
                            <span>时间: {log.dateStr} {log.time}</span>
                          </div>

                          {/* Primary CTA action based on row type */}
                          <div className="mt-5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`正在为您接续跳转并载入 "${log.title}" 的对应互动学习页面，请稍后...`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-500/10 flex items-center gap-1"
                            >
                              {log.type === '课程学习' && <Play className="w-3.5 h-3.5 fill-white stroke-none" />}
                              {log.type === '作业提交' && <CheckSquare className="w-3.5 h-3.5" />}
                              {log.type === 'AI 辅导' && <Bot className="w-3.5 h-3.5" />}
                              {log.type === '测验' && <FileText className="w-3.5 h-3.5" />}
                              {log.type === '课件浏览' && <Sliders className="w-3.5 h-3.5" />}
                              {log.type === '课堂互动' && <Users className="w-3.5 h-3.5" />}
                              <span>
                                {log.type === '课程学习' && '继续看播学习'}
                                {log.type === '作业提交' && '查看原题与订正'}
                                {log.type === 'AI 辅导' && '回顾我的追问历史'}
                                {log.type === '测验' && '重新做题模拟一遍'}
                                {log.type === '课件浏览' && '从当前点翻开PPT课件'}
                                {log.type === '课堂互动' && '查看当时的解答细节'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                alert(`已将该历史内容「${log.title}」标记。`);
                              }}
                              className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                              <span>收藏该考点</span>
                            </button>
                          </div>

                          {/* Inner tab nav within selected item */}
                          <div className="mt-6 border-b border-slate-100 flex space-x-6 select-none font-sans">
                            {(['学习详情', '关联内容', 'AI 学习复盘'] as const).map((t) => {
                              const isActive = detailTabsActiveTab === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setDetailTabsActiveTab(t)}
                                  className={`pb-2 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                                    isActive
                                      ? 'text-blue-600 border-blue-600'
                                      : 'text-slate-400 border-transparent hover:text-slate-650'
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detail Tab Contents */}
                        {detailTabsActiveTab === '学习详情' && (
                          <div className="space-y-4 animate-fadeIn">
                            {/* Completion Progress widget */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-3xs">
                              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                                <span className="w-1 h-3 bg-blue-600 rounded"></span>
                                <span>学习完成状况</span>
                              </h3>

                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-600">
                                  <span>进度或分数量度</span>
                                  <span className="text-blue-600 font-mono">
                                    {log.details.completionVal} ({log.details.percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden select-none">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${log.details.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Metadata list */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs">
                              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1 mb-4">
                                <span className="w-1 h-3 bg-blue-600 rounded"></span>
                                <span>学习播放及采集参数</span>
                              </h3>

                              <div className="grid grid-cols-4 gap-4 text-center font-sans">
                                <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-semibold mb-1">看播比例</div>
                                  <div className="text-xs font-extrabold text-slate-800 font-mono">
                                    {log.details.metrics.watchProgress}
                                  </div>
                                </div>
                                <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-semibold mb-1">播放速率</div>
                                  <div className="text-xs font-extrabold text-slate-800 font-mono">
                                    {log.details.metrics.playbackSpeed}
                                  </div>
                                </div>
                                <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-semibold mb-1">中途暂停</div>
                                  <div className="text-xs font-extrabold text-slate-800 font-mono">
                                    {log.details.metrics.pausedCount} 次
                                  </div>
                                </div>
                                <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-semibold mb-1">实时笔记</div>
                                  <div className="text-xs font-extrabold text-slate-800 font-mono">
                                    {log.details.metrics.notesTaken} 条
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {detailTabsActiveTab === '关联内容' && (
                          <div className="space-y-4 animate-fadeIn">
                            {/* General Outcomes Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-3xs font-sans">
                              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                                <span className="w-1 h-3 bg-green-500 rounded"></span>
                                <span>收获及掌握变化</span>
                              </h3>

                              <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                                <div>
                                  <div className="text-[10px] text-slate-400 font-bold mb-1">学习用时</div>
                                  <div className="text-sm font-extrabold text-slate-800">
                                    {log.details.outcomes.duration}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 font-bold mb-1">判定状态</div>
                                  <span className="inline-block text-[11px] font-extrabold text-green-600 mt-1">
                                    {log.details.outcomes.status}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 font-bold mb-1">掌握度影响</div>
                                  <span className="inline-block text-[11px] font-extrabold text-emerald-600 mt-1">
                                    ↑ {log.details.outcomes.influence}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs text-slate-650">
                                <div className="text-[10px] text-slate-400 font-bold">同步关联自检</div>
                                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                  <span className="font-bold text-slate-700 truncate max-w-[200px]">{log.details.outcomes.relatedQuiz}</span>
                                  <button
                                    onClick={() => alert(`正在跳转至错题中心以回顾题目解析，请稍后...`)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline"
                                  >
                                    查验解析 &gt;
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Summary card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs space-y-2.5">
                              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                                <span className="w-1 h-3 bg-blue-600 rounded"></span>
                                <span>学习摘要备忘</span>
                              </h3>
                              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                {log.details.outcomes.summary}
                              </p>
                            </div>
                          </div>
                        )}

                        {detailTabsActiveTab === 'AI 学习复盘' && (
                          <div className="space-y-4 animate-fadeIn">
                            {/* AI diagnostic summary */}
                            <div className="bg-linear-to-b from-indigo-950 to-slate-900 border border-slate-800 text-white rounded-xl p-5 space-y-3 relative overflow-hidden">
                              <div className="absolute right-3 -bottom-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                              <div className="flex items-center gap-1.5 text-blue-400 font-extrabold text-xs select-none">
                                <Bot className="w-4 h-4 text-blue-400 animate-bounce" />
                                <span>AI 智能提分复盘意见</span>
                              </div>

                              <p className="text-xs text-slate-250 leading-relaxed font-semibold">
                                {getLogAISuggestions(log.id)}
                              </p>

                              <p className="text-[10px] text-slate-450 leading-normal border-t border-slate-800 pt-2 select-none">
                                💡 本学期推荐策略：重点攻坚 栈递归 与 指针异常 检测。高频考察率达 78%。
                              </p>
                            </div>

                            {/* Student Ask Box */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-3xs">
                              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1 select-none">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                <span>向 AI 助教继续追问此考点</span>
                              </h3>

                              {/* Ask History recursion block */}
                              {aiResponseList[log.id] && aiResponseList[log.id].map((chat, cIdx) => (
                                <div 
                                  key={cIdx} 
                                  className={`p-2.5 text-xs rounded-lg ${
                                    chat.startsWith('问：') 
                                      ? 'bg-slate-50 text-slate-700 font-bold border-l-2 border-slate-400' 
                                      : 'bg-blue-50/50 text-blue-900 font-semibold border-l-2 border-blue-400'
                                  }`}
                                >
                                  {chat}
                                </div>
                              ))}

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customPrompt}
                                  onChange={(e) => setCustomPrompt(e.target.value)}
                                  placeholder="对这个栈操作/这道题错项有疑问？输入即可向大模型提问..."
                                  className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAskAICustom(log.id);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAskAICustom(log.id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  提问
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Export or action controls bar at bottom of Detail */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-2 font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`已将记录「${log.title}」标记为李同学的重点复盘标记，随后在周报、错题本回顾中将置顶显示！`);
                            }}
                            className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span>设为重点学学</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              alert(`您已成功导出此事件「${log.type} — ${log.title}」单项PDF诊断卡片。\n保存路径：下载文件夹/Study_Record_${log.id}.pdf`);
                            }}
                            className="flex-1 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>导出单项记录</span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                alert('分享、提交上诉质检、关联同学答题对比等功能随时接入此项！');
                              }}
                              className="py-1.5 px-3 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. RIGHT COLUMN: WIDGET ANALYTICS HUB (Col span 3) */}
                <div className="xl:col-span-3 lg:col-span-12 space-y-6 xl:sticky xl:top-6 xl:self-start max-h-[calc(100vh-150px)] overflow-y-auto pr-1">
                  
                  {/* Card A: Study Overview Tracker */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2 select-none">
                      <span className="w-1.5 h-3.5 bg-blue-600 rounded-sm"></span>
                      <span>学情统计大览</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 font-mono">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold select-none">连续学习打卡</div>
                        <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                          18 <span className="text-[10px] font-bold text-slate-450">天</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-bold select-none">日均学习看播</div>
                        <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                          2.6 <span className="text-[10px] font-bold text-slate-450">小时</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-bold select-none">总打卡积累</div>
                        <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                          186.4 <span className="text-[10px] font-bold text-slate-450">小时</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-bold select-none">任务通过数</div>
                        <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                          86 <span className="text-[10px] font-bold text-slate-450">个</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card B: Study Duration Distribution Circular Meter */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-3.5 bg-blue-600 rounded-sm"></span>
                      <span>学习时长比重分布</span>
                    </h3>

                    <div className="flex border-b border-slate-150 pb-2 text-[11px] font-bold gap-3 select-none">
                      <button type="button" className="text-blue-600 border-b border-blue-600 pb-0.5">按学时分布</button>
                      <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => alert('按时间活跃度（早间/黄金档）计算比重。数据整理中！')}>按时间段</button>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-4 select-none">
                      {/* SVG Donut Chart */}
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                          {/* Circle Segment 1: DS (38%) */}
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1d4ed8" strokeWidth="3" strokeDasharray="38 62" strokeDashoffset="0" />
                          {/* Circle Segment 2: OS (27%) */}
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="27 73" strokeDashoffset="-38" />
                          {/* Circle Segment 3: Net (24%) */}
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="24 76" strokeDashoffset="-65" />
                          {/* Circle Segment 4: Others (11%) */}
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#94a3b8" strokeWidth="3" strokeDasharray="11 89" strokeDashoffset="-89" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-800">186.4</span>
                          <span className="text-[8px] text-slate-400">学时</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 space-y-2 text-[11px] font-sans font-semibold w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-700 mr-1.5" />
                            <span className="text-slate-600 truncate max-w-[100px]">数据结构与算法</span>
                          </div>
                          <span className="text-slate-450 font-mono">45.2h (38%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                            <span className="text-slate-600 truncate max-w-[100px]">操作系统</span>
                          </div>
                          <span className="text-slate-450 font-mono">32.1h (27%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                            <span className="text-slate-600 truncate max-w-[100px]">计算机网络</span>
                          </div>
                          <span className="text-slate-450 font-mono">28.6h (24%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-slate-400 mr-1.5" />
                            <span className="text-slate-600 truncate max-w-[100px]">其他兴趣拓展</span>
                          </div>
                          <span className="text-slate-450 font-mono">12.3h (11%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

                  {/* SUB-TAB B: 学习统计 */}
          {historyActiveSubTab === '学习统计' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Statistical cards layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
                  <div className="text-xs font-bold text-slate-400 select-none">本期累计打卡时长</div>
                  <div className="text-2xl font-black text-slate-900 font-mono flex items-baseline gap-1">
                    <span>186.4</span>
                    <span className="text-xs font-bold text-slate-400">小时</span>
                  </div>
                  <div className="text-[11px] text-green-600 font-semibold">
                    🏆 击败了全班 92.5% 的学生！
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
                  <div className="text-xs font-bold text-slate-400 select-none">章节平均掌握度</div>
                  <div className="text-2xl font-black text-[#10B981] font-mono flex items-baseline gap-1">
                    <span>78.3</span>
                    <span className="text-xs font-bold text-slate-400">分</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    相比上周：提升 <span className="text-green-600 font-bold">↑ 3.2%</span> 分值
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
                  <div className="text-xs font-bold text-slate-400 select-none">自主突破AI测验</div>
                  <div className="text-2xl font-black text-blue-600 font-mono flex items-baseline gap-1">
                    <span>42</span>
                    <span className="text-xs font-bold text-slate-400">次</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    错题复温覆盖度达到 <span className="text-blue-500 font-bold">96%</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
                  <div className="text-xs font-bold text-slate-400 select-none">学业成就星宿</div>
                  <div className="text-2xl font-black text-amber-500 font-mono flex items-baseline gap-1">
                    <span>15</span>
                    <span className="text-xs font-bold text-slate-400">枚</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    本学期已解锁专属荣誉徽章
                  </div>
                </div>
              </div>

              {/* Heatmap structure */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 select-none">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                    <span>学习打卡热力图 (近30天)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">暗色表示看播与训练强度更高</span>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-1 min-w-[600px] justify-between">
                    {Array.from({ length: 30 }).map((_, dIdx) => {
                      const activeColors = [
                        'bg-slate-50 border-slate-100 text-slate-300',
                        'bg-blue-50 border-blue-100 text-blue-600',
                        'bg-blue-100 border-blue-200 text-blue-700',
                        'bg-blue-500 border-blue-600 text-white',
                        'bg-blue-700 border-blue-800 text-white'
                      ];
                      const colorIndex = (dIdx * 3 + 7) % 5;
                      return (
                        <div
                          key={dIdx}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold font-mono transition-all hover:scale-110 cursor-pointer ${activeColors[colorIndex]}`}
                          title={`第 ${dIdx + 1} 天学习强度`}
                          onClick={() => {
                            alert(`第 ${dIdx + 1} 天检索到在线学习足迹，建议合理调配周末进行自测弥补！`);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-right select-none">
                  ⚡ 统计学依据：李同学已在此平台积累签到 246 天，平均打卡通过率维持在 88% 的高优胜位！
                </p>
              </div>

              {/* Progress visual column cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SVG Learning curves */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 select-none">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                    <span>本学期看播时长周变动趋势 (小时)</span>
                  </h3>

                  {/* Manual mock bar graph using tailwind heights */}
                  <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-slate-100 select-none font-mono">
                    {[
                      { week: '第1周', hr: 12, max: 25 },
                      { week: '第2周', hr: 18, max: 25 },
                      { week: '第3周', hr: 15, max: 25 },
                      { week: '第4周', hr: 22, max: 25 },
                      { week: '第5周', hr: 8, max: 25 },
                      { week: '第6周', hr: 24, max: 25 },
                      { week: '第7周', hr: 19, max: 25 }
                    ].map((bar, wIdx) => {
                      const pct = Math.round((bar.hr / bar.max) * 100);
                      return (
                        <div key={wIdx} className="flex flex-col items-center gap-2 group w-12 cursor-pointer">
                          <div className="text-[10px] text-blue-600 font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                            {bar.hr}h
                          </div>
                          <div 
                            className="bg-blue-600 hover:bg-blue-700 w-8 rounded-t-xs transition-all duration-500"
                            style={{ height: `${pct * 1.5}px` }}
                          />
                          <span className="text-[10px] text-slate-500 font-bold">{bar.week}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500 leading-normal font-semibold font-sans">
                    💡 **AI 学课波动分析**：第5周看播时长呈现明显谷值（主因当周为英语精读和体育达标考核周，基础理科看播有所避让）。随后的第6周出现反弹，李同学主动在周末刷通看完了第二章临界区信号量精细求值。
                  </p>
                </div>

                {/* Subsections Mastery Progress */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 select-none">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                    <span>各主修门类诊断知识深度评优</span>
                  </h3>

                  <div className="space-y-4 font-sans font-semibold">
                    {[
                      { title: '栈与队列链式转换 (数据结构)', val: 92, status: '杰出' },
                      { title: '进程同步信号量P/V操作 (操作系统)', val: 68, status: '良好' },
                      { title: '多路信道载波调制CSMA校验 (计算机网络)', val: 74, status: '良好' },
                      { title: '关系模式3范式函数依赖推理 (数据库)', val: 86, status: '优秀' },
                      { title: '一阶逻辑反演合一规则化 (人工智能)', val: 40, status: '待强化' }
                    ].map((mastery, mIdx) => (
                      <div key={mIdx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-700">{mastery.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                            mastery.val >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                            mastery.val >= 70 ? 'bg-blue-50 text-blue-600 border border-blue-150' :
                            'bg-red-50 text-red-650 border border-red-150'
                          }`}>
                            {mastery.status} ({mastery.val}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              mastery.val >= 90 ? 'bg-emerald-500' :
                              mastery.val >= 70 ? 'bg-blue-505' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${mastery.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB C: 复习清单 */}
          {historyActiveSubTab === '复习清单' && (
            <div className="space-y-6 animate-fadeIn font-sans">
              {/* Introduction header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">✍️ 个人重大难点及重点考前提纯清单</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    系统根据您在「学习历史」、「错题本」中的错因点，为您动态提纯匹配生成的精准巩固复盘要点。
                  </p>
                </div>

                {/* Form to append review point */}
                <div className="flex gap-2 items-center shrink-0">
                  <input
                    type="text"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="新增手动复习要点..."
                    className="text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none w-44 font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!newReviewTitle.trim()) return;
                        setReviewList(prev => [
                          ...prev,
                          {
                            id: 'r' + (prev.length + 1),
                            title: newReviewTitle,
                            priority: newReviewPriority,
                            status: '待复习'
                          }
                        ]);
                        setNewReviewTitle('');
                        alert('已添加该复习巩固项！');
                      }
                    }}
                  />
                  <select
                    value={newReviewPriority}
                    onChange={(e) => setNewReviewPriority(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg text-xs font-bold"
                  >
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newReviewTitle.trim()) return;
                      setReviewList(prev => [
                        ...prev,
                        {
                          id: 'r' + (prev.length + 1),
                          title: newReviewTitle,
                          priority: newReviewPriority,
                          status: '待复习'
                        }
                      ]);
                      setNewReviewTitle('');
                      alert('已添加该复习巩固项！');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Review Item Lists Cards */}
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-3xs">
                {reviewList.map((item) => {
                  const isDone = item.status === '已复习';
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewList(prev => prev.map(r => r.id === item.id ? {
                              ...r,
                              status: r.status === '已复习' ? '待复习' : '已复习'
                            } : r));
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <h4 className={`text-xs md:text-sm font-bold tracking-tight ${
                            isDone ? 'text-slate-400 line-through' : 'text-slate-800'
                          }`}>
                            {item.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 select-none">
                            <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${
                              item.priority === '高' ? 'bg-red-50 text-red-700 border-red-150' :
                              item.priority === '中' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                              'bg-blue-50 text-blue-700 border-blue-150'
                            }`}>
                              {item.priority}级重要考点
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full select-none">
                            已攻关
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              alert(`为您匹配到该要点下 「大模型3条高价值押题测验」 \n请跳转并测试！`);
                            }}
                            className="bg-blue-50 hover:bg-blue-105 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-110 transition-colors cursor-pointer"
                          >
                            AI 辅导诊断
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setReviewList(prev => prev.filter(r => r.id !== item.id));
                            alert('已移除该复习要点。');
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          title="在列表中丢弃要点"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {reviewList.length === 0 && (
                  <div className="p-12 text-center text-slate-400 select-none">
                    📭 清单已被清空！李同学无忧。添加您的第一个复习指标吧！
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB D: 导出报告 */}
          {historyActiveSubTab === '导出报告' && (
            <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-md font-sans">
              
              <div className="text-center space-y-2 select-none pb-4 border-b border-slate-100">
                <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="font-extrabold text-slate-900 text-base">下载李同学专属智学诊断白皮书</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  针对本周期看播深度、完成比率及AI测试错漏，系统已一键排版生成符合教学规范的 PDF/Excel 报告。
                </p>
              </div>

              <div className="space-y-4 font-semibold font-sans text-xs text-slate-700">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold mb-1">目标报告名称</label>
                  <input
                    type="text"
                    defaultValue="李同学2024春季主要学科学情学理剖析周报_数据结构第5周.pdf"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">统计起始范畴</label>
                    <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg text-xs font-bold">
                      <option>最近一个月数据</option>
                      <option>整个秋季学段 (当前)</option>
                      <option>上周错因巩固</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">合并错题推荐</label>
                    <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg text-xs font-bold">
                      <option>包含当前全部错项并附加AI点评 (推荐)</option>
                      <option>仅看播学时报表</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3.5 bg-blue-50 text-blue-900 border border-blue-105 rounded-xl text-[11px] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-blue-550 shrink-0" />
                  <span>
                    💡 <strong>大模型提纯增强</strong>：学业诊断白皮书中将自动结合大语言深度模型评估，为您匹配 <strong>数据结构</strong> 栈、<strong>操作系统</strong> 临界互斥 的高附加值补足测验，有助于您迅速提分。
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => alert('报告参数重设。')}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('📥 导出引擎启动中...\n已自动生成报告并排队打码。\n您的电脑将在 3 秒内直接载入「李同学2024春季主要学科学情学理剖析周报_数据结构第5周.pdf」。请注意查看您的系统下载栏！');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  确认生成并下载 PDF
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* VIEW G: INDIVIDUAL TODO TASKS LIST */}
      {activeTab === '个人待办' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-600" />
                <span>个人待办任务清单</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                在这里随时添加您的学期任务，配置高抗干扰桌面倒计时督测，高标准打卡学习进度。
              </p>
            </div>
            
            <button 
              onClick={() => setTaskIsAdding(!taskIsAdding)}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{taskIsAdding ? '收起填写' : '添加学业任务'}</span>
            </button>
          </div>

          {/* Add task form collapsible */}
          {taskIsAdding && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskNewTitle.trim()) return;
                
                const typeStyles = {
                  '作业': 'bg-red-50 text-red-500 border border-red-100',
                  '考试': 'bg-orange-50 text-orange-500 border border-orange-100',
                  '学习': 'bg-blue-50 text-blue-500 border border-blue-100'
                };
                
                const newTask = {
                  id: `task-${Date.now()}`,
                  type: taskNewType,
                  title: taskNewTitle.trim(),
                  deadline: `截止：${taskNewDeadline}`,
                  status: '待完成',
                  badgeStyle: typeStyles[taskNewType] || 'bg-slate-50 text-slate-500 border border-slate-100',
                  reminderTime: ''
                };
                
                if (setTasks) {
                  setTasks(prev => [...prev, newTask]);
                  setTaskNewTitle('');
                  setTaskIsAdding(false);
                  setTaskToastMsg(`✨ 新学业待办 "${newTask.title}" 成功加入学习序列！`);
                }
              }} 
              className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4 max-w-xl animate-fadeIn"
            >
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-blue-600 rounded"></span> 新增待办项目
              </h3>
              <div className="space-y-3.5 font-sans">
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1">任务名称 (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：准备《机器学习》第2章 随堂开卷检测"
                    value={taskNewTitle}
                    onChange={(e) => setTaskNewTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-1">任务属性 (Type)</label>
                    <div className="flex gap-2">
                      {(['作业', '考试', '学习'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTaskNewType(type)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            taskNewType === type 
                              ? 'bg-blue-50 border-blue-300 text-blue-600' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-bold mb-1">截止日期 (Deadline)</label>
                    <input
                      type="text"
                      required
                      placeholder="格式：2026-06-05 23:59"
                      value={taskNewDeadline}
                      onChange={(e) => setTaskNewDeadline(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTaskIsAdding(false)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer shadow-sm transition-colors"
                  >
                    确认添加
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Core Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start font-sans">
            {/* Left Col: Filters + Task item stack list */}
            <div className="xl:col-span-8 space-y-4">
              {/* Filter controls panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold select-none">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="输入关键词模糊检索任务..."
                    value={taskSearchText}
                    onChange={(e) => setTaskSearchText(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 font-medium"
                  />
                </div>

                {/* Pill filters stack */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Status switcher */}
                  <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50/50 shrink-0 mr-2">
                    {(['all', 'pending', 'completed'] as const).map((st) => {
                      const isSel = taskFilterStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setTaskFilterStatus(st)}
                          className={`px-2 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                            isSel 
                              ? 'bg-white text-blue-600 shadow-3xs border border-slate-100' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {st === 'all' && '全部'}
                          {st === 'pending' && `待完成 (${tasks.filter(t => t.status !== '已完成').length})`}
                          {st === 'completed' && `已完成 (${tasks.filter(t => t.status === '已完成').length})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <select
                      value={taskFilterCategory}
                      onChange={(e) => setTaskFilterCategory(e.target.value)}
                      className="text-[10.5px] font-extrabold text-slate-600 bg-white border border-slate-200/85 rounded px-1.5 py-1 focus:outline-hidden"
                    >
                      <option value="all">全部分类</option>
                      <option value="homework">📚 课后作业</option>
                      <option value="exam">📝 重大考试</option>
                      <option value="study">🎯 自主学习/AI定制</option>
                    </select>
                  </div>

                  {tasks.filter(t => t.status === '已完成').length > 0 && (
                    <button
                      onClick={() => {
                        const completedCount = tasks.filter(t => t.status === '已完成').length;
                        if (setTasks) {
                          setTasks(prev => prev.filter(t => t.status !== '已完成'));
                          setTaskToastMsg(`🧹 成功清除了 ${completedCount} 项已完成的优胜学业任务`);
                        }
                      }}
                      className="text-[10.5px] text-red-500 hover:bg-red-50 font-bold px-2 py-1 rounded border border-transparent hover:border-red-100 transition-all cursor-pointer flex items-center gap-0.5 ml-auto"
                      title="清除已经打卡完成的任务"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>一键清理已完成</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Task Toast Message nested feedback */}
              {taskToastMsg && (
                <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-3 rounded-lg text-xs font-semibold shadow-xs animate-fadeIn">
                  {taskToastMsg}
                </div>
              )}

              {/* Task Items list container */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 pb-2">
                {tasks.filter((task) => {
                  const titleMatch = task.title.toLowerCase().includes(taskSearchText.toLowerCase());
                  const statusMatch = 
                    taskFilterStatus === 'all' ? true :
                    taskFilterStatus === 'pending' ? task.status !== '已完成' :
                    task.status === '已完成';
                  const categoryMatch = 
                    taskFilterCategory === 'all' ? true :
                    taskFilterCategory === 'homework' ? task.type === '作业' :
                    taskFilterCategory === 'exam' ? task.type === '考试' :
                    taskFilterCategory === 'study' ? task.type === '学习' : true;
                  return titleMatch && statusMatch && categoryMatch;
                }).length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2 select-none">
                    <div className="text-xl">📭</div>
                    <p className="text-xs font-semibold text-slate-500">
                      你当前尚未发现符合筛选要求的学习待办项目
                    </p>
                    <p className="text-[11px] text-slate-400">
                      您可以点击右上方 “添加学业任务” 扩充自主复习大板块！
                    </p>
                  </div>
                ) : (
                  tasks.filter((task) => {
                    const titleMatch = task.title.toLowerCase().includes(taskSearchText.toLowerCase());
                    const statusMatch = 
                      taskFilterStatus === 'all' ? true :
                      taskFilterStatus === 'pending' ? task.status !== '已完成' :
                      task.status === '已完成';
                    const categoryMatch = 
                      taskFilterCategory === 'all' ? true :
                      taskFilterCategory === 'homework' ? task.type === '作业' :
                      taskFilterCategory === 'exam' ? task.type === '考试' :
                      taskFilterCategory === 'study' ? task.type === '学习' : true;
                    return titleMatch && statusMatch && categoryMatch;
                  }).map((task) => {
                    const isCompleted = task.status === '已完成';
                    return (
                      <div 
                        key={task.id} 
                        className={`p-4 md:px-5 flex flex-col transition-colors ${
                          isCompleted ? 'bg-slate-50/40 opacity-75' : 'hover:bg-slate-50/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                if (setTasks) {
                                  setTasks(prev => prev.map(t => t.id === task.id ? { 
                                    ...t, 
                                    status: '已完成', 
                                    badgeStyle: 'bg-green-50 text-green-500 border border-green-100',
                                    reminderTime: ''
                                  } : t));
                                  setTaskToastMsg(`✅ 恭喜！您已成功完成了该待办任务！`);
                                }
                              }}
                              disabled={isCompleted}
                              className={`p-0.5 rounded-full shrink-0 transition-all duration-200 cursor-pointer ${
                                isCompleted 
                                  ? 'text-emerald-500 scale-95' 
                                  : 'text-slate-300 hover:text-blue-500 hover:scale-105'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50 stroke-[2.2]" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300" />
                              )}
                            </button>

                            <div className="space-y-1.5">
                              <h4 className={`text-sm font-semibold tracking-tight transition-all leading-relaxed ${
                                isCompleted 
                                  ? 'text-slate-400 line-through font-medium' 
                                  : 'text-slate-800'
                              }`}>
                                {task.title}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-2 select-none">
                                <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-sm border ${task.badgeStyle}`}>
                                  {task.type}
                                </span>
                                
                                <span className="text-[11px] text-slate-400 font-mono font-medium flex items-center gap-1 select-none">
                                  <CalendarRange className="w-3 h-3 shrink-0 text-slate-300" />
                                  <span>{task.deadline}</span>
                                </span>

                                {task.reminderTime && (
                                  <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 animate-pulse select-none">
                                    <Bell className="w-3 h-3 text-blue-500 shrink-0 animate-bounce" />
                                    <span>提醒: {task.reminderTime}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action controls button column */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isCompleted && (
                              <button 
                                onClick={() => {
                                  setTaskActiveSetupId(taskActiveSetupId === task.id ? null : task.id);
                                }}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  task.reminderTime 
                                    ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50'
                                }`}
                                title="预约学业倒计时专注提醒"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {!isCompleted ? (
                              <button 
                                onClick={() => {
                                  if (setTasks) {
                                    setTasks(prev => prev.map(t => t.id === task.id ? { 
                                      ...t, 
                                      status: '已完成', 
                                      badgeStyle: 'bg-green-50 text-green-500 border border-green-100',
                                      reminderTime: ''
                                    } : t));
                                    setTaskToastMsg(`✅ 恭喜！您已成功完成了该待办任务！`);
                                  }
                                }}
                                className="text-xs text-blue-600 bg-blue-50 border border-blue-100 hover:border-blue-500 hover:bg-blue-600 hover:text-white px-3.5 py-1 rounded-full transition-all cursor-pointer font-bold select-none"
                              >
                                去完成
                              </button>
                            ) : (
                              <span className="text-xs font-semibold px-2.5 py-1 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full select-none">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Done
                              </span>
                            )}

                            <button
                              onClick={() => {
                                if (setTasks) {
                                  setTasks(prev => prev.filter(t => t.id !== task.id));
                                  setTaskToastMsg(`🗑️ 已将该待办移出学习计划`);
                                }
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                              title="在列表中丢弃待办"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable scheduler inside task */}
                        {!isCompleted && taskActiveSetupId === task.id && (
                          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 animate-fadeIn relative max-w-lg select-none">
                            <div className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1.5">
                              <span>🛎️ 设定定时拦截式高强度提醒 (学业督测):</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onSetReminder) {
                                    onSetReminder(task.id, 10, '10秒后');
                                    setTaskActiveSetupId(null);
                                    setTaskToastMsg(`⏰ 提醒设定成功！\n系统将在 10 秒后发出专注提醒桌面通知。`);
                                  }
                                }}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200/50 transition-all cursor-pointer shadow-3xs"
                              >
                                ⚡ 10秒后 (测试)
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onSetReminder) {
                                    onSetReminder(task.id, 1500, '25分钟(番茄钟)');
                                    setTaskActiveSetupId(null);
                                    setTaskToastMsg(`⏰ 提醒设定成功！\n系统将在 25分钟(番茄钟) 后发出专注提醒桌面通知。`);
                                  }
                                }}
                                className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                🍅 25分钟 (专注)
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onSetReminder) {
                                    onSetReminder(task.id, 3600, '1小时后');
                                    setTaskActiveSetupId(null);
                                    setTaskToastMsg(`⏰ 提醒设定成功！\n系统将在 1小时后 发出专注提醒桌面通知。`);
                                  }
                                }}
                                className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                1小时
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (setTasks) {
                                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminderTime: '' } : t));
                                    setTaskActiveSetupId(null);
                                    setTaskToastMsg('🔕 已成功清除该待办的专注提醒');
                                  }
                                }}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1 rounded transition-colors ml-auto cursor-pointer"
                              >
                                取消并清除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Col: Stats board + AI Assistant advice */}
            <div className="xl:col-span-4 space-y-6">
              {/* Stats Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 mb-4 select-none">
                  <span className="w-1.5 h-3.5 bg-blue-500 rounded-sm"></span>
                  今日待办统筹率
                </h3>
                
                <div className="flex items-center gap-6">
                  {/* SVG circular progress ring */}
                  <div className="relative w-20 h-20 shrink-0 select-none">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                      <circle
                        className="text-slate-100 stroke-current"
                        strokeWidth="3.5"
                        fill="transparent"
                        r="18"
                        cx="20"
                        cy="20"
                      />
                      <circle
                        className="text-blue-500 stroke-current transition-all duration-500 ease-out"
                        strokeWidth="3.5"
                        strokeDasharray="113"
                        strokeDashoffset={113 - (113 * (tasks.length > 0 ? Math.round((tasks.filter(t => t.status === '已完成').length / tasks.length) * 100) : 0)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        r="18"
                        cx="20"
                        cy="20"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-slate-800 tracking-tight">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === '已完成').length / tasks.length) * 100) : 0}%
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 font-sans">
                    <p className="flex justify-between gap-6 font-semibold">
                      <span>待完成：</span>
                      <span className="text-orange-600 font-bold">{tasks.filter(t => t.status !== '已完成').length} 项</span>
                    </p>
                    <p className="flex justify-between gap-6 font-semibold">
                      <span>已打卡：</span>
                      <span className="text-emerald-600 font-bold">{tasks.filter(t => t.status === '已完成').length} 项</span>
                    </p>
                    <p className="flex justify-between gap-6 font-semibold">
                      <span>总计：</span>
                      <span className="text-slate-700 font-bold">{tasks.length} 项</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
                  进度展现学期专注契合度。完成所有打卡即可稳夺智学平台卓越学子周表彰！
                </div>
              </div>

              {/* AI Study Companion Tips */}
              <div className="bg-linear-to-b from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3.5 relative overflow-hidden group">
                <div className="absolute -right-3 -top-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs select-none">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse stroke-[2.2]" />
                  <span>AI 智学领航助手</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-semibold font-sans">
                  <p>
                    根据评估，您当前有 <span className="text-orange-400 font-bold">{tasks.filter(t => t.status !== '已完成').length}</span> 项未完成学业考评待攻坚。
                  </p>
                  <p className="text-slate-400 text-[11px] font-normal leading-normal">
                    算法检测发现，您今天具有较高的学科作业负载。专属提分路径建议：
                  </p>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-300 font-normal leading-normal font-sans text-xs">
                    📌 <strong>高效通关指导</strong>：<br/>
                    不要盲目推进，在进行考卷评测前建议先前往 【错题本】 针对做高频疑难回顾，避免同类型知识漏洞再次丢分。
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      alert("AI 智学顾问已在右侧为您加载针对当前作业的一键诊断讲解，请在AI框中查阅！");
                    }}
                    className="text-[10px] text-blue-300 hover:text-white hover:underline flex items-center gap-0.5 cursor-pointer font-bold animate-pulse"
                  >
                    获取专属智能智学解答 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
