import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/HomeView';
import CoursesView from './components/CoursesView';
import SpaceView from './components/SpaceView';
import MistakesView from './components/MistakesView';
import ExamView from './components/ExamView';
import StudyDetailView from './components/StudyDetailView';
import ReportView from './components/ReportView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import TeacherDashboard from './components/TeacherDashboard';
import { Course, Exam, ActiveView } from './types';

// Hotlinked High-fidelity cover images
const COURSE_COVERS = {
  ml: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60',
  math: 'https://images.unsplash.com/photo-1543167121-5a9e99a89d18?w=500&auto=format&fit=crop&q=60',
  ds: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60',
  py: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
  algebra: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
  prob: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60',
  deep: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60',
  os: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60'
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<{ role: 'student' | 'teacher'; name: string } | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [examActiveSubTab, setExamActiveSubTab] = useState<'tasks' | 'exams'>('exams');
  const [spaceActiveTab, setSpaceActiveTab] = useState<string>('学情概览');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('h1');
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  // Shared state of to-do tasks matching the initial tasks in HomeView
  const [todoTasks, setTodoTasks] = useState<any[]>([]);

  // Integrated custom calendar planner schedules in Personal center
  const [customSchedules, setCustomSchedules] = useState<any[]>([]);

  // Check and verify token on initial mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const savedRole = localStorage.getItem('roleCode');
      const nickname = localStorage.getItem('nickname');
      const userId = localStorage.getItem('userId');
      
      if (token && savedRole && nickname && userId) {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            const role = data.roleCode === 'teacher' ? 'teacher' : 'student';
            setCurrentUser({ role, name: data.nickname || nickname });
            setIsLoggedIn(true);
            return;
          }
        } catch (e) {
          console.warn('Session verification failed, using local session fallback:', e);
        }
        
        // Fallback to local storage session info
        const role = savedRole === 'teacher' ? 'teacher' : 'student';
        setCurrentUser({ role, name: nickname });
        setIsLoggedIn(true);
      }
    };
    checkSession();
  }, []);

  // Save selectedCourseId to localStorage whenever it changes so the fetch interceptor/proxy can use it
  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem('currentCourseId', selectedCourseId);
    }
  }, [selectedCourseId]);

  // Centralized logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('nickname');
    localStorage.removeItem('roleCode');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/courses')
        .then(res => res.json())
        .then(data => setCourses(data))
        .catch(err => console.error("Failed to fetch courses:", err));
      fetch('/api/exams')
        .then(res => res.json())
        .then(data => setExams(data))
        .catch(err => console.error("Failed to fetch exams:", err));
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => setTodoTasks(data))
        .catch(err => console.error("Failed to fetch tasks:", err));
      fetch('/api/schedules')
        .then(res => res.json())
        .then(data => setCustomSchedules(data))
        .catch(err => console.error("Failed to fetch schedules:", err));
      fetch('/api/space/history-logs')
        .then(res => res.json())
        .then(data => setHistoryLogs(data))
        .catch(err => console.error("Failed to fetch history logs:", err));
    }
  }, [isLoggedIn]);

  // State to hold active simulated macOS/Windows style floating desktop notification banner
  const [toastNotification, setToastNotification] = useState<{title: string, body: string, taskId?: string} | null>(null);

  // Progress bar state (0 - 100) representing remaining time before auto-dismiss
  const [toastProgress, setToastProgress] = useState(100);

  // Auto-dismiss and animated progress timer effect for toastNotification
  useEffect(() => {
    if (!toastNotification) {
      setToastProgress(100);
      return;
    }

    const duration = 10000; // 10 seconds duration
    const tickTime = 40; // 25 FPS update rate for maximum smoothness
    const totalTicks = duration / tickTime;
    let tickCount = 0;

    const timer = setInterval(() => {
      tickCount += 1;
      const progressRemaining = Math.max(0, 100 - (tickCount / totalTicks) * 100);
      setToastProgress(progressRemaining);

      if (tickCount >= totalTicks) {
        clearInterval(timer);
        setToastNotification(null);
      }
    }, tickTime);

    return () => clearInterval(timer);
  }, [toastNotification]);

  // Digital synth chime audio generation via Web Audio API 
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.12); // C6
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.95);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.0);
      osc2.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.warn("Autoplay was blocked or audio creation failed:", e);
    }
  };

  // High-fidelity scheduler and browser-based / application-wide system desktop reminder generator
  const handleSetTaskReminder = (taskId: string, seconds: number, customLabel: string) => {
    const target = todoTasks.find(t => t.id === taskId);
    if (!target) return;

    // Calculate simulated target time
    const futureDate = new Date(Date.now() + seconds * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeLabel = `${pad(futureDate.getHours())}:${pad(futureDate.getMinutes())}:${pad(futureDate.getSeconds())}`;
    const fullReminderLabel = `${customLabel || '定时督测'} (${timeLabel})`;

    setTodoTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      reminderTime: fullReminderLabel
    } : t));

    // Queue JavaScript timer to ring. Once fired, we'll confirm task is still active before buzzing!
    setTimeout(() => {
      setTodoTasks(currentTasks => {
        const liveTask = currentTasks.find(ct => ct.id === taskId);
        if (liveTask && liveTask.status !== '已完成') {
          // Play physical sound chime
          playChime();

          // Try native browser notification
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(`📅 待办学习提醒：${liveTask.title}`, {
                body: `您在智学平台设置的定时计划已开始！别忘了尽快攻克知识点哟。`,
                icon: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(res => {
                if (res === 'granted') {
                  new Notification(`📅 待办学习提醒：${liveTask.title}`, {
                    body: `您在智学平台设置的定时计划已开始！别忘了尽快攻克知识点哟。`
                  });
                }
              });
            }
          }

          // Trigger simulated floating macOS desktop notification popup in viewport
          setToastNotification({
            title: liveTask.title,
            body: `📌 您的设置提醒已激活：【截止 ${liveTask.deadline}】，快前往相应的微课/测验/作业完成此阶段性计划，点亮学习进度。`,
            taskId: liveTask.id
          });
        }
        return currentTasks;
      });
    }, seconds * 1000);
  };

  // Core list of 8 courses matching custom categories
  const [courses, setCourses] = useState<Course[]>([]);

  // Core list of exams
  const [exams, setExams] = useState<Exam[]>([]);

  // Proxy Express server-side chat API request
  const handleSendChatMessage = async (promptText: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText })
      });
      if (!res.ok) {
        throw new Error('Server error');
      }
      const data = await res.json();
      return data.text || '没有返回内容。';
    } catch (e) {
      console.warn('API error, falling back locally:', e);
      // Local fallback representation
      const lower = promptText.toLowerCase();
      if (lower.includes('mse') || lower.includes('均方误差')) {
        return `均方误差 (MSE) 是微积分凸优化和回归预测中的首要测度。它对极端点极其铭感。你可以查看当前处于活动中的《1.3 评估指标: MSE 与 MAE》交互卡片：其中总平方和 MSE 正是基于每颗 Y 观测偏差的二次平方求和计算而来的。`;
      }
      return `李同学好，关于本节考查知识，我们可以通过“可视化演示”滑块来加深学习，观察参数求微分更新时的拟合残差减少状况！`;
    }
  };

  const handleAIExplanationRequest = (promptText: string) => {
    setSelectedCourseId('1'); // Select machine learning database
    setActiveView('studying');
    // We delay slightly to let the study view open and its state settle,
    // though the StudyDetailView's embedded chatbot uses the search action or triggers automatically.
  };

  if (!isLoggedIn) {
    if (authScreen === 'register') {
      return (
        <RegisterView 
          onRegisterSuccess={(role, username) => {
            setCurrentUser({ role, name: username });
            setIsLoggedIn(true);
          }}
          onGoLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginView 
        onLoginSuccess={(role, username) => {
          setCurrentUser({ role, name: username });
          setIsLoggedIn(true);
        }}
        onGoRegister={() => setAuthScreen('register')}
      />
    );
  }

  // Render Teacher Dashboard if logged-in user is a teacher
  if (currentUser?.role === 'teacher') {
    return (
      <TeacherDashboard 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Dynamic Left Sidebar Drawer */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      {/* Main Core View Area containing Top Header + Scrollable content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Sticky Top Header navigation search dropdown bar */}
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onOpenMessages={() => {
            setSelectedCourseId('1');
            setActiveView('studying');
          }}
          onOpenNotifications={() => {
            setActiveView('exams');
          }}
          setActiveView={setActiveView}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic container matching main viewport */}
        <main className="flex-grow bg-slate-50 overflow-y-auto p-8">
          {activeView === 'home' && (
            <HomeView 
              setActiveView={setActiveView} 
              setSelectedCourseId={setSelectedCourseId}
              courses={courses}
              tasks={todoTasks}
              setTasks={setTodoTasks}
              onSetReminder={handleSetTaskReminder}
              setExamActiveSubTab={setExamActiveSubTab}
              setSpaceActiveTab={setSpaceActiveTab}
              setSelectedHistoryId={setSelectedHistoryId}
              historyLogs={historyLogs}
            />
          )}

          {activeView === 'profile' && (
            <ProfileView 
              setActiveView={setActiveView}
              tasks={todoTasks}
              setTasks={setTodoTasks}
              customSchedules={customSchedules}
              setCustomSchedules={setCustomSchedules}
              onSetReminder={handleSetTaskReminder}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView 
              setActiveView={setActiveView}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}

          {activeView === 'courses' && (
            <CoursesView 
              courses={courses}
              setCourses={setCourses}
              setActiveView={setActiveView}
              setSelectedCourseId={setSelectedCourseId}
              searchTerm={searchTerm}
              selectedFolder={selectedFolder}
            />
          )}

          {activeView === 'space' && (
            <SpaceView 
              courses={courses}
              setActiveView={setActiveView}
              setSelectedCourseId={setSelectedCourseId}
              activeTab={spaceActiveTab}
              setActiveTab={setSpaceActiveTab}
              selectedHistoryId={selectedHistoryId}
              setSelectedHistoryId={setSelectedHistoryId}
              historyLogs={historyLogs}
              setHistoryLogs={setHistoryLogs}
              tasks={todoTasks}
              setTasks={setTodoTasks}
              onSetReminder={handleSetTaskReminder}
            />
          )}

          {activeView === 'mistakes' && (
            <MistakesView 
              courses={courses}
              setActiveView={setActiveView}
              setSelectedCourseId={setSelectedCourseId}
            />
          )}

          {activeView === 'report' && (
            <ReportView 
              courses={courses}
              setActiveView={setActiveView}
              setSelectedCourseId={setSelectedCourseId}
            />
          )}

          {activeView === 'exams' && (
            <ExamView 
              exams={exams}
              setExams={setExams}
              setActiveView={setActiveView}
              onAIExplanationRequest={handleAIExplanationRequest}
              tasks={todoTasks}
              setTasks={setTodoTasks}
              onSetReminder={handleSetTaskReminder}
              activeSubTab={examActiveSubTab}
              setActiveSubTab={setExamActiveSubTab}
              setSpaceActiveTab={setSpaceActiveTab}
            />
          )}

          {activeView === 'studying' && (
            <StudyDetailView 
              courseId={selectedCourseId}
              courses={courses}
              setActiveView={setActiveView}
              onSendChatMessage={handleSendChatMessage}
            />
          )}
        </main>
      </div>

      {/* Simulated High-Fi macOS / Windows Desktop notification widget popup */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, x: 200, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 320, scale: 0.9, transition: { duration: 0.3, ease: 'easeIn' } }}
            className="toast-notification-widget fixed top-6 right-6 z-[9999] w-80 md:w-[380px] bg-white text-slate-800 rounded-2xl border border-slate-200/90 p-4 pb-5 shadow-2xl flex gap-3.5 text-left overflow-hidden ring-4 ring-blue-500/15"
          >
            {/* Accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>
            
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/40">
              <Bell className="w-5 h-5 animate-pulse text-blue-600 stroke-[2.2]" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                  智学平台 · 系统桌面提醒
                </span>
                <span className="font-sans">现在</span>
              </div>
              
              <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-snug">
                待办专注提醒事件
              </h4>
              
              <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">
                {toastNotification.title}
              </p>
              
              <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
                {toastNotification.body}
              </p>

              {/* Simulated Desktop CTA Button controls */}
              <div className="flex gap-2.5 mt-3 pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setToastNotification(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  忽略提醒
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('home');
                    setToastNotification(null);
                  }}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-3xs transition-all cursor-pointer"
                >
                  立即去完成
                </button>
              </div>
            </div>

            {/* Close button icon */}
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors self-start p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>

            {/* Visual countdown progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-75 ease-linear"
                style={{ width: `${toastProgress}%` }}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
