import React, { useState } from 'react';
import { 
  GraduationCap, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  Check,
  UserCheck
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: 'student' | 'teacher', username: string) => void;
  onGoRegister?: () => void;
}

export default function LoginView({ onLoginSuccess, onGoRegister }: LoginViewProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [username, setUsername] = useState('student_demo');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Prefill default account details elegantly when role is changed, unless user has typed something custom
  const handleRoleChange = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole);
    if (selectedRole === 'student') {
      if (username === '' || username === 'teacher_demo') {
        setUsername('student_demo');
      }
      if (password === '' || password === '123456') {
        setPassword('123456');
      }
    } else {
      if (username === '' || username === 'student_demo') {
        setUsername('teacher_demo');
      }
      if (password === '' || password === '123456') {
        setPassword('123456');
      }
    }
  };
  
  // Interactive loading and feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!agreeTerms) {
      showToast('⚠️ 在登录前，请先勾选同意《用户协议》和《隐私政策》', 'error');
      return;
    }

    if (!username.trim()) {
      showToast('⚠️ 请输入您的账号或手机号', 'error');
      return;
    }

    if (!password) {
      showToast('⚠️ 请输入您的登录密码', 'error');
      return;
    }

    setIsLoading(true);
    showToast('🚀 正在验证账号，请求智学安全网关...', 'info');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && (data.success || data.code === 200 || data.token)) {
        // Handle both raw response format and our global response interceptor/proxy format
        const token = data.token || (data.data && data.data.token);
        const user = data.user || (data.data && data.data.user);

        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', user.userId);
          localStorage.setItem('username', user.username);
          localStorage.setItem('nickname', user.nickname);
          localStorage.setItem('roleCode', user.roleCode);

          const userRole = user.roleCode === 'teacher' ? 'teacher' : 'student';

          showToast(`🎉 登录成功！欢迎回来，${user.nickname}...`, 'success');
          setTimeout(() => {
            onLoginSuccess(userRole, user.nickname);
          }, 800);
        } else {
          showToast('⚠️ 登录凭证解析异常，请重试！', 'error');
        }
      } else {
        // Fallback for demo accounts
        const isDemo = username.trim() === 'student_demo' || username.trim() === 'teacher_demo';
        if (isDemo) {
          showToast('⚠️ 未在后端数据库中检测到演示账号，已启用本地离线演示模式进行载入...', 'info');
          
          localStorage.setItem('token', 'mock-token-abc-123');
          localStorage.setItem('userId', username.trim() === 'student_demo' ? '8002' : '9002');
          localStorage.setItem('username', username.trim());
          localStorage.setItem('nickname', username.trim() === 'student_demo' ? '李同学(演示)' : '张老师(教研组)');
          localStorage.setItem('roleCode', username.trim() === 'student_demo' ? 'student' : 'teacher');

          setTimeout(() => {
            onLoginSuccess(role, username.trim() === 'student_demo' ? '李同学(演示)' : '张老师(教研组)');
          }, 1000);
        } else {
          showToast(`⚠️ 登录失败: ${data.message || '用户名或密码错误'}`, 'error');
        }
      }
    } catch (err) {
      setIsLoading(false);
      const isDemo = username.trim() === 'student_demo' || username.trim() === 'teacher_demo';
      if (isDemo) {
        showToast('⚠️ 连接后端网关异常，已自动切换为本地离线演示模式...', 'info');
        
        localStorage.setItem('token', 'mock-token-abc-123');
        localStorage.setItem('userId', username.trim() === 'student_demo' ? '8002' : '9002');
        localStorage.setItem('username', username.trim());
        localStorage.setItem('nickname', username.trim() === 'student_demo' ? '李同学(演示)' : '张老师(教研组)');
        localStorage.setItem('roleCode', username.trim() === 'student_demo' ? 'student' : 'teacher');

        setTimeout(() => {
          onLoginSuccess(role, username.trim() === 'student_demo' ? '李同学(演示)' : '张老师(教研组)');
        }, 1000);
      } else {
        showToast('⚠️ 登录网络请求失败，请检查您的网络连接或稍后重试！', 'error');
      }
    }
  };

  // Demo account instant quick-login triggering helper
  const triggerDemoLogin = (selectedRole: 'student' | 'teacher') => {
    if (!agreeTerms) {
      showToast('⚠️ 演示登录也需要您勾选同意隐私服务条款哦', 'error');
      return;
    }

    setRole(selectedRole);
    const targetUsername = selectedRole === 'student' ? 'student_demo' : 'teacher_demo';
    setUsername(targetUsername);
    setPassword('123456');
    
    setIsLoading(true);
    showToast(`🔑 正在载入 ${selectedRole === 'student' ? '学生' : '教师'} 专享多维看板与测试数据集...`, 'success');

    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: targetUsername,
            password: '123456'
          })
        });
        const data = await res.json();
        setIsLoading(false);

        if (res.ok && (data.success || data.code === 200 || data.token)) {
          const token = data.token || (data.data && data.data.token);
          const user = data.user || (data.data && data.data.user);

          if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.userId);
            localStorage.setItem('username', user.username);
            localStorage.setItem('nickname', user.nickname);
            localStorage.setItem('roleCode', user.roleCode);
            showToast(`🎉 登录成功！欢迎回来，${user.nickname}...`, 'success');
            setTimeout(() => {
              onLoginSuccess(selectedRole, user.nickname);
            }, 800);
            return;
          }
        }
      } catch (e) {}

      setIsLoading(false);
      showToast('⚠️ 已启用本地离线演示模式进行载入...', 'info');
      localStorage.setItem('token', 'mock-token-abc-123');
      localStorage.setItem('userId', selectedRole === 'student' ? '8002' : '9002');
      localStorage.setItem('username', targetUsername);
      localStorage.setItem('nickname', selectedRole === 'student' ? '李同学(演示)' : '张老师(教研组)');
      localStorage.setItem('roleCode', selectedRole === 'student' ? 'student' : 'teacher');

      setTimeout(() => {
        onLoginSuccess(selectedRole, selectedRole === 'student' ? '李同学(演示)' : '张老师(教研组)');
      }, 1000);
    }, 500);
  };

  return (
    <div 
      className={`min-h-screen w-screen relative flex flex-col items-center justify-center font-sans antialiased text-slate-800 transition-colors duration-500 overflow-y-auto px-4 py-8 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
      style={{
        backgroundImage: "url('/login_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background glass overlay mask adjusting for dark mode */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          darkMode ? 'bg-slate-950/80' : 'bg-white/10'
        } -z-10`}
      />

      {/* Floating System-level Top Left brand logo banner */}
      <div className="absolute top-6 left-6 md:left-10 h-12 hidden md:flex items-center gap-2.5 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-2.5 px-4 rounded-xl border border-white/20 select-none">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <BookOpen className="w-4 h-4 fill-white/10" />
        </div>
        <div className="text-left font-sans">
          <div className="text-xs font-black tracking-wider text-slate-800 dark:text-slate-100">智能辅学平台</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">AI 赋能学习 · 智慧绽放未来</div>
        </div>
      </div>

      {/* Theme Swiper Selector in Upper Right */}
      <div className="absolute top-6 right-6 md:right-10 flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold z-20 select-none">
        <span>浅色</span>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 shadow-inner ${
            darkMode ? 'bg-indigo-900/60 ring-1 ring-white/10' : 'bg-blue-100'
          }`}
          title="切换深海星空/经典明媚主题"
        >
          <div 
            className={`h-5 w-5 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ${
              darkMode ? 'translate-x-6 bg-indigo-500 text-white' : 'translate-x-1 bg-amber-500 text-white'
            }`}
          >
            {darkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          </div>
          {/* Subtle light decoration indicator inside swiper path */}
          {!darkMode && <Moon className="absolute right-1.5 w-2.5 h-2.5 text-slate-400 opacity-40 pointer-events-none" />}
          {darkMode && <Sun className="absolute left-1.5 w-2.5 h-2.5 text-slate-300 opacity-40 pointer-events-none" />}
        </button>
        <span>深色</span>
      </div>

      {/* Main Core Login Card Frame */}
      <main className="w-full max-w-[450px] bg-white dark:bg-slate-900/95 rounded-3xl shadow-2xl p-6 md:p-9 border border-slate-100 dark:border-slate-800/80 z-10 relative mt-16 mb-8 backdrop-blur-lg animate-fadeIn">
        {/* Header Branding Panel inside card */}
        <header className="text-center mb-7 select-none">
          <div className="flex items-center justify-center mb-3 space-x-3">
            <div className="w-13 h-13 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-1 hover:rotate-6 transition-transform">
              <BookOpen className="w-7 h-7 fill-white/15" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">
              智能辅学平台
            </h1>
          </div>
          <p className="text-slate-400 dark:text-slate-400 text-xs md:text-sm font-semibold max-w-xs mx-auto leading-relaxed">
            基于大模型的全课程个性化学习平台
          </p>
        </header>

        {/* Interactive Interactive Feedback Toast embedded inline in block */}
        {toastMsg && (
          <div className={`mb-5 p-3 rounded-xl border text-xs text-left leading-relaxed font-semibold transition-all flex items-start gap-2 animate-fadeIn ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
              : toastMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
          }`}>
            <span className="shrink-0 pt-0.5">🔔</span>
            <span className="flex-1 whitespace-pre-line">{toastMsg.text}</span>
          </div>
        )}

        {/* Login Form Sheet */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection Group with check states */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              选择登录身份
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer relative group">
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => handleRoleChange('student')}
                  className="peer sr-only"
                />
                <div className="rounded-xl border py-2.5 flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 peer-checked:border-blue-500 peer-checked:bg-blue-50/80 dark:peer-checked:bg-blue-950/50 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 peer-checked:font-bold peer-checked:shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span className="text-xs md:text-sm">学生入口</span>
                </div>
                {/* Visual active border highlight glow indicator */}
                <div className="absolute -inset-px rounded-xl border border-blue-500/0 peer-checked:border-blue-500 pointer-events-none transition-all"></div>
              </label>

              <label className="cursor-pointer relative group">
                <input 
                  type="radio" 
                  name="role" 
                  value="teacher" 
                  checked={role === 'teacher'} 
                  onChange={() => handleRoleChange('teacher')}
                  className="peer sr-only"
                />
                <div className="rounded-xl border py-2.5 flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 peer-checked:border-emerald-500 peer-checked:bg-emerald-50/80 dark:peer-checked:bg-emerald-950/50 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 peer-checked:font-bold peer-checked:shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="text-xs md:text-sm">教师入口</span>
                </div>
                {/* Visual active border highlight glow indicator */}
                <div className="absolute -inset-px rounded-xl border border-emerald-500/0 peer-checked:border-emerald-500 pointer-events-none transition-all"></div>
              </label>
            </div>
          </div>

          {/* Username Field */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              账号 / 手机号
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/40 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs md:text-sm placeholder-slate-400 font-medium transition-all" 
                placeholder={role === 'student' ? '请输入学生账号或手机号' : '请输入授课教师账号'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              密 码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/40 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-xs md:text-sm placeholder-slate-400 font-medium transition-all" 
                placeholder="密码请输入六位以上"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? '暗化屏蔽密码' : '肉眼查看密码'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Links for Register & Forget Password */}
          <div className="flex items-center justify-between text-xs mt-1">
            <button 
              type="button"
              onClick={() => showToast('🔔 密码重置业务请前往学校教务管理中心审核，或联系班级助教重置。')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold bg-transparent border-0 cursor-pointer"
            >
              忘记密码？
            </button>
            <button 
              type="button"
              onClick={() => {
                if (onGoRegister) {
                  onGoRegister();
                } else {
                  showToast('🚀 智学平台采用学校统一身份认证，首批学生可在此直接使用学生演示账号免密钥免注册登录。');
                }
              }}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold bg-transparent border-0 cursor-pointer"
            >
              没有账号？ <span className="text-blue-600 dark:text-blue-400">去注册 →</span>
            </button>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center text-left">
            <input 
              id="remember-me" 
              type="checkbox" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold select-none cursor-pointer">
              记住我 (保留登录会话)
            </label>
          </div>

          {/* Submit Login Button with Loading effect */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-1.5 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm md:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-98 transition-all disabled:opacity-75 disabled:cursor-wait cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在登录智学网络...
              </>
            ) : (
              '立即登录'
            )}
          </button>

          {/* Horizontal custom divider */}
          <div className="relative my-6 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-extrabold tracking-wide">
                演示账号快速登录
              </span>
            </div>
          </div>

          {/* Demo Login Buttons Panel */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button 
              type="button" 
              disabled={isLoading}
              onClick={() => triggerDemoLogin('student')}
              className="w-full flex items-center justify-center py-2.5 px-3 border border-blue-200 dark:border-blue-900/50 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/90 dark:hover:bg-blue-950/60 transition-colors space-x-1.5 disabled:opacity-50 cursor-pointer shadow-3xs"
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>学生演示登录</span>
            </button>
            <button 
              type="button" 
              disabled={isLoading}
              onClick={() => triggerDemoLogin('teacher')}
              className="w-full flex items-center justify-center py-2.5 px-3 border border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/90 dark:hover:bg-emerald-950/60 transition-colors space-x-1.5 disabled:opacity-50 cursor-pointer shadow-3xs"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>教师演示登录</span>
            </button>
          </div>

          {/* Terms Agreement checklist checkbox to fit screenshot */}
          <div className="pt-2 text-center text-[10px] md:text-xs text-slate-400 flex items-center justify-center space-x-1 select-none">
            <button 
              type="button"
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="focus:outline-none focus:ring-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <CheckCircle 
                className={`w-3.5 h-3.5 transition-colors ${
                  agreeTerms ? 'text-blue-500 fill-blue-500/10' : 'text-slate-300'
                }`} 
              />
            </button>
            <span className="cursor-pointer" onClick={() => setAgreeTerms(!agreeTerms)}>登录即代表同意</span>
            <button 
              type="button"
              onClick={() => showToast('📑 见《用户协议》，包含个人学习热度数据授权与通知服务提供。')} 
              className="text-blue-500 dark:text-blue-400 hover:underline font-bold bg-transparent border-0 focus:outline-none cursor-pointer"
            >
              《用户协议》
            </button>
            <span>和</span>
            <button 
              type="button"
              onClick={() => showToast('🛡️ 见《隐私政策》，承诺保护个人学分考勤及错题习惯，所有推荐均仅本地生成。')} 
              className="text-blue-500 dark:text-blue-400 hover:underline font-bold bg-transparent border-0 focus:outline-none cursor-pointer"
            >
              《隐私政策》
            </button>
          </div>
        </form>
      </main>

      {/* Elegant design system copyright footer */}
      <footer className="mt-auto pb-4 z-10 text-center text-xs text-slate-400 dark:text-slate-500 font-medium select-none">
        <p>© 2024 智能辅学平台 All rights reserved.</p>
      </footer>
    </div>
  );
}
