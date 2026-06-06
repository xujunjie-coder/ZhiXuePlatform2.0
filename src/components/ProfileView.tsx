import React, { useState, useEffect } from 'react';
import { 
  User, 
  PenTool, 
  Edit2, 
  Camera, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  RotateCw, 
  Target, 
  ChevronRight, 
  Clock, 
  X, 
  Check, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  Award,
  Sparkles,
  BookMarked
} from 'lucide-react';

interface ProfileViewProps {
  setActiveView: (view: any) => void;
  tasks?: any[];
  setTasks?: React.Dispatch<React.SetStateAction<any[]>>;
  customSchedules?: any[];
  setCustomSchedules?: React.Dispatch<React.SetStateAction<any[]>>;
  onSetReminder?: (taskId: string, seconds: number, customLabel: string) => void;
}

export default function ProfileView({ 
  setActiveView,
  tasks = [],
  setTasks = () => {},
  customSchedules = [],
  setCustomSchedules = () => {},
  onSetReminder = () => {}
}: ProfileViewProps) {
  // Local state for schedule input form
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('15:00');
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  // Toast notifications for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable fields local states
  const [basicInfo, setBasicInfo] = useState({
    nickname: '李明',
    realName: '李明',
    studentId: '2023123456',
    department: '计算机科学与技术学院 / 软件工程',
    grade: '大二'
  });

  const [bio, setBio] = useState('热爱编程，喜欢探索新技术，期待成为一名优秀的软件工程师！');
  const [semesterGoal, setSemesterGoal] = useState('本学期完成《数据结构与算法》课程，掌握基本算法思想，通过全部章节测验，提升代码能力。');

  // Editing toggle states
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Inputs state for editing
  const [basicInput, setBasicInput] = useState({ ...basicInfo });
  const [bioInput, setBioInput] = useState(bio);
  const [goalInput, setGoalInput] = useState(semesterGoal);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2024-05-25 10:30:21');
  const [syncCount, setSyncCount] = useState(0);

  // Learning data stats (that can be updated/synced!)
  const [learningStats, setLearningStats] = useState({
    studyHours: 128.5,
    completedChapters: 156,
    totalChapters: 320,
    mistakesCount: 48,
    masteryRate: 78
  });

  // Modal display states
  const [showPathModal, setShowPathModal] = useState(false);

  // Helper to trigger toast
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync handler (animates and randomly increments stats for extreme fidelity!)
  const handleSyncData = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    triggerToast('🔄 正在连接学情分析引擎，同步最新完成进度...');

    setTimeout(() => {
      // Create fresh timestamp
      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      
      setLastSyncTime(timeStr);
      setIsSyncing(false);
      setSyncCount(prev => prev + 1);

      // Slightly update stats as if synchronized!
      setLearningStats(prev => ({
        studyHours: +(prev.studyHours + 1.2).toFixed(1),
        completedChapters: Math.min(prev.completedChapters + 2, prev.totalChapters),
        totalChapters: prev.totalChapters,
        mistakesCount: Math.max(prev.mistakesCount - 1, 0),
        masteryRate: Math.min(prev.masteryRate + 1, 100)
      }));

      triggerToast('🎉 个人学籍、学习进度与学能雷达图谱同步成功！');
    }, 1500);
  };

  // Save basic info changes
  const saveBasicInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setBasicInfo({ ...basicInput });
    setIsEditingBasic(false);
    triggerToast('✅ 基本资料已更新');
  };

  // Cancel basic info editing
  const cancelBasicBasic = () => {
    setBasicInput({ ...basicInfo });
    setIsEditingBasic(false);
  };

  // Save Bio
  const saveBio = () => {
    if (bioInput.length > 200) {
      triggerToast('⚠️ 个人简介长度不能超过 200 个字');
      return;
    }
    setBio(bioInput);
    setIsEditingBio(false);
    triggerToast('✅ 个人简介已成功更新');
  };

  // Save Goal
  const saveGoal = () => {
    if (goalInput.length > 200) {
      triggerToast('⚠️ 学习目标长度不能超过 200 个字');
      return;
    }
    setSemesterGoal(goalInput);
    setIsEditingGoal(false);
    triggerToast('✅ 学期学习目标成功保存');
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fadeIn relative pb-20">
      
      {/* Dynamic Floating Toast feedback */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-semibold text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600 stroke-[2.5]" />
            <span>个人信息管理</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">管理您的个人资料和学习目标，让平台更好地为您服务</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <button 
            onClick={handleSyncData}
            className={`flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100/75 transition-all shadow-3xs cursor-pointer ${isSyncing ? 'animate-pulse' : ''}`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>立即同步学情</span>
          </button>
        </div>
      </div>

      {/* Grid Layout (7 columns Left, 5 columns Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Basic info, bio, semester goals, personal overview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. Basic Information Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs relative group">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                <span>基本信息</span>
              </h2>
              {!isEditingBasic && (
                <button 
                  onClick={() => {
                    setBasicInput({ ...basicInfo });
                    setIsEditingBasic(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
              )}
            </div>

            {isEditingBasic ? (
              <form onSubmit={saveBasicInfo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">昵称</label>
                    <input 
                      type="text" 
                      required
                      value={basicInput.nickname}
                      onChange={(e) => setBasicInput({ ...basicInput, nickname: e.target.value })}
                      className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">真实姓名</label>
                    <input 
                      type="text" 
                      required
                      value={basicInput.realName}
                      onChange={(e) => setBasicInput({ ...basicInput, realName: e.target.value })}
                      className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">学号</label>
                    <input 
                      type="text" 
                      required
                      value={basicInput.studentId}
                      onChange={(e) => setBasicInput({ ...basicInput, studentId: e.target.value })}
                      className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">年级</label>
                    <input 
                      type="text" 
                      required
                      value={basicInput.grade}
                      onChange={(e) => setBasicInput({ ...basicInput, grade: e.target.value })}
                      className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">学院 / 专业</label>
                    <input 
                      type="text" 
                      required
                      value={basicInput.department}
                      onChange={(e) => setBasicInput({ ...basicInput, department: e.target.value })}
                      className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium py-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={cancelBasicBasic}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-3xs cursor-pointer"
                  >
                    保存基本信息
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Avatar with Camera overlay icon */}
                <div className="relative group/avatar cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 shadow-sm overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <img 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuApk3_bT8Bkz3WROLc7NXHkJf-oIi5yxyL281YLdx9F4mlqHBhkeixHpD3ZKS9iYGZaP_AUtGF0OCgytTePFIhlATH9hM_oQtDxSQpnOSO7nX_VHNKt9ZQbeEu4MVjo3PkP7iU3a_iZXcHuWMSxf-V34w8XrrJwMKZnYFH5JS3pXRLLr_MUK0cbzCAYHUR_i5TGrqFRwjfafUb-01d3dGu60WlZoOLQ30R0syrCcbCfehatLmHt5nxhzyT9XmWDUUgAKpHjZYDZpWE"
                    />
                  </div>
                  <div 
                    onClick={() => triggerToast('📸 头像自定义功能已启动，正在调起相册上传模块...')}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-colors shadow-xs"
                    title="上传新头像"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Info Grid displaying attributes */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm pt-2 w-full">
                  <div className="flex items-center min-w-0 border-b border-slate-50 pb-2">
                    <span className="w-20 text-slate-400 font-bold shrink-0">昵称</span>
                    <span className="font-extrabold text-slate-800 truncate">{basicInfo.nickname}</span>
                  </div>
                  <div className="flex items-center min-w-0 border-b border-slate-50 pb-2">
                    <span className="w-20 text-slate-400 font-bold shrink-0">真实姓名</span>
                    <span className="font-semibold text-slate-800 truncate">{basicInfo.realName}</span>
                  </div>
                  <div className="flex items-center min-w-0 border-b border-slate-50 pb-2">
                    <span className="w-20 text-slate-400 font-bold shrink-0">学号</span>
                    <span className="font-mono font-medium text-slate-700">{basicInfo.studentId}</span>
                  </div>
                  <div className="flex items-center min-w-0 border-b border-slate-50 pb-2">
                    <span className="w-20 text-slate-400 font-bold shrink-0">年级</span>
                    <span className="font-semibold text-slate-800">{basicInfo.grade}</span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-start min-w-0 pt-1">
                    <span className="w-20 text-slate-400 font-bold shrink-0">学院 / 专业</span>
                    <span className="font-bold text-slate-800 leading-normal">{basicInfo.department}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Personal Bio Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>
                <span>个人简介</span>
              </h2>
              {!isEditingBio ? (
                <button 
                  onClick={() => {
                    setBioInput(bio);
                    setIsEditingBio(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setIsEditingBio(false)}
                    className="px-2.5 py-1 text-slate-500 text-xs hover:bg-slate-50 rounded border border-slate-200 cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    onClick={saveBio}
                    className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 cursor-pointer"
                  >
                    保存
                  </button>
                </div>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full text-xs md:text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 p-3 leading-relaxed"
                  placeholder="说点什么，向大家介绍你自己吧..."
                />
                <div className="flex justify-end text-[10.5px] font-bold text-slate-400">
                  <span className={bioInput.length > 200 ? 'text-red-500' : ''}>{bioInput.length}</span>/200 字
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {bio || '暂无个人简介...点击编辑按钮即可进行添加！'}
                </p>
                <div className="text-right text-[10.5px] font-bold text-slate-400 mt-2.5 mr-1">
                  {bio.length}/200
                </div>
              </div>
            )}
          </div>

          {/* 3. Semester Goals Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block"></span>
                <span>学期学习目标</span>
              </h2>
              {!isEditingGoal ? (
                <button 
                  onClick={() => {
                    setGoalInput(semesterGoal);
                    setIsEditingGoal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setIsEditingGoal(false)}
                    className="px-2.5 py-1 text-slate-500 text-xs hover:bg-slate-50 rounded border border-slate-200 cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    onClick={saveGoal}
                    className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 cursor-pointer"
                  >
                    保存
                  </button>
                </div>
              )}
            </div>

            {isEditingGoal ? (
              <div className="space-y-2">
                <textarea
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full text-xs md:text-sm rounded-xl border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 p-3 leading-relaxed"
                  placeholder="设定你本学期的学习冲刺目标（建议包含想提高的技能等）..."
                />
                <div className="flex justify-end text-[10.5px] font-bold text-slate-400">
                  <span className={goalInput.length > 200 ? 'text-red-500' : ''}>{goalInput.length}</span>/200 字
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold bg-emerald-50/20 text-emerald-950 p-4 rounded-xl border border-emerald-100/50">
                  {semesterGoal || '暂无设定的学期目标...给自己写下一句本学期的拼搏誓言吧！'}
                </p>
                <div className="text-right text-[10.5px] font-bold text-slate-400 mt-2.5 mr-1">
                  {semesterGoal.length}/200
                </div>
              </div>
            )}
          </div>

          {/* 4. Personal Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                <span>个人概览</span>
              </h2>
              <button 
                onClick={handleSyncData}
                className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer bg-blue-50/50 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <RotateCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>同步数据</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Stat Item 1 */}
              <div className="bg-slate-50/80 rounded-xl p-4 flex items-center gap-4 border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center text-lg shrink-0">
                  <GraduationCap className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">平台角色</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">普通学生</div>
                </div>
              </div>

              {/* Stat Item 2 */}
              <div className="bg-slate-50/80 rounded-xl p-4 flex items-center gap-4 border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center text-lg shrink-0">
                  <Calendar className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">注册时间</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 font-mono">2023-09-01</div>
                </div>
              </div>

              {/* Stat Item 3 */}
              <div className="bg-slate-50/80 rounded-xl p-4 flex items-center gap-4 border border-slate-100 hover:border-blue-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center text-lg shrink-0">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">加入课程数</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    <span className="text-base text-blue-600 font-extrabold font-mono">8</span> 门
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>上次同步: {lastSyncTime}</span>
              {syncCount > 0 && <span className="text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded font-bold text-emerald-600 ml-1">本次已手动更新 {syncCount} 次</span>}
            </div>
          </div>

          {/* Integrated Study Calendar Planner & Task Reminder Center Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                  <span>个人日程与定时提醒计划</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                  系统会自动提取并聚合您在微课与作业中设置的桌面级定时提醒，实现学期日程一览通
                </p>
              </div>

              {/* Add schedule trigger button */}
              <button 
                onClick={() => setShowAddSchedule(!showAddSchedule)}
                className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer"
              >
                {showAddSchedule ? '关闭新增' : '➕ 自主日程'}
              </button>
            </div>

            {/* Quick date tracker horizontally */}
            <div className="mb-5">
              <div className="flex justify-between items-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/80 mb-4 select-none">
                {[
                  { day: '25', name: '周一', isToday: false },
                  { day: '26', name: '周二', isToday: false },
                  { day: '27', name: '周三', isToday: false },
                  { day: '28', name: '今天', isToday: true },
                  { day: '29', name: '周五', isToday: false },
                  { day: '30', name: '周六', isToday: false },
                  { day: '31', name: '周日', isToday: false }
                ].map((d) => (
                  <div 
                    key={d.day} 
                    className={`flex flex-col items-center p-2 rounded-xl text-center min-w-[44px] transition-all ${
                      d.isToday 
                        ? 'bg-blue-600 font-extrabold text-white shadow-sm ring-2 ring-blue-600/10' 
                        : 'text-slate-500 hover:bg-slate-100/80 cursor-pointer'
                    }`}
                    onClick={() => triggerToast(`📅 ${d.isToday ? '今天 5月28日' : `5月${d.day}日`} 的日常学期提醒已经自动合并就绪！`)}
                  >
                    <span className="text-[10px] opacity-80 scale-95">{d.name}</span>
                    <span className="text-sm font-black mt-0.5">{d.day}</span>
                  </div>
                ))}
              </div>

              {/* Add custom agenda inline drawer form widget */}
              {showAddSchedule && (
                <div className="bg-indigo-50/40 border border-indigo-100/50 p-3.5 rounded-xl mb-4 space-y-2.5 animate-fadeIn">
                  <h4 className="text-xs font-bold text-indigo-950">📋 新增个人日程计划表</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">课题日程名称</label>
                      <input 
                        type="text" 
                        maxLength={25}
                        placeholder="例如：高数复习典型套题通关..."
                        value={newScheduleTitle}
                        onChange={(e) => setNewScheduleTitle(e.target.value)}
                        className="w-full text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white font-medium shadow-3xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">提醒/计划时段 (hh:mm)</label>
                      <input 
                        type="time" 
                        value={newScheduleTime}
                        onChange={(e) => setNewScheduleTime(e.target.value)}
                        className="w-full text-xs rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white font-medium font-mono py-1.5"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button 
                      onClick={() => {
                        setShowAddSchedule(false);
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded border border-slate-200 transition-all cursor-pointer"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => {
                        if (!newScheduleTitle) {
                          triggerToast('⚠️ 请填写个人日程计划的名称');
                          return;
                        }
                        const newId = `cs-${Date.now()}`;
                        setCustomSchedules([
                          ...customSchedules,
                          { id: newId, title: newScheduleTitle, time: newScheduleTime, isSystem: false }
                        ]);
                        setNewScheduleTitle('');
                        setShowAddSchedule(false);
                        triggerToast('🎉 自主设定日程已成功保存，并实时集成到底层分析引擎！');
                      }}
                      className="px-3.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-3xs transition-all cursor-pointer"
                    >
                      提日程
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Combined Chronological Schedule list of events */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                // Synthesize item structures
                const activeReminders = tasks
                  .filter(t => t.reminderTime)
                  .map(t => ({
                    id: t.id,
                    title: t.title,
                    timeLabel: t.reminderTime,
                    type: 'task',
                    taskType: t.type,
                    status: t.status,
                    deadline: t.deadline
                  }));

                const allItems = [
                  ...activeReminders,
                  ...customSchedules.map(cs => ({
                    id: cs.id,
                    title: cs.title,
                    timeLabel: `📝 自学日程 (${cs.time})`,
                    type: 'custom',
                    taskType: '日程',
                    status: '进行中',
                    deadline: ''
                  }))
                ];

                if (allItems.length === 0) {
                  return (
                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <div className="text-slate-300 text-3xl mb-1.5 select-none">📪</div>
                      <p className="text-xs font-semibold text-slate-500">本日暂无合订的提醒计划或日程</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                        您可以在首页待完成任务列表中，点击“闹钟图标”为任意待办设定桌面级倒计时，之后在这里会看到对应的智能日历条目喔！
                      </p>
                    </div>
                  );
                }

                return allItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left transition-all ${
                      item.type === 'task' 
                        ? 'bg-blue-50/30 border-blue-100 hover:border-blue-200/80 hover:bg-blue-50/50' 
                        : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200/80 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] uppercase ${
                          item.type === 'task' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {item.taskType}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold ${
                          item.type === 'task' ? 'text-blue-600' : 'text-indigo-600'
                        }`}>
                          🕒 {item.timeLabel}
                        </span>
                        {item.type === 'task' && (
                          <span className="text-[10px] text-slate-400 font-medium font-sans">
                            {item.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Integrated actions inline */}
                    <div className="flex items-center gap-1.5 sm:self-center">
                      {item.type === 'task' && (
                        <>
                          <button 
                            onClick={() => {
                              onSetReminder(item.id, 1, '立刻督测');
                              triggerToast(`⚡ 已触发模拟。若浏览器已确认桌面通知授权，系统将在1秒内蜂鸣弹出桌面提示！`);
                            }}
                            className="text-[10px] font-bold bg-amber-500 border border-amber-600 text-white hover:bg-amber-600 px-2 py-1 rounded-lg shadow-3xs cursor-pointer transition-all"
                            title="立刻触发倒计时，测试模拟通知提醒"
                          >
                            🔔 模拟触发
                          </button>
                          
                          <button 
                            onClick={() => {
                              setTasks(tasks.map(t => t.id === item.id ? { ...t, status: '已完成', reminderTime: '' } : t));
                              triggerToast('✅ 该待办计划已设为已完成，日程自动更新归档！');
                            }}
                            className="text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-3xs"
                          >
                            完成
                          </button>

                          <button 
                            onClick={() => {
                              setTasks(tasks.map(t => t.id === item.id ? { ...t, reminderTime: '' } : t));
                              triggerToast('🔕 自定义专注提醒已顺利清空');
                            }}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 px-1.5 py-1 rounded-lg transition-all cursor-pointer"
                            title="清空倒白提醒"
                          >
                            清空
                          </button>
                        </>
                      )}

                      {item.type === 'custom' && (
                        <button 
                          onClick={() => {
                            setCustomSchedules(customSchedules.filter(cs => cs.id !== item.id));
                            triggerToast('🗑️ 自学日程已成功丢弃移除');
                          }}
                          className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          删除日程
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Quick Sync card, Goal Recommendations card, Learning Data overview */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* 1. Quick Sync Data Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[250px] h-auto relative overflow-hidden hover:shadow-xs transition-shadow">
            <div className="relative z-10 w-2/3 pb-2">
              <h2 className="text-base font-bold text-slate-800 mb-1 leading-snug">快速同步个人数据</h2>
              <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-medium">一键同步学习空间中的最新个人数据概览（学习进度、掌握度、错题等）</p>
              <button 
                onClick={handleSyncData}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '同步中...' : '立即同步'}</span>
              </button>
            </div>
            
            {/* Graphic representation widget */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-end pr-4 pointer-events-none opacity-90">
              <div className="w-28 h-24 bg-blue-50/50 rounded-xl border border-blue-100/30 relative flex items-end justify-around pb-3 px-3 transform group-hover:scale-105 transition-transform duration-300">
                <div className="w-3 h-8 bg-blue-200 rounded-t-md"></div>
                <div className="w-3 h-12 bg-blue-300 rounded-t-md"></div>
                <div className="w-3 h-16 bg-blue-500 rounded-t-md"></div>
                <div className="w-3 h-10 bg-indigo-300 rounded-t-md"></div>
                
                <div className="absolute -right-2 top-4 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Goal Recommendations Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[250px] h-auto relative overflow-hidden hover:shadow-xs transition-shadow">
            <div className="relative z-10 w-2/3 pb-2">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h2 className="text-base font-bold text-slate-800 leading-snug">学期学习目标推荐</h2>
              </div>
              <div className="mb-4">
                <span className="inline-block text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  基于目标的学习路径
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-medium">根据设置的学期算法进阶目标，系统为你推荐了专项前沿路线</p>
              <button 
                onClick={() => setShowPathModal(true)}
                className="bg-white text-blue-600 border border-blue-200 hover:border-blue-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-50/50 transition-colors flex items-center gap-1.5 shadow-3xs cursor-pointer"
              >
                <span>查看推荐路径</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Graphic Target representation widget */}
            <div className="absolute right-4 bottom-5 w-1/3 h-full flex items-center justify-end pointer-events-none opacity-90">
              <div className="w-24 h-24 relative flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-500">
                <div className="absolute w-24 h-24 border-[5px] border-blue-100/50 rounded-full"></div>
                <div className="absolute w-16 h-16 border-[5px] border-blue-200/50 rounded-full"></div>
                <div className="absolute w-8 h-8 bg-blue-600 border-4 border-white rounded-full shadow-md"></div>
                <div className="absolute w-full h-[2px] bg-blue-600/20 rotate-45 transform origin-center"></div>
                <div className="absolute w-4 h-4 bg-amber-400 border-2 border-white rounded-full top-3 right-3 shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* 3. Learning Data Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                <span>学习数据概览</span>
              </h2>
              <span className="text-[10.5px] text-slate-400 font-bold">(同步后更新)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stat Card 1: Study hours */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0 border border-blue-100/50">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">学期总时长</div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    <span className="text-sm font-serif">{learningStats.studyHours}</span> 小时
                  </div>
                </div>
              </div>

              {/* Stat Card 2: Completed Chapters */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0 border border-blue-100/50">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">完成知识点</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">
                    <span className="font-extrabold text-blue-600">{learningStats.completedChapters}</span>
                    <span className="text-[10.5px] text-slate-400"> / {learningStats.totalChapters}</span>
                  </div>
                </div>
              </div>

              {/* Stat Card 3: Error count */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-lg shrink-0 border border-red-100/50">
                  <X className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">错题本存量</div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    <span className="text-sm text-red-500 font-serif">{learningStats.mistakesCount}</span> 道
                  </div>
                </div>
              </div>

              {/* Stat Card 4: Mastery donut ring representation */}
              <div className="bg-slate-50/70 rounded-xl p-3.5 flex items-center gap-3 border border-slate-100">
                {/* SVG Progress Ring */}
                <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      className="text-slate-200" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5"
                    />
                    <path 
                      className="text-emerald-500 transition-all duration-500" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeDasharray={`${learningStats.masteryRate}, 100`} 
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-[8.5px] font-black text-slate-700">{learningStats.masteryRate}%</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400">平均学能掌握度</div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">稳固型 ({learningStats.masteryRate}%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Tips Panel (Now positioned in the right column, below Learning Data Overview) */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4.5 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs md:text-sm font-bold text-slate-800 mb-1">小贴士</h4>
              <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed font-semibold">
                智能平台提示：定期检查并完善您的个人目标，能够让平台为您做出更加定制化的考点提纯，同时也会提升“智能学习报告”和“AI 小助手”中反馈建议的整体质量哦！您在学习大厅、我的课程、错题本的相关表现均会实时沉淀至您的基本画像和学能数据概览中。
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Recommended Learning Path Modal (Extremely robust & high fidelity) */}
      {showPathModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Title */}
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 stroke-[2.3]" />
                <span className="font-extrabold text-slate-800 text-sm md:text-base">AI 智力推荐：个性化算法通关路径</span>
              </div>
              <button 
                onClick={() => setShowPathModal(false)}
                className="p-1 px-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Contents */}
            <div className="p-6 overflow-y-auto space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                基于李明同学设定的学期冲刺目标「掌握基本算法思想，考查数据结构章节，提升实战代码效率」，系统定制了以下 3 级高阶通关阶段。目前第 1 阶段已达成，重点指向第 2、第 3 阶段：
              </p>

              <div className="space-y-4">
                {/* Path node 1 (Done) */}
                <div className="flex gap-4 items-start relative pb-3 border-l text-left border-dashed border-emerald-300 ml-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-400 shrink-0 flex items-center justify-center absolute left-[-15px] top-0.5 z-10 bg-white">
                    <Check className="w-4.5 h-4.5 text-emerald-600 stroke-[3]" />
                  </div>
                  <div className="pl-6">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>阶段 I：单链表与特殊线性表 (已通关)</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black">完成度 100%</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">完美攻克了单双链表节点操纵、循环队列哨兵指针等8个基本核心考点。</p>
                  </div>
                </div>

                {/* Path node 2 (Current Focus) */}
                <div className="flex gap-4 items-start relative pb-3 border-l text-left border-dashed border-blue-300 ml-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-500 shrink-0 flex items-center justify-center absolute left-[-15px] top-0.5 z-10 bg-white animate-pulse">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  </div>
                  <div className="pl-6">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-blue-600">阶段 II：树状结构与平衡调节 (正在进行)</span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-black">建议优先锁定</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">包含二叉搜索树、平衡AVL树根节点左旋右旋调节。本级有 21 道代表性测试错题存量，需要首批消化。</p>
                    <button 
                      onClick={() => {
                        setShowPathModal(false);
                        setActiveView('space');
                        triggerToast('🚀 已为您定位到学习大厅二叉树微课，请点击章节直接浏览！');
                      }}
                      className="text-[10px] text-blue-600 font-bold hover:underline mt-2 flex items-center gap-0.5"
                    >
                      <span>前往树结构备考专区</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Path node 3 (Locked future) */}
                <div className="flex gap-4 items-start relative ml-3.5 text-left">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-300 shrink-0 flex items-center justify-center absolute left-[-15px] top-0.5 z-10 bg-white">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="pl-6">
                    <h5 className="text-xs font-bold text-slate-400">
                      阶段 III：图的最小生成树判定与高阶散列
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1">需在阶段 II 整体正确率爬坡至 85% 以上自动解锁。包含 Prim 算法与哈希冲撞探测机制。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer action */}
            <div className="px-6 py-4.5 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setShowPathModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                我知道了，继续冲刺
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
