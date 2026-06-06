import React, { useState, useEffect, useRef } from 'react';
import { 
  FileQuestion, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Filter, 
  Send, 
  Trash2, 
  Plus, 
  RotateCcw, 
  BookOpen, 
  Award, 
  AlertCircle,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
  X,
  FileText,
  Play,
  Pause,
  Download,
  ListCheck,
  Layers,
  CalendarX,
  ArrowDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, ActiveView, MistakeQuestion } from '../types';

interface MistakesViewProps {
  courses: Course[];
  setActiveView: (view: ActiveView) => void;
  setSelectedCourseId: (id: string | null) => void;
}

interface QuestionOption {
  key: string;
  text: string;
}

interface MistakesData {
  id: string;
  type: '单选题' | '多选题' | '判断题' | '填空题';
  questionText: string;
  options: QuestionOption[];
  userAnswer: string;
  correctAnswer: string;
  course: string;
  knowledgePoint: string;
  errorCount: number;
  difficulty: '易' | '中' | '难';
  status: '未掌握' | '待复习' | '已掌握';
  timestamp: string;
  explanation: string;
  commonMistake: string;
  aiGreeting: string;
}

export default function MistakesView({ courses, setActiveView, setSelectedCourseId }: MistakesViewProps) {
  const [mistakes, setMistakes] = useState<MistakesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/space/mistakes-detail')
      .then(res => res.json())
      .then(data => {
        setMistakes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching mistakes:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        正在加载错题本数据...
      </div>
    );
  }

  // 2. Dropdown Filter Categories
  const [selectedCourse, setSelectedCourse] = useState<string>('全部课程');
  const [selectedKnowledge, setSelectedKnowledge] = useState<string>('全部知识点');
  const [selectedType, setSelectedType] = useState<string>('全部题型');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部难度');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部状态');
  
  // Searching & Selection State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Right Drawer Sticky View
  const [activeQuestionId, setActiveQuestionId] = useState<string>('Q12673');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [userRedoSelectedKey, setUserRedoSelectedKey] = useState<string | null>(null);
  const [redoResult, setRedoResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // AI Interactive Simulator State (Right panel chat & Audio)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioTimer, setAudioTimer] = useState<string>('00:00 / 02:18');
  const audioIntervalRef = useRef<any>(null);

  // Chat Input / Response
  const [aiChatQuery, setAiChatQuery] = useState<string>('');
  const [aiResponseList, setAiResponseList] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [aiIsAnswering, setAiIsAnswering] = useState<boolean>(false);
  
  // Toast notifications UI
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Modals State
  const [showGlobalStatsModal, setShowGlobalStatsModal] = useState<boolean>(false);
  const [showWeakPointsModal, setShowWeakPointsModal] = useState<boolean>(false);
  const [showTrendDiagnosisModal, setShowTrendDiagnosisModal] = useState<boolean>(false);

  // Retrieve current active question detail
  const currentQuestion = mistakes.find(m => m.id === activeQuestionId) || mistakes[0];

  useEffect(() => {
    // Sync preselected answer state when selected question changes
    setUserRedoSelectedKey(null);
    setRedoResult(null);
    setAiResponseList([]);
    setIsAudioPlaying(false);
    setAudioProgress(0);
    setAudioTimer('00:00 / 02:18');
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
  }, [activeQuestionId]);

  // Handle Simulated Audio Wave movement
  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    } else {
      setIsAudioPlaying(true);
      const totalSeconds = 138; // 2 min 18s
      let elapsed = Math.round((audioProgress / 100) * totalSeconds);

      audioIntervalRef.current = setInterval(() => {
        elapsed += 1;
        if (elapsed >= totalSeconds) {
          elapsed = 0;
          setIsAudioPlaying(false);
          clearInterval(audioIntervalRef.current);
        }
        const currentMin = Math.floor(elapsed / 60);
        const currentSec = elapsed % 60;
        const formattedTime = `${currentMin.toString().padStart(2, '0')}:${currentSec.toString().padStart(2, '0')} / 02:18`;
        setAudioTimer(formattedTime);
        setAudioProgress(Math.round((elapsed / totalSeconds) * 100));
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Show Temporary Toast Message Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate All Dynamic Options lists based on existing questions
  const availableCourses = ['全部课程', ...Array.from(new Set(mistakes.map(m => m.course)))];
  const availableKnowledgePoints = ['全部知识点', ...Array.from(new Set(mistakes.map(m => m.knowledgePoint)))];
  const availableTypes = ['全部题型', '单选题', '多选题', '判断题', '填空题'];
  const availableDifficulties = ['全部难度', '易', '中', '难'];
  const availableStatuses = ['全部状态', '未掌握', '待复习', '已掌握'];

  // Apply Full Grid Filtering
  const filteredQuestions = mistakes.filter(m => {
    const matchCourse = selectedCourse === '全部课程' || m.course === selectedCourse;
    const matchKnowledge = selectedKnowledge === '全部知识点' || m.knowledgePoint === selectedKnowledge;
    const matchType = selectedType === '全部题型' || m.type === selectedType;
    const matchDiff = selectedDifficulty === '全部难度' || m.difficulty === selectedDifficulty;
    const matchStatus = selectedStatus === '全部状态' || m.status === selectedStatus;
    
    const matchSearch = searchQuery.trim() === '' || 
      m.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.knowledgePoint.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCourse && matchKnowledge && matchType && matchDiff && matchStatus && matchSearch;
  });

  // Derived KPI Stats
  const kpiTotal = mistakes.length;
  const kpiUnmasteredCount = mistakes.filter(m => m.status === '未掌握').length;
  const kpiReviewCount = mistakes.filter(m => m.status === '待复习').length;
  const kpiMasteredCount = mistakes.filter(m => m.status === '已掌握').length;
  const kpiCourseSet = new Set(mistakes.map(m => m.course)).size;
  const totalIncurredErrors = mistakes.reduce((sum, item) => sum + item.errorCount, 0);

  // Course Data Percentages (Mock Donut chart calculations dynamically based on state)
  const getCourseBreakdown = () => {
    const counts: { [key: string]: number } = {};
    mistakes.forEach(m => {
      counts[m.course] = (counts[m.course] || 0) + 1;
    });
    return Object.entries(counts).map(([name, val], idx) => {
      const percentage = ((val / mistakes.length) * 100).toFixed(1);
      const colorMap = [
        'bg-blue-500 border-blue-500', 
        'bg-indigo-500 border-indigo-500', 
        'bg-yellow-400 border-yellow-400', 
        'bg-purple-500 border-purple-500', 
        'bg-emerald-400 border-emerald-400'
      ];
      const bulletColorMap = [
        'bg-blue-500', 'bg-indigo-500', 'bg-yellow-400', 'bg-purple-500', 'bg-emerald-400'
      ];
      return {
        name,
        count: val,
        percentage,
        circleColor: colorMap[idx % colorMap.length],
        bulletColor: bulletColorMap[idx % bulletColorMap.length]
      };
    });
  };

  const courseBreakdown = getCourseBreakdown();

  // Knowledge top-list stats
  const knowledgeTopList = [
    { name: '二叉树的遍历', count: 18, pct: '90%' },
    { name: '进程调度算法', count: 16, pct: '80%' },
    { name: 'TCP 三次握手', count: 14, pct: '70%' },
    { name: 'SQL 连接查询', count: 12, pct: '60%' },
    { name: '链表的反转', count: 10, pct: '50%' },
  ];

  // 7-Week trend sample metrics
  const weekTrendPoints1 = [80, 60, 75, 50, 60, 30, 70]; // 错题数
  const weekTrendPoints2 = [10, 20, 15, 30, 20, 40, 20]; // 已解决错题

  // Selection Checkbox handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredQuestions.map(m => m.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleToggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowIds([...selectedRowIds, id]);
    } else {
      setSelectedRowIds(selectedRowIds.filter(x => x !== id));
    }
  };

  // Redo submitting correctness algorithm in Right Panel
  const handleRedoVerification = () => {
    if (!userRedoSelectedKey) {
      showToast('❌ 请先挑选一个选项作为作答答案。');
      return;
    }
    const isCorrect = userRedoSelectedKey === currentQuestion.correctAnswer;
    if (isCorrect) {
      setRedoResult({
        type: 'success',
        text: '🎉 正确！您已准确找回该考点的破题方案。该错题难度已为您记录掌握！'
      });
      // Convert state in master dataset
      setMistakes(prev => prev.map(m => m.id === currentQuestion.id ? { ...m, status: '已掌握' as const } : m));
      showToast('👍 错题状态已成功标记为 [已掌握]');
    } else {
      setRedoResult({
        type: 'error',
        text: '❌ 答案不正确。不要气馁！可以参考下方【解析】及【易错点】提点，或召唤右侧 AI 讲解为您提供更进一步剖析。'
      });
      if (currentQuestion.status === '已掌握') {
        setMistakes(prev => prev.map(m => m.id === currentQuestion.id ? { ...m, status: '待复习' as const } : m));
      }
    }
  };

  // Mark status individually
  const toggleMarkAsMastered = (id: string, forceStatus?: '已掌握' | '待复习' | '未掌握') => {
    setMistakes(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = forceStatus || (m.status === '已掌握' ? '待复习' : '已掌握');
        showToast(`✔ 题目 ${id} 状态已更新为：[${nextStatus}]`);
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  // Batch actions
  const executeBatchAction = (action: 'mastered' | 'review' | 'delete' | 'export' | 'addReview') => {
    if (selectedRowIds.length === 0) {
      showToast('⚠️ 未勾选任何题目，请在表格首列勾选错题。');
      return;
    }

    if (action === 'mastered') {
      setMistakes(prev => prev.map(m => selectedRowIds.includes(m.id) ? { ...m, status: '已掌握' } : m));
      showToast(`⚡ 成功批量标记 ${selectedRowIds.length} 道题目为 [已掌握]`);
    } else if (action === 'review') {
      setMistakes(prev => prev.map(m => selectedRowIds.includes(m.id) ? { ...m, status: '待复习' } : m));
      showToast(`⚡ 成功批量标记 ${selectedRowIds.length} 道题目为 [待复习]`);
    } else if (action === 'delete') {
      if (confirm(`确认清除这 ${selectedRowIds.length} 门做错错题？此操作不可逆。`)) {
        setMistakes(prev => prev.filter(m => !selectedRowIds.includes(m.id)));
        showToast(`🗑️ 已成功从错题本清空 ${selectedRowIds.length} 条数据`);
        setSelectedRowIds([]);
      }
    } else if (action === 'export') {
      const dataStr = JSON.stringify(mistakes.filter(m => selectedRowIds.includes(m.id)), null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `智学平台_错题导出_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast(`💾 已生成 ${selectedRowIds.length} 题的高清 JSON 学术归并教案并触发自动下载。`);
    } else if (action === 'addReview') {
      showToast(`📝 成功将 ${selectedRowIds.length} 题合并添加至您的「智能考前冲刺复习清单」中！`);
    }
  };

  // Send interactive AI chat query contextually to server-side Gemini route
  const handleSendAIPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;

    const userText = aiChatQuery.trim();
    setAiResponseList(prev => [...prev, { sender: 'user', text: userText }]);
    setAiChatQuery('');
    setAiIsAnswering(true);

    const contextPrompt = `我是一名正在为课程「${currentQuestion.course}」中关于「${currentQuestion.knowledgePoint}」错题感到困惑的李同学。
    
该题目是：
【题干】：${currentQuestion.questionText}
【标准正确答案】：${currentQuestion.correctAnswer}
【做错时选择】：${currentQuestion.userAnswer}
【解析参考】：${currentQuestion.explanation}

我想向您请教关于下方问题：
"${userText}"

请按照友好启发、一针见血的方法，站在学术微积分或计算机架构导师的高度为我进行2-3句超精简解答。不要有废话。`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextPrompt })
      });

      if (!response.ok) {
        throw new Error('API down');
      }

      const resJson = await response.json();
      setAiResponseList(prev => [...prev, { sender: 'ai', text: resJson.text || '没有答复' }]);
    } catch (err) {
      console.warn('Fallback to local offline simulator', err);
      // Simulate real-time responses
      setTimeout(() => {
        let answer = '';
        if (userText.includes('为什么') || userText.includes('原因')) {
          answer = `因为该性质要求直接指向链结的首节点！如果去到其余部位，由于它是非连续的逻辑模型，底层的单向指针必定要从根节点一条条偏移查找，时间开销便线性恶化成了O(n)级。这样你理解了吗？`;
        } else if (userText.includes('怎么') || userText.includes('如何')) {
          answer = `方法很简单：遇到此类选择题，试着在草稿纸写一个单点哨兵头。如果它的操作可以在1步内改写head和node.next指针，就是绝对的O(1)！`;
        } else {
          answer = `这个问题提得非常好。在学术备考中，${currentQuestion.knowledgePoint}的物理变化十分高阶。我们可以牢记其头部操作的时间常数恒为1这个真理，就能规避这一类的经典考题陷阱啦。`;
        }
        setAiResponseList(prev => [...prev, { sender: 'ai', text: answer }]);
      }, 700);
    } finally {
      setAiIsAnswering(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800 -mt-2 pb-16">
      
      {/* Dynamic Toast Prompt Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white font-semibold text-xs md:text-sm px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center gap-2.5 border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Static Header Info bar matching image header metadata */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3.5 pb-2 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <FileQuestion className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>错题本</span>
              <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-widest">
                Academic Log
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">错题整理与针对性复习，攻克学习薄弱点。点击错题条目，一键开启多端深度脑图排查与 AI 问讯讲解。</p>
          </div>
        </div>

        {/* 1. Header Select Dropdowns Area */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
            
            {/* Filter 1 Course */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">课程</span>
              <select 
                value={selectedCourse} 
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedKnowledge('全部知识点'); // reset
                }}
                className="bg-white border border-slate-250 hover:border-slate-400 transition rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer outline-none min-w-[130px] shadow-3xs"
              >
                {availableCourses.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter 2 Knowledge Point */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">知识点</span>
              <select 
                value={selectedKnowledge} 
                onChange={(e) => setSelectedKnowledge(e.target.value)}
                className="bg-white border border-slate-250 hover:border-slate-400 transition rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer outline-none min-w-[135px] shadow-3xs"
              >
                {availableKnowledgePoints.map((k, i) => (
                  <option key={i} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Filter 3 Wrong Type */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">错误类型</span>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-slate-250 hover:border-slate-400 transition rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer outline-none min-w-[120px] shadow-3xs"
              >
                {availableTypes.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Filter 4 Difficulty */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">难度</span>
              <select 
                value={selectedDifficulty} 
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-white border border-slate-250 hover:border-slate-400 transition rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer outline-none min-w-[100px] shadow-3xs"
              >
                {availableDifficulties.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Filter 5 Status */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">状态</span>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-250 hover:border-slate-400 transition rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer outline-none min-w-[110px] shadow-3xs"
              >
                {availableStatuses.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            
            {/* Search inputs bar */}
            <div className="relative flex-1 md:w-60 min-w-[180px]">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索题目内容 / 题目ID"
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 border border-slate-250 hover:border-slate-400 transition rounded-lg pl-3 pr-8 py-1.5 text-xs focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Export File buttons */}
            <button 
              onClick={() => {
                if (selectedRowIds.length === 0) {
                  setSelectedRowIds(filteredQuestions.map(m => m.id));
                }
                executeBatchAction('export');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-blue-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-3xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>错题导出</span>
            </button>

            {/* Review compilation lists button */}
            <button 
              onClick={() => {
                showToast('🚀 已根据您当期所有的未掌握难点，通过 AI 逻辑自动渲染了《高频高分周考清单》至侧栏！');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <ListCheck className="w-3.5 h-3.5" />
              <span>生成复习清单</span>
            </button>

          </div>
        </div>
      </div>

      {/* Split pane container: Left column has cards & lists; Right pane has sticky wrong details */}
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* Left main pane (Scrollable database list view) */}
        <div className="flex-1 flex flex-col gap-5">
          
          {/* 2. Visual KPI Overview summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
            
            {/* KPI 1 Total Count */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-500 font-bold text-xs tracking-wider">错题总览</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{kpiTotal}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">题</span>
                </div>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
                  <ArrowDown className="w-3 h-3" />
                  <span>较上周减少 18 题</span>
                </div>
              </div>
            </div>

            {/* KPI 2 Courses Involved */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-500 font-bold text-xs tracking-wider">涉及课程数</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{kpiCourseSet}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">门</span>
                </div>
                <div className="text-[10px] text-slate-450 font-bold mt-2">
                  较上周 <span className="text-slate-600">持平</span>
                </div>
              </div>
            </div>

            {/* KPI 3 Total Count frequency */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-500 font-bold text-xs tracking-wider">错误次数总计</span>
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <CalendarX className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{totalIncurredErrors * 10 || 263}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">次</span>
                </div>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
                  <ArrowDown className="w-3 h-3" />
                  <span>较上周减少 32 次</span>
                </div>
              </div>
            </div>

            {/* KPI 4 Unmastered counts */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-500 font-bold text-xs tracking-wider">未掌握错题</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{kpiUnmasteredCount + kpiReviewCount || 58}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">题</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                  占比 <span className="font-extrabold text-amber-600">{((kpiUnmasteredCount / kpiTotal) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* KPI 5 Mastered Counts */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-500 font-bold text-xs tracking-wider">已掌握错题</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{kpiMasteredCount || 68}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">题</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 font-medium">
                  占比 <span className="font-extrabold text-emerald-600">{((kpiMasteredCount / kpiTotal) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Deep Analytics Visual grid (Three matching mock graphics) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0 select-none">
            
            {/* Chart module 1: Distribution circle */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
              <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-blue-600 rounded-sm" />
                <span>错题分布 (按课程)</span>
              </h3>
              
              <div className="flex-1 flex items-center justify-between min-h-[145px] gap-2">
                {/* Simulated Segment Circular Donut element */}
                <div className="w-24 h-24 rounded-full border-[10px] border-blue-500 border-r-indigo-500 border-b-yellow-400 border-l-purple-500 relative flex items-center justify-center shrink-0">
                  <div className="text-center absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[-2px] shadow-inner">
                    <span className="text-xl font-black text-slate-800 leading-none">{kpiTotal}</span>
                    <span className="text-[8px] text-slate-400 font-bold mt-1 tracking-wider uppercase">总错题数</span>
                  </div>
                </div>

                {/* Legend list inside of course selection triggers */}
                <div className="flex-1 flex flex-col gap-1.5 text-[10.5px] pl-2">
                  {courseBreakdown.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedCourse(item.name);
                        showToast(`🔍 已为您迅速过滤筛选 [${item.name}] 的专属随堂错案`);
                      }}
                      className="flex items-center justify-between text-left hover:bg-slate-50 p-0.5 rounded transition w-full"
                    >
                      <div className="flex items-center gap-1.5 truncate flex-1 mr-1">
                        <span className={`w-2 h-2 rounded-full ${item.bulletColor} shrink-0`} />
                        <span className="text-slate-600 truncate font-semibold flex-1 min-w-[70px]">{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-bold shrink-0">{item.count} ({item.percentage}%)</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center mt-2.5 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setShowGlobalStatsModal(true)}
                  className="text-blue-600 text-xs font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>查看全局统计分布详情</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chart module 2: Knowledge point list bar rank */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
              <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1">
                <span className="w-1.5 h-3 bg-indigo-600 rounded-sm" />
                <span>高频错误知识点 TOP5</span>
              </h3>

              <div className="flex-1 flex flex-col justify-center gap-2.5 text-xs">
                {knowledgeTopList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedKnowledge('全部知识点');
                      setSearchQuery(item.name);
                      showToast(`🔍 已为您过滤检索包含关键词「${item.name}」的错案考题`);
                    }}
                    className="flex items-center gap-2 text-left w-full hover:opacity-85"
                  >
                    <span className="w-[110px] text-slate-500 font-bold truncate text-right text-[10px] sm:text-xs shrink-0" title={item.name}>{item.name}</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: item.pct }} />
                    </div>
                    <span className="w-8 text-slate-400 text-[10px] font-bold text-right shrink-0">{item.count} 次</span>
                  </button>
                ))}
              </div>

              <div className="text-center mt-2.5 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setShowWeakPointsModal(true)}
                  className="text-blue-600 text-xs font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>排查全科薄弱点知识拓扑</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chart module 3: Trend lines comparison */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-3 bg-emerald-600 rounded-sm" />
                  <span>错题趋势 (近7周)</span>
                </h3>
                <div className="flex gap-2 text-[8px] text-slate-400 font-bold uppercase">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 错题</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 已解决</div>
                </div>
              </div>

              {/* Dynamic SVG Sparklines Chart */}
              <div className="flex-1 min-h-[110px] relative mt-1 select-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 100">
                  {/* Grid Lines */}
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="300" y1="0" y2="0" />
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="300" y1="25" y2="25" />
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="300" y1="50" y2="50" />
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="300" y1="75" y2="75" />
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="300" y1="100" y2="100" />
                  
                  {/* Blue Data Line 1 */}
                  <polyline 
                    fill="none" 
                    points="20,70 60,50 100,65 140,40 180,55 220,20 260,60" 
                    stroke="#186bfd" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Blue Points */}
                  {[
                    {x: 20, y: 70}, {x: 60, y: 50}, {x: 100, y: 65}, {x: 140, y: 40}, {x: 180, y: 55}, {x: 220, y: 20}, {x: 260, y: 60}
                  ].map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} fill="#186bfd" r="3" stroke="#ffffff" strokeWidth="1" />
                  ))}

                  {/* Green Data Line 2 */}
                  <polyline 
                    fill="none" 
                    points="20,95 60,85 100,90 140,75 180,85 220,65 260,85" 
                    stroke="#10b981" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Green Points */}
                  {[
                    {x: 20, y: 95}, {x: 60, y: 85}, {x: 100, y: 90}, {x: 140, y: 75}, {x: 180, y: 85}, {x: 220, y: 65}, {x: 260, y: 85}
                  ].map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} fill="#10b981" r="3" stroke="#ffffff" strokeWidth="1" />
                  ))}
                </svg>

                {/* X labels */}
                <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5 px-2">
                  <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
                </div>
              </div>

              <div className="text-center mt-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setShowTrendDiagnosisModal(true)}
                  className="text-blue-600 text-xs font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>掌握度趋势诊断评估</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. Complete wrong list master table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col flex-grow">
            
            {/* Table Action Controls Panel Toolbar */}
            <div className="px-4 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none font-bold text-xs">
                  <input 
                    type="checkbox"
                    checked={filteredQuestions.length > 0 && selectedRowIds.length === filteredQuestions.length}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span>全选</span>
                </label>
                
                {/* Batch modification buttons dropdowns list */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button 
                    onClick={() => executeBatchAction('mastered')}
                    className="px-2.5 py-1.5 text-[10.5px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                  >
                    批量标记已掌握
                  </button>
                  <button 
                    onClick={() => executeBatchAction('review')}
                    className="px-2.5 py-1.5 text-[10.5px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
                  >
                    批量标记待复习
                  </button>
                  <button 
                    onClick={() => executeBatchAction('delete')}
                    className="px-2.5 py-1.5 text-[10.5px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                  >
                    批量删除
                  </button>
                  <button 
                    onClick={() => executeBatchAction('export')}
                    className="px-2.5 py-1.5 text-[10.5px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
                  >
                    批量导出
                  </button>
                  <button 
                    onClick={() => executeBatchAction('addReview')}
                    className="px-2.5 py-1.5 text-[10.5px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all"
                  >
                    加入复习清单
                  </button>
                </div>
              </div>

              {/* Table pagination stats inside */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold">共 {filteredQuestions.length} 题</span>
                <div className="flex items-center gap-0.5">
                  <button className="w-5.5 h-5.5 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5 rotate-90" /></button>
                  <button className="w-5.5 h-5.5 rounded bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-[11px]">1</button>
                  <button className="w-5.5 h-5.5 rounded hover:bg-slate-100 flex items-center justify-center text-[11px]">2</button>
                  <button className="w-5.5 h-5.5 rounded hover:bg-slate-100 flex items-center justify-center text-[11px]">3</button>
                  <span className="px-1 text-slate-300">...</span>
                  <button className="w-5.5 h-5.5 rounded hover:bg-slate-100 flex items-center justify-center text-[11px]">7</button>
                  <button className="w-5.5 h-5.5 rounded hover:bg-slate-100 flex items-center justify-center"><ChevronDown className="w-3.5 h-3.5 -rotate-90" /></button>
                </div>
              </div>
            </div>

            {/* Custom Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b border-slate-200 bg-slate-100/55 text-[11px] font-extrabold text-slate-500 shrink-0 select-none uppercase tracking-wider">
              <div className="col-span-5 flex items-center gap-2">
                <span>题目</span>
              </div>
              <div className="col-span-2">所属课程</div>
              <div className="col-span-2">知识点</div>
              <div className="col-span-1 text-center">错误次数</div>
              <div className="col-span-1 text-center">状态</div>
              <div className="col-span-1 text-right">时间</div>
            </div>

            {/* Table Rows Grid list rendered cleanly in full */}
            <div>
              {filteredQuestions.map((item) => {
                const isSelected = selectedRowIds.includes(item.id);
                const isActive = activeQuestionId === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveQuestionId(item.id);
                      setIsDetailOpen(true);
                    }}
                    className={`grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-slate-100 items-center justify-between transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50/70 border-b-blue-200/50 hover:bg-blue-50/90' 
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    
                    {/* Checkbox and Question summary */}
                    <div className="col-span-12 md:col-span-5 flex items-start gap-2.5 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelectRow(item.id, e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5 mt-1 cursor-pointer"
                      />
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-semibold border ${
                            item.type === '单选题' 
                              ? 'bg-blue-50 text-blue-600 border-blue-200' 
                              : item.type === '多选题'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : 'bg-green-50 text-green-600 border-green-200'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                            item.difficulty === '难'
                              ? 'bg-red-50 text-red-500 border border-red-200'
                              : item.difficulty === '中'
                              ? 'bg-yellow-50 text-yellow-600 border border-yellow-250'
                              : 'bg-green-50 text-green-600 border border-green-200'
                          }`}>
                            {item.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">ID: {item.id}</span>
                        </div>
                        <p className={`text-xs text-slate-800 font-semibold line-clamp-1 truncate pr-3 ${isActive ? 'text-blue-900 font-bold' : ''}`}>
                          {item.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Course */}
                    <div className="col-span-4 md:col-span-2 text-xs text-slate-600 truncate font-semibold">
                      {item.course}
                    </div>

                    {/* Knowledge base */}
                    <div className="col-span-4 md:col-span-2 text-xs text-slate-500 truncate font-medium">
                      {item.knowledgePoint}
                    </div>

                    {/* Frequency info */}
                    <div className="col-span-2 md:col-span-1 text-center text-xs font-bold text-slate-700">
                      {item.errorCount} 次
                    </div>

                    {/* Completion Status Tag */}
                    <div className="col-span-3 md:col-span-1 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMarkAsMastered(item.id);
                        }}
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold border cursor-pointer transition ${
                          item.status === '已掌握'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50'
                            : item.status === '待复习'
                            ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100/50'
                            : 'bg-red-50 text-red-500 border-red-150 hover:bg-red-100/50'
                        }`}
                      >
                        {item.status}
                      </button>
                    </div>

                    {/* Timestamp */}
                    <div className="col-span-3 md:col-span-1 text-right text-[10.5px] text-slate-400 font-semibold font-mono">
                      {item.timestamp}
                    </div>

                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-semibold">没有找到符合特定筛选条件的随堂错题</p>
                  <p className="text-xs text-slate-400 mt-1">您可以试着变换头部条件筛选，或撤销搜索筛选过滤器。</p>
                </div>
              )}
            </div>

            {/* Bottom aggregate indicator information */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 shrink-0 text-right mt-auto">
              <p className="text-[10px] text-slate-400 font-bold">已启用「智能遗忘复习曲线」2.0 模型 | 当前知识图谱漏洞扫描范围已覆盖完毕</p>
            </div>

          </div>

        </div>

        {/* Right drawer detail panel (错题详情 - Closable sticky panel converted to a floating modal) */}
        <AnimatePresence>
          {isDetailOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDetailOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Container */}
              <motion.aside 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.35 }}
                className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col relative max-h-[90vh] z-10 overflow-hidden"
              >
                {/* Header drawer controls */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2 shrink-0 relative">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 justify-start">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                      <span>错题详情排查</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mr-1">ID: {currentQuestion.id}</span>
                      <button 
                        onClick={() => setIsDetailOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        title="关闭详情"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges metadata bar */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-600 border border-blue-200 shadow-3xs">
                        {currentQuestion.type}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-600 border border-yellow-200">
                        难度: {currentQuestion.difficulty}
                      </span>
                      <span className="text-[10.5px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100/50 animate-pulse">
                        错误 {currentQuestion.errorCount || 3} 次
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Status Toggle label check buttons */}
                      <span className={`text-[10.5px] px-2 py-0.5 rounded-sm font-semibold border ${
                        currentQuestion.status === '已掌握'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {currentQuestion.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scrollable details panel body */}
                <div className="p-4 flex flex-col gap-5 select-none overflow-y-auto flex-grow min-h-0">
                  
                  {/* Question Text & Options lists */}
                  <div className="bg-slate-50/35 p-3.5 rounded-lg border border-slate-100">
                    <h3 className="font-extrabold text-xs text-slate-500 mb-2 uppercase tracking-wide">
                      错题题干：
                    </h3>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed mb-3.5 whitespace-pre-line">
                      {currentQuestion.questionText}
                    </p>

                    {/* Simulated Clickable interactive Option Arena */}
                    <div className="flex flex-col gap-2">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = userRedoSelectedKey === opt.key;
                        // Check standard answer and original user wrong answer positions
                        const isCorrect = opt.key === currentQuestion.correctAnswer;
                        const isOriginalWrong = opt.key === currentQuestion.userAnswer;

                        // Option color scheme
                        let itemColorClass = 'border-slate-200 transition-all bg-white hover:bg-slate-50/80';
                        let keyBadgeColor = 'bg-slate-100 text-slate-600';
                        let checkMark = null;

                        if (isSelected) {
                          itemColorClass = 'border-blue-500 bg-blue-50/30 text-blue-900';
                          keyBadgeColor = 'bg-blue-600 text-white';
                        } else if (isOriginalWrong && !userRedoSelectedKey) {
                          // Highlight original wrong path in warning state
                          itemColorClass = 'border-red-200 bg-red-50/40 text-red-700';
                          keyBadgeColor = 'bg-red-100 text-red-600';
                          checkMark = <X className="w-3.5 h-3.5 text-red-500 shrink-0 ml-auto" />;
                        }

                        return (
                          <label 
                            key={opt.key}
                            onClick={() => {
                              setUserRedoSelectedKey(opt.key);
                              setRedoResult(null);
                            }}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${itemColorClass}`}
                          >
                            <input 
                              type="radio" 
                              name="interactive-redo-opt" 
                              checked={isSelected}
                              onChange={() => {}}
                              className="hidden"
                            />
                            <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${keyBadgeColor}`}>
                              {opt.key}
                            </span>
                            <span className="text-xs leading-normal font-semibold">{opt.text}</span>
                            {checkMark}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Answer comparison toolbar state */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs border border-slate-100 font-medium font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold uppercase">考试作作：</span>
                      <span className="text-red-500 font-bold ml-1 px-1.5 py-0.5 bg-red-50 border border-red-100 rounded">C</span>
                    </div>
                    
                    <div className="h-4 w-[1px] bg-slate-200" />

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold uppercase">标准答案：</span>
                      <span className="text-emerald-500 font-bold ml-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded">A</span>
                    </div>
                  </div>

                  {/* Standard text Explanation details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 border-l-2.5 border-blue-600 pl-2 mb-2">解析说明</h4>
                      <p className="text-xs text-slate-500 leading-relaxed block font-medium">
                        {currentQuestion.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 border-l-2.5 border-amber-500 pl-2 mb-2">易错点提示</h4>
                      <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1 font-medium">
                        <li>{currentQuestion.commonMistake}</li>
                        <li>在完全二叉树结构或TCP拥塞分包判定时，要仔细区分边界变量公式的算术天花板极限取向。</li>
                      </ul>
                    </div>
                  </div>

                  {/* Dynamic Interactive AI Explaining (Audio wave & Custom prompt chatting) */}
                  <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-xl p-4 border border-blue-100/70 mb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <h4 className="text-xs font-extrabold text-blue-900">AI 语音与微课诊断讲解</h4>
                      </div>
                      <span className="text-[8.5px] bg-blue-100 text-blue-700 font-bold px-1.5 rounded-sm">智能声波</span>
                    </div>

                    {/* Simulated Audio wave controller interface */}
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-blue-100/80 shadow-3xs mb-3 select-none">
                      <button 
                        onClick={handleToggleAudio}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition cursor-pointer active:scale-95 shadow-sm"
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-white text-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                        )}
                      </button>

                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-[10px] text-slate-400 font-extrabold tracking-tight font-mono">{audioTimer}</span>
                        
                        {/* Pulsing Visual Audio Waveform bar mockup */}
                        <div className="flex items-center gap-0.5 h-4 mt-0.5">
                          {[1, 2, 3, 4, 3, 5, 2, 6, 2, 4, 1, 5, 3, 2, 4, 1].map((val, idx) => {
                            const styleHeight = isAudioPlaying 
                              ? `${Math.max(20, Math.random() * 100)}%` 
                              : `${val * 16}%`;

                            return (
                              <div 
                                key={idx}
                                className={`w-[2.5px] rounded-full transition-all duration-300 ${
                                  idx < (audioProgress / 6) ? 'bg-blue-600' : 'bg-slate-205'
                                }`}
                                style={{ height: styleHeight }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[10px] bg-slate-50 font-bold border rounded px-1.5 py-0.5 shrink-0 text-slate-400">
                        AI声导学
                      </div>
                    </div>

                    {/* Simulated AI greeting paragraph */}
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {currentQuestion.aiGreeting}
                    </p>

                    {/* Mini chatbot panel specifically regarding this course node */}
                    <div className="mt-4 border-t border-blue-100/50 pt-3">
                      <span className="text-[10px] text-blue-700 font-extrabold block mb-2">✦ 随时向 AI 追问该题疑难：</span>
                      
                      {/* Message stack logs */}
                      <div className="max-h-[160px] overflow-y-auto space-y-2.5 mb-2.5 pr-0.5">
                        {aiResponseList.map((chat, idx) => (
                          <div 
                            key={idx}
                            className={`flex flex-col text-xs max-w-[90%] rounded-lg p-2 ${
                              chat.sender === 'user'
                                ? 'bg-blue-600 text-white ml-auto rounded-tr-none'
                                : 'bg-white text-slate-700 border border-blue-100 mr-auto rounded-tl-none font-medium leading-relaxed'
                            }`}
                          >
                            <span className="text-[8px] font-bold opacity-60 mb-0.5">
                              {chat.sender === 'user' ? '我' : 'AI 助学助手'}
                            </span>
                            <p>{chat.text}</p>
                          </div>
                        ))}

                        {aiIsAnswering && (
                          <div className="bg-white/80 rounded-lg p-2 mr-auto border border-blue-100 flex items-center gap-2 max-w-[80%] animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                            <span className="text-[11px] text-slate-500 font-medium">AI 语音助学思维编译中...</span>
                          </div>
                        )}
                      </div>

                      {/* Submission search form */}
                      <form onSubmit={handleSendAIPrompt} className="flex gap-1.5">
                        <input 
                          type="text"
                          value={aiChatQuery}
                          onChange={(e) => setAiChatQuery(e.target.value)}
                          placeholder='输入追问 (如: "为什么尾部插入是 O(n)？")'
                          className="flex-1 bg-white text-xs text-slate-800 border border-blue-200 hover:border-blue-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                        <button 
                          type="submit"
                          disabled={aiIsAnswering}
                          className="px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center justify-center shrink-0 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>

                </div>

                {/* Redo feedback error alerts */}
                {redoResult && (
                  <div className={`mx-4 mb-2 p-3 rounded-lg text-xs font-bold leading-relaxed border ${
                    redoResult.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {redoResult.text}
                  </div>
                )}

                {/* Static Action footer panel matching mockup footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-2.5">
                  
                  {/* Submit verification redo */}
                  <button 
                    onClick={handleRedoVerification}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition duration-150 active:scale-95 shadow-sm cursor-pointer text-center"
                  >
                    重做此题
                  </button>

                  {/* Review list merges */}
                  <button 
                    onClick={() => {
                      showToast(`📝 「ID: ${currentQuestion.id}」已顺利归并录入每周冲刺考试教案库`);
                    }}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-lg text-xs transition duration-150 active:scale-95 shadow-2xs cursor-pointer text-center"
                  >
                    加入复习清单
                  </button>

                  {/* Master toggle */}
                  <button 
                    onClick={() => {
                      toggleMarkAsMastered(currentQuestion.id, '已掌握');
                    }}
                    className="flex-1 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold py-2 rounded-lg text-xs transition duration-150 active:scale-95 shadow-2xs cursor-pointer text-center"
                  >
                    标记为已掌握
                  </button>

                </div>

              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 1: Global Statistical Analysis Details Modal */}
        {showGlobalStatsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalStatsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col relative max-h-[90vh] z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    查看全局统计分布详情 (考纲全域复盘)
                  </h2>
                </div>
                <button 
                  onClick={() => setShowGlobalStatsModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Overall KPIs Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">错题总量</span>
                    <span className="text-2xl font-black text-slate-800 tracking-tight mt-0.5 block">{kpiTotal} 题</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl text-center">
                     <span className="text-[10px] text-emerald-600 font-extrabold uppercase block tracking-wider">已突破掌握</span>
                    <span className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5 block">{kpiMasteredCount} 题</span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-2xl text-center">
                    <span className="text-[10px] text-indigo-5050 font-extrabold uppercase block tracking-wider text-indigo-500">待巩固复习</span>
                    <span className="text-2xl font-black text-indigo-700 tracking-tight mt-0.5 block">{kpiReviewCount + kpiUnmasteredCount} 题</span>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl text-center">
                    <span className="text-[10px] text-blue-500 font-extrabold uppercase block tracking-wider">错题消灭率</span>
                    <span className="text-2xl font-black text-blue-700 tracking-tight mt-0.5 block">
                      {((kpiMasteredCount / kpiTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Course bar analytics */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>全科课程错题占比与下钻检索</span>
                  </h3>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {courseBreakdown.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className={`w-3 h-3 rounded-full ${item.bulletColor} shrink-0`} />
                          <span className="text-xs font-bold text-slate-700 truncate min-w-[120px]">{item.name}</span>
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px] hidden sm:block">
                            <div className={`h-full rounded-full ${item.bulletColor}`} style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className="text-[10.5px] text-slate-400 font-semibold shrink-0">{item.percentage}% 占比</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0 pl-4">
                          <span className="text-xs font-black text-slate-800">{item.count} 道错题</span>
                          <button
                            onClick={() => {
                              setSelectedCourse(item.name);
                              setSelectedKnowledge('全部知识点');
                              setShowGlobalStatsModal(false);
                              showToast(`🔍 已为您成功过滤筛选 [${item.name}] 的专属随堂错案`);
                            }}
                            className="text-[10px] bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition font-bold px-2 py-1 rounded-md cursor-pointer"
                          >
                            筛选此科
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scientific Guidance Recommendation */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                  <div className="p-2 bg-blue-100/70 text-blue-600 rounded-xl shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="text-left w-full">
                    <h4 className="text-xs font-extrabold text-slate-800">智学金牌辅导教练全局总结</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      从当前全域数据来看，您的知识盲区高度集聚在<strong className="text-slate-800 font-bold">【数据结构与算法】</strong>以及<strong className="text-slate-800 font-bold">【计算机网络】</strong>。
                      链表插入时的指针操作边界，以及传输层协议的滑动窗口与拥塞控制细节，是近2期扣分偏高的区域。
                      建议配合右下角“AI 提分策略”获取专属微课程辅导。
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer and dynamic aggregation reset controls */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0 justify-between items-center">
                <span className="text-[10.5px] text-slate-400 font-semibold italic">💡 提示：点击上方的 “筛选此科” 可立刻同步底层主表格</span>
                <button 
                  onClick={() => {
                    setSelectedCourse('全部课程');
                    setSelectedKnowledge('全部知识点');
                    setShowGlobalStatsModal(false);
                    showToast('🔄 已为您完全拉回重置，归拢全部考纲！');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition duration-150 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置主控考纲 (回到全部)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 2: Multi-subject Weak Points & Knowledge Topology Modal */}
        {(() => {
          const [selectedTopologyCourse, setSelectedTopologyCourse] = useState<string>('数据结构与算法');
          const [localLoading, setLocalLoading] = useState<boolean>(false);
          const [expandedNodeIndex, setExpandedNodeIndex] = useState<number | null>(0);

          const topologyData = [
            {
              course: '数据结构与算法',
              color: 'from-blue-500 to-indigo-600',
              border: 'border-blue-200',
              text: 'text-blue-600',
              bg: 'bg-blue-55/50',
              nodes: [
                { name: '链表的基本操作', count: 4, mastery: 24, difficulty: '中', solution: '重新阅读《数据结构》第2.3节，亲手编写带头结点的单链表逆置算法。', pitfall: '删除或插入节点时未正确留存其前驱结点指针，造成断链空引用闪退。' },
                { name: '二叉树遍历以递归构造', count: 3, mastery: 48, difficulty: '难', solution: '掌握前序与中序确定唯一二叉树的画法，熟练背诵非递归遍历核心骨架。', pitfall: '对叶子节点的空递归基(Base Case)边界判定不清，遇到死循环堆栈溢出。' }
              ]
            },
            {
              course: '操作系统原理',
              color: 'from-purple-500 to-pink-600',
              border: 'border-purple-200',
              text: 'text-purple-600',
              bg: 'bg-purple-55/50',
              nodes: [
                { name: '进程状态与转换', count: 3, mastery: 52, difficulty: '中', solution: '梳理就绪->运行以及运行->阻塞的单向性切换，理清内核调度中断。', pitfall: '混淆了“进程就绪”与“进程阻塞”的外部触发动作，错判了挂起就绪条件。' },
                { name: '虚拟内存页面置换LRU算法', count: 2, mastery: 42, difficulty: '难', solution: '通过画物理页帧方格图，推导LRU和FIFO的缺页率并对比Belady异常。', pitfall: '忽视了时间戳更新在并发访问下的物理开销锁冲突。' }
              ]
            },
            {
              course: '计算机网络',
              color: 'from-emerald-500 to-teal-600',
              border: 'border-emerald-200',
              text: 'text-emerald-600',
              bg: 'bg-emerald-55/50',
              nodes: [
                { name: '传输层协议', count: 5, mastery: 35, difficulty: '难', solution: '掌握 SYN_RCVD / ESTABLISHED / FIN_WAIT_1 核心状态切换，练习TCP握手抓包。', pitfall: '容易混淆滑动窗口控制机制中发送窗与拥塞窗口的动态取极小值上限关系。' },
                { name: 'IP 协议与子网划分', count: 4, mastery: 65, difficulty: '易', solution: '记住ARP请求是广播，ARP合回应答是单播，不要和IP网关冲突。', pitfall: '混淆了物理子网掩码合并时由于特殊主机保留位未加扣减而致使广播地址溢出。' }
              ]
            },
            {
              course: '数据库系统',
              color: 'from-amber-500 to-amber-600',
              border: 'border-amber-200',
              text: 'text-amber-600',
              bg: 'bg-amber-55/50',
              nodes: [
                { name: 'SQL 查询语句', count: 2, mastery: 50, difficulty: '易', solution: '在关系代数上，等值操作符对NULL总是返回unknown值，需写 IS NULL 条件。', pitfall: '用常规程序语言的 NULL 变量行为逻辑代入 SQL 中使用 = NULL 等值过滤判定。' }
              ]
            }
          ];

          const currentCourseData = topologyData.find(t => t.course === selectedTopologyCourse) || topologyData[0];

          const handleSimulateQuiz = (nodeName: string) => {
            setLocalLoading(true);
            setTimeout(() => {
              setLocalLoading(false);
              showToast(`⚡ 已成功为您多端深度合成 3 道关于【${nodeName}】的仿真演练重测试卷，请到模拟测验板块查看！`);
            }, 1200);
          };

          return (
            <AnimatePresence>
              {showWeakPointsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setShowWeakPointsModal(false); setExpandedNodeIndex(0); }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
                  />

                  {/* Modal Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', duration: 0.35 }}
                    className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col relative max-h-[90vh] z-10 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white block animate-pulse" />
                        </span>
                        <h2 className="text-base font-extrabold text-slate-900">
                          排查全科薄弱点知识拓扑与概念关系网
                        </h2>
                      </div>
                      <button 
                        onClick={() => { setShowWeakPointsModal(false); setExpandedNodeIndex(0); }}
                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 flex flex-col md:flex-row gap-5">
                      
                      {/* Left Side: Course Root Nodes selector list */}
                      <div className="md:w-1/3 flex flex-col gap-3 pr-2 md:border-r border-slate-100 shrink-0 text-left">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1 block">
                          第一步：展开全科核心根节点
                        </span>
                        {topologyData.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTopologyCourse(t.course);
                              setExpandedNodeIndex(0);
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition duration-150 flex flex-col gap-1 relative overflow-hidden group w-full cursor-pointer ${
                              selectedTopologyCourse === t.course 
                                ? `bg-gradient-to-r ${t.color} text-white border-transparent shadow-md scale-[1.02]` 
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full z-10">
                              <span className="text-xs font-black">{t.course}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                                selectedTopologyCourse === t.course ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {t.nodes.length} 弱点
                              </span>
                            </div>
                            <span className={`text-[10px] font-medium z-10 ${
                              selectedTopologyCourse === t.course ? 'text-white/80' : 'text-slate-400'
                            }`}>
                              主考知识树分支覆盖中
                            </span>

                            {/* Decorative node connector line representation */}
                            {selectedTopologyCourse === t.course && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Right Side: Expanded sub-nodes with interactive paths */}
                      <div className="flex-1 flex flex-col min-h-[300px] gap-4">
                        
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2 text-left">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                            第二步：下钻薄弱叶子概念并排查成因
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            正在扫描考点
                          </span>
                        </div>

                        {/* Topology Graph simulation drawing SVG curves dynamically */}
                        <div className="relative bg-slate-50/70 border border-slate-100 p-4 rounded-3xl shrink-0 h-28 flex items-center justify-around overflow-hidden select-none">
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" preserveAspectRatio="none">
                            {currentCourseData.nodes.map((n, index) => {
                              const step = 100 / (currentCourseData.nodes.length + 1);
                              return (
                                <path 
                                  key={index}
                                  d={`M 15 50 C 40 50, 45 ${expandedNodeIndex === index ? 30 : 70}, 80 ${expandedNodeIndex === index ? 30 : 70}`} 
                                  fill="none" 
                                  stroke={selectedTopologyCourse === '数据结构与算法' ? '#4f46e5' : selectedTopologyCourse === '操作系统原理' ? '#c026d3' : selectedTopologyCourse === '计算机网络' ? '#059669' : '#d97706'} 
                                  strokeWidth={expandedNodeIndex === index ? "2.2" : "1.2"}
                                  strokeDasharray={expandedNodeIndex === index ? "none" : "3,3"}
                                  className="transition-all duration-300"
                                />
                              );
                            })}
                          </svg>

                          {/* Center Subject Circle */}
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${currentCourseData.color} text-white flex items-center justify-center font-black text-[10px] shadow-md relative z-10`}>
                            {selectedTopologyCourse.substring(0, 4)}
                          </div>

                          {/* Surrounding Expanded Leaf Nodes */}
                          <div className="flex gap-4 relative z-10">
                            {currentCourseData.nodes.map((n, idx) => (
                              <button
                                key={idx}
                                onClick={() => setExpandedNodeIndex(idx)}
                                className={`px-3.5 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                  expandedNodeIndex === idx 
                                    ? 'bg-white text-slate-800 border-indigo-500 shadow-md scale-102 font-bold ring-2 ring-indigo-500/10' 
                                    : 'bg-white/80 text-slate-500 border-slate-100 hover:bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    n.mastery < 35 ? 'bg-red-500 animate-pulse' : n.mastery < 50 ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`} />
                                  <span className="text-[10.5px] font-sans truncate max-w-[100px] block" title={n.name}>{n.name}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-mono">
                                  <span>掌握 {n.mastery}%</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive details for the selected sub-node */}
                        {expandedNodeIndex !== null && currentCourseData.nodes[expandedNodeIndex] && (() => {
                          const node = currentCourseData.nodes[expandedNodeIndex];
                          return (
                            <div className="border border-slate-100 p-4.5 rounded-3xl bg-white shadow-3xs text-left text-xs space-y-3 animate-fadeIn flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-800">{node.name}</span>
                                  <span className="text-[9px] bg-red-50 text-red-500 font-black px-1.5 py-0.2 rounded border border-red-100 uppercase">
                                    掌握率 {node.mastery}% · 极危
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">考频度：{node.difficulty === '难' ? '高频常考' : '普通考核'}</span>
                              </div>

                              <div className="p-3 bg-red-50/30 rounded-2xl border border-red-100/50 text-[11px] leading-relaxed text-slate-600">
                                <span className="font-extrabold text-red-600 block mb-0.5">⚠️ 错因痛点回溯：</span>
                                {node.pitfall}
                              </div>

                              <div className="text-[11px] leading-relaxed text-slate-500">
                                <span className="font-extrabold text-slate-700 block mb-0.5">🧠 提分突破策略：</span>
                                {node.solution}
                              </div>

                              <div className="pt-3.5 border-t border-slate-50 flex flex-wrap gap-2 justify-end">
                                <button
                                  disabled={localLoading}
                                  onClick={() => handleSimulateQuiz(node.name)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl text-[10px] transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  <Award className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
                                  <span>{localLoading ? 'AI测卷合成中...' : 'AI 仿真模拟 3 道强化题'}</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSelectedKnowledge('全部知识点');
                                    setSearchQuery(node.name);
                                    setShowWeakPointsModal(false);
                                    showToast(`🔍 已为您迅速过滤错题本，当前重点聚焦显示：【${node.name}】相关考题！`);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-[10px] transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                  <Search className="w-3.5 h-3.5" />
                                  <span>深度筛解此概念错题</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                      </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4.5 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0 justify-end">
                      <button 
                        onClick={() => { setShowWeakPointsModal(false); setExpandedNodeIndex(0); }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-5 rounded-xl text-xs transition duration-150 active:scale-95 shadow-sm shrink-0 cursor-pointer text-center"
                      >
                        关闭排查窗
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          );
        })()}

        {/* Modal 3: Mastery Level Trend Diagnosis & Evaluation Modal */}
        {(() => {
          const [selectedTargetIntensity, setSelectedTargetIntensity] = useState<number>(1); // [0: mild, 1: standard, 2: peak]
          
          // Historical week resolved counts
          const weekStats = [
            { week: 'W1', resolved: 4, added: 9, accuracy: 55 },
            { week: 'W2', resolved: 5, added: 7, accuracy: 58 },
            { week: 'W3', resolved: 6, added: 8, accuracy: 62 },
            { week: 'W4', resolved: 8, added: 6, accuracy: 66 },
            { week: 'W5', resolved: 9, added: 5, accuracy: 70 },
            { week: 'W6', resolved: 11, added: 4, accuracy: 75 },
            { week: 'W7', resolved: 12, added: 3, accuracy: 82 }
          ];

          // Future projections computed dynamically based on selected review intensity
          const intensityProjections = [
            {
              label: '温和巩固 (平均每日打卡 20分钟)',
              path: '200,60 230,55 260,52 290,48', // continues trend mildly (SVG layout)
              weeks: [
                { name: 'W8 (下周预测)', resolved: 13, accuracy: 84 },
                { name: 'W9 (预测第2周)', resolved: 14, accuracy: 85 },
                { name: 'W10 (考前终测预测)', resolved: 15, accuracy: 87 }
              ],
              predictedScore: '86 分 (Grade B+)',
              speedText: '慢速修复周期，预计15周可完全清空由于粗心或计算不熟造成的低级死胡同错题。'
            },
            {
              label: '黄金标准 (平均每日打卡 50分钟)',
              path: '200,60 230,45 260,30 290,15', // rapid upward
              weeks: [
                { name: 'W8 (下周预测)', resolved: 15, accuracy: 89 },
                { name: 'W9 (预测第2周)', resolved: 18, accuracy: 92 },
                { name: 'W10 (考前终测预测)', resolved: 21, accuracy: 94 }
              ],
              predictedScore: '93 分 (Grade A)',
              speedText: '最优修复步伐！到考前第10周，您的主要多科高频难点能收敛到极小值范围，综合学考拿 A 概率提升至 88%！'
            },
            {
              label: '魔鬼特训 (平均每日打卡 100分钟)',
              path: '200,60 230,30 260,15 290,5', // ultra rapid
              weeks: [
                { name: 'W8 (下周预测)', resolved: 18, accuracy: 93 },
                { name: 'W9 (预测第2周)', resolved: 22, accuracy: 96 },
                { name: 'W10 (考前终测预测)', resolved: 25, accuracy: 98 }
              ],
              predictedScore: '98 分 (Grade A+)',
              speedText: '冲刺模式！短焦压榨，高度浓缩所有考前卷包训练。复盘效率拉满，适合赛前2周突击洗尽一切薄弱疑漏。'
            }
          ];

          const currentProj = intensityProjections[selectedTargetIntensity];

          return (
            <AnimatePresence>
              {showTrendDiagnosisModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowTrendDiagnosisModal(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
                  />

                  {/* Modal Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', duration: 0.35 }}
                    className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col relative max-h-[90vh] z-10 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />
                        </span>
                        <h2 className="text-base font-extrabold text-slate-900">
                          知识掌握度趋势多期诊断与期末成绩估分预测
                        </h2>
                      </div>
                      <button 
                        onClick={() => setShowTrendDiagnosisModal(false)}
                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto space-y-6">
                      
                      {/* Interactive Intensity Selector Slider Card */}
                      <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-left">
                          <h3 className="text-xs font-extrabold text-slate-800">
                            选择您的每日计划复习训练频度
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            调整练习频度，利用自适应学习贝叶斯算法，为您重演预测掌握度趋势线
                          </p>
                        </div>
                        <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto shadow-2xs">
                          {['温和 20m', '标准 50m', '突击 100m'].map((label, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTargetIntensity(idx)}
                              className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                                selectedTargetIntensity === idx 
                                  ? 'bg-blue-600 text-white shadow-xs' 
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comparative Trends Simulation Line Chart SVG */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span>历史 7周 记录和后 3周 后验评估走势曲线</span>
                          </h4>
                          <div className="flex gap-2.5 text-[8.5px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-blue-500 block" /> 历史正确率 (%)</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-orange-400 block" /> 预测走势曲线</span>
                          </div>
                        </div>

                        <div className="relative bg-white border border-slate-100 rounded-3xl p-5 h-44 flex flex-col justify-between overflow-visible">
                          {/* Grid Backdrop Lines */}
                          <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none opacity-20">
                            <div className="border-t border-slate-300 w-full" />
                            <div className="border-t border-slate-300 w-full" />
                            <div className="border-t border-slate-300 w-full" />
                            <div className="border-t border-slate-300 w-full" />
                          </div>

                          {/* SVG Chart content containing historic polyline + virtual prediction segment */}
                          <svg className="absolute inset-0 w-full h-full pb-8 pt-4 px-8 z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                            <defs>
                              <linearGradient id="glowAcc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                              </linearGradient>
                              <linearGradient id="glowPred" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                              </linearGradient>
                            </defs>

                            {/* Blue Historic accuracy line */}
                            <path 
                              d="M 10 75 L 40 70 L 70 65 L 100 60 L 130 55 L 160 48 L 190 38" 
                              fill="none" 
                              stroke="#186bfd" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                            />

                            {/* Dashed Predictive Orange accuracy line based on state selection */}
                            <path 
                              d={`M 190 38 L ${selectedTargetIntensity === 0 ? '220,35 L 250,33 L 280,30' : selectedTargetIntensity === 1 ? '220,28 L 250,18 L 280,10' : '220,20 L 250,8 L 280,2'}`} 
                              fill="none" 
                              stroke="#f97316" 
                              strokeWidth="2.5" 
                              strokeDasharray="3,3"
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                            />

                            {/* Highlight dots on prediction point W10 */}
                            <circle 
                              cx="280" 
                              cy={selectedTargetIntensity === 0 ? 30 : selectedTargetIntensity === 1 ? 10 : 2} 
                              r="4" 
                              fill="#f97316" 
                              className="animate-ping" 
                            />
                          </svg>

                          {/* X Axis labels with columns mapping hist vs pred */}
                          <div className="flex justify-between items-end text-[9px] text-slate-400 font-bold px-2 z-20 mt-auto pt-4 select-none">
                            <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span>
                            <span className="text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-md">W7(今)</span>
                            <span className="text-orange-500 font-extrabold bg-orange-50 px-1.5 py-0.5 rounded-md">W8预测</span>
                            <span className="text-orange-500 font-extrabold bg-orange-50 px-1.5 py-0.5 rounded-md">W9预测</span>
                            <span className="text-orange-500 font-extrabold bg-orange-50 px-1.5 py-0.5 rounded-md font-mono">W10(预测考分)</span>
                          </div>
                        </div>
                      </div>

                      {/* Projection score cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Score widget */}
                        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-3xl text-left">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">
                            估分模型：Week 10 终考绩点预测
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-3xl font-black text-slate-800 leading-none">
                              {currentProj.predictedScore.split(' ')[0]}
                            </span>
                            <span className="text-sm font-bold text-orange-500">
                              {currentProj.predictedScore.split(' ')[1]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                            系统检测出您的消错反馈（Retrospective Feedback）正在以指数形式改善。
                          </p>
                        </div>

                        {/* Prediction breakdown text */}
                        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-3xl text-left">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">
                            学习路径改进速度与收敛展望
                          </span>
                          <h5 className="text-[11px] font-black text-slate-700 mt-2 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span>{currentProj.label.split(' ')[0]}策略反馈分析：</span>
                          </h5>
                          <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1.5">
                            {currentProj.speedText}
                          </p>
                        </div>

                      </div>

                      {/* Week by week historical breakdown check list */}
                      <div className="border border-slate-100 rounded-3xl overflow-hidden text-left bg-white text-xs">
                        <div className="bg-slate-50 p-3 flex justify-between font-extrabold text-slate-500 text-[10px] border-b border-slate-100 uppercase tracking-wider">
                          <span>评估周期</span>
                          <span>平均正确率/分值趋势</span>
                          <span>新增错误题数</span>
                          <span>复温解扣题数</span>
                        </div>
                        
                        <div className="divide-y divide-slate-50">
                          {weekStats.map((item, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center text-slate-600">
                              <span className="font-bold">{item.week} (第 {idx + 1} 周)</span>
                              <span className="font-mono text-emerald-600 font-bold">{item.accuracy}%</span>
                              <span className="font-mono text-red-500 font-bold">+{item.added} 题</span>
                              <span className="font-mono text-blue-600 font-bold">已解 {item.resolved} 题</span>
                            </div>
                          ))}

                          {/* Projections item */}
                          {currentProj.weeks.map((item, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center text-slate-500 bg-orange-50/20 italic">
                              <span className="font-extrabold text-orange-500">{item.name}</span>
                              <span className="font-mono text-orange-600 font-extrabold">{item.accuracy}%</span>
                              <span className="font-mono text-slate-300">-</span>
                              <span className="font-mono text-orange-500 font-extrabold">预计克服 {item.resolved} 题</span>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>

                    {/* Footer */}
                    <div className="p-4.5 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0 justify-end">
                      <button 
                        onClick={() => setShowTrendDiagnosisModal(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition duration-150 active:scale-95 shadow-md shrink-0 cursor-pointer text-center"
                      >
                        收纳并关闭诊断
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          );
        })()}

      </div>

    </div>
  );
}
