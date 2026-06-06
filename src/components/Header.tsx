import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  Bell, 
  ChevronDown, 
  User, 
  FilePieChart, 
  LogOut, 
  Settings,
  CheckCheck,
  Sparkles,
  AlertCircle,
  BookOpen,
  Send,
  X,
  Inbox,
  Clock,
  UserCheck
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'system' | 'exam' | 'achievement' | 'course';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  linkView?: string;
}

interface MessageItem {
  id: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  time: string;
  isRead: boolean;
  linkView?: string;
}

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  setActiveView: (view: any) => void;
  currentUser?: { role: 'student' | 'teacher'; name: string } | null;
  onLogout?: () => void;
  leftContent?: React.ReactNode;
  messagesOpen?: boolean;
  setMessagesOpen?: (open: boolean) => void;
  notificationsOpen?: boolean;
  setNotificationsOpen?: (open: boolean) => void;
}

export default function Header({ 
  searchTerm = '', 
  setSearchTerm = () => {},
  onOpenNotifications,
  onOpenMessages,
  setActiveView,
  currentUser,
  onLogout,
  leftContent,
  messagesOpen: externalMessagesOpen,
  setMessagesOpen: setExternalMessagesOpen,
  notificationsOpen: externalNotificationsOpen,
  setNotificationsOpen: setExternalNotificationsOpen
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [messagesOpenInternal, setMessagesOpenInternal] = useState(false);
  const messagesOpen = externalMessagesOpen !== undefined ? externalMessagesOpen : messagesOpenInternal;
  const setMessagesOpen = setExternalMessagesOpen !== undefined ? setExternalMessagesOpen : setMessagesOpenInternal;

  const [notificationsOpenInternal, setNotificationsOpenInternal] = useState(false);
  const notificationsOpen = externalNotificationsOpen !== undefined ? externalNotificationsOpen : notificationsOpenInternal;
  const setNotificationsOpen = setExternalNotificationsOpen !== undefined ? setExternalNotificationsOpen : setNotificationsOpenInternal;

  // Filter tab state
  const [activeNotifTab, setActiveNotifTab] = useState<'all' | 'unread'>('all');
  const [activeMsgTab, setActiveMsgTab] = useState<'all' | 'unread'>('unread');

  // Multi-user dynamic mock state initialization
  const isTeacher = currentUser?.role === 'teacher';

  // 1. Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => isTeacher ? [
    {
      id: 'n_t1',
      type: 'achievement',
      title: '新作业提交提醒 📝',
      content: '《第4章 树与二叉树：二叉链表遍历算法》课后作业已有 86 名同学提交，请及时阅卷。',
      time: '12分钟前',
      isRead: false
    },
    {
      id: 'n_t2',
      type: 'exam',
      title: '高频错题自动聚类提醒 ⚠️',
      content: '2024级计算机1班 对「循环队列溢出边界判断」平均得分率仅 52%，已聚类出 3 个常见典型错题分布特点。',
      time: '1小时前',
      isRead: false
    },
    {
      id: 'n_t3',
      type: 'system',
      title: '班级诊断报告就绪 📊',
      content: '您所授课程《数据结构与算法》近一学期的班情、难点掌握及作业完成率分析报告已全量分析就绪。',
      time: '3小时前',
      isRead: false
    },
    {
      id: 'n_t4',
      type: 'course',
      title: '教研真题库更新通告 💡',
      content: '教育部最新推荐的 12 道「深度搜索与复杂回溯」高质量大自考真题已自动导入关联校本精品题库。',
      time: '昨日',
      isRead: true
    }
  ] : [
    {
      id: 'n1',
      type: 'achievement',
      title: '掌握度评级大升级！🎉',
      content: '恭喜！您的 “递归与搜索树设计” 模块掌握度已上升为 “至臻大满贯” A级！',
      time: '10分钟前',
      isRead: false,
      linkView: 'studying'
    },
    {
      id: 'n2',
      type: 'exam',
      title: '学期算法模拟考开启提醒',
      content: '《算法设计期末模拟战》已被主讲老师发布，考点覆盖动态规划与复杂回溯，请及时作答。',
      time: '1小时前',
      isRead: false,
      linkView: 'exams'
    },
    {
      id: 'n3',
      type: 'system',
      title: '智能学习和诊断诊断报告就绪',
      content: '您的5月份自适应多维诊断报告已经就绪，赶快点击个人中心生成并查看。',
      time: '3小时前',
      isRead: false,
      linkView: 'report'
    },
    {
      id: 'n4',
      type: 'course',
      title: '新干货特训课上线',
      content: '《双指针与高频哈希散列：进阶实战通关》课程已推荐并装载至你的学习大厅。',
      time: '昨日',
      isRead: true,
      linkView: 'home'
    },
    {
      id: 'n5',
      type: 'system',
      title: '错题账本自动提炼成功',
      content: '系统检测到您最近在模拟自测中答错的 3 道算法题，已自动提炼相关考点归入错题集。',
      time: '2天前',
      isRead: true,
      linkView: 'mistakes'
    }
  ]);

  // 2. Messages State
  const [messages, setMessages] = useState<MessageItem[]>(() => isTeacher ? [
    {
      id: 'mt1',
      sender: {
        name: '李明同学',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
        role: '计算机1班 学生'
      },
      content: '张老师好！我在写数据结构第3章深度优先搜索那道模板算法题的时候，编译一直报错状态越界。我刚刚把优化代码和注释传到答疑对话框了，您有时间的时候帮我点一下分析可以吗？谢谢老师！',
      time: '5分钟前',
      isRead: false
    },
    {
      id: 'mt2',
      sender: {
        name: '智能学情助理 AI',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
        role: '系统智慧导师'
      },
      content: '张教授，根据多终端采集的2024级计算机1班随堂练习数据，全班有约38%的学生在递归与回溯算法上存在困难。我已经自动为您排版布置了3道分层辅导练习题。',
      time: '25分钟前',
      isRead: false
    },
    {
      id: 'mt3',
      sender: {
        name: '王丽同学',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
        role: '数据科学1班 学生'
      },
      content: '老师，循环队列假溢出的那一节课后大作业，我对于『队头删除后队尾如何取模转换』的边界概念还不是特别清晰，我可以用伪代码画个图给您看我的思路对不对吗？',
      time: '2小时前',
      isRead: false
    },
    {
      id: 'mt4',
      sender: {
        name: '周涛同学',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        role: '软件工程1班 学生'
      },
      content: '老师，昨天的考勤由于临时感冒向辅导员请假，但今天的课后算法实操代码我已经补好了！我已经提交到对应板块，请老师有空帮我看看批阅分数，祝身体健康。',
      time: '昨日',
      isRead: true
    }
  ] : [
    {
      id: 'm1',
      sender: {
        name: '张华教授',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=82&auto=format&fit=crop&q=80',
        role: '算法总教练'
      },
      content: '李同学，你在《动态规划深度实战》中的第2个思考题答疑代码我已经阅毕，整体逻辑非常优秀，只需注意状态数组初始化边界溢出即可，继续加油！',
      time: '5分钟前',
      isRead: false
    },
    {
      id: 'm2',
      sender: {
        name: '学能 AI 智慧导师',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80',
        role: 'AI教练'
      },
      content: '检测到您近期对“树状数组和图的联通性”掌握程度产生偏差。我已经为你量身挑选了3道由浅入深的破板巩固题，准备好了随时敲我探讨。',
      time: '25分钟前',
      isRead: false
    },
    {
      id: 'm3',
      sender: {
        name: '王小博同学',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
        role: '星火打卡研习伴侣'
      },
      content: '嗨！这周的《贪心优化与区间覆盖》你卡住的第三问我推演出新公式了，要不要下午上完课找个自习室一起盘一盘代码？',
      time: '2小时前',
      isRead: false
    },
    {
      id: 'm4',
      sender: {
        name: '基础学能数据中枢',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
        role: '系统助理'
      },
      content: '您的多终端个人算法元数据与学情画卷均已一键同步完成，当前版本为全功能无锁状态，预祝取得理想绩点！',
      time: '昨日',
      isRead: true
    }
  ]);

  // Messages Chat log history
  const [chatHistories, setChatHistories] = useState<Record<string, { sender: 'them' | 'me'; text: string; time: string }[]>>(() => {
    if (isTeacher) {
      return {
        'mt1': [
          { sender: 'them', text: '张老师好！我在写数据结构第3章深度优先搜索那道模板算法题的时候，编译一直报错状态越界。我刚刚把优化代码和注释传到答疑对话框了，您有时间的时候帮我点一下分析可以吗？谢谢老师！', time: '14:20' }
        ],
        'mt2': [
          { sender: 'them', text: '张教授，根据多终端采集的2024级计算机1班随堂练习数据，全班有约38%的学生在递归与回溯算法上存在困难。我已经自动为您排版布置了3道分层辅导练习题并上传完成。建议今晚答疑课上推荐。', time: '14:00' }
        ],
        'mt3': [
          { sender: 'them', text: '老师，循环队列假溢出的那一节课后大作业，我对于『队头删除后队尾如何取模转换』的边界概念还不是特别清晰，我可以用伪代码画个图给您看我的思路对不对吗？', time: '12:30' }
        ],
        'mt4': [
          { sender: 'them', text: '老师，昨天的考勤由于临时感冒向辅导员请假，但今天的课后算法实操代码我已经补好了！我已经提交到对应板块，请老师有空帮我看看批阅分数，祝身体健康。', time: '昨日' }
        ]
      };
    }
    return {
      'm1': [
        { sender: 'them', text: '李同学，你在《动态规划深度实战》中的第2个思考题答疑代码我已经阅毕，整体逻辑非常优秀，只需注意状态数组初始化边界溢出即可，继续加油！', time: '14:20' }
      ],
      'm2': [
        { sender: 'them', text: '检测到您近期对“树状数组和图的联通性”掌握程度产生偏差。我已经为你量身挑选了3道由浅入深的破板巩固题，准备好了随时敲我探讨。', time: '14:00' }
      ],
      'm3': [
        { sender: 'them', text: '嗨！这周的《贪心优化与区间覆盖》你卡住的第三问我推演出新公式了，要不要下午上完课找个自习室一起盘一盘代码？', time: '12:30' }
      ],
      'm4': [
        { sender: 'them', text: '您的多终端个人算法元数据与学情画卷均已一键同步完成，当前版本为全功能无锁状态，预祝取得理想绩点！', time: '昨日' }
      ]
    };
  });

  // Selected chat details
  const [selectedChat, setSelectedChat] = useState<MessageItem | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTypingReply, setIsTypingReply] = useState(false);

  // Quick calculations
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  // Handlers
  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAllMessagesRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  const handleNotifClick = (item: NotificationItem) => {
    // mark as read
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    setNotificationsOpen(false);
    if (!isTeacher && item.linkView) {
      setActiveView(item.linkView);
    }
  };

  const handleMessageClick = (item: MessageItem) => {
    // mark as read
    setMessages(prev => prev.map(m => m.id === item.id ? { ...m, isRead: true } : m));
    setSelectedChat(item);
    setMessagesOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChat) return;

    const msgId = selectedChat.id;
    const newMsg = {
      sender: 'me' as const,
      text: inputText.trim(),
      time: '刚刚'
    };

    setChatHistories(prev => ({
      ...prev,
      [msgId]: [...(prev[msgId] || []), newMsg]
    }));

    // Update snippet text in main message state
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: inputText.trim(), time: '刚刚' } : m));

    setInputText('');

    // Simulated Smart Reply back for deep fidelity!
    setIsTypingReply(true);
    setTimeout(() => {
      let responseText = '收到老师的批复！我这就去仔细核准，有进展马上向您报告成果。';
      if (isTeacher) {
        if (selectedChat.id === 'mt1') {
          responseText = '非常感谢张教授！原来是循环控制里的 status 溢出了数组，我这就去本地编译器把 if (index >= size) 的代码修改并测试，稍后重新提交作业！';
        } else if (selectedChat.id === 'mt2') {
          responseText = '系统助手：辅学诊断试卷匹配分发完成。全班有 32 名存在薄弱状况的同学已被大模型推送辅导信息。';
        } else if (selectedChat.id === 'mt3') {
          responseText = '谢谢老师耐心的点拨！按照您点拨的取模计算 rear = (rear + 1) % MaxSize 环形衔接进行物理空间示意后，彻底弄懂概念了，我已经把图重新上传。';
        } else if (selectedChat.id === 'mt4') {
          responseText = '哇！太感激老师的理解了！我的二叉树中序遍历解答竟然完美全对！我会好好休息，争取后面算法考级不给老师丢脸！';
        }
      } else {
        if (selectedChat.id === 'm2') {
          responseText = '很高兴收到你的提问！自适应练习题已装载。你可以随时在“我的课程 - 答题答疑”版块开始作答，答题时你可以随时看我的核心考点分析小贴士。';
        } else if (selectedChat.id === 'm1') {
          responseText = '很好，既然你了解了溢出原因，下午你可以测试下把状态数组大小调到 1005 的效果，我明天在实验室看你的最后版本。';
        } else if (selectedChat.id === 'm3') {
          responseText = '太酷了！那我下午两点带上电脑在老图书馆三楼常坐的位置等你，咱们不见不散！';
        }
      }

      setChatHistories(prev => ({
        ...prev,
        [msgId]: [...(prev[msgId] || []), {
          sender: 'them' as const,
          text: responseText,
          time: '刚刚'
        }]
      }));

      // Update snippet
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: responseText, time: '刚刚' } : m));
      setIsTypingReply(false);
    }, 1500);
  };

  // Filtered Lists
  const filteredNotifications = notifications.filter(n => {
    if (activeNotifTab === 'unread') return !n.isRead;
    return true;
  });

  const filteredMessages = messages.filter(m => {
    if (activeMsgTab === 'unread') return !m.isRead;
    return true;
  });

  return (
    <header className={`h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 shrink-0 transition-all duration-200 ${
      (selectedChat || messagesOpen || notificationsOpen || dropdownOpen) ? 'z-[999]' : 'z-10'
    }`}>
      
      {/* Search Input Box or Custom Bredcrumbs */}
      {leftContent ? (
        <div className="flex-1 text-left">{leftContent}</div>
      ) : (
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索课程、知识点、学习资料、问答..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-full py-2 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              清除
            </button>
          )}
        </div>
      )}

      {/* Action Items */}
      <div className="flex items-center gap-6 ml-4 select-none">
        
        {/* Messages and Notifications Button Group */}
        <div id="header-notif-msg-group" className="flex items-center gap-4 text-slate-500">
          
          {/* A. Messages Popover Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsOpen(false);
                setDropdownOpen(false);
                setMessagesOpen(!messagesOpen);
              }}
              className={`relative hover:text-blue-600 transition-all p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer ${messagesOpen ? 'text-blue-600 bg-blue-50/50' : ''}`}
              title="最近消息"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {messagesOpen && (
              <>
                {/* Backdrop cover overlay */}
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMessagesOpen(false)} />
                
                {/* Float Box */}
                <div className="absolute right-0 mt-3.5 w-80 sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-sm text-slate-800">讨论与答疑回复</span>
                      {unreadMessagesCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadMessagesCount}条未读
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleMarkAllMessagesRead}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors hover:bg-white px-2 py-1 rounded-md border border-slate-200/40 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      全部已读
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 bg-slate-50 px-2 py-1">
                    <button 
                      onClick={() => setActiveMsgTab('all')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMsgTab === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      全 部
                    </button>
                    <button 
                      onClick={() => setActiveMsgTab('unread')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeMsgTab === 'unread' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      未 读
                    </button>
                  </div>

                  {/* Message Item List */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                    {filteredMessages.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                        <p className="text-slate-400 text-xs font-medium">在这个分类下没有找到消息</p>
                      </div>
                    ) : (
                      filteredMessages.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleMessageClick(item)}
                          className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer relative ${!item.isRead ? 'bg-blue-50/20' : ''}`}
                        >
                          {!item.isRead && (
                            <span className="absolute top-4 left-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          <img 
                            src={item.sender.avatar} 
                            alt={item.sender.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-xs text-slate-800">{item.sender.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                            </div>
                            <div className="text-[10.5px] font-bold text-slate-500 mb-1">
                              {item.sender.role}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium font-semibold text-slate-500">💡 点击消息即可实时开启答疑对话浮窗</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* B. Notifications Popover Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setMessagesOpen(false);
                setDropdownOpen(false);
                setNotificationsOpen(!notificationsOpen);
              }}
              className={`relative hover:text-blue-600 transition-all p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer ${notificationsOpen ? 'text-blue-600 bg-blue-50/50' : ''}`}
              title="通知中心"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10.5px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                {/* Backdrop cover overlay */}
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setNotificationsOpen(false)} />
                
                {/* Float Box */}
                <div className="absolute right-0 mt-3.5 w-80 sm:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-sm text-slate-800">系统通知与提醒</span>
                      {unreadNotifCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {unreadNotifCount}条未读
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleMarkAllNotifsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors hover:bg-white px-2 py-1 rounded-md border border-slate-200/40 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      全部已读
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 bg-slate-50 px-2 py-1">
                    <button 
                      onClick={() => setActiveNotifTab('all')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeNotifTab === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      全 部
                    </button>
                    <button 
                      onClick={() => setActiveNotifTab('unread')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeNotifTab === 'unread' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      未 读
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <Inbox className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                        <p className="text-slate-400 text-xs font-medium">暂无通知记录</p>
                      </div>
                    ) : (
                      filteredNotifications.map((item) => {
                        // Dynamic notification icon config
                        let iconEl = <AlertCircle className="w-4 h-4 text-blue-500" />;
                        let brandBg = 'bg-blue-50';

                        if (item.type === 'achievement') {
                          iconEl = <Sparkles className="w-4 h-4 text-amber-500" />;
                          brandBg = 'bg-amber-50';
                        } else if (item.type === 'exam') {
                          iconEl = <Clock className="w-4 h-4 text-red-500 animate-pulse" />;
                          brandBg = 'bg-red-50';
                        } else if (item.type === 'course') {
                          iconEl = <BookOpen className="w-4 h-4 text-emerald-500" />;
                          brandBg = 'bg-emerald-50';
                        }

                        return (
                          <div 
                            key={item.id}
                            onClick={() => handleNotifClick(item)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative text-left ${!item.isRead ? 'bg-blue-50/15' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-xl ${brandBg} flex items-center justify-center shrink-0`}>
                              {iconEl}
                            </div>
                            <div className="flex-1 min-w-0 font-semibold">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-extrabold text-xs text-slate-800 truncate">{item.title}</span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-slate-500">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold font-medium">✨ 点击通知可一键自动标为已读并查看</p>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* User Dropdown Profile Container */}
        <div className="relative">
          <div 
            onClick={() => {
              setMessagesOpen(false);
              setNotificationsOpen(false);
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 py-1.5 px-3 rounded-full transition-colors"
          >
            <img 
              src={currentUser?.role === 'teacher' 
                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVcrjdE7JlEla81XFHAQ6eBZCtorunFyenDXT4w4e6rt8CtwsjJl13fpvfWwkgNUHX0GmWVBa6bVek__dFLeAANgx3HIdtUdVlBwCQoacYdYJSfLZrmaebW_AK_U8jLnJMi9oeyrj9TaFpQITYu1wjBKLV4oEGOD7S05T3aZ7eGYVrs-RZeaRHM-GTSrX1rwGa7L80U-UZNsdDUB3gnplGmu4vc1hA82a4ioDdqiriTKjTNkH_QJNupv0UYcJOQi9ul2gGAhhubF0'
              }
              alt={currentUser?.name || (isTeacher ? '张老师' : '李同学')}
              className="w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-100 shrink-0"
            />
            <span className="font-medium text-sm text-slate-700 whitespace-nowrap">
              {currentUser?.name || (isTeacher ? '张老师' : '李同学')}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </div>

          {dropdownOpen && (
            <>
              {/* Backing Backdrop to dismiss */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                <div className="px-4 py-2 border-b border-slate-100 text-left">
                  <p className="text-xs text-slate-400">当前账号 ({isTeacher ? '教职员工' : '普通学生'})</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {currentUser?.name || (isTeacher ? '张老师' : '李同学')}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {isTeacher ? 'teacher_pro@school.edu.cn' : 'student_active@school.edu.cn'}
                  </p>
                </div>
                
                {!isTeacher && (
                  <>
                    <button 
                      onClick={() => { setDropdownOpen(false); setActiveView('profile'); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>个人信息管理</span>
                    </button>

                    <button 
                      onClick={() => { setDropdownOpen(false); setActiveView('report'); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FilePieChart className="w-4 h-4 text-slate-400" />
                      <span>学习报告</span>
                    </button>

                    <button 
                      onClick={() => { setDropdownOpen(false); setActiveView('settings'); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>账号设置</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>
                  </>
                )}

                <button 
                  onClick={() => { setDropdownOpen(false); if (onLogout) { onLogout(); } }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出/切换账号</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Chat Dialogue & Question Resolution Modal (Stunning, high-end design overlay) */}
      {selectedChat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl h-[620px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedChat.sender.avatar} 
                  alt={selectedChat.sender.name}
                  className="w-10 h-10 rounded-full border border-white/20 object-cover"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {selectedChat.sender.name}
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      {selectedChat.sender.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>在线实时连线中</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
              <div className="text-center">
                <span className="text-[10px] bg-slate-200/60 text-slate-500 px-3 py-1 rounded-full font-bold">
                  与 {selectedChat.sender.name} 的消息互动对话历史
                </span>
              </div>

              {(chatHistories[selectedChat.id] || []).map((chat, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start gap-2.5 ${chat.sender === 'me' ? 'flex-row-reverse' : ''}`}
                >
                  {chat.sender === 'them' ? (
                    <img 
                      src={selectedChat.sender.avatar} 
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      我
                    </div>
                  )}

                  <div className={`max-w-[75%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed text-left shadow-3xs ${
                    chat.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p>{chat.text}</p>
                    <span className={`block text-[9px] mt-1.5 text-right ${chat.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {chat.time}
                    </span>
                  </div>
                </div>
              ))}

              {isTypingReply && (
                <div className="flex items-start gap-2.5">
                  <img 
                    src={selectedChat.sender.avatar} 
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div className="bg-slate-200 text-slate-500 rounded-2xl rounded-tl-none p-3.5 text-xs font-bold leading-relaxed shadow-3xs flex items-center gap-1.5 animate-pulse text-left">
                    <span>对方正在输入回复</span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-225" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Input Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isTypingReply}
                placeholder={`向 ${selectedChat.sender.name} 发送回复或进行答疑和辅导指导...`}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-slate-400 font-semibold"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTypingReply}
                className="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-1.5 hover:shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
