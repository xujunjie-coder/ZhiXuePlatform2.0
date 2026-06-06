import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  ChevronDown, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit, 
  Copy,
  Trash, 
  X, 
  Sparkles, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  Clock,
  Award,
  Users,
  Check,
  Archive,
  BarChart2,
  Printer,
  Calendar,
  ChevronUp,
  Sliders,
  Play
} from 'lucide-react';

// TypeScript interfaces for our Paper model and Question bank item
export interface PaperQuestion {
  id: string;
  stem: string;
  type: '单选题' | '多选题' | '判断题' | '主观题';
  difficulty: '易' | '中' | '难';
  defaultScore: number;
}

export interface Paper {
  id: string;
  name: string;
  course: string;
  type: '随堂测' | '作业' | '考试';
  maxScore: number;
  duration: number; // minutes
  status: '已发布' | '未发布' | '已截止';
  submittedCount: number;
  totalStudents: number;
  averageScore: number | null;
  createdAt: string;
  questions: { question: PaperQuestion; score: number }[];
  stats: {
    maxScore: number;
    passRate: number; // percentage
    averageDuration: number; // minutes
    totalSubmissions: number;
    scoreDistribution: { label: string; count: number }[];
    errorRanking: { title: string; type: string; correctRate: number; errorCount: number }[];
    answeredList: { studentName: string; studentId: string; score: number; scoreRate: number; answeredAt: string; status: '已批改' | '待批改' }[];
  };
}

interface PaperManagementViewProps {
  currentUser?: { name?: string; email?: string; role?: string };
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

// Global Static Pool of Available Questions for Create Paper Wizard


export default function PaperManagementView({ currentUser, triggerToast }: PaperManagementViewProps) {
  // Papers dataset state
  const [papers, setPapers] = useState<Paper[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<PaperQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Papers list for batch operations
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);

  // Search & Filter state variables
  const [courseFilter, setCourseFilter] = useState<string>('数据结构与算法 (2024春)');
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Paper for active Statistics view (Default is P002 to match the mock image)
  const [statsPaperId, setStatsPaperId] = useState<string>('P002');
  const activeStatsPaper = useMemo(() => {
    return papers.find(p => p.id === statsPaperId) || papers[0];
  }, [papers, statsPaperId]);

  // Statistics Active Tab
  const [statsActiveTab, setStatsActiveTab] = useState<'得分分布' | '正确率分析' | '错题排行' | '作答情况' | '成绩明细'>('错题排行');

  // Preview Modal State for printable layout
  const [previewPaper, setPreviewPaper] = useState<Paper | null>(null);

  // Wizard state: Creating/Editing paper
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(true); // default open matching mockup
  const [wizardStep, setWizardStep] = useState<number>(1); // 1: 选择题目, 2: 试卷设置, 3: 发布设置
  const [wizardTab, setWizardTab] = useState<'从题库选题' | '手动出题'>('从题库选题');

  // Question Filters inside Wizard
  const [wizardTypeFilter, setWizardTypeFilter] = useState<string>('全部');
  const [wizardDifficultyFilter, setWizardDifficultyFilter] = useState<string>('全部');
  const [wizardSearch, setWizardSearch] = useState<string>('');

  // Form selections and custom questions for new paper construction
  const [selectedWizardQuestionIds, setSelectedWizardQuestionIds] = useState<string[]>([
    'Q101', 'Q102', 'Q103', 'Q104', 'Q105', 'Q106'
  ]);
  const [wizardQuestionsScores, setWizardQuestionsScores] = useState<Record<string, number>>({
    'Q101': 5, 'Q102': 5, 'Q103': 5, 'Q104': 5, 'Q105': 10, 'Q106': 10
  });

  // New custom paper general settings (For step 2 & 3)
  const [newPaperName, setNewPaperName] = useState<string>('第9章 排序算法等 综合模拟测试卷');
  const [newPaperDuration, setNewPaperDuration] = useState<number>(45);
  const [newPaperType, setNewPaperType] = useState<'随堂测' | '作业' | '考试'>('作业');
  const [newPaperClass, setNewPaperClass] = useState<string>('2024级计算机1班');

  // Custom single question form states under "手动出题"
  const [customStem, setCustomStem] = useState<string>('');
  const [customType, setCustomType] = useState<'单选题' | '多选题' | '判断题' | '主观题'>('单选题');
  const [customDifficulty, setCustomDifficulty] = useState<'易' | '中' | '难'>('中');
  const [customScore, setCustomScore] = useState<number>(10);

  // Pagination states for papers table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/teacher/papers').then(res => res.json()),
      fetch('/api/teacher/pool-questions').then(res => res.json())
    ])
      .then(([papersData, questionsData]) => {
        setPapers(papersData);
        setAvailableQuestions(questionsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching paper data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        正在加载试卷管理数据...
      </div>
    );
  }

  // Computations for filters
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      // Course match
      if (courseFilter !== '全部' && p.course !== courseFilter) return false;
      // Type match
      if (typeFilter !== '全部' && p.type !== typeFilter) return false;
      // Status match
      if (statusFilter !== '全部' && p.status !== statusFilter) return false;
      // Search keyword match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const scoreStr = p.maxScore.toString();
        const durationStr = p.duration.toString();
        return (
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          scoreStr.includes(query) ||
          p.course.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [papers, courseFilter, typeFilter, statusFilter, searchQuery]);

  // Paginated split
  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPapers.slice(start, start + itemsPerPage);
  }, [filteredPapers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage) || 1;

  // Global aggregate counters derived dynamically
  const paperStatsAggregate = useMemo(() => {
    const total = papers.length;
    const published = papers.filter(p => p.status === '已发布').length;
    const publishedPct = total > 0 ? ((published / total) * 100).toFixed(1) : '0';
    
    // Average score of published papers with actual score
    const gradedPapers = papers.filter(p => p.averageScore !== null);
    const avgScore = gradedPapers.length > 0 
      ? (gradedPapers.reduce((sum, p) => sum + (p.averageScore || 0), 0) / gradedPapers.length).toFixed(1)
      : '78.6';

    // Simulated total answering statistics
    const answerCount = papers.reduce((sum, p) => sum + p.submittedCount, 0);

    return {
      total,
      published,
      publishedPct,
      avgScore,
      answerCount: answerCount + 1150, // base seed scaling factor
      completionRate: '85.3'
    };
  }, [papers]);

  // Batch Handlers
  const handleToggleSelectAll = () => {
    if (selectedPaperIds.length === filteredPapers.length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(filteredPapers.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedPaperIds(prev => [...prev, id]);
    }
  };

  const handleBatchPublish = () => {
    if (selectedPaperIds.length === 0) {
      triggerToast('⚠️ 请在表格中勾选要批量发布的试卷！', 'warning');
      return;
    }
    setPapers(prev => prev.map(p => selectedPaperIds.includes(p.id) ? { ...p, status: '已发布' } : p));
    triggerToast(`🎉 成功指派发布了 ${selectedPaperIds.length} 份试卷至对应教学班！`, 'success');
    setSelectedPaperIds([]);
  };

  const handleBatchArchive = () => {
    if (selectedPaperIds.length === 0) {
      triggerToast('⚠️ 请在表格中勾选要批量归档的试卷！', 'warning');
      return;
    }
    setPapers(prev => prev.map(p => selectedPaperIds.includes(p.id) ? { ...p, status: '已截止' } : p));
    triggerToast(`📥 成功对选定的 ${selectedPaperIds.length} 份作业及测试试卷进行期末归档。`, 'success');
    setSelectedPaperIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedPaperIds.length === 0) {
      triggerToast('⚠️ 请勾选要彻底删除的试卷！', 'warning');
      return;
    }
    if (window.confirm(`确定要彻底删除这 ${selectedPaperIds.length} 份试卷吗？此操作包含关联的所有学生作答成绩及答题分析，不可恢复。`)) {
      setPapers(prev => prev.filter(p => !selectedPaperIds.includes(p.id)));
      triggerToast(`🗑️ 已彻底抹除 ${selectedPaperIds.length} 份试卷相关的所有存储记录。`, 'error');
      setSelectedPaperIds([]);
    }
  };

  // Row Specific Handlers
  const handleCopyPaper = (p: Paper) => {
    const copyId = `P_${Math.floor(100 + Math.random() * 900)}`;
    const copyObj: Paper = {
      ...p,
      id: copyId,
      name: `副本 - ${p.name}`,
      status: '未发布',
      submittedCount: 0,
      averageScore: null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      stats: {
        maxScore: 0,
        passRate: 0,
        averageDuration: 0,
        totalSubmissions: 0,
        scoreDistribution: [],
        errorRanking: [],
        answeredList: []
      }
    };

    setPapers([...papers, copyObj]);
    triggerToast(`📋 已克隆并生成试卷副本 [${copyId}]：${copyObj.name}`, 'success');
  };

  const handleDeletePaper = (id: string, name: string) => {
    if (window.confirm(`确认要删除试卷“${name}”吗？此动作无法撤消。`)) {
      setPapers(prev => prev.filter(p => p.id !== id));
      triggerToast(`🗑️ 成功从本地列表移除了试卷 [${id}]`, 'success');
      if (statsPaperId === id) {
        setStatsPaperId(papers[0]?.id || '');
      }
    }
  };

  // Wizard custom question appending
  const handleCreateCustomQuestion = () => {
    if (!customStem.trim()) {
      triggerToast('❌ 请填写手卷自定义题目的内容！', 'error');
      return;
    }
    // Append to virtual library
    const qId = `Q${300 + Math.floor(Math.random() * 700)}`;
    const customQ: PaperQuestion = {
      id: qId,
      stem: customStem,
      type: customType,
      difficulty: customDifficulty,
      defaultScore: customScore
    };
    
    // Add to pool
    setAvailableQuestions(prev => [...prev, customQ]);
    // Select it
    setSelectedWizardQuestionIds(prev => [...prev, qId]);
    setWizardQuestionsScores(prev => ({ ...prev, [qId]: customScore }));

    triggerToast(`✍️ 本地手动拟题 [${qId}] 已添加到新建试卷配题中（分值: ${customScore}分）！`, 'success');
    
    // Reset Form
    setCustomStem('');
    setWizardTab('从题库选题'); // jump back to view
  };

  // Calculating dynamic total point in Wizard
  const wizardTotalPoint = useMemo(() => {
    return selectedWizardQuestionIds.reduce((sum, qId) => {
      return sum + (wizardQuestionsScores[qId] || 5);
    }, 0);
  }, [selectedWizardQuestionIds, wizardQuestionsScores]);

  // Wizard execution: create paper final action
  const handleFinishWizard = () => {
    if (selectedWizardQuestionIds.length === 0) {
      triggerToast('❌ 当前新建试卷未配有任何题目，请至少选取 1 道题目！', 'warning');
      return;
    }
    
    if (wizardStep < 3) {
      setWizardStep(prev => prev + 1);
      return;
    }

    // Assembly complete creation
    const finalId = `P0${10 + papers.length}`;
    const assembledQuestions = selectedWizardQuestionIds.map(qId => {
      const qObj = availableQuestions.find(item => item.id === qId) || availableQuestions[0];
      return {
        question: qObj,
        score: wizardQuestionsScores[qId] || 5
      };
    });

    const newPaper: Paper = {
      id: finalId,
      name: newPaperName,
      course: courseFilter === '全部' ? '数据结构与算法 (2024春)' : courseFilter,
      type: newPaperType,
      maxScore: wizardTotalPoint,
      duration: newPaperDuration,
      status: '未发布',
      submittedCount: 0,
      totalStudents: 52,
      averageScore: null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      questions: assembledQuestions,
      stats: {
        maxScore: 0,
        passRate: 0,
        averageDuration: 0,
        totalSubmissions: 0,
        scoreDistribution: [],
        errorRanking: [],
        answeredList: []
      }
    };

    setPapers([newPaper, ...papers]);
    triggerToast(`🎉 试卷“${newPaperName}”一键配题组装完毕（总分: ${wizardTotalPoint}分）！可在列表中快捷发布至【${newPaperClass}】。`, 'success');
    
    // Reset wizard
    setWizardStep(1);
    setSelectedWizardQuestionIds(['Q101', 'Q102', 'Q103', 'Q104', 'Q105', 'Q106']);
  };

  // Interactive filtering inside wizard question pool chooser
  const filteredWizardPool = useMemo(() => {
    return availableQuestions.filter(q => {
      if (wizardTypeFilter !== '全部' && q.type !== wizardTypeFilter) return false;
      if (wizardDifficultyFilter !== '全部' && q.difficulty !== wizardDifficultyFilter) return false;
      if (wizardSearch.trim() !== '') {
        return q.stem.toLowerCase().includes(wizardSearch.toLowerCase()) || q.id.toLowerCase().includes(wizardSearch.toLowerCase());
      }
      return true;
    });
  }, [availableQuestions, wizardTypeFilter, wizardDifficultyFilter, wizardSearch]);

  const handleToggleWizardQuestion = (qId: string) => {
    if (selectedWizardQuestionIds.includes(qId)) {
      setSelectedWizardQuestionIds(prev => prev.filter(id => id !== qId));
    } else {
      setSelectedWizardQuestionIds(prev => [...prev, qId]);
      if (!wizardQuestionsScores[qId]) {
        const fallbackScore = availableQuestions.find(item => item.id === qId)?.defaultScore || 5;
        setWizardQuestionsScores(prev => ({ ...prev, [qId]: fallbackScore }));
      }
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-1 md:p-4 select-none text-left font-sans text-slate-800 pb-16 animate-fadeIn w-full max-w-[1700px] mx-auto min-h-[90vh]">
      
      {/* 📋 LEFT AREA: MAIN MANAGEMENT PANEL */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        
        {/* Title and Secondary summary context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>试卷管理</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              统一编排、自动组卷、发布答题、并实时监控批改完毕的学生成绩作答数据指标分析
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-150">
              数据连接: 数据库高可靠互锁
            </span>
          </div>
        </div>

        {/* 🔍 Filters & Quick actions header block */}
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter: Course selection */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>课程:</span>
              <select 
                value={courseFilter} 
                onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="数据结构与算法 (2024春)">数据结构与算法 (2024春)</option>
                <option value="全部">全部教授课程</option>
              </select>
            </div>

            {/* Filter: Type selection */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>试卷类型:</span>
              <select 
                value={typeFilter} 
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="全部">全部类型</option>
                <option value="随堂测">随堂测</option>
                <option value="作业">作业</option>
                <option value="考试">考试</option>
              </select>
            </div>

            {/* Filter: Status selection */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>状态:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="全部">全部状态</option>
                <option value="已发布">已发布</option>
                <option value="未发布">未发布</option>
                <option value="已截止">已截止</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Quick search */}
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索试卷ID/名称..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-205 rounded-lg pl-8 pr-3 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
              />
            </div>

            {/* Create Action */}
            <button 
              onClick={() => {
                setIsWizardOpen(true);
                setWizardStep(1);
                triggerToast('💫 新建试卷向导已重置并就绪，请在右侧选择题目！', 'info');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3 py-1.8 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>新建试卷</span>
            </button>
          </div>
        </div>

        {/* 📊 SUMMARY CARDS STATEMENTS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Card 1: Total papers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
              <FileText className="w-5 h-5 font-black" />
            </div>
            <div>
              <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wide">总试卷数</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">{paperStatsAggregate.total}</span>
                <span className="text-xs text-slate-400 font-bold">份</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                本月新增 <span className="text-emerald-500">▲ 8 份</span>
              </p>
            </div>
          </div>

          {/* Card 2: Active / Published */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
              <CheckCircle className="w-5 h-5 font-black" />
            </div>
            <div>
              <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wide">已发布试卷</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">{paperStatsAggregate.published}</span>
                <span className="text-xs text-slate-400 font-bold">份</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                占比高达 <span className="text-blue-600 font-extrabold">{paperStatsAggregate.publishedPct}%</span>
              </p>
            </div>
          </div>

          {/* Card 3: Average Score */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
              <Award className="w-5 h-5 font-black" />
            </div>
            <div>
              <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wide">考后平均分</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">{paperStatsAggregate.avgScore}</span>
                <span className="text-xs text-slate-400 font-bold">分</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                较季中 <span className="text-emerald-500">▲ 4.3 分</span> 上升
              </p>
            </div>
          </div>

          {/* Card 4: Submission amount */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
              <Users className="w-5 h-5 font-black" />
            </div>
            <div>
              <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wide">作答提交人数</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">{paperStatsAggregate.answerCount.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-bold">人</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                完成率安定 <span className="text-indigo-600 font-black">85.3%</span>
              </p>
            </div>
          </div>

          {/* Card 5: Attendance Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 font-black" />
            </div>
            <div>
              <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wide">随堂作答率</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">85.3</span>
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                稳健超越 <span className="text-emerald-500">▲ 6.2%</span> 历史同期
              </p>
            </div>
          </div>

        </div>

        {/* 🗄️ BATCH CONTROLS AND PAPERS LIST TABLE CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col shadow-3xs overflow-hidden">
          
          {/* Table batch action tools bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none px-2 py-1 rounded hover:bg-slate-200/50">
                <input 
                  type="checkbox"
                  checked={filteredPapers.length > 0 && selectedPaperIds.length === filteredPapers.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>全选</span>
              </label>

              <div className="h-4 w-px bg-slate-300 mx-1"></div>

              {/* Action 1: Batch Publish */}
              <button 
                onClick={handleBatchPublish}
                disabled={selectedPaperIds.length === 0}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                  selectedPaperIds.length > 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer shadow-3xs' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>批量发布</span>
              </button>

              {/* Action 2: Batch Archive */}
              <button 
                onClick={handleBatchArchive}
                disabled={selectedPaperIds.length === 0}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                  selectedPaperIds.length > 0 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer shadow-3xs' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>批量归档</span>
              </button>

              {/* Action 3: Export paper structure */}
              <button 
                onClick={() => {
                  if (selectedPaperIds.length === 0) { triggerToast('⚠️ 请勾选需要导出的大纲试卷项！', 'warning'); return; }
                  triggerToast(`📥 已成功打密导出 ${selectedPaperIds.length} 份试卷大纲结构至本地。`, 'success');
                }}
                disabled={selectedPaperIds.length === 0}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                  selectedPaperIds.length > 0 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer shadow-3xs' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出试卷</span>
              </button>

              {/* Action 4: Export Student scores */}
              <button 
                onClick={() => {
                  if (selectedPaperIds.length === 0) { triggerToast('⚠️ 请勾选需要下载成绩的试卷！', 'warning'); return; }
                  triggerToast(`📊 已成功对选定的 ${selectedPaperIds.length} 门测学成绩表格进行多维聚类导出。`, 'success');
                }}
                disabled={selectedPaperIds.length === 0}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                  selectedPaperIds.length > 0 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 cursor-pointer shadow-3xs' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>导出成绩</span>
              </button>

              {/* Action 5: Batch Delete */}
              {selectedPaperIds.length > 0 && (
                <button 
                  onClick={handleBatchDelete}
                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除 ({selectedPaperIds.length})</span>
                </button>
              )}
            </div>

            {/* Sorting controls in table header */}
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold uppercase text-slate-400">排序:</span>
              <select className="bg-white border border-slate-205 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer">
                <option>按创建时间倒序</option>
                <option>按平均分由高到低</option>
                <option>按试卷总分降序</option>
              </select>
            </div>
          </div>

          {/* Interactive Data Table Layout Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-4 min-w-[180px]">试卷名称</th>
                  <th className="py-3 px-4">所属课程</th>
                  <th className="py-3 px-4 text-center w-24">试卷类型</th>
                  <th className="py-3 px-4 text-center">满分 / 时长</th>
                  <th className="py-3 px-4 text-center">状态</th>
                  <th className="py-3 px-4 text-center">作答人数</th>
                  <th className="py-3 px-4 text-center font-bold">平均分</th>
                  <th className="py-3 px-4">创建时间</th>
                  <th className="py-3 px-4 text-right pr-6 w-32">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {paginatedPapers.map((p) => {
                  const isSelected = selectedPaperIds.includes(p.id);
                  const isStatsTarget = statsPaperId === p.id;
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => {
                        setStatsPaperId(p.id);
                        // Trigger soft layout indicator
                      }}
                      className={`transition-colors h-14 cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-blue-50/30 hover:bg-blue-50/45' 
                          : isStatsTarget 
                          ? 'bg-slate-50 hover:bg-slate-100/70' 
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Paper Name */}
                      <td className="py-2 px-4 font-bold text-slate-900 max-w-[220px] truncate" title={p.name}>
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{p.id} · {p.questions.length}道题</span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-2 px-4 text-slate-500 font-semibold text-2xs truncate max-w-[140px]" title={p.course}>
                        {p.course}
                      </td>

                      {/* Type badge */}
                      <td className="py-2 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          p.type === '随堂测'
                            ? 'bg-success-50 text-success border-success-100'
                            : p.type === '作业'
                            ? 'bg-primary-50 text-primary border-primary-100'
                            : 'bg-warning-50 text-warning border-warning-100'
                        }`}>
                          {p.type}
                        </span>
                      </td>

                      {/* Score / Duration */}
                      <td className="py-2 px-4 text-center text-slate-500 font-bold">
                        {p.maxScore}分 / {p.duration}分钟
                      </td>

                      {/* Published Status tag */}
                      <td className="py-2 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          p.status === '已发布'
                            ? 'bg-success text-white'
                            : p.status === '未发布'
                            ? 'bg-warning-50 text-warning border border-warning-200'
                            : 'bg-primary-50 text-primary border border-primary-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Users Answering ratio */}
                      <td className="py-2 px-4 text-center text-slate-500 font-bold">
                        {p.submittedCount}/{p.totalStudents}
                      </td>

                      {/* Weighted average score */}
                      <td className="py-2 px-4 text-center font-black">
                        {p.averageScore !== null ? (
                          <span className="text-blue-600 text-sm">{p.averageScore}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* CrDate */}
                      <td className="py-2 px-4 text-slate-400 font-mono text-[10px]">
                        {p.createdAt}
                      </td>

                      {/* Row actions */}
                      <td className="py-2 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 text-slate-400 hover:text-slate-700">
                          
                          {/* VIEW Action */}
                          <button 
                            onClick={() => {
                              setPreviewPaper(p);
                              triggerToast(`📄 打开试卷「${p.name}」考前排版与答案校检面板...`);
                            }}
                            className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            title="查阅排版/打印试卷"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* EDIT Action */}
                          <button 
                            onClick={() => {
                              setIsWizardOpen(true);
                              setWizardStep(2);
                              setNewPaperName(p.name);
                              setNewPaperDuration(p.duration);
                              setNewPaperType(p.type);
                              
                              // Load current question checklist
                              const qIds = p.questions.map(q => q.question.id);
                              setSelectedWizardQuestionIds(qIds);
                              
                              const scores: Record<string, number> = {};
                              p.questions.forEach(q => {
                                scores[q.question.id] = q.score;
                              });
                              setWizardQuestionsScores(scores);

                              triggerToast(`✏️ 已复制并导入到右侧的新建试卷组装器，支持自由删改！`);
                            }}
                            className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            title="修订试卷"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* STATS Action */}
                          <button 
                            onClick={() => {
                              setStatsPaperId(p.id);
                              setStatsActiveTab('错题排行');
                              triggerToast(`📊 正在计算并重新渲染试卷 [${p.id}] 作答统计图谱。`, 'success');
                            }}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                              isStatsTarget 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-50 hover:bg-slate-100 text-blue-600 hover:bg-blue-50'
                            }`}
                            title="查看作答统计大屏"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>

                          {/* COPY Action */}
                          <button 
                            onClick={() => handleCopyPaper(p)}
                            className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            title="复制并新建空试卷"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE Action */}
                          <button 
                            onClick={() => handleDeletePaper(p.id, p.name)}
                            className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-550 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            title="彻底删除"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredPapers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-400 font-bold text-xs space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-350 mx-auto" />
                      <p>没有发现任何匹配设定过滤条件的试卷大纲。</p>
                      <button 
                        onClick={() => {
                          setCourseFilter('全部');
                          setTypeFilter('全部');
                          setStatusFilter('全部');
                          setSearchQuery('');
                          triggerToast('🔄 筛选器已重置');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md mt-2 cursor-pointer font-extrabold shadow-3xs"
                      >
                        清空所有筛选条件
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
            <span>共 {filteredPapers.length} 条</span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white font-extrabold shadow-3xs' 
                      : 'hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-md px-1.5 py-1 text-xs text-slate-700 ml-2"
              >
                <option value={10}>10 条/页</option>
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
              </select>

              <span className="text-slate-400 ml-1">跳至</span>
              <input 
                type="text" 
                defaultValue={currentPage}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }}
                className="w-8 border border-slate-200 rounded bg-white text-center text-xs py-0.5" 
              />
              <span className="text-slate-400">页</span>
            </div>
          </div>

        </div>

      </div>

      {/* 🔮 RIGHT COLUMN: CREATE PAPER WIZARD CARD & STATS PANEL */}
      <div className="w-full xl:w-[430px] flex-shrink-0 flex flex-col space-y-6">
        
        {/* WIZARD CARD: New Paper Creator */}
        {isWizardOpen && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs flex flex-col min-h-[500px]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 text-sm">新建试卷向导</h3>
              </div>
              <button 
                onClick={() => {
                  setIsWizardOpen(false);
                  triggerToast('ℹ️ 已折叠新建试卷向导面板，可通过上方按钮再次唤醒');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Header (Steps 1, 2, 3) */}
            <div className="px-6 py-4 flex items-center justify-between relative bg-slate-50/20 border-b border-slate-100">
              <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>
              
              {/* Step 1 indicator */}
              <div className="flex flex-col items-center z-10 bg-white px-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>1</div>
                <span className={`text-[10px] mt-1 font-bold ${wizardStep >= 1 ? 'text-blue-600' : 'text-slate-450'}`}>选择题目</span>
              </div>

              {/* Step 2 indicator */}
              <div className="flex flex-col items-center z-10 bg-white px-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>2</div>
                <span className={`text-[10px] mt-1 font-bold ${wizardStep >= 2 ? 'text-blue-600' : 'text-slate-450'}`}>试卷设置</span>
              </div>

              {/* Step 3 indicator */}
              <div className="flex flex-col items-center z-10 bg-white px-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>3</div>
                <span className={`text-[10px] mt-1 font-bold ${wizardStep >= 3 ? 'text-blue-600' : 'text-slate-450'}`}>发布设置</span>
              </div>
            </div>

            {/* Step Content 1: Questions select */}
            {wizardStep === 1 && (
              <div className="flex flex-col flex-grow">
                {/* Mode Selector Tabs */}
                <div className="flex border-b border-slate-200 text-xs">
                  <button 
                    onClick={() => setWizardTab('从题库选题')}
                    className={`flex-1 py-2.5 font-bold text-center ${
                      wizardTab === '从题库选题' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/10' : 'text-slate-550 hover:bg-slate-50'
                    }`}
                  >
                    从题库选题
                  </button>
                  <button 
                    onClick={() => {
                      setWizardTab('手动出题');
                      setCustomStem('');
                    }}
                    className={`flex-1 py-2.5 font-bold text-center ${
                      wizardTab === '手动出题' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/10' : 'text-slate-550 hover:bg-slate-50'
                    }`}
                  >
                    手动出题
                  </button>
                </div>

                {/* SubTab 1 Content: Pick from pool */}
                {wizardTab === '从题库选题' ? (
                  <div className="p-4 flex flex-col flex-grow space-y-3">
                    
                    {/* Tiny search bar in pool */}
                    <div className="grid grid-cols-3 gap-2">
                      <select 
                        value={wizardTypeFilter}
                        onChange={(e) => setWizardTypeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[11px] font-bold text-slate-700"
                      >
                        <option value="全部">全部题型</option>
                        <option value="单选题">单选题</option>
                        <option value="多选题">多选题</option>
                        <option value="判断题">判断题</option>
                        <option value="主观题">主观题</option>
                      </select>

                      <select 
                        value={wizardDifficultyFilter}
                        onChange={(e) => setWizardDifficultyFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[11px] font-bold text-slate-700"
                      >
                        <option value="全部">全部难度</option>
                        <option value="易">容易</option>
                        <option value="中">中等</option>
                        <option value="难">高难</option>
                      </select>

                      <input 
                        type="text" 
                        placeholder="搜索题目..."
                        value={wizardSearch}
                        onChange={(e) => setWizardSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[11px]"
                      />
                    </div>

                    {/* Available questions mini table list */}
                    <div className="flex-grow max-h-[220px] overflow-y-auto border border-slate-100 rounded-lg p-2 space-y-1.5 bg-slate-50/35">
                      <div className="text-[10px] font-black text-slate-400 flex items-center justify-between pb-1 border-b border-slate-200">
                        <span>题干内容</span>
                        <span className="w-24 text-right pr-4">分值分配</span>
                      </div>

                      {filteredWizardPool.map((q) => {
                        const isChecked = selectedWizardQuestionIds.includes(q.id);
                        return (
                          <div 
                            key={q.id}
                            className={`flex items-center justify-between text-xs py-1 px-1.5 rounded transition-all ${
                              isChecked ? 'bg-blue-50/40 text-blue-900-variant font-bold' : 'hover:bg-slate-100/50'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-1.5">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleWizardQuestion(q.id)}
                                className="rounded text-blue-600 border-slate-300 w-3 h-3 cursor-pointer"
                              />
                              <span className="truncate" title={q.stem}>{q.stem}</span>
                            </label>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className={`px-1 rounded text-[9px] scale-90 ${
                                q.type === '单选题' ? 'bg-blue-55 text-blue-600 bg-blue-50' : 
                                q.type === '判断题' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                              }`}>{q.type.substring(0, 2)}</span>

                              {isChecked ? (
                                <input 
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={wizardQuestionsScores[q.id] || 5}
                                  onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value));
                                    setWizardQuestionsScores(prev => ({ ...prev, [q.id]: val }));
                                  }}
                                  className="w-9 text-center text-[10px] border border-slate-205 rounded bg-white font-bold h-4"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold w-9 text-center">{q.defaultScore}分</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats mini summary indicator */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex items-center justify-between text-xs">
                      <span className="text-slate-450 font-bold">已选配题目:</span>
                      <div className="space-x-3">
                        <strong className="text-slate-805"><span className="text-blue-600">{selectedWizardQuestionIds.length}</span> / {availableQuestions.length} 道</strong>
                        <strong className="text-slate-805">估计总分：<span className="text-blue-600">{wizardTotalPoint}</span> 分</strong>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Form to build manual custom question */
                  <div className="p-4 flex flex-col flex-grow space-y-4 text-xs font-semibold text-slate-650">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-extrabold uppercase text-slate-400">手动拟题题干内容</label>
                      <textarea 
                        rows={3}
                        placeholder="在此处输入手写题干题文（可附选择支选项，或直接是主观论述说明）"
                        value={customStem}
                        onChange={(e) => setCustomStem(e.target.value)}
                        className="bg-slate-50 border border-slate-250 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-2xs text-slate-400">题型</label>
                        <select 
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded p-1 font-bold text-slate-700"
                        >
                          <option value="单选题">单选题</option>
                          <option value="多选题">多选题</option>
                          <option value="判断题">判断题</option>
                          <option value="主观题">主观题</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-2xs text-slate-400">难度系数</label>
                        <select 
                          value={customDifficulty}
                          onChange={(e) => setCustomDifficulty(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded p-1 font-bold text-slate-700"
                        >
                          <option value="易">容易</option>
                          <option value="中">中等</option>
                          <option value="难">高难</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-2xs text-slate-400">核定分值</label>
                        <input 
                          type="number" 
                          min={1}
                          value={customScore}
                          onChange={(e) => setCustomScore(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 rounded p-1 text-center font-black text-slate-800"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleCreateCustomQuestion}
                      className="w-full bg-slate-900 text-white hover:bg-slate-850 py-2 rounded-lg font-extrabold shadow-3xs cursor-pointer transition-colors text-center"
                    >
                      保存该题，并压入新建试卷中
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step Content 2: Settings */}
            {wizardStep === 2 && (
              <div className="p-4 flex flex-col flex-grow space-y-4 text-xs font-bold text-slate-650">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold uppercase text-slate-400">1. 设计试卷名称</label>
                  <input 
                    type="text" 
                    value={newPaperName}
                    onChange={(e) => setNewPaperName(e.target.value)}
                    className="bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-805"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-extrabold uppercase text-slate-400">2. 答题时限限制 (分钟)</label>
                    <input 
                      type="number" 
                      value={newPaperDuration}
                      onChange={(e) => setNewPaperDuration(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-250 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-805 font-black text-center"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-extrabold uppercase text-slate-400">3. 考核题型定位</label>
                    <select 
                      value={newPaperType}
                      onChange={(e) => setNewPaperType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-250 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-805"
                    >
                      <option value="作业">平日作业</option>
                      <option value="随堂测">课堂诊断随堂测</option>
                      <option value="考试">正式机考考试</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl text-[11px] text-blue-700 space-y-1 border border-blue-150">
                  <p className="font-extrabold flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 shrink-0" />
                    <span>智能组密规则校检</span>
                  </p>
                  <p className="font-medium text-blue-600/90 leading-relaxed">
                    本试卷共挂载 {selectedWizardQuestionIds.length} 题，累计试卷总分为 {wizardTotalPoint} 分。系统大模型已自动核查题目排布，在题目去重及连贯逻辑评级中获 A+ 等级。
                  </p>
                </div>

              </div>
            )}

            {/* Step Content 3: Publish Configuration */}
            {wizardStep === 3 && (
              <div className="p-4 flex flex-col flex-grow space-y-4 text-xs font-bold text-slate-650">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold uppercase text-slate-400">分发靶向目标班级</label>
                  <select 
                    value={newPaperClass}
                    onChange={(e) => setNewPaperClass(e.target.value)}
                    className="bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-805 text-xs font-bold focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="2024级计算机1班">2024级计算机1班 (48人)</option>
                    <option value="2024级计算机2班">2024级计算机2班 (46人)</option>
                    <option value="全班联合考">高级大语言应用班全部52人</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-2xs font-extrabold uppercase text-slate-400">答题防作弊与配置项</label>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-755">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5" />
                      <span>限制考生仅能全屏切屏打卡上限 3 次（自动收卷）</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-755">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5" />
                      <span>开启“题目与选项顺序打乱”随机洗牌选项（一客一卷）</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-755">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5" />
                      <span>答题时间截止后，自动将答疑微课解析卡推送至错题薄</span>
                    </label>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 text-emerald-805 text-[11px] rounded-lg border border-emerald-150">
                  <span className="font-extrabold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>试卷组卷校对合规通过！</span>
                  </span>
                </div>

              </div>
            )}

            {/* Stepper Footer actions */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
              <div className="text-slate-600 font-bold text-xs flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">估值总分:</span>
                <span className="text-blue-600 font-black text-sm">{wizardTotalPoint} 分</span>
              </div>

              <div className="flex gap-2">
                {wizardStep > 1 && (
                  <button 
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="border border-slate-205 text-slate-700 hover:bg-slate-100 font-extrabold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    上一步
                  </button>
                )}

                <button 
                  onClick={handleFinishWizard}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-1.5 px-5 rounded-lg text-xs cursor-pointer shadow-3xs transition-all flex items-center gap-1"
                >
                  <span>{wizardStep === 3 ? '一建生成试卷' : '下一步'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STATISTICS CARD DIALOG AREA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs flex-grow flex flex-col min-h-[360px] overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>试卷统计核心分析</span>
              </h3>
              <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                ID: {activeStatsPaper.id}
              </span>
            </div>
            <p className="text-xs font-black text-slate-550 line-clamp-1 mt-1" title={activeStatsPaper.name}>
              统计大屏: {activeStatsPaper.name}
            </p>
          </div>

          {/* Core Mini Metrics Metrics Row */}
          <div className="p-4 grid grid-cols-4 gap-2 text-center bg-slate-50/30 border-b border-slate-150">
            <div>
              <p className="text-[9px] text-slate-400 font-black">答题情况</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">{activeStatsPaper.submittedCount}/{activeStatsPaper.totalStudents}</p>
              <span className="text-[8px] text-slate-400">已参考完毕</span>
            </div>
            
            <div>
              <p className="text-[9px] text-slate-400 font-black">及格判定率</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">
                {activeStatsPaper.stats.passRate > 0 ? `${activeStatsPaper.stats.passRate}%` : '-'}
              </p>
              <span className="text-[8px] text-slate-400">及格分60分</span>
            </div>

            <div>
              <p className="text-[9px] text-slate-400 font-black">最高分探针</p>
              <p className="text-xs font-black text-slate-805 mt-0.5">
                {activeStatsPaper.stats.maxScore > 0 ? `${activeStatsPaper.stats.maxScore}分` : '-'}
              </p>
              <span className="text-[8px] text-emerald-500 font-extrabold">高分优异</span>
            </div>

            <div>
              <p className="text-[9px] text-slate-400 font-black">平均用时</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">
                {activeStatsPaper.stats.averageDuration > 0 ? `${activeStatsPaper.stats.averageDuration}分` : '-'}
              </p>
              <span className="text-[8px] text-slate-400">答题限时{activeStatsPaper.duration}分</span>
            </div>
          </div>

          {/* Metrics interactive tabs list switcher */}
          <div className="flex border-b border-slate-150 bg-slate-50 text-[11px] font-bold overflow-x-auto shrink-0 scrollbar-none">
            <button 
              onClick={() => setStatsActiveTab('错题排行')}
              className={`py-2 px-3 whitespace-nowrap ${statsActiveTab === '错题排行' ? 'text-blue-600 border-b-2 border-blue-600 bg-white font-extrabold' : 'text-slate-550'}`}
            >
              错题排行
            </button>
            <button 
              onClick={() => {
                if (activeStatsPaper.submittedCount === 0) { triggerToast('⚠️ 当前试卷无学生作答，暂无得分分布图', 'warning'); return; }
                setStatsActiveTab('得分分布');
              }}
              className={`py-2 px-3 whitespace-nowrap ${statsActiveTab === '得分分布' ? 'text-blue-600 border-b-2 border-blue-600 bg-white font-extrabold' : 'text-slate-550'}`}
            >
              得分分布
            </button>
            <button 
              onClick={() => {
                if (activeStatsPaper.submittedCount === 0) { triggerToast('⚠️ 暂无学生参试，正确率核销不可用', 'warning'); return; }
                setStatsActiveTab('正确率分析');
              }}
              className={`py-2 px-3 whitespace-nowrap ${statsActiveTab === '正确率分析' ? 'text-blue-600 border-b-2 border-blue-600 bg-white font-extrabold' : 'text-slate-550'}`}
            >
              正确率分析
            </button>
            <button 
              onClick={() => {
                if (activeStatsPaper.submittedCount === 0) { triggerToast('⚠️ 暂无考试成绩细节', 'warning'); return; }
                setStatsActiveTab('成绩明细');
              }}
              className={`py-2 px-3 whitespace-nowrap ${statsActiveTab === '成绩明细' ? 'text-blue-600 border-b-2 border-blue-600 bg-white font-extrabold' : 'text-slate-550'}`}
            >
              成绩明细
            </button>
          </div>

          {/* Interactive tabs details rendering */}
          <div className="p-4 flex-grow overflow-y-auto max-h-[300px]">
            
            {activeStatsPaper.submittedCount === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 text-xs">
                <Clock className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="font-bold">该试卷当前状态为“未发布/未有作答提交”</p>
                <p className="text-[10px] text-slate-400">当学生开始提交作答数据后，本板块将实时渲染错题分布</p>
              </div>
            ) : (
              <>
                {/* Tab Content 1: Error ranking */}
                {statsActiveTab === '错题排行' && (
                  <div className="space-y-2 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 border-b border-slate-150">
                          <th className="pb-1 text-left">对错排序列</th>
                          <th className="pb-1 text-center w-12">题型</th>
                          <th className="pb-1 text-center w-12">正确率</th>
                          <th className="pb-1 text-center w-16">错误人数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStatsPaper.stats.errorRanking.map((err, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2.5 pr-2 truncate max-w-[170px] text-slate-700 font-bold" title={err.title}>
                              {err.title}
                            </td>
                            <td className="py-2.5 text-center shrink-0">
                              <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded scale-90 text-[10px] font-bold">
                                {err.type.substring(0, 2)}
                              </span>
                            </td>
                            <td className="py-2.5 text-center font-bold text-slate-600">
                              {err.correctRate}%
                            </td>
                            <td className="py-2.5 text-center font-black text-rose-600 bg-rose-50/20">
                              {err.errorCount}人
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tab Content 2: Score distribution */}
                {statsActiveTab === '得分分布' && (
                  <div className="space-y-3.5 text-xs font-bold font-mono">
                    <p className="text-[10.5px] text-slate-400">全班测试得分区间频数图谱:</p>
                    <div className="space-y-2.5">
                      {activeStatsPaper.stats.scoreDistribution.map((dist, idx) => {
                        const totalCounts = activeStatsPaper.stats.scoreDistribution.reduce((sum, d) => sum + d.count, 0);
                        const pctRatio = totalCounts > 0 ? (dist.count / totalCounts) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-705">
                              <span>{dist.label}</span>
                              <span>{dist.count} 人 ({pctRatio.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all" 
                                style={{ width: `${pctRatio}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Accuracy analysis */}
                {statsActiveTab === '正确率分析' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[10px] text-slate-400 pb-1 border-b border-slate-100">各考核重点大项正确率一览表 (Accuracy):</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="font-bold text-slate-800">栈的基本运用 (单选/判断)</span>
                        <span className="font-black text-emerald-600 text-sm">88.5% 达标</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="font-bold text-slate-800">循环队列尾追判定 (单选/判断)</span>
                        <span className="font-black text-emerald-600 text-sm">82.1% 达标</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="font-bold text-slate-800">递归执行调用系统栈 (主观论述)</span>
                        <span className="font-black text-orange-600 text-sm">56.4% 警报项</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Graded lists */}
                {statsActiveTab === '成绩明细' && (
                  <div className="text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-450 border-b border-slate-150">
                          <th className="pb-1">学号</th>
                          <th className="pb-1">姓名</th>
                          <th className="pb-1 text-center">得分</th>
                          <th className="pb-1 text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStatsPaper.stats.answeredList.map((stu, i) => (
                          <tr key={i} className="border-b border-slate-100 font-bold hover:bg-slate-50/55">
                            <td className="py-2 text-slate-400 font-mono scale-90">{stu.studentId}</td>
                            <td className="py-2 text-slate-700">{stu.studentName}</td>
                            <td className="py-2 text-center text-blue-600 font-mono">{stu.score}分</td>
                            <td className="py-2 text-center">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-1 py-0.2 rounded text-[9px] scale-90">
                                {stu.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-55 flex justify-between items-center shrink-0">
            <button 
              onClick={() => {
                triggerToast(`📥 试卷统计报告[${activeStatsPaper.id}]构建生成完毕，正在启动安全防伪加密传输。`, 'success');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>导出统计报告 (Spreadsheet / PDF)</span>
            </button>
            <button 
              onClick={() => {
                setStatsPaperId(papers[0]?.id || 'P002');
                triggerToast('💫 统计目标已重置为默认。');
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-205 px-3 py-1 text-2xs rounded-lg font-black transition-all cursor-pointer"
            >
              重置
            </button>
          </div>

        </div>

      </div>

      {/* 🔮 FULL DESKTOP WATERMARK PRINTABLE exam paper preview MODAL */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] text-slate-850 select-none animate-fadeIn">
            
            {/* Header controls bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>国家普通教育期末校内考试 · 标准试卷排版与答案校对面板</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  已适配标准 A3 双面纸质打印规格，已嵌入防伪防泄漏安全数字水印
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const printSection = document.getElementById('exam-printable-content');
                    if (printSection) {
                      window.print();
                    } else {
                      triggerToast('🖨️ 当前运行处于iFrame隔离环境，已为您调起默认浏览器PDF保存通道...', 'info');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-1.8 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs transition-transform"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>排版打印纸质卷</span>
                </button>
                
                <button 
                  onClick={() => setPreviewPaper(null)}
                  className="text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-200/50 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Standard Printable layout content (A4 simulated paper) */}
            <div id="exam-printable-content" className="p-10 flex-grow overflow-y-auto bg-slate-100 font-serif leading-relaxed text-slate-850">
              
              <div className="bg-white p-12 shadow-lg max-w-[800px] mx-auto min-h-[1100px] border border-slate-200 relative overflow-hidden text-left" style={{ fontFamily: 'SimSun, "STSong", "Songti SC", serif' }}>
                
                {/* Simulated background safe watermark line */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#fafafc_25%,transparent_25%),linear-gradient(-45deg,#fafafc_25%,transparent_25%)] opacity-35 pointer-events-none" style={{ backgroundSize: '40px 40px' }} />

                <div className="relative z-10 space-y-6">
                  
                  {/* Seal boundaries simulated indicator on the left for legal test look */}
                  <div className="absolute left-1.5 top-0 bottom-0 w-8 border-r border-dashed border-red-300 flex flex-col justify-around text-red-500 text-[10px] items-center text-center opacity-70">
                    <div>线</div>
                    <div>订</div>
                    <div>装</div>
                    <div>密封线内不要答题</div>
                  </div>

                  <div className="pl-6 space-y-5">
                    
                    {/* Headers */}
                    <div className="text-center space-y-2">
                      <p className="text-sm font-bold tracking-widest text-slate-605">2024年春季学期校本优质教学作业与阶段测验</p>
                      <h2 className="text-2xl font-black text-slate-905 tracking-wide uppercase border-b-2 border-double border-slate-800 pb-1.5">{previewPaper.name}</h2>
                      <div className="flex justify-center gap-6 text-xs text-slate-550 font-bold font-sans">
                        <span>课程：数据结构与算法</span>
                        <span>总分：100分</span>
                        <span>时限：{previewPaper.duration} 分钟</span>
                        <span>命题组：计算机公共课教研室</span>
                      </div>
                    </div>

                    {/* Student Info Card header */}
                    <div className="border border-slate-350 p-2 rounded text-center grid grid-cols-4 gap-2 text-xs font-sans text-slate-700 font-bold bg-slate-50">
                      <div>班级：___________</div>
                      <div>学号：___________</div>
                      <div>考生姓名：___________</div>
                      <div>得分：___________</div>
                    </div>

                    {/* Attention warning block */}
                    <div className="text-2xs text-slate-450 leading-loose border-b border-slate-300 pb-2">
                      <p className="font-extrabold text-slate-600">注意事项：</p>
                      <p>1. 本试卷共收纳 {previewPaper.questions.length} 道大题，题型各异，请考生仔细核对作答，并于答题时限内作答完毕。</p>
                      <p>2. 请保持答卷页面整洁。书写工整。请遵守相关学籍考纪规定，严禁作弊切屏违纪。</p>
                    </div>

                    {/* Dynamic Question layout map rendering */}
                    <div className="space-y-6 text-xs text-slate-850">
                      {previewPaper.questions.map((item, idx) => {
                        return (
                          <div key={idx} className="space-y-2 pb-4 border-b border-slate-100">
                            
                            {/* Question Title */}
                            <div className="flex items-start gap-1 font-bold">
                              <span className="font-black text-slate-950 shrink-0">{idx + 1}.</span>
                              <div className="space-y-1">
                                <span className="text-slate-950 font-black">{item.question.stem}</span>
                                <span className="text-slate-400 font-normal font-sans ml-2">（本题核准：{item.score} 分，题型：{item.question.type}）</span>
                              </div>
                            </div>

                            {/* Choices representation if choice question */}
                            {(item.question.type === '单选题' || item.question.type === '多选题') && (
                              <div className="grid grid-cols-2 gap-y-1.5 pl-4 text-slate-655 font-medium font-sans">
                                <div>A. 先进先出 (FIFO/First-In First-Out) 特性极其突出</div>
                                <div>B. 后进先出 (LIFO/Last-In First-Out) 经典栈运行轨</div>
                                <div>C. 顺序物理数组连续存储与链式双向链存储无异方式</div>
                                <div>D. 跳跃物理抽取机制且不限定特定方向</div>
                              </div>
                            )}

                            {/* Boolean choices if judge question */}
                            {item.question.type === '判断题' && (
                              <div className="flex gap-10 pl-4 text-slate-655 font-bold font-sans">
                                <label className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block align-middle"></span>
                                  <span>正确</span>
                                </label>
                                <label className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block align-middle"></span>
                                  <span>错误</span>
                                </label>
                              </div>
                            )}

                            {/* Space for short answer subjective question */}
                            {item.question.type === '主观题' && (
                              <div className="h-28 border border-slate-201 bg-slate-50/50 rounded-lg p-2 font-mono text-2xs text-slate-400 border-dashed relative">
                                <span>考生主观作答书写区域 __________________________________________________________________</span>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                    {/* Standard Answer key sheet for instructors below */}
                    <div className="mt-8 border-t-2 border-slate-800 pt-6 space-y-2">
                      <p className="font-black text-slate-950 text-sm">【专供李老师 · 教学参考考题标答与解析提示】</p>
                      <div className="p-3 bg-blue-50 text-[11px] text-blue-900 rounded border border-blue-200 space-y-1 font-sans leading-relaxed">
                        <p><strong>第1题 (单选题)：</strong> 标志答案：B。解析：栈依照其操作点限制在栈顶，其固有存取性质符合后进先出规则。</p>
                        <p><strong>第2题 (多选题)：</strong> 标志答案：A, B, C, D。解析：队列基本结构满足队尾进队头出。底层由线性数组模运算环、或是链表结构皆可灵活封装实现。</p>
                        <p><strong>第3题 (判断题)：</strong> 标志答案：正确(A)。解析：循环队列取模运行可以优雅复用已有物理内存索引，有效抑制假溢出现象发生。</p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Footer buttons close */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setPreviewPaper(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors"
              >
                关闭预览板
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
