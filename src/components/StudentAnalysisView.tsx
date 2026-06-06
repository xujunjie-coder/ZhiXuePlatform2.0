import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  FileSpreadsheet, 
  FileDown, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  Hand, 
  MessageSquare, 
  Bot, 
  Lightbulb, 
  BookOpen, 
  Printer, 
  Award,
  AlertTriangle,
  X,
  Sparkles,
  Search,
  Check,
  TrendingUp,
  FileText,
  Play,
  Heart,
  Briefcase,
  Layers,
  ThumbsUp,
  BookMarked
} from 'lucide-react';

interface StudentAnalysisViewProps {
  currentUser?: { name?: string; email?: string; role?: string };
  triggerToast: (msg: string) => void;
}

interface StudentData {
  id: string;
  name: string;
  gender: 'male' | 'female';
  studentNo: string;
  className: string;
  avatarUrl: string;
  metrics: {
    totalLearningHours: number;
    hoursRank: number;
    learningProgressPct: number;
    chaptersLearned: number;
    totalChapters: number;
    overallScore: number;
    scoreRank: number;
    attendanceRate: number;
    presentCount: number;
    totalCount: number;
  };
  radarChartData: Array<{ name: string; score: number; colorClass: string }>;
  homeworkPerformance: {
    submitRate: number;
    submittedCount: number;
    totalCount: number;
    hwAvgScore: number;
    quizAvgScore: number;
    recentScores: Array<{
      type: '作业' | '测验';
      title: string;
      date: string;
      score: number;
    }>;
  };
  wrongQuestionsStats: {
    totalWrongCount: number;
    categories: Array<{
      name: string;
      pct: number;
      count: number;
      color: string;
      colorClass: string;
    }>;
    topWrong: Array<{
      id: number;
      title: string;
      errorCount: number;
    }>;
  };
  behaviorAnalysis: {
    classroomInteractionCount: number;
    interactionRank: number;
    classroomQuestionsCount: number;
    questionsRank: number;
    resourceLearningHours: number;
    slidesHours: number;
    animationHours: number;
    downloadCount: number;
    downloadRank: number;
  };
  attendanceGrid: Array<'present' | 'late' | 'leave' | 'absent'>;
  aiSuggestions: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  learningTrajectory: Array<{
    date: string;
    type: string;
    title: string;
    durationOrScore: string;
    color: string;
    icon: string;
  }>;
}

const STUDENTS_DATABASE: Record<string, StudentData> = {
  xiaoming: {
    id: 'xiaoming',
    name: '张晓明',
    gender: 'male',
    studentNo: '2024010101',
    className: '2024级计算机1班',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtJ-gM2EK7zWQZu9gKsOIx3lIHA6kS6g9KFVEi9V6l_ekcYxWfY9HGm6lcgW51PgNnEE5EbwLtXFOZSqxbXWqRQy2XfSj6AWZSYmEHlu5Rkj8gv9cmXrTL4IEZwQptWVjWiVisbafNxVtV23ucndVlAfRaiBfnClf69L5uNvfaUGcwTjVk9BzBlrCXKS0kwARidKfB6RW3ZsYj5-jo2qc8nisKdcEcRNt-ZQau7UINtf3ZfOrjJXKRlPyr09YX9R_3-XkpFImaqqM',
    metrics: {
      totalLearningHours: 28.6,
      hoursRank: 12,
      learningProgressPct: 78,
      chaptersLearned: 7,
      totalChapters: 9,
      overallScore: 72,
      scoreRank: 18,
      attendanceRate: 90,
      presentCount: 18,
      totalCount: 20
    },
    radarChartData: [
      { name: '1. 绪论', score: 85, colorClass: 'text-emerald-500' },
      { name: '2. 线性表', score: 90, colorClass: 'text-emerald-500' },
      { name: '3. 栈与队列', score: 76, colorClass: 'text-amber-500' },
      { name: '4. 树与二叉树', score: 45, colorClass: 'text-red-500' },
      { name: '5. 图', score: 60, colorClass: 'text-amber-500' },
      { name: '7. 查找算法', score: 82, colorClass: 'text-emerald-500' },
      { name: '8. 动态规划', score: 55, colorClass: 'text-amber-500' },
      { name: '9. 字符串匹配', score: 40, colorClass: 'text-red-500' }
    ],
    homeworkPerformance: {
      submitRate: 92,
      submittedCount: 11,
      totalCount: 12,
      hwAvgScore: 78.6,
      quizAvgScore: 74.3,
      recentScores: [
        { type: '作业', title: '第9章 树与二叉树习题', date: '2024-05-20', score: 80 },
        { type: '测验', title: '第8章测验', date: '2024-05-18', score: 70 },
        { type: '作业', title: '第8章 图习题', date: '2024-05-13', score: 85 },
        { type: '测验', title: '第7章测验', date: '2024-05-10', score: 60 }
      ]
    },
    wrongQuestionsStats: {
      totalWrongCount: 45,
      categories: [
        { name: '概念理解错误', pct: 42, count: 19, color: '#3b82f6', colorClass: 'bg-blue-500' },
        { name: '计算错误', pct: 29, count: 13, color: '#facc15', colorClass: 'bg-yellow-400' },
        { name: '思路应用错误', pct: 18, count: 8, color: '#34d399', colorClass: 'bg-emerald-400' },
        { name: '粗心错误', pct: 11, count: 5, color: '#f87171', colorClass: 'bg-red-400' }
      ],
      topWrong: [
        { id: 1, title: '在二叉树中，结点数为n，则边数为？', errorCount: 12 },
        { id: 2, title: '关于DFS和BFS，下列说法错误的是？', errorCount: 9 },
        { id: 3, title: '动态规划中最优子结构的理解', errorCount: 7 }
      ]
    },
    behaviorAnalysis: {
      classroomInteractionCount: 28,
      interactionRank: 15,
      classroomQuestionsCount: 5,
      questionsRank: 20,
      resourceLearningHours: 12.4,
      slidesHours: 8.7,
      animationHours: 3.7,
      downloadCount: 16,
      downloadRank: 10
    },
    attendanceGrid: [
      'present', 'present', 'present', 'present', 'present', 
      'present', 'present', 'present', 'leave', 'present'
    ],
    aiSuggestions: [
      {
        id: 1,
        title: '加强薄弱知识点：树与二叉树、字符匹配、动态规划',
        description: '建议复习相关章节，在线观看带有3D交互的高质量动画详解，加深指针变换时的空间思维运作。'
      },
      {
        id: 2,
        title: '针对性自适应训练',
        description: '重点完成「树与二叉树专项层序迭代练习」和「动态规划滚动数组优化基础高频考题」。'
      },
      {
        id: 3,
        title: '提升大题调试解题能力',
        description: '多做涵盖后序递归重构、LCA公共祖先综合应用题，加强编译调试并多总结异常分支。'
      }
    ],
    learningTrajectory: [
      { date: '05-24 20:15', type: '观看视频', title: '第9章 动态规划_01', durationOrScore: '32分钟', color: 'bg-blue-105 text-blue-600', icon: 'play' },
      { date: '05-24 19:30', type: '完成测验', title: '第9章测验', durationOrScore: '成绩: 80分', color: 'bg-purple-50 text-purple-600', icon: 'test' },
      { date: '05-23 21:10', type: '学习课件', title: '第9章 课件资料', durationOrScore: '45分钟', color: 'bg-emerald-50 text-emerald-600', icon: 'book' },
      { date: '05-22 18:40', type: '提交作业', title: '第9章 动态决策习题', durationOrScore: '成绩: 80分', color: 'bg-blue-105 text-blue-600', icon: 'hw' },
      { date: '05-21 20:05', type: '观看视频', title: '第8章 图的深度便利', durationOrScore: '28分钟', color: 'bg-blue-105 text-blue-600', icon: 'play' },
      { date: '05-20 19:20', type: '参与讨论', title: '图的最短路径迪杰斯特拉', durationOrScore: '互动 2 次', color: 'bg-amber-50 text-amber-600', icon: 'chat' }
    ]
  },
  lilei: {
    id: 'lilei',
    name: '李雷',
    gender: 'male',
    studentNo: '2024010102',
    className: '2024级计算机1班',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3rh-sXphfPxUvFNgV0aBnP5Fhk-HU5WOGNMu38QPfX3ECedAKE9YXXG-YVD6G2ReE4TamK2CWXxd-CDtGB9i3AllicuFQZ9wUxrtJ9Ms9dJAt5LPEXrdEeS1r1vfQn6T49rf09MlDLwx0s4W1RE3gJHOzc-6VingrmpRHOIrmY6nKxYHRb69ZXFeMI5yJLobOaWEaGBxj_NlQUPx5uxvxWoxtsvJLCc8_dQEPEZNErMwz8OLWl043hJFNR7sKLC1RF61tZCF0gC4',
    metrics: {
      totalLearningHours: 42.1,
      hoursRank: 3,
      learningProgressPct: 95,
      chaptersLearned: 9,
      totalChapters: 9,
      overallScore: 91,
      scoreRank: 2,
      attendanceRate: 100,
      presentCount: 20,
      totalCount: 20
    },
    radarChartData: [
      { name: '1. 绪论', score: 98, colorClass: 'text-emerald-500' },
      { name: '2. 线性表', score: 95, colorClass: 'text-emerald-500' },
      { name: '3. 栈与队列', score: 92, colorClass: 'text-emerald-500' },
      { name: '4. 树与二叉树', score: 88, colorClass: 'text-emerald-500' },
      { name: '5. 图', score: 90, colorClass: 'text-emerald-500' },
      { name: '7. 查找算法', score: 94, colorClass: 'text-emerald-500' },
      { name: '8. 动态规划', score: 85, colorClass: 'text-emerald-500' },
      { name: '9. 字符串匹配', score: 78, colorClass: 'text-amber-500' }
    ],
    homeworkPerformance: {
      submitRate: 100,
      submittedCount: 12,
      totalCount: 12,
      hwAvgScore: 94.6,
      quizAvgScore: 89.8,
      recentScores: [
        { type: '作业', title: '第10章 综合训练习题', date: '2024-05-24', score: 100 },
        { type: '作业', title: '第9章 树与二叉树强算法', date: '2024-05-22', score: 96 },
        { type: '测验', title: '第8章测验', date: '2024-05-18', score: 90 },
        { type: '作业', title: '第8章 图习题', date: '2024-05-13', score: 98 }
      ]
    },
    wrongQuestionsStats: {
      totalWrongCount: 15,
      categories: [
        { name: '概念理解错误', pct: 20, count: 3, color: '#3b82f6', colorClass: 'bg-blue-500' },
        { name: '计算错误', pct: 27, count: 4, color: '#facc15', colorClass: 'bg-yellow-400' },
        { name: '思路应用错误', pct: 33, count: 5, color: '#34d399', colorClass: 'bg-emerald-400' },
        { name: '粗心错误', pct: 20, count: 3, color: '#f87171', colorClass: 'bg-red-400' }
      ],
      topWrong: [
        { id: 1, title: '网络多播路由算法中DFS与BFS有向连通底段实现', errorCount: 3 },
        { id: 2, title: '强连通分量Tarjan复杂回路边界深度遍历测试', errorCount: 2 },
        { id: 3, title: '字符串KMP算法失配指针深度回溯规律推导', errorCount: 2 }
      ]
    },
    behaviorAnalysis: {
      classroomInteractionCount: 64,
      interactionRank: 1,
      classroomQuestionsCount: 16,
      questionsRank: 2,
      resourceLearningHours: 22.8,
      slidesHours: 14.5,
      animationHours: 8.3,
      downloadCount: 29,
      downloadRank: 3
    },
    attendanceGrid: [
      'present', 'present', 'present', 'present', 'present', 
      'present', 'present', 'present', 'present', 'present'
    ],
    aiSuggestions: [
      {
        id: 1,
        title: '高阶重难考点拔高演练',
        description: '建议开始深度接触并熟读考研或算法竞赛级「网络流最大流算法、多路分支后缀三叉树构造、Tarjan缩点拓扑」等考点知识。'
      },
      {
        id: 2,
        title: '担任学助参与同伴互助讨论',
        description: '鼓励引导该生在班级答疑圈中担任高频出镜的互助辅学者，解答其他薄弱同学对经典二叉树遍历回溯方法的卡点提问。'
      },
      {
        id: 3,
        title: '极客推荐自主阅读书目与 OJ 大赛',
        description: '配套下发「大厂综合架构实操算卷、ACM/ICPC星级常考题海汇编」，并鼓励其组队参加暑期大专院校算法邀请赛。'
      }
    ],
    learningTrajectory: [
      { date: '05-25 10:10', type: '参与讨论', title: 'Tarjan算法连通性判定定理的高效证明', durationOrScore: '互动 5 次', color: 'bg-amber-50 text-amber-600', icon: 'chat' },
      { date: '05-24 23:15', type: '提交作业', title: '第10章 综合训练习题', durationOrScore: '成绩: 100分', color: 'bg-blue-105 text-blue-600', icon: 'hw' },
      { date: '05-23 22:45', type: '观看视频', title: '第10章 串与匹配原理拓展_02', durationOrScore: '55分钟', color: 'bg-blue-105 text-blue-600', icon: 'play' },
      { date: '05-22 19:10', type: '提交作业', title: '第9章 树与二叉树强算法大题', durationOrScore: '成绩: 96分', color: 'bg-blue-105 text-blue-600', icon: 'hw' },
      { date: '05-20 20:00', type: '观看视频', title: '第9章 动态规划决策树剪枝', durationOrScore: '42分钟', color: 'bg-blue-105 text-blue-600', icon: 'play' }
    ]
  }
};

export default function StudentAnalysisView({ currentUser, triggerToast }: StudentAnalysisViewProps) {
  const [activeStudentKey, setActiveStudentKey] = useState<string>('xiaoming');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const student = STUDENTS_DATABASE[activeStudentKey] || STUDENTS_DATABASE.xiaoming;

  const handleExport = () => {
    setIsDownloading(true);
    triggerToast(`📊 正在生成「${student.name}」春季档学情多维云端画像分析大包...`);
    setTimeout(() => {
      setIsDownloading(false);
      triggerToast(`🎉 成功下载「${student.name} _全景学情分析档案.pdf」！`);
    }, 1800);
  };

  // SVG trigonometry radar chart calculations
  const numAxes = student.radarChartData.length;
  const radarRadiusFraction = 65; // Matches percentage layout
  const w = 320;
  const h = 300;
  const centerX = w / 2;
  const centerY = h / 2;
  const maxR = 85; 

  // Compute angles for radar indicators
  const getAngle = (i: number) => {
    return i * (2 * Math.PI / numAxes) - Math.PI / 2;
  };

  // 4 nested concentric decagons representing grid scales (25%, 50%, 75%, 100%)
  const concentricRings = [25, 50, 75, 100];

  // Path string for rings
  const getRingPath = (pct: number) => {
    const r = (pct / 100) * maxR;
    const points: string[] = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = getAngle(i);
      const px = centerX + r * Math.cos(angle);
      const py = centerY + r * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return points.join(' ') + ' ' + points[0]; // Polygon needs open closed loop
  };

  // Student score coordinates path
  const getStudentPolygonPath = () => {
    const points: string[] = [];
    student.radarChartData.forEach((item, i) => {
      const angle = getAngle(i);
      const r = (item.score / 100) * maxR;
      const px = centerX + r * Math.cos(angle);
      const py = centerY + r * Math.sin(angle);
      points.push(`${px},${py}`);
    });
    return points.join(' ');
  };

  // Wrong categories doughnut computations
  // Donut uses standard circle of r=15.915, circum = 100
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none text-left font-sans text-slate-800 pb-16 animate-fadeIn">
      
      {/* Profile Overview Card with statistics overview */}
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-150 p-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
        
        {/* Left User avatar + details box */}
        <div className="flex items-center gap-5 pr-0 xl:pr-8 xl:border-r border-slate-100 min-w-xs justify-center sm:justify-start">
          <div className="relative shrink-0">
            <img 
              alt="Student Avatar" 
              className="w-20 h-20 rounded-full border-4 border-white shadow-xs bg-slate-50 object-cover" 
              src={student.avatarUrl}
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-1.5 right-1.5 bg-blue-100 flex items-center justify-center p-1 rounded-full text-blue-600 shadow-3xs border border-white">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{student.name}</h2>
              <span className="text-[10px] font-extrabold text-blue-650 bg-blue-50/70 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                在读
              </span>
            </div>
            
            <div className="text-xs text-slate-450 font-bold space-y-0.5 text-center sm:text-left mb-2">
              <p>学号: {student.studentNo}</p>
              <p>班级: {student.className}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={activeStudentKey}
                onChange={(e) => {
                  setActiveStudentKey(e.target.value);
                  triggerToast(`已成功为您加载新学生学情档案：${STUDENTS_DATABASE[e.target.value].name}`);
                }}
                className="border border-slate-200 bg-slate-50 py-1 px-1.5 text-[11px] font-bold text-slate-700 rounded-lg focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                title="选择查看不同的学生学情档案"
              >
                <option value="xiaoming">切换学生: 张晓明</option>
                <option value="lilei">切换学生: 李雷</option>
              </select>

              <button 
                onClick={handleExport}
                disabled={isDownloading}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg text-[11px] shadow-3xs transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
                <span>导出报告</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Main statistics overview badges */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 px-0 xl:px-8 mt-4 xl:mt-0">
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-50/70 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">总学习时长</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-xl font-black text-slate-850">{student.metrics.totalLearningHours}</span>
                <span className="text-xs font-bold text-slate-400">小时</span>
              </div>
              <p className="text-[9px] text-slate-405 font-medium mt-1">班级排名 <span className="text-blue-600 font-extrabold">{student.metrics.hoursRank}</span> / 48</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-50/70 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">学习进度</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-xl font-black text-slate-850">{student.metrics.learningProgressPct}</span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[9px] text-slate-405 font-medium mt-1">已学 <span className="text-slate-800 font-bold">{student.metrics.chaptersLearned}</span> / {student.metrics.totalChapters} 章</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-50/70 flex items-center justify-center text-amber-600 shrink-0">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">整体掌握度</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-xl font-black text-slate-850">{student.metrics.overallScore}</span>
                <span className="text-xs font-bold text-slate-400">分</span>
              </div>
              <p className="text-[9px] text-slate-405 font-medium mt-1">班级排名 <span className="text-amber-600 font-extrabold">{student.metrics.scoreRank}</span> / 48</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pl-0 md:pl-5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
            <div className="w-11 h-11 rounded-full bg-pink-50/70 flex items-center justify-center text-pink-500 shrink-0">
              <CheckCircle className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wide">出勤率</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-xl font-black text-slate-850">{student.metrics.attendanceRate}</span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[9px] text-slate-405 font-medium mt-1">到课 {student.metrics.presentCount} 次 / 应到 {student.metrics.totalCount} 次</p>
            </div>
          </div>

        </div>

      </div>

      {/* Grid Row 1: Radar Mastery, Recent Homeworks, and Mistakes Pie Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Radar Chart Module */}
        <div className="bg-white rounded-2xl shadow-3xs border border-slate-150 p-6 flex flex-col hover:shadow-2xs transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-sm">知识点掌握情况</h3>
            <select 
              value={selectedChapter} 
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                triggerToast('已为您过滤特定的深度章节知识层级模型视角。');
              }}
              className="text-[10px] border border-slate-200 rounded-md py-1 px-2.5 font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              <option value="all">按章节查看所有</option>
              <option value="core">核心突破章节</option>
            </select>
          </div>

          <div className="flex gap-4 text-[9px] text-slate-450 font-bold justify-center mb-1">
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>已掌握 (&gt;=80%)</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>中等 (50%~80%)</div>
            <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>薄弱 (&lt;50%)</div>
          </div>

          {/* High Fidelity Native SVG Radar Chart inside React */}
          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center relative py-4">
            <svg width={w} height={h} className="overflow-visible">
              {/* 1. Background rings & nested polygons */}
              {concentricRings.map((pct) => (
                <polygon
                  key={pct}
                  points={getRingPath(pct)}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={pct === 100 ? "none" : "2,3"}
                />
              ))}

              {/* 2. Spoke lines representing axes */}
              {student.radarChartData.map((item, i) => {
                const angle = getAngle(i);
                const px = centerX + maxR * Math.cos(angle);
                const py = centerY + maxR * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={px}
                    y2={py}
                    stroke="#ebdfff"
                    strokeWidth="1.2"
                    className="opacity-50"
                  />
                );
              })}

              {/* 3. Concentric grid guide distance markings */}
              <text x={centerX} y={centerY - maxR * 0.25} textAnchor="middle" className="text-[7px] font-bold fill-slate-300 pointer-events-none">25%</text>
              <text x={centerX} y={centerY - maxR * 0.50} textAnchor="middle" className="text-[7px] font-bold fill-slate-300 pointer-events-none">50%</text>
              <text x={centerX} y={centerY - maxR * 0.75} textAnchor="middle" className="text-[7px] font-bold fill-slate-300 pointer-events-none">75%</text>
              <text x={centerX} y={centerY - maxR + 5} textAnchor="middle" className="text-[7px] font-black fill-slate-400 pointer-events-none">100%</text>

              {/* 4. Student performance polygon data overlay */}
              <polygon
                points={getStudentPolygonPath()}
                fill="rgba(16, 185, 129, 0.16)"
                stroke="#10b981"
                strokeWidth="2.5"
                className="transition-all duration-700 ease-in-out"
              />

              {/* 5. Draw dots on the outer coordinates */}
              {student.radarChartData.map((item, i) => {
                const angle = getAngle(i);
                const r = (item.score / 100) * maxR;
                const px = centerX + r * Math.cos(angle);
                const py = centerY + r * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r="4.5"
                    className={`transition-all duration-700 ease-in-out cursor-pointer hover:scale-150`}
                    fill={item.score >= 80 ? "#10b981" : item.score >= 50 ? "#f59e0b" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  >
                    <title>{`${item.name}: ${item.score}%`}</title>
                  </circle>
                );
              })}

              {/* 6. Dynamic Colored Labels */}
              {student.radarChartData.map((item, i) => {
                const angle = getAngle(i);
                const labelDist = maxR + 18;
                const px = centerX + labelDist * Math.cos(angle);
                const py = centerY + labelDist * Math.sin(angle);
                
                // Alignment computations
                let anchor: 'start' | 'middle' | 'end' = "middle";
                if (Math.cos(angle) > 0.15) anchor = "start";
                else if (Math.cos(angle) < -0.15) anchor = "end";

                let colorCode = "#6b7280"; // neutral muted
                if (item.score >= 80) colorCode = "#10b981"; // emerald
                else if (item.score < 50) colorCode = "#ef4444"; // red
                else colorCode = "#d97706"; // amber

                return (
                  <text
                    key={i}
                    x={px}
                    y={py + 3.5}
                    textAnchor={anchor}
                    className="text-[9px] font-extrabold tracking-tight"
                    fill={colorCode}
                  >
                    {item.name} {item.score}%
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Homework/Quiz assessment module */}
        <div className="bg-white rounded-2xl shadow-3xs border border-slate-150 p-6 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div className="min-h-[310px]">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">作业 / 测验表现</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase">作业提交率</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{student.homeworkPerformance.submitRate}%</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1.5">提交 {student.homeworkPerformance.submittedCount} / {student.homeworkPerformance.totalCount} 次</p>
              </div>
              
              <div className="text-center border-l border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">作业平均分</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{student.homeworkPerformance.hwAvgScore}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1.5">分</p>
              </div>

              <div className="text-center border-l border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">测验平均分</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{student.homeworkPerformance.quizAvgScore}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1.5">分</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-700 tracking-tight mb-3">最近作业 / 测验成绩</h4>
              
              <div className="space-y-3">
                {student.homeworkPerformance.recentScores.map((score, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 w-1/2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        score.type === '作业' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {score.type}
                      </span>
                      <span className="text-slate-850 truncate max-w-[120px] font-bold block" title={score.title}>
                        {score.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold w-1/4 text-center">{score.date}</span>
                    <span className={`w-1/4 text-right font-black ${
                      score.score >= 85 ? 'text-emerald-500' : score.score >= 70 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {score.score} 分
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => triggerToast('📚 正在调转并帮您展示完整的考研复习习题集完成日志...')}
            className="w-full mt-4 text-center text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors cursor-pointer border-t border-slate-50 pt-3"
          >
            <span>查看全部作业 / 测验 对开大表</span>
            <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>

        {/* Mistakes categories Doughnut & Top 3 Wrong */}
        <div className="bg-white rounded-2xl shadow-3xs border border-slate-150 p-6 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">错题统计与错误类型分析</h3>
            <p className="text-[10px] text-slate-450 font-medium leading-relaxed">
              基于历次周习题、直播中点答、AI问答对误统计
            </p>

            <div className="flex items-center gap-4 my-4 h-28">
              {/* Doughnut representation in SVG */}
              <div className="w-24 h-24 relative shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {student.wrongQuestionsStats.categories.map((cat, i) => {
                    const strokeDash = `${cat.pct} ${100 - cat.pct}`;
                    const strokeOffset = `-${accumulatedPercent}`;
                    accumulatedPercent += cat.pct;
                    return (
                      <circle
                        key={i}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="4"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-700 ease-in-out"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xl font-black text-slate-800 leading-none">
                    {student.wrongQuestionsStats.totalWrongCount}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold mt-0.5">总错题</span>
                </div>
              </div>

              {/* Dynamic legend labels list */}
              <div className="flex-1 flex flex-col justify-center gap-1.5 text-[9px] font-bold text-slate-450">
                {student.wrongQuestionsStats.categories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cat.colorClass}`}></span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-extrabold">{cat.pct}%</span>
                      <span className="text-slate-400">({cat.count}题)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-700 mb-2.5">高频错题 TOP3</h4>
              <div className="space-y-2">
                {student.wrongQuestionsStats.topWrong.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-extrabold text-slate-350">{idx + 1}</span>
                      <span className="text-slate-800 font-bold truncate pr-3" title={item.title}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 whitespace-nowrap">
                      错误 <span className="text-red-500 font-extrabold">{item.errorCount}</span> 次
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerToast('❌ 已同步该生徒弟错题集大纲，正在整理重推练习卷')}
            className="w-full mt-4 text-center text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors cursor-pointer border-t border-slate-50 pt-3"
          >
            <span>一键派发错题专项重考</span>
            <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>

      </div>

      {/* Grid Row 2: Behavioral metrics, Attendance Table, and AI recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module A: Behavior (Col Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">学习行为分析</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">课堂互动次数</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-850">{student.behaviorAnalysis.classroomInteractionCount}次</span>
                  <span className="text-[9px] text-slate-400 block font-bold mt-0.5">班级排名 {student.behaviorAnalysis.interactionRank} / 48</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">课堂提问次数</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-850">{student.behaviorAnalysis.classroomQuestionsCount}次</span>
                  <span className="text-[9px] text-slate-400 block font-bold mt-0.5">班级排名 {student.behaviorAnalysis.questionsRank} / 48</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">资源学习时长</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-850">{student.behaviorAnalysis.resourceLearningHours}小时</span>
                  <span className="text-[9px] text-slate-400 block font-bold mt-0.5">(课件 {student.behaviorAnalysis.slidesHours}h / 动画 {student.behaviorAnalysis.animationHours}h)</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">资料下载次数</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-850">{student.behaviorAnalysis.downloadCount}次</span>
                  <span className="text-[9px] text-slate-400 block font-bold mt-0.5">班级排名 {student.behaviorAnalysis.downloadRank} / 48</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => triggerToast('📈 已生成该学生近两周学习精深细度的轨迹透视曲线')}
            className="w-full mt-4 text-center text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors cursor-pointer border-t border-slate-50 pt-3"
          >
            <span>详查自主预习/复习比率模型</span>
            <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>

        {/* Module B: Attendance Weekly Calendar Matrix (Col Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-2xs transition-all">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">
              出勤记录
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">每次课到课情况 (第1周 至 第10周)</p>
            
            <div className="overflow-x-auto mt-4 pb-2">
              <table className="w-full text-center text-[10px] font-bold text-slate-500 border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 text-left font-extrabold min-w-[36px]">状态</th>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <th key={i} className="py-2.5 font-extrabold">第{i + 1}周</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-800">
                  {/* Row 1: Present */}
                  <tr className="border-b border-slate-50">
                    <td className="py-3 text-left font-extrabold text-slate-450 uppercase tracking-tight">到课</td>
                    {student.attendanceGrid.map((status, idx) => (
                      <td key={idx} className="py-3">
                        {status === 'present' ? (
                          <div className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Late */}
                  <tr className="border-b border-slate-50">
                    <td className="py-3 text-left font-extrabold text-slate-450 uppercase tracking-tight">迟到</td>
                    {student.attendanceGrid.map((status, idx) => (
                      <td key={idx} className="py-3">
                        {status === 'late' ? (
                          <div className="w-4 h-4 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto font-black">
                            迟
                          </div>
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Leave */}
                  <tr className="border-b border-slate-50">
                    <td className="py-3 text-left font-extrabold text-slate-450 uppercase tracking-tight">请假</td>
                    {student.attendanceGrid.map((status, idx) => (
                      <td key={idx} className="py-3">
                        {status === 'leave' ? (
                          <div className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-[9px] font-black">
                            假
                          </div>
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Absent */}
                  <tr>
                    <td className="py-3 text-left font-extrabold text-slate-450 uppercase tracking-tight">缺勤</td>
                    {student.attendanceGrid.map((status, idx) => (
                      <td key={idx} className="py-3">
                        {status === 'absent' ? (
                          <div className="w-4 h-4 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto text-[9px] font-black">
                            缺
                          </div>
                        ) : (
                          <span className="text-slate-250">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center border-t border-slate-50 pt-4 text-[9px] font-bold text-slate-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />到课</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />迟到</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />请假</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />缺勤</div>
            <div className="text-slate-300">- 未上/未记录</div>
          </div>
        </div>

        {/* Module C: AI personalized advice suggestion (Col Span 4) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#f5f8ff] to-white rounded-2xl border border-blue-100 p-6 flex flex-col justify-between hover:shadow-2xs transition-all relative overflow-hidden">
          {/* Subtle background glitter illustration */}
          <div className="absolute top-4 right-4 text-blue-300/20 pointer-events-none">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-3xs">
                <Bot className="w-4 h-4 shrink-0 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">AI 个性化辅导建议</h3>
            </div>
            
            <p className="text-[10px] text-slate-450 font-bold mb-4">
              基于该生本周知识点掌握漏斗及做题行为精细推演：
            </p>

            <div className="space-y-4">
              {student.aiSuggestions.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 text-xs">
                  <span className="font-extrabold text-blue-600 text-sm leading-none pt-0.5">{item.id}.</span>
                  <div>
                    <h4 className="font-black text-slate-800 leading-tight mb-1">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <button 
              onClick={() => triggerToast(`💡 正在为您封装专属「${student.name}」的 AI 个性化课后补充微课以及匹配试题...`)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-3xs hover:shadow-2xs transition-all cursor-pointer text-center"
            >
              一键推荐配套辅导资源
            </button>
          </div>
        </div>

      </div>

      {/* Learning Trajectory Timeline pipeline */}
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-150 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-slate-900 text-sm">
            学习轨迹 <span className="text-[10px] text-slate-400 font-bold ml-1.5 uppercase tracking-wide">最近自主及课堂同步记录</span>
          </h3>
          
          <button 
            onClick={() => triggerToast('📅 正在展开完整10周历史轨迹，支持按时间序列条件筛选...')}
            className="text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            <span>查看完整学习轨迹</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal scroll timeline track list */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="min-w-[1000px] relative px-4 pt-4 pb-2">
            
            {/* Horizontal connection rule line */}
            <div className="absolute top-8 left-4 right-4 h-[2px] bg-slate-100 z-0 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              {student.learningTrajectory.map((event, index) => (
                <div key={index} className="w-40 flex flex-col items-center group">
                  {/* Concentric node point with dynamic colors */}
                  <div className={`w-8 h-8 rounded-full border-4 border-white shadow-xs flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                    event.color
                  }`}>
                    {event.icon === 'play' ? (
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : event.icon === 'test' ? (
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : event.icon === 'book' ? (
                      <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : event.icon === 'chat' ? (
                      <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="text-center px-1">
                    <span className="text-[9px] text-slate-400 font-bold tracking-tight block mb-1">
                      {event.date}
                    </span>
                    <h4 className="text-xs font-black text-slate-800 leading-tight mb-1 truncate w-full" title={event.type}>
                      {event.type}
                    </h4>
                    
                    <p className="text-[10px] text-slate-500 font-bold block truncate w-full" title={event.title}>
                      {event.title}
                    </p>
                    
                    <span className="text-[9px] font-black text-blue-600/90 block mt-1">
                      {event.durationOrScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
