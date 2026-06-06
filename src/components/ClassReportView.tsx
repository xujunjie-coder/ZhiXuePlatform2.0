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
  Search
} from 'lucide-react';

interface ClassReportViewProps {
  currentUser?: { name?: string; email?: string; role?: string };
  triggerToast: (msg: string) => void;
}

// Classroom Data Types
interface SessionData {
  title: string;
  dateStr: string;
  plannedDuration: number;
  metrics: {
    participants: number;
    totalStudents: number;
    attendanceRate: number;
    attRateChange: number; // e.g. +5
    presentCount: number;
    presentChange: number; // e.g. +6
    lateCount: number;
    lateChange: number;    // e.g. -2
    absentCount: number;
    absentChange: number;  // e.g. -4
    actualDuration: number;
  };
  attendanceBreakdown: {
    present: number;
    late: number;
    absent: number;
  };
  quizScores: Array<{ label: string; rate: number }>;
  interactionStats: {
    signInRate: number;
    signInChange: number;
    handRaiseCount: number;
    handRaiseChange: number;
    commentCount: number;
    commentChange: number;
    aiQuestionCount: number;
    aiQuestionChange: number;
  };
  focusDistribution: {
    high: number; // px/people
    mid: number;
    low: number;
    avgRate: number;
  };
  practiceCompletion: {
    completed: number;
    uncompleted: number;
    rate: number;
    rateChange: number;
  };
  topWrongQuestions: Array<{
    id: number;
    title: string;
    description: string;
    errorCount: number;
    errorRate: number;
    options: string[];
    correctAnswer: string;
    pitfall: string;
  }>;
  topFrequentQuestions: Array<{
    id: number;
    title: string;
    count: number;
    answer: string;
  }>;
  aiAdvice: string[];
}

const CLASS_SESSIONS: Record<string, SessionData> = {
  tree: {
    title: '第8章 树与二叉树 (直播课)',
    dateStr: '2024-05-25 (周六) 09:00 - 10:30',
    plannedDuration: 90,
    metrics: {
      participants: 126,
      totalStudents: 136,
      attendanceRate: 92,
      attRateChange: 5,
      presentCount: 116,
      presentChange: 6,
      lateCount: 8,
      lateChange: -2,
      absentCount: 2,
      absentChange: -4,
      actualDuration: 90,
    },
    attendanceBreakdown: {
      present: 116,
      late: 8,
      absent: 2
    },
    quizScores: [
      { label: '第1题', rate: 92 },
      { label: '第2题', rate: 76 },
      { label: '第3题', rate: 58 },
      { label: '第4题', rate: 81 },
      { label: '第5题', rate: 64 },
      { label: '第6题', rate: 68 }
    ],
    interactionStats: {
      signInRate: 96,
      signInChange: 3,
      handRaiseCount: 48,
      handRaiseChange: 12,
      commentCount: 126,
      commentChange: 28,
      aiQuestionCount: 63,
      aiQuestionChange: 9
    },
    focusDistribution: {
      high: 78,
      mid: 32,
      low: 16,
      avgRate: 81
    },
    practiceCompletion: {
      completed: 107,
      uncompleted: 19,
      rate: 85,
      rateChange: 7
    },
    topWrongQuestions: [
      {
        id: 1,
        title: '二叉树的层序遍历算法复杂度分析',
        description: '在最坏的情况下，对深度为H，包含N个节点的普通二叉树进行标准层序遍历（使用辅助队列），其最大辅助存储空间复杂度（队列中可能容纳的最大节点数）是多少？',
        errorCount: 86,
        errorRate: 68,
        options: [
          'A. O(1) - 空间为常数级',
          'B. O(log N) - 空间取决于树的高度',
          'C. O(N) - 在二叉树呈完全满态时空间最大可达 W ≈ ⌈N/2⌉',
          'D. O(N log N) - 每次遍历增加一个常数比例'
        ],
        correctAnswer: 'C. O(N)',
        pitfall: '大部分落入此坑的学生误以为在层序遍历中，空间开销仅仅和其深度线性成正比（误选B）。实际上，层序遍历是用队列实现的，空间开销取决于树的宽度。二叉树在最后一层满载时，宽度可占整棵树节点约一半，因此最坏情况下队列空间复杂度为 O(N)。'
      },
      {
        id: 2,
        title: '完全二叉树节点个数计算',
        description: '已知一棵完全二叉树第六层共有8个叶子节点（根节点深度设为第1层），求该完全二叉树可能具有的最大节点总数（N）是多少？',
        errorCount: 68,
        errorRate: 54,
        options: [
          'A. 63 - 刚满第六层情况',
          'B. 95 - 第七层叶子未铺满时的极限情况',
          'C. 111 - 巧妙避开第六层左偏情况后的极值',
          'D. 127 - 满七层的最终容量'
        ],
        correctAnswer: 'C. 111',
        pitfall: '这是一道经典的高级考点。第六层最多有 2^(6-1) = 32 个节点。若要总体节点数最大，不仅第六层的8个叶子节点要排在最右端，且第六层的其余 24 个非叶子节点都必须生满第七层（即这24个节点在第七层生出 48 个叶子节点）。最大总数 N = (1 + 2 + 4 + 8 + 16 + 32) + 48 = 63 + 48 = 111。学生往往混淆完全二叉树的叶子排布和满树，盲目按最大满树判定错选D。'
      },
      {
        id: 3,
        title: '二叉树的最近公共祖先问题',
        description: '在普通非搜索二叉树中，利用后序遍历递归思路，判断两个已知节点 p 与 q 的最近公共祖先 (LCA) 时，若递归分别在左右子树返回非空指针，该如何决定返回？',
        errorCount: 58,
        errorRate: 46,
        options: [
          'A. 任意返回左子树的非空指针',
          'B. 返回当前根节点 root，因为它就是第一个交会点',
          'C. 继续向上传递其父节点',
          'D. 返回 NULL 表示该处非真祖先'
        ],
        correctAnswer: 'B. 返回当前根节点 root',
        pitfall: '当深入检索时，若左右子树递归调用各自返回了非空（说明左子树有p或q，右子树也有另一节点），则必然当前节点 root 即为 LCA。学生多对后序递归的状态回溯掌握不牢固，错选为继续往上取父节点。'
      }
    ],
    topFrequentQuestions: [
      {
        id: 1,
        title: '如何直观理解二叉树的层序遍历，队列到底是如何拉接节点的？',
        count: 32,
        answer: '层序遍历相当于“广度优先搜索”（BFS）。其规则是：先把根节点塞到队列。接着进入循环：把队头节点弹出来供访问，顺便检测这个节点的左右孩子，如果有，就按从左到右的顺序塞入队尾，以此不断滚动。如此一来，队列中前面的节点必然是深度浅的，后面的节点是深度深的，自然就形成了一层一层按从左到右输出的视觉奇迹。'
      },
      {
        id: 2,
        title: '完全二叉树与满二叉树的本质区别以及在指针空间上的差异？',
        count: 24,
        answer: '满二叉树（Full Binary Tree）是每一层都塞得严严实实、完美空闲皆无的对称状态；而完全二叉树（Complete Binary Tree）则温和得多：它允许最后一层可以不充满，但要求最后一层的叶子必须从左向右连续排列，不能留有“空位气泡”。由于这种高度连续性，可以用一维数组紧凑存储，省去了所有指向子节点的额外左右指针（空间开销为 O(0) 的辅助），用 2i 和 2i+1 的下标即能高速定位，是堆排序（Heap）的基本盘。'
      },
      {
        id: 3,
        title: '最近公共祖先（LCA）有什么最直接的行业应用环境？',
        count: 18,
        answer: 'LCA 在现代生产中应用极其普遍：（1）Git 版本控制中的 Merge 冲突合并分支：寻找 p 分支和 q 分支的历史公共提交母版点就是寻找 LCA 基准。（2）企业组织架构中多部门层级汇报，合并汇报层级。（3）多微服务或依赖拓扑包在版本编译中的公共低位基础底包排查。'
      }
    ],
    aiAdvice: [
      '本堂课学生在「二叉树的层序遍历算法复杂度分析」掌握较弱，错误率高达68%，建议下次课多结合动画演示单步剖析，并留5分钟随堂手拉队列演练。',
      '超过 25% 的学生专注度处于中低水平，课堂后半程有疲惫征兆，可适当在第45分钟增加1分钟轻量选择题互动，提示振奋课堂参与感。',
      '建议在课后发布针对性练习，重点巩固「完全二叉树节点个数计算」和「最近公共祖先问题」的回溯解法，配以详细配图分析。'
    ]
  },
  graph: {
    title: '第7章 图的基本操作与拓扑排序 (直播课)',
    dateStr: '2024-05-18 (周六) 09:00 - 10:30',
    plannedDuration: 90,
    metrics: {
      participants: 120,
      totalStudents: 136,
      attendanceRate: 88,
      attRateChange: -4,
      presentCount: 110,
      presentChange: -6,
      lateCount: 10,
      lateChange: 2,
      absentCount: 6,
      absentChange: 4,
      actualDuration: 90,
    },
    attendanceBreakdown: {
      present: 110,
      late: 10,
      absent: 6
    },
    quizScores: [
      { label: '图的概念', rate: 85 },
      { label: '邻接矩阵', rate: 79 },
      { label: '邻接表建图', rate: 61 },
      { label: '出度入度', rate: 74 },
      { label: '拓扑序列', rate: 52 },
      { label: 'AOV网', rate: 62 }
    ],
    interactionStats: {
      signInRate: 91,
      signInChange: -5,
      handRaiseCount: 36,
      handRaiseChange: -12,
      commentCount: 98,
      commentChange: -28,
      aiQuestionCount: 54,
      aiQuestionChange: -9
    },
    focusDistribution: {
      high: 68,
      mid: 38,
      low: 14,
      avgRate: 77
    },
    practiceCompletion: {
      completed: 92,
      uncompleted: 28,
      rate: 76,
      rateChange: -9
    },
    topWrongQuestions: [
      {
        id: 1,
        title: '有向无环图（DAG）的拓扑排序序列唯一性条件',
        description: '判断一个有向无环图若存在拓扑排序序列，使其唯一的充分必要条件是什么？',
        errorCount: 72,
        errorRate: 65,
        options: [
          'A. 只有一个入度为0的顶点，且只有一个出度为0的顶点',
          'B. 图中恰好包含一条包含全顶点的哈密顿路径（Hamiltonian Path）',
          'C. 没有环，且任意两个顶点均能相互到达',
          'D. 节点的邻接顶点只有一个，并线排成单链态'
        ],
        correctAnswer: 'B. 图中恰好包含一条包含全顶点的哈密顿路径',
        pitfall: '极多学生误选为A，误以为只有一个起点、一个终点就足以约束其拓扑唯一。实际上，只要图里存在两条平行的无依赖路径，即使起点终点唯一，平行路之间的先后选择仍然会造就多种拓扑序列，必须存在哈密顿有向路径（将所有节点串联）才能确保拓扑序列的绝对唯一！'
      }
    ],
    topFrequentQuestions: [
      {
        id: 1,
        title: '拓扑排序中，为什么出度为零和入度为零是检测环的唯一法门？',
        count: 28,
        answer: '拓扑排序的执行原理就是：每次摘除一个“入度为0的无前驱依赖节点”，并将它所连接的所有有向边从图中剔除。如果在进行若干轮摘除后，图里还有节点，但它们没有一个入度是0的（表示互相套接循环纠缠），这就强力判明了图中必定存在死锁相连的「有向环」。计算机排课表、依赖加载校验的核心逻辑便是由此环检测卡住环加载。'
      }
    ],
    aiAdvice: [
      '由于「拓扑排序唯一性」概念较为繁细混淆，下节课建议花3分钟利用黑板模拟有平行链的DAG拓扑演示，增强印象。',
      '互动数据呈现下降，尤其是学生举手问答频段，建议下次通过对首位写出邻接表算例的学生加分的方式来活跃互动。'
    ]
  },
  bfs: {
    title: '第6章 图与广度优先搜索 (录播复习)',
    dateStr: '2024-05-11 (周日) 14:00 - 15:30',
    plannedDuration: 90,
    metrics: {
      participants: 132,
      totalStudents: 136,
      attendanceRate: 97,
      attRateChange: 9,
      presentCount: 129,
      presentChange: 13,
      lateCount: 3,
      lateChange: -7,
      absentCount: 1,
      absentChange: -5,
      actualDuration: 90,
    },
    attendanceBreakdown: {
      present: 129,
      late: 3,
      absent: 1
    },
    quizScores: [
      { label: '图的BFS', rate: 94 },
      { label: '最短路径', rate: 88 },
      { label: '连通分量', rate: 71 },
      { label: '队列作用', rate: 90 },
      { label: 'BFS空间复杂度', rate: 64 },
      { label: '十字链表', rate: 59 }
    ],
    interactionStats: {
      signInRate: 98,
      signInChange: 7,
      handRaiseCount: 52,
      handRaiseChange: 16,
      commentCount: 142,
      commentChange: 44,
      aiQuestionCount: 72,
      aiQuestionChange: 18
    },
    focusDistribution: {
      high: 88,
      mid: 28,
      low: 10,
      avgRate: 85
    },
    practiceCompletion: {
      completed: 118,
      uncompleted: 14,
      rate: 90,
      rateChange: 14
    },
    topWrongQuestions: [
      {
        id: 1,
        title: 'BFS在邻接矩阵存储下的时间复杂度',
        description: '在无向图G=(V, E)中，若采用邻接矩阵（Adjacency Matrix）存储，对其进行完整的广度优先搜索（BFS），其时间复杂度是多少？',
        errorCount: 42,
        errorRate: 32,
        options: [
          'A. O(|V| + |E|)',
          'B. O(|V|^2)',
          'C. O(|E|^2)',
          'D. O(|V| * |E|)'
        ],
        correctAnswer: 'B. O(|V|^2)',
        pitfall: '在邻接表下，BFS的复杂度是常数搜索外层的 O(|V|+|E|)。但是邻接矩阵中，探访每个顶点的邻接顶点都必须循环扫描一遍它所在行的所有列以判断边的存在，所以复杂度无悬念退化到 O(|V|^2)。许多学生脑子里的教条公式只记住了邻接表的 O(V+E)（误选A）。'
      }
    ],
    topFrequentQuestions: [
      {
        id: 1,
        title: '广度优先搜索（BFS）与一维迷宫最优路径的关联？',
        count: 15,
        answer: 'BFS的最关键本领就是“波形扩散”。它是一圈一圈由近及远地探索四周。也就是说，当它第一次搜到目标节点时，其所跨过的“步数”绝对是到达该点的最短径路。这就是为什么最基础的各种最短路算法（如无权图分支、迪杰斯特拉的简单形态）皆以 BFS 为骨架基础的原因。'
      }
    ],
    aiAdvice: [
      '本节课学生配合度卓越，对于BFS基础理解通透，可在作业中适量提优：如通过引入图的双向广搜或网格寻路模型来开拓思维。',
      '邻接矩阵查找耗时痛点理解不够，下次课在讲解DFS时，可以与邻接表进行耗时比对加深感受。'
    ]
  }
};

export default function ClassReportView({ currentUser, triggerToast }: ClassReportViewProps) {
  const [selectedSessionKey, setSelectedSessionKey] = useState<string>('tree');
  const [selectedMistake, setSelectedMistake] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedQA, setSelectedQA] = useState<any>(null);

  const session = CLASS_SESSIONS[selectedSessionKey] || CLASS_SESSIONS.tree;

  // Custom function to export data in different formats
  const handleExportMode = (format: 'PDF' | 'Excel') => {
    setIsExporting(true);
    triggerToast(`⏳ 正在对「${session.title}」课堂表现数据库进行封装，整理成标准结构并排版...`);
    setTimeout(() => {
      setIsExporting(false);
      triggerToast(`🎉 成功生成并下载「${session.title}_课堂报告.${format.toLowerCase()}」！`);
    }, 2000);
  };

  const activeBreakdown = session.attendanceBreakdown;

  // Calculate coordinates for responsive Donut Chart representation
  const totalBreakdown = activeBreakdown.present + activeBreakdown.late + activeBreakdown.absent;
  const presentPct = Math.round((activeBreakdown.present / totalBreakdown) * 100);
  const latePct = Math.round((activeBreakdown.late / totalBreakdown) * 100);
  const absentPct = Math.round((activeBreakdown.absent / totalBreakdown) * 100);

  // Focus Breakdown calculation
  const totalFocus = session.focusDistribution.high + session.focusDistribution.mid + session.focusDistribution.low;
  const focusHighPct = Math.round((session.focusDistribution.high / totalFocus) * 100);
  const focusMidPct = Math.round((session.focusDistribution.mid / totalFocus) * 100);
  const focusLowPct = Math.round((session.focusDistribution.low / totalFocus) * 100);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto select-none animate-fadeIn text-left font-sans text-slate-800 pb-16">
      
      {/* Page Header with Real Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-7 h-7 text-blue-600 stroke-[2.5]" />
              <span>课堂报告</span>
            </h1>
            <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              单节课堂学情复盘
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-medium">
            全面复盘该节直播/录播课的出勤、测验正确率、学生课堂表现及大模型AI教学建议。
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={() => handleExportMode('PDF')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-red-500" />
            <span>导出 PDF</span>
          </button>
          
          <button 
            onClick={() => handleExportMode('Excel')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>导出 Excel</span>
          </button>
        </div>
      </div>

      {/* Interactive Filters Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-3xs flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
        
        {/* Class selector */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs md:text-sm text-slate-500 font-bold whitespace-nowrap">选择课堂</span>
          
          <div className="relative flex-1 max-w-sm">
            <select 
              value={selectedSessionKey}
              onChange={(e) => {
                setSelectedSessionKey(e.target.value);
                triggerToast(`已成功切换到课堂复盘大屏：${CLASS_SESSIONS[e.target.value].title}`);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-xs md:text-sm font-bold rounded-xl py-2.5 pl-3.5 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-800"
            >
              <option value="tree">第8章 树与二叉树 (直播课)</option>
              <option value="graph">第7章 图的基本操作与拓扑排序 (直播课)</option>
              <option value="bfs">第6章 图与广度优先搜索 (录播复习)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Time and Duration Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs md:text-sm text-slate-400 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 pl-0 lg:pl-6 lg:border-l lg:border-slate-200">
          <div className="flex items-center gap-1.5 font-bold">
            <Calendar className="w-4 h-4 text-slate-350" />
            <span>上课时间: <span className="text-slate-650 font-medium">{session.dateStr}</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-slate-350" />
            <span>时长: <span className="text-slate-655 font-medium">{session.plannedDuration} 分钟</span></span>
          </div>
        </div>

        <div className="ml-auto hidden xl:flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">快速切换</span>
          <div className="flex gap-1.5 bg-slate-55 p-1 rounded-lg">
            <button 
              onClick={() => { setSelectedSessionKey('tree'); triggerToast('快速切至第8章'); }}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md ${selectedSessionKey === 'tree' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-550'}`}
            >
              树
            </button>
            <button 
              onClick={() => { setSelectedSessionKey('graph'); triggerToast('快速切至第7章'); }}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md ${selectedSessionKey === 'graph' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-550'}`}
            >
              图
            </button>
            <button 
              onClick={() => { setSelectedSessionKey('bfs'); triggerToast('快速切至第6章'); }}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md ${selectedSessionKey === 'bfs' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-550'}`}
            >
              BFS
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Metrics Widget Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50/50 rounded-bl-full z-0 pointer-events-none"></div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">参与人数</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.participants}<span className="text-xs font-normal text-slate-400 ml-1">人</span></div>
              <div className="text-[10px] text-slate-400 font-bold mt-2">班级总人数 {session.metrics.totalStudents} 人</div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">出勤率</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.attendanceRate}%</div>
              
              <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                <span>较上次课</span>
                <span className={`flex items-center font-black ${session.metrics.attRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {session.metrics.attRateChange >= 0 ? (
                    <>
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      <span>{session.metrics.attRateChange}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      <span>{Math.abs(session.metrics.attRateChange)}%</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-550 shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">已到人数</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.presentCount}<span className="text-xs font-normal text-slate-400 ml-1">人</span></div>
              
              <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                <span>较上次课</span>
                <span className={`flex items-center font-black ${session.metrics.presentChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {session.metrics.presentChange >= 0 ? (
                    <>
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      <span>{session.metrics.presentChange}人</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      <span>{Math.abs(session.metrics.presentChange)}人</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">迟到人数</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.lateCount}<span className="text-xs font-normal text-slate-400 ml-1">人</span></div>
              
              <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                <span>较上次课</span>
                <span className={`flex items-center font-black ${session.metrics.lateChange <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {session.metrics.lateChange <= 0 ? (
                    <>
                      <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      <span>{Math.abs(session.metrics.lateChange)}人</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      <span>{session.metrics.lateChange}人</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <X className="w-4 h-4 text-red-650" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">缺勤人数</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.absentCount}<span className="text-xs font-normal text-slate-400 ml-1">人</span></div>
              
              <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                <span>较上次课</span>
                <span className={`flex items-center font-black ${session.metrics.absentChange <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {session.metrics.absentChange <= 0 ? (
                    <>
                      <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      <span>{Math.abs(session.metrics.absentChange)}人</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      <span>{session.metrics.absentChange}人</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs hover:shadow-2xs transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">上课时长</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{session.metrics.actualDuration}<span className="text-xs font-normal text-slate-400 ml-1">分钟</span></div>
              <div className="text-[10px] text-slate-400 font-bold mt-2">计划时长 {session.plannedDuration} 分钟</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 1: Attendance Doughnut, Quiz Bar Chart, and Interaction Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Attendance Breakdown (Donut SVG Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-5">出勤情况统计</h3>
            
            <div className="flex items-center justify-center relative my-7">
              {/* Native responsive elegant Donut SVG */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                {/* 1. Present stroke */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-emerald-500"
                  strokeWidth="3.2"
                  fill="transparent"
                  stroke="currentColor"
                  strokeDasharray={`${presentPct} ${100 - presentPct}`}
                  strokeDashoffset="0"
                />
                {/* 2. Late segment */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-amber-500"
                  strokeWidth="3.2"
                  fill="transparent"
                  stroke="currentColor"
                  strokeDasharray={`${latePct} ${100 - latePct}`}
                  strokeDashoffset={`-${presentPct}`}
                />
                {/* 3. Absent segment */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  className="text-red-500"
                  strokeWidth="3.2"
                  fill="transparent"
                  stroke="currentColor"
                  strokeDasharray={`${absentPct} ${100 - absentPct}`}
                  strokeDashoffset={`-${presentPct + latePct}`}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-800 leading-none">
                  {session.metrics.participants}
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">总参与数</span>
              </div>
            </div>

            <div className="space-y-2 px-3 mt-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500 font-bold">已到 (常规出勤)</span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <span>{activeBreakdown.present}人</span>
                  <span className="text-slate-400 text-[10px]">({presentPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-500 font-bold">迟到 (按次打卡)</span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <span>{activeBreakdown.late}人</span>
                  <span className="text-slate-400 text-[10px]">({latePct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-500 font-bold">缺勤 (未到系统)</span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <span>{activeBreakdown.absent}人</span>
                  <span className="text-slate-400 text-[10px]">({absentPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Quiz Accuracy Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm">随堂测验正确率</h3>
              <span className="text-xs text-blue-600 bg-blue-50/85 px-2 py-0.5 rounded-md font-bold">
                平均正确率: 73%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight mb-4 text-left">
              反映该堂测试各道选择题型在所有已到人员中的提交对误
            </p>

            {/* Custom responsive Bar charts in React layout */}
            <div className="h-48 flex items-end justify-between gap-2.5 bg-slate-50/50 rounded-xl p-4 border border-slate-100 relative pt-7">
              {/* Horizontal Guides */}
              <div className="absolute inset-0 px-3 py-4 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-slate-400 w-full" />
                <div className="border-t border-slate-400 w-full" />
                <div className="border-t border-slate-400 w-full" />
                <div className="border-t border-slate-400 w-full animate-pulse" />
              </div>

              {session.quizScores.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Score Hover Pop-up info */}
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white font-mono text-[9px] font-bold py-1 px-1.5 rounded-md opacity-0 group-hover:opacity-150 transition-opacity pointer-events-none z-20">
                    {score.rate}%
                  </div>
                  
                  {/* Bar fill */}
                  <div 
                    className="w-full max-w-[20px] rounded-t-md transition-all duration-500 bg-blue-600 group-hover:bg-blue-550 group-hover:shadow-3xs" 
                    style={{ height: `${score.rate}%` }}
                  />

                  {/* Rating Label text */}
                  <span className="text-[10px] text-slate-400 font-bold mt-2 tracking-tight block truncate w-full text-center">
                    {score.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[11px] text-slate-400 leading-relaxed font-medium italic mt-2">
            💡 问题警醒: 随堂第三题出错误人多，属于「树结构后序遍历的递归与非递归实现」重点失误区。
          </div>
        </div>

        {/* Chart 3: Interaction Statistics Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">互动数据统计</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Interaction Block 1 */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">签到率</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{session.interactionStats.signInRate}%</div>
                  <div className="text-[9px] mt-1 text-slate-400 flex items-center gap-0.5">
                    <span>较上次</span>
                    <span className={`font-bold ${session.interactionStats.signInChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {session.interactionStats.signInChange >= 0 ? '+' : ''}{session.interactionStats.signInChange}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Interaction Block 2 */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">举手互动</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{session.interactionStats.handRaiseCount}<span className="text-[10px] font-normal ml-0.5 text-slate-500">次</span></div>
                  <div className="text-[9px] mt-1 text-slate-400 flex items-center gap-0.5">
                    <span>较上次</span>
                    <span className="font-bold text-emerald-500">
                      +{session.interactionStats.handRaiseChange}次
                    </span>
                  </div>
                </div>
              </div>

              {/* Interaction Block 3 */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">评论互动</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{session.interactionStats.commentCount}<span className="text-[10px] font-normal ml-0.5 text-slate-500">条</span></div>
                  <div className="text-[9px] mt-1 text-slate-400 flex items-center gap-0.5">
                    <span>较上次</span>
                    <span className="font-bold text-emerald-500">
                      +{session.interactionStats.commentChange}条
                    </span>
                  </div>
                </div>
              </div>

              {/* Interaction Block 4 */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">AI助手提问</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{session.interactionStats.aiQuestionCount}<span className="text-[10px] font-normal ml-0.5 text-slate-500">次</span></div>
                  <div className="text-[9px] mt-1 text-slate-400 flex items-center gap-0.5">
                    <span>较上次</span>
                    <span className="font-bold text-purple-500 font-extrabold">
                      +{session.interactionStats.aiQuestionChange}此
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Student performance / Gauge completion (Left) & mistakes topology (Middle) & frequent questions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module A: Student performance and gauge progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-5">学生表现统计</h3>
            
            <div className="flex flex-col sm:flex-row gap-5">
              
              {/* Focus Distribution */}
              <div className="flex-1 flex flex-col items-center">
                <div className="text-xs font-bold text-slate-450 mr-auto mb-3">专注度分布</div>
                
                <div className="relative w-28 h-28 my-2">
                  {/* Mini Ring Conic */}
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center relative shadow-3xs"
                    style={{
                      background: `conic-gradient(#186bfd 0% ${focusHighPct}%, #f59e0b ${focusHighPct}% ${focusHighPct + focusMidPct}%, #ba1a1a ${focusHighPct + focusMidPct}% 100%)`
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
                      <span className="text-[9px] text-slate-400 font-bold">平均专注度</span>
                      <span className="text-base font-black text-slate-800 mt-0.5">{session.focusDistribution.avgRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2 mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                      <span className="text-slate-500">高 (80~100%)</span>
                    </div>
                    <span className="text-slate-700">{session.focusDistribution.high} 人 ({focusHighPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold pt-1.5 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                      <span className="text-slate-500">中 (60~80%)</span>
                    </div>
                    <span className="text-slate-700">{session.focusDistribution.mid} 人 ({focusMidPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold pt-1.5 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                      <span className="text-slate-500">低 (0~60%)</span>
                    </div>
                    <span className="text-slate-700">{session.focusDistribution.low} 人 ({focusLowPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Practice completion gauge */}
              <div className="flex-1 flex flex-col items-center border-l border-slate-100 pl-0 sm:pl-4">
                <div className="text-xs font-bold text-slate-450 mr-auto mb-3">练习完成率</div>
                
                <div className="relative w-24 h-24 my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      className="text-slate-100"
                      strokeWidth="2.5"
                      fill="transparent"
                      stroke="currentColor"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      className="text-emerald-500"
                      strokeWidth="3.2"
                      fill="transparent"
                      stroke="currentColor"
                      strokeDasharray={`${session.practiceCompletion.rate} ${100 - session.practiceCompletion.rate}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-slate-800">{session.practiceCompletion.rate}%</span>
                  </div>
                </div>

                <div className="w-full space-y-2 text-[11px] font-medium text-slate-500 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>已提交人数</span>
                    <span className="text-slate-800">{session.practiceCompletion.completed}人</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-50 pt-1.5 font-bold">
                    <span>未提交人数</span>
                    <span className="text-slate-400">{session.practiceCompletion.uncompleted}人</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-50 pt-1.5 font-bold">
                    <span>对比上次</span>
                    <span className={`flex items-center font-black ${session.practiceCompletion.rateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {session.practiceCompletion.rateChange >= 0 ? '+' : ''}{session.practiceCompletion.rateChange}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Module B: Top 3 Wrong Questions (Interactive detailed view) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
              <span>错题 TOP3</span>
              <span className="text-[10px] font-normal text-slate-400 bg-red-50 text-red-500 px-1.5 py-0.2 rounded">最高的错误点</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mb-4">
              点击具体的错题名称，可以展开由大模型提供的错误率分析与答题细节
            </p>

            <div className="space-y-4">
              {session.topWrongQuestions.map((q, idx) => (
                <div 
                  key={q.id}
                  onClick={() => {
                    setSelectedMistake(q);
                    triggerToast(`🧩 正在加载错题「${q.title}」的大模型深度归因切面数据...`);
                  }}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                    idx === 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {q.title}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1">
                      提交错误数: <span className="text-red-500">{q.errorCount}人</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-red-500">{q.errorRate}%</span>
                    <div className="text-[9px] text-slate-400 font-bold">错误率</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => triggerToast('📊 已为您整合本章的所有题库错误清单，请在「作业管理」中同步巩固推送。')}
            className="w-full mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 py-2.5 rounded-xl transition-all"
          >
            查看全部错题列表 ➔
          </button>
        </div>

        {/* Module C: Top 3 Frequent Questions (Interactive QA check) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-3xs transition-shadow">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
              <span>高频提问 TOP3</span>
              <span className="text-[10px] font-normal text-slate-400 bg-indigo-50 text-blue-600 px-1.5 py-0.2 rounded">核心师生交互</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mb-4">
              点击具体的提问可以展开教师讲台的权威大模型配套解答话术
            </p>

            <div className="space-y-4">
              {session.topFrequentQuestions.map((qa, idx) => (
                <div 
                  key={qa.id}
                  onClick={() => {
                    setSelectedQA(qa);
                    triggerToast(`💡 已在后台整理大屏幕精选互动，准备输出专业解析卡片...`);
                  }}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-slate-400 font-black text-xs font-mono w-4">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {qa.title}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-xs font-black text-slate-800">{qa.count}</span>
                    <span className="text-[9px] text-slate-400 font-bold">次</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => triggerToast('📚 正在调档云端大模型生成的师生活动QA索引知识图谱，请在「问答管理」组件查看')}
            className="w-full mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 py-2.5 rounded-xl transition-all"
          >
            查看全部问答详情 ➔
          </button>
        </div>

      </div>

      {/* AI Advice Banner with Beautiful Illustration Overlay */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50/20 to-white rounded-3xl border border-blue-100 p-6 shadow-3xs relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        
        {/* Absolute Background Accent shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-blue-100/40 via-transparent to-transparent opacity-40 pointer-events-none z-0"></div>

        <div className="flex-1 relative z-10 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Lightbulb className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-base md:text-lg text-slate-900">AI 课堂优化教学建议</h2>
          </div>

          <ul className="space-y-2.5">
            {session.aiAdvice.map((advice, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>{advice}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button 
              onClick={() => triggerToast('⚙️ 正在利用大模型一键拼装「树与图专题突破」专属课后复习补充练习集... 请前往“作业管理”发布对应强化。')}
              className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>一键拼装针对性课后复习巩固题集</span>
            </button>
          </div>
        </div>

        {/* Brand Mascot Illustration hotlinked directly from high-fidelity metadata assets */}
        <div className="w-44 h-32 relative z-10 shrink-0 hidden md:block select-none pointer-events-none">
          <img 
            alt="AI Character Mascot" 
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply" 
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTUIkStlunT4Zqurxz1MAiAJesGqSKxddko_eEmF4FYkLCuC8CWjmOMMUh2fgsml9F6noZdY2LT_yVy5n8SqUNZaAfXvuLaLFBTQc7kUKzZxi78B7uJyybRCt6wLk29QC-GwEQHgooiUdl7sUCmKNa3bGMCcDf_WDETDECe8-TOPUWi1Wfu0QkMXn-WnMqQjg0ADw_SnfeIOYPhTr1VSgHmfrA7u36nAcKkqKjCA9TzvEcjunY2Zfxvqge_4NPfuq-oWeJj413O_w"
          />
        </div>
      </div>

      {/* Slide-out Overlay Drawer for Mistake Detailed Analysis */}
      {selectedMistake && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slideLeft flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold">
                    !
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">大模型提炼 · 错题精细分析</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">错误率高达 {selectedMistake.errorRate}% 的难点攻关</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedMistake(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mistake Details */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-800">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">题目题干：</div>
                  <p className="text-xs md:text-sm leading-relaxed font-bold">{selectedMistake.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider">学生作答备选项：</div>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedMistake.options.map((opt: string, i: number) => {
                      const isCorrect = opt.startsWith(selectedMistake.correctAnswer.split('.')[0]);
                      return (
                        <div 
                          key={i}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                            isCorrect 
                              ? 'bg-emerald-50/70 border-emerald-250 text-emerald-800' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded">标准答案</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-slate-700">
                  <div className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>大模型深度归因与常见失误区：</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium text-slate-650">{selectedMistake.pitfall}</p>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-3 mt-6">
              <button 
                onClick={() => {
                  triggerToast(`已向 ${selectedMistake.errorCount} 位选错本题的学生推送了大模型精美答疑微课解析卡片 ✉️`);
                  setSelectedMistake(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                向错题群组推送该题专门讲解
              </button>
              <button 
                onClick={() => setSelectedMistake(null)}
                className="px-5 bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-bold py-3 rounded-xl border border-slate-250/70 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Overlay Drawer for QA Details */}
      {selectedQA && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slideLeft flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    Q
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">讲台提问权威大模型精细解答</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">本堂课共被提问 {selectedQA.count} 次</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedQA(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question Details */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">学生高频原话问题：</div>
                  <p className="text-xs md:text-sm font-extrabold leading-relaxed">“{selectedQA.title}”</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-4 text-slate-700">
                  <div className="text-xs font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span>大模型智库精选备课拟定应答：</span>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-750">
                    {selectedQA.answer}
                  </p>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-3 mt-6">
              <button 
                onClick={() => {
                  triggerToast(`已成功将解答话术同步推送至「班级互动讨论区」，所有学生均可随时翻阅回顾 🌟`);
                  setSelectedQA(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                生成精美精要解析并发布至讨论区
              </button>
              <button 
                onClick={() => setSelectedQA(null)}
                className="px-5 bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-bold py-3 rounded-xl border border-slate-250/70 transition-all font-bold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
