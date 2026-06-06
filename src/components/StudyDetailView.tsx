import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  BookOpen, 
  Terminal, 
  TrendingUp, 
  Play, 
  Copy, 
  FileText, 
  MessageSquare,
  Sparkles,
  Award,
  BookOpenCheck,
  CheckCircle,
  Video
} from 'lucide-react';
import { Course, ChatMessage } from '../types';

interface StudyDetailViewProps {
  courseId: string | null;
  courses: Course[];
  setActiveView: (view: 'home' | 'courses' | 'space' | 'mistakes' | 'exams' | 'discuss' | 'settings' | 'studying') => void;
  onSendChatMessage?: (msg: string) => Promise<string>;
}

export default function StudyDetailView({ 
  courseId,
  courses,
  setActiveView,
  onSendChatMessage
}: StudyDetailViewProps) {
  // Find current course detail
  const currentCourse = courses.find(c => c.id === courseId) || courses[0];

  // Syllabus state
  const [syllabus, setSyllabus] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/syllabus')
      .then(res => res.json())
      .then(data => setSyllabus(data))
      .catch(err => console.error("Failed to fetch syllabus:", err));
  }, []);

  // Handle syllabus select
  const handleSelectSyllabusItem = (id: string) => {
    setSyllabus(syllabus.map(item => ({
      ...item,
      active: item.id === id
    })));
  };

  const [activeTab, setActiveTab] = useState<'text' | 'editor' | 'viz' | 'quiz'>('viz');

  // Interactive Sliders for line fitting: y = m * x + c
  const [m, setM] = useState(0.8); // Slope
  const [c, setC] = useState(0.5); // Intercept

  // 5 Ground Truth coordinates (x, y)
  const actualPoints = [
    { id: 1, x: 1, y: 1.5 },
    { id: 2, x: 2, y: 2.5 },
    { id: 3, x: 3, y: 2.0 },
    { id: 4, x: 4, y: 4.0 },
    { id: 5, x: 5, y: 3.5 }
  ];

  // Map user space to SVG ViewPort pixels:
  // width: 420px, height: 280px
  // Margins: left=50, right=40, top=30, bottom=40
  const getSvgCoordinates = (x: number, y: number) => {
    const px = 50 + x * 60;
    const py = 240 - y * 35;
    return { px, py };
  };

  // Calculations
  const calculatedPoints = actualPoints.map(p => {
    const yPred = m * p.x + c;
    const error = p.y - yPred;
    const sqError = error * error;
    const absError = Math.abs(error);
    return {
      ...p,
      yPred,
      sqError,
      absError,
      ...getSvgCoordinates(p.x, p.y),
      pyPred: getSvgCoordinates(p.x, yPred).py
    };
  });

  const totalSqError = calculatedPoints.reduce((acc, curr) => acc + curr.sqError, 0);
  const totalAbsError = calculatedPoints.reduce((acc, curr) => acc + curr.absError, 0);
  
  const mse = totalSqError / actualPoints.length;
  const mae = totalAbsError / actualPoints.length;

  // Auto Optimize fitting model params
  const handleAutoOptimization = () => {
    // True Ordinary Least Squares (OLS) weights for these 5 points:
    // Slope m ~ 0.55, Intercept c ~ 1.05
    alert('正在触发 AI 梯度极小化优化算法原理模拟...\n回归线自动拟合最佳模型权重。');
    
    // Simulate step fitting
    let step = 0;
    const interval = setInterval(() => {
      setM(prev => {
        const diff = 0.55 - prev;
        return Math.abs(diff) < 0.05 ? 0.55 : prev + diff * 0.3;
      });
      setC(prev => {
        const diff = 1.05 - prev;
        return Math.abs(diff) < 0.1 ? 1.05 : prev + diff * 0.3;
      });
      step++;
      if (step > 6) {
        clearInterval(interval);
      }
    }, 150);
  };

  // Code Editor states
  const [code, setCode] = useState(`import numpy as np

# 1. 声明数据真实值与预测结果
y_true = np.array([1.5, 2.5, 2.0, 4.0, 3.5])
y_pred = np.array([${calculatedPoints.map(p => p.yPred.toFixed(2)).join(', ')}])

# 2. 运算 MSE 公式
mse = np.mean((y_true - y_pred) ** 2)

# 3. 运算 MAE 公式
mae = np.mean(np.abs(y_true - y_pred))

print(f">>> 开始计算学评估指标...")
print(f"均方误差 (MSE) = {mse:.4f}")
print(f"平均绝对误差 (MAE) = {mae:.4f}")
print("梯度更新完成! 拟合成功。")
`);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalLogs(['$ python compute_metrics.py', '>>> NumPy 静态解析中...']);
    
    setTimeout(() => {
      setTerminalLogs([
        '$ python compute_metrics.py',
        `真实数据组: [1.5,  2.5,  2.0,  4.0,  3.5]`,
        `模型预测值: [${calculatedPoints.map(p => p.yPred.toFixed(2)).join(', ')}]`,
        ' ',
        '>>> 开始计算评估指标...',
        `均方误差 (MSE, L2-Loss)      = ${mse.toFixed(4)}`,
        `平均绝对误差 (MAE, L1-Loss)  = ${mae.toFixed(4)}`,
        '---------------------------------------',
        '算法计算完毕。进程退出代码为 0 (正常终止)'
      ]);
      setIsRunning(false);
    }, 1000);
  };

  // Quick check quiz interactive setup
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Consistency chat assist bar locally
  const [chatPrompt, setChatPrompt] = useState('');
  const [sidebarHistory, setSidebarHistory] = useState<ChatMessage[]>([
    { id: 'init-1', role: 'assistant', text: '李同学，您正在进行第三章《求残差 MSE 与 MAE 的极值点导数》学习。拖动可视化页底的滑块看看有什么发现？欢迎问我问题。', timestamp: '下午 15:30' }
  ]);
  const [chatWaiting, setChatWaiting] = useState(false);

  const handleSidebarChatAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt || !chatPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: chatPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSidebarHistory(prev => [...prev, userMsg]);
    const promptToSend = chatPrompt;
    setChatPrompt('');
    setChatWaiting(true);

    try {
      if (onSendChatMessage) {
        // Use full-stack proxy express chat route
        const reply = await onSendChatMessage(promptToSend);
        setSidebarHistory(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        // Direct backup
        const defaultReply = '李同学，关于 MSE 和 MAE：在带有异常离群值的数据集中，由于 MSE 对误差乘平方，会将大误差无限放大；而 MAE 只求绝对差，因此 MAE 表现得更为稳健。';
        setSidebarHistory(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          text: defaultReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch {
      setSidebarHistory(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        text: '抱歉，我的学术知识引擎目前离线下线，建议在终端中确认 GEMINI_API_KEY 运行环境。',
        timestamp: '刚刚'
      }]);
    } finally {
      setChatWaiting(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)] overflow-hidden select-none">
      
      {/* 1. Left syllabus Outline Panel */}
      <div className="w-68 border border-slate-200 bg-white rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">课程大纲结构</span>
          <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-semibold select-none">
            {syllabus.filter(s => s.completed).length} / {syllabus.length} 已学完
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {syllabus.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSyllabusClick(item.id)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                item.active 
                  ? 'bg-blue-50/50 text-blue-600 border-l-4 border-blue-500 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5"></span>
              )}
              <div className="min-w-0">
                <span className="text-xs md:text-sm block leading-snug truncate">{item.title}</span>
                <span className="text-[9.5px] text-slate-400 font-normal">
                  {item.type === 'video' && '📹 视频讲解 · 12 Mins'}
                  {item.type === 'interactive' && '💻 互动公式与模拟'}
                  {item.type === 'text' && '📄 学理文章推导'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Middle study Tab Dashboard */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xs">
        {/* Navigation Breadcrumbs trail */}
        <div className="h-12 border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 bg-slate-50/60 text-xs md:text-sm select-none">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setActiveView('courses')}
              className="text-slate-400 hover:text-blue-600 cursor-pointer"
            >
              {currentCourse.title}
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-semibold">第一章 基础评估原理</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-bold">1.3 评估指标: MSE 与 MAE</span>
          </div>
          <button 
            onClick={() => setActiveView('courses')}
            className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-0.5 cursor-pointer"
          >
            ← 返回我的课程
          </button>
        </div>

        {/* Content navigation panel tabs */}
        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10 select-none">
          <div className="flex items-center gap-5 h-full">
            {[
              { id: 'text', label: '知识点讲解', icon: FileText },
              { id: 'viz', label: '可视化演示', icon: TrendingUp },
              { id: 'editor', label: '代码实践', icon: Terminal },
              { id: 'quiz', label: '练习题', icon: BookOpenCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-full border-b-2 font-semibold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === tab.id 
                      ? 'text-blue-600 border-blue-500 font-bold' 
                      : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[10.5px] bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-md px-2 py-0.5 select-none font-medium">
            学考核心考位
          </span>
        </div>

        {/* Dynamic Inner Tab Contents Frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {/* Tab 1: Tutorial */}
          {activeTab === 'text' && (
            <div className="space-y-6 max-w-2xl leading-relaxed text-slate-700 text-xs md:text-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">均方误差 (MSE) vs 平均绝对误差 (MAE)</h3>
                <p className="text-slate-500">
                  回归算法的核心在于评估预测值与真实值之间的距离。最常用的两种基础指标公式是 **均方误差 (Mean Squared Error)** 和 **平均绝对误差 (Mean Absolute Error)**。
                </p>
              </div>

              {/* Equation formula blocks representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 text-center">均方误差 (MSE)</h4>
                  <div className="bg-white py-3 border border-slate-100 rounded-lg text-center font-mono my-2 overflow-x-auto text-blue-600">
                    J(θ) = 1/n * Σ (y_i - ŷ_i)²
                  </div>
                  <ul className="text-[10.5px] text-slate-500 space-y-1 mt-3">
                    <li>• 由于使用了平方向，使得<strong>较大的误差受到更大惩罚</strong>。</li>
                    <li>• 偏导在全域可导且连续，是凸优化及梯度下降算法首选。</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 text-center">平均绝对误差 (MAE)</h4>
                  <div className="bg-white py-3 border border-slate-100 rounded-lg text-center font-mono my-2 overflow-x-auto text-purple-600">
                    MAE = 1/n * Σ |y_i - ŷ_i|
                  </div>
                  <ul className="text-[10.5px] text-slate-500 space-y-1 mt-3">
                    <li>• 采用绝对值，相较于 MSE 对<strong>离群噪声异常点极具鲁棒性</strong>。</li>
                    <li>• 在 y=ŷ 处不可导，在复杂的连续梯度极值优化中计算较为繁重。</li>
                  </ul>
                </div>
              </div>

              <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 text-xs">
                <p className="font-bold text-indigo-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>学术高频提示 (L1与L2 Loss 选型)</span>
                </p>
                <p className="text-slate-600 mt-1 leading-normal">
                  考试如果遇到“数据集带有几处明显传感器突变或网络抖动造成的偶发离散噪声点，而要求模型拟合回归不漂移异常”的情景，优先选取 **MAE (L1 Loss)** 作为误差损失测度；通常情况做微积分梯度下降，则无脑优先选择 **MSE (L2 Loss)**。
                </p>
              </div>

              {/* Mock Video Player section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs select-none">
                <div className="h-44 bg-slate-900 border-b border-slate-800 flex flex-col items-center justify-center relative">
                  <Video className="w-12 h-12 text-blue-500 mb-1" />
                  <span className="text-white text-xs font-bold font-mono">第1.3节 核心串讲 - 张教授 (北京大学 · 信息科学系)</span>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 flex items-center justify-between text-[10px] text-slate-300 px-4">
                    <span>12:35 / 24:00</span>
                    <button className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer" onClick={() => alert('视频播放中...')}>► 播放</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Code Editor */}
          {activeTab === 'editor' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center justify-between bg-slate-50/50 p-3 border border-slate-100 rounded-xl">
                <div className="text-xs text-slate-500">
                  编辑器脚本：<span className="font-mono text-slate-700 font-semibold bg-slate-200 px-2 py-0.5 rounded">compute_metrics.py</span>
                </div>
                <button 
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-100 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>运行 Python 运算</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow min-h-[300px]">
                {/* Text area code editor mock */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-900 overflow-hidden flex flex-col">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full flex-grow bg-transparent text-xs font-mono text-green-400 outline-none resize-none leading-relaxed h-[220px]"
                    style={{ border: 'none' }}
                  />
                  <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
                    <button 
                      onClick={() => { navigator.clipboard.writeText(code); alert('代码已成功拷贝至您的剪贴板！'); }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 focus:outline-none"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制源码</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Linux terminal console for compiling */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-950 flex flex-col justify-between">
                  <div className="font-mono text-[11px] leading-relaxed flex-grow overflow-y-auto space-y-1 pr-1 text-slate-300">
                    <div className="text-slate-500 italic pb-2"># python 命令行标准控制台 stdout</div>
                    {terminalLogs.length === 0 ? (
                      <p className="text-slate-600 hover:text-slate-500">点击上方 [运行 Python 运算] 在终端中查看神经网络求导计算日志...</p>
                    ) : (
                      terminalLogs.map((log, index) => (
                        <div key={index} className={log.startsWith('$') ? 'text-blue-400' : log.includes('MSE') || log.includes('MAE') ? 'text-green-400 font-bold' : ''}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="h-6 border-t border-slate-900 pt-2 shrink-0 flex items-center justify-between text-[10px] text-slate-500 leading-none select-none">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-blue-500" />
                      Python 3.10 · Linux x86环境
                    </span>
                    <span>2026-05-20 UTC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: HIGH-FIDELITY GRAPH INTERACTION VIZ DEMO */}
          {activeTab === 'viz' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-center md:items-start gap-4 shrink-0">
                <div className="text-xs">
                  <p className="font-bold text-slate-800">
                    回归拟合交互探究
                  </p>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    在坐标网格中共有 5 颗真实数据组 <span className="text-yellow-600 font-bold">●</span>。
                    拖拽底下的滑块调节线性一元估计方程 $y = m \cdot x + c$ 的**斜率(m)**和**偏置(c)**。
                    绿色虚线代表单点**预测偏差(残差)**。直观看看当残差极小化最优化时，MSE 与 MAE 值如何对应变化！
                  </p>
                </div>
                <button 
                  onClick={handleAutoOptimization}
                  className="px-4 py-2 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 select-none cursor-pointer whitespace-nowrap active:scale-95 transition-all shadow-sm flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI 自动寻估回归线</span>
                </button>
              </div>

              {/* Grid visualization frame and calculation side by side */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* SVG graph grid container */}
                <div className="bg-slate-950/95 rounded-2xl p-4 flex flex-col items-center select-none border border-slate-800 shadow-lg shrink-0 w-full lg:w-[460px]">
                  <div className="text-center pb-2 shrink-0">
                    <span className="text-[11px] font-mono text-blue-400 font-semibold tracking-wide">
                      估计拟合方程: $y = {m.toFixed(2)}x {c >= 0 ? '+' : ''}{c.toFixed(2)}$
                    </span>
                  </div>

                  <svg className="w-[420px] h-[280px] bg-slate-950 border border-slate-900 rounded-xl" style={{ border: 'none' }}>
                    {/* Grid lines */}
                    {[1, 2, 3, 4, 5, 6].map(x => {
                      const { px } = getSvgCoordinates(x, 0);
                      return <line key={`vl-${x}`} x1={px} y1={20} x2={px} y2={245} stroke="#1e293b" strokeWidth="1" />;
                    })}
                    {[1, 2, 3, 4, 5, 6].map(y => {
                      const { py } = getSvgCoordinates(0, y);
                      return <line key={`hl-${y}`} x1={45} y1={py} x2={390} y2={py} stroke="#1e293b" strokeWidth="1" />;
                    })}

                    {/* Coordinate axes */}
                    <line x1={45} y1={240} x2={395} y2={240} stroke="#475569" strokeWidth="2" /> {/* X axis */}
                    <line x1={50} y1={15} x2={50} y2={245} stroke="#475569" strokeWidth="2" /> {/* Y axis */}

                    {/* Labels ticks */}
                    {[0, 1, 2, 3, 4, 5, 6].map(x => {
                      const { px } = getSvgCoordinates(x, 0);
                      return <text key={`xt-${x}`} x={px} y={258} fontSize="10" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{x}</text>;
                    })}
                    {[0, 1, 2, 3, 4, 5, 6].map(y => {
                      const { py } = getSvgCoordinates(0, y);
                      return <text key={`yt-${y}`} x={35} y={py + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="monospace">{y}</text>;
                    })}

                    {/* 1. Draw green residual dashed lines overlay offset */}
                    {calculatedPoints.map((p) => (
                      <line 
                        key={`res-${p.id}`}
                        x1={p.px}
                        y1={p.py}
                        x2={p.px}
                        y2={p.pyPred}
                        stroke="#22c55e"
                        strokeWidth="1.5"
                        strokeDasharray="3"
                      />
                    ))}

                    {/* 2. Model prediction linear regression line */}
                    {(() => {
                      const pt0 = getSvgCoordinates(0.5, m * 0.5 + c);
                      const pt6 = getSvgCoordinates(5.5, m * 5.5 + c);
                      return (
                        <line 
                          x1={pt0.px}
                          y1={pt0.py}
                          x2={pt6.px}
                          y2={pt6.py}
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })()}

                    {/* 3. Scatter plot bullet dot representing Ground Truth */}
                    {calculatedPoints.map((p) => (
                      <g key={`dotg-${p.id}`} className="cursor-help">
                        {/* Hover circular background */}
                        <circle cx={p.px} cy={p.py} r="8" fill="#eab308" fillOpacity="0.2" />
                        <circle cx={p.px} cy={p.py} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={p.px + 7} y={p.py - 6} fontSize="9" fill="#94a3b8" fontFamily="monospace">P{p.id}</text>
                      </g>
                    ))}
                  </svg>

                  {/* Slider controls panel */}
                  <div className="w-full mt-4 space-y-3.5 select-none px-2 z-10">
                    <div className="flex flex-col text-[11px] leading-tight text-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-400">调节斜率 (m - Slope)</span>
                        <span className="font-mono text-blue-400 font-bold text-xs bg-slate-900 border border-slate-800 rounded px-2 py-0.5">{m.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.05"
                        value={m}
                        onChange={(e) => setM(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-blue-500"
                      />
                    </div>

                    <div className="flex flex-col text-[11px] leading-tight text-slate-300">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-400">调节偏置 (c - Intercept)</span>
                        <span className="font-mono text-purple-400 font-bold text-xs bg-slate-900 border border-slate-800 rounded px-2 py-0.5">{c.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="-1.0"
                        max="4.0"
                        step="0.1"
                        value={c}
                        onChange={(e) => setC(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation numerical panel grid */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                          <th className="p-2.5 pl-4 font-semibold">样本点</th>
                          <th className="p-2.5 font-semibold text-center">真实 Y</th>
                          <th className="p-2.5 font-semibold text-center">预测 Ŷ</th>
                          <th className="p-2.5 font-semibold text-right">平方偏差 (y-ŷ)²</th>
                          <th className="p-2.5 pr-4 font-semibold text-right">绝对偏差 |y-ŷ|</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatedPoints.map((p) => (
                          <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/55 text-slate-600">
                            <td className="p-2.5 pl-4 font-medium text-slate-800">P{p.id} ({p.x}, {p.y.toFixed(1)})</td>
                            <td className="p-2.5 text-center font-mono">{p.y.toFixed(1)}</td>
                            <td className="p-2.5 text-center font-mono text-blue-500 font-medium">{p.yPred.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono text-red-500">{(p.sqError).toFixed(4)}</td>
                            <td className="p-2.5 pr-4 text-right font-mono text-purple-500">{(p.absError).toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Final computed metrics cards */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">均方误差 (MSE)</span>
                        <div className="text-xl md:text-2xl font-extrabold text-blue-600 font-mono mt-1">
                          {mse.toFixed(4)}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        平方和再除。对大偏离极为敏感敏感约束。
                      </p>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100/60 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">平均绝对误差 (MAE)</span>
                        <div className="text-xl md:text-2xl font-extrabold text-purple-600 font-mono mt-1">
                          {mae.toFixed(4)}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        绝对偏差平均。对噪点鲁棒性极高。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Interactive Quiz Check */}
          {activeTab === 'quiz' && (
            <div className="space-y-6 text-xs md:text-sm text-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">第3小节 随堂检验</h3>
                <p className="text-slate-400">请独立作答，完成后点击【提交检验】自动录入学业积分模型账户。</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 md:p-6 space-y-4">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                  单选题
                </span>
                <p className="font-semibold text-slate-800 leading-normal text-sm">
                  在搭建拟合带有部分传感器异常爆震数据（即少部分极端突变大残差噪点）的气压估计回归模型时，希望算法不因受到这些偶尔产生的噪点影响而产生太大的推导漂移，作为资深算法架构，应该倾向于选择哪个误差评估指标做损失约束，且为什么？
                </p>

                <div className="space-y-2.5 mt-4">
                  {[
                    { id: 'A', text: '倾向于 L2 损失的均方误差 (MSE)。因为它平方了误差，能够加速由于奇异突变点而引发的参数更新速率。' },
                    { id: 'B', text: '倾向于 L1 损失的平均绝对误差 (MAE)。因为绝对值项对极端突变噪点的离群惩罚没有经过乘方运算平方放大，鲁棒性良好。' },
                    { id: 'C', text: '两者无任何效果区别。均属于一元线性回归。' },
                    { id: 'D', text: '放弃所有回归，因为异常值无法被任何距离公式衡量拟合。' }
                  ].map((cand) => (
                    <label 
                      key={cand.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        quizSelected === cand.id 
                          ? 'border-blue-500 bg-blue-50/40 font-medium' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => { if (!quizSubmitted) setQuizSelected(cand.id); }}
                    >
                      <input 
                        type="radio" 
                        name="quizOptions" 
                        checked={quizSelected === cand.id}
                        onChange={() => {}}
                        disabled={quizSubmitted}
                        className="mt-0.5 text-blue-600"
                      />
                      <span>{cand.id}. {cand.text}</span>
                    </label>
                  ))}
                </div>

                {quizSubmitted ? (
                  <div className={`p-4 rounded-xl border mt-6 text-xs leading-normal ${
                    quizSelected === 'B' 
                      ? 'border-green-200 bg-green-50 text-green-800' 
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}>
                    <p className="font-bold flex items-center gap-1 text-sm">
                      {quizSelected === 'B' ? '✔ 回答正确！学能积分 +10 分。' : '❌ 作答错误，需要继续加油。'}
                    </p>
                    <p className="mt-1 text-slate-600">
                      <strong>解析：</strong>由于 MSE 在估算误差时会计算偏差的**平方**，一旦数据集有异常离群突变值（outliers），其偏差值较大，其平方项将会被无穷倍率放大，严重破坏回归线主体拟合方向。相反，MAE 采用 L1 绝对偏差，仅仅以线性系数惩罚，因此极佳地削减了这些传感器坏噪点的不良影响，表现出高鲁棒性的拟合效果。
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => { if (quizSelected) setQuizSubmitted(true); else alert('请选择一个选项后提交！'); }}
                    className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-100 cursor-pointer"
                  >
                    提交检核
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Persistent Right-hand AI Space Assist Chat */}
      <div className="w-72 border border-slate-200 bg-slate-50 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200/80 bg-white flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              AI 智能助学空间
              <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">李同学 的专属学术助手</span>
          </div>
        </div>

        {/* Dynamic chat area listing conversations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs flex flex-col justify-start">
          {sidebarHistory.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[90%] gap-1 ${
                msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className={`p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-3xs'
              } leading-relaxed`}>
                <div className="break-words" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
              <span className="text-[9.5px] text-slate-400 px-1 select-none">{msg.timestamp}</span>
            </div>
          ))}

          {chatWaiting && (
            <div className="self-start flex items-center gap-1.5 p-3.5 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-3xs max-w-[90%] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
              <span className="text-[10.5px]">AI 助学思考中...</span>
            </div>
          )}
        </div>

        {/* Input send bar footer */}
        <form onSubmit={handleSidebarChatAction} className="p-3 bg-white border-t border-slate-200/80 shrink-0 select-none">
          <div className="relative">
            <input 
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="问我公式推导/编写代码/重错题讲解..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-3 pr-10 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100/50 outline-none"
            />
            <button 
              type="submit"
              className="absolute right-1 text-xs text-blue-600 font-bold hover:text-blue-800 focus:outline-none p-1.5 top-1/2 -translate-y-1/2"
              title="发送提问"
            >
              ➔
            </button>
          </div>
        </form>
      </div>

    </div>
  );

  function handleSyllabusClick(id: string) {
    handleSelectSyllabusItem(id);
    if (id === '1-3') {
      setActiveTab('viz');
    } else if (id === '1-4' || id === '2-1') {
      setActiveTab('text');
    } else {
      setActiveTab('text');
    }
  }
}
