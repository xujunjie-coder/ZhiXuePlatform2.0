import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  UserPlus, 
  ClipboardList, 
  Clock, 
  Award, 
  Target, 
  ChevronRight, 
  RefreshCcw, 
  Star,
  Zap,
  Calendar,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Send,
  HelpCircle,
  Lightbulb,
  Play,
  Pause,
  Video,
  Check,
  X,
  Plus,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, ActiveView } from '../types';

const DAY_STUDY_INFOS: Record<number, string> = {
  1: "《线性代数》第2章 行列式性质主讲", 
  2: "《大学英语》四级听力与高频词汇精练", 
  3: "《数据结构与算法》链表合并与反转", 
  4: "《计算机网络》TCP建立连结与超时重传", 
  5: "《高等数学》导数中值定理典型习题册讲解", 
  6: "《大学物理》刚体力学守恒律探索", 
  7: "《操作系统》微核机制进程状态调度算法", 
  8: "《机器学习》残差极值与损失函数梯度下降", 
  9: "《数据库》关系模式范式分解算法应用", 
  10: "《计算机组成原理》定点数运算与溢出检测", 
  11: "《人工智能导论》启发式评估搜索算法演练", 
  12: "《大学英语》完形填空精深讲解", 
  13: "《高等数学》多元极值与偏导方程组求算", 
  14: "《数据结构》平衡二叉树平衡调节机制", 
  15: "《操作系统》信号量PV极值互斥问题", 
  16: "《计算机网络》路由表信息转发逻辑拓扑"
};

interface HomeViewProps {
  setActiveView: (view: ActiveView) => void;
  setSelectedCourseId: (id: string | null) => void;
  courses: Course[];
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  onSetReminder: (taskId: string, seconds: number, customLabel: string) => void;
  setExamActiveSubTab?: (tab: 'tasks' | 'exams') => void;
  setSpaceActiveTab?: (tab: string) => void;
  setSelectedHistoryId?: (id: string) => void;
  historyLogs?: any[];
}

export default function HomeView({ 
  setActiveView, 
  setSelectedCourseId,
  courses,
  tasks,
  setTasks,
  onSetReminder,
  setExamActiveSubTab,
  setSpaceActiveTab,
  setSelectedHistoryId,
  historyLogs = []
}: HomeViewProps) {
  // Local Toast message state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Interactive AI diagnosis state
  const [selectedDiagCard, setSelectedDiagCard] = useState<number | null>(null);
  const [diagQuizAnswers, setDiagQuizAnswers] = useState<Record<number, number>>({});
  const [diagQuizSubmitted, setDiagQuizSubmitted] = useState<boolean>(false);
  const [customPlanMinutes, setCustomPlanMinutes] = useState<number>(45);
  const [aiSearchKw, setAiSearchKw] = useState<string>('');
  const [aiSearchLoading, setAiSearchLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [diagnosticsRefreshing, setDiagnosticsRefreshing] = useState<boolean>(false);
  const [videoTimestamp, setVideoTimestamp] = useState<number>(105); // Default start 1m45s

  // Interactive Complete Task states matching Chinese request
  const [currentCompletingTask, setCurrentCompletingTask] = useState<any | null>(null);
  const [pomoMinutes, setPomoMinutes] = useState<number>(25);
  const [pomoSeconds, setPomoSeconds] = useState<number>(0);
  const [pomoIsActive, setPomoIsActive] = useState<boolean>(false);
  const [pomoSubMode, setPomoSubMode] = useState<'intro' | 'active' | 'done'>('intro');
  const [isSpeedyPomo, setIsSpeedyPomo] = useState<boolean>(true); // default true for super easy evaluation
  const [homeworkAnswers, setHomeworkAnswers] = useState<Record<number, number>>({});
  const [homeworkSubmitted, setHomeworkSubmitted] = useState<boolean>(false);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Add Custom Task states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'作业' | '考试' | '学习'>('学习');
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>('');

  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // ignores audio contexts error
    }
  };

  const playFinishChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.15); // C6
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.3);
      osc2.stop(audioCtx.currentTime + 1.3);
    } catch (e) {
      // ignores
    }
  };

  // Pomodoro Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (pomoIsActive && currentCompletingTask?.type === '学习') {
      interval = setInterval(() => {
        setPomoSeconds((prevSec: number) => {
          if (prevSec > 0) {
            if (!isSpeedyPomo && prevSec % 2 === 0) {
              playTickSound();
            }
            return prevSec - 1;
          } else {
            setPomoMinutes((prevMin: number) => {
              if (prevMin > 0) {
                return prevMin - 1;
              } else {
                setPomoIsActive(false);
                setPomoSubMode('done');
                handleCompleteTaskSuccessfully(currentCompletingTask.id);
                playFinishChime();
                clearInterval(interval);
                return 0;
              }
            });
            return 59;
          }
        });
      }, isSpeedyPomo ? 40 : 1000);
    }
    return () => clearInterval(interval);
  }, [pomoIsActive, currentCompletingTask, isSpeedyPomo]);

  const handleCompleteTaskSuccessfully = (taskId: string) => {
    setTasks((prevTasks: any[]) => prevTasks.map(t => t.id === taskId ? { 
      ...t, 
      status: '已完成', 
      badgeStyle: 'bg-green-50 text-green-500 border border-green-100',
      reminderTime: ''
    } : t));
    setToastMsg(`✅ 待办大捷！您已高能突破该待办，打卡学分已累计录入。`);
  };

  // Live running video timer simulation
  useEffect(() => {
    let timer: any;
    if (isVideoPlaying && selectedDiagCard === 3) {
      timer = setInterval(() => {
        setVideoTimestamp((prev: number) => {
          if (prev >= 200) { // Max length 3m20s (200 seconds)
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVideoPlaying, selectedDiagCard]);

  const handleSendAiQuestion = async (customKw?: string) => {
    const query = customKw || aiSearchKw;
    if (!query.trim()) return;
    setAiSearchLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.text);
      } else {
        setAiResponse("AI 诊断模型遇到阻碍，请稍后重试。");
      }
    } catch (e) {
      setAiResponse("网络请求失败，正在本地生成辅学建议中：关于该知识点，请确保理解极限、导数及最优化代价函数的定义。");
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleAddCustomPlanToTasks = () => {
    const newTaskId = `custom-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      type: '学习',
      title: `🎯 AI定制：[线性回归] ${customPlanMinutes}分钟深度专注突击`,
      deadline: '截止：今日 23:59',
      status: '待完成',
      badgeStyle: 'bg-indigo-50 text-indigo-500 border border-indigo-100',
      reminderTime: ''
    };
    setTasks((prev: any[]) => [newTask, ...prev]);
    setSelectedDiagCard(null);
    setToastMsg(`✨ AI 定制专属深度专注任务已创建并添加到您的“待完成任务列表”！`);
  };

  const formatVideoTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const DIAGNOSIS_QUIZZES = [
    {
      title: "线性回归与损失计算 · 针对性强化测试",
      questions: [
        {
          question: "1. 评估指标中，均方误差 (MSE) 比平均绝对误差 (MAE) 更具优势的主要场景是？",
          options: [
            "A. 数据集无噪点且损失函数要求连续可导时",
            "B. 样本中存在大量偏离常态的离群值，需要强鲁棒性时",
            "C. 当我们需要对大偏差进行平滑忽略以确保拟合稳定性时",
            "D. 想要避免对大误差进行级数重罚，让误差变动平缓时"
          ],
          correct: 0,
          explanation: "解答：正确为 A。MSE 具有二次平方惩罚，对离群点/大误差敏感，且在全定义域内连续可导便于进行梯度下降最优化求导。若离群值特别多且需要容忍度，则通常首选 MAE 作为更具 Robust 性质的损失测度。"
        },
        {
          question: "2. 若两个测试样本的真实值为 [4.0, 1.0]，模型的预测值为 [3.0, 3.0]。这些样本得到的均方误差 (MSE) 是？",
          options: [
            "A. 1.5",
            "B. 2.0",
            "C. 2.5",
            "D. 3.0"
          ],
          correct: 2,
          explanation: "解答：正确为 C。计算总偏差平方和：样本一为 (4.0-3.0)^2 = 1.0；样本二为 (1.0-3.0)^2 = 4.0。对所有两项误差平方相加得到 1.0 + 4.0 = 5.0，对其取样本均值：5.0 / 2 = 2.5。"
        },
        {
          question: "3. 凸函数 (Convex Function) 被优先作为机器学习回归/分类损失函数的首要原因在于？",
          options: [
            "A. 它的下降梯度在最优化过程中会极快地趋近为零常数",
            "B. 保证任意局部的极小值(Local Minimum)就是该函数的全局最小值(Global Minimum)",
            "C. 不需要设定学习率等模型超参数，其一阶导数恒为 1",
            "D. 它的偏导雅可比矩阵可以直接无损计算出每一层的反向传播权重"
          ],
          correct: 1,
          explanation: "解答：正确为 B。凸函数完美的数学本质使得任何一个局部最优解立刻等同于全局最优解。这保障了梯度下降算法仅需依着梯度负方向滑落，就必然能收敛到全局最优状态，而不会陷在次优鞍点中。"
        }
      ]
    },
    {
      title: "学习规划与时间管理",
      questions: []
    },
    {
      title: "链式梯度求导 · 核心算理实训靶场",
      questions: [
        {
          question: "1. 设复合函数 y = u^2 且 u = 3x^2 + 1。采用链式法则，推算在 x = 1 处的导数 dy/dx 的值？",
          options: [
            "A. 12",
            "B. 24",
            "C. 48",
            "D. 56"
          ],
          correct: 2,
          explanation: "解答：正确为 C。复合求导：dy/dx = (dy/du) * (du/dx) = (2u) * (6x) = 12ux。当 x = 1 时，u = 3(1)^2 + 1 = 4。因此：dy/dx = 12 * 4 * 1 = 48。"
        },
        {
          question: "2. 反向传播算法 (Backpropagation) 在深层人工神经网络中进行数值传导的数学基石是？",
          options: [
            "A. 局部梯度矩阵雅可比连乘与多元偏导链式求导法则",
            "B. 泰勒公式级数近似展开与牛顿力学迭代相切极小值",
            "C. 蒙特卡洛随机采样分布与梯度投影缩减法则",
            "D. 马尔可夫决策决策收益最大化及贝尔曼迭代方程"
          ],
          correct: 0,
          explanation: "解答：正确为 A。深层网络中的梯度求导是典型的超多元复合函数求偏导，通过链式求导法则将每一模块作为局部节点计算其偏导，并借由多维雅可比矩阵连乘在反向阶段将总损失逐步向前反馈更新。"
        },
        {
          question: "3. 设函数形如 y = ln(x^2 + 1)，则其一阶导数复合算式的计算结果为？",
          options: [
            "A. y' = 2x / (x^2 + 1)",
            "B. y' = 1 / (x^2 + 1)",
            "C. y' = 2x(x^2 + 1)",
            "D. y' = 2 / (x^2 + 1)"
          ],
          correct: 0,
          explanation: "解答：正确为 A。令 u = x^2 + 1，则有 y = ln u。dy/du = 1/u = 1/(x^2 + 1)，而 du/dx = 2x。复合相连二者相乘即得 dy/dx = (1/(x^2 + 1)) * 2x = 2x / (x^2 + 1)。"
        }
      ]
    }
  ];

  // Dynamic Derived Activity Feed linking to standard history logs
  const activities = (historyLogs || []).slice(0, 4).map((log) => {
    let icon = '🎓';
    let type = 'course';
    if (log.type === '作业提交') {
      icon = '📝';
      type = 'homework';
    } else if (log.type === '测验') {
      icon = '✅';
      type = 'exam';
    } else if (log.type === 'AI 辅导') {
      icon = '🤖';
      type = 'ai';
    } else if (log.type === '课件浏览') {
      icon = '📖';
      type = 'resource';
    } else if (log.type === '课堂互动') {
      icon = '👥';
      type = 'interactive';
    }

    const courseShort = log.course.replace(' (2024春)', '');
    let text = `学习了《${courseShort}》: ${log.title}`;
    if (log.type === '作业提交') {
      text = `提交了《${courseShort}》: ${log.title}`;
    } else if (log.type === '测验') {
      text = `完成了《${courseShort}》测验: ${log.title}`;
    } else if (log.type === 'AI 辅导') {
      text = `向AI提问《${courseShort}》: ${log.title}`;
    } else if (log.type === '课件浏览') {
      text = `浏览《${courseShort}》课件: ${log.title}`;
    } else if (log.type === '课堂互动') {
      text = `参与了《${courseShort}》课堂交互`;
    }

    const displayTime = log.dateGroup === '今天' ? `今天 ${log.time}` : log.dateGroup === '昨天' ? `昨天 ${log.time}` : `${log.dateGroup} ${log.time}`;

    return {
      id: log.id,
      type,
      icon,
      text,
      time: displayTime,
    };
  });

  const handleActivityClick = (logId: string) => {
    if (setSpaceActiveTab) {
      setSpaceActiveTab('学习历史');
    }
    if (setSelectedHistoryId) {
      setSelectedHistoryId(logId);
    }
    setActiveView('space');
  };

  // Recommended Courses State matching "换一换" trigger
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error("Failed to fetch recommendations:", err));
  }, []);

  const handleRefreshRecommendations = () => {
    // Basic array shuffling/data toggling for simulation
    const bank = [
      { id: 'rec-3', name: '数据科学与人工智能', school: '浙江大学 · 计算机中心', learners: '3.1万人学习', score: '4.9', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOTtEOc_bRSFZriUCvhRD5CDqwWqg64F_3gMmGtPRGUe22Z5fDIbrL0vMuyWDxZQY34REdYaLu-A_thrt1ytwSXmYtPeOZBe-k-LSOqZRn3D-VnzCbGCh7t6eHWwIh42U95x_X2vI7kS2vWG9nT8C1XwvQE4KNQApHHG8ZNYjF_8VjMPVFJvZoyVaWwxpYENUr0US2HThYrsXa4R015JN5sE5IMd_FWw4-oIsM0dJV_HYTpsw-BDwT-hP0Qy2HGNYeI22Gbi576es' },
      { id: 'rec-4', name: '微积分(基础篇)', school: '复旦大学 · 理学系', learners: '5420人学习', score: '4.6', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP9O-b2SGHsKUvlxbhEqlGDz2nWkPpPMy6A0fFFYH-7pYWvH4UkXJYQK5a2hhc-qMTZMtWODQzcPD2KqB6p2jIYDfdGe-LHCqydhtuqEVW5L3Ta7sNQq-rIsju6YnzjbpUQVAS9bEPq5JGjvsNFx5fVA5XgcuDDNHGgqgaXtoLo8_33SYcwuCsvUYGaMY2ANAybnGkgZejY86l7nvLtfQfrAR6EvW31GeT9cg4SHGEsXih4INcqmiZ2Z85d14itntXeOoLcswMlKo' }
    ];
    setRecommendations(recommendations[0].id === 'rec-1' ? bank : [
      { id: 'rec-1', name: '深度学习入门实战', school: '北京大学 · 计算机学院', learners: '1.2万人学习', score: '4.8', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFQaSKFQNyWsJTAyc-1rIiyM0pb_HZSz3yJNnf9MpuQlnvnflMn15lAJk7K2PWaCWdb4iS9EmRCW7Wfoj8WglLl4Ci2UJMRA66Hnujlu30HSO9OVieIjiiQ__dhWp7MDzCaW7evsKS1DklzdGXkRExv436FXLTOqwVOvEMdcng6g1ckTRNjoc1nWdPZHc-zdN1EnGsRmVAVSAiySFYhruwT2X9w0Rq7a7PgF2g0h6UKmkFjve0kLfxQV3o_5IcOYB4Cxoz-c25otg' },
      { id: 'rec-2', name: '概率论与数理统计', school: '清华大学 · 数学系', learners: '8560人学习', score: '4.7', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiV6fEJTW-e0qA5me7FsHRSl34qlsfrBnvc38aNrFYPGvkU8hEt-WE2UAVdtYzoL8mOWy9JrtZsOgwBU56P75NaZb_FZyBPFE4gIMSGKeESfKfF7AaYsgRKt14VhHfc0oiiEsDX6va2yCV20IufsY0Xff3q_FwnAlCeuXM_ZYM7xh-Y1_4DVHxoxnn1wWeYATdtkBPNQU4a851j-O8u2An1ZyTU7ui4847EtVVqlkg3h8T-0tLKu6ynCeKQyjXcBJ1vueIGO0DyUQ' }
    ]);
  };

  const [activeTaskSetupId, setActiveTaskSetupId] = useState<string | null>(null);

  const handleTaskAction = (taskId: string) => {
    const matchedTask = tasks.find(t => t.id === taskId);
    if (matchedTask) {
      setCurrentCompletingTask(matchedTask);
      if (matchedTask.type === '学习') {
        setPomoMinutes(25);
        setPomoSeconds(0);
        setPomoIsActive(false);
        setPomoSubMode('intro');
      } else if (matchedTask.type === '作业') {
        setHomeworkAnswers({});
        setHomeworkSubmitted(false);
      } else if (matchedTask.type === '考试') {
        setExamAnswers({});
        setExamSubmitted(false);
      }
    } else {
      setTasks(tasks.map(t => t.id === taskId ? { 
        ...t, 
        status: '已完成', 
        badgeStyle: 'bg-green-50 text-green-500 border border-green-100',
        reminderTime: '' // Clear reminder when completed
      } : t));
      setToastMsg(`✅ 恭喜！您已成功完成了该待办任务！`);
    }
  };

  const handleScheduleReminder = (taskId: string, seconds: number, label: string) => {
    onSetReminder(taskId, seconds, label);
    setActiveTaskSetupId(null);
    setToastMsg(`⏰ 提醒设定成功！\n系统将在 ${seconds} 秒后发出专注提醒桌面通知。`);
  };

  const handleResumeStudy = (courseTitle: string) => {
    // Find course ID
    const found = courses.find(c => c.title.includes(courseTitle) || courseTitle.includes(c.title));
    if (found) {
      setSelectedCourseId(found.id);
      setActiveView('studying');
    } else {
      setActiveView('courses');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Local Toast alerting day stats info */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs py-3 px-5 rounded-xl shadow-xl flex items-center gap-2.5 animate-bounce max-w-sm">
          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="whitespace-pre-line leading-relaxed text-left">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-auto text-slate-400 hover:text-white pt-0.5 shrink-0">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      {/* Overview/Welcome Heading Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">下午好，李同学！</h2>
          <p className="text-sm text-slate-500 mt-1">今天是你连续学习的第 28 天，继续努力哦！</p>
        </div>
        <div className="mt-3 md:mt-0 text-slate-500 text-xs">
          当前时间: <span className="font-mono bg-slate-100 px-2 py-1 rounded">2026-05-20 UTC</span>
        </div>
      </div>

      {/* Row 1: Study Action Triggers (Four-Column layout including the 学习日历) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        {/* 学习动态 Feed container */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-[340px] xl:col-span-3 md:col-span-1">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              学习动态
            </h3>
            <button 
              onClick={() => {
                if (setSpaceActiveTab) {
                  setSpaceActiveTab('学习历史');
                }
                setActiveView('space');
              }}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer font-semibold transition-colors"
            >
              学习历史 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
            {activities.map((act) => (
              <div 
                key={act.id} 
                onClick={() => handleActivityClick(act.id)}
                className="flex gap-3 text-sm items-start p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group text-left w-full border border-transparent hover:border-slate-100"
                title="点击穿透关联，跳转至学习空间详细历史记录"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-base shrink-0 select-none group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 leading-normal text-xs font-semibold group-hover:text-blue-600 transition-colors truncate">
                    {act.text}
                  </p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 font-mono">{act.time}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all self-center shrink-0 translate-x-[-4px] group-hover:translate-x-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 待完成任务 Item list */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-[340px] xl:col-span-4 md:col-span-1">
          <div className="flex justify-between items-center mb-4 shrink-0 font-sans">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                待完成任务
              </h3>
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full select-none">
                {tasks.filter(t => t.status !== '已完成').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setNewTaskTitle('');
                  setNewTaskType('学习');
                  setNewTaskDeadline('截止：今日 23:59');
                  setIsAddTaskOpen(true);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-0.5 rounded-full cursor-pointer transition-all hover:scale-102"
                title="快速录入待办任务"
              >
                <Plus className="w-3 h-3 text-blue-500 shrink-0" />
                <span>新增待办</span>
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto pr-1 space-y-4 no-scrollbar">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex flex-col border-b border-slate-100 pb-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${task.badgeStyle} h-fit whitespace-nowrap`}>
                      {task.type}
                    </span>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium text-slate-800 leading-normal">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10.5px] text-slate-400 font-medium">{task.deadline}</span>
                        {task.reminderTime && (
                          <span className="text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-bold text-[9px] inline-flex items-center gap-0.5 animate-pulse">
                            🔔 提醒:{task.reminderTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.status !== '已完成' && (
                      <button 
                        onClick={() => {
                          if (activeTaskSetupId === task.id) {
                            setActiveTaskSetupId(null);
                          } else {
                            setActiveTaskSetupId(task.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          task.reminderTime 
                            ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50'
                        }`}
                        title="设置定时专注提醒"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    {task.status !== '已完成' ? (
                      <button 
                        onClick={() => handleTaskAction(task.id)}
                        className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full whitespace-nowrap hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer font-bold animate-fadeIn"
                      >
                        去完成
                      </button>
                    ) : (
                      <span className="text-xs text-green-500 font-semibold px-2 py-1 brand-completed select-none flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" /> 已完成
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline countdown schedule picker */}
                {task.status !== '已完成' && activeTaskSetupId === task.id && (
                  <div className="mt-2.5 p-3 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-2 animate-fadeIn relative">
                    <div className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                      <span>⏲️ 设定微倒计时 (系统桌面级高强度督测提醒):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button 
                        onClick={() => handleScheduleReminder(task.id, 10, '10秒后')}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200/50 transition-all cursor-pointer shadow-3xs"
                      >
                        ⚡ 10秒后 (测试)
                      </button>
                      <button 
                        onClick={() => handleScheduleReminder(task.id, 60, '1分钟后')}
                        className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        1分钟后
                      </button>
                      <button 
                        onClick={() => handleScheduleReminder(task.id, 1800, '30分钟后')}
                        className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        30分钟后
                      </button>
                      <button 
                        onClick={() => handleScheduleReminder(task.id, 3600, '1小时后')}
                        className="text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        1小时后
                      </button>
                      <button 
                        onClick={() => {
                          setTasks(tasks.map(t => t.id === task.id ? { ...t, reminderTime: '' } : t));
                          setActiveTaskSetupId(null);
                          setToastMsg('🔕 已成功清除该待办的专注提醒');
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors ml-auto cursor-pointer"
                      >
                        清除提醒
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brand-new 学习日历 Study Calendar container (Interactive) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col h-[340px] justify-between relative overflow-visible group xl:col-span-3 md:col-span-1">
          <div className="flex justify-between items-center mb-1 shrink-0">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              学习日历
              <div className="group/info relative cursor-pointer pt-0.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400 hover:text-slate-600">info</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/info:block bg-slate-950 text-white text-[10px] rounded px-2.5 py-1.5 whitespace-nowrap shadow-md z-30 font-medium font-sans">
                  展示您2024年5月份每日线上专注打卡热度
                </span>
              </div>
            </h3>
            <div className="flex items-center text-xs text-slate-500 font-bold select-none cursor-pointer hover:text-blue-600">
              <span>2024年5月</span>
              <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            </div>
          </div>

          {/* Weekday headers representing top line labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[11px] py-1 select-none shrink-0 border-b border-slate-50">
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
            <span>日</span>
          </div>

          {/* Grid of interactive days mimicking design */}
          <div className="grid grid-cols-7 gap-1 mt-1 mb-auto shrink-0 py-0.5 relative">
            {[
              { day: 29, isCurrentMonth: false, level: 0 },
              { day: 30, isCurrentMonth: false, level: 0 },
              { day: 1, isCurrentMonth: true, level: 1, hours: 1.2 },
              { day: 2, isCurrentMonth: true, level: 1, hours: 1.8 },
              { day: 3, isCurrentMonth: true, level: 3, hours: 3.5 },
              { day: 4, isCurrentMonth: true, level: 1.5, hours: 2.1 },
              { day: 5, isCurrentMonth: true, level: 4.5, hours: 5.2 },
              { day: 6, isCurrentMonth: true, level: 2, hours: 2.5 },
              { day: 7, isCurrentMonth: true, level: 1.5, hours: 1.5 },
              { day: 8, isCurrentMonth: true, level: 1, hours: 1.0 },
              { day: 9, isCurrentMonth: true, level: 3, hours: 3.8 },
              { day: 10, isCurrentMonth: true, level: 4, hours: 4.5 },
              { day: 11, isCurrentMonth: true, level: 1.5, hours: 2.2 },
              { day: 12, isCurrentMonth: true, level: 0.5, hours: 0.8 },
              { day: 13, isCurrentMonth: true, level: 1, hours: 1.1 },
              { day: 14, isCurrentMonth: true, level: 2, hours: 2.4 },
              { day: 15, isCurrentMonth: true, level: 3, hours: 3.9 },
              { day: 16, isCurrentMonth: true, level: 5, hours: 6.8, isToday: true },
              { day: 17, isCurrentMonth: true, level: 0, hours: 0 },
              { day: 18, isCurrentMonth: true, level: 0, hours: 0 },
              { day: 19, isCurrentMonth: true, level: 0, hours: 0 },
            ].map((d, index) => {
              let bgClass = "bg-transparent text-slate-800";
              if (!d.isCurrentMonth) {
                bgClass = "text-slate-300";
              } else if (d.isToday) {
                bgClass = "bg-[#186bfd] text-white font-black shadow-xs ring-2 ring-blue-300 ring-offset-1";
              } else if (d.level === 0) {
                bgClass = "text-slate-700 hover:bg-slate-50";
              } else if (d.level <= 1) {
                bgClass = "bg-[#e2edff] text-blue-800 font-semibold";
              } else if (d.level <= 2) {
                bgClass = "bg-[#bcd2ff] text-blue-900 font-semibold";
              } else if (d.level <= 3) {
                bgClass = "bg-[#8ab1ff] text-white font-semibold";
              } else if (d.level <= 4) {
                bgClass = "bg-[#548eff] text-white font-semibold";
              } else if (d.level <= 5) {
                bgClass = "bg-[#3b82f6] text-white font-semibold";
              }

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!d.isCurrentMonth) return;
                    if (d.hours && d.hours > 0) {
                      setToastMsg(`📅 5月${d.day}日：您在线专注热度打卡了 ${d.hours} 小时，完成如下：\n✔ ${DAY_STUDY_INFOS[d.day] || '随堂习题跟进与难点交互'}`);
                    } else {
                      setToastMsg(`📅 5月${d.day}日：未检索到线上行为。今日加油，快行动起来打卡复习吧！`);
                    }
                  }}
                  className={`group/day relative aspect-square sm:aspect-auto h-7 sm:h-[30px] flex items-center justify-center rounded-lg text-xs cursor-pointer transition-all active:scale-95 hover:z-30 hover:scale-105 ${bgClass}`}
                >
                  <span>{d.day}</span>

                  {/* Interactivity details tooltip floating over cell */}
                  {d.isCurrentMonth && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/day:flex flex-col bg-slate-900 text-white text-[10.5px] rounded-xl p-3 shadow-xl z-50 pointer-events-none min-w-[180px] text-left leading-relaxed font-sans border border-slate-700/60 animate-fadeIn select-none">
                      <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1 mb-1 font-bold">
                        <span className="text-blue-400 font-bold">📅 5月{d.day}日打卡</span>
                        <span className="text-amber-400 font-mono">
                          {d.hours && d.hours > 0 ? `${d.hours}h` : '0h'}
                        </span>
                      </div>
                      <div className="whitespace-normal font-semibold text-slate-200">
                        {d.hours && d.hours > 0 ? (
                          <div className="space-y-0.5">
                            <span className="block text-[9.5px] text-slate-400 font-bold">专注课程：</span>
                            <span className="block leading-snug">{DAY_STUDY_INFOS[d.day] || '自主测试及考题排查'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">本日暂无记录</span>
                        )}
                      </div>
                      {/* Triangle base arrow point */}
                      <div className="absolute top-[98%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45 border-r border-b border-slate-700/60"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color bar legend footer matching the image */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium shrink-0 pt-2 border-t border-slate-100 select-none">
            <span>学习时长:</span>
            <span>少</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[#e2edff]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#bcd2ff]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#8ab1ff]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#548eff]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#186bfd]" />
            <span>多</span>
          </div>
        </div>

        {/* 学习统计 Mini stats card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col h-[340px] xl:col-span-2 md:col-span-1 justify-between">
          <div className="flex justify-between items-center shrink-0">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-green-500 rounded-full"></span>
              学习统计
            </h3>
            <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 rounded px-1.5 py-0.5 select-none font-bold">
              本周
            </span>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-3 mt-4">
            
            {/* Metric 1 */}
            <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="w-8.5 h-8.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400">学习总时长</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-slate-800">
                    23.5 <span className="text-[10px] font-medium text-slate-500">小时</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 hover:bg-emerald-100 rounded select-none shrink-0">
                    +18%
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="w-8.5 h-8.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400">已完成课程</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-slate-800">
                    12 <span className="text-[10px] font-medium text-slate-500">门</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 hover:bg-emerald-100 rounded select-none shrink-0">
                    +2门
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="w-8.5 h-8.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400">掌握知识点</div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-slate-800">
                    248 <span className="text-[10px] font-medium text-slate-500">个</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 hover:bg-emerald-100 rounded select-none shrink-0">
                    +36个
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Row 2: Recent Courses & Recommended list split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近学习课程 layout */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800">最近学习课程</h3>
            <button 
              onClick={() => setActiveView('courses')}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer"
            >
              我的全部课程 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP9O-b2SGHsKUvlxbhEqlGDz2nWkPpPMy6A0fFFYH-7pYWvH4UkXJYQK5a2hhc-qMTZMtWODQzcPD2KqB6p2jIYDfdGe-LHCqydhtuqEVW5L3Ta7sNQq-rIsju6YnzjbpUQVAS9bEPq5JGjvsNFx5fVA5XgcuDDNHGgqgaXtoLo8_33SYcwuCsvUYGaMY2ANAybnGkgZejY86l7nvLtfQfrAR6EvW31GeT9cg4SHGEsXih4INcqmiZ2Z85d14itntXeOoLcswMlKo" 
                alt="高等数学"
                className="w-20 md:w-24 h-14 object-cover rounded-lg border border-slate-100 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate">高等数学（上）</h4>
                <p className="text-[10.5px] text-slate-500 truncate mt-0.5">上次学习：第5章 微分中值定理与应用</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">65%</span>
                </div>
              </div>
              <button 
                onClick={() => handleResumeStudy('高等数学')}
                className="px-3.5 py-1.5 border border-blue-500 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                继续学习
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp3hNEEeRTYniWQ1fJLkMggKN9an1_H2GnBYBoXi1SU--J-3tvi_5T9xjb4Vt-7SiixrpbV9rNJjr07qhW2godDIz96WLwCnPdepyXPeQCB5mmrVIzIYIL5btHKA403sF6tc_nPl6CKlUH_gq1Khx62HxlBVXzsB8vJMqGof46dTRIZVXfZOBRgOTlcfJJXppuUH6lMGAeiuOJeyiO2z0bX708ShdW7vaDBo07J0DOTbNZnBUrQjNUmZVhgD9CVL4Xw-an-uet3Mg" 
                alt="大学物理"
                className="w-20 md:w-24 h-14 object-cover rounded-lg border border-slate-100 shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate">大学物理（力学篇）</h4>
                <p className="text-[10.5px] text-slate-500 truncate mt-0.5">上次学习：第3章 动量守恒定理与碰撞机制</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">40%</span>
                </div>
              </div>
              <button 
                onClick={() => handleResumeStudy('大学物理')}
                className="px-3.5 py-1.5 border border-blue-500 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                继续学习
              </button>
            </div>
          </div>
        </div>

        {/* 推荐课程 details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
            <h3 className="font-bold text-base text-slate-800">智能推荐课程</h3>
            <button 
              onClick={handleRefreshRecommendations}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer select-none active:scale-95 transition-transform"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>换一换</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-center">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex gap-3 items-center group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <img 
                  src={rec.coverUrl} 
                  alt={rec.name}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100 border border-slate-100 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {rec.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{rec.school}</p>
                  <div className="flex items-center justify-between gap-1.5 mt-1">
                    <span className="text-[9.5px] text-slate-400">{rec.learners}</span>
                    <span className="text-[10px] text-yellow-500 flex items-center gap-0.5 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {rec.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center shrink-0">
            <button 
              onClick={() => setActiveView('courses')}
              className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 hover:underline focus:outline-none cursor-pointer"
            >
              <span>查看更多推荐课程</span>
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: AI Learn Recommendation Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-base text-slate-800">AI 学习诊断与建议</h3>
            <span className="text-[10.5px] bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-md select-none font-medium">
              基于李同学的学习数据实时对齐
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setDiagnosticsRefreshing(true);
                setTimeout(() => {
                  setDiagnosticsRefreshing(false);
                  setToastMsg("⚡ AI 学业肖像已重新多维对齐！诊断报告精度已推演更新成功。");
                }, 1200);
              }}
              disabled={diagnosticsRefreshing}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${diagnosticsRefreshing ? 'animate-spin' : ''}`} />
              <span>{diagnosticsRefreshing ? '分析中...' : '深度重新分析'}</span>
            </button>
            <button 
              onClick={() => setActiveView('space')}
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer"
            >
              掌握详情 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 知识点强化 */}
          <div 
            onClick={() => {
              setSelectedDiagCard(0);
              setDiagQuizAnswers({});
              setDiagQuizSubmitted(false);
              setAiSearchKw('');
              setAiResponse(null);
            }}
            className="bg-blue-50/40 hover:bg-blue-50 border border-blue-100/50 rounded-2xl p-4 flex flex-col justify-between h-[135px] transition-all cursor-pointer group hover:shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                  <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
                  <span>知识点强化</span>
                </div>
                <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-sm">正确率 55%</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal mt-2.5">
                你在“线性回归”和“损失计算”中正确率偏低，建议加强针对性重做。
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
              进靶场测验 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: 学习规划 */}
          <div 
            onClick={() => {
              setSelectedDiagCard(1);
              setDiagQuizAnswers({});
              setDiagQuizSubmitted(false);
              setAiSearchKw('');
              setAiResponse(null);
            }}
            className="bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 flex flex-col justify-between h-[135px] transition-all cursor-pointer group hover:shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>学习规划建议</span>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">今日推荐</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal mt-2.5">
                周考前建议每天保持 2 小时专注时段，以巩固核心链式求导公式。
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
              定制专注单 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: 薄弱点攻克 */}
          <div 
            onClick={() => {
              setSelectedDiagCard(2);
              setDiagQuizAnswers({});
              setDiagQuizSubmitted(false);
              setAiSearchKw('');
              setAiResponse(null);
            }}
            className="bg-purple-50/40 hover:bg-purple-50 border border-purple-100/50 rounded-2xl p-4 flex flex-col justify-between h-[135px] transition-all cursor-pointer group hover:shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>薄弱知识点</span>
                </div>
                <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-sm">2次错题</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal mt-2.5">
                机器学习中的“链式梯度求导”出错多次，建议利用重做本二次消化。
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
              去智能求导 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: 资源建议 */}
          <div 
            onClick={() => {
              setSelectedDiagCard(3);
              setDiagQuizAnswers({});
              setDiagQuizSubmitted(false);
              setAiSearchKw('');
              setAiResponse(null);
              setIsVideoPlaying(false);
              setVideoTimestamp(105);
            }}
            className="bg-amber-50/40 hover:bg-amber-50 border border-amber-100/50 rounded-2xl p-4 flex flex-col justify-between h-[135px] transition-all cursor-pointer group hover:shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>补充资源推荐</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm">3m20s视频</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal mt-2.5">
                为你学理深度匹配了清华大学副教授《MSE 课程答疑视频》，强烈建议一看！
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">
              在线放映厅 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Interactive AI Diagnosis Popover Modal */}
      <AnimatePresence>
        {selectedDiagCard !== null && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] border border-slate-100 shadow-2xl flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md select-none font-bold">
                    {selectedDiagCard === 0 && <Zap className="w-5 h-5 fill-white" />}
                    {selectedDiagCard === 1 && <Calendar className="w-5 h-5" />}
                    {selectedDiagCard === 2 && <Target className="w-5 h-5" />}
                    {selectedDiagCard === 3 && <Video className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-slate-800">
                      {selectedDiagCard === 0 && "🎯 AI 强化诊断工作台：线性回归与损失函数"}
                      {selectedDiagCard === 1 && "⏰ AI 智能学业规划拟合器"}
                      {selectedDiagCard === 2 && "✏️ 复合求导算法数理答疑靶场"}
                      {selectedDiagCard === 3 && "🎥 多媒体放映厅：最小二乘法与均方估算"}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {selectedDiagCard === 1 ? "一键推演定制你今日的专注微课阶段" : "自适应诊疗卡片 · 学业诊断答疑系统"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDiagCard(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Modal Core Layout Split */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                
                {/* Left Column: Diagnostics and Quick QA Help */}
                <div className="lg:col-span-5 border-r border-slate-100 p-5 bg-slate-50/35 overflow-y-auto flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Diagnostic Summary Section */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                        学业肖像建议
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {selectedDiagCard === 0 && "你在线性自变量回归方程拟合时的导数变动理解有所卡点。偏重拟合大误差会驱使模型在回归斜面上偏离最佳航线。"}
                        {selectedDiagCard === 1 && "分析发现你的早晨专注指数最佳。今日有一门《机器学习基础》考核在即，建议设立一个番茄钟突击核心考点。"}
                        {selectedDiagCard === 2 && "网络反向传播求导数是核心难点。链式求导规则本质上是各层复合乘阶雅可比相乘，需要特别留意定义域极限。"}
                        {selectedDiagCard === 3 && "本视频精选清华大学高水平辅助讲堂。不仅直观画出均方差 MSE 与 MAE 在不同参数斜面下的优化过程，更剖析了其对噪点的影响机制。"}
                      </p>
                    </div>

                    {/* Formula / Concept Tip Sheet */}
                    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs flex flex-col gap-2 relative shadow-inner">
                      <span className="absolute top-2.5 right-2.5 text-[8.5px] uppercase font-bold tracking-wider text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">RAG REFERENCE</span>
                      <h4 className="text-[10px] font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                        🔬 数理表达式精炼
                      </h4>
                      {selectedDiagCard === 0 && (
                        <>
                          <div className="border-b border-slate-800 pb-1.5 text-slate-300">
                            线性方程: <span className="text-emerald-400 font-bold">y = wx + b</span>
                          </div>
                          <div className="text-slate-300">
                            均方差 (MSE):
                            <span className="block text-[11px] text-sky-300 mt-1 font-semibold">
                              L = (1/n) * Σ (y_true - y_pred)²
                            </span>
                          </div>
                        </>
                      )}
                      {selectedDiagCard === 1 && (
                        <>
                          <div className="border-b border-slate-800 pb-1.5 text-slate-300">
                            推荐模式: <span className="text-emerald-400 font-bold">番茄轮作 (Pomodoro)</span>
                          </div>
                          <div className="text-slate-300">
                            认知收益比:
                            <span className="block text-[11.5px] text-sky-300 mt-1 font-semibold">
                              25m 深度专注 + 5m 自然脑力放松
                            </span>
                          </div>
                        </>
                      )}
                      {selectedDiagCard === 2 && (
                        <>
                          <div className="border-b border-slate-800 pb-1.5 text-slate-300">
                            复合链式导数: <span className="text-emerald-400 font-bold">dy/dx = (dy/du) * (du/dx)</span>
                          </div>
                          <div className="text-slate-300">
                            Log求导:
                            <span className="block text-[11.5px] text-sky-300 mt-1 font-semibold">
                              d(ln u)/dx = (1/u) * u'
                            </span>
                          </div>
                        </>
                      )}
                      {selectedDiagCard === 3 && (
                        <>
                          <div className="border-b border-slate-800 pb-1.5 text-slate-300">
                            视频知识体系: <span className="text-emerald-400 font-bold">代价函数与残差平方</span>
                          </div>
                          <div className="text-slate-300">
                            核心论证点:
                            <span className="block text-[11px] text-sky-300 mt-1 font-semibold">
                              极大似然逼近与二次均方和的等价论证
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Quick Q&A input bar */}
                  <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-sky-500 animate-pulse" />
                      对该考点有困惑？向 AI 导师提问：
                    </h5>
                    
                    {/* Pre-populated Prompt Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => {
                          const prompt = selectedDiagCard === 0 ? "用简单生动的话解释下究竟什么是均方损失(MSE)？" :
                                         selectedDiagCard === 1 ? "怎么高效管理每天的机器学习自修时间规划？" :
                                         selectedDiagCard === 2 ? "求导中的反向传播链式原理能用大白话讲讲吗？" :
                                         "高德/清华名师课中极大似然等于MSE的前提条件是什么？";
                          setAiSearchKw(prompt);
                          handleSendAiQuestion(prompt);
                        }}
                        className="text-[10px] bg-sky-50/50 hover:bg-sky-100/60 text-sky-700 font-bold px-2 py-1 rounded-lg border border-sky-100 select-none cursor-pointer text-left truncate max-w-full"
                      >
                        ❓ 核心痛点通俗讲解
                      </button>
                      <button 
                        onClick={() => {
                          const prompt = selectedDiagCard === 0 ? "用 Numpy 帮我手写一遍 MSE 和 MAE 指标计算代码" :
                                         selectedDiagCard === 1 ? "提供一个大学英语四级加高数混合学习的作息表示例" :
                                         selectedDiagCard === 2 ? "用 Python 实现神经网络一个简单前向求导算例" :
                                         "写段 Python 演示极大似然估计的数学最优化仿真";
                          setAiSearchKw(prompt);
                          handleSendAiQuestion(prompt);
                        }}
                        className="text-[10px] bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 font-bold px-2 py-1 rounded-lg border border-purple-100 select-none cursor-pointer text-left truncate max-w-full"
                      >
                        💻 Python 极简代码实践
                      </button>
                    </div>

                    {/* Chat Question Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="输入您的疑问 (例如: “如何判断可导”)..."
                        value={aiSearchKw}
                        onChange={(e) => setAiSearchKw(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendAiQuestion();
                        }}
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-sky-500 shadow-3xs"
                      />
                      <button 
                        onClick={() => handleSendAiQuestion()}
                        disabled={aiSearchLoading || !aiSearchKw.trim()}
                        className="w-8.5 h-8.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-900 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chat Response Area */}
                    {(aiSearchLoading || aiResponse) && (
                      <div className="bg-white rounded-xl border border-slate-150 p-3 shadow-2xs max-h-[160px] overflow-y-auto text-xs text-left animate-fadeIn">
                        {aiSearchLoading ? (
                          <div className="space-y-2 py-1">
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 animate-pulse">
                              <RefreshCcw className="w-3 h-3 animate-spin text-sky-500" />
                              AI 导师正在精密检索教学参考库...
                            </p>
                            <div className="h-2.5 bg-slate-100 rounded-md animate-pulse"></div>
                            <div className="h-2.5 bg-slate-100 rounded-md animate-pulse w-5/6"></div>
                          </div>
                        ) : (
                          <div className="text-[11px] leading-relaxed text-slate-700 text-left whitespace-pre-wrap select-text">
                            <strong>AI反馈：</strong>{aiResponse}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Quiz Arena, Video Deck, or Planner Panel */}
                <div className="lg:col-span-7 p-6 flex flex-col overflow-y-auto justify-between h-full bg-slate-50/15">
                  
                  {/* Scenario A: Quiz Panel (Card 1 AND Card 3) */}
                  {(selectedDiagCard === 0 || selectedDiagCard === 2) && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded select-none">
                          Adaptive Practice Arena
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-orange-500 select-none">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span>答对即录入成长肖像</span>
                        </div>
                      </div>

                      {DIAGNOSIS_QUIZZES[selectedDiagCard]?.questions?.map((item, qIdx) => {
                        const savedSelectedIdx = diagQuizAnswers[qIdx];
                        return (
                          <div key={qIdx} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
                            <h5 className="font-bold text-slate-800 text-xs md:text-sm mb-3">
                              {item.question}
                            </h5>
                            
                            <div className="grid grid-cols-1 gap-2.5">
                              {item.options.map((opt, optIdx) => {
                                const isSelected = savedSelectedIdx === optIdx;
                                const isCorrect = item.correct === optIdx;
                                
                                // Color evaluation when submitted
                                let borderClass = "border-slate-200 hover:border-blue-400 hover:bg-blue-50/10";
                                let bgClass = "bg-white";
                                let textClass = "text-slate-700";

                                if (diagQuizSubmitted) {
                                  if (isCorrect) {
                                    borderClass = "border-emerald-300 bg-emerald-50/30";
                                    textClass = "text-emerald-800 font-bold";
                                  } else if (isSelected) {
                                    borderClass = "border-red-350 bg-red-50/30";
                                    textClass = "text-red-800 font-bold";
                                  } else {
                                    borderClass = "border-slate-100 opacity-60";
                                  }
                                } else if (isSelected) {
                                  borderClass = "border-blue-500 bg-blue-50/20";
                                  textClass = "text-blue-700 font-bold";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      if (diagQuizSubmitted) return;
                                      setDiagQuizAnswers(prev => ({
                                        ...prev,
                                        [qIdx]: optIdx
                                      }));
                                    }}
                                    disabled={diagQuizSubmitted}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${borderClass} ${bgClass}`}
                                  >
                                    <span className={textClass}>{opt}</span>
                                    {isSelected && !diagQuizSubmitted && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                                    )}
                                    {diagQuizSubmitted && isCorrect && (
                                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                        <Check className="w-3.5 h-3.5 bg-emerald-100 rounded-full p-0.5 stroke-[3]" /> 正确
                                      </span>
                                    )}
                                    {diagQuizSubmitted && isSelected && !isCorrect && (
                                      <span className="text-[10px] text-red-650 font-bold">错误</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Question feedback reasoning when submitted */}
                            {diagQuizSubmitted && (
                              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-500 select-text">
                                {item.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Question Control Actions */}
                      <div className="mt-5 pt-3 border-t border-slate-150 flex items-center justify-between">
                        <div>
                          {diagQuizSubmitted && (
                            <p className="text-xs font-bold text-slate-500">
                              本次热身得分：{" "}
                              <span className="text-blue-600 text-sm font-extrabold">
                                {Object.keys(diagQuizAnswers).filter(
                                  (qIdx: any) => diagQuizAnswers[qIdx] === DIAGNOSIS_QUIZZES[selectedDiagCard]?.questions[qIdx]?.correct
                                ).length}
                              </span>
                              {" / 3"} 正确
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!diagQuizSubmitted ? (
                            <button
                              onClick={() => {
                                if (Object.keys(diagQuizAnswers).length < 3) {
                                  setToastMsg("⚠️ 请先认真完成这 3 道强化测验题后再行智能提交批改哦。");
                                  return;
                                }
                                setDiagQuizSubmitted(true);
                              }}
                              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                              ✍️ 确认做题并进行 AI 批改
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setDiagQuizAnswers({});
                                  setDiagQuizSubmitted(false);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs transition-colors cursor-pointer"
                              >
                                🔄 重新做题
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDiagCard(null);
                                  setToastMsg("🎉 妙不可言！答题并批改完毕，您的学业数据肖像已注入新的成长拟合线。");
                                }}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                              >
                                💾 确认同步数据并关闭
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scenario B: Study Schedule Planner (Card 2) */}
                  {selectedDiagCard === 1 && (
                    <div className="space-y-6 flex flex-col justify-between h-full">
                      <div className="space-y-4">
                        <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 select-none">AI Study Pomodoro Controller</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded border border-emerald-100 select-none">
                            实时打通 pending-tasks 面板
                          </span>
                        </div>

                        {/* Drag Pomodoro slider */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-4">
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <strong>1. 选择设定本日建议专注时长</strong>
                            <span className="text-indigo-600 font-extrabold text-base">{customPlanMinutes} 分钟</span>
                          </div>
                          
                          {/* Slider control widget bar */}
                          <div className="relative pt-2">
                            <input 
                              type="range" 
                              min="15" 
                              max="120" 
                              step="5"
                              value={customPlanMinutes}
                              onChange={(e) => setCustomPlanMinutes(Number(e.target.value))}
                              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                              <span>15分 (热身)</span>
                              <span>45分 (经典)</span>
                              <span>90分 (高能)</span>
                              <span>120分 (极限)</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Picker widgets */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs space-y-3">
                          <p className="text-xs font-bold text-slate-700">2. 预设本专注强度的核心辅学课题：</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => setCustomPlanMinutes(25)}
                              className={`border p-2.5 rounded-xl text-left transition-all cursor-pointer ${customPlanMinutes === 25 ? 'bg-indigo-50/50 border-indigo-300 text-indigo-700 font-bold' : 'border-slate-100 hover:bg-slate-50 text-slate-600 text-[11px]'}`}
                            >
                              <div className="text-xs font-extrabold flex items-center gap-1">⏱️ Pomodoro</div>
                              <div className="text-[9.5px] mt-1 font-semibold text-slate-400">25m 深度轻度热身</div>
                            </button>
                            <button 
                              onClick={() => setCustomPlanMinutes(45)}
                              className={`border p-2.5 rounded-xl text-left transition-all cursor-pointer ${customPlanMinutes === 45 ? 'bg-indigo-50/50 border-indigo-300 text-indigo-700 font-bold' : 'border-slate-100 hover:bg-slate-50 text-slate-600 text-[11px]'}`}
                            >
                              <div className="text-xs font-extrabold flex items-center gap-1">📚 Study block</div>
                              <div className="text-[9.5px] mt-1 font-semibold text-slate-400">45m 经典高能攻坚</div>
                            </button>
                          </div>
                        </div>

                        {/* Semester trajectory simulation roadmap block */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans text-xs">
                          <h5 className="font-bold text-slate-700 mb-2">3. 预测路线里程碑进度</h5>
                          <div className="relative pl-6 space-y-3 mt-3">
                            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-slate-200" />
                            
                            <div className="relative">
                              <span className="absolute -left-6 bg-emerald-500 text-white rounded-full p-0.5 text-[8px] border-2 border-white">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                              <div className="text-[11px] font-semibold text-slate-700">凸优化代价函数定义</div>
                              <div className="text-[9px] text-slate-400 font-semibold">已攻克 65% 正确率</div>
                            </div>

                            <div className="relative">
                              <span className="absolute -left-[22px] bg-blue-500 rounded-full w-2 h-2 border-2 border-white mt-1 animate-ping" />
                              <span className="absolute -left-[22px] bg-blue-500 rounded-full w-2 h-2 border-2 border-white mt-1" />
                              <div className="text-[11px] font-black text-slate-800">链式参数偏微分求逆 (攻克中)</div>
                              <div className="text-[9px] text-blue-500 font-semibold">今天通过 3 题靶场测试即可完成打卡</div>
                            </div>

                            <div className="relative">
                              <span className="absolute -left-[21px] bg-slate-300 rounded-full w-1.5 h-1.5 border border-white mt-1" />
                              <div className="text-[11px] font-semibold text-slate-400">本周四: 神经网络多维推演小测</div>
                              <div className="text-[9px] text-slate-400">未开始</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Planner actions */}
                      <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDiagCard(null)}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 text-slate-500 font-bold transition-all cursor-pointer"
                        >
                          不设立，直接关闭
                        </button>
                        <button 
                          onClick={handleAddCustomPlanToTasks}
                          className="px-5 py-2 bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:border-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          🚀 生成专属专注任务到待完成列表
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scenario C: Simulated Curated Classroom Video (Card 4) */}
                  {selectedDiagCard === 3 && (
                    <div className="space-y-4 flex flex-col justify-between h-full">
                      <div className="space-y-4">
                        <div className="border-b border-slate-150 pb-2.5 flex justify-between items-center select-none">
                          <span className="text-xs font-bold text-slate-400">RAG Smart Media Player</span>
                          <span className="text-[10px] bg-amber-50 text-amber-600 font-black px-2 py-0.5 rounded border border-amber-100">
                            清华大学精选课堂 · 可操纵播放轨
                          </span>
                        </div>

                        {/* Interactive Video Player Shell */}
                        <div className="relative bg-[#0d1326] border border-slate-850 rounded-2xl aspect-video w-full overflow-hidden shadow-xl flex flex-col justify-between group">
                          
                          {/* Inner styled screen mockup */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-6">
                            
                            {/* Graphic simulation of video */}
                            {isVideoPlaying ? (
                              <div className="flex items-center gap-2 animate-fadeIn select-none">
                                <div className="w-1.5 h-6 bg-blue-500/80 rounded-md animate-[bounce_0.8s_infinite]" />
                                <div className="w-1.5 h-10 bg-sky-500/80 rounded-md animate-[bounce_0.6s_infinite_0.1s]" />
                                <div className="w-1.5 h-14 bg-indigo-500 rounded-md animate-[bounce_0.9s_infinite_0.15s]" />
                                <div className="w-1.5 h-12 bg-sky-500/85 rounded-md animate-[bounce_0.7s_infinite_0.2s]" />
                                <div className="w-1.5 h-5 bg-blue-500/80 rounded-md animate-[bounce_0.5s_infinite_0.3s]" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => setIsVideoPlaying(true)}
                                className="w-16 h-16 rounded-full bg-blue-600/90 border border-blue-500 text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
                              >
                                <Play className="w-7 h-7 fill-white translate-x-0.5 stroke-[2.5]" />
                              </button>
                            )}

                            {/* Caption sub-text overlay based on timer */}
                            <div className="absolute bottom-16 left-6 right-6 text-center text-xs text-slate-300 font-semibold px-4 py-2 bg-slate-900/80 rounded-xl backdrop-blur-3xs border border-slate-850 shadow-md">
                              {videoTimestamp < 50 && "🎙️ 视频导学：这就是我们通常探讨的二次残差极小值，它的最优斜面是个凸碗面。"}
                              {videoTimestamp >= 50 && videoTimestamp < 120 && "🎙️ 视频解析：二次平方会驱使我们在损失拟合中极其敏感地抗阻异常离群点。"}
                              {videoTimestamp >= 120 && "🎙️ 总结：通过 Numpy 框架代码手算，我们可以轻松掌握其反向传播求极值法则。"}
                            </div>
                          </div>

                          {/* Top bar indicators */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] text-slate-400 font-mono select-none">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              AI 课堂 RAG 放映中
                            </span>
                            <span>清华大学副教授 · 主讲</span>
                          </div>

                          {/* Control panel deck overlay container */}
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-850 p-3 select-none flex items-center justify-between gap-4 font-mono">
                            <button
                              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-850 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              {isVideoPlaying ? (
                                <Pause className="w-4 h-4 text-slate-300 fill-slate-300" />
                              ) : (
                                <Play className="w-4 h-4 text-slate-300 fill-slate-300" />
                              )}
                            </button>

                            {/* Elapsed timer */}
                            <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {formatVideoTime(videoTimestamp)} / 03:20
                            </div>

                            {/* Progress bar scrub widget */}
                            <div className="flex-1 relative flex items-center">
                              <input 
                                type="range" 
                                min="0" 
                                max="200" 
                                value={videoTimestamp}
                                onChange={(e) => setVideoTimestamp(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interactive timestamp bookmarks */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs space-y-2 text-xs">
                          <p className="font-bold text-slate-700 flex items-center gap-1 mb-2">
                            <Clock className="w-3.5 h-3.5 text-blue-550" />
                            视频秒级高能秒懂笔记打点：
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setVideoTimestamp(25);
                                setIsVideoPlaying(true);
                              }}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${videoTimestamp >= 20 && videoTimestamp < 70 ? 'bg-indigo-50/40 border-indigo-200 font-semibold' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                              <span className="text-indigo-650 font-bold block font-mono text-[10.5px]">00:25 秒懂</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block truncate">一维损失对数极大似然定理</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setVideoTimestamp(115);
                                setIsVideoPlaying(true);
                              }}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${videoTimestamp >= 70 && videoTimestamp < 150 ? 'bg-indigo-50/40 border-indigo-200 font-semibold' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                              <span className="text-indigo-650 font-bold block font-mono text-[10.5px]">01:55 深度探究</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block truncate">残差大误差平方惩罚原理</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setVideoTimestamp(180);
                                setIsVideoPlaying(true);
                              }}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${videoTimestamp >= 150 ? 'bg-indigo-50/40 border-indigo-200 font-semibold' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                              <span className="text-indigo-650 font-bold block font-mono text-[10.5px]">03:00 收尾演练</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block truncate">NumPy矩阵梯度最优化计算</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Video Deck Control */}
                      <div className="pt-4 border-t border-slate-150 flex justify-end gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedDiagCard(null);
                            setIsVideoPlaying(false);
                            setToastMsg("📚 辅学视频学习打卡记录成功，系统已自动录入该知识点到学习历史。");
                          }}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          🎉 标记本节视频微课已掌握
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Add Task Custom Modal */}
      <AnimatePresence>
        {isAddTaskOpen && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  📝 快速录入今日学习待办
                </span>
                <button 
                  onClick={() => setIsAddTaskOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer pt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                {/* Task Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-500 font-bold">待办类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: '作业', label: '📝 今日作业', class: 'border-red-200 text-red-600 bg-red-50/40' },
                      { type: '考试', label: '🏆 自测考试', class: 'border-orange-200 text-orange-600 bg-orange-50/40' },
                      { type: '学习', label: '📖 专注学习', class: 'border-blue-200 text-blue-600 bg-blue-50/40' }
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setNewTaskType(opt.type as any)}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          newTaskType === opt.type 
                            ? `${opt.class} border-2 scale-102` 
                            : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-500 font-bold">任务主题描述 (支持输入书名/章节)</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="例如：《高等数学》第7章 换元积分课后练习"
                    className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-500 font-bold">截止日期/时限</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="截止：今日 23:59"
                    className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!newTaskTitle.trim()}
                  onClick={() => {
                    const id = `custom-${Date.now()}`;
                    let badgeStyle = 'bg-blue-50 text-blue-500 border border-blue-100';
                    if (newTaskType === '作业') badgeStyle = 'bg-red-50 text-red-500 border border-red-100';
                    if (newTaskType === '考试') badgeStyle = 'bg-orange-50 text-orange-500 border border-orange-100';

                    setTasks((prev: any[]) => [
                      {
                        id,
                        type: newTaskType,
                        title: newTaskTitle,
                        deadline: newTaskDeadline || '截止：今日 23:59',
                        status: '待完成',
                        badgeStyle,
                        reminderTime: ''
                      },
                      ...prev
                    ]);
                    setIsAddTaskOpen(false);
                    setToastMsg(`✨ 新学业计划已加载！待办已同步加入学习序列。`);
                  }}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
                    newTaskTitle.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' 
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  确认加入督学序列
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Complete Task Modal */}
      <AnimatePresence>
        {currentCompletingTask && (
          <div className="fixed inset-0 z-[10010] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-200 text-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-left"
            >
              {/* Header */}
              <div className="p-6 md:p-7 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl text-white shadow-lg animate-pulse">
                    <Target className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      待办速通与自测系统
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Active Sandbox
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">正在进行课题冲刺：{currentCompletingTask.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setCurrentCompletingTask(null);
                    setPomoIsActive(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* 1. HOMEWORK TYPE */}
                {currentCompletingTask.type === '作业' && (
                  <div className="space-y-5">
                    <div className="bg-red-500/10 border border-red-500/15 p-4 rounded-2xl flex gap-3.5 items-start">
                      <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg shrink-0">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-red-400">微作业冲关考验说明</p>
                        <p className="text-slate-300 font-medium leading-relaxed">
                          为提升线上教育的高保质水平，需要对本章核心考点进行两道选择微测题打卡。全对即可完成课程章节并记录一次提交记录。成绩直接计入档案！
                        </p>
                      </div>
                    </div>

                    {!homeworkSubmitted ? (
                      <div className="space-y-5">
                        {/* Question 1 */}
                        <div className="bg-slate-950/40 p-4 rounded-xl space-y-3.5 border border-slate-850">
                          <p className="text-xs md:text-sm font-extrabold text-slate-100 text-left">
                            Q1. 当 <span className="font-mono text-cyan-400 text-xs">x → 0</span> 时，对数复合式 <span className="font-mono text-cyan-400 text-xs">ln(1 + x)</span> 的最直接等价无穷小量是？
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[
                              { key: 0, text: 'A. x' },
                              { key: 1, text: 'B. x²' },
                              { key: 2, text: 'C. eˣ' },
                              { key: 3, text: 'D. sin x' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setHomeworkAnswers(prev => ({ ...prev, 1: opt.key }))}
                                className={`p-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                  homeworkAnswers[1] === opt.key 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                    : 'border-slate-800 text-slate-405 hover:bg-slate-800/40'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {homeworkAnswers[1] === opt.key && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">SELECTED</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Question 2 */}
                        <div className="bg-slate-950/40 p-4 rounded-xl space-y-3.5 border border-slate-850">
                          <p className="text-xs md:text-sm font-extrabold text-slate-100 text-left">
                            Q2. 二分查找算法 (Binary Search) 用于在有序数组中定位指定值，其时间复杂度为？
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[
                              { key: 0, text: 'A. O(n)' },
                              { key: 1, text: 'B. O(n log n)' },
                              { key: 2, text: 'C. O(log n)' },
                              { key: 3, text: 'D. O(1)' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setHomeworkAnswers(prev => ({ ...prev, 2: opt.key }))}
                                className={`p-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                  homeworkAnswers[2] === opt.key 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                    : 'border-slate-800 text-slate-405 hover:bg-slate-800/40'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {homeworkAnswers[2] === opt.key && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">SELECTED</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/15 p-5 rounded-2xl space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <span className="p-1 px-2 text-[10px] rounded bg-emerald-600 text-white font-extrabold">PASS</span>
                          <h4 className="text-xs md:text-sm font-bold text-emerald-400">作业智能审核通过！成绩等级：100% 卓越 (A+)</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                          解析：Q1. 根据泰勒展开或基本极限法则，由余项推导，当 x→0 时 ln(1+x)~x，即等价无穷小为x；Q2. 二分查找每次对检索区间折半，故层数为 log n 级，最坏时间复杂度为 O(log n)。系统已成功计入绩点分！
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleCompleteTaskSuccessfully(currentCompletingTask.id);
                              setCurrentCompletingTask(null);
                            }}
                            className="px-6 py-2 rounded-xl bg-emerald-600 font-bold text-white text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            收留成果并退回首页
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. EXAM TYPE */}
                {currentCompletingTask.type === '考试' && (
                  <div className="space-y-5">
                    <div className="bg-amber-500/10 border border-amber-500/15 p-4 rounded-2xl flex gap-3.5 items-start">
                      <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                        <Timer className="w-4 h-4 text-amber-450 animate-pulse" />
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-extrabold text-amber-400">期中/期末线上摸底自测仿真检验</p>
                        <p className="text-slate-300 font-medium leading-relaxed">
                          您正在请求速通：{currentCompletingTask.title}！本模块含两道计算机与网络的核心多选测试。提交后自动记录考试归档！
                        </p>
                      </div>
                    </div>

                    {!examSubmitted ? (
                      <div className="space-y-5">
                        {/* Question 1 */}
                        <div className="bg-slate-950/40 p-4 rounded-xl space-y-3.5 border border-slate-850">
                          <p className="text-xs md:text-sm font-extrabold text-slate-100 text-left">
                            Q1. TCP网络数据传输协议中，经典用于拥塞控制、快速重传与避免雪崩死锁的最经典滑动窗口机制是？
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[
                              { key: 0, text: 'A. 慢启动与拥塞避免滑动机制' },
                              { key: 1, text: 'B. 停止-等待发送模型' },
                              { key: 2, text: 'C. 奇偶冗余检测技术' },
                              { key: 3, text: 'D. 自适应多路复用信道化' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setExamAnswers(prev => ({ ...prev, 1: opt.key }))}
                                className={`p-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                  examAnswers[1] === opt.key 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                    : 'border-slate-800 text-slate-405 hover:bg-slate-800/40'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {examAnswers[1] === opt.key && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">SELECTED</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Question 2 */}
                        <div className="bg-slate-950/40 p-4 rounded-xl space-y-3.5 border border-slate-850">
                          <p className="text-xs md:text-sm font-extrabold text-slate-100 text-left">
                            Q2. 操作系统死锁发生的四个必要条件中，破坏哪一常用条件最容易预防并终止全局无限等待现象？
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[
                              { key: 0, text: 'A. 互斥使用条件' },
                              { key: 1, text: 'B. 循环等待依赖条件' },
                              { key: 2, text: 'C. 抢占不剥夺原则' },
                              { key: 3, text: 'D. 维持并保持占用分配状态' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setExamAnswers(prev => ({ ...prev, 2: opt.key }))}
                                className={`p-3 text-left rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                  examAnswers[2] === opt.key 
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                                    : 'border-slate-800 text-slate-405 hover:bg-slate-800/40'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {examAnswers[2] === opt.key && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">SELECTED</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/15 p-5 rounded-2xl space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <span className="p-1 px-2 text-[10px] rounded bg-amber-500 text-slate-900 font-extrabold">SUBMITTED</span>
                          <h4 className="text-xs md:text-sm font-bold text-emerald-400">试卷提交评分成功！总成绩：100分 (Excellent)</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                          解析：考题自评完全吻合教科极值。TCP拥塞避免利用滑动窗口进行流量整形确保低延迟高吞吐，操作系统最著名的是使用资源按序分配策略来强行剔除“循环等待”，预防发生系统锁死。试卷已加载到档案夹。
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleCompleteTaskSuccessfully(currentCompletingTask.id);
                              setCurrentCompletingTask(null);
                            }}
                            className="px-6 py-2 rounded-xl bg-orange-600 font-bold text-white text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            归档并提取成绩
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STUDY TYPE */}
                {currentCompletingTask.type === '学习' && (
                  <div className="space-y-6 text-center">
                    <div className="max-w-md mx-auto text-center space-y-3">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">番茄深度专注空间</p>
                      <h4 className="text-sm font-extrabold text-white">
                        🎯 心流时间筒保护：{currentCompletingTask.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                        在开启后，番茄钟将为你定制25分钟的不间断屏蔽专注窗口。中途请勿切换以维持完美的大脑前额叶多巴胺心流节律！
                      </p>
                    </div>

                    {pomoSubMode === 'intro' && (
                      <div className="space-y-6 py-4">
                        <div className="bg-slate-950 rounded-2xl py-6 max-w-[280px] mx-auto border border-slate-800 flex items-center justify-center font-mono text-5xl font-extrabold text-slate-500 select-none">
                          25 : 00
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPomoMinutes(25);
                            setPomoSeconds(0);
                            setPomoSubMode('active');
                            setPomoIsActive(true);
                          }}
                          className="px-8 py-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white text-xs md:text-sm shadow-lg active:scale-95 transition-all text-center inline-flex items-center gap-2 cursor-pointer border border-blue-400/20"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>启航 25分钟 专注飞盘</span>
                        </button>
                      </div>
                    )}

                    {pomoSubMode === 'active' && (
                      <div className="space-y-6 py-4">
                        <div className="bg-slate-950 rounded-2xl py-8 max-w-[280px] mx-auto border border-slate-800/80 flex flex-col items-center justify-center font-mono relative shadow-inner">
                          <span className="text-5xl md:text-6xl font-extrabold text-blue-400 tracking-wider">
                            {pomoMinutes < 10 ? `0${pomoMinutes}` : pomoMinutes} : {pomoSeconds < 10 ? `0${pomoSeconds}` : pomoSeconds}
                          </span>
                          <span className="text-[9px] text-blue-450 font-bold tracking-widest uppercase mt-2.5 animate-pulse">
                            {pomoIsActive ? '⚡ 脑电极值深度波段中' : '⏸️ 专注窗口临时暂停'}
                          </span>
                        </div>

                        {/* 演示快速模式选择开关 */}
                        <div className="flex items-center justify-center gap-2 max-w-sm mx-auto bg-slate-955 p-2.5 rounded-xl border border-slate-800/50">
                          <input 
                            type="checkbox" 
                            id="speedyPomo" 
                            checked={isSpeedyPomo}
                            onChange={(e) => setIsSpeedyPomo(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-850 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer text-xs"
                          />
                          <label htmlFor="speedyPomo" className="text-[10px] text-slate-400 font-bold select-none cursor-pointer">
                            ⚡ 超级演示加速挂件 (开启后一秒抵一分，10秒通关！)
                          </label>
                        </div>

                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPomoIsActive(!pomoIsActive)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                              pomoIsActive 
                                ? 'bg-slate-800 text-slate-350 hover:bg-slate-750' 
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                          >
                            {pomoIsActive ? '暂停专注' : '恢复专注'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPomoIsActive(false);
                              setPomoSubMode('intro');
                            }}
                            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-xs font-bold"
                          >
                            放弃本次
                          </button>
                        </div>
                      </div>
                    )}

                    {pomoSubMode === 'done' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div className="bg-emerald-500/15 border border-emerald-500/20 p-5 rounded-2xl max-w-lg mx-auto inline-block text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-emerald-400">workspace_premium</span>
                            <span className="text-xs md:text-sm font-extrabold text-emerald-400">心流金牌专注徽章解锁！</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                            恭喜完成由智能推荐的《{currentCompletingTask.title}》深度学习番茄钟专注区间！系统已全自动下发学习成效、累计加分已登入您的总历中。
                          </p>
                        </div>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentCompletingTask(null);
                            }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-750 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-blue-400/10"
                          >
                            完美闭环收归
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Bottom Actions Footer */}
              <div className="p-4 md:p-5 border-t border-slate-800/80 bg-slate-950/30 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteTaskSuccessfully(currentCompletingTask.id);
                    setCurrentCompletingTask(null);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-extrabold cursor-pointer hover:underline transition-all"
                  title="为测试人员提供的快速绿色通道"
                >
                  ⏭️ 跳过所有测试/专注，直接标记完成
                </button>
                
                {currentCompletingTask.type === '作业' && !homeworkSubmitted && (
                  <button
                    type="button"
                    disabled={homeworkAnswers[1] === undefined || homeworkAnswers[2] === undefined}
                    onClick={() => {
                      setHomeworkSubmitted(true);
                      playFinishChime();
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                      homeworkAnswers[1] !== undefined && homeworkAnswers[2] !== undefined
                        ? 'bg-blue-600 hover:bg-blue-700 hover:scale-102 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-550 border border-slate-850 cursor-not-allowed'
                    }`}
                  >
                    提交作业闯关考查
                  </button>
                )}

                {currentCompletingTask.type === '考试' && !examSubmitted && (
                  <button
                    type="button"
                    disabled={examAnswers[1] === undefined || examAnswers[2] === undefined}
                    onClick={() => {
                      setExamSubmitted(true);
                      playFinishChime();
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                      examAnswers[1] !== undefined && examAnswers[2] !== undefined
                        ? 'bg-orange-600 hover:bg-orange-700 hover:scale-102 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-550 border border-slate-850 cursor-not-allowed'
                    }`}
                  >
                    封卷并提交阅卷
                  </button>
                )}

                {currentCompletingTask.type === '学习' && (
                  <span className="text-[10px] text-slate-500 font-bold select-none">
                    用科技辅助让每一秒专注产生价值
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
