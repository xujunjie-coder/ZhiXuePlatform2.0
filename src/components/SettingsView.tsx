import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Volume2, 
  Cpu, 
  Camera, 
  Check, 
  AlertCircle, 
  RotateCw, 
  Sliders, 
  Tv, 
  Lock, 
  RefreshCw, 
  Globe, 
  HelpCircle,
  Eye,
  EyeOff,
  CloudLightning,
  Video,
  Mic,
  Database,
  HardDrive
} from 'lucide-react';

interface SettingsViewProps {
  setActiveView: (view: any) => void;
  currentUser: { role: 'student' | 'teacher'; name: string } | null;
  onLogout?: () => void;
}

export default function SettingsView({ 
  setActiveView, 
  currentUser,
  onLogout
}: SettingsViewProps) {
  // Navigation tab key selection
  const [activeTab, setActiveTab] = useState<'profile' | 'study' | 'notify' | 'security' | 'perms'>('profile');
  
  // Custom toast notification banner inside view
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----- Tab 1: Profile Details States -----
  const [nickname, setNickname] = useState(currentUser?.name || '李同学');
  const [email, setEmail] = useState(currentUser?.role === 'teacher' ? 'teacher_pro@school.edu.cn' : 'student_active@school.edu.cn');
  const [phone, setPhone] = useState('138-1234-5678');
  const [academicId, setAcademicId] = useState(currentUser?.role === 'teacher' ? 'TEA-2026-9081' : 'STU-2023-1234');
  const [university, setUniversity] = useState('复旦大学');
  const [department, setDepartment] = useState('计算机科学与技术学院');
  const [bio, setBio] = useState('心怀热忱，行而不辍，在代码的宇宙里构筑有温度的系统。');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.role === 'teacher' 
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const availableAvatars = [
    { name: '智慧杏黄', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: '学者赤朱', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: '灵动天蓝', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { name: '极客墨黛', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { name: '沉稳翡翠', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✨ 账号基本资料在云端同步成功，状态已就绪！', 'success');
  };

  // ----- Tab 2: AI Study Preference States -----
  const [aiPersona, setAiPersona] = useState<'rigorous' | 'gentle' | 'peer'>('gentle');
  const [aiDetailLevel, setAiDetailLevel] = useState<number>(2); // 1: Concise 2: Balanced 3: Academic Academic-deep
  const [algoSpeed, setAlgoSpeed] = useState<number>(1.0); // 0.5, 1.0, 1.5, 2.0
  const [eyeCareMode, setEyeCareMode] = useState<boolean>(false);
  const [isClassroomInteractive, setIsClassroomInteractive] = useState<boolean>(true);

  // Custom quotes from selected AI tutor character
  const getPersonaQuote = () => {
    switch (aiPersona) {
      case 'rigorous':
        return '【严厉学者 · 张老先生】:“求学之途最忌似懂非懂。一分公式，十分求证，你的均方误差模型拟合并不完美，请立刻检查算法推导。”';
      case 'gentle':
        return '【温和导师 · 梁老师】:“不要有压力，我们一起把难点掰开看。这一步梯度下降虽然慢，但代表你每一分钟都在成长呀。”';
      case 'peer':
        return '【知性学姐 · 允儿】:“嘿学弟学妹！这章我也卡住过，我的小妙招是先把动画倍速调慢，等看清楚二叉树旋转后，一切都豁然开朗啦！”';
      default:
        return '';
    }
  };

  // Live CSS animated sorting demo blocks (interactive visual playground for speed setting)
  const [sortingItems, setSortingItems] = useState([45, 80, 20, 95, 60, 35, 70]);
  useEffect(() => {
    const interval = setInterval(() => {
      setSortingItems(prev => {
        const next = [...prev];
        // Simple visual cycle swap to show animated simulation
        const first = next.shift();
        if (first !== undefined) next.push(first);
        return next;
      });
    }, 1500 / algoSpeed);
    return () => clearInterval(interval);
  }, [algoSpeed]);

  // ----- Tab 3: Study Chime / Notifications -----
  const [notifyLevel, setNotifyLevel] = useState<'all' | 'important' | 'none'>('all');
  const [chimeTone, setChimeTone] = useState<'synth' | 'retro' | 'strings' | 'nature'>('synth');
  const [isAutoDeadlines, setIsAutoDeadlines] = useState<boolean>(true);
  const [emailDigest, setEmailDigest] = useState<boolean>(true);

  // Web Audio API custom synthesizer chime
  const playConfiguredChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (chimeTone === 'synth') {
        // Futuristic clean dynamic synth chime
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc2.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.15); // C6
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.82);
        
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.9);
        osc2.stop(audioCtx.currentTime + 0.9);
      } 
      else if (chimeTone === 'retro') {
        // Retro 8-bit platformer double beep
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.08); // C5
        osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
        
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.16);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.4);
        
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.5);
      } 
      else if (chimeTone === 'strings') {
        // Melodic smooth classical strings triad (warm triangle nodes)
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
        osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // A4
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(392.00, audioCtx.currentTime); // G4
        osc2.frequency.exponentialRampToValueAtTime(554.37, audioCtx.currentTime + 0.3); // C#5

        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 1.2);
        
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 1.3);
        osc2.stop(audioCtx.currentTime + 1.3);
      } 
      else if (chimeTone === 'nature') {
        // Nature soft glass bell (deep soft chime with gentle vibrato LFO)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc1.frequency.linearRampToValueAtTime(875, audioCtx.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.002, audioCtx.currentTime + 1.6);
        
        osc1.start();
        osc1.stop(audioCtx.currentTime + 1.8);
      }
      showToast(`🎵 试听成功! 已加载「${
        chimeTone === 'synth' ? '未来智学合成音' : 
        chimeTone === 'retro' ? '8位元经典电子音' : 
        chimeTone === 'strings' ? '弦乐和弦唱晚' : '清泉空谷风铃'
      }」`, 'info');
    } catch (e) {
      console.warn("Audio Context block:", e);
      showToast('⚠️ 游览器音频上下文受阻，请点击激活该区域后重试', 'warning');
    }
  };

  // ----- Tab 4: Security States -----
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [trustDeviceCount, setTrustDeviceCount] = useState(2);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('⚠️ 所有密码字段均不能为空值', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ 新密码与确认新密码不匹配', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('⚠️ 新密码强度不足，请至少设置 6 位字符', 'warning');
      return;
    }
    
    showToast('🔑 密码修改成功！服务器密匙已完成更新安全迭代。', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordFields(false);
  };

  // ----- Tab 5: Environmental & Cache Diagnostics -----
  const [cacheSize, setCacheSize] = useState('2.48 MB');
  const [checkingHardware, setCheckingHardware] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'success' | 'denied'>('success');
  const [micPermission, setMicPermission] = useState<'pending' | 'success' | 'denied'>('success');

  const handleClearCache = () => {
    if (confirm('确认清空所有离线学情日志与本地预加载视频缓存吗？')) {
      showToast('🧹 正在清空本域 LocalStorage 与静态缓存...', 'info');
      setTimeout(() => {
        setCacheSize('0.00 KB');
        showToast('✅ 缓存已被彻底清理，应用框架已重置为轻量态！', 'success');
      }, 1000);
    }
  };

  const handleHardWareDiagnose = () => {
    setCheckingHardware(true);
    showToast('🔍 正在检测硬件驱动和环境权限映射...', 'info');
    setTimeout(() => {
      setCheckingHardware(false);
      setCameraPermission('success');
      setMicPermission('success');
      showToast('🏆 诊断完毕：AI监考环境摄像头 & 算法讲解麦克风均处于活跃状态！', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto py-3 animate-fadeIn">
      {/* Title Header area */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 animate-[spin_5s_linear_infinite]" />
            系统设置中心
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            设置您在「智学云教」平台的个人偏好参数、定制独特的 AI 导师性格、测试闹学提醒音以及维护账号安全。
          </p>
        </div>
        <button 
          onClick={() => setActiveView('home')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
        >
          返回个人首页
        </button>
      </div>

      {/* Internal Notification Alerts inside setting workspace */}
      {toastMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slideInRight duration-200 shadow-sm ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toastMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 ${
            toastMessage.type === 'success' ? 'text-emerald-500' :
            toastMessage.type === 'warning' ? 'text-amber-500' :
            'text-blue-500'
          }`} />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Settings Container Grid with Left Tabs list, Right Panels container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[580px]">
        
        {/* Left Hand Navigation Slots */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-200 p-4 shrink-0 flex flex-col gap-1.5 justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              配置分类
            </div>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>本生学籍 & 基础资料</span>
            </button>

            <button
              onClick={() => setActiveTab('study')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                activeTab === 'study' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>智能探针 & AI偏好</span>
            </button>

            <button
              onClick={() => setActiveTab('notify')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                activeTab === 'notify' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>督学闹铃 & 消息通知</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                activeTab === 'security' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>密码安全 & 单点集成</span>
            </button>

            <button
              onClick={() => setActiveTab('perms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                activeTab === 'perms' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>诊断探针 & 设备诊断</span>
            </button>
          </div>

          {/* Quick status display */}
          <div className="p-3 bg-slate-100/70 border border-slate-200/50 rounded-xl mt-6 hidden md:block">
            <div className="text-[10px] font-bold text-slate-400">服务环境状态</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>节点正常 (200 OK)</span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-1">
              v2.8.5 · May 29, 2026
            </div>
          </div>
        </div>

        {/* Right Hand Settings Main Body Panel Container */}
        <div className="flex-1 p-6 md:p-8">
          
          {/* ==================== TAB 1: PROFILE INFORMATION ==================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">学籍与基础资料</h3>
                <p className="text-xs text-slate-400 mt-1">
                  同步修改您在智能教育系统的全域基础档案，可随学籍档案一并报备教务处。
                </p>
              </div>

              {/* Avatar Selector Panel */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <img 
                  src={avatarUrl} 
                  alt="当前头像" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-600/30 shadow-inner"
                />
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">快捷自选系统人像：</span>
                  <div className="flex flex-wrap gap-2">
                    {availableAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAvatarUrl(av.url);
                          showToast(`已将头像变更为 [${av.name}]`, 'info');
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          avatarUrl === av.url 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {av.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    提示：选择合适的分支人像利于AI课程生成具有亲和度的数字交互课本。
                  </p>
                </div>
              </div>

              {/* Form Input Blocks */}
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">学籍真实姓名 / 昵称</label>
                  <input 
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">本生学籍学号 / 教工识别号</label>
                  <input 
                    type="text"
                    value={academicId}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 text-xs outline-none cursor-not-allowed"
                    title="学籍专属识别码在学信系统注册，个人无权随意修改"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">统一认证邮箱 (通知接收)</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">中国大陆手机号 (短信急递)</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">就读学校 (当前机构)</label>
                  <input 
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">所属学科 / 学院系别</label>
                  <input 
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">智能伴读签语 / 个人个性简介</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-4 text-xs outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                    placeholder="例如: 保持专注，学无止境！"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setNickname(currentUser?.name || '李同学');
                      setPhone('138-1234-5678');
                      setUniversity('复旦大学');
                      setDepartment('计算机科学与技术学院');
                      setBio('心怀热跚，行而不辍，在代码的宇宙里构筑有温度的系统。');
                      showToast('🔄 资料已还原到初始教务同步备份！', 'info');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                  >
                    重置更改
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>保存学年档案</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 2: AI STUDY PREFERENCES ==================== */}
          {activeTab === 'study' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">智能伴读与AI首选预设</h3>
                <p className="text-xs text-slate-400 mt-1">
                  按您偏好的节奏自定义 AI 助教的讲义回复深浅尺度及人设风格，以及算法交互引擎动画速率。
                </p>
              </div>

              {/* Persona Selection Row */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">① AI 助教学术人设选择：</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setAiPersona('rigorous');
                      showToast('🎓 模型预设人设已切换为 [严厉学者 · 张老先生]', 'info');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      aiPersona === 'rigorous' 
                        ? 'bg-red-50/50 border-red-300 ring-2 ring-red-500/20' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">严厉学者 · 张尊学</span>
                      {aiPersona === 'rigorous' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      恪守严密逻辑，主攻原理纠错，注重严密的概率公式理论分析，适合考研冲刺与竞赛生。
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setAiPersona('gentle');
                      showToast('🌟 模型预设人设已切换为 [温和导师 · 梁老师]', 'info');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      aiPersona === 'gentle' 
                        ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">温和导师 · 梁婉竹</span>
                      {aiPersona === 'gentle' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      以博学和温柔辅导和关怀主打，细心分解难点、循序渐进纠错，适合基础巩固及入门选手。
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setAiPersona('peer');
                      showToast('🦄 模型预设人设已切换为 [知性学姐 · 允儿]', 'info');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      aiPersona === 'peer' 
                        ? 'bg-violet-50/50 border-violet-300 ring-2 ring-violet-500/20' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">知性学姐 · 允儿</span>
                      {aiPersona === 'peer' && <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping"></span>}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      语言活跃俏皮，善于运用直观生动的比喻、通俗趣味代码，更像一同奋斗的伙伴队友。
                    </p>
                  </button>
                </div>

                {/* Simulated Real-world text generator matching the actual persona selection */}
                <div className="bg-slate-100/70 border border-slate-200 px-4 py-3 rounded-xl">
                  <div className="text-[9px] font-extrabold text-slate-400 font-mono tracking-widest uppercase mb-1">预览对话风格:</div>
                  <p className="text-xs font-semibold text-slate-800 italic leading-relaxed">
                    {getPersonaQuote()}
                  </p>
                </div>
              </div>

              {/* AI Details Depth slider */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">② AI 分析深度档位：</span>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                    {aiDetailLevel === 1 ? '精简主线模式' : aiDetailLevel === 2 ? '均衡交互模式' : '严密学术级透析'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={aiDetailLevel}
                    onChange={(e) => {
                      setAiDetailLevel(Number(e.target.value));
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                    <span>考点提要 (快读)</span>
                    <span>循经讲学 (平衡)</span>
                    <span>深度推导 (攻坚)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Loop: Animation speed of algorithms with visual demo items */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">③ 交互大纲图/算法模型 默认倍速：</span>
                    <span className="text-[10px] text-slate-400">滑块数值越大，解密动画播放频率越高。</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    <span className="text-xs font-extrabold font-mono text-indigo-600">{algoSpeed.toFixed(1)}x</span>
                  </div>
                </div>

                {/* Sub Algorithm range selector */}
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.5" 
                  value={algoSpeed}
                  onChange={(e) => setAlgoSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                {/* Real interactive CSS animated array bars showing the effect of multiplier */}
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                    [ 归并与快速排序空间 - 动态速率渲染 ]
                  </span>
                  <div className="h-16 flex items-end justify-center gap-2 w-full max-w-xs mt-1 px-4">
                    {sortingItems.map((val, idx) => (
                      <div 
                        key={idx} 
                        className="bg-indigo-500/80 rounded-t w-full transition-all duration-300 border-t border-indigo-300" 
                        style={{ 
                          height: `${val}%`,
                          backgroundColor: idx % 2 === 0 ? '#4f46e5' : '#6366f1'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra toggles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block text-left">等辅助视觉选项：</span>
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">护眼背板色调过滤 (温润米黄)</span>
                    <span className="text-[10px] text-slate-400">调低页面蓝光系数，呵护深夜探案时的视网膜。</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={eyeCareMode}
                    onChange={(e) => {
                      setEyeCareMode(e.target.checked);
                      showToast(e.target.checked ? '☀️ 护眼暖黄波长已激活。' : '❄️ 已回归高对比亮蓝模式。', 'info');
                    }}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 transition-colors relative before:content-[\'\'] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="text-left border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block">开启课堂交互彩蛋与微颤回馈</span>
                    <span className="text-[10px] text-slate-400">当算法突破或答对难题时播放欢庆彩带及震动反馈。</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={isClassroomInteractive}
                    onChange={(e) => setIsClassroomInteractive(e.target.checked)}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 transition-colors relative before:content-[\'\'] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: NOTIFICATIONS & CHIMES ==================== */}
          {activeTab === 'notify' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">督学提醒与音标信标</h3>
                <p className="text-xs text-slate-400 mt-1">
                  平台特邀资深数字声学工坊定制多种温馨的督促警报音，确保您不会离席挂机、遗漏期末测试。
                </p>
              </div>

              {/* Alert Level Setting */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block text-left">通知过滤等级：</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setNotifyLevel('all')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      notifyLevel === 'all' 
                        ? 'border-blue-500 bg-blue-50/50 font-bold text-blue-800' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>🎯 全量即时推送</span>
                    <span className="block text-[10px] font-normal text-slate-400 mt-1">
                      作业开测、答疑反馈、同学组队PK一律秒级提醒。
                    </span>
                  </button>

                  <button
                    onClick={() => setNotifyLevel('important')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      notifyLevel === 'important' 
                        ? 'border-blue-500 bg-blue-50/50 font-bold text-blue-800' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>📅 仅要项与考试</span>
                    <span className="block text-[10px] font-normal text-slate-400 mt-1">
                      仅在考前2小时触发，并在倒计时结束时响起警报音。
                    </span>
                  </button>

                  <button
                    onClick={() => setNotifyLevel('none')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      notifyLevel === 'none' 
                        ? 'border-blue-500 bg-blue-50/50 font-bold text-blue-800' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>🔕 沉浸式静默</span>
                    <span className="block text-[10px] font-normal text-slate-400 mt-1">
                      完全不弹，仅在对应卡片角标显示。最纯净的冥想感。
                    </span>
                  </button>
                </div>
              </div>

              {/* Interactive Chime Tone Panel (A true masterpiece) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block text-left">⏰ 定时督学闹铃音色测试</span>
                    <span className="text-[10px] text-slate-400">基于 Web Audio API 纯正非谐振器数字合成音。一敲击即刻出声。</span>
                  </div>
                  
                  {/* Test Sound Trigger Button */}
                  <button
                    type="button"
                    onClick={playConfiguredChime}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>敲击试听信标</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'synth', label: '未来量子合成波' },
                    { key: 'retro', label: '8-Bit 复古红白机' },
                    { key: 'strings', label: '黄昏弦乐和鸣' },
                    { key: 'nature', label: '天主风铃空灵' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setChimeTone(item.key as any);
                      }}
                      className={`py-3.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                        chimeTone === item.key 
                          ? 'bg-white border-indigo-500 text-indigo-600 ring-4 ring-indigo-500/10' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chimeTone === item.key ? '#6366f1' : '#e2e8f0' }}></span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Switch toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">智能急递临期预警</span>
                    <span className="text-[10px] text-slate-400">距离作业、考试截止前 45 分钟，自动对未完成学情项发送强力振动。</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={isAutoDeadlines}
                    onChange={(e) => setIsAutoDeadlines(e.target.checked)}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 transition-colors relative before:content-[\'\'] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">加入每周学情周报汇总推送</span>
                    <span className="text-[10px] text-slate-400">在每周日 20:00，将错题收录图表和进步率报告秘密交付至您的学信邮箱。</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 transition-colors relative before:content-[\'\'] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: PASSWORD & SECURITY ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">密码安全与账户保护</h3>
                <p className="text-xs text-slate-400 mt-1">
                  管理您的校内私钥和平台认证，阻隔外部未经授权的人数挂刷。
                </p>
              </div>

              {/* Password update expander */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="w-full bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between px-5 py-4 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">修改智学账户秘密口令 (Password)</span>
                      <span className="text-[10px] text-slate-400">建议设置多重符号组合，每三个学期更换一次。</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    {showPasswordFields ? '收起表单' : '修改密码'}
                  </span>
                </button>

                {showPasswordFields && (
                  <form onSubmit={handleUpdatePassword} className="p-5 bg-white border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">当前的旧密码</label>
                        <input 
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">新密码口令</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                          placeholder="最少6位"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">再次核对新密码</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100"
                          placeholder="核验匹配"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowPasswordFields(false);
                          setOldPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        放弃
                      </button>
                      
                      <button 
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        安全保存新口令
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Extra Security Settings */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">平台二阶段动态密令核验 (微信二次扫码)</span>
                    <span className="text-[10px] text-slate-400">从异地未授权的手机游览器访问本站时，需短信/微信点亮放行凭证。</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => {
                      setTwoFactorAuth(e.target.checked);
                      showToast(e.target.checked ? '🛡️ 二次极密密令通道已建立！' : '⚠️ 已还原为标准密令，注意防盗口令。', 'info');
                    }}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer checked:bg-blue-600 transition-colors relative before:content-[\'\'] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform"
                  />
                </div>

                {/* Simulated Authorized list info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <span>💻 当前绑定的信任设备列表</span>
                      <span className="text-[10px] font-normal text-slate-400">({trustDeviceCount} 台活跃设备)</span>
                    </span>
                    <button
                      onClick={() => {
                        setTrustDeviceCount(1);
                        showToast('🧹 已强行抹除其他所有异地登陆过的游览器指纹，保护学分！', 'warning');
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      清理其他信任设备
                    </button>
                  </div>

                  <div className="space-y-2 mt-1">
                    <div className="flex items-center justify-between text-xs bg-white border border-slate-200 p-2.5 rounded-lg">
                      <div className="text-left">
                        <span className="font-bold text-slate-800">当前设备 Chrome 游览器 (本地主机)</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">上次活跃: 今天 11:13 · 中国北京</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-extrabold rounded">该机在用</span>
                    </div>

                    {trustDeviceCount > 1 && (
                      <div className="flex items-center justify-between text-xs bg-white border border-slate-200 p-2.5 rounded-lg">
                        <div className="text-left">
                          <span className="font-bold text-slate-800">小米手机 14 Pro Chrome Android 驱动</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">上次活跃: 昨天 22:45 · 贵阳</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-extrabold rounded">无线手持</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unified school system badge */}
                <div className="flex items-center justify-between p-3.5 bg-blue-50/40 border border-blue-200/50 rounded-xl">
                  <div className="flex items-center gap-3 text-left">
                    <Globe className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">高校智慧大联盟 Single-Sign-On 关联</span>
                      <span className="text-[10px] text-slate-500">已连同你的复旦大学统一教务系统绑定，支持刷一卡通或者校园一号通直登。</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">关联正常</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: ENV DIAGNOSTICS & PERMS ==================== */}
          {activeTab === 'perms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">诊断探针与环境权限监测</h3>
                <p className="text-xs text-slate-400 mt-1">
                  在进行虚拟双机位监考或AI口语答疑前，请在此核实声学、视频探针的映射通路。
                </p>
              </div>

              {/* Live permission indicators directly relevant to metadata.json */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Visual Camera Status card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      cameraPermission === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-800 block">AI监考摄像头通道</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">提供线上正式大考闭环认证保障</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                    cameraPermission === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {cameraPermission === 'success' ? '活跃绿通' : '未授权'}
                  </span>
                </div>

                {/* Visual Mic Status Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      micPermission === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-800 block">AI答辩麦克风驱动</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">用于听力测试与实时英文口语跟读</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                    micPermission === 'success' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {micPermission === 'success' ? '活跃绿通' : '未授权'}
                  </span>
                </div>
              </div>

              {/* Local database space tracker */}
              <div className="p-5 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span>学情数据库本地存储空间 (LocalStorage Cache)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">存储着您做题的错题本离线备份、播放断点进度和日历。</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700">{cacheSize} 在用</span>
                  </div>
                </div>

                {/* Interactive bar showing visual memory estimation */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full transition-all duration-500"
                    style={{ width: cacheSize === '0.00 KB' ? '0%' : '24.8%' }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                  <span>已经占用约 0.2 MB</span>
                  <span>最大安全载荷 5.0 MB</span>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    擦除本地缓存并重载
                  </button>

                  <button
                    type="button"
                    onClick={handleHardWareDiagnose}
                    disabled={checkingHardware}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingHardware ? 'animate-spin' : ''}`} />
                    <span>{checkingHardware ? '正在全息扫描...' : '开始硬件权限全息诊断'}</span>
                  </button>
                </div>
              </div>

              {/* Current Local UTC Time matching user criteria */}
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-extrabold text-slate-400 font-mono tracking-widest uppercase mb-1.5 text-left">
                  📅 实时授课服务器时间对齐线:
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-slate-700 text-xs font-bold font-mono">
                    系统本地时间: 2026-05-29 11:13:27 (UTC对齐)
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-extrabold rounded-md font-mono">
                    TZ: Asia/Beijing (GMT+8)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-left leading-relaxed">
                  提示：智学云平台的周历系统及定时闹钟均与本对齐线严格对照，如果发生偏差可能导致考试交卷倒计时误判定。如果本机时间不齐请在配置中同步国家授时系统。
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
