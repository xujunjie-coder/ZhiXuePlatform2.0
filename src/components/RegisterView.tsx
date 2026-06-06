import React, { useState, useEffect } from 'react';
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
  Phone,
  UserPlus,
  Compass,
  Briefcase,
  ChevronDown,
  Building,
  School,
  IdCard,
  UserCheck,
  Mail
} from 'lucide-react';

interface RegisterViewProps {
  onRegisterSuccess: (role: 'student' | 'teacher', name: string) => void;
  onGoLogin: () => void;
}

export default function RegisterView({ onRegisterSuccess, onGoLogin }: RegisterViewProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Student extended details
  const [studentSchool, setStudentSchool] = useState('计算机科学学院');
  const [studentGrade, setStudentGrade] = useState('2024级');
  const [studentMajor, setStudentMajor] = useState('软件工程');

  // Teacher extended details
  const [teacherSchool, setTeacherSchool] = useState('计算机科学学院');
  const [teacherWorkId, setTeacherWorkId] = useState('');
  const [teacherCourse, setTeacherCourse] = useState('深度学习与优化论');

  // Agreements and UI behaviors
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Password strength logic
  const [passwordStrength, setPasswordStrength] = useState<'none' | 'weak' | 'medium' | 'strong'>('none');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToast('⚠️ 请输入合法的电子邮箱地址！', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), bizType: 'register' })
      });
      const data = await res.json();
      if (data.success || data.code === 200) {
        setCountdown(60);
        showToast('✉️ 验证码已成功发送到您的邮箱，请注意查收！', 'success');
      } else {
        showToast(`⚠️ 发送验证码失败: ${data.message || '系统错误'}`, 'error');
      }
    } catch (err) {
      showToast('⚠️ 发送验证码网络请求失败，请稍后重试！', 'error');
    }
  };

  useEffect(() => {
    if (!password) {
      setPasswordStrength('none');
      return;
    }
    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length >= 6 && (/[0-9]/.test(password) && /[a-zA-Z]/.test(password))) {
      if (password.length > 9) {
        setPasswordStrength('strong');
      } else {
        setPasswordStrength('medium');
      }
    } else {
      setPasswordStrength('weak');
    }
  }, [password]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('⚠️ 姓名输入不能为空！请输入您的真实合法姓名。', 'error');
      return;
    }

    if (!username.trim()) {
      showToast('⚠️ 账号或学工号不能为空！请用它作为您唯一的学术ID。', 'error');
      return;
    }

    if (!phone.trim()) {
      showToast('⚠️ 为了后期密码安全找回，请输入有效手机电话号码。', 'error');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToast('⚠️ 请输入合法的电子邮箱地址，以便绑定接收系统验证码。', 'error');
      return;
    }

    if (!code.trim()) {
      showToast('⚠️ 邮箱验证码不能为空！请键入接收到的验证码。', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('⚠️ 账号安全密码长度必须等于或大于6位。', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('⚠️ 两次输入的新密码不一致，请仔细核对。', 'error');
      return;
    }

    if (role === 'teacher' && !teacherWorkId.trim()) {
      showToast('⚠️ 教师注册通道检测：请输入您的官方教师工号以完成校验。', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('⚠️ 请仔细阅读并手动勾选同意《用户协议》和《隐私政策》后方可注册。', 'error');
      return;
    }

    setIsLoading(true);
    showToast('⚙️ 正在连接智学网关进行安全注册...', 'info');

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          emailCode: code.trim(),
          password: password,
          nickname: name.trim()
        })
      });
      const regData = await regRes.json();
      
      if (!regRes.ok || (!regData.success && regData.code !== 200)) {
        showToast(`⚠️ 注册失败: ${regData.message || '系统错误'}`, 'error');
        setIsLoading(false);
        return;
      }

      showToast('🎉 注册成功！正在为您自动登录并载入学习空间...', 'success');

      // Chained auto-login after successful registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
      const loginData = await loginRes.json();
      
      setIsLoading(false);

      if (loginRes.ok && (loginData.success || loginData.code === 200 || loginData.token)) {
        // Handle both raw response format and our global response interceptor/proxy format
        const token = loginData.token || (loginData.data && loginData.data.token);
        const user = loginData.user || (loginData.data && loginData.data.user);
        
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', user.userId);
          localStorage.setItem('username', user.username);
          localStorage.setItem('nickname', user.nickname);
          localStorage.setItem('roleCode', user.roleCode);

          showToast(`🎉 欢迎加入智能辅学平台，${user.nickname || name.trim()}！`, 'success');
          setTimeout(() => {
            onRegisterSuccess(role, user.nickname || name.trim());
          }, 1000);
        } else {
          showToast('⚠️ 自动登录凭证解析失败，正在引导至登录页面...', 'info');
          setTimeout(() => {
            onGoLogin();
          }, 2000);
        }
      } else {
        showToast('⚠️ 自动登录失败，正在引导至登录页面...', 'info');
        setTimeout(() => {
          onGoLogin();
        }, 2000);
      }
    } catch (err) {
      showToast('⚠️ 注册网络请求失败，请稍后重试！', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen w-screen relative flex flex-col items-center justify-center font-sans antialiased text-slate-800 transition-colors duration-500 overflow-y-auto px-4 py-16 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
      style={{
        backgroundImage: "url('/login_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay screen */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          darkMode ? 'bg-slate-950/85' : 'bg-white/10'
        } -z-10`}
      />

      {/* Dynamic Back-to-Home Logo on the top left */}
      <div className="absolute top-6 left-6 md:left-10 h-12 hidden md:flex items-center gap-2.5 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 p-2.5 px-4 rounded-xl border border-white/20 select-none">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <BookOpen className="w-4 h-4 fill-white/10" />
        </div>
        <div className="text-left font-sans">
          <div className="text-xs font-black tracking-wider text-slate-800 dark:text-slate-100">智能辅学平台</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">AI 赋能学习 · 智慧绽放未来</div>
        </div>
      </div>

      {/* Theme Switching Mechanism matching login viewport */}
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
          {!darkMode && <Moon className="absolute right-1.5 w-2.5 h-2.5 text-slate-400 opacity-40 pointer-events-none" />}
          {darkMode && <Sun className="absolute left-1.5 w-2.5 h-2.5 text-slate-300 opacity-40 pointer-events-none" />}
        </button>
        <span>深色</span>
      </div>

      {/* Registration Card Layout */}
      <main className="w-full max-w-[660px] bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100 dark:border-slate-800/80 z-10 relative backdrop-blur-md animate-fadeIn">
        
        {/* Card Header Section */}
        <header className="text-center mb-8 select-none">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full mb-3 relative">
            <User className="w-6 h-6 stroke-[2.2]" />
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center border border-white">
              <span className="text-[10px] font-black leading-none">+</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">用户注册</h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-semibold">
            已有账号？{' '}
            <button 
              type="button"
              onClick={onGoLogin}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-extrabold transition-colors bg-transparent border-0 inline-flex items-center gap-0.5 cursor-pointer"
            >
              返回登录 <ArrowRight className="w-3 h-3 move-right" />
            </button>
          </p>
        </header>

        {/* Dynamic Interactive Status Toaster inside register view */}
        {toastMsg && (
          <div className={`mb-6 p-3.5 rounded-xl border text-xs text-left leading-relaxed font-semibold transition-all flex items-start gap-2.5 animate-fadeIn ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
              : toastMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
          }`}>
            <span className="shrink-0 text-base">💠</span>
            <span className="flex-1 whitespace-pre-line">{toastMsg.text}</span>
          </div>
        )}

        {/* Detailed Form Sheet */}
        <form onSubmit={handleRegisterSubmit} className="space-y-7">
          
          {/* Step 1: Identity Selection */}
          <section className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">1</div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <span>选择身份</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">(必选)</span>
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Student Card Checkbox */}
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
                  role === 'student'
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      role === 'student' ? 'border-blue-500' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {role === 'student' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-xs md:text-sm ${
                        role === 'student' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        学生角色
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-normal font-medium">
                        可加入课程、交互自测、记录及分析错题本数据
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Teacher Card Checkbox */}
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
                  role === 'teacher'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      role === 'teacher' ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {role === 'teacher' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 overflow-hidden shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-xs md:text-sm ${
                        role === 'teacher' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        教师角色
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-normal font-medium">
                        可生成考查集、实时汇总多维度学情图表数据
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Step 2: Basic Account Details */}
          <section className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">2</div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-100">
                基础信息 <span className="text-[10px] text-slate-400 font-bold tracking-tight">(通用)</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Name field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">真实姓名</span>
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-grow w-full px-4 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="请输入您的真实姓名"
                />
              </div>

              {/* Username field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <IdCard className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">账号 / 学工号</span>
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-grow w-full px-4 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="唯一标识，用于登录绑定"
                />
              </div>

              {/* Phone field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <Phone className="w-4 h-4 text-slate-400 text-xs" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">联系电话</span>
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-grow w-full px-4 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="用于账号身份验证与重设机制"
                />
              </div>

              {/* Email field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">电子邮箱</span>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow w-full px-4 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="请输入您的常用电子邮箱"
                />
              </div>

              {/* Verification Code field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">邮箱验证码</span>
                </div>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-grow w-full px-4 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="请输入验证码"
                />
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className="mr-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-2xs cursor-pointer select-none transition-colors disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shrink-0"
                >
                  {countdown > 0 ? `${countdown}s 后重试` : '发送验证码'}
                </button>
              </div>

              {/* Password field */}
              <div>
                <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                  <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">防护密码</span>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-grow w-full pl-4 pr-10 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                    placeholder="请输入新生成的登录密码"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="flex items-center justify-start gap-3 mt-2 text-[10.5px] select-none font-sans px-2">
                    <span className="text-slate-400">系统密码强度评析:</span>
                    <div className="flex items-center gap-1.5 w-48">
                      <div className={`h-1.5 flex-1 rounded-full relative transition-all duration-300 ${
                        passwordStrength === 'weak' || passwordStrength === 'medium' || passwordStrength === 'strong' 
                          ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        {passwordStrength === 'weak' && (
                          <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-rose-500 font-extrabold text-[9px] animate-bounce">弱</span>
                        )}
                      </div>
                      <div className={`h-1.5 flex-1 rounded-full relative transition-all duration-300 ${
                        passwordStrength === 'medium' || passwordStrength === 'strong' 
                          ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        {passwordStrength === 'medium' && (
                          <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-amber-500 font-extrabold text-[9px] animate-pulse">中等</span>
                        )}
                      </div>
                      <div className={`h-1.5 flex-1 rounded-full relative transition-all duration-300 ${
                        passwordStrength === 'strong' 
                          ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        {passwordStrength === 'strong' && (
                          <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-emerald-500 font-extrabold text-[9px]">强</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password field */}
              <div className="relative flex items-center bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 overflow-hidden transition-all">
                <div className="pl-4 pr-3 py-2.5 flex items-center gap-2 w-32 md:w-36 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200/50 dark:border-slate-800 shrink-0 select-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">二次验密</span>
                </div>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-grow w-full pl-4 pr-10 py-2.5 outline-none text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent placeholder-slate-300 focus:ring-0 border-0" 
                  placeholder="请再次键入核配密码"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          {/* Step 3: Conditional Extended Roles Info */}
          <section className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">3</div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>角色扩展学工卡</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">(随左侧选择动态激活)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Student Info Card Block */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                role === 'student'
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm opacity-100'
                  : 'bg-slate-50/30 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800/40 opacity-40 select-none pointer-events-none'
              }`}>
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-[0.06] rotate-12">
                  <GraduationCap className="w-16 h-16 text-blue-600" />
                </div>

                <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 mb-3.5">
                  <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
                  学生专属基本信息档案
                </h4>

                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">所在学校 / 学院</label>
                    <div className="relative">
                      <select 
                        value={studentSchool}
                        onChange={(e) => setStudentSchool(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 pr-8 py-2 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        disabled={role !== 'student'}
                      >
                        <option>计算机科学与技术学院</option>
                        <option>人工智能与数据计算中心</option>
                        <option>文学院与应用媒体学部</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">学制入学年级</label>
                    <div className="relative">
                      <select 
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 pr-8 py-2 pr-8 py-2 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        disabled={role !== 'student'}
                      >
                        <option>2023级 (大三学期)</option>
                        <option>2024级 (大二研习)</option>
                        <option>2025级 (新生预备)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">主选必修专业</label>
                    <div className="relative">
                      <select 
                        value={studentMajor}
                        onChange={(e) => setStudentMajor(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 pr-8 py-2 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        disabled={role !== 'student'}
                      >
                        <option>软件工程 (机器学习方向)</option>
                        <option>智能科学与技术</option>
                        <option>计算机科学与技术</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Info Card Block */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                role === 'teacher'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 shadow-sm opacity-100'
                  : 'bg-slate-50/30 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800/40 opacity-40 select-none pointer-events-none'
              }`}>
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-[0.06] rotate-12">
                  <UserCheck className="w-16 h-16 text-emerald-600" />
                </div>

                <h4 className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-3.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
                  教授专属教职工信息
                </h4>

                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">主管任职学部</label>
                    <div className="relative">
                      <select 
                        value={teacherSchool}
                        onChange={(e) => setTeacherSchool(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 pr-8 py-2 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                        disabled={role !== 'teacher'}
                      >
                        <option>计算机科学与技术学院</option>
                        <option>人工智能与数据计算中心</option>
                        <option>数学科学研究所</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">教职工号 (官方统一编码)</label>
                    <input 
                      type="text" 
                      value={teacherWorkId}
                      onChange={(e) => setTeacherWorkId(e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-1.5 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                      placeholder="教代会编码 e.g. T202409"
                      disabled={role !== 'teacher'}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">主授教研精品课</label>
                    <div className="relative">
                      <select 
                        value={teacherCourse}
                        onChange={(e) => setTeacherCourse(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 pr-8 py-2 focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                        disabled={role !== 'teacher'}
                      >
                        <option>高等数学 (微积分基础)</option>
                        <option>深度学习入门实战 (精品高研班)</option>
                        <option>数据结构与最优化算法优化</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Step 4: Terms & Submitting */}
          <section className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">4</div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-100">协议与最终校验</h3>
            </div>

            <div className="flex items-start gap-3 mb-6 select-none leading-relaxed">
              <input 
                id="terms" 
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                我已仔细审配并同意 
                <button 
                  type="button" 
                  onClick={() => showToast('📑 见《用户协议》，包含多维学测习惯数据提取和智能推送机制。')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold ml-1 bg-transparent border-0 cursor-pointer"
                >
                  《用户协议》
                </button>
                <span>和</span>
                <button 
                  type="button" 
                  onClick={() => showToast('🛡️ 见《隐私政策》，您的学学籍和作业纠错等均保存在本地存储空间中。')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold bg-transparent border-0 cursor-pointer"
                >
                  《隐私政策》
                </button>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                  《用户协议》详情说明页 | 《隐私政策》双多保全书
                </div>
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg ring-4 ring-blue-500/10 active:scale-98 transition-all disabled:opacity-75 disabled:cursor-wait text-sm md:text-base tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  智能网关安全注册中...
                </>
              ) : (
                '立即创建账号并开启学习之旅'
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-3">
              注册成功后系统将自动模拟安全登录，同步直接为您跳转至主学辅空间。
            </p>
          </section>

        </form>

      </main>

      {/* Footer copyright */}
      <footer className="mt-auto pb-4 z-10 text-center text-xs text-slate-400 dark:text-slate-500 font-medium select-none">
        <p>© 2024 智能辅学平台 All rights reserved.</p>
      </footer>
    </div>
  );
}
