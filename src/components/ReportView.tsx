import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Calendar, 
  Play, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  BookOpen, 
  Download, 
  Printer, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Award, 
  History, 
  ArrowRight,
  Bot,
  HelpCircle,
  X,
  Target,
  LineChart,
  Grid,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Course, ActiveView } from '../types';

interface ReportViewProps {
  courses: Course[];
  setActiveView: (view: ActiveView) => void;
  setSelectedCourseId: (id: string | null) => void;
}

// Full structure of reports data
interface ReportData {
  timeframeText: string;
  stats: {
    duration: number; // hrs
    durationChange: number; // hrs
    days: number;
    daysChange: number;
    avgDaily: number;
    avgDailyChange: number;
    tasksCount: number;
    tasksChange: number;
    correctRate: number; // %
    correctRateChange: number; // %
    activePeriod: string;
    activePeriodChange: string;
  };
  courseProgress: Array<{
    name: string;
    completedChapters: number;
    totalChapters: number;
    completionRate: number;
    masteryRate: number;
    tag?: string;
  }>;
  knowledgeMastery: {
    total: number;
    mastered: number;
    weak: number;
    unlearned: number;
  };
  learningBehavior: Array<{
    date: string;
    duration: number;
    activeScore: number;
  }>;
  errors: {
    total: number;
    types: {
      concept: number;
      careless: number;
      application: number;
      omission: number;
      other: number;
    };
    topMistakes: Array<{
      name: string;
      count: number;
      percent: number;
    }>;
  };
  habits: {
    daysPerWeek: number;
    tempo: string;
    focusRate: number;
    timeliness: string;
  };
}

// Data sets for each timeframe
const getIconComponent = (iconNameOrComponent: any) => {
  if (!iconNameOrComponent) return BookOpen;
  if (typeof iconNameOrComponent === 'function') return iconNameOrComponent;
  const map: Record<string, any> = {
    BookOpen,
    Target,
    Clock,
    CheckCircle2
  };
  return map[iconNameOrComponent] || BookOpen;
};

export default function ReportView({ courses, setActiveView, setSelectedCourseId }: ReportViewProps) {
  const [reportDataset, setReportDataset] = useState<Record<string, ReportData>>({});
  const [insights, setInsights] = useState<any[]>([]);
  const [historicReportsList, setHistoricReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | 'semester'>('week');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('prev_period');
  const [activeInsightIndex, setActiveInsightIndex] = useState<number | null>(null);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any | null>(null);
  const [showExportPreview, setShowExportPreview] = useState<boolean>(false);
  const [showAiRecommendationsPopup, setShowAiRecommendationsPopup] = useState<boolean>(false);

  // States for interactive custom features
  const [showKnowledgeGraphModal, setShowKnowledgeGraphModal] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('n2');
  const [showBehaviorDetailModal, setShowBehaviorDetailModal] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // AI Dialog state
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetch('/api/student/reports')
      .then(res => res.json())
      .then(data => {
        setReportDataset(data.dataset);
        setInsights(data.insights);
        setHistoricReportsList(data.history);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        正在加载学情报告数据...
      </div>
    );
  }

  const currentData = reportDataset[activeTimeframe] || reportDataset.week;

  const handleTriggerAction = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportBehaviorCSV = () => {
    setExportLoading(true);
    setTimeout(() => {
      try {
        const headers = '日期,看播时长(小时),交互提问数,习题攻克数,专注度得分,主攻学科\n';
        const rows = currentData.learningBehavior.map(item => {
          const date = item.date;
          const hrs = item.duration;
          const questions = Math.round(hrs * 2.5);
          const tasks = Math.round(hrs * 4.2);
          const focus = item.activeScore;
          const course = hrs > 3 ? '数据结构：高频算法演练' : '高等数学：微积分看播';
          return `${date},${hrs},${questions},${tasks},${focus},${course}`;
        }).join('\n');
        
        const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `智学云_学生行为大类分析走势包_${activeTimeframe === 'week' ? '本周' : '本月'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setExportLoading(false);
        handleTriggerAction('🎉 导出成功！多维度行为分析走势包CSV已自动保存到本设备。');
      } catch (err) {
        setExportLoading(false);
        handleTriggerAction('导出失败，请重试');
      }
    }, 1500);
  };

  const showRecommendationDialog = (insight: any) => {
    setSelectedRecommendation(insight);
    setAiResponse(null);
    setChatInput('');
    setShowAiRecommendationsPopup(false);
  };

  const handleAskAICoach = async () => {
    if (!chatInput.trim() && !selectedRecommendation) return;
    setChatLoading(true);
    
    const query = chatInput.trim() || `针对我“${selectedRecommendation?.title}”下的辅导建议："${selectedRecommendation?.desc}"，有什么可以更具体的微调复习安排？以及帮我挑几道针对性强的典型试题？`;
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.text);
      } else {
        throw new Error();
      }
    } catch {
      // Elegant fallback response
      setTimeout(() => {
        if (selectedRecommendation?.id === 's1') {
          setAiResponse(`李同学你好！针对你的“链表的基本操作”错误高发现象，AI 为你整理了以下三个突破要点：
1. **边界条件漏判**：在进行单链表 delete 或 insert 时，是否首先检验了 head == NULL 以及 index == 0？
2. **指针接续顺序颠倒**：经典错误 \`p->next = s; s->next = p->next;\` 会导致自循环。必须优先绑定后继指针：\`s->next = p->next; p->next = s;\`！
3. **双链表前驱未维护**：增加额外前驱指针拉结工作。

**推荐仿真练习**：
- [单链表反转（第3章例题2）]
- [双向循环循环链表节点删除哨兵设计]
（你可直接点击左侧“错题本”，系统已将12道类似考点题目归置为“高优攻克”任务！）`);
        } else if (selectedRecommendation?.id === 's2') {
          setAiResponse(`李同学好！本周你的练习题数有所滑坡，我们应在碎片化时间抓紧温习。
建议你开启“**随堂即时测验**”微课计划，系统每日早间8时为你推送2道精练客观选择题。今天为你锁定：
1. 【高数】导数和微积分应用判定（凹凸区间判定条件）
2. 【数据结构】栈的出栈序列可能总数推导（卡特兰数公式应用）

点击【开始精练】即可开始做题，不占用大块自习时间，成效极佳！`);
        } else {
          setAiResponse(`李同学你好！已根据“${selectedRecommendation?.title}”建议，精细化匹配了你在智学平台的个人学情。建议今晚 20:00 - 21:00 准时收看操作系统《临界资源信号量PV算法应用》录播微课，并完成2道真题，此时段属于你近期的脑力巅峰黄金期，事半功倍！`);
        }
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePrint = () => {
    handleTriggerAction('正在生成格式化的「智学平台高级个人学情报告」排版，完成后将唤起系统打印服务...');
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  const handleExport = () => {
    handleTriggerAction('🎉 生成PDF学情报告成功！智学平台已开始自动为你下载《李同学学习报告_五月度.pdf》');
  };

  // Historic Reports (fetched from state)

  const handleLoadHistory = (report: typeof historicReportsList[0]) => {
    setSelectedHistoryReport(report.id);
    setActiveTimeframe(report.timeframe.includes('week') ? 'week' : report.timeframe.includes('month') ? 'month' : 'semester');
    handleTriggerAction(`📊 已成功加载历史存档：“${report.name}” 的指标数据！`);
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-fadeIn relative p-1 pb-16">
      
      {/* Toast Alert message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-medium text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button row */}
      <div className="flex items-center gap-2 select-none mb-1 shrink-0">
        <button 
          onClick={() => {
            setSelectedCourseId(null);
            setActiveView('home');
          }}
          className="text-xs text-slate-500 hover:text-blue-600 font-bold flex items-center gap-1 cursor-pointer transition-all hover:translate-x-[-2px]"
        >
          ← 返回上一级
        </button>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-slate-400 text-xs font-semibold">学情报告</span>
      </div>

      {/* 1. Page Header & Header tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3.5 mb-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-blue-600 stroke-[2.5]" />
              <span>学习报告</span>
            </h1>
            <span className="hidden sm:inline-block text-xs text-blue-600 bg-blue-50/70 border border-blue-100 px-3.5 py-1 rounded-full font-semibold">
              全面复盘学习表现，发现成长与不足，持续提升学习效率
            </span>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap mt-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button 
                onClick={() => { setActiveTimeframe('week'); setSelectedHistoryReport(null); }}
                className={`px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTimeframe === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本周
              </button>
              <button 
                onClick={() => { setActiveTimeframe('month'); setSelectedHistoryReport(null); }}
                className={`px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTimeframe === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本月
              </button>
              <button 
                onClick={() => { setActiveTimeframe('semester'); setSelectedHistoryReport(null); }}
                className={`px-5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTimeframe === 'semester' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本学期
              </button>
              <button 
                onClick={() => handleTriggerAction('请通过下方“对比分析”或“历史报告”组件加载自定义报告时段')}
                className="px-5 py-1.5 rounded-lg text-xs md:text-sm text-slate-400 font-semibold cursor-not-allowed"
              >
                自定义
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-600 text-xs shadow-3xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{currentData.timeframeText}</span>
            </div>

            {/* Comparison toggle switch */}
            <button
              onClick={() => setIsComparing(!isComparing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                isComparing 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{isComparing ? '已开启对比' : '开启周期对比'}</span>
              {isComparing ? <Check className="w-3.5 h-3.5" /> : null}
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0 self-start xl:self-auto">
          <button 
            onClick={() => setShowExportPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs hover:border-blue-400"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>预览并导出报告</span>
          </button>
        </div>
      </div>

      {/* 2. Main Area Layout columns: Left stats and charts (col-span-3) vs Right columns (col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COMPREHENSIVE CARDS AREA (3/4) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* A. KPI Stats grid representing 6 crucial widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* KPI 1: 学习总时长 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">学习总时长</span>
                <div className="p-1.5 bg-blue-100/60 text-blue-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{currentData.stats.duration}</span>
                  <span className="text-xs text-slate-400 font-semibold">小时</span>
                </div>
                
                {isComparing ? (
                  <div className="mt-2.5 text-[10px] flex items-center gap-1 font-bold text-emerald-600">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>较上期提高 {currentData.stats.durationChange} 小时</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[10px] text-slate-400">稳定打卡中</div>
                )}
              </div>
            </div>

            {/* KPI 2: 学习天数 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">学习天数</span>
                <div className="p-1.5 bg-emerald-100/60 text-emerald-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{currentData.stats.days}</span>
                  <span className="text-xs text-slate-400 font-semibold">天</span>
                </div>

                {isComparing ? (
                  <div className="mt-2.5 text-[10px] flex items-center gap-1 font-bold text-emerald-600">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>较上期增加 {currentData.stats.daysChange} 天</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[10px] text-slate-400">高频日出勤</div>
                )}
              </div>
            </div>

            {/* KPI 3: 平均每日学习 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">平均每日学习</span>
                <div className="p-1.5 bg-purple-100/60 text-purple-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{currentData.stats.avgDaily}</span>
                  <span className="text-xs text-slate-400 font-semibold">小时</span>
                </div>

                {isComparing ? (
                  <div className="mt-2.5 text-[10px] flex items-center gap-1 font-bold text-emerald-600">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>较上期提升 {currentData.stats.avgDailyChange}h</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[10px] text-slate-400">高能在线表现</div>
                )}
              </div>
            </div>

            {/* KPI 4: 完成任务数 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">完成任务数</span>
                <div className="p-1.5 bg-orange-100/60 text-orange-600 rounded-lg">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{currentData.stats.tasksCount}</span>
                  <span className="text-xs text-slate-400 font-semibold">个</span>
                </div>

                {isComparing ? (
                  <div className="mt-2.5 text-[10px] flex items-center gap-1 font-bold text-emerald-600">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>较上期 +{currentData.stats.tasksChange} 个</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[10px] text-slate-400">日常节点攻克完成</div>
                )}
              </div>
            </div>

            {/* KPI 5: 正确率 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-teal-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">随堂正确率</span>
                <div className="p-1.5 bg-teal-100/60 text-teal-600 rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 leading-none">{currentData.stats.correctRate}</span>
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>

                {isComparing ? (
                  <div className="mt-2.5 text-[10px] flex items-center gap-1 font-bold text-emerald-600">
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>较上期升 {currentData.stats.correctRateChange}%</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[10px] text-slate-400">学能稳健发挥</div>
                )}
              </div>
            </div>

            {/* KPI 6: 活跃时段 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full z-0 opacity-60"></div>
              <div className="flex justify-between items-start mb-2.5 relative z-10">
                <span className="text-xs text-slate-500 font-bold tracking-wider">最活跃时段</span>
                <div className="p-1.5 bg-indigo-100/60 text-indigo-600 rounded-lg">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
              <div className="relative z-10 mt-1">
                <div className="text-sm font-black text-slate-800 leading-tight tracking-tight pt-1">
                  {currentData.stats.activePeriod}
                </div>

                {isComparing ? (
                  <div className="mt-2 text-[10px] text-slate-400 font-medium">
                    状态: {currentData.stats.activePeriodChange}
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-400">大脑运行巅峰期</div>
                )}
              </div>
            </div>

          </div>

          {/* B. Visual Analytics Row 1: Course Progress table (Left) & Knowledge Mastery (Middle) & Learning Behavior (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart Block 1: 课程进度分析 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900 text-sm">课程进度与掌握率</h3>
                  <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      <span>看播率</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      <span>掌握度</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {currentData.courseProgress.map((cp, idx) => (
                    <div key={idx} className="space-y-2 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]" title={cp.name}>
                          {cp.name.split(' ')[0]}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cp.tag && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                              cp.tag.includes('落后') 
                                ? 'bg-red-50 text-red-500' 
                                : cp.tag.includes('已完成') || cp.tag.includes('100')
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {cp.tag}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-600">
                            已通关 {cp.completedChapters}/{cp.totalChapters} 章
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        {/* Completion bar */}
                        <span className="col-span-2 text-[9px] font-bold text-blue-600 text-right">
                          {cp.completionRate}%
                        </span>
                        <div className="col-span-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${cp.completionRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        {/* Mastery bar */}
                        <span className="col-span-2 text-[9px] font-bold text-emerald-500 text-right">
                          {cp.masteryRate}%
                        </span>
                        <div className="col-span-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${cp.masteryRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-50 pt-3.5 text-center">
                <button 
                  onClick={() => setActiveView('space')}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span>进入学习空间查看详细章节路线</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chart Block 2: 知识点掌握分析 (Interactive indicators) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-4">知识点掌握程度指标</h3>
                
                <div className="flex flex-col items-center justify-center my-4">
                  {/* CSS Conic-Gradient ring mockup */}
                  <div 
                    className="w-32 h-32 rounded-full shadow-inner flex items-center justify-center relative transition-transform hover:scale-105"
                    style={{
                      background: `conic-gradient(
                        #186bfd 0% ${currentData.knowledgeMastery.mastered}deg, 
                        #10b981 ${currentData.knowledgeMastery.mastered}deg ${currentData.knowledgeMastery.mastered + currentData.knowledgeMastery.weak}deg,
                        #f59e0b ${currentData.knowledgeMastery.mastered + currentData.knowledgeMastery.weak}deg 360deg
                      )`
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">知识点总数</span>
                      <span className="text-2xl font-black text-slate-900 mt-0.5">{currentData.knowledgeMastery.total}<span className="text-xs font-normal text-slate-400">个</span></span>
                    </div>
                  </div>

                  <div className="w-full space-y-3 mt-5">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span className="text-slate-500 font-medium">已掌握 (正常通关)</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {currentData.knowledgeMastery.mastered}个 <span className="text-slate-400 text-[10px]">({Math.round(currentData.knowledgeMastery.mastered / currentData.knowledgeMastery.total * 100)}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs px-1 border-t border-slate-50 pt-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-500 font-medium">基本掌握 (有少量薄弱点)</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {currentData.knowledgeMastery.weak}个 <span className="text-slate-400 text-[10px]">({Math.round(currentData.knowledgeMastery.weak / currentData.knowledgeMastery.total * 100)}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs px-1 border-t border-slate-50 pt-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-slate-500 font-medium">未掌握 (待进一步突破)</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {currentData.knowledgeMastery.unlearned}个 <span className="text-slate-400 text-[10px]">({Math.round(currentData.knowledgeMastery.unlearned / currentData.knowledgeMastery.total * 100)}%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 border-t border-slate-50 pt-3.5 text-center">
                <button 
                  onClick={() => setShowKnowledgeGraphModal(true)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  <span>查看核心知识图谱覆盖详情 ➔</span>
                </button>
              </div>
            </div>

            {/* Chart Block 3: 学习行为分析 (Line chart SVG visualization) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">学习行为大类分析</h3>
                  <span className="text-[10px] text-slate-400 font-bold">每日投入波形图</span>
                </div>

                <div className="flex items-center gap-4 text-[10.5px] text-slate-500 mb-3.5 justify-end">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="w-2 h-0.5 bg-blue-600 block" /> 学习时长 (h)
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <span className="w-2 h-0.5 bg-emerald-400 block" /> 活跃指数
                  </span>
                </div>

                {/* SVG Visual approximation of learning progress curves */}
                {(() => {
                  const learningBehavior = currentData.learningBehavior;
                  const maxDuration = Math.max(...learningBehavior.map(item => item.duration), 1.0);
                  const step = learningBehavior.length > 1 ? 90 / (learningBehavior.length - 1) : 90;
                  
                  // Generate coordinates and paths
                  const points = learningBehavior.map((item, index) => {
                    const cx = 5 + (index * step);
                    // y-range from 15 (top) to 85 (bottom)
                    const cyDuration = 85 - ((item.duration / maxDuration) * 70);
                    const cyActive = 85 - ((item.activeScore / 100) * 70);
                    return { ...item, cx, cyDuration, cyActive };
                  });

                  const durationPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.cx} ${p.cyDuration}`).join(' ');
                  const activePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.cx} ${p.cyActive}`).join(' ');

                  const durationArea = points.length > 0 
                    ? `${durationPath} L ${points[points.length - 1].cx} 85 L ${points[0].cx} 85 Z` 
                    : '';
                  const activeArea = points.length > 0 
                    ? `${activePath} L ${points[points.length - 1].cx} 85 L ${points[0].cx} 85 Z` 
                    : '';

                  return (
                    <div className="relative h-44 w-full bg-slate-50/70 rounded-xl border border-slate-100 p-4 shrink-0 flex flex-col justify-between">
                      {/* Grid Lines mockup */}
                      <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-t border-slate-200/50 w-full" />
                        <div className="border-t border-slate-200/50 w-full" />
                        <div className="border-t border-slate-200/50 w-full" />
                      </div>

                      {/* SVG drawing dynamic curves based on actual data */}
                      <svg className="absolute inset-0 w-full h-full pb-8 pt-3 px-4 z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#186bfd" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#186bfd" stopOpacity="0.0"/>
                          </linearGradient>
                          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1"/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>

                        {/* Blue area fill under study hours */}
                        {durationArea && (
                          <path 
                            d={durationArea} 
                            fill="url(#blueGradient)" 
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Emerald area fill under active score */}
                        {activeArea && (
                          <path 
                            d={activeArea} 
                            fill="url(#emeraldGradient)" 
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Blue line: study hours */}
                        {durationPath && (
                          <path 
                            d={durationPath} 
                            fill="none" 
                            stroke="#186bfd" 
                            strokeWidth="2.2" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Emerald line: active score */}
                        {activePath && (
                          <path 
                            d={activePath} 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="1.8" 
                            strokeDasharray="2,2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}

                        {/* Dots and interactive tooltips */}
                        {points.map((p, index) => (
                          <g key={index} className="group/dot">
                            <title>{p.date}: 学习时长 {p.duration}h, 活跃度 {p.activeScore}%</title>
                            {/* Blue dot */}
                            <circle 
                              cx={p.cx} 
                              cy={p.cyDuration} 
                              r="3" 
                              fill="#ffffff" 
                              stroke="#186bfd"
                              strokeWidth="1.8"
                              className="cursor-pointer transition-all duration-150 group-hover/dot:r-[4.5px]" 
                            />
                            {/* Emerald dot */}
                            <circle 
                              cx={p.cx} 
                              cy={p.cyActive} 
                              r="2.5" 
                              fill="#ffffff" 
                              stroke="#10b981"
                              strokeWidth="1.5"
                              className="cursor-pointer transition-all duration-150 group-hover/dot:r-4" 
                            />
                          </g>
                        ))}
                      </svg>

                      {/* X Axis display */}
                      <div className="flex justify-between items-end text-[9px] text-slate-400 font-bold font-mono px-1 z-20 mt-auto pt-2.5 select-none">
                        {learningBehavior.map((item, index) => (
                          <span key={index}>{item.date}</span>
                        ))}
                      </div>

                      {/* Y Axis float indicators */}
                      <div className="absolute left-1.5 top-1 bottom-9 flex flex-col justify-between text-[8px] text-slate-400 font-mono select-none">
                        <span>{maxDuration.toFixed(1)}h</span>
                        <span>{(maxDuration / 2).toFixed(1)}h</span>
                        <span>0h</span>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-[10px] text-slate-400 leading-normal mt-2.5 font-medium italic">
                  💡 数据提示：自习和测试看播存在明显的周五/周六高峰，符合备考节奏。
                </p>
              </div>

              <div className="mt-4 border-t border-slate-50 pt-3 text-center">
                <button 
                  onClick={() => setShowBehaviorDetailModal(true)}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  <span>导出本期多维度的行为走势包 ➔</span>
                </button>
              </div>
            </div>

          </div>

          {/* C. Visual Analytics Row 2: Mistakes Analysis (Left) & Learning Habits (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mistakes Analytics Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">错题智能分类与高频考点</h3>
                  <span className="text-[10px] text-slate-400 font-bold">共累计 {currentData.errors.total} 题错题</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 py-2">
                  
                  {/* Left sub-column: Donut charts of mistake category */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center border-r border-slate-50 pr-4">
                    <span className="text-[10.5px] text-slate-400 font-bold mb-3">错误原因类型分布</span>
                    
                    {/* Ring indicator */}
                    <div 
                      className="w-28 h-28 rounded-full shadow-inner flex items-center justify-center relative"
                      style={{
                        background: 'conic-gradient(#186bfd 0% 37.2%, #a855f7 37.2% 61.6%, #f59e0b 61.6% 82.5%, #10b981 82.5% 94.1%, #94a3b8 94.1% 100%)'
                      }}
                    >
                      <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-medium">错题剖析</span>
                        <span className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">{currentData.errors.total}<span className="text-xs font-normal">题</span></span>
                      </div>
                    </div>

                    <div className="w-full space-y-1.5 mt-4 text-[10px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> 概念理解错误</span>
                        <span className="font-bold text-slate-800">{currentData.errors.types.concept}题 (37.2%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> 粗心计算疏忽</span>
                        <span className="font-bold text-slate-800">{currentData.errors.types.careless}题 (24.4%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 应用思路局限</span>
                        <span className="font-bold text-slate-800">{currentData.errors.types.application}题 (20.9%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-column: HBar Top 5 elements */}
                  <div className="sm:col-span-7 flex flex-col justify-center pl-2">
                    <span className="text-xs text-slate-400 font-bold mb-3.5 block">高频犯错课后知识考点 TOP 5</span>
                    
                    <div className="space-y-4">
                      {currentData.errors.topMistakes.map((tm, index) => (
                        <div key={index} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 truncate max-w-[140px]" title={tm.name}>
                              {index + 1}. {tm.name}
                            </span>
                            <span className="text-slate-400 font-bold shrink-0">{tm.count} 次错题</span>
                          </div>

                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${tm.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-5 border-t border-slate-50 pt-3.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">智能过滤匹配最需要温习的内容</span>
                <button 
                  onClick={() => setActiveView('mistakes')}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>立即攻克这些高频错题 ➔</span>
                </button>
              </div>
            </div>

            {/* Learning Habits Box */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-900 text-sm">个人专属学习习惯剖析</h3>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-black">
                    本周考评：良好
                  </div>
                </div>

                <div className="space-y-3.5">
                  
                  {/* Habit item 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">打卡坚持连续性</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">每周至少打卡并自习天数</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-800">
                      {currentData.habits.daysPerWeek === 6 ? '6天 / 7天' : `${currentData.habits.daysPerWeek} 天`}
                    </span>
                  </div>

                  {/* Habit item 2 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-600 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">学习节奏与自律判定</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">看播和随堂作业提交时差</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-purple-50 px-2 py-1 rounded">
                      {currentData.habits.tempo}
                    </span>
                  </div>

                  {/* Habit item 3 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">中深度专注时长占比</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">连续自习大于25分钟次数百分数</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-800">
                      {currentData.habits.focusRate || '82'}%
                    </span>
                  </div>

                  {/* Habit item 4 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100/60 text-orange-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">课程测验截止守时性</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">各科老师发布作业包按期交回率</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-orange-50 px-2 py-1 rounded">
                      {currentData.habits.timeliness}
                    </span>
                  </div>

                </div>
              </div>

              <div className="mt-5 border-t border-slate-50 pt-3.5 text-center">
                <button 
                  onClick={() => handleTriggerAction('习惯优化建议：系统推荐您保持早睡早息，将高频易错题集中在 20:00 的精神最高频闪黄金段完成。')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  获得针对性学习习惯强化建议 ➔
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: HISTORY ARCHIVE (1/4) */}
        <div className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start h-[calc(100vh-180px)] flex flex-col pr-1">
          
          {/* Box 1: History Reports List with dynamic loading */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2.5 shrink-0">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>历史学情存档</span>
              </h3>
              <span className="text-[10px] text-slate-400">点击项目重新载入</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {historicReportsList.map((hr) => (
                <div 
                  key={hr.id}
                  onClick={() => handleLoadHistory(hr)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    selectedHistoryReport === hr.id 
                      ? 'bg-blue-50/70 border-blue-300 font-bold shadow-3xs' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selectedHistoryReport === hr.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                    <div className="min-w-0">
                      <p className={`text-xs ${selectedHistoryReport === hr.id ? 'text-blue-700 font-bold' : 'text-slate-700 font-medium group-hover:text-slate-900'}`}>
                        {hr.name}
                      </p>
                      <p className="text-[9.5px] text-slate-400 select-none mt-0.5">
                        {hr.dateRange}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-1.5">
                    <span className="text-xs font-black text-slate-800">
                      {hr.score} <span className="text-[9.5px] font-normal text-slate-400">分</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison select box */}
            <div className="mt-5 pt-4 border-t border-slate-100 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                同班对比对比模型
              </span>

              <div className="flex gap-2">
                <select 
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 font-medium outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="prev_period">两周前基础均值线</option>
                  <option value="class_avg">同届期初基准线</option>
                  <option value="top_10">全班前 10% 优秀曲线</option>
                </select>

                <button 
                  onClick={() => {
                    setIsComparing(true);
                    handleTriggerAction(`已加载 “${comparisonPeriod === 'prev_period' ? '两周前基础均值线' : comparisonPeriod === 'class_avg' ? '同届期初基准线' : '全班前 10% 优秀曲线'}” 开始进行指标覆盖。`);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  开始
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. FLOATING BALL FOR AI RECOMMENDATIONS */}
      <button 
        onClick={() => setShowAiRecommendationsPopup(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 duration-200 cursor-pointer flex items-center gap-2 group border border-blue-400"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150"></div>
          <Bot className="w-5 h-5 relative z-10" />
        </div>
        <span className="text-xs font-bold font-sans tracking-wide pr-1 select-none">AI 提分策略</span>
      </button>

      {/* 4. AI RECOMMENDATIONS POPUP MODAL */}
      {showAiRecommendationsPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-scaleIn">
            {/* Title Header */}
            <div className="p-5 border-b border-blue-50 bg-gradient-to-r from-blue-50/60 to-white flex justify-between items-start shrink-0 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-3xs">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                    <span>AI 提分与策略建议</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">专属智能助学诊断与策略方案</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAiRecommendationsPopup(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                智学云系统结合本期看播时长、知识点掌握程度及错题分布，为您智能推荐以下提升计划：
              </p>

              <div className="space-y-3">
                {insights.map((insight) => {
                  const Icon = getIconComponent(insight.icon);
                  return (
                    <div 
                      key={insight.id}
                      onClick={() => showRecommendationDialog(insight)}
                      className="bg-slate-50/50 hover:bg-slate-50/100 p-4 rounded-2xl border border-slate-100 shadow-3xs hover:border-blue-400 hover:shadow-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex gap-3.5">
                        <div className={`p-2 rounded-xl w-9 h-9 flex items-center justify-center shrink-0 border ${insight.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            <span>{insight.title}</span>
                          </h4>
                          <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1">
                            {insight.desc}
                          </p>
                          
                          <div className="flex items-center gap-1 text-[9.5px] text-blue-600 font-bold mt-2.5 group-hover:underline">
                            <span>{insight.actionText}</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex flex-col shrink-0">
              <button 
                onClick={() => {
                  setShowAiRecommendationsPopup(false);
                  setSelectedRecommendation(insights[0] || null);
                  setAiResponse(null);
                  setChatInput('');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black py-2.5 shadow-sm hover:shadow-md transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>直接开启 AI 对话大纲</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI Interactive Assistant Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-5/80 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => {
                    setSelectedRecommendation(null);
                    setShowAiRecommendationsPopup(true);
                  }}
                  className="mr-1.5 p-1 px-2.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-200 bg-white shadow-3xs cursor-pointer select-none"
                  title="返回上一级"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>返回</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base">学习小助手：AI 学情诊断辅导</h3>
                  <p className="text-[11px] text-slate-400">正在复盘：{selectedRecommendation.title}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedRecommendation(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100/50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                <span className="font-black text-blue-800 block mb-1">💡 选定建议详情:</span>
                "{selectedRecommendation.desc}"
              </div>

              {aiResponse ? (
                <div className="space-y-3.5">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold mb-2 pb-1 border-b border-slate-200/50 text-xs">
                      <Bot className="w-4.5 h-4.5" />
                      <span>AI 辅导策略方案已生成:</span>
                    </div>
                    {aiResponse}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTriggerAction('已将推荐课程讲义和3道练习题添加到您的“学习计划”中，请在左侧点击查看')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-center"
                    >
                      一键收纳进「自学计划」
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedRecommendation(null);
                        setActiveView('mistakes');
                      }}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1"
                    >
                      <span>去错题本训练</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Bot className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-slate-400">点击下方按钮，免费与李同学的 AI 助学教练探讨定制强化要点</p>
                </div>
              )}
            </div>

            {/* Footer chat box inputs */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="询问具体怎么复习，或者输入你遇到的知识点疑惑..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAICoach();
                  }}
                  className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 px-3.5 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
                
                <button 
                  onClick={handleAskAICoach}
                  disabled={chatLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:bg-blue-300 shadow-sm"
                >
                  {chatLoading ? '分析中...' : '询问教练'}
                </button>
              </div>
              <div className="text-[10px] text-slate-400 text-center select-none">
                AI 教师已调档您在数据结构、高等数学等科目的错误热图。
              </div>
            </div>

          </div>
        </div>
      )}

      {/* KNOWLEDGE GRAPH MODAL */}
      {showKnowledgeGraphModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scaleIn font-sans">
            {/* Header */}
            <div className="p-5 border-b border-blue-50 bg-gradient-to-r from-blue-50/40 to-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base">核心学考知识图谱全覆盖诊断</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">多科关键概念映射 & 强弱层级动态下钻分析</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKnowledgeGraphModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full min-h-0">
              
              {/* Left Side: Nodes Matrix and Legend */}
              <div className="flex-1 overflow-y-auto p-5 border-r border-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-bold block">128 核心考点连通图 (点击节点追踪错题与建议)</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> 已掌握</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> 薄弱考点</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> 待攻克</span>
                    </div>
                  </div>

                  {/* Subject-based grouping nodes mapping */}
                  <div className="space-y-5">
                    {['数据结构与算法', '操作系统原理', '计算机网络', '数据库系统原理与AI'].map((subj) => {
                      // Filter list representing these topics
                      const matchedNodes = [
                        { id: 'n1', subject: '数据结构与算法', name: '单链表逆置及双指针', status: 'mastered', category: '线性结构', importance: '高', testFreq: '92%', pitfall: '删除或越界时，容易遗漏断开或指向NULL的前置指向。', recommendation: '手写模拟 LeetCode 206 题，加深指针变动内存拓扑脑补。' },
                        { id: 'n2', subject: '数据结构与算法', name: '二叉树非递归深度遍历', status: 'weak', category: '树型结构', importance: '极高', testFreq: '95%', pitfall: '在无递归回溯时，未标记右节点已被访问过，导致出栈死循环。', recommendation: '用真实的 Stack 对象模拟运行时栈帧，单步执行中序/后序序列。' },
                        { id: 'n3', subject: '数据结构与算法', name: '红黑树染色与旋转判定', status: 'unlearned', category: '平衡二叉树', importance: '高', testFreq: '75%', pitfall: '叔叔节点(Uncle)颜色判别后的左旋与右旋切换极易错记。', recommendation: '结合智学云“树结构可视化交互画板”，动态推倒三层节点变更图。' },
                        { id: 'n4', subject: '操作系统原理', name: '银行家安全算法矩阵推演', status: 'mastered', category: '进程同步', importance: '中', testFreq: '80%', pitfall: '多维矩阵减法计算马虎，误判死锁和线程释放顺序。', recommendation: '建议在草稿纸上横轴对准各资源总量，纵轴写最大需求向量差值。' },
                        { id: 'n5', subject: '操作系统原理', name: 'LRU 内存置换策略与缺页异常', status: 'weak', category: '内存管理', importance: '高', testFreq: '88%', pitfall: '混淆最久未使用LRU和最少使用LFU，且贝拉迪异常常识选择题易错。', recommendation: '重温操作系统课后作业13题，用双向链表+哈希表物理执行模拟看播。' },
                        { id: 'n6', subject: '计算机网络', name: 'TCP 拥塞控制与慢启动机制', status: 'weak', category: '传输层', importance: '极高', testFreq: '98%', pitfall: '难以精确计算到达阈值ssthresh后切换回拥塞避免的段指数值。', recommendation: '在草稿纸上模拟CWND随时间变化的折线走势图。' },
                        { id: 'n7', subject: '数据库系统原理与AI', name: 'SQL多表左外连接物理代价', status: 'mastered', category: '关系查询', importance: '中', testFreq: '84%', pitfall: '在 LEFT JOIN 中， WHERE 限定语句提前触发导致的左连接退化成内连接。', recommendation: '利用 EXPLAIN 观测 Hash Join 与 Nested Loop 的开销差。' },
                        { id: 'n8', subject: '数据库系统原理与AI', name: 'BP反向传播梯度推导法则', status: 'unlearned', category: '神经网络', importance: '极高', testFreq: '90%', pitfall: '复合函数偏导连乘时漏加偏执项对梯度的线性修正。', recommendation: '利用反向传播计算小卡片对梯度进行手动回溯，再编写 PyTorch 测试。' }
                      ].filter(n => (subj === '数据库系统原理与AI' ? n.subject.includes('数据库') || n.subject.includes('人工') : n.subject === subj));

                      return (
                        <div key={subj} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                          <h4 className="text-xs font-black text-slate-700 mb-2.5 flex items-center gap-1.5 border-b border-slate-200/40 pb-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>{subj}</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {matchedNodes.map((node) => {
                              const isSelected = selectedNodeId === node.id;
                              return (
                                <div 
                                  key={node.id}
                                  onClick={() => setSelectedNodeId(node.id)}
                                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                                    isSelected 
                                      ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20' 
                                      : 'bg-white border-slate-100 hover:border-slate-300 shadow-3xs'
                                  }`}
                                >
                                  {/* Status indicator pill dot */}
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                      {node.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                        node.status === 'mastered' 
                                          ? 'bg-emerald-500' 
                                          : node.status === 'weak' 
                                          ? 'bg-blue-500' 
                                          : 'bg-amber-500'
                                      }`} />
                                      <span className="text-[8.5px] text-slate-400 font-bold">
                                        {node.status === 'mastered' ? '掌握率 95%' : node.status === 'weak' ? '掌握率 62%' : '掌握率 28%'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{node.name}</p>
                                  <div className="flex items-center gap-2 mt-1.5 text-[9.5px]">
                                    <span className="text-slate-400">考频: <strong className="text-slate-600 font-bold">{node.testFreq}</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-400">重要度: <strong className="text-slate-600 font-bold">{node.importance}</strong></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>💡 统计建议：李同学当前在“二叉树非递归深度遍历”及“TCP控制慢启动”存在频发错题。</span>
                </div>
              </div>

              {/* Right Side: Detailed down-drill review and interactive AI prompt card */}
              <div className="w-full lg:w-[360px] bg-slate-50 p-5 overflow-y-auto flex flex-col justify-between shrink-0 border-l border-slate-100">
                {(() => {
                  const node = [
                    { id: 'n1', subject: '数据结构与算法', name: '单链表逆置及双指针', status: 'mastered', category: '线性结构', importance: '高', testFreq: '92%', pitfall: '忘记处理链表头部断开连接，极易形成死循环；在多指针滑动时忽视空指针判断。', recommendation: '多手写 LeetCode 206 题，加深脑补链表指针变动的拓扑结构。结合双指针循环不变量判定。' },
                    { id: 'n2', subject: '数据结构与算法', name: '二叉树非递归深度遍历', status: 'weak', category: '树型结构', importance: '极高', testFreq: '95%', pitfall: '在无递归回溯后序遍历中，未标记右节点已被访问过，导致出栈死循环。栈内元素频繁混淆。', recommendation: '先掌握递归写法，然后手写模拟单堆栈调用轨迹，并在IDE里单步调试。使用智学云树型面板练习。' },
                    { id: 'n3', subject: '数据结构与算法', name: '红黑树染色与旋转判定', status: 'unlearned', category: '平衡树结构', importance: '高', testFreq: '75%', pitfall: '旋转时父节点及叔叔节点颜色的五种判定规则容易记混。左旋、右旋状态机在连续插入下极易失效。', recommendation: '重点阅读经典教材《算法导论》，结合2D动画模拟工具有步骤地推倒多树枝旋转。' },
                    { id: 'n4', subject: '操作系统原理', name: '银行家安全算法矩阵推演', status: 'mastered', category: '并发与同步', importance: '中', testFreq: '80%', pitfall: '多变量分配矩阵的向量减法做不严谨，容易对安全序列计算错误。', recommendation: '重点理解最大需求（Max）、已分配（Allocation）与需求差额（Need）的运算公式。' },
                    { id: 'n5', subject: '操作系统原理', name: 'LRU 内存置换策略与缺页异常', status: 'weak', category: '内存管理', importance: '高', testFreq: '88%', pitfall: 'LRU 实质是根据过去时间判定。容易错误混淆最久未使用LRU和最少使用LFU，且容易算错缺页率。', recommendation: '手写一个12位数的经典置换序列，对比在物理块数增加时缺页率是否会出现贝拉迪异常。' },
                    { id: 'n6', subject: '计算机网络', name: 'TCP 拥塞控制与慢启动机制', status: 'weak', category: '传输层协议', importance: '极高', testFreq: '98%', pitfall: '容易记反 TIME_WAIT 状态的作用，以及 ssthresh 动态折半分界点的数学计算易疏忽。', recommendation: '在草稿纸上模拟 CWND 从慢启动到拥塞避免，再到收到双ACK折半的折线图走势。' },
                    { id: 'n7', subject: '数据库系统原理与AI', name: 'SQL多表左外连接物理代价', status: 'mastered', category: '查询优化', importance: '中', testFreq: '84%', pitfall: '对外连接（LEFT JOIN）时 WHERE 过滤与 ON 条件限定的作用范围混淆，错判了返回集大小。', recommendation: '多利用 EXPLAIN 关键词分析在 Nested Loop Join、Hash Join 下执行速度的差异。' },
                    { id: 'n8', subject: '数据库系统原理与AI', name: 'BP反向传播梯度推导法则', status: 'unlearned', category: '神经网络', importance: '极高', testFreq: '90%', pitfall: '复合函数求偏导，对矩阵转置后求导偏离矩阵维度；未考虑激活函数的求梯边界。', recommendation: '在稿纸上手写双层感知机的公式，并编写单向一维求导回溯检验。' }
                  ].find((n) => n.id === selectedNodeId) || { id: 'n2', subject: '数据结构与算法', name: '二叉树非递归深度遍历', status: 'weak', category: '树型结构', importance: '极高', testFreq: '95%', pitfall: '在无递归回溯后序遍历中，未标记右节点已被访问过，导致出栈死循环。栈内元素频繁混淆。', recommendation: '先掌握递归写法，然后手写模拟单堆栈调用轨迹，并在IDE里单步调试。使用智学云树型面板练习。' };

                  return (
                    <div className="flex flex-col h-full justify-between gap-5">
                      <div className="space-y-4">
                        <div className="p-3.5 bg-white border border-slate-200/50 rounded-2xl">
                          <span className="text-[10px] text-blue-600 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                            {node.subject}
                          </span>
                          <h5 className="font-extrabold text-sm text-slate-900 mt-2">{node.name}</h5>
                          
                          <div className="grid grid-cols-2 gap-3 mt-4 text-[10.5px] border-t border-slate-50 pt-3">
                            <div>
                              <span className="text-slate-400 block font-medium">重要程度</span>
                              <span className="text-xs font-black text-rose-500 block mt-0.5">{node.importance}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">考试覆盖频次</span>
                              <span className="text-xs font-black text-slate-800 block mt-0.5">{node.testFreq}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pitfall Analysis */}
                        <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100/50 space-y-1.5">
                          <span className="flex items-center gap-1 text-[11px] font-black text-rose-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>历史错因剖析 (错源高发区):</span>
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                            {node.pitfall}
                          </p>
                        </div>

                        {/* Recommended Path */}
                        <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100/50 space-y-1.5">
                          <span className="flex items-center gap-1 text-[11px] font-black text-blue-700">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>推荐提升计划 & 补白指导:</span>
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                            {node.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mt-auto pt-4 border-t border-slate-200/50">
                        <button 
                          onClick={() => {
                            setShowKnowledgeGraphModal(false);
                            setSelectedRecommendation(insights[0] || null);
                            setAiResponse(`
李同学，针对你选择的【${node.name}】考点，助学教练已经将你的诊断大纲调出。

**该考点错题热图剖析：**
1. 你的主观扣分痛点在于：${node.pitfall}
2. 考纲评定重要程度：${node.importance}。
   
**限时专项提分任务指引：**
- 第一步：重新阅读为你推荐的最优攻克指南：${node.recommendation}。
- 第二步：做完此推荐后，在“经典错题集”里筛选带有 [${node.category}] 卷签的纠错题进行二轮变式检验。
- 第三步：如有疑问，请直接在下方文本栏中追问我关于此考点的解法公式！
                            `);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black py-2.5 transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
                        >
                          <Bot className="w-4 h-4" />
                          <span>一键开启 AI 专项答疑讲解</span>
                        </button>
                        
                        <p className="text-[9.5px] text-slate-400 text-center">
                          点击后可在右下角对话教练窗口做精确提分下钻
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MULTI-DIMENSIONAL BEHAVIORAL MATRIX MODAL */}
      {showBehaviorDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scaleIn font-sans">
            {/* Header */}
            <div className="p-5 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/40 to-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base">学生多维度在线行为交互追踪走势分析</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">本周期：每日 24h 留时热点、课上提问交互密度及睡眠作息曲线规律</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBehaviorDetailModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Box 1: Interactive Heatmap Matrix */}
              <div className="bg-slate-50 border border-slate-100/70 p-4 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">1. 即时学习时间带热力分布矩阵</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">纵轴: 学习时段 (08时 ~ 24时) / 横轴: 礼拜一至礼拜天。格子颜色代表看播及作业互动沉浸深度。</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9.5px]">
                    <span className="text-slate-400">Low (0h)</span>
                    <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-200/60 rounded" />
                    <span className="w-2.5 h-2.5 bg-blue-100 rounded" />
                    <span className="w-2.5 h-2.5 bg-blue-300 rounded" />
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded" />
                    <span className="w-2.5 h-2.5 bg-indigo-700 rounded" />
                    <span className="text-slate-500 font-bold">Deep (4h+)</span>
                  </div>
                </div>

                {/* Simulated Heatmap Generation */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[550px] border-collapse text-center">
                    <thead>
                      <tr>
                        <th className="p-1 text-[9.5px] text-slate-400 font-bold tracking-wider w-14 text-left">时间区间</th>
                        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                          <th key={day} className="p-1 text-[10px] text-slate-600 font-extrabold">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: '08:00', data: [0, 1.2, 0.5, 0.2, 2.1, 0.8, 3.2] },
                        { label: '10:00', data: [2.5, 1.1, 0, 1.5, 0.5, 3.5, 2.8] },
                        { label: '12:00', data: [0.1, 0.2, 0.1, 0, 0.3, 1.1, 0.5] },
                        { label: '14:00', data: [1.8, 0, 3.1, 1.2, 1.6, 2.5, 1.1] },
                        { label: '16:00', data: [0.5, 1.5, 1.2, 0.8, 2.8, 0.5, 3.1] },
                        { label: '19:00', data: [3.2, 2.6, 1.1, 2.1, 1.5, 4.2, 3.8] },
                        { label: '21:00', data: [4.5, 3.8, 4.2, 3.1, 4.8, 5.1, 4.1] },
                        { label: '23:00', data: [1.1, 1.5, 0.8, 0.5, 2.2, 3.1, 0.8] }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-200/30">
                          <td className="p-1.5 text-[9px] text-slate-400 font-semibold font-mono text-left">{row.label}</td>
                          {row.data.map((val, dIdx) => {
                            // Map value to custom style background
                            let bgClass = 'bg-slate-100 hover:scale-110';
                            if (val > 4) bgClass = 'bg-indigo-700 text-white font-bold shadow-3xs';
                            else if (val >= 2.5) bgClass = 'bg-blue-500 text-white font-medium hover:bg-blue-600';
                            else if (val >= 1.2) bgClass = 'bg-blue-300 hover:bg-blue-400';
                            else if (val > 0.1) bgClass = 'bg-blue-100 hover:bg-blue-200';
                            
                            return (
                              <td key={dIdx} className="p-1 text-center">
                                <div 
                                  title={`${row.label}，值：${val}小时`}
                                  className={`h-7 rounded-lg text-[9px] flex items-center justify-center transition-all duration-100 shrink-0 ${bgClass} cursor-pointer`}
                                >
                                  {val > 0 ? `${val}h` : '-'}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box 2: Radar-approximated Dimensions and Activity indices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Visual metric 1 */}
                <div className="border border-slate-100 p-4 rounded-2xl bg-white space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span>本学期多维度学能指标评定</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">同级均值对比</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: '看播交互率', current: 88, avg: 72, color: 'from-blue-500 to-indigo-600' },
                      { name: '习题作答敏捷度', current: 76, avg: 65, color: 'from-emerald-400 to-teal-500' },
                      { name: '知识持久度留存率', current: 82, avg: 70, color: 'from-purple-500 to-pink-500' },
                      { name: '错题复温自主频次', current: 61, avg: 58, color: 'from-amber-400 to-orange-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-700 text-[11px] font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-500">
                            当前: <strong className="font-extrabold text-slate-700">{item.current}%</strong> / 平均: {item.avg}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          {/* Average marker */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10" style={{ left: `${item.avg}%` }} title="同班级平均线" />
                          <div 
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-300`}
                            style={{ width: `${item.current}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sleep & Schedule analysis */}
                <div className="border border-slate-100 p-4 rounded-2xl bg-white space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>睡眠与作息规律度追踪卡片</span>
                    </h5>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 font-bold">考前黄金期</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    系统记录显示，本周深夜23时以后产生的主动交互仅占 <strong className="text-indigo-600 font-black">4.8%</strong> ；活跃高峰多落在 20:00-22:00（自习看播）。这是一个健康的考前规律作息！
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">建议作息模式:</span>
                      <span className="font-black text-emerald-600">高效晨起自发型</span>
                    </div>
                    <div className="flex justify-between text-[11px] border-t border-slate-200/50 pt-1.5">
                      <span className="text-slate-500 font-semibold">最优看播窗口:</span>
                      <span className="font-black text-indigo-600">晚间 19:30 - 21:50</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-amber-600 font-medium italic mt-2.5">
                    ⚠️ 提分警示：在下午 14:00 错题提交中正确率偏低 12%，该时段大部集中在操作系统复杂算法推理，建议在午间保证20分钟高效午休。
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom action bar */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">导出底层包含 2,140 行高精度传感器及课中答疑行为日志记录</span>
              
              <button 
                onClick={handleExportBehaviorCSV}
                disabled={exportLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black py-2.5 px-6 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 disabled:bg-indigo-300 cursor-pointer"
              >
                {exportLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>正在生成走势...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>立即打包导出行为大类走势 CSV ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW H: REPORT EXPORT PREVIEW MODAL */}
      {showExportPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 overflow-hidden animate-fadeIn font-sans">
          <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-200/80 max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>李同学智能学情报告 — 效果预审</span>
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium font-sans">
                  提示：以下格式已针对标准 A4 纵向排版进行物理像素点模拟，确认无误后点击下方按钮可下载高清 PDF 报告。
                </p>
              </div>
              <button 
                onClick={() => setShowExportPreview(false)}
                className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body: Scrollable A4 Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-100/60 shadow-inner">
              
              {/* Simulated Paper (A4 Page style) */}
              <div className="bg-white shadow-lg border border-slate-300/60 mx-auto max-w-[195mm] w-full p-6 sm:p-10 text-slate-800 space-y-7 relative rounded-lg select-none font-serif">
                
                {/* Paper Header */}
                <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end font-sans text-[10px] font-bold text-slate-500 tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>AI STUDIO 智学评测研究中心</span>
                  </div>
                  <span>INTERNAL REFERENCE / 内部尊享学参</span>
                </div>

                {/* Report Title */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans leading-tight">
                    李同学 · 阶段学情表现与综合课业能力诊断白皮书
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 font-sans text-xs font-semibold">
                    <span>报告时段: <strong className="text-slate-700">{currentData.timeframeText}</strong></span>
                    <span>生成时间: {new Date().toLocaleDateString()}</span>
                    <span>评估评级: <strong className="text-blue-600">Grade A (优等)</strong></span>
                  </div>
                </div>

                {/* Section A: KPI Cards inside paper */}
                <div className="space-y-3 font-sans">
                  <h3 className="text-xs font-extrabold text-slate-800 tracking-wide border-l-3 border-blue-600 pl-2 uppercase">
                    一、 核心学习效能金标准指标
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">学习总耗时</span>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">
                        {currentData.stats.duration} 小时
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold block">
                        ↑ 较上周期增长 {currentData.stats.durationChange} 小时
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">每日平均耗时</span>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">
                        {currentData.stats.avgDaily} 小时
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold block">
                        ↑ 较上周期提升 {currentData.stats.avgDailyChange} 小时
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">课业打卡答题量</span>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">
                        {currentData.stats.tasksCount} 题/项
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold block">
                        ↑ 新攻克考点 +{currentData.stats.tasksChange} 项
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">客观答对率(Avg)</span>
                      <p className="text-sm font-extrabold text-slate-800 font-mono text-blue-600">
                        {currentData.stats.correctRate}%
                      </p>
                      <span className="text-[9px] text-emerald-600 font-bold block">
                        ↑ 正确度拉伸 +{currentData.stats.correctRateChange}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section B: Course Progress inside paper */}
                <div className="space-y-3 font-sans">
                  <h3 className="text-xs font-extrabold text-slate-800 tracking-wide border-l-3 border-blue-600 pl-2 uppercase">
                    二、 学科课程进度与知识掌握程度
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                    {currentData.courseProgress.map((course, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/30 flex items-center justify-between gap-4 font-semibold">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-slate-800">
                            <span className="font-bold text-[11px] md:text-xs">{course.name}</span>
                            <span className="text-slate-500 text-[10px] font-mono">
                              学完 {course.completedChapters} / {course.totalChapters} 章
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap shrink-0">
                          <span className="text-[10px] text-slate-400 block font-bold">学习进度 比率</span>
                          <span className="text-xs font-bold text-blue-600 font-mono">{course.completionRate}%</span>
                        </div>
                        <div className="text-right whitespace-nowrap shrink-0 pl-2">
                          <span className="text-[10px] text-slate-400 block font-bold">掌握评估 阈值</span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">{course.masteryRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Errors and recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                  
                  <div className="space-y-2 border border-slate-200/80 p-3.5 bg-slate-50/30 rounded-xl">
                    <span className="text-xs font-extrabold text-slate-800 block">三、 学期课业痛点与失误倾向</span>
                    <div className="space-y-1.5 text-xs text-slate-600 font-semibold leading-relaxed">
                      <p>
                        本时段累计触发知识失误及解题错误 <strong>{currentData.errors.total}</strong> 处。
                      </p>
                      <p className="text-[11px] text-slate-500 font-normal">
                        其中，概念含混性质错误占据 <strong>{currentData.errors.types.concept}</strong> 项，应用计算链条不完整性占据大头。
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold bg-blue-50/50 p-2 rounded border border-blue-100">
                        🔑 推荐策略：重点查漏错题本高优项目《链表的基本操作》，多学科归纳复盘。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border border-slate-200/80 p-3.5 bg-slate-50/30 rounded-xl">
                    <span className="text-xs font-extrabold text-slate-800 block">四、 黄金自学精力周期与心率建议</span>
                    <div className="space-y-1.5 text-xs text-slate-600 font-semibold leading-relaxed">
                      <p>
                        您的脑力高效集中峰值区间：<strong className="text-slate-800 font-mono">{currentData.stats.activePeriod}</strong>。
                      </p>
                      <p className="text-[11px] text-slate-500 font-normal">
                        专注稳定性较上周呈现 <strong>{currentData.stats.activePeriodChange}</strong> 特性，说明对学习时长有较为严密的自我管控。
                      </p>
                      <p className="text-[11px] text-emerald-700 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                        🎯 建议结合每周 “番茄倒计时” 展开间歇性多通道巩固，杜绝碎片化信息流干扰。
                      </p>
                    </div>
                  </div>

                </div>

                {/* Paper Footer */}
                <div className="pt-4 border-t border-slate-200 text-center font-sans text-[9px] font-bold text-slate-400 tracking-wide">
                  本报告已严格嵌入系统防伪标识与安全散列码 • 仅针对学生本人个人自主提分训练服务
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-white px-6 py-4.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-slate-500 font-semibold font-sans">
                点击右侧按钮，导出为高保真、可搜索的 PDF 学术剖析文本。
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportPreview(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  继续编辑参数
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExport();
                    setShowExportPreview(false);
                  }}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>确认生成并下载 PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

