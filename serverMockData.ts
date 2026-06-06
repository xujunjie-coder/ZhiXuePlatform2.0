// Backend mock data for student portal

export const COURSE_COVERS = {
  ml: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60',
  math: 'https://images.unsplash.com/photo-1543167121-5a9e99a89d18?w=500&auto=format&fit=crop&q=60',
  ds: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60',
  py: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
  algebra: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
  prob: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60',
  deep: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60',
  os: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60'
};

export const COURSES = [
  { id: '1', title: '机器学习基础', teacher: '张教授', university: '北京大学', progress: 65, coverUrl: COURSE_COVERS.ml, status: 'studying', category: '人工智能' },
  { id: '2', title: '高等数学（上）', teacher: '王讲师', university: '清华大学', progress: 42, coverUrl: COURSE_COVERS.math, status: 'studying', category: '数学' },
  { id: '3', title: '数据结构与算法', teacher: '李讲师', university: '浙江大学', progress: 15, coverUrl: COURSE_COVERS.ds, status: 'studying', category: '计算机科学' },
  { id: '4', title: 'Python 程序设计', teacher: '赵教授', university: '复旦大学', progress: 78, coverUrl: COURSE_COVERS.py, status: 'studying', category: '数据科学' },
  { id: '5', title: '线性代数', teacher: '刘教授', university: '上海交通大学', progress: 0, coverUrl: COURSE_COVERS.algebra, status: 'not-started', category: '数学' },
  { id: '6', title: '概率论与数理统计', teacher: '陈讲师', university: '中国科学技术大学', progress: 100, coverUrl: COURSE_COVERS.prob, status: 'completed', category: '数学' },
  { id: '7', title: '深度学习入门实战', teacher: '高教授', university: '北京邮电大学', progress: 0, coverUrl: COURSE_COVERS.deep, status: 'not-started', category: '人工智能' },
  { id: '8', title: '操作系统原理', teacher: '周讲师', university: '南京大学', progress: 0, coverUrl: COURSE_COVERS.os, status: 'not-started', category: '计算机科学' }
];

export const EXAMS = [
  { id: 'e1', title: '《机器学习基础》第三章知识点测验', course: '机器学习基础', time: '2026-05-20 19:00', duration: 90, score: 100, questionType: '单选 + 多选', status: 'active', coverUrl: COURSE_COVERS.ml },
  { id: 'e2', title: '《大学物理》期中知识强化测试', course: '大学物理', time: '2026-05-22 14:00', duration: 120, score: 100, questionType: '客观填空 + 大解析', status: 'waiting', coverUrl: COURSE_COVERS.math },
  { id: 'e3', title: '《数据结构与算法》链表综合强化作业', course: '数据结构与算法', time: '2026-05-18 10:00', duration: 60, score: 100, questionType: '选择题 + 代码填空', status: 'finished', myScore: 92, ranking: '8 / 115', coverUrl: COURSE_COVERS.ds },
  { id: 'e4', title: '《高等数学（上）》第二章导数与微分阶段测验', course: '高等数学（上）', time: '2026-05-15 09:00', duration: 90, score: 100, questionType: '单选题 + 计算大题', status: 'finished', myScore: 86, ranking: '12 / 98', coverUrl: COURSE_COVERS.algebra }
];

export const TODO_TASKS = [
  { id: '1', type: '作业', title: '《高等数学》第6章 课后作业', deadline: '截止：2026-05-25 23:59', status: '待完成', badgeStyle: 'bg-red-50 text-red-500 border border-red-100', reminderTime: '' },
  { id: '2', type: '考试', title: '《大学物理》期中考试', deadline: '截止：2026-05-26 19:00', status: '待完成', badgeStyle: 'bg-orange-50 text-orange-500 border border-orange-100', reminderTime: '' },
  { id: '3', type: '学习', title: '《数据结构》第4章 核心算法学习', deadline: '截止：2026-05-27 23:59', status: '进行中', badgeStyle: 'bg-blue-50 text-blue-500 border border-blue-100', reminderTime: '' }
];

export const CUSTOM_SCHEDULES = [
  { id: 'cs-1', title: '《深度学习》文献导读汇报研讨', time: '14:30', isSystem: false },
  { id: 'cs-2', title: '计算机体系结构大作业交接', time: '19:00', isSystem: false }
];

export const SPACE_COURSES = [
  {
    id: 'ds',
    title: '数据结构与算法 (2024春)',
    completedChapters: '23/29',
    todoCount: 6,
    progress: 78,
    status: 'studying',
    hours: 48.6,
    chapters: [
      { id: 'ch1', title: '第1章 绪论', status: 'completed' },
      { id: 'ch2', title: '第2章 线性表', status: 'completed' },
      { 
        id: 'ch3', 
        title: '第3章 栈与队列', 
        status: 'completed',
        subItems: [
          { id: 'ch3_1', title: '3.1 栈的定义与基本操作', status: 'completed' },
          { id: 'ch3_2', title: '3.2 栈的应用', status: 'studying', progress: 65 },
          { id: 'ch3_3', title: '3.3 队列的定义与基本操作', status: 'not-started' },
          { id: 'ch3_4', title: '3.4 队列的应用', status: 'not-started' }
        ]
      },
      { id: 'ch4', title: '第4章 串', status: 'not-started' },
      { id: 'ch5', title: '第5章 树与二叉树', status: 'not-started' }
    ],
    tasksTable: [
      { type: '作业', total: 6, completed: 4, uncompleted: 2, rate: '66.7%' },
      { type: '随堂测试', total: 8, completed: 6, uncompleted: 2, rate: '75.0%' },
      { type: '考试', total: 3, completed: 2, uncompleted: 1, rate: '66.7%' }
    ],
    mastery: { overall: 78, mastered: 16, weak: 7, unlearned: 7 },
    trend: {
      myProgress: [12, 18, 28, 38, 48, 58, 68, 78],
      classAvg: [20, 28, 36, 45, 54, 63, 72, 88]
    }
  },
  {
    id: 'os',
    title: '操作系统原理',
    completedChapters: '14/25',
    todoCount: 11,
    progress: 56,
    status: 'behind',
    hours: 32.4,
    chapters: [
      { id: 'os_ch1', title: '第1章 操作系统引论', status: 'completed' },
      { 
        id: 'os_ch2', 
        title: '第2章 进程的管理 (含生命周期与调度)', 
        status: 'studying',
        subItems: [
          { id: 'os_ch2_1', title: '2.1 进程与线程的概念', status: 'completed' },
          { id: 'os_ch2_2', title: '2.2 进程控制与状态转换', status: 'studying', progress: 50 },
          { id: 'os_ch2_3', title: '2.3 经典进程同步问题 (生产者消费者)', status: 'not-started' }
        ]
      },
      { id: 'os_ch3', title: '第3章 处理机调度与死锁机制', status: 'not-started' },
      { id: 'os_ch4', title: '第4章 存储器与虚拟内存 design', status: 'not-started' }
    ],
    tasksTable: [
      { type: '作业', total: 8, completed: 3, uncompleted: 5, rate: '37.5%' },
      { type: '随堂测试', total: 10, completed: 5, uncompleted: 5, rate: '50.0%' },
      { type: '考试', total: 4, completed: 2, uncompleted: 2, rate: '50.0%' }
    ],
    mastery: { overall: 56, mastered: 9, weak: 12, unlearned: 4 },
    trend: {
      myProgress: [10, 15, 22, 30, 38, 44, 50, 56],
      classAvg: [15, 25, 35, 45, 55, 65, 73, 79]
    }
  },
  {
    id: 'net',
    title: '计算机网络',
    completedChapters: '9/21',
    todoCount: 9,
    progress: 42,
    status: 'behind',
    hours: 25.0,
    chapters: [
      { id: 'net_ch1', title: '第1章 计算机网络体系结构', status: 'completed' },
      { id: 'net_ch2', title: '第2.章 物理层细节传输', status: 'completed' },
      { 
        id: 'net_ch3', 
        title: '第3章 数据链路层机制', 
        status: 'studying',
        subItems: [
          { id: 'net_ch3_1', title: '3.1 差错控制与循环冗余校验码', status: 'completed' },
          { id: 'net_ch3_2', title: '3.2 滑动窗口协议与可靠传输', status: 'studying', progress: 20 },
          { id: 'net_ch3_3', title: '3.3 介质访问控制以太网机制', status: 'not-started' }
        ]
      }
    ],
    tasksTable: [
      { type: '作业', total: 10, completed: 4, uncompleted: 6, rate: '40.0%' },
      { type: '随堂测试', total: 6, completed: 2, uncompleted: 4, rate: '33.3%' },
      { type: '考试', total: 2, completed: 1, uncompleted: 1, rate: '50.0%' }
    ],
    mastery: { overall: 42, mastered: 6, weak: 8, unlearned: 11 },
    trend: {
      myProgress: [5, 10, 15, 22, 30, 30, 36, 42],
      classAvg: [12, 22, 32, 42, 52, 62, 70, 78]
    }
  },
  {
    id: 'db',
    title: '数据库系统原理',
    completedChapters: '18/20',
    todoCount: 2,
    progress: 90,
    status: 'studying',
    hours: 41.2,
    chapters: [
      { id: 'db_ch1', title: '第1章 数据库系统概述', status: 'completed' },
      { id: 'db_ch2', title: '第2章 关系模型与完整性', status: 'completed' },
      { id: 'db_ch3', title: '第3章 SQL高级复杂查询', status: 'completed' },
      { 
        id: 'db_ch4', 
        title: '第4章 并发控制与恢复机制', 
        status: 'studying',
        subItems: [
          { id: 'db_ch4_1', title: '4.1 并发调度可串行性标准', status: 'completed' },
          { id: 'db_ch4_2', title: '4.2 两段锁协议(2PL)死锁解决', status: 'studying', progress: 80 }
        ]
      }
    ],
    tasksTable: [
      { type: '作业', total: 5, completed: 4, uncompleted: 1, rate: '80.0%' },
      { type: '随堂测试', total: 10, completed: 9, uncompleted: 1, rate: '90.0%' },
      { type: '考试', total: 1, completed: 1, uncompleted: 0, rate: '100%' }
    ],
    mastery: { overall: 90, mastered: 15, weak: 4, unlearned: 1 },
    trend: {
      myProgress: [20, 35, 50, 65, 75, 82, 88, 90],
      classAvg: [18, 30, 42, 55, 68, 78, 82, 87]
    }
  },
  {
    id: 'ai',
    title: '人工智能导论',
    completedChapters: '6/20',
    todoCount: 12,
    progress: 30,
    status: 'behind',
    hours: 19.5,
    chapters: [
      { id: 'ai_ch1', title: '第1章 人工智能概述与简史', status: 'completed' },
      { 
        id: 'ai_ch2', 
        title: '第2章 命题逻辑推理表达', 
        status: 'studying',
        subItems: [
          { id: 'ai_ch2_1', title: '2.1 谓词公式与范式化', status: 'completed' },
          { id: 'ai_ch2_2', title: '2.2 解析法与归结原理机制', status: 'studying', progress: 10 }
        ]
      }
    ],
    tasksTable: [
      { type: '作业', total: 12, completed: 3, uncompleted: 9, rate: '25.0%' },
      { type: '随堂测试', total: 15, completed: 4, uncompleted: 11, rate: '26.7%' },
      { type: '考试', total: 3, completed: 1, uncompleted: 2, rate: '33.3%' }
    ],
    mastery: { overall: 30, mastered: 4, weak: 9, unlearned: 7 },
    trend: {
      myProgress: [5, 8, 12, 16, 20, 24, 28, 30],
      classAvg: [15, 25, 35, 45, 55, 62, 70, 76]
    }
  },
  {
    id: 'math',
    title: '高等数学 (下)',
    completedChapters: '24/24',
    todoCount: 0,
    progress: 100,
    status: 'completed',
    hours: 49.3,
    chapters: [
      { id: 'math_ch1', title: '第1.章 空间解析几何与向量代数', status: 'completed' },
      { id: 'math_ch2', title: '第2.章 多元函数微分学及其应用', status: 'completed' },
      { id: 'math_ch3', title: '第3.章 重积分与三重曲线积分', status: 'completed' }
    ],
    tasksTable: [
      { type: '作业', total: 12, completed: 12, uncompleted: 0, rate: '100%' },
      { type: '随堂测试', total: 15, completed: 15, uncompleted: 0, rate: '100%' },
      { type: '考试', total: 3, completed: 3, uncompleted: 0, rate: '100%' }
    ],
    mastery: { overall: 98, mastered: 24, weak: 0, unlearned: 0 },
    trend: {
      myProgress: [30, 45, 60, 75, 90, 100, 100, 100],
      classAvg: [25, 38, 52, 65, 78, 88, 94, 98]
    }
  }
];

export const INITIAL_MOCK_TASKS = [
  { id: 't1', course: '数据结构与算法', type: '作业', title: '双向链表边界节点插入删除算法设计设计', deadline: '2026-05-30', status: 'pending' },
  { id: 't2', course: '数据结构与算法', type: '随堂测试', title: '双栈实现队列空间复杂度估算随堂考', deadline: '2026-05-28', status: 'pending' },
  { id: 't3', course: '操作系统原理', type: '作业', title: '经典的哲学家进餐免死锁分配代码探究', deadline: '2026-05-28', status: 'pending' },
  { id: 't4', course: '计算机网络', type: '作业', title: '根据给定IP段与子网掩码划分4个等大规模子网', deadline: '2026-05-29', status: 'pending' },
  { id: 't5', course: '数据库系统原理', type: '随堂测试', title: '第三范式(3NF)判定与候选隔离键测试', deadline: '2026-06-02', status: 'pending' },
  { id: 't6', course: '人工智能导论', type: '作业', title: '归结反演推导过程中的合一算法变量代换设计', deadline: '2026-06-05', status: 'pending' }
];

export const MOCK_RESOURCES = [
  { id: 'r1', group: '课程资料', name: '数据结构与算法精讲笔记（含重点复习大纲）.pdf', size: '4.2 MB', count: '1.2k 阅读' },
  { id: 'r2', group: '课程资料', name: '现代操作系统精要（第五章虚拟存储技术重点）.epub', size: '12 MB', count: '890次使用' },
  { id: 'r3', group: '高级笔记', name: '利用递归树法求解归并排序复杂度的手写草稿.pdf', size: '890 KB', count: '235 收藏' },
  { id: 'r4', group: '真题分析', name: '数据库系统应用题：关系代数基本操作与连接推导.pdf', size: '1.5 MB', count: '102次下载' }
];

export const INITIAL_HISTORY_LOGS = [
  {
    id: 'h1',
    dateGroup: '今天',
    dateStr: '2024-12-20',
    time: '10:30',
    type: '课程学习',
    course: '数据结构与算法 (2024春)',
    title: '数据结构与算法 — 第5章 栈与队列',
    subtitle: '5.2 栈的应用',
    metricLabel: '时长',
    metricVal: '32',
    metricUnit: '分钟',
    status: '已完成',
    details: {
      completionVal: '32 分钟 / 32 分钟',
      percentage: 100,
      outcomes: {
        duration: '32 分钟',
        status: '已完成',
        influence: '+12%',
        relatedQuiz: '第5章 随堂测验 (得分 80 分)',
        summary: '本节课学习了栈在表达式求值、括号匹配、递归调用等场景中的应用，理解了栈的“后进先出”特性在实际问题中的价值。'
      },
      metrics: {
        watchProgress: '100%',
        playbackSpeed: '1.25x',
        pausedCount: 2,
        notesTaken: 3
      }
    }
  },
  {
    id: 'h2',
    dateGroup: '今天',
    dateStr: '2024-12-20',
    time: '09:15',
    type: '作业提交',
    course: '数据结构与算法 (2024春)',
    title: '栈与队列练习题（第5章）',
    subtitle: '共 5 题，正确 4 题',
    metricLabel: '得分',
    metricVal: '80',
    metricUnit: '分',
    status: '已完成',
    details: {
      completionVal: '5 题已完成 1 题错误',
      percentage: 80,
      outcomes: {
        duration: '25 分钟',
        status: '已提交并通过',
        influence: '+15%',
        relatedQuiz: '栈的应用平时成绩考核',
        summary: '系统性练习了顺序栈的双端增长问题。在对链栈第3题析构操作时的多指针交替逻辑遗留了一处NullPointerException隐患导致解答错误，已录入错题数据库。'
      },
      metrics: {
        watchProgress: '无需视频',
        playbackSpeed: '无',
        pausedCount: 0,
        notesTaken: 1
      }
    }
  },
  {
    id: 'h3',
    dateGroup: '今天',
    dateStr: '2024-12-20',
    time: '08:40',
    type: 'AI 辅导',
    course: '数据结构与算法 (2024春)',
    title: '关于栈的出栈顺序疑问',
    subtitle: 'AI 助教回答 3 条',
    metricLabel: '时长',
    metricVal: '12',
    metricUnit: '分钟',
    status: '已完成',
    details: {
      completionVal: '3回合交谈已结案',
      percentage: 100,
      outcomes: {
        duration: '12 分钟',
        status: '已搞懂',
        influence: '+8%',
        relatedQuiz: '卡特兰数证明与应用例题',
        summary: '深度询问了序列入栈时出栈排列合法性的计算。AI助教详细拆卸了求排列可能性的公式 Catalan Number h(n) = C(2n, n)/(n+1) 的构造细节，令人茅塞顿开。'
      },
      metrics: {
        watchProgress: '交互问答',
        playbackSpeed: '即时响应',
        pausedCount: 0,
        notesTaken: 2
      }
    }
  },
  {
    id: 'h4',
    dateGroup: '昨天',
    dateStr: '2024-12-19',
    time: '21:20',
    type: '测验',
    course: '数据结构与算法 (2024春)',
    title: '第5章 随堂测验',
    subtitle: '共 10 题, 正确 8 题',
    metricLabel: '得分',
    metricVal: '80',
    metricUnit: '分',
    status: '已完成',
    details: {
      completionVal: '8 / 10 题正确',
      percentage: 80,
      outcomes: {
        duration: '45 分钟',
        status: '已归档批改',
        influence: '+18%',
        relatedQuiz: '章节结课考核',
        summary: '综合自测了双栈共享同一段内存地址时的空间复杂度、队列循环实现时防虚假饱和标志寄存器设计。错题主要发生在队头出队 and 二叉树空间映射关系上。'
      },
      metrics: {
        watchProgress: '考完自动归宿',
        playbackSpeed: '正常时速',
        pausedCount: 1,
        notesTaken: 0
      }
    }
  },
  {
    id: 'h5',
    dateGroup: '昨天',
    dateStr: '2024-12-19',
    time: '20:10',
    type: '课件浏览',
    course: '操作系统原理',
    title: '栈与队列 PPT（完整版）',
    subtitle: '浏览进度 75%',
    metricLabel: '时长',
    metricVal: '18',
    metricUnit: '分钟',
    status: '已完成',
    details: {
      completionVal: '阅读至第 32 页',
      percentage: 75,
      outcomes: {
        duration: '18 分钟',
        status: '继续读看',
        influence: '+5%',
        relatedQuiz: '系统内核空间 and 用户空间栈屏障',
        summary: '深度研习了中继中断响应（Interrupt ISR）时对物理寄存器保存到核心栈（Kernel Stack）的保护套。掌握了硬件保护现场的寄存器压栈优先顺序。'
      },
      metrics: {
        watchProgress: '75%',
        playbackSpeed: '手动翻页',
        pausedCount: 4,
        notesTaken: 5
      }
    }
  },
  {
    id: 'h6',
    dateGroup: '昨天',
    dateStr: '2024-12-19',
    time: '19:00',
    type: '课堂互动',
    course: '数据结构与算法 (2024春)',
    title: '数据结构与算法 12.19 课堂互动',
    subtitle: '签到 + 随堂测验',
    metricLabel: '参与',
    metricVal: '2',
    metricUnit: '项',
    status: '已完成',
    details: {
      completionVal: '签到成功 + 提问打卡',
      percentage: 100,
      outcomes: {
        duration: '10 分钟',
        status: '已出勤',
        influence: '+6%',
        relatedQuiz: '平时课程参与率考核',
        summary: '课前完成了蓝牙定位打卡，当堂由老师提出关于递归栈深度上界估值问题，本人使用全黑盒近似快速应答正确，赢得了老师的小红星表彰。'
      },
      metrics: {
        watchProgress: '地理定位',
        playbackSpeed: '常速',
        pausedCount: 0,
        notesTaken: 0
      }
    }
  },
  {
    id: 'h7',
    dateGroup: '12-18 星期三',
    dateStr: '2024-12-18',
    time: '22:30',
    type: '课程学习',
    course: '数据结构与算法 (2024春)',
    title: '数据结构与算法 — 第4章 线性表',
    subtitle: '4.3 链表的实现',
    metricLabel: '时长',
    metricVal: '28',
    metricUnit: '分钟',
    status: '已完成',
    details: {
      completionVal: '28 分钟 / 30 分钟',
      percentage: 93,
      outcomes: {
        duration: '28 分钟',
        status: '观看完毕',
        influence: '+10%',
        relatedQuiz: '单双链表节点挂载与解构',
        summary: '精研了头指针和首元节点（First Node）的关系，引入虚拟节点 Dummy Node 以精简单链表首尾插入操作时的空指针条件处理。'
      },
      metrics: {
        watchProgress: '93%',
        playbackSpeed: '1.5x',
        pausedCount: 1,
        notesTaken: 4
      }
    }
  },
  {
    id: 'h8',
    dateGroup: '12-18 星期三',
    dateStr: '2024-12-18',
    time: '20:45',
    type: '作业提交',
    course: '计算机网络',
    title: '线性表课后作业',
    subtitle: '共 4 题，正确 3 题',
    metricLabel: '得分',
    metricVal: '75',
    metricUnit: '分',
    status: '已完成',
    details: {
      completionVal: '4 题全部完成提交',
      percentage: 75,
      outcomes: {
        duration: '40 分钟',
        status: '已评分批改',
        influence: '+8%',
        relatedQuiz: '信道通信编码校验理论基础',
        summary: '本次提交考察了计算机网络中涉及信道调制 and 多路复用的前驱数学方法。失误部分在于将全双工信道中载波碰撞检测的最大帧重传延迟和以太网退避轮次相剥离。'
      },
      metrics: {
        watchProgress: '非视频类',
        playbackSpeed: '无',
        pausedCount: 0,
        notesTaken: 1
      }
    }
  }
];

export const RECOMMENDATIONS = [
  { id: 'rec-1', name: '深度学习入门实战', school: '北京大学 · 计算机学院', learners: '1.2万人学习', score: '4.8', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFQaSKFQNyWsJTAyc-1rIiyM0pb_HZSz3yJNnf9MpuQlnvnflMn15lAJk7K2PWaCWdb4iS9EmRCW7Wfoj8WglLl4Ci2UJMRA66Hnujlu30HSO9OVieIjiiQ__dhWp7MDzCaW7evsKS1DklzdGXkRExv436FXLTOqwVOvEMdcng6g1ckTRNjoc1nWdPZHc-zdN1EnGsRmVAVSAiySFYhruwT2X9w0Rq7a7PgF2g0h6UKmkFjve0kLfxQV3o_5IcOYB4Cxoz-c25otg' },
  { id: 'rec-2', name: '概率论与数理统计', school: '清华大学 · 数学系', learners: '8560人学习', score: '4.7', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiV6fEJTW-e0qA5me7FsHRSl34qlsfrBnvc38aNrFYPGvkU8hEt-WE2UAVdtYzoL8mOWy9JrtZsOgwBU56P75NaZb_FZyBPFE4gIMSGKeESfKfF7AaYsgRKt14VhHfc0oiiEsDX6va2yCV20IufsY0Xff3q_FwnAlCeuXM_ZYM7xh-Y1_4DVHxoxnn1wWeYATdtkBPNQU4a851j-O8u2An1ZyTU7ui4847EtVVqlkg3h8T-0tLKu6ynCeKQyjXcBJ1vueIGO0DyUQ' }
];

export const FOLDERS = [
  { name: '专业基础课', count: 12 },
  { name: '数据科学方向', count: 8 },
  { name: '考研课程', count: 6 },
  { name: '兴趣拓展', count: 4 }
];

export const SYLLABUS = [
  { id: '1-1', title: '1.1 什么是机器学习', type: 'text', completed: true },
  { id: '1-2', title: '1.2 机器学习工作流架构', type: 'video', completed: true },
  { id: '1-3', title: '1.3 评估指标: MSE 与 MAE', type: 'interactive', completed: false, active: true },
  { id: '1-4', title: '1.4 局部最优与梯度下降原理', type: 'interactive', completed: false },
  { id: '2-1', title: '2.1 经典单元线性回归', type: 'video', completed: false },
  { id: '2-2', title: '2.2 逻辑二分类概率推导', type: 'text', completed: false }
];

// Teacher datasets
export const TEACHER_TODO_TASKS = [
  { id: "t1", type: "作业", title: "待批改作业", desc: "本周尚有 46 份全学科大纲作业待批", count: 46 },
  { id: "t2", type: "提问", title: "待回复提问", desc: "有 18 条热点问答等待大模型微调审核", count: 18 }
];

export const STUDENT_ANSWERS_LIST = [
  { id: "sa1", student: "李沐雨", score: 85, finished: false, answer: "通过双指针法。定义两个指针 prev 和 curr。在循环中 curr.next = prev，然后 prev = curr, curr = next。这样可以在遍历一次链表的过程中把所有的 next 修改。额外空间复杂度为 O(1)，时间复杂度为 O(n)。对于由于指针覆盖带来的问题，要在头节点切断前保留引用指针。" },
  { id: "sa2", student: "马化云", score: 75, finished: false, answer: "可以用栈来实现。把链表里所有节点都 push 进一个栈里，然后再依次 pop 出来。Pop 出来的顺序就是逆序了，然后把他们连接起来，最后把最后一个节点 next设为 null 即可。时间复杂度 O(n)，空间复杂度 O(n)。" },
  { id: "sa3", student: "赵启平", score: 80, finished: false, answer: "使用递归。递归反转后半部分，再拼接。代码写法是：ListNode p = reverse(head.next); head.next.next = head; head.next = null; return p; 这种递归算法的时间复杂度为 O(n)，但这因为系统递归栈的深层开销，空间复杂度依然为 O(n)。" }
];

export const STUDENT_ASKS_LIST = [
  { id: "sq1", student: "戴小明", status: "unanswered", q: "老师，动态规划和分治算法的本质差别在哪里？为什么动态规划在计算有重叠子问题时比分治快那么多？", aiGeneratedReply: "动态规划的核心在于『消除重叠子问题』。分治算法（如归向、快排）是将问题划分为相互独立的子空间分别求解。而对有大量因相同参数重复调用的子问题时，动态规划通过『备忘录（Memoization）』或『递推表（DP Table）』存储已求出的解。当你第二次需要该子问题的解时，只需以 O(1) 复杂度直接读取即可，避免了原始分治带来的指数级重复计算。这种空间换时间的技术手段在大纲中属于高频考点。" },
  { id: "sq2", student: "胡立新", status: "unanswered", q: "双向循环链表相比单链表除了可以双向遍历，在做节点插入删除时是不是也更安全、不易出错？为什么？", aiGeneratedReply: "双向循环链表的最大优势的确是插入和删除不需要像单链表那样额外维护前驱节点。在单链表中，如果要删除节点 p，你必须从 head 开始遍历定位到 p 的前驱 prev，然后 prev.next = p.next，这一步耗费 O(n)。如果直接给你前驱 prev 的引用，可以以 O(1) 完成，但删除时若没有 prev 就比较尴尬。而在双向循环链表中，由于每个节点都维护了.prior和.next指针，只需 p.prior.next = p.next 以及 p.next.prior = p.prior 即可。并且，由于其独特的循环闭环结构，通常不包含 NULL 临界点悬挂，防崩溃性更强。" },
  { id: "sq3", student: "沈星", status: "unanswered", q: "老师，为什么说平衡二叉树（AVL）和红黑树（RBT）可以用旋转解决查找的最坏时间复杂度？", aiGeneratedReply: "在普通二叉树中，如果插入数据是有序的（例如1,2,3,4,5），树会退化成一个单链表，导致查找效率降到最差的 O(n)。而平衡二叉树和红黑树强制维护了『高度平衡约束』。当某个节点的左右子树高度差超过阀值，系统会通过『单旋转/双旋转（左旋或右旋）』，重新压低树层级高度，从而将最坏情况下的查找存取复杂度，严格控制在 O(log n)。旋转本质上是在满足『左小右大』性质的规则下，通过指针修改实现的最优雅局域树高调整。" }
];

export const REPORT_AI_SUGGESTIONS = [
  { id: 1, type: '教学重点关注', text: '线性表、栈与队列、树与二叉树掌握度较低，建议下周教学中增加例题讲解和课堂练习时间。', color: 'blue' },
  { id: 2, type: '学情改进建议', text: '有 38%的学生在递归与回溯算法上存在困难，建议布置针对性练习并提供分层辅导。', color: 'green' }
];

export const HOMEWORK_LIST = [
  {
    id: 'h_ds3',
    title: '数据结构 章节作业3',
    course: '数据结构与算法',
    chapter: '第三章 栈与队列',
    classes: '2024级计算机1班, 2024级软件工程',
    deadline: '2024-05-25 23:59',
    publishTime: '2024-05-18 10:00',
    submittedCount: 86,
    totalCount: 100,
    status: '进行中',
    avgScore: 78.6,
    highestScore: 98,
    lowestScore: 32,
    questionCount: 6
  }
];

export const RESOURCE_TAGS = [
  { name: '重点', color: 'bg-red-50 text-red-600 border border-red-100', dot: 'bg-red-400', count: 156 },
  { name: '难点', color: 'bg-orange-50 text-orange-600 border border-orange-100', dot: 'bg-orange-400', count: 203 },
  { name: '案例', color: 'bg-green-50 text-green-600 border border-green-100', dot: 'bg-green-400', count: 189 },
  { name: '实验', color: 'bg-blue-50 text-blue-600 border border-blue-100', dot: 'bg-blue-400', count: 145 },
  { name: '习题', color: 'bg-purple-50 text-purple-600 border border-purple-100', dot: 'bg-purple-400', count: 312 },
  { name: '期中复习', color: 'bg-yellow-50 text-yellow-600 border border-yellow-100', dot: 'bg-yellow-400', count: 89 },
  { name: '期末复习', color: 'bg-pink-50 text-pink-600 border border-pink-100', dot: 'bg-pink-400', count: 67 },
  { name: '扩展阅读', color: 'bg-teal-50 text-teal-600 border border-teal-100', dot: 'bg-teal-400', count: 78 }
];

export const RESOURCE_COURSES = [
  { name: 'Java程序设计', count: 482, chapters: [
    { name: '第一章 Java语言基础', count: 68 },
    { name: '第二章 数据类型与运算符', count: 52 },
    { name: '第三章 程序流程控制', count: 45 },
    { name: '第四章 数组', count: 38 },
    { name: '第五章 方法', count: 42 },
    { name: '第六章 面向对象基础', count: 56 },
    { name: '第七章 继承与多态', count: 48 },
    { name: '第八章 异常处理', count: 39 },
    { name: '第九章 集合框架', count: 46 },
    { name: '第十章 I/O流', count: 48 }
  ]},
  { name: '数据结构', count: 328, chapters: [
    { name: '第一章 线性表', count: 98 },
    { name: '第二章 栈和队列', count: 75 }
  ]}
];

export const RESOURCES = [
  {
    id: 'res1',
    name: 'Java语言基础_教材.pdf',
    desc: 'Java程序设计基础教材 第一章',
    type: '教材',
    typeBadgeColor: 'bg-green-50 text-green-700 border border-green-200',
    chapter: '第一章 Java语言基础',
    course: 'Java程序设计',
    tags: ['重点', '教材'],
    size: '12.5 MB',
    time: '2024-05-18 14:30',
    fileType: 'pdf'
  }
];

export const CLASSES_LIST = [
  { id: 'c1', name: '2024级计算机1班', count: 46, college: '计算机学院' },
  { id: 'c2', name: '2024级计算机2班', count: 42, college: '计算机学院' },
  { id: 'c3', name: '2024级软件工程1班', count: 40, college: '软件学院' },
  { id: 'c4', name: '2024级软件工程2班', count: 38, college: '软件学院' },
  { id: 'c5', name: '2024级数据科学1班', count: 40, college: '大数据学院' },
  { id: 'c6', name: '2024级人工智能1班', count: 40, college: '人工智能学院' },
  { id: 'c7', name: '2023级计算机1班', count: 40, college: '计算机学院' },
  { id: 'c8', name: '2023级计算机2班', count: 40, college: '计算机学院' }
];

export const STUDENTS_LIST = [
  { id: 's1', classId: 'c1', name: '李明', studentId: '2024001', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', studyHours: 38.6, mastery: 85, completion: 92, status: '活跃', grade: '良好' },
  { id: 's2', classId: 'c1', name: '王晓梅', studentId: '2024002', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', studyHours: 32.1, mastery: 78, completion: 88, status: '活跃', grade: '良好' },
  { id: 's3', classId: 'c1', name: '张小华', studentId: '2024003', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', studyHours: 28.4, mastery: 72, completion: 80, status: '活跃', grade: '中等' },
  { id: 's4', classId: 'c1', name: '刘洋', studentId: '2024004', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', studyHours: 25.7, mastery: 65, completion: 75, status: '一般', grade: '中等' },
  { id: 's5', classId: 'c1', name: '陈晨', studentId: '2024005', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', studyHours: 18.3, mastery: 58, completion: 62, status: '待提高', grade: '较差' },
  { id: 's11', classId: 'c1', name: '高阳', studentId: '2024011', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', studyHours: 34.5, mastery: 80, completion: 85, status: '活跃', grade: '良好' },
  { id: 's12', classId: 'c1', name: '林枫', studentId: '2024012', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', studyHours: 12.8, mastery: 45, completion: 48, status: '待提高', grade: '较差' },
  { id: 's13', classId: 'c1', name: '徐佳文', studentId: '2024013', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', studyHours: 22.1, mastery: 68, completion: 70, status: '一般', grade: '中等' },
  { id: 's14', classId: 'c1', name: '彭于晏', studentId: '2024014', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', studyHours: 41.2, mastery: 89, completion: 94, status: '活跃', grade: '良好' },
  { id: 's15', classId: 'c1', name: '邓丽君', studentId: '2024015', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', studyHours: 29.8, mastery: 75, completion: 82, status: '活跃', grade: '良好' },
  { id: 's6', classId: 'c2', name: '赵磊', studentId: '2024006', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', studyHours: 15.2, mastery: 42, completion: 50, status: '待提高', grade: '较差' },
  { id: 's7', classId: 'c2', name: '钱芳', studentId: '2024007', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', studyHours: 20.4, mastery: 56, completion: 56, status: '一般', grade: '中等' },
  { id: 's8', classId: 'c2', name: '周杰', studentId: '2024008', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150', studyHours: 35.1, mastery: 82, completion: 90, status: '活跃', grade: '良好' }
];

export const MISTAKES = [
  { id: 'm1', courseName: '数据结构与算法', subSection: '4.2 KMP算法主位指偏移推导', level: '高频核心', detail: '链队列头尾指针出队时的空解引用判断失误' },
  { id: 'm2', courseName: '机器学习基础', subSection: '1.3 MSE与MAE评估损失', level: '中等难度', detail: '均方误差残差对于极端异常值梯度爆炸符号解析错误' },
  { id: 'm3', courseName: '操作系统原理', subSection: '2.4 页面置换算法LRU与FIFO', level: '考试核心', detail: '内存空物理块驻留检查置换序列计算产生漏读' }
];

export const REVIEWS = [
  { id: 'r1', title: '数据结构与算法：Catalan数计算与出栈规律', priority: '高', status: '待复习' },
  { id: 'r2', title: '操作系统原理：双重模式切换与内核栈压栈顺序', priority: '高', status: '待复习' },
  { id: 'r3', title: '计算机网络：CSMA/CD指数退避算法计算步骤', priority: '中', status: '已复习' },
  { id: 'r4', title: '高等数学：三重积分柱坐标与球坐标系变换重积分', priority: '低', status: '待复习' }
];

export const SUBMITTED_STUDENTS = [
  {
    id: "s1",
    name: "李明",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoXWfhZbKdRy7sZ3ByfK8AhT8UPFGF_6mg7zCAjaUCEwXpL7GYTO2AM8mtcFjVz9ycWZe9RpzILWiHKM2q9c-mgUDBuTjJHKJqnXdo36aXn1gD0Yo-2xHHvsvv3Uy9UQkgYB8kMG0NPXvw6hsU80IdK9ipYIvmFDasT72U5T7DJsrf_-kbxl9xzvF1hQDUJg-HqYmtlW1TE9oIF10pf-b03QlTBWSklbY1bgXjd3H9crZPb1Ci5QTaVlFjrzQjOeTx7jJDE8Y6z4k",
    studentId: "2024001",
    className: "2024级计算机1班",
    submitTime: "2024-05-20 21:34:56",
    status: "已提交" as const,
    scores: { 1: 20, 2: 20, 3: 9, 4: 20, 5: 6, 6: 10 } as { [key: number]: number },
    maxScores: { 1: 20, 2: 20, 3: 10, 4: 20, 5: 10, 6: 10 } as { [key: number]: number },
    comments: { 
      1: "选择正确，考察并理解了栈和队列的共同点是都在端点操作。",
      2: "多项选择全部正确，能熟练区别栈与队列的存储与执行准则。",
      3: "判断极好，基本概念逻辑正确。",
      4: "填空计算正确，rear - front 的计算结果无误。",
      5: "基本性质描述正确，但对循环队列的解释不够完整，建议说明具体的实现方式（如取模运算）。",
      6: "编程设计合理，队列先进先出操作完全通过。"
    } as { [key: number]: string },
    answers: {
      1: "A. 只允许在端点处操作",
      2: "A. 循环队列克服假溢出 | B. 队头删除，队尾插入",
      3: "正确",
      4: "23",
      5: "队列是一种先进先出的线性数据结构，基本性质有：\n1. 队列只允许在队尾插入元素，在队头删除元素；\n2. 队列的所有操作遵循先进先出（FIFO）原则；\n3. 队列为空时，不允许删除操作。\n\n循环队列通过将线性存储空间的最后一个位置与第一个位置连接起来，形成一个环，解决了假溢出问题，提高了空间利用率。",
      6: "public void enqueue(T item) {\n  if (isFull()) throw new QueueFullException();\n  elements[rear] = item;\n  rear = (rear + 1) % size;\n}"
    } as { [key: number]: string }
  },
  {
    id: "s2",
    name: "张华",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTplOQLb4MCdmY08zg3veWn245DkHAjNodqSwiBuLe9VaRHsps7dLv9mzk6KnNWHyYJyTpjws5fqRLniC-9WYd9K_3JamFjlzIGd46UK40sPkC3g7ODkd0VChawdp20EgP2K2xgYY9-PAaUHFMLfGOeu9t6hFbQLYHQAvP0uIoib4dhTjd14eXrD_EgNJkLn6c1tglYxrHOVwYo9jAdE2W6WNm6o6Z84_Y2H9KO19D-AkQC9I6TovpxAIdaCDLEtK2It7PxdU4AFY",
    studentId: "2024002",
    className: "2024级计算机1班",
    submitTime: "2024-05-21 09:12:00",
    status: "已提交" as const,
    scores: { 1: 20, 2: 20, 3: 10, 4: 20, 5: 10, 6: 10 } as { [key: number]: number },
    maxScores: { 1: 20, 2: 20, 3: 10, 4: 20, 5: 10, 6: 10 } as { [key: number]: number },
    comments: { 
      1: "栈和队列共同特征描述精准。",
      2: "多项选择全部正确。",
      3: "讲解很完美。",
      4: "计算结果无误。",
      5: "解答完整，阐述了通过指针取模 rear = (rear+1) % MaxSize 链接头尾的本质原理。",
      6: "代码整洁规范，边界检验严谨。"
    } as { [key: number]: string },
    answers: {
      1: "A. 只允许在端点处操作",
      2: "A. 循环队列克服假溢出 | B. 队头删除，队尾插入",
      3: "正确",
      4: "23",
      5: "在队列的顺序存储中，由于队头指针和队尾指针均只增不减，会导致虽然仍有空闲空间，但 rear 指针已达到数组边界。循环队列在逻辑上把数组头尾衔接，使用 (rear + 1) % MaxSize 取模定位插入索引，彻底消除了假溢出。",
      6: "public void enqueue(T item) {\n  elements[rear] = item;\n  rear = (rear + 1) % size;\n}"
    } as { [key: number]: string }
  },
  {
    id: "s3",
    name: "王丽",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoXWfhZbKdRy7sZ3ByfK8AhT8UPFGF_6mg7zCAjaUCEwXpL7GYTO2AM8mtcFjVz9ycWZe9RpzILWiHKM2q9c-mgUDBuTjJHKJqnXdo36aXn1gD0Yo-2xHHvsvv3Uy9UQkgYB8kMG0NPXvw6hsU80IdK9ipYIvmFDasT72U5T7DJsrf_-kbxl9xzvF1hQDUJg-HqYmtlW1TE9oIF10pf-b03QlTBWSklbY1bgXjd3H9crZPb1Ci5QTaVlFjrzQjOeTx7jJDE8Y6z4k",
    studentId: "2024101",
    className: "2024级软件1班",
    submitTime: "2024-05-20 18:30:15",
    status: "已提交" as const,
    scores: { 1: 20, 2: 15, 3: 8, 4: 20, 5: 4, 6: 9 } as { [key: number]: number },
    maxScores: { 1: 20, 2: 20, 3: 10, 4: 20, 5: 10, 6: 10 } as { [key: number]: number },
    comments: { 
      1: "栈和队列共同点分析正确。",
      2: "漏选了一个正确选项，请查收循环队列在教材中第53页的讲解。",
      3: "回答有些许瑕疵，请参考正确标准答案。",
      4: "计算结果正确。",
      5: "没有提及通过取模机制来使得指针循环重置，需温习循环队列的基础推导公式流程。",
      6: "时间效率有提升空间，其他指标基本通过。"
    } as { [key: number]: string },
    answers: {
      1: "A. 只允许在端点处操作",
      2: "A. 循环队列克服假溢出",
      3: "正确",
      4: "23",
      5: "队列是 FIFO。假溢出是因为指针单向走。循环队列可以利用之前的空间，比如把尾部指针指回头部。",
      6: "public void enqueue(T item) {\n  // 缺少满队校验\n  elements[rear++] = item;\n}"
    } as { [key: number]: string }
  },
  {
    id: "s4",
    name: "周涛",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoXWfhZbKdRy7sZ3ByfK8AhT8UPFGF_6mg7zCAjaUCEwXpL7GYTO2AM8mtcFjVz9ycWZe9RpzILWiHKM2q9c-mgUDBuTjJHKJqnXdo36aXn1gD0Yo-2xHHvsvv3Uy9UQkgYB8kMG0NPXvw6hsU80IdK9ipYIvmFDasT72U5T7DJsrf_-kbxl9xzvF1hQDUJg-HqYmtlW1TE9oIF10pf-b03QlTBWSklbY1bgXjd3H9crZPb1Ci5QTaVlFjrzQjOeTx7jJDE8Y6z4k",
    studentId: "2024003",
    className: "2024级计算机1班",
    submitTime: "2024-05-19 14:22:10",
    status: "已提交" as const,
    scores: { 1: 10, 2: 12, 3: 5, 4: 20, 5: 3, 6: 7 } as { [key: number]: number },
    maxScores: { 1: 20, 2: 20, 3: 10, 4: 20, 5: 10, 6: 10 } as { [key: number]: number },
    comments: {
      1: "单选错误，混淆了先进先出和端点存取的原理。",
      2: "多选题错选漏选较多，需要扎实复习队列基础。",
      3: "判断错误，栈与队列并非无限制存储限制。",
      4: "填空计算正确。",
      5: "无取模、指针归零或折返的论证，解答不合格。",
      6: "算法未能编译通过，存在多处语法作用域拼写错误。"
    } as { [key: number]: string },
    answers: {
      1: "B. 先进先出",
      2: "C. 必须顺序存储",
      3: "错误",
      4: "23",
      5: "循环队列就是一直用。",
      6: "enqueue(item) { print error }"
    } as { [key: number]: string }
  }
];
