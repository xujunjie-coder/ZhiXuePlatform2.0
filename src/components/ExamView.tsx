import React, { useState, useEffect } from 'react';
import { 
  Hourglass, 
  Clock, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ArrowRight,
  BookOpen,
  Sparkles,
  PieChart,
  ListRestart,
  BookmarkCheck,
  Check,
  ArrowRightCircle,
  Plus,
  Trash2,
  Filter,
  CheckCircle,
  PlusCircle,
  CalendarRange,
  Bell,
  CheckSquare,
  Square
} from 'lucide-react';
import { Exam, ActiveView } from '../types';

interface ExamViewProps {
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  setActiveView: (view: ActiveView) => void;
  onAIExplanationRequest?: (prompt: string) => void;
  tasks?: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
  onSetReminder?: (taskId: string, seconds: number, customLabel: string) => void;
  activeSubTab?: 'tasks' | 'exams';
  setActiveSubTab?: (tab: 'tasks' | 'exams') => void;
  setSpaceActiveTab?: (tab: string) => void;
}

export default function ExamView({ 
  exams, 
  setExams,
  setActiveView, 
  onAIExplanationRequest,
  tasks = [],
  setTasks,
  onSetReminder,
  activeSubTab = 'exams',
  setActiveSubTab,
  setSpaceActiveTab
}: ExamViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'active' | 'finished'>('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  // Modes for taking or reviewing exams
  const [examState, setExamState] = useState<'list' | 'details' | 'taking' | 'results'>('list');
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  
  // Active taking exam simulation states
  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(4532); // 1h 15m 32s
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({ 1: 'C' });

  // Customized sub task states and filter controls
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [taskSearch, setTaskSearch] = useState<string>('');
  
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'作业' | '考试' | '学习'>('学习');
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>('2026-06-05 23:59');

  useEffect(() => {
    if (activeSubTab === 'tasks') {
      setActiveView('space');
      if (setSpaceActiveTab) {
        setSpaceActiveTab('个人待办');
      }
      if (setActiveSubTab) {
        setActiveSubTab('exams');
      }
    }
  }, [activeSubTab, setActiveView, setSpaceActiveTab, setActiveSubTab]);
  
  const [activeTaskSetupId, setActiveTaskSetupId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Countdown timer effect
  useEffect(() => {
    if (examState === 'taking') {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [examState]);

  const formatTimer = (secs: number) => {
    const hh = Math.floor(secs / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  // Filter exams based on tab
  const filteredExams = exams.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return e.status === 'waiting';
    if (activeTab === 'active') return e.status === 'active';
    if (activeTab === 'finished') return e.status === 'finished';
    return true;
  });

  const handleStartExamFlow = (exam: Exam) => {
    setSelectedExam(exam);
    setExamState('details');
  };

  const handleEnterTakingExam = () => {
    setTakingExam(selectedExam);
    setSecondsRemaining(5400); // 90 minutes
    setExamState('taking');
  };

  const handleSubmitExam = () => {
    if (confirm('确认现在提交试卷吗？交卷后系统将自动进行学业成绩归因诊断！')) {
      // Create completed version
      if (takingExam) {
        const scoreRandom = 86; // Simulating Lee's score in the snapshot
        const updated = exams.map(e => e.id === takingExam.id ? {
          ...e,
          status: 'finished' as const,
          myScore: scoreRandom,
          ranking: '12 / 98'
        } : e);
        setExams(updated);
        setSelectedExam({
          ...takingExam,
          status: 'finished',
          myScore: scoreRandom,
          ranking: '12 / 98'
        });
      }
      setExamState('results');
    }
  };

  const handleOpenResults = (exam: Exam) => {
    setSelectedExam(exam);
    setExamState('results');
  };

  const handleAIExplain = (qNum: number, questionText: string) => {
    if (onAIExplanationRequest) {
      onAIExplanationRequest(`请李同学的学习助手详细讲解这道考试错题：第 ${qNum} 题。问题是：${questionText}。请给出推导过程、易错点诊断、核心涉及知识点等。`);
      alert('已自动将这道错题的学术背景和条件解析成学期核心考点，请在右侧【AI 助手】中查看为您深度生成的 AI 学术讲解！');
    } else {
      alert('AI 讲解功能请求已发送！右侧聊天系统即时启动答疑。');
    }
  };

  return (
    <div className="select-none h-full">
      {/* List State Mode */}
      {examState === 'list' && (
        <div className="space-y-6">
          {/* Sub-tab selection between Academic Tasks and Exams is hidden and moved to the active SpaceView */}
          {false ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Header section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    个人待办完成与督测中心
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    在这里随时添加您的学期任务，配置高抗干扰桌面倒计时督测，高标准打卡学习进度。
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAddingTask ? '收起填写' : '添加学业任务'}</span>
                </button>
              </div>

              {/* Add task form collapsible */}
              {isAddingTask && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTaskTitle.trim()) return;
                    
                    const typeStyles = {
                      '作业': 'bg-red-50 text-red-500 border border-red-100',
                      '考试': 'bg-orange-50 text-orange-500 border border-orange-100',
                      '学习': 'bg-blue-50 text-blue-500 border border-blue-100'
                    };
                    
                    const newTask = {
                      id: `task-${Date.now()}`,
                      type: newTaskType,
                      title: newTaskTitle.trim(),
                      deadline: `截止：${newTaskDeadline}`,
                      status: '待完成',
                      badgeStyle: typeStyles[newTaskType] || 'bg-slate-50 text-slate-500 border border-slate-100',
                      reminderTime: ''
                    };
                    
                    if (setTasks) {
                      setTasks(prev => [...prev, newTask]);
                      setNewTaskTitle('');
                      setIsAddingTask(false);
                      setToastMsg(`✨ 新学业待办 "${newTask.title}" 成功加入学习序列！`);
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
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
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
                              onClick={() => setNewTaskType(type)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                newTaskType === type 
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
                          value={newTaskDeadline}
                          onChange={(e) => setNewTaskDeadline(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
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
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 font-medium"
                      />
                    </div>

                    {/* Pill filters stack */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {/* Status switcher */}
                      <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50/50 shrink-0 mr-2">
                        {(['all', 'pending', 'completed'] as const).map((st) => {
                          const isSel = filterStatus === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setFilterStatus(st)}
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
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
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
                              setToastMsg(`🧹 成功清除了 ${completedCount} 项已完成的优胜学业任务`);
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

                  {/* Task Items list container */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 pb-2">
                    {tasks.filter((task) => {
                      const titleMatch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
                      const statusMatch = 
                        filterStatus === 'all' ? true :
                        filterStatus === 'pending' ? task.status !== '已完成' :
                        task.status === '已完成';
                      const categoryMatch = 
                        filterCategory === 'all' ? true :
                        filterCategory === 'homework' ? task.type === '作业' :
                        filterCategory === 'exam' ? task.type === '考试' :
                        filterCategory === 'study' ? task.type === '学习' : true;
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
                        const titleMatch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
                        const statusMatch = 
                          filterStatus === 'all' ? true :
                          filterStatus === 'pending' ? task.status !== '已完成' :
                          task.status === '已完成';
                        const categoryMatch = 
                          filterCategory === 'all' ? true :
                          filterCategory === 'homework' ? task.type === '作业' :
                          filterCategory === 'exam' ? task.type === '考试' :
                          filterCategory === 'study' ? task.type === '学习' : true;
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
                                      setToastMsg(`✅ 恭喜！您已成功完成了该待办任务！`);
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
                                      setActiveTaskSetupId(activeTaskSetupId === task.id ? null : task.id);
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
                                        setToastMsg(`✅ 恭喜！您已成功完成了该待办任务！`);
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
                                      setToastMsg(`🗑️ 已将该待办移出学习计划`);
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
                            {!isCompleted && activeTaskSetupId === task.id && (
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
                                        setActiveTaskSetupId(null);
                                        setToastMsg(`⏰ 提醒设定成功！\n系统将在 10 秒后发出专注提醒桌面通知。`);
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
                                        setActiveTaskSetupId(null);
                                        setToastMsg(`⏰ 提醒设定成功！\n系统将在 25分钟(番茄钟) 后发出专注提醒桌面通知。`);
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
                                        setActiveTaskSetupId(null);
                                        setToastMsg(`⏰ 提醒设定成功！\n系统将在 1小时后 发出专注提醒桌面通知。`);
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
                                        setActiveTaskSetupId(null);
                                        setToastMsg('🔕 已成功清除该待办的专注提醒');
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
                          if (onAIExplanationRequest) {
                            onAIExplanationRequest("请帮我诊断我当前的作业待办重难点，并为我打造一套25分钟的高价值自习复习攻坚战略路径。");
                            alert("AI 智学顾问已在右侧为您加载针对当前作业的一键诊断讲解，请查阅以接续您的提问！");
                          }
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
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Original Exam list header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">学业测试中心</h2>
                  <p className="text-xs text-slate-500 mt-1">这里汇总李同学在各科门类下的官方测验、平时作业考查与期中考试。</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-2 select-none">
                  {['all', 'waiting', 'active', 'finished'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        activeTab === tab 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {tab === 'all' && '全部 (18)'}
                      {tab === 'waiting' && '待考 (4)'}
                      {tab === 'active' && '进行中 (1)'}
                      {tab === 'finished' && '已结束 (13)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredExams.map((exam) => (
                  <div 
                    key={exam.id}
                    className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all ${
                      exam.status === 'active' ? 'ring-2 ring-blue-500/85' : ''
                    }`}
                  >
                    {/* Header Image */}
                    <div className="relative h-28 bg-slate-900 overflow-hidden select-none shrink-0">
                      <img 
                        src={exam.coverUrl} 
                        alt={exam.title}
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded select-none shadow-xs ${
                        exam.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                        exam.status === 'active' ? 'bg-red-500 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {exam.status === 'waiting' && '待考'}
                        {exam.status === 'active' && '进行中'}
                        {exam.status === 'finished' && '已结束'}
                      </span>
                    </div>

                    {/* Content Card Body */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">{exam.course}</span>
                        <h3 className="font-bold text-sm md:text-base text-slate-800 tracking-tight leading-snug line-clamp-1 mt-0.5 mb-3">
                          {exam.title}
                        </h3>
                        
                        <div className="space-y-1.5 text-xs text-slate-500 mb-4 select-none">
                          <p className="truncate">时间：{exam.time}</p>
                          <div className="flex justify-between">
                            <span>时长：{exam.duration}分钟</span>
                            <span>满分：{exam.score}分</span>
                          </div>
                          <p className="truncate text-slate-400 scale-95 origin-left">题型：{exam.questionType}</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-50 select-none">
                        {exam.status === 'waiting' && (
                          <div className="flex flex-col gap-2">
                            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>距离考点开放：1 天 04 小时</span>
                            </span>
                            <button 
                              onClick={() => handleStartExamFlow(exam)}
                              className="w-full py-2 border border-blue-500 hover:bg-blue-50 text-blue-600 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                            >
                              查看详情
                            </button>
                          </div>
                        )}

                        {exam.status === 'active' && (
                          <div className="flex flex-col gap-2">
                            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1 animate-pulse">
                              <Hourglass className="w-3.5 h-3.5" />
                              <span>剩余作答：01:15:32</span>
                            </span>
                            <button 
                              onClick={() => handleStartExamFlow(exam)}
                              className="w-full py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                            >
                              继续考试
                            </button>
                          </div>
                        )}

                        {exam.status === 'finished' && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                              <span>成绩：{exam.myScore || 86} 分</span>
                              <span className="text-slate-400 text-[11px]">排名 {exam.ranking || '12/98'}</span>
                            </div>
                            <button 
                              onClick={() => handleOpenResults(exam)}
                              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                              查看学理诊断
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode Details Modal Simulation */}
      {examState === 'details' && selectedExam && (
        <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <button 
              onClick={() => setExamState('list')} 
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs text-slate-400 font-medium">{selectedExam.course}</span>
              <h3 className="font-bold text-lg text-slate-800">{selectedExam.title}</h3>
            </div>
          </div>

          <div className="p-6 space-y-4 text-sm text-slate-700 border-b border-slate-100">
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-slate-50">
              <span className="text-slate-400">测验时段</span>
              <span className="col-span-3 font-semibold">{selectedExam.time}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-slate-50">
              <span className="text-slate-400">作答时间</span>
              <span className="col-span-3 font-semibold">{selectedExam.duration} 分钟</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pb-2 border-b border-slate-50">
              <span className="text-slate-400">测验分值</span>
              <span className="col-span-3 font-semibold">{selectedExam.score} 分 (及格要求: 60分)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <span className="text-slate-400">科目考纲</span>
              <span className="col-span-3 text-slate-500 leading-relaxed text-xs">
                第三章主要涉及线性回归参数推导、偏置项求解、残差极小化优化准则、均方误差 (MSE) 和平均绝对误差 (MAE) 计算及应用差异。全网唯一支持 AI 即时智能诊断归因。
              </span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-normal">
              <p className="font-semibold mb-1">注意事项及系统要求：</p>
              <ol className="list-decimal list-inside space-y-1 mt-1 text-amber-700">
                <li>请在稳定网络环境下作答。作答提交后才录入正式等级库。</li>
                <li>本场测验支持 AI 智能课后诊断，答错将提供推导解析视频并自动归档至【错题本】。</li>
                <li>测验不限制切屏但后台将如实统计您的答卷平均犹豫时段。</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setExamState('list')}
                className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleEnterTakingExam}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-sm shadow-blue-100"
              >
                开始作答
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Taking simulated exam */}
      {examState === 'taking' && takingExam && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col h-[650px] overflow-hidden">
          {/* Top Panel Actions */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
            <span className="text-xs font-semibold text-slate-600 truncate max-w-sm">
              学业测验 ➔ {takingExam.course} - {takingExam.title}
            </span>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-red-500 font-mono font-bold leading-none">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
              <div className="text-xs text-slate-500 select-none">
                已答 <span className="text-blue-600 font-bold">{Object.keys(userAnswers).length}</span> / 42
              </div>
              <button 
                onClick={handleSubmitExam}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                交卷
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Nav Circle selection */}
            <div className="w-56 border-r border-slate-200 flex flex-col bg-white overflow-hidden shrink-0 select-none">
              <div className="p-3 border-b border-slate-100 text-xs font-bold text-slate-400 bg-slate-50">
                题目导航 (42题)
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-3 col-span-5">单项选择 (1-20)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20].map((num) => {
                      const isAnswered = userAnswers[num] !== undefined;
                      const isActive = selectedQuestion === num;
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedQuestion(num)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive 
                              ? 'bg-blue-600 text-white ring-2 ring-blue-200' 
                              : isAnswered 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-3 col-span-5">多项选择 (21-30)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[21, 22, 23, 24, 25].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSelectedQuestion(num)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                          selectedQuestion === num 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Question detail displays */}
            <div className="flex-1 flex flex-col justify-between bg-slate-50/50">
              <div className="p-8 overflow-y-auto">
                {selectedQuestion === 1 ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs select-none">
                          单选题 — 第 1 题
                        </span>
                        <span className="text-xs text-slate-400 select-none">共 20 题，每题 2 分</span>
                      </div>
                      <button 
                        onClick={() => alert('已标记此题并归档至待复查状态')}
                        className="text-xs text-slate-400 hover:text-amber-500 flex items-center gap-1 focus:outline-none"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>标记待查</span>
                      </button>
                    </div>

                    <p className="text-sm md:text-base font-semibold text-slate-800 leading-relaxed leading-normal mt-4">
                      1. 在典型的有监督机器学习 (Supervised Learning) 训练流程中，训练数据集 (Training Dataset) 通常必须包含以下哪一项？
                    </p>

                    <div className="space-y-3 mt-6">
                      {[
                        { label: 'A', text: '仅输入特征 (Input Features Only)，不附加任何外部映射关系' },
                        { label: 'B', text: '仅输出标签 (Output Labels Only)，用于评估聚类效果' },
                        { label: 'C', text: '输入特征以及对应的输出标签 (Input Features and corresponding Labels) 构成的真值组' },
                        { label: 'D', text: '未标记的感知图像流 (Unlabeled Raw Image stream) 以及状态估计矩阵' }
                      ].map((opt) => (
                        <label 
                          key={opt.label}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            userAnswers[1] === opt.label 
                              ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-medium font-semibold' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => setUserAnswers({ ...userAnswers, 1: opt.label })}
                        >
                          <input 
                            type="radio"
                            name="question1"
                            checked={userAnswers[1] === opt.label}
                            onChange={() => {}}
                            className="mt-1 text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-xs md:text-sm">{opt.label}. {opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <AlertTriangle className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm">本系统仅支持演示。请点击左侧题目导航【第 1 题】进行选项修改与体验，完成后点击右上角【交卷】查看学业归因分析报告！</p>
                  </div>
                )}
              </div>

              {/* simulated actions */}
              <div className="p-4 border-t border-slate-200 bg-white flex justify-center items-center gap-3">
                <button 
                  onClick={() => alert('已经是第一题啦！')}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  上一题
                </button>
                <button 
                  onClick={() => { if (selectedQuestion === 1) setSelectedQuestion(2); else alert('演示版本，请直接交卷提交诊断。'); }}
                  className="px-4 py-2 bg-slate-900 border border-slate-900 hover:opacity-90 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  下一题
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Results diagnosis detail report */}
      {examState === 'results' && selectedExam && (
        <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl mx-auto shadow-lg overflow-hidden flex flex-col h-[650px]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
            <h3 className="font-bold text-base text-slate-800">学理归因诊断报告</h3>
            <button 
              onClick={() => { setExamState('list'); setSelectedExam(null); }}
              className="p-1 px-3 border border-slate-200 hover:bg-white rounded-lg text-xs font-semibold text-slate-500 transition"
            >
              返回考试中心
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Marks breakdown block */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                <div className="flex items-end gap-1 select-none">
                  <span className="text-4xl md:text-5xl font-extrabold text-red-500">86</span>
                  <span className="text-xs text-red-500 font-bold mb-1">分</span>
                  <span className="ml-2 mb-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 text-[10px] font-bold rounded-sm inline-block">
                    合格
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  李同学 / 试卷满分 100 分 (合格要求: 60 分)
                </p>
              </div>

              <div className="flex-1 space-y-2.5 text-xs text-slate-600 border border-slate-50 p-4 rounded-xl">
                <div className="flex justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-400">测验课目</span>
                  <span className="font-semibold text-slate-800">{selectedExam.course}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-400">试卷分析</span>
                  <span className="font-semibold text-slate-800">单选题 + 偏导简答大题</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-400">测验用时</span>
                  <span className="font-semibold text-slate-800">45 分钟 / 限时 90 分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">班级占位</span>
                  <span className="font-bold text-blue-600">{selectedExam.ranking || '12 / 98'}</span>
                </div>
              </div>
            </div>

            {/* Visual analytics block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-100 rounded-xl p-4">
                <h4 className="font-bold text-xs text-slate-700 mb-4 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-blue-500" />
                  <span>知识模块正确率</span>
                </h4>
                
                <div className="space-y-2.5">
                  {[
                    { label: '单选题 (基础有监督核心)', score: '36/40', progress: '90%' },
                    { label: '多选题 (正则损失细节)', score: '16/20', progress: '80%' },
                    { label: '判断题 (MAE与MSE选型)', score: '18/20', progress: '90%' },
                    { label: '简大题 (链式求导偏微分)', score: '16/20', progress: '80%' }
                  ].map((subItem) => (
                    <div key={subItem.label} className="text-xs">
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>{subItem.label}</span>
                        <span>{subItem.score} ({subItem.progress})</span>
                      </div>
                      <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: subItem.progress }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis AI Advisor note */}
              <div className="border border-slate-100 rounded-xl p-4 bg-blue-50/20 text-xs text-slate-700 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI 诊断与错题指导建议</span>
                  </h4>
                  <p className="leading-relaxed text-slate-600">
                    李同学，你在**线性估计模型、概念映射**等基础题型上表现出色。主要扣分点来源于简答题中**残差极小化在 MSE vs MAE 上的损失极值点偏微分求解**。建议着重点击下方错题卡中的【AI讲解】，系统会拉手教学如何求解它的导函数极值点。
                  </p>
                </div>
                <button 
                  onClick={() => handleAIExplain(1, '在回归问题中，过拟合的主要表现与MSE极小化')}
                  className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 shadow-sm shadow-blue-100 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>索要 AI 专属分析方案</span>
                </button>
              </div>
            </div>

            {/* Error Lists cards */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                <ListRestart className="w-4 h-4 text-red-500" />
                <span>错因剖析及知识强化</span>
              </h4>

              <div className="border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 bg-slate-50/50">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-slate-800 text-sm">21.</span>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-sm select-none font-bold">多选题</span>
                      <span className="text-xs text-slate-500 select-none">正则化对于过拟合的约束机制</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      在逻辑回归中，当引入 L1 与 L2 正则约束时，下列关于权值衰减的说法正确的有？
                    </p>
                    <div className="flex gap-6 mt-3 text-xs leading-none select-none">
                      <span className="text-red-500 font-medium">你的答案: A, C</span>
                      <span className="text-green-600 font-medium">正确答案: B, C</span>
                    </div>

                    <div className="flex justify-end gap-2.5 mt-4">
                      <button 
                        onClick={() => handleAIExplain(21, 'L1与L2正则化约束机制对权值衰减的影响')}
                        className="p-1 px-3 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                        <span>AI 解答辅导</span>
                      </button>
                      <button 
                        onClick={() => alert('错题已加入练习强化队列，重新答对可消除该记录')}
                        className="p-1 px-3 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer"
                      >
                        标记重做
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* results footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex gap-3">
            <button 
              onClick={() => alert('正在导出成绩分析单... 格式为 ZhiXue_Result_2026.pdf')}
              className="flex-grow py-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              打印成绩单
            </button>
            <button 
              onClick={() => { setExamState('list'); setSelectedExam(null); }}
              className="flex-grow py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              确认完毕，返回列表
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
