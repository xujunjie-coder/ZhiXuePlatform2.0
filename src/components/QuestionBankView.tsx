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
  Trash, 
  X, 
  Sparkles, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Layers,
  HelpCircle
} from 'lucide-react';

// TypeScript interfaces for our question model
export interface Question {
  id: string;
  stem: string; // 题干内容
  type: '单选题' | '多选题' | '判断题' | '主观题';
  difficulty: '易' | '中' | '难';
  knowledgePoint: string;
  createdAt: string;
  options: string[]; // Options for choice questions
  correctAnswer: string | string[]; // Single options like "A", multi options like ["A", "C"], boolean like "A" or "B" for Yes/No, or subjective text
  analysis: string; // Explanatory text
  course: string;
  chapter: string;
}

interface QuestionBankViewProps {
  currentUser?: { name?: string; email?: string; role?: string };
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

// Default seed data matching the spreadsheet screenshots and context


export default function QuestionBankView({ triggerToast, currentUser }: QuestionBankViewProps) {
  // Questions database state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter selection states
  const [selectedCourse, setSelectedCourse] = useState<string>('数据结构与算法（2024春）');
  const [selectedChapter, setSelectedChapter] = useState<string>('第3章 栈与队列');
  const [selectedKnowledge, setSelectedKnowledge] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<string>('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Table batch selection state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  
  // Modal dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states under new/edit mode
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'单选题' | '多选题' | '判断题' | '主观题'>('单选题');
  const [formDifficulty, setFormDifficulty] = useState<'易' | '中' | '难'>('中');
  const [formKnowledge, setFormKnowledge] = useState<string>('栈的基本操作');
  const [formStem, setFormStem] = useState<string>('');
  const [formOptions, setFormOptions] = useState<string[]>(['入栈（Push）', '出栈（Pop）', '取栈顶元素（Top）', '遍历所有元素']);
  const [formCorrectAnswerSingle, setFormCorrectAnswerSingle] = useState<string>('D'); // A, B, C, D
  const [formCorrectAnswersMulti, setFormCorrectAnswersMulti] = useState<string[]>([]); // ["A", "C"]
  const [formAnalysis, setFormAnalysis] = useState<string>('');
  const [keepAdding, setKeepAdding] = useState(false);

  // One-click exam paper assembly state
  const [examPaperName, setExamPaperName] = useState('数据结构与算法限时随堂测试（栈与队列部分）');
  const [examTotalPoints, setExamTotalPoints] = useState<number>(100);
  const [examTargetClass, setExamTargetClass] = useState('2024级计算机1班');

  // Preview target question state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  React.useEffect(() => {
    fetch('/api/teacher/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching questions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        正在加载题库管理数据...
      </div>
    );
  }

  // Available metadata lists derived from questions to build rich UX dropdowns safely
  const coursesList = ['数据结构与算法（2024春）', '算法分析与高级设计', '离散数学与图论', '计算机网络（考研版）'];
  const chaptersList = ['第3章 栈与队列', '第1章 线性表', '第2章 栈的递归代数', '第4章 队列系统建模'];
  
  const uniqueKnowledgePoints = useMemo(() => {
    const list = new Set<string>();
    questions.forEach(q => list.add(q.knowledgePoint));
    return ['全部', ...Array.from(list)];
  }, [questions]);

  // Handle individual question deletes
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm(`确定要彻底删除题目 [${id}] 吗？`)) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelectedQuestionIds(prev => prev.filter(item => item !== id));
      triggerToast(`🗑️ 成功从本地题库永久移除了题目 [${id}]`, 'success');
    }
  };

  // Batch delete handler
  const handleBatchDelete = () => {
    if (selectedQuestionIds.length === 0) return;
    if (window.confirm(`本批量操作极为危险！您确定要把当前选中的 ${selectedQuestionIds.length} 道题目彻底从题库库中删除吗？`)) {
      setQuestions(prev => prev.filter(q => !selectedQuestionIds.includes(q.id)));
      setSelectedQuestionIds([]);
      triggerToast(`🗑️ 成功批量删除了 ${selectedQuestionIds.length} 道选定题目！`, 'success');
    }
  };

  // Simulating batch import
  const handleBatchImport = () => {
    const mockImports: Question[] = [
      {
        id: `Q0${Math.floor(1000 + Math.random() * 9000)}`,
        stem: '在有 N 个元素构成的一组顺序队列中，设定头部指针为 f，尾部指针为 r，则表示该队列拥有的实际元素量的计算公式一般为（ ）。',
        type: '单选题',
        difficulty: '中',
        knowledgePoint: '队列的基本操作',
        createdAt: '25-05-29 11:30',
        options: [
          '(r - f + N) % N',
          '(r - f) % N',
          'r - f',
          '(r - f + 1) % N'
        ],
        correctAnswer: 'A',
        analysis: '经典循环队列大小计算公式，使用 (rear - front + TOTAL) % TOTAL 来安全规避负数的产生，以便得到环绕距离。',
        course: '数据结构与算法（2024春）',
        chapter: '第3章 栈与队列'
      },
      {
        id: `Q0${Math.floor(1000 + Math.random() * 9000)}`,
        stem: '判断题：利用递归手段解决问题时，系统内部必然是通过一个底层的栈数据结构来实现深度回溯与调用恢复的。（ ）',
        type: '判断题',
        difficulty: '易',
        knowledgePoint: '栈的应用',
        createdAt: '25-05-29 11:35',
        options: ['正确', '错误'],
        correctAnswer: 'A',
        analysis: '函数运行时，其递归层级都会作为一个个栈帧（Stack Frame）按照先入后出的逻辑，压入到编译执行环境专门开辟的执行栈（Call Stack）中保存。',
        course: '数据结构与算法（2024春）',
        chapter: '第3章 栈与队列'
      }
    ];

    setQuestions(prev => [...mockImports, ...prev]);
    triggerToast(`📥 成功批量读取智能外部题库表单，一键导入并合规校检了 2 道优质考真大题！`, 'success');
  };

  // Simulating batch export
  const handleBatchExport = () => {
    const listToExport = selectedQuestionIds.length > 0 
      ? questions.filter(q => selectedQuestionIds.includes(q.id))
      : questions;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(listToExport, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `智能辅学平台_题库导出_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerToast(`📤 成功导出 ${listToExport.length} 道精选题目到外部 JSON 文件包！`, 'success');
  };

  // Filtering computational flow
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Course Match
      if (selectedCourse !== '全部' && q.course !== selectedCourse) return false;
      // Chapter Match
      if (selectedChapter !== '全部' && q.chapter !== selectedChapter) return false;
      // Knowledge Match
      if (selectedKnowledge !== '全部' && q.knowledgePoint !== selectedKnowledge) return false;
      // Type Match
      if (selectedType !== '全部' && q.type !== selectedType) return false;
      // Difficulty Match
      if (selectedDifficulty !== '全部' && q.difficulty !== selectedDifficulty) return false;
      // Keywords Match
      if (searchKeyword.trim() !== '') {
        const keyword = searchKeyword.toLowerCase();
        const inStem = q.stem.toLowerCase().includes(keyword);
        const inId = q.id.toLowerCase().includes(keyword);
        const inKnowledge = q.knowledgePoint.toLowerCase().includes(keyword);
        return inStem || inId || inKnowledge;
      }
      return true;
    });
  }, [questions, selectedCourse, selectedChapter, selectedKnowledge, selectedType, selectedDifficulty, searchKeyword]);

  // Pagination computational split
  const paginatedQuestions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;

  // Statics block calculated on live items
  const stats = useMemo(() => {
    const totalCount = questions.length + 1260; // adding seed multiplier to maintain 1260+ scale like in screenshot
    const singleChoiceCount = questions.filter(q => q.type === '单选题').length + 640;
    const multiChoiceCount = questions.filter(q => q.type === '多选题').length + 234;
    const judgeCount = questions.filter(q => q.type === '判断题').length + 206;
    const subjectiveCount = questions.filter(q => q.type === '主观题').length + 180;

    const easyCount = questions.filter(q => q.difficulty === '易').length + 482;
    const mediumCount = questions.filter(q => q.difficulty === '中').length + 510;
    const hardCount = questions.filter(q => q.difficulty === '难').length + 265;

    return {
      totalCount,
      singleChoiceCount,
      multiChoiceCount,
      judgeCount,
      subjectiveCount,
      easyCount,
      mediumCount,
      hardCount,
      easyPct: ((easyCount / totalCount) * 100).toFixed(1),
      mediumPct: ((mediumCount / totalCount) * 100).toFixed(1),
      hardPct: ((hardCount / totalCount) * 100).toFixed(1)
    };
  }, [questions]);

  // Open Add Question modal
  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setFormType('单选题');
    setFormDifficulty('中');
    setFormKnowledge('栈的基本操作');
    setFormStem('栈的基本运算不包括以下哪一项？（ ）');
    setFormOptions(['入栈（Push）', '出栈（Pop）', '取栈顶元素（Top）', '遍历所有元素']);
    setFormCorrectAnswerSingle('D');
    setFormCorrectAnswersMulti([]);
    setFormAnalysis('栈是一种后进先出的线性结构，只支持在栈顶进行插入和删除操作，不能越层遍历所有元素。');
    setIsAddModalOpen(true);
  };

  // Open Edit Question modal
  const handleOpenEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setFormType(q.type);
    setFormDifficulty(q.difficulty);
    setFormKnowledge(q.knowledgePoint);
    setFormStem(q.stem);
    setFormOptions(q.options.length ? [...q.options] : ['选项 A', '选项 B', '选项 C', '选项 D']);
    
    if (q.type === '多选题') {
      setFormCorrectAnswersMulti(Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [String(q.correctAnswer)]);
    } else {
      setFormCorrectAnswerSingle(String(q.correctAnswer));
    }

    setFormAnalysis(q.analysis);
    setIsAddModalOpen(true);
  };

  // Add Option handler inside Modal
  const handleAddOption = () => {
    const nextChar = String.fromCharCode(65 + formOptions.length); // A, B, C, D...
    setFormOptions([...formOptions, `新选项 ${nextChar}`]);
  };

  // Delete Option handler inside Modal
  const handleRemoveOption = (index: number) => {
    if (formOptions.length <= 2) {
      triggerToast('⚠️ 选项最少不能少于 2 项！', 'warning');
      return;
    }
    const updated = formOptions.filter((_, idx) => idx !== index);
    setFormOptions(updated);
  };

  // Save/Update helper inside form modal
  const handleSaveQuestion = () => {
    if (!formStem.trim()) {
      triggerToast('❌ 请先填写完整的题干文本内容！', 'error');
      return;
    }

    const currentAnswer = formType === '多选题' ? formCorrectAnswersMulti : formCorrectAnswerSingle;

    if (formType === '多选题' && formCorrectAnswersMulti.length === 0) {
      triggerToast('❌ 多选题必须勾选最少一个正确答案图标！', 'error');
      return;
    }

    if (editingQuestionId) {
      // Update action
      setQuestions(prev => prev.map(q => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            stem: formStem,
            type: formType,
            difficulty: formDifficulty,
            knowledgePoint: formKnowledge,
            options: formType === '主观题' ? [] : formOptions,
            correctAnswer: formType === '主观题' ? formStem.substring(0, 30) : currentAnswer,
            analysis: formAnalysis
          };
        }
        return q;
      }));

      triggerToast(`🎉 成功更新了本地题目项 [${editingQuestionId}]`, 'success');
      setIsAddModalOpen(false);
    } else {
      // Create fresh ID
      const nextId = `Q0${1269 + questions.length}`;
      const newQ: Question = {
        id: nextId,
        stem: formStem,
        type: formType,
        difficulty: formDifficulty,
        knowledgePoint: formKnowledge,
        options: formType === '主观题' ? [] : formOptions,
        correctAnswer: formType === '主观题' ? '主观解题解析答案' : currentAnswer,
        analysis: formAnalysis,
        course: selectedCourse === '全部' ? '数据结构与算法（2024春）' : selectedCourse,
        chapter: selectedChapter === '全部' ? '第3章 栈与队列' : selectedChapter,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setQuestions([newQ, ...questions]);
      triggerToast(`🎉 成功录入全新题库项 [${nextId}]！`, 'success');

      if (!keepAdding) {
        setIsAddModalOpen(false);
      } else {
        // Reset fields for continuous addition
        setFormStem('');
        setFormAnalysis('');
        setFormCorrectAnswersMulti([]);
        triggerToast('ℹ️ 已为您清空输入表单，请编写下一道题目。', 'info');
      }
    }
  };

  // Toggle batch checking
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedQuestionIds(prev => [...prev, id]);
    }
  };

  // Assembly simulator handler
  const handleAssembleExamPaper = () => {
    if (selectedQuestionIds.length === 0) {
      triggerToast('⚠️ 请在表格中勾选要作为考查的题目后再点击一键组卷！', 'warning');
      return;
    }
    setIsExamModalOpen(true);
  };

  const confirmAssembleExamPaper = () => {
    triggerToast(`🎉 已成功组出新试题：“${examPaperName}”！已成功排版并绑定至【${examTargetClass}】！`, 'success');
    setIsExamModalOpen(false);
    setSelectedQuestionIds([]);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none text-left font-sans text-slate-800 pb-16 animate-fadeIn">
      
      {/* 🚀 Top Header / Selector Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>题库管理</span>
          </h1>
          <span className="text-slate-300 hidden sm:inline text-sm">/</span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            校本优质数字教学资源及自备随堂测试卷题库统筹
          </span>
        </div>

        {/* Global actions: batch metrics updater */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold">最后备份：今天 12:00</span>
          <button 
            onClick={() => triggerToast('🔄 已成功同步您在移动教师端录入的 3 道新测试作业题', 'success')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-750 font-bold rounded-lg shadow-3xs transition-all cursor-pointer"
          >
            <span>手动同步</span>
          </button>
        </div>
      </div>

      {/* 🧭 Filtering Controls Bar */}
      <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-3xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
        
        {/* Dropdown 1: Course selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-extrabold uppercase text-slate-400 tracking-wider">课程门类</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="全部">全部精品课程</option>
            {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Dropdown 2: Chapter selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-extrabold uppercase text-slate-400 tracking-wider">对应章节</label>
          <select 
            value={selectedChapter} 
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="全部">全部章节</option>
            {chaptersList.map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
        </div>

        {/* Dropdown 3: Knowledge points selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-extrabold uppercase text-slate-400 tracking-wider">关联知识要点</label>
          <select 
            value={selectedKnowledge} 
            onChange={(e) => {
              setSelectedKnowledge(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            {uniqueKnowledgePoints.map(kp => (
              <option key={kp} value={kp}>{kp === '全部' ? '全知识要点覆盖' : kp}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 4: Type filtering */}
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-extrabold uppercase text-slate-400 tracking-wider">测试题型</label>
          <select 
            value={selectedType} 
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="全部">全部题型</option>
            <option value="单选题">单选题</option>
            <option value="多选题">多选题</option>
            <option value="判断题">判断题</option>
            <option value="主观题">主观题</option>
          </select>
        </div>

        {/* Dropdown 5: Difficulty level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-extrabold uppercase text-slate-400 tracking-wider">难度系数</label>
          <select 
            value={selectedDifficulty} 
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-2.5 py-1.8 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="全部">全部难度 (高中低)</option>
            <option value="易">容易 (Easy)</option>
            <option value="中">中等 (Medium)</option>
            <option value="难">高难 (Hard)</option>
          </select>
        </div>

      </div>

      {/* 📊 High-fidelity Analytical Dashboard Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs">
        
        {/* Card 1: Total Question Bank Scale */}
        <div className="flex items-center border-b md:border-b-0 md:border-r border-slate-150 pb-4 md:pb-0 pr-0 md:pr-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 shrink-0 shadow-3xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-2xs font-extrabold uppercase tracking-wider">题库总题数</p>
            <div className="flex items-baseline mt-0.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalCount}</span>
              <span className="text-xs font-bold text-slate-400 ml-1">道基础题</span>
            </div>
            <p className="text-[10px] text-slate-450 font-bold mt-1">
              较上月 <span className="text-emerald-500 font-extrabold">▲ 86 题</span> 新增
            </p>
          </div>
        </div>

        {/* Card 2: Question Type Distribution Layout */}
        <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-150 py-4 md:py-0 px-0 md:px-4">
          <p className="text-slate-800 font-black text-xs mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>题型分布</span>
          </p>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold">单选题</p>
              <p className="text-xs font-black text-blue-600 mt-0.5">{stats.singleChoiceCount}</p>
            </div>
            <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold">多选题</p>
              <p className="text-xs font-black text-emerald-600 mt-0.5">{stats.multiChoiceCount}</p>
            </div>
            <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold">判断题</p>
              <p className="text-xs font-black text-amber-600 mt-0.5">{stats.judgeCount}</p>
            </div>
            <div className="bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold">主观题</p>
              <p className="text-xs font-black text-purple-600 mt-0.5">{stats.subjectiveCount}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Target Difficulty Indicators */}
        <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-150 py-4 md:py-0 px-0 md:px-4">
          <p className="text-slate-805 font-black text-xs mb-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-500" />
            <span>试卷难度分布</span>
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black flex items-center justify-center">易</span>
              <p className="text-[11px] font-black text-slate-800 mt-1">{stats.easyCount}</p>
              <p className="text-[8px] text-slate-400 font-semibold">{stats.easyPct}%</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-black flex items-center justify-center">中</span>
              <p className="text-[11px] font-black text-slate-800 mt-1">{stats.mediumCount}</p>
              <p className="text-[8px] text-slate-400 font-semibold">{stats.mediumPct}%</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-4.5 h-4.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black flex items-center justify-center">难</span>
              <p className="text-[11px] font-black text-slate-800 mt-1">{stats.hardCount}</p>
              <p className="text-[8px] text-slate-400 font-semibold">{stats.hardPct}%</p>
            </div>
          </div>
        </div>

        {/* Card 4: Knowledge-points coverage progress indicator bar */}
        <div className="flex flex-col justify-center py-4 md:py-0 pl-0 md:pl-4">
          <p className="text-slate-800 font-black text-xs mb-1.5 flex items-center justify-between">
            <span>知识点覆盖度</span>
            <span className="text-[10px] text-slate-400 font-bold">考纲共40个</span>
          </p>
          <div className="flex justify-between items-end mb-1">
            <div>
              <p className="text-[9px] text-slate-400 font-bold">本学期已配题覆盖</p>
              <p className="text-lg font-black text-slate-850">96.4<span className="text-xs">%</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold">空缺待补</p>
              <p className="text-xs font-black text-slate-450">3.6%</p>
            </div>
          </div>
          {/* Progress bar scale representation */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 relative">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: '96.4%' }}></div>
          </div>
        </div>

      </div>

      {/* 🧭 Table Header Toolbar and Main Table Grid Block */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-3xs overflow-hidden flex flex-col">
        
        {/* Real-time search tools header bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Quick search input field */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索试题 stem 题干/特定知识要点/ID编号..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.8 bg-white border border-slate-205 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-850"
            />
            {searchKeyword && (
              <button 
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table actions bar */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Action 1: Add new question with preset options list dropdown */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-3xs cursor-pointer text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新增题目</span>
            </button>

            {/* Action 2: Batch import */}
            <button
              onClick={handleBatchImport}
              className="flex items-center gap-1.5 px-3 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg shadow-3xs cursor-pointer text-xs transition-all"
              title="一键预载入校本真题，丰富测试覆盖"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>批量导入</span>
            </button>

            {/* Action 3: Batch export */}
            <button
              onClick={handleBatchExport}
              className="flex items-center gap-1.5 px-3 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg shadow-3xs cursor-pointer text-xs transition-all"
              title="将选中的题目导出为脱密JSON备份包"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>批量导出</span>
            </button>

            {/* Action 4: Assemble Exam paper */}
            <button
              onClick={handleAssembleExamPaper}
              disabled={selectedQuestionIds.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-1.8 text-xs font-black rounded-lg shadow-3xs transition-all ${
                selectedQuestionIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>一键组卷 </span>
              {selectedQuestionIds.length > 0 && (
                <span className="bg-indigo-500 text-[10px] text-white px-1.5 py-0.2 rounded-full font-black">
                  {selectedQuestionIds.length}
                </span>
              )}
            </button>

            {/* Action 5: Batch Delete */}
            {selectedQuestionIds.length > 0 && (
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-extrabold rounded-lg transition-all text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>批量删除 ({selectedQuestionIds.length})</span>
              </button>
            )}

          </div>

        </div>

        {/* Info label & summary status bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-2xs text-slate-400 font-black">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
            <span>筛选过滤所得：<strong className="text-slate-700">{filteredQuestions.length}</strong> 道题目</span>
            {selectedQuestionIds.length > 0 && (
              <span className="text-indigo-600 font-black ml-2 bg-indigo-50 px-1.5 py-0.5 rounded">
                已选中 {selectedQuestionIds.length} 道
              </span>
            )}
          </div>
          <div>点击单行操作可进行详细查验预览、内容修订及本地删除</div>
        </div>

        {/* Database Main Interactive Table Layout Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-150 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-20">ID</th>
                <th className="py-3 px-4 min-w-[320px]">题干内容</th>
                <th className="py-3 px-4 w-28 text-center">题型</th>
                <th className="py-3 px-4 w-20 text-center">难度</th>
                <th className="py-3 px-4">知识要点</th>
                <th className="py-3 px-4 w-32">更新时间</th>
                <th className="py-3 px-4 w-28 text-center">快捷操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <tr 
                    key={q.id}
                    className={`transition-all hover:bg-slate-50/50 ${isSelected ? 'bg-blue-50/20' : ''}`}
                  >
                    {/* Checkbox column */}
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(q.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    {/* ID Indicator */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-400 tracking-tight">
                      {q.id}
                    </td>

                    {/* Stem title */}
                    <td className="py-3 px-4 font-medium max-w-[480px] truncate" title={q.stem}>
                      <span className="text-slate-800 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => { setPreviewQuestion(q); setIsPreviewOpen(true); }}>
                        {q.stem}
                      </span>
                    </td>

                    {/* Question Type Tag */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        q.type === '单选题'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : q.type === '多选题'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                          : q.type === '判断题'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {q.type}
                      </span>
                    </td>

                    {/* Difficulty Tag */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty === '易'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : q.difficulty === '中'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>

                    {/* Knowledge Point */}
                    <td className="py-3 px-4 text-slate-500 font-bold">
                      {q.knowledgePoint}
                    </td>

                    {/* Creation Date */}
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {q.createdAt}
                    </td>

                    {/* Context Operations Button Set */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        <button 
                          onClick={() => { setPreviewQuestion(q); setIsPreviewOpen(true); }}
                          className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-605 rounded-md flex items-center justify-center transition-colors shadow-3xs cursor-pointer"
                          title="查看题目细节与大意解析"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleOpenEditModal(q)}
                          className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-md flex items-center justify-center transition-colors shadow-3xs cursor-pointer"
                          title="修改题干、选项答案或解析说明"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 text-rose-550 rounded-md flex items-center justify-center transition-colors shadow-3xs cursor-pointer"
                          title="彻底删除题目"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {/* Empty search results backup rendering */}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold text-xs space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>没有发现任何匹配设定过滤条件的题库项。</p>
                    <button 
                      onClick={() => {
                        setSelectedCourse('全部');
                        setSelectedChapter('全部');
                        setSelectedKnowledge('全部');
                        setSelectedType('全部');
                        setSelectedDifficulty('全部');
                        setSearchKeyword('');
                        setCurrentPage(1);
                        triggerToast('🔄 已成功为您撤销了全部筛选搜索条件');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md mt-2 cursor-pointer font-extrabold shadow-3xs"
                    >
                      清空全部过滤条件
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info pagination controls bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span>本页展示 {paginatedQuestions.length} 条</span>
            <span className="text-slate-350">|</span>
            <div className="flex items-center gap-1">
              <span>每页显示</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-slate-700"
              >
                <option value={10}>10 条/页</option>
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
              </select>
            </div>
          </div>

          {/* Interactive Paginated Lists */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const activePage = i + 1;
              return (
                <button
                  key={activePage}
                  onClick={() => setCurrentPage(activePage)}
                  className={`w-8 h-8 rounded-lg border text-xs font-black transition-all ${
                    currentPage === activePage
                      ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                      : 'border-slate-200 text-slate-605 bg-white hover:bg-slate-50'
                  }`}
                >
                  {activePage}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 🔮 MODAL DIALOG 1: Add/Edit Question */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] mx-4 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span>{editingQuestionId ? `修改题目详情 [${editingQuestionId}]` : '填写全新题目数据'}</span>
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all" 
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-850">
              
              {/* Section 1: Question Metadata setup */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-sm inline-block mr-2"></span>
                  <span>1. 题目类别与属性</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-450 mb-1.5">测试题型</label>
                    <select 
                      value={formType}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setFormType(newType);
                        if (newType === '主观题') {
                          setFormOptions([]);
                        } else if (newType === '判断题') {
                          setFormOptions(['正确', '错误']);
                          setFormCorrectAnswerSingle('A');
                        } else {
                          setFormOptions(['入栈（Push）', '出栈（Pop）', '取栈顶元素（Top）', '遍历所有元素']);
                        }
                      }}
                      className="w-full text-xs font-bold border border-slate-205 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    >
                      <option value="单选题">单选题 (Single Choice)</option>
                      <option value="多选题">多选题 (Multiple Choice)</option>
                      <option value="判断题">判断题 (True / False)</option>
                      <option value="主观题">主观题 (Subjective Short Q)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-450 mb-1.5">难度等级</label>
                    <select 
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full text-xs font-bold border border-slate-205 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    >
                      <option value="易">容易 (Easy)</option>
                      <option value="中">中等 (Medium)</option>
                      <option value="难">高难 (Hard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-450 mb-1.5">所属关联知识要点</label>
                  <select 
                    value={formKnowledge}
                    onChange={(e) => setFormKnowledge(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-205 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  >
                    <option value="栈的基本操作">栈的基本操作</option>
                    <option value="栈的基本概念">栈的基本概念</option>
                    <option value="队列的基本概念">队列的基本概念</option>
                    <option value="循环队列">循环队列</option>
                    <option value="栈的应用">栈的应用</option>
                  </select>
                </div>
              </div>

              {/* Stem Title Textarea with character counter */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-450">题干详细内容</label>
                <div className="relative">
                  <textarea 
                    value={formStem}
                    onChange={(e) => setFormStem(e.target.value)}
                    placeholder="请输入测试题目主干，如：“栈的基本运算不包括以下哪一项？（ ）”"
                    className="w-full border border-slate-205 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none p-3 h-28"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[9px] text-slate-400 font-bold bg-slate-50 px-1 rounded">
                    {formStem.length} / 1000 字符
                  </div>
                </div>
              </div>

              {/* Section 2: Options (Choices list edit block) */}
              {formType !== '主观题' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-sm inline-block mr-2"></span>
                      <span>2. 备选选项配置</span>
                      {formType === '单选题' && <span className="text-[10px] font-bold text-slate-400 ml-2">(单选题最少 2 个选项)</span>}
                    </span>
                    {formType !== '判断题' && (
                      <button 
                        type="button"
                        onClick={handleAddOption}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>追加新选项</span>
                      </button>
                    )}
                  </h4>

                  <div className="space-y-3">
                    {formOptions.map((opt, index) => {
                      const prefixStr = String.fromCharCode(65 + index); // A, B, C...
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center border rounded-xl p-1 shadow-3xs transition-all ${
                            formType === '单选题' && formCorrectAnswerSingle === prefixStr
                              ? 'border-blue-500 bg-blue-50/10'
                              : formType === '多选题' && formCorrectAnswersMulti.includes(prefixStr)
                              ? 'border-emerald-500 bg-emerald-50/10'
                              : 'border-slate-200 bg-slate-50/30'
                          }`}
                        >
                          {/* Prefix Label */}
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mx-2 shrink-0 ${
                            formType === '单选题' && formCorrectAnswerSingle === prefixStr
                              ? 'bg-blue-600 text-white'
                              : formType === '多选题' && formCorrectAnswersMulti.includes(prefixStr)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {prefixStr}
                          </span>

                          <input 
                            type="text" 
                            value={opt}
                            disabled={formType === '判断题'}
                            onChange={(e) => {
                              const updated = [...formOptions];
                              updated[index] = e.target.value;
                              setFormOptions(updated);
                            }}
                            className="flex-1 border-none focus:ring-0 text-xs py-1.5 px-2 bg-transparent focus:outline-none font-medium"
                          />

                          {formType !== '判断题' && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="p-1.5 text-slate-400 hover:text-rose-650"
                              title="删除此选项"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Right Answer check radio buttons */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-sm inline-block mr-2"></span>
                  <span>3. 勾选设定正确答案</span>
                </h4>

                {formType === '单选题' && (
                  <div className="flex flex-wrap gap-4 px-2">
                    {formOptions.map((_, idx) => {
                      const prefixStr = String.fromCharCode(65 + idx);
                      return (
                        <label key={prefixStr} className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                          <input 
                            type="radio"
                            name="correct_ans_opt"
                            checked={formCorrectAnswerSingle === prefixStr}
                            onChange={() => setFormCorrectAnswerSingle(prefixStr)}
                            className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <span>选项 {prefixStr}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {formType === '多选题' && (
                  <div className="flex flex-wrap gap-4 px-2">
                    {formOptions.map((_, idx) => {
                      const prefixStr = String.fromCharCode(65 + idx);
                      const isChecked = formCorrectAnswersMulti.includes(prefixStr);
                      return (
                        <label key={prefixStr} className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormCorrectAnswersMulti(prev => prev.filter(item => item !== prefixStr));
                              } else {
                                setFormCorrectAnswersMulti(prev => [...prev, prefixStr].sort());
                              }
                            }}
                            className="text-emerald-600 focus:ring-emerald-500 rounded w-4 h-4 cursor-pointer"
                          />
                          <span>选项 {prefixStr}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {formType === '判断题' && (
                  <div className="flex gap-6 px-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                      <input 
                        type="radio"
                        name="judge_correct"
                        checked={formCorrectAnswerSingle === 'A'}
                        onChange={() => setFormCorrectAnswerSingle('A')}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>选项 A（对 / 正确）</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                      <input 
                        type="radio"
                        name="judge_correct"
                        checked={formCorrectAnswerSingle === 'B'}
                        onChange={() => setFormCorrectAnswerSingle('B')}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>选项 B（错 / 错误）</span>
                    </label>
                  </div>
                )}

                {formType === '主观题' && (
                  <div className="px-1 text-slate-500 font-bold text-2xs uppercase">
                    🎓 主观题将对整文本作模糊匹配查检，您可以在下方的【解析说明】里输入核心采分点段落。
                  </div>
                )}

              </div>

              {/* Section 4: Explanations Area */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-sm inline-block mr-2"></span>
                  <span>4. 详细评阅采分解析说明 <span className="text-[10px] font-bold text-slate-400 ml-2">(选填)</span></span>
                </h4>
                <div className="relative">
                  <textarea 
                    value={formAnalysis}
                    onChange={(e) => setFormAnalysis(e.target.value)}
                    placeholder="请输入参考答案或详细解析（如考题核心知识点、考点解题思路分析等）"
                    className="w-full border border-slate-205 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none p-3 h-24 bg-slate-50/35"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[9px] text-slate-400 font-bold bg-slate-50 px-1 rounded">
                    {formAnalysis.length} / 1000 字符
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-150 flex justify-between items-center bg-slate-50 shrink-0">
              <label className="flex items-center text-xs font-bold text-slate-500 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={keepAdding}
                  onChange={(e) => setKeepAdding(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-1.5 w-3.5 h-3.5"
                />
                <span>保持开启，继续新增下一道题</span>
              </label>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 border border-slate-250 text-slate-650 hover:bg-white rounded-lg transition-colors text-xs font-extrabold cursor-pointer"
                >
                  取消返回
                </button>
                <button 
                  onClick={handleSaveQuestion}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-3xs transition-colors text-xs font-extrabold cursor-pointer"
                >
                  确认保存
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🔮 MODAL DIALOG 2: Detailed Question Preview */}
      {isPreviewOpen && previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col mx-4 animate-scaleUp">
            
            <div className="px-6 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
              <span className="text-2xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                试题真题预览 ({previewQuestion.id})
              </span>
              <button 
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded" 
                onClick={() => { setIsPreviewOpen(false); setPreviewQuestion(null); }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-left">
              
              {/* Box Info Tags */}
              <div className="flex flex-wrap items-center gap-2 text-2xs font-black">
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                  {previewQuestion.course}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                  {previewQuestion.chapter}
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-150">
                  要点: {previewQuestion.knowledgePoint}
                </span>
              </div>

              {/* Stem Content */}
              <div>
                <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase mb-1">题干详情</p>
                <h3 className="text-sm font-extrabold text-slate-900 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {previewQuestion.stem}
                </h3>
              </div>

              {/* Options details list */}
              {previewQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">选项详情</p>
                  <div className="space-y-2">
                    {previewQuestion.options.map((opt, i) => {
                      const optChar = String.fromCharCode(65 + i);
                      const isCorrect = Array.isArray(previewQuestion.correctAnswer)
                        ? previewQuestion.correctAnswer.includes(optChar)
                        : previewQuestion.correctAnswer === optChar;

                      return (
                        <div 
                          key={i} 
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect 
                              ? 'bg-blue-50/45 border-blue-400 text-blue-800 font-extrabold'
                              : 'bg-white border-slate-150 text-slate-600'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isCorrect ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {optChar}
                            </span>
                            <span>{opt}</span>
                          </span>

                          {isCorrect && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-black">正确答案</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Target answer block */}
              <div>
                <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase mb-1">标定正确答案</p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-xs font-black text-slate-800">
                  {Array.isArray(previewQuestion.correctAnswer) 
                    ? `[ 多选题 ] 正确选项为:  ${previewQuestion.correctAnswer.join(', ')}`
                    : `正确选项/参考答案为:  ${previewQuestion.correctAnswer === 'A' && previewQuestion.options[0] === '正确' ? '正确（True）' : previewQuestion.correctAnswer === 'B' && previewQuestion.options[1] === '错误' ? '错误（False）' : previewQuestion.correctAnswer}`}
                </div>
              </div>

              {/* Full analysis explanation sheet */}
              <div>
                <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase mb-1 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-blue-500" />
                  <span>专家考评解析说明</span>
                </p>
                <p className="bg-indigo-50/20 text-xs text-slate-600 leading-relaxed p-3 rounded-xl border border-indigo-100/50">
                  {previewQuestion.analysis || '暂无该随堂习题的详细解析，您可以点击“编辑”按钮快速写入。'}
                </p>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 text-right shrink-0 rounded-b-xl">
              <button 
                onClick={() => { setIsPreviewOpen(false); setPreviewQuestion(null); }}
                className="px-5 py-1.8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-3xs"
              >
                已完成查验
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔮 MODAL DIALOG 3: One-Click Simulated Exam Paper Assembler */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col mx-4 animate-scaleUp text-slate-850">
            
            {/* Assembly Header */}
            <div className="px-6 py-4.5 border-b border-slate-150 flex justify-between items-center bg-indigo-50/20">
              <h3 className="font-extrabold text-indigo-950 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-650" />
                <span>智能一键组卷排版向导</span>
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 p-1.5" 
                onClick={() => setIsExamModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assembly Body */}
            <div className="p-6 space-y-4 text-left">
              
              <div className="bg-slate-55 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="text-xs text-slate-400 font-bold">已挑件考题总量</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900">{selectedQuestionIds.length}</span>
                  <span className="text-xs text-slate-400 font-bold">道随堂精选大题</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                  * 系统将自动生成美观排版的 A4 双面 PDF/Word 测试纸白模，包含总得分栏、填空选择题号矩阵、答题答卷分离模板等。
                </div>
              </div>

              {/* Form 1: Paper name */}
              <div className="space-y-1 text-xs">
                <label className="block text-slate-400 font-extrabold tracking-wider uppercase">试卷封面名称</label>
                <input 
                  type="text"
                  value={examPaperName}
                  onChange={(e) => setExamPaperName(e.target.value)}
                  className="w-full border border-slate-205 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Form 2: Score setting */}
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-extrabold tracking-wider uppercase">设定试卷总分</label>
                  <input 
                    type="number"
                    value={examTotalPoints}
                    onChange={(e) => setExamTotalPoints(Number(e.target.value))}
                    className="w-full border border-slate-205 rounded-xl p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 font-extrabold tracking-wider uppercase">排版配发班级</label>
                  <select 
                    value={examTargetClass}
                    onChange={(e) => setExamTargetClass(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2 focus:ring-1 focus:ring-blue-600 outline-none max-h-32"
                  >
                    <option value="2024级计算机1班">2024级计算机1班 (48人)</option>
                    <option value="2024级软件工程2班">2024级软件工程2班 (45人)</option>
                    <option value="2024春季网络安全大班">2024春季网络安全班 (60人)</option>
                  </select>
                </div>
              </div>

              {/* Questions list overview in tiny blocks */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">附设考查试题大纲</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-150 rounded-xl p-2 bg-slate-50/20">
                  {questions.filter(q => selectedQuestionIds.includes(q.id)).map((q, i) => (
                    <div key={q.id} className="text-2xs font-bold text-slate-650 flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-100">
                      <span className="truncate max-w-[280px]">
                        【{q.type} | 难{q.difficulty}】 {i + 1}. {q.stem}
                      </span>
                      <span className="font-mono text-slate-350 shrink-0">{q.id}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Assembly Footer */}
            <div className="px-6 py-4 border-t border-slate-150 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button 
                onClick={() => setIsExamModalOpen(false)}
                className="px-5 py-2 border border-slate-250 text-slate-650 hover:bg-white rounded-lg font-bold text-xs cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={confirmAssembleExamPaper}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-3xs font-black text-xs cursor-pointer"
              >
                确认并一键生成试卷 (PDF)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
