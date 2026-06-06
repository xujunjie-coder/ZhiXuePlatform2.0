import React, { useState } from 'react';
import SettingsView from './SettingsView';
import ClassReportView from './ClassReportView';
import StudentAnalysisView from './StudentAnalysisView';
import LearningBehaviorView from './LearningBehaviorView';
import QuestionBankView from './QuestionBankView';
import PaperManagementView from './PaperManagementView';
import AccountManagementView from './AccountManagementView';
import Header from './Header';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  PenTool, 
  MessageSquare, 
  PieChart, 
  FileText, 
  Activity, 
  FolderOpen, 
  Database, 
  Scroll, 
  UserCog, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MoreHorizontal, 
  GripVertical, 
  Trash2, 
  Edit3, 
  Circle, 
  Book, 
  FileCode, 
  Filter, 
  CheckCircle,
  Home,
  Check,
  AlertCircle,
  Video,
  Code,
  Download,
  Upload,
  FileArchive,
  FileSpreadsheet,
  Award,
  Sparkles,
  Send,
  X
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: { name: string; role: 'student' | 'teacher' } | null;
  onLogout: () => void;
}

// Course mock data matching the screenshot and adding high fidelity interactive characteristics
interface TeacherCourse {
  id: string;
  title: string;
  code: string;
  term: string;
  department: string;
  classes: string;
  createdOn: string;
  updatedOn: string;
  status: 'conducting' | 'archived';
  category: string;
  bgIconColor: string;
  iconType: 'code' | 'microchip' | 'linux' | 'sigma' | 'alpha' | 'default';
  chaptersCount: number;
}

interface Chapter {
  id: string;
  title: string;
  expanded: boolean;
  knowledgePoints: {
    title: string;
    metrics: { videos: number; docs: number; code?: number; cases?: number };
  }[];
}

type SubmissionStatus = '已提交' | '打回';

interface SubmittedStudent {
  id: string;
  name: string;
  avatar: string;
  studentId: string;
  className: string;
  submitTime: string;
  status: SubmissionStatus;
  scores: { [key: number]: number };
  maxScores: { [key: number]: number };
  comments: { [key: number]: string };
  answers: { [key: number]: string };
}

export default function TeacherDashboard({ currentUser, onLogout }: TeacherDashboardProps) {
  const [activeSidebarView, setActiveSidebarView] = useState('dashboard'); // Default to homepage/dashboard
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [studentDynamicTab, setStudentDynamicTab] = useState<'active' | 'attention'>('active');
  const [courseListTab, setCourseListTab] = useState<'my' | 'archived'>('my');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('1');
  const [activeCourseDetailTab, setActiveCourseDetailTab] = useState('chapters'); // chapters, resources, configuration, knowledge, routes
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [headerMessagesOpen, setHeaderMessagesOpen] = useState(false);
  const [headerNotificationsOpen, setHeaderNotificationsOpen] = useState(false);
  
  // Custom toast notification states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // ─── TEACHER TASK MANAGEMENT & INTERACTIVE MODAL STATES ───
  const [activeTeacherTask, setActiveTeacherTask] = useState<string | null>(null); // '作业' | '提问' | '互动' | null
  const [teacherTodoTasks, setTeacherTodoTasks] = useState<any[]>([]);

  const [studentAnswersList, setStudentAnswersList] = useState<any[]>([]);
  const [saActiveIndex, setSaActiveIndex] = useState(0);
  const [saGradingScore, setSaGradingScore] = useState(85);
  const [saGradingComment, setSaGradingComment] = useState("");

  const [studentAsksList, setStudentAsksList] = useState<any[]>([]);
  const [sqActiveIndex, setSqActiveIndex] = useState(0);
  const [sqReplyText, setSqReplyText] = useState("");

  const [groupDiscussionSelected, setGroupDiscussionSelected] = useState({
    id: "gd1", group: "讨论小组 A", topic: "关于链表逻辑连续与物理连续的本质讨论", chat: [
      { who: "陈同学", speech: "李老师，我们组在讨论：如果我们在内存中用一次 malloc 连续申请了 5 个 Node 的空间，然后修改指针连接它。它算逻辑连续还是物理连续呢？" },
      { who: "孙同学", speech: "那肯定逻辑还是逻辑，物理虽然碰巧在一起，但对它的访问只能依赖 ->next 按序遍历，不像数组那样能直接下标随机查找，所以它骨子里还是逻辑指针链结构。" }
    ],
    aiGuidance: "你们的脑暴极其深刻！物理上虽然这一次是连续空间，但访问依然必须依赖指针单步跳转，无法实现 O(1) 的随机检索。并且，在后续做任意节点的动态插入或删除后，新节点依然散落在堆区空间，物理连续性就不攻自破了。因此指针依赖的『逻辑结构』才是它的本质特征。你们可以重点区分指针索引和绝对地址寻址的 CPU 指令差异。"
  });
  const [gdReplyText, setGdReplyText] = useState("");

  // Modal states
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);

  // New Course Form states
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTerm, setNewCourseTerm] = useState('2024春季学期');
  const [newCourseClasses, setNewCourseClasses] = useState('计算机科学与技术2022级3班');

  // New Chapter Form states
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // ─── CLASS & STUDENT MANAGEMENT STATES ───
  const [selectedClassId, setSelectedClassId] = useState('c1');
  const [classSearchText, setClassSearchText] = useState('');
  const [classTab, setClassTab] = useState<'classes' | 'students'>('students');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState('全部');
  const [masteryFilterValue, setMasteryFilterValue] = useState('全部');
  const [currentSelectedStudentId, setCurrentSelectedStudentId] = useState('s1');
  const [studentDetailPanelOpen, setStudentDetailPanelOpen] = useState(false);
  const [studentDetailSubTab, setStudentDetailSubTab] = useState<'overview' | 'path' | 'mistakes' | 'assignments'>('overview');
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);

  // Homework Management States (Mockup-Aligned)
  const [homeworkSearchTerm, setHomeworkSearchTerm] = useState('');
  const [homeworkStatusFilter, setHomeworkStatusFilter] = useState('全部'); // top status filter tabs
  const [isAddHomeworkModalOpen, setIsAddHomeworkModalOpen] = useState(false);
  const [newHomeworkTitle, setNewHomeworkTitle] = useState('');
  const [newHomeworkCourse, setNewHomeworkCourse] = useState('数据结构与算法');
  const [newHomeworkDeadline, setNewHomeworkDeadline] = useState('2024-06-05 23:59');

  // Additional fine-grained page states for Assignments Section
  const [selectedHomeworkId, setSelectedHomeworkId] = useState('h_ds3');
  const [currentCenterTab, setCurrentCenterTab] = useState('作业概览'); // '作业概览' | '题目预览' | '提交情况' | '成绩统计' | '批改设置'
  const [gradingStudentIndex, setGradingStudentIndex] = useState(0); // active student indices
  const [gradingQuestionIndex, setGradingQuestionIndex] = useState(5); // Q5 (简答题) active by default as shown in layout

  // Custom interactive grading system states (fallback compatibility)
  const [gradingHomeworkId, setGradingHomeworkId] = useState<string | null>(null);
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [inputScoreValue, setInputScoreValue] = useState<number>(85);
  const [inputScoreComment, setInputScoreComment] = useState<string>('解题逻辑清晰，边界条件处理到位，表现优异。');

  // Report/Learning Analytics state variables matching the image layout
  const [reportCourse, setReportCourse] = useState('数据结构与算法');
  const [reportClass, setReportClass] = useState('2024级计算机1班');
  const [reportDateRange, setReportDateRange] = useState('2024-05-12 ~ 2024-05-18');
  const [reportSelectedStudentId, setReportSelectedStudentId] = useState('s1');
  const [reportStudentTab, setReportStudentTab] = useState<'progress' | 'weaknesses' | 'mistakes' | 'assignments' | 'behavior'>('progress');
  const [activeCellInfo, setActiveCellInfo] = useState<{ topic: string; chapter: string; value: string; color: string } | null>(null);
  const [showErrorDetailModal, setShowErrorDetailModal] = useState(false);
  const [selectedErrorExample, setSelectedErrorExample] = useState<{ title: string; type: string; reason: string; count: number; date: string; codeOrContent: string } | null>(null);
  const [reportAiSuggestions, setReportAiSuggestions] = useState<any[]>([]);

  // Interactive full-blown assignment array with detailed metadata from the mock image
  const [homeworkList, setHomeworkList] = useState<any[]>([]);

  // Comprehensive interactive submissions state representing actual students corresponding to mockup data
  const [submittedStudents, setSubmittedStudents] = useState<SubmittedStudent[]>([]);

  // ─── TEACHER RESOURCE LIBRARY STATE DECLARATIONS ───
  const [resourceTags, setResourceTags] = useState<any[]>([]);

  const [resourceCourses, setResourceCourses] = useState<any[]>([]);

  const [resources, setResources] = useState<any[]>([]);

  // Sidebar interactive states
  const [selectedResCourse, setSelectedResCourse] = useState('Java程序设计');
  const [selectedResChapter, setSelectedResChapter] = useState('');
  const [selectedResTag, setSelectedResTag] = useState('');
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  
  // Filtering and searching inputs
  const [resSearchKeyword, setResSearchKeyword] = useState('');
  const [resCourseFilter, setResCourseFilter] = useState('全部课程');
  const [resTypeFilter, setResTypeFilter] = useState('全部资源类型');
  const [resTagFilter, setResTagFilter] = useState('全部标签');

  // Resource Upload & Edit Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);

  // Resource parameters Form states
  const [resFormName, setResFormName] = useState('');
  const [resFormDesc, setResFormDesc] = useState('');
  const [resFormType, setResFormType] = useState('教材');
  const [resFormCourse, setResFormCourse] = useState('Java程序设计');
  const [resFormChapter, setResFormChapter] = useState('第1章 Java语言基础');
  const [resFormSize, setResFormSize] = useState('2.5 MB');
  const [resFormTags, setResFormTags] = useState<string[]>([]);

  // ─── TEACHER RESOURCE LIBRARY LOGIC AND ACTIONS ───
  const filteredResources = resources.filter(res => {
    // 1. Sidebar Course filter
    if (selectedResCourse && selectedResCourse !== '全部课程') {
      if (res.course !== selectedResCourse) return false;
    }
    // 2. Sidebar Chapter filter
    if (selectedResChapter) {
      if (res.chapter !== selectedResChapter) return false;
    }
    // 3. Sidebar selected Tag filter
    if (selectedResTag) {
      if (!res.tags.includes(selectedResTag)) return false;
    }
    // 4. Filter dropdowns: Course
    if (resCourseFilter && resCourseFilter !== '全部课程') {
      if (res.course !== resCourseFilter) return false;
    }
    // 5. Filter dropdowns: Resource Type
    if (resTypeFilter && resTypeFilter !== '全部资源类型') {
      if (res.type !== resTypeFilter) return false;
    }
    // 6. Filter dropdowns: Tag
    if (resTagFilter && resTagFilter !== '全部标签') {
      if (!res.tags.includes(resTagFilter)) return false;
    }
    // 7. Search keyword
    if (resSearchKeyword) {
      const kw = resSearchKeyword.toLowerCase();
      const matchName = res.name.toLowerCase().includes(kw);
      const matchDesc = res.desc.toLowerCase().includes(kw);
      const matchChapter = res.chapter.toLowerCase().includes(kw);
      const matchTags = res.tags.some(t => t.toLowerCase().includes(kw));
      if (!matchName && !matchDesc && !matchChapter && !matchTags) return false;
    }
    return true;
  });

  const handleSelectAllRes = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedResIds(filteredResources.map(r => r.id));
    } else {
      setSelectedResIds([]);
    }
  };

  const handleSelectRes = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedResIds(prev => [...prev, id]);
    } else {
      setSelectedResIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteRes = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    setSelectedResIds(prev => prev.filter(item => item !== id));
    triggerToast('🗑️ 资源已从库中成功移除。', 'success');
  };

  const handleOpenEditModal = (res: any) => {
    setEditingResId(res.id);
    setResFormName(res.name);
    setResFormDesc(res.desc);
    setResFormType(res.type);
    setResFormCourse(res.course);
    setResFormChapter(res.chapter);
    setResFormSize(res.size);
    setResFormTags(res.tags);
    setIsEditModalOpen(true);
  };

  const handleSaveEditRes = (e: React.FormEvent) => {
    e.preventDefault();
    setResources(prev => prev.map(r => {
      if (r.id === editingResId) {
        return {
          ...r,
          name: resFormName,
          desc: resFormDesc,
          type: resFormType,
          course: resFormCourse,
          chapter: resFormChapter,
          size: resFormSize,
          tags: resFormTags
        };
      }
      return r;
    }));
    setIsEditModalOpen(false);
    triggerToast('📝 资源详情已更新成功！', 'success');
  };

  const handleOpenUploadModal = () => {
    setResFormName('');
    setResFormDesc('');
    setResFormType('教材');
    setResFormCourse(selectedResCourse !== '全部课程' ? selectedResCourse : 'Java程序设计');
    const defaultCourseObj = resourceCourses.find(c => c.name === (selectedResCourse !== '全部课程' ? selectedResCourse : 'Java程序设计'));
    setResFormChapter(selectedResChapter || (defaultCourseObj && defaultCourseObj.chapters.length > 0 ? defaultCourseObj.chapters[0].name : '第1章 Java语言基础'));
    setResFormSize('4.5 MB');
    setResFormTags(['重点']);
    setIsUploadModalOpen(true);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    const fileExt = resFormName.split('.').pop()?.toLowerCase() || 'bin';
    let fileType = 'bin';
    if (['pdf'].includes(fileExt)) fileType = 'pdf';
    else if (['ppt', 'pptx'].includes(fileExt)) fileType = 'ppt';
    else if (['doc', 'docx'].includes(fileExt)) fileType = 'docx';
    else if (['java', 'py', 'c', 'cpp'].includes(fileExt)) fileType = 'code';
    else if (['zip', 'rar', 'tar'].includes(fileExt)) fileType = 'zip';

    let badgeColor = 'bg-slate-50 text-slate-705 border border-slate-205';
    if (resFormType === '教材') badgeColor = 'bg-green-50 text-green-705 border border-green-200';
    else if (resFormType === 'PPT') badgeColor = 'bg-orange-50 text-orange-705 border border-orange-200';
    else if (resFormType === '讲义') badgeColor = 'bg-purple-50 text-purple-755 border border-purple-200';
    else if (resFormType === '标准代码') badgeColor = 'bg-blue-50 text-blue-755 border border-blue-200';
    else if (resFormType === '典型错例') badgeColor = 'bg-teal-50 text-teal-705 border border-teal-200';
    else if (resFormType === '练习题') badgeColor = 'bg-cyan-50 text-cyan-705 border border-cyan-200';

    const newRes = {
      id: 'res_' + Date.now(),
      name: resFormName,
      desc: resFormDesc,
      type: resFormType,
      typeBadgeColor: badgeColor,
      chapter: resFormChapter,
      course: resFormCourse,
      tags: resFormTags,
      size: resFormSize,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileType: fileType
    };

    setResources(prev => [newRes, ...prev]);
    setIsUploadModalOpen(false);
    triggerToast('🎉 新资源已成功上传并关联完成！', 'success');
  };

  // Classes list matching the layout and specifications
  const [classesList, setClassesList] = useState<any[]>([]);

  // Students list dataset
  const [studentsList, setStudentsList] = useState<any[]>([]);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Courses matching the screenshot exactly + custom tags
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);

  // Live expandable chapter mock lists
  const [courseChapters, setCourseChapters] = useState<Record<string, Chapter[]>>({});

  const handleToggleChapter = (chapterId: string) => {
    setCourseChapters(prev => {
      const activeChapters = prev[selectedCourseId] || [];
      const updated = activeChapters.map(ch => 
        ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
      );
      return { ...prev, [selectedCourseId]: updated };
    });
  };

  const activeCourse = teacherCourses.find(c => c.id === selectedCourseId) || teacherCourses[0];
  const activeChapters = courseChapters[selectedCourseId] || [];

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      triggerToast('课程名称不能为空！', 'error');
      return;
    }

    const newId = String(teacherCourses.length + 1);
    const newCourseTuple: TeacherCourse = {
      id: newId,
      title: newCourseTitle,
      code: newCourseCode || 'CS' + (200 + teacherCourses.length),
      term: newCourseTerm,
      department: '计算机科学与技术专业',
      classes: newCourseClasses,
      createdOn: new Date().toISOString().split('T')[0],
      updatedOn: new Date().toISOString().split('T')[0],
      status: 'conducting',
      category: '专业必修课',
      bgIconColor: 'bg-indigo-600',
      iconType: 'default',
      chaptersCount: 0
    };

    setTeacherCourses([newCourseTuple, ...teacherCourses]);

    setCourseChapters(prev => ({
      ...prev,
      [newId]: [
        { id: '1', title: '第1章 课程导视与绪论', expanded: true, knowledgePoints: [] }
      ]
    }));

    setSelectedCourseId(newId);
    setIsAddCourseModalOpen(false);
    triggerToast(`🎉 成功创建课程《${newCourseTitle}》并自动绑定微课辅学空间！`, 'success');
    
    // Clear forms
    setNewCourseTitle('');
    setNewCourseCode('');
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      triggerToast('章节名称填写不完整！', 'error');
      return;
    }

    const updatedChapters = [...activeChapters];
    const newChapterId = String(updatedChapters.length + 1);
    const newCh: Chapter = {
      id: newChapterId,
      title: `第${newChapterId}章 ${newChapterTitle}`,
      expanded: true,
      knowledgePoints: [
        { title: `${newChapterId}.1 核心框架导读`, metrics: { videos: 1, docs: 1 } }
      ]
    };

    setCourseChapters(prev => ({
      ...prev,
      [selectedCourseId]: [...updatedChapters, newCh]
    }));

    setIsAddChapterModalOpen(false);
    setNewChapterTitle('');
    triggerToast(`🎉 成功在《${activeCourse.title}》中挂载新章节！`, 'success');
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm('确认删除此章节及关连的全部AI知识库切片吗？此操作不可逆。')) {
      const updated = activeChapters.filter(ch => ch.id !== chapterId);
      // Renumber
      const renumbered = updated.map((ch, idx) => {
        const titleWithoutPrefix = ch.title.replace(/^第\d+章\s+/, '');
        return {
          ...ch,
          id: String(idx + 1),
          title: `第${idx + 1}章 ${titleWithoutPrefix}`
        };
      });
      setCourseChapters(prev => ({
        ...prev,
        [selectedCourseId]: renumbered
      }));
      triggerToast('🗑️ 章节以及相关联的学生错题切片已成功抹除。', 'info');
    }
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    if (confirm(`深度警告：您确认终结并完全删除《${courseTitle}》整个精品课吗？所有选课学生的学习曲线 and 历史雷达图均将被清空！`)) {
      setTeacherCourses(prev => prev.filter(c => c.id !== courseId));
      triggerToast(`🗑️ 课程《${courseTitle}》已经被抹除。` , 'info');
      // Auto-select another course
      const remaining = teacherCourses.filter(c => c.id !== courseId);
      if (remaining.length > 0) {
        setSelectedCourseId(remaining[0].id);
      }
    }
  };

  // Filter list matching the current search
  const filteredCourses = teacherCourses.filter(c => {
    // Tab filter
    if (courseListTab === 'my' && c.status !== 'conducting') return false;
    if (courseListTab === 'archived' && c.status !== 'archived') return false;

    // Word filter
    if (courseSearchTerm.trim() === '') return true;
    return c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) || c.code.toLowerCase().includes(courseSearchTerm.toLowerCase());
  });

  // ─── SYNTHESIZED SOUND EFFECTS ───
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context blocked
    }
  };

  if (teacherCourses.length === 0 || Object.keys(courseChapters).length === 0 || studentsList.length === 0 || classesList.length === 0 || homeworkList.length === 0 || studentAnswersList.length === 0 || submittedStudents.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        正在加载教师管理端数据...
      </div>
    );
  }

  // ─── LOOKUP HELPERS FOR INDIVIDUAL STUDENT PERSPECTIVE ───
  const currentStudent = studentsList.find(s => s.id === currentSelectedStudentId) || studentsList[0];

  const studentTrends: Record<string, string> = {
    's1': '0,40 15,35 30,38 45,25 60,25 75,22 90,15 100,15',
    's2': '0,50 15,48 30,42 45,35 60,30 75,28 90,24 100,22',
    's3': '0,60 15,55 30,50 45,45 60,40 75,35 90,32 100,28',
    's4': '0,70 15,65 30,62 45,55 60,50 75,48 90,42 100,35',
    's5': '0,80 15,75 30,72 45,68 60,65 75,60 90,56 100,42',
  };

  const studentActivities: Record<string, {title: string, icon: string, time: string, color: string}[]> = {
    's1': [
      { title: '完成了知识点 “栈的应用” 的学习', icon: 'menu_book', time: '05-18 21:30', color: 'text-blue-500' },
      { title: '观看了视频 “二叉树遍历详解”', icon: 'play_circle_filled', time: '05-18 20:15', color: 'text-purple-500' },
      { title: '提交了作业 “数据结构 作业3”', icon: 'assignment', time: '05-18 23:45', color: 'text-green-500' },
    ],
    's2': [
      { title: '观看了视频 “链表边界条件”', icon: 'play_circle_filled', time: '05-17 19:40', color: 'text-purple-500' },
      { title: '完成了知识点 “顺序查找”', icon: 'menu_book', time: '05-17 14:15', color: 'text-blue-500' },
    ],
    's3': [
      { title: '提交了作业 “离散数学 作业2”', icon: 'assignment', time: '05-16 11:30', color: 'text-green-500' },
      { title: '观看了视频 “图的邻接矩阵表示”', icon: 'play_circle_filled', time: '05-15 10:10', color: 'text-purple-500' },
    ]
  };

  const studentAssignments: Record<string, {title: string, score: number, time: string, status: string, border: string}[]> = {
    's1': [
      { title: '数据结构 作业3', score: 92, time: '05-18 23:45', status: '已提交', border: 'border-red-500' },
      { title: '算法设计 课后练习2', score: 85, time: '05-16 21:30', status: '已提交', border: 'border-green-500' },
      { title: '计算机组成原理 作业2', score: 78, time: '05-14 19:20', status: '已提交', border: 'border-yellow-500' },
      { title: '离散数学 练习题2', score: 90, time: '05-12 17:15', status: '已提交', border: 'border-red-500' },
    ],
    's2': [
      { title: '数据结构 作业3', score: 88, time: '05-18 20:00', status: '已提交', border: 'border-red-500' },
      { title: '算法设计 课后练习2', score: 79, time: '05-15 15:30', status: '已提交', border: 'border-green-500' },
      { title: '离散数学 练习题2', score: 82, time: '05-13 18:20', status: '已提交', border: 'border-red-500' },
    ],
    's3': [
      { title: '数据结构 作业3', score: 80, time: '05-17 11:30', status: '已提交', border: 'border-red-500' },
      { title: '算法设计 课后练习2', score: 81, time: '05-14 09:20', status: '已提交', border: 'border-green-500' },
      { title: '计算机组成原理 作业2', score: 75, time: '05-12 14:15', status: '已提交', border: 'border-yellow-500' },
    ]
  };

  const currentActivities = studentActivities[currentStudent.id] || [
    { title: '观看了课程同步视频微课记录', icon: 'play_circle_filled', time: '05-18 09:30', color: 'text-purple-500' },
    { title: '完成了自测试卷的强化模拟解析', icon: 'assignment', time: '05-17 15:45', color: 'text-green-500' }
  ];

  const currentAssignments = studentAssignments[currentStudent.id] || [
    { title: '数据结构 随堂习题', score: 85, time: '05-18 10:00', status: '已提交', border: 'border-blue-500' },
    { title: '微积分 单元强化测试', score: 72, time: '05-15 11:30', status: '已提交', border: 'border-yellow-500' }
  ];

  // ─── FILTERING LOGIC FOR STUDENTS TABLE ───
  const filteredStudents = studentsList.filter(st => {
    // Class constraints filter
    if (selectedClassId !== 'all' && st.classId !== selectedClassId) return false;
    
    // Search text constraint
    if (studentSearchInput.trim() !== '') {
      const q = studentSearchInput.toLowerCase();
      if (!st.name.toLowerCase().includes(q) && !st.studentId.includes(q)) {
        return false;
      }
    }
    
    // Status select constraint
    if (statusFilterValue !== '全部' && st.status !== statusFilterValue) return false;
    
    // Mastery rate constraint
    if (masteryFilterValue !== '全部' && st.grade !== masteryFilterValue) return false;
    
    return true;
  });

  React.useEffect(() => {
    // Fetch teacher todo tasks
    fetch('/api/teacher/tasks')
      .then(res => res.json())
      .then(data => setTeacherTodoTasks(data))
      .catch(err => console.error('Error fetching teacher tasks:', err));

    // Fetch student answers
    fetch('/api/teacher/answers')
      .then(res => res.json())
      .then(data => setStudentAnswersList(data))
      .catch(err => console.error('Error fetching student answers:', err));

    // Fetch student questions
    fetch('/api/teacher/asks')
      .then(res => res.json())
      .then(data => setStudentAsksList(data))
      .catch(err => console.error('Error fetching student asks:', err));

    // Fetch AI suggestions
    fetch('/api/teacher/suggestions')
      .then(res => res.json())
      .then(data => setReportAiSuggestions(data))
      .catch(err => console.error('Error fetching AI suggestions:', err));

    // Fetch homeworks
    fetch('/api/teacher/homeworks')
      .then(res => res.json())
      .then(data => setHomeworkList(data))
      .catch(err => console.error('Error fetching homeworks:', err));

    // Fetch submissions
    fetch('/api/teacher/submissions')
      .then(res => res.json())
      .then(data => setSubmittedStudents(data))
      .catch(err => console.error('Error fetching submissions:', err));

    // Fetch resource tags
    fetch('/api/teacher/resource-tags')
      .then(res => res.json())
      .then(data => setResourceTags(data))
      .catch(err => console.error('Error fetching resource tags:', err));

    // Fetch resource courses
    fetch('/api/teacher/resource-courses')
      .then(res => res.json())
      .then(data => setResourceCourses(data))
      .catch(err => console.error('Error fetching resource courses:', err));

    // Fetch resources
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(err => console.error('Error fetching resources:', err));

    // Fetch classes
    fetch('/api/teacher/classes')
      .then(res => res.json())
      .then(data => setClassesList(data))
      .catch(err => console.error('Error fetching classes:', err));

    // Fetch students
    fetch('/api/teacher/students')
      .then(res => res.json())
      .then(data => setStudentsList(data))
      .catch(err => console.error('Error fetching students:', err));

    // Fetch teacher courses
    fetch('/api/teacher/courses')
      .then(res => res.json())
      .then(data => setTeacherCourses(data))
      .catch(err => console.error('Error fetching teacher courses:', err));

    // Fetch course chapters
    fetch('/api/teacher/chapters')
      .then(res => res.json())
      .then(data => setCourseChapters(data))
      .catch(err => console.error('Error fetching chapters:', err));
  }, []);

  React.useEffect(() => {
    setStudentsCurrentPage(1);
  }, [selectedClassId, studentSearchInput, statusFilterValue, masteryFilterValue, studentsPerPage]);

  const indexOfLastStudent = studentsCurrentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudentsShown = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  return (
    <div className="h-screen w-screen overflow-hidden text-gray-800 bg-gray-50 flex font-sans select-none animate-fadeIn">
      
      {/* 1. Left Sidebar Navigation matching student-side sidebar behaviour exactly */}
      <aside 
        aria-label="Sidebar" 
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
        className={`relative h-full border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } z-20 select-none`}
      >
        
        {/* Logo area */}
        <div className={`h-14 flex items-center border-b border-gray-100 shrink-0 overflow-hidden ${sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-2'}`}>
          <div className="flex items-center gap-2 text-blue-600 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="font-extrabold text-base tracking-wide text-gray-900 whitespace-nowrap animate-fadeIn">智学云教</span>
                <span className="text-xs text-slate-400 border-l border-slate-200 pl-2 ml-1 font-bold whitespace-nowrap animate-fadeIn">教师工作台</span>
              </>
            )}
          </div>
        </div>
        <nav className={`flex-1 overflow-y-auto pt-4 px-3 space-y-5 ${sidebarCollapsed ? '[&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]' : 'scrollbar-thin'}`}>
          {/* General */}
          <div>
            <button 
              onClick={() => setActiveSidebarView('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                activeSidebarView === 'dashboard' 
                  ? 'bg-blue-50 text-blue-600 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
              {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">教师工作台首页</span>}
            </button>
          </div>

          {/* Teaching Management */}
          <div>
            {!sidebarCollapsed && (
              <h3 className="px-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 animate-fadeIn">教学管理</h3>
            )}
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveSidebarView('courses')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'courses' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'courses' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">课程管理</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('classes');
                    triggerToast('👩‍🏫 班级管理：正在统筹计算机2022级共计115位学生绩率。');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'classes' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'classes' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">班级管理</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('homework');
                    triggerToast('📝 作业管理：已为本学期自动布置第三套在线算法评测训练。');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'homework' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PenTool className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'homework' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">作业管理</span>}
                </button>
              </li>
            </ul>
          </div>

          {/* Analysis Section */}
          <div>
            {!sidebarCollapsed && (
              <h3 className="px-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 animate-fadeIn">学情分析</h3>
            )}
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('report');
                    triggerToast('📊 正在加载全课程大模型多维诊断学情总览图表...');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'report' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <PieChart className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'report' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">学情总览</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('class-report');
                    triggerToast('📑 正在加载单节精细课堂学情复盘与 AI 分析诊断报告...');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'class-report'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'class-report' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">课堂报告</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('student-analysis');
                    triggerToast('👥 正在为您聚类学生个性化学情、高频错点与多维轨迹透视画像...');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'student-analysis'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'student-analysis' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">学生分析</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('learning-behavior');
                    triggerToast('📊 正在为您聚类多维度学生学习行为分析面板与诊断报告...');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'learning-behavior'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Activity className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'learning-behavior' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">学习行为分析</span>}
                </button>
              </li>
            </ul>
          </div>

          {/* Resource Center */}
          <div>
            {!sidebarCollapsed && (
              <h3 className="px-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 animate-fadeIn">资源中心</h3>
            )}
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('resources');
                    triggerToast('💾 教学资源库已加载：包含 PDF课件, PPT, 文档及示例代码分类！', 'success');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'resources' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'resources' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">资源库</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('question-bank');
                    triggerToast('🗃️ 正在为您加载精品随堂题库与智能组卷管理中心...');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'question-bank'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Database className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'question-bank' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">题库管理</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('papers');
                    triggerToast('📄 试卷管理大纲中心已成功加载。', 'success');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs md:text-sm text-left ${
                    activeSidebarView === 'papers'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Scroll className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'papers' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">试卷管理</span>}
                </button>
              </li>
            </ul>
          </div>

          {/* System Management */}
          <div>
            {!sidebarCollapsed && (
              <h3 className="px-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 animate-fadeIn">系统管理</h3>
            )}
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('accounts');
                    triggerToast('👤 已进入统一账户管理系统大厅，配置学生及本班助教特权', 'success');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all text-left ${
                    activeSidebarView === 'accounts' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <UserCog className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'accounts' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">账户管理</span>}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveSidebarView('settings');
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all text-left ${
                    activeSidebarView === 'settings' 
                      ? 'bg-blue-50 text-blue-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings className={`w-4 h-4 shrink-0 transition-colors ${activeSidebarView === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="whitespace-nowrap animate-fadeIn">设置中心</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Card inside left Sidebar aligned following screenshot */}
        <div className={`p-4 border-t border-slate-100 shrink-0 select-none bg-slate-50/50 overflow-hidden flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}>
          <div className="flex items-center gap-3 shrink-0">
            <img 
              alt="张老师" 
              className="w-10 h-10 rounded-full border border-slate-200 shadow-3xs object-cover shrink-0" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMZuirJlvSslWg6NNTG9cd20Kkh8PoTDWYteLknDMop8RWSHqoGyKEuxjdqo8r6mHn1loDSMTAu8-uw51nMiCJm_rMWxyKBTArTOa2Ls8lgrcu_Xsy-A_Mf6UrzE4scZ8nkSYcLI9El_pX5xQn3hHtF_eryOiKt_AWkTOE0Kquh5LVBb7UvjvWISrzS7PNwTxNPJayMokpXX4681LOcX5FGHPs1nbiIFih9fkjUZ6F2RtlXvAT3Rjma9RZKfxcsXD5C49VqfRZX0c"
            />
            {!sidebarCollapsed && (
              <>
                <div className="text-left whitespace-nowrap animate-fadeIn">
                  <p className="text-xs md:text-sm font-extrabold text-slate-800 leading-none">张老师</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-bold">计算机科学学院</p>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="ml-auto p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="退出本教学管网"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

      </aside>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Header of main workspace */}
        <Header 
          currentUser={currentUser}
          onLogout={onLogout}
          setActiveView={() => {}}
          messagesOpen={headerMessagesOpen}
          setMessagesOpen={setHeaderMessagesOpen}
          notificationsOpen={headerNotificationsOpen}
          setNotificationsOpen={setHeaderNotificationsOpen}
          leftContent={
            <div className="flex-1 flex items-center text-left">
              <div className="text-xs md:text-sm font-bold text-slate-400 flex items-center gap-1 select-none">
                <span>教研中心</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-800 font-extrabold text-sm truncate">
                  {activeSidebarView === 'courses' 
                    ? '精品微课章节管辖' 
                    : activeSidebarView === 'class-report' 
                    ? '单节课堂学情复盘' 
                    : activeSidebarView === 'student-analysis'
                    ? '个性化学生学情详情分析'
                    : activeSidebarView === 'learning-behavior'
                    ? '多维度学习行为指标监控'
                    : activeSidebarView === 'question-bank'
                    ? '校本精品题库与试卷组装'
                    : activeSidebarView === 'papers'
                    ? '统一试卷管理与智能组卷'
                    : activeSidebarView === 'accounts'
                    ? '统一账户与助教权限维护'
                    : '核心教学多维分析看板'}
                </span>
              </div>
            </div>
          }
        />

        {/* 3. Embedded Application Toaster notifications panel */}
        {toastMsg && (
          <div className={`mx-6 mt-3 p-3 rounded-xl border text-xs text-left leading-relaxed font-bold transition-all flex items-center gap-2.5 animate-fadeIn z-50 ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : toastMsg.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <span>💡</span>
            <span className="flex-grow">{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="text-[10px] text-slate-400 font-black hover:text-slate-600">×</button>
          </div>
        )}

        {/* 4. Page Content with conditional views */}
        {activeSidebarView === 'courses' ? (
          <main className="flex-1 flex overflow-hidden">
            
            {/* Left Column: Course List Selection Column */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0 select-none">
              
              {/* Header inside course list */}
              <div className="p-4 border-b border-slate-100 flex flex-col gap-3.5 text-left">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-lg font-black text-slate-800">课程管理</h2>
                </div>

                {/* Tabs selection: 我教的课 vs 已归档 */}
                <div className="flex space-x-5 border-b border-slate-100">
                  <button 
                    onClick={() => { setCourseListTab('my'); triggerToast('正在加载本学期授课中的活跃班级课程数据集...'); }}
                    className={`pb-2 text-xs md:text-sm font-extrabold transition-all relative ${
                      courseListTab === 'my' 
                        ? 'text-blue-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    进行中 ({teacherCourses.filter(c => c.status === 'conducting').length})
                    {courseListTab === 'my' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                  </button>
                  <button 
                    onClick={() => { setCourseListTab('archived'); triggerToast('已为您加载上一学年全部已结算归档的课程历史。'); }}
                    className={`pb-2 text-xs md:text-sm font-extrabold transition-all relative ${
                      courseListTab === 'archived' 
                        ? 'text-blue-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    已归档 ({teacherCourses.filter(c => c.status === 'archived').length})
                    {courseListTab === 'archived' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>}
                  </button>
                </div>

                {/* Search Course input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <input 
                      value={courseSearchTerm}
                      onChange={(e) => setCourseSearchTerm(e.target.value)}
                      className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-white placeholder-slate-400 rounded-lg text-xs leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold" 
                      placeholder="搜索课程名称或代码" 
                      type="text"
                    />
                    {courseSearchTerm && (
                      <button onClick={() => setCourseSearchTerm('')} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-black">
                        ×
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => triggerToast('🔍 高维度智能高级字段筛选已挂载。')}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white flex items-center justify-center cursor-pointer"
                  >
                    <Filter className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

              </div>

              {/* Course Item scrollable list matching mockup styles exactly */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 scrollbar-thin text-left">
                
                {filteredCourses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold leading-relaxed select-none">
                    ⚠️ 没有寻找到符合检索的课程记录
                  </div>
                ) : (
                  filteredCourses.map(course => {
                    const isSelected = selectedCourseId === course.id;
                    return (
                      <div 
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`bg-white rounded-xl p-4 shadow-3xs cursor-pointer relative transition-all border-2 ${
                          isSelected 
                            ? 'border-blue-500 ring-2 ring-blue-500/10' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex gap-3 items-center">
                            
                            {/* Color coded icon grids based on mockup */}
                            <div className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${course.bgIconColor}`}>
                              {course.iconType === 'code' && <Code className="w-4.5 h-4.5" />}
                              {course.iconType === 'microchip' && <Database className="w-4.5 h-4.5" />}
                              {course.iconType === 'linux' && <Activity className="w-4.5 h-4.5" />}
                              {course.iconType === 'sigma' && <span className="font-extrabold text-base">∑</span>}
                              {course.iconType === 'alpha' && <span className="font-extrabold text-sm">A</span>}
                              {course.iconType === 'default' && <Book className="w-4.5 h-4.5" />}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 text-xs md:text-sm leading-tight truncate max-w-[130px]" title={course.title}>
                                {course.title}
                              </h3>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1 leading-none">
                                <span>{course.term}</span>
                                <span>|</span>
                                <span className="font-mono text-[9px]">{course.code}</span>
                              </p>
                            </div>

                          </div>

                          <div className="relative group/more">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`确认要将课程《${course.title}》标记为已归档或进行中吗？`)) {
                                  setTeacherCourses(prev => prev.map(c => c.id === course.id ? { 
                                    ...c, 
                                    status: c.status === 'conducting' ? 'archived' : 'conducting' 
                                  } : c));
                                  triggerToast(`🎯 课程归档特征属性已成功切换！`, 'success');
                                }
                              }}
                              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md cursor-pointer"
                              title="改变归档属性/彻底删除"
                            >
                              <MoreHorizontal className="w-4 h-4 shrink-0" />
                            </button>
                            
                            {/* Fast wipe floating delete bubble on absolute hover action */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(course.id, course.title);
                              }}
                              className="absolute right-0 -bottom-6 hidden group-hover/more:block bg-red-50 text-red-500 font-bold p-1 py-0.5 rounded text-[9px] border border-red-100 whitespace-nowrap cursor-pointer z-50 hover:bg-red-500 hover:text-white"
                            >
                              彻底清除
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-2 select-none leading-none">
                          <p className="text-[10px] text-slate-400 font-bold max-w-[160px] truncate">{course.department}</p>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold border leading-none ${
                            course.status === 'conducting' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {course.status === 'conducting' ? '进行中' : '已归档'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>

              {/* Status footer list count */}
              <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 font-bold bg-white text-left select-none leading-none">
                共计管属 &nbsp;<b>{filteredCourses.length}</b>&nbsp; 门精品学科
              </div>

            </div>

            {/* Right Column: Course Detail Area containing specific chapter timelines */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
              
              {/* Dynamic top floating "Create new Course" button triggering active React Modal controls */}
              <div className="absolute top-4 right-6 z-10">
                <button 
                  onClick={() => setIsAddCourseModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold shadow-md flex items-center gap-1.5 active:scale-98 transition-all hover:shadow-lg cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  创建新课程
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                
                {/* 1. Header Card detailing current high-fi course overview exactly as screenshot */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 mb-6 shadow-3xs text-left relative overflow-hidden">
                  
                  {/* Subtle top background decorative glow */}
                  <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-slate-50 opacity-40 blur-xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row items-start gap-4">
                    
                    {/* Big Icon Grid on Header */}
                    <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center text-3xl shrink-0 shadow-md ${activeCourse.bgIconColor}`}>
                      {activeCourse.iconType === 'code' && <Code className="w-7 h-7" />}
                      {activeCourse.iconType === 'microchip' && <Database className="w-7 h-7" />}
                      {activeCourse.iconType === 'linux' && <Activity className="w-7 h-7" />}
                      {activeCourse.iconType === 'sigma' && <span className="font-extrabold text-2xl">∑</span>}
                      {activeCourse.iconType === 'alpha' && <span className="font-extrabold text-xl">A</span>}
                      {activeCourse.iconType === 'default' && <Book className="w-7 h-7" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
                          {activeCourse.title}
                        </h1>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border leading-none ${
                          activeCourse.status === 'conducting' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {activeCourse.status === 'conducting' ? '进行中' : '已归档'}
                        </span>
                      </div>

                      {/* Course statistics detail row matches screenshot precisely */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 font-semibold mt-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">课程代码:</span> 
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{activeCourse.code}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-1">开课学期:</span>
                          <span className="text-slate-700">{activeCourse.term}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-1">授课班级:</span>
                          <span className="text-slate-700 max-w-[200px] truncate inline-block align-bottom" title={activeCourse.classes}>{activeCourse.classes}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-1">建立日期:</span>
                          <span className="text-slate-700 font-mono">{activeCourse.createdOn}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-1">最近更迭:</span>
                          <span className="text-slate-700 font-mono">{activeCourse.updatedOn}</span>
                        </div>
                      </div>

                    </div>

                    {/* Header quick operation triggers */}
                    <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-auto">
                      <button 
                        onClick={() => triggerToast(`已成功锁定《${activeCourse.title}》基本课程框架，可进入表单细节修订。`)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50/50 bg-white shadow-3xs transition-all cursor-pointer"
                      >
                        编辑课程信息
                      </button>
                      <button 
                        onClick={() => triggerToast(`大模型自适应参数配置面板已就绪。`)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50/50 bg-white shadow-3xs transition-all cursor-pointer"
                      >
                        课程设置
                      </button>
                    </div>

                  </div>

                </div>

                {/* 2. Course Tab Navigation mimicking screenshot precisely */}
                <div className="border-b border-slate-200 mb-6 bg-transparent text-left select-none">
                  <nav aria-label="Tabs" className="-mb-px flex space-x-6 md:space-x-8">
                    <button 
                      onClick={() => setActiveCourseDetailTab('chapters')}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-extrabold text-xs md:text-sm transition-colors ${
                        activeCourseDetailTab === 'chapters' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      章节管理
                    </button>
                    <button 
                      onClick={() => { setActiveCourseDetailTab('resources'); triggerToast('正在加载本课程挂载的PPT、PDF及微课短视频切片库...'); }}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-extrabold text-xs md:text-sm transition-colors ${
                        activeCourseDetailTab === 'resources' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      资源管理
                    </button>
                    <button 
                      onClick={() => { setActiveCourseDetailTab('configuration'); triggerToast('已提取大模型生成考题和切片错题推荐时的参数权重...'); }}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-extrabold text-xs md:text-sm transition-colors ${
                        activeCourseDetailTab === 'configuration' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      课程配置
                    </button>
                    <button 
                      onClick={() => { setActiveCourseDetailTab('knowledge'); triggerToast('已挂载智教大模型专用语料切片库，支持20组PDF文档检索增强。'); }}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-extrabold text-xs md:text-sm transition-colors ${
                        activeCourseDetailTab === 'knowledge' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      知识库管理
                    </button>
                    <button 
                      onClick={() => { setActiveCourseDetailTab('routes'); triggerToast('已为您和选课学生实时生成3条图谱式自组织学习路径建议。'); }}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-extrabold text-xs md:text-sm transition-colors ${
                        activeCourseDetailTab === 'routes' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      学习路径
                    </button>
                  </nav>
                </div>

                {/* 3. Detailed chapter Timeline Panel */}
                {activeCourseDetailTab === 'chapters' && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-0 overflow-hidden text-left animate-fadeIn">
                    
                    {/* Chapter Dashboard Toolbar */}
                    <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/20">
                      <div>
                        <h2 className="text-sm md:text-base font-extrabold text-slate-800">章节目录</h2>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">拖拽章节可调整物理排序，点击左侧三角标志收缩，管理高频率热度切片知识点</p>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <button 
                          onClick={() => setIsAddChapterModalOpen(true)}
                          className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-98 transition-all shadow-3xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> 
                          添加章节
                        </button>
                        <button 
                          onClick={() => triggerToast('📐 批量管理通道：支持一键导出整体CSV目录或批量锁定/公布。')}
                          className="px-3 py-1.5 border border-slate-240 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-3xs cursor-pointer"
                        >
                          批量发布管理 <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Scaled physical lists rendering matching collapsible features exactly */}
                    <div className="divide-y divide-slate-100">
                      {activeChapters.length === 0 ? (
                        <div className="p-10 text-center text-xs text-slate-400 font-bold leading-relaxed">
                          📌 本学期精品课大纲中暂时没有章节。请点击右上角【添加章节】。
                        </div>
                      ) : (
                        activeChapters.map((chapter) => (
                          <div key={chapter.id} className="transition-all">
                            
                            {/* Chapter element bar */}
                            <div className={`flex items-center py-3.5 px-4 md:px-5 hover:bg-slate-50/50 transition-colors group ${
                              chapter.expanded ? 'bg-blue-50/10' : ''
                            }`}>
                              
                              {/* Grab Handle for sorting UI placeholder */}
                              <div className="flex items-center gap-2 w-9">
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-slate-500" />
                                <button 
                                  onClick={() => handleToggleChapter(chapter.id)} 
                                  className="text-slate-400 hover:text-slate-700 p-0.5 focus:outline-none focus:ring-0"
                                >
                                  {chapter.expanded ? (
                                    <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                                  )}
                                </button>
                              </div>

                              {/* Chapter Title text */}
                              <div 
                                onClick={() => handleToggleChapter(chapter.id)}
                                className="flex-1 font-bold text-slate-700 text-xs md:text-sm cursor-pointer hover:text-blue-600 transition-colors"
                              >
                                {chapter.title}
                              </div>

                              {/* Chapter action tags matching mock screenshot */}
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] text-slate-400 font-extrabold pr-2 bg-slate-50 px-2 py-0.5 rounded">
                                  {chapter.knowledgePoints.length} 个知识点
                                </span>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={() => triggerToast(`大模型已为您锁定章节《${chapter.title}》的辅学语料分析`)}
                                    className="text-slate-400 hover:text-blue-600 text-[11px] font-bold flex items-center gap-0.5"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    编辑
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteChapter(chapter.id)}
                                    className="text-slate-400 hover:text-red-500 text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    删除
                                  </button>
                                </div>
                              </div>

                            </div>

                            {/* Detailed collapsed sub knowledge cards */}
                            {chapter.expanded && (
                              <div className="pl-14 pr-4 md:pr-6 py-1 pb-3.5 space-y-1.5 bg-slate-50/20">
                                {chapter.knowledgePoints.length === 0 ? (
                                  <div className="text-xs text-slate-400 py-3 font-semibold select-none">
                                    📪 暂无细化子知识点。系统推荐导入大纲辅学树。
                                  </div>
                                ) : (
                                  chapter.knowledgePoints.map((kp, kpIdx) => (
                                    <div 
                                      key={kpIdx}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 hover:bg-white hover:shadow-3xs rounded-xl group/kp border border-transparent hover:border-slate-100 transition-all text-left"
                                    >
                                      
                                      <div className="flex items-center gap-2.5">
                                        <Circle className="w-1.5 h-1.5 fill-blue-500 text-blue-500" />
                                        <span className="text-xs md:text-sm font-bold text-slate-600 group-hover/kp:text-slate-950 transition-colors">
                                          {kp.title}
                                        </span>
                                      </div>

                                      {/* Core file media statistics exactly matching layout mock indices (e.g. 视频 3, 文档 2, 代码 1) */}
                                      <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-4 sm:ml-0">
                                        
                                        {kp.metrics.videos > 0 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                            视频 <span className="ml-1 text-slate-800 font-extrabold">{kp.metrics.videos}</span>
                                          </span>
                                        )}

                                        {kp.metrics.docs > 0 && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                            文档 <span className="ml-1 text-slate-800 font-extrabold">{kp.metrics.docs}</span>
                                          </span>
                                        )}

                                        {kp.metrics.code && kp.metrics.code > 0 && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                            代码 <span className="ml-1 text-slate-800 font-extrabold">{kp.metrics.code}</span>
                                          </span>
                                        )}

                                        {kp.metrics.cases && kp.metrics.cases > 0 && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                            案例 <span className="ml-1 text-slate-800 font-extrabold">{kp.metrics.cases}</span>
                                          </span>
                                        )}

                                        {/* Hover KP operation tools */}
                                        <div className="w-28 flex justify-end items-center gap-2 opacity-0 group-hover/kp:opacity-100 transition-opacity pl-2 select-none">
                                          <button 
                                            onClick={() => triggerToast(`大模型辅学网关：已调优《${kp.title}》的AI考查因子。`)}
                                            className="text-slate-400 hover:text-blue-600 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                          >
                                            修定
                                          </button>
                                          <button 
                                            onClick={() => {
                                              if (confirm('确认将此精细知识考切片从该章节剥离吗？')) {
                                                triggerToast('知识考切片已被剥离。');
                                              }
                                            }}
                                            className="text-slate-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                          >
                                            剥离
                                          </button>
                                        </div>

                                      </div>

                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* Simulated placeholders for other tab items to enrich clarity */}
                {activeCourseDetailTab === 'resources' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center animate-fadeIn shadow-3xs">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">课程多媒体教资切片</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">大模型已提取并索引本课程下全套 PPT 文档、白纸微课短视频与交互代码案例。支持大模型交叉验证配比。</p>
                  </div>
                )}

                {activeCourseDetailTab === 'configuration' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center animate-fadeIn shadow-3xs">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mx-auto mb-3">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">大模型教务诊断权重系数配置</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">设置辅导大模型在回答本课程学生作业疑点时的拟合度、代码审查严格等级以及自主微考卷比对权重。</p>
                  </div>
                )}

                {activeCourseDetailTab === 'knowledge' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center animate-fadeIn shadow-3xs">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 mx-auto mb-3">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">课程专业增强本地知识语料库</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">当前已挂载本地教学参考书 3 本，专家教案数据集，供智能大模型执行 RAG 增强式辅学答疑。</p>
                  </div>
                )}

                {activeCourseDetailTab === 'routes' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center animate-fadeIn shadow-3xs">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mx-auto mb-3">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">自组织多分支个性化学习路径规推引擎</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">大模型已依照全班当前知识雷达短板自适应生成 3 条针对不同成绩分布群体的强化闯关链路。</p>
                  </div>
                )}

              </div>

            </div>

          </main>
        ) : activeSidebarView === 'classes' ? (
          /* ══════════════════════════════════════════════════════════════════
             REAL HIGH-FIDELITY TEACHER WORKSTATION STUDENT MANAGEMENT (班级 & 学生管理)
             ══════════════════════════════════════════════════════════════════ */
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 text-slate-800 text-left">
            
            {/* Page Header Tabs Area */}
            <div className="p-6 bg-white border-b border-slate-200 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span className="material-icons text-blue-600">people</span>
                  学生与班级统计管区
                </h1>
                <div className="text-xs text-slate-400 font-bold hidden sm:block">
                  最近更新：五分钟前 · 大模型学情引擎已就绪
                </div>
              </div>

              {/* View selection tabs */}
              <div className="flex gap-6 border-b border-slate-100">
                <button 
                  onClick={() => { setClassTab('classes'); triggerToast('正在加载本学年已部署的精品选区班级画像数据...'); }}
                  className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer ${
                    classTab === 'classes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  班级管理
                </button>
                <button 
                  onClick={() => { setClassTab('students'); triggerToast('已为您切换至精细化学生个体学情跟踪仪表盘。'); }}
                  className={`pb-3 text-sm font-bold relative transition-colors cursor-pointer ${
                    classTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  学生管理
                </button>
              </div>
            </div>

            {/* Core Stats Row Cards */}
            <div className="p-6 pb-0 overflow-visible shrink-0 select-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1 */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-3xs">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-icons text-xl">school</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">学生总数</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg md:text-xl font-black text-slate-900">326</span>
                      <span className="text-[10px] text-slate-400 font-bold">人</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">较上月 <span className="text-emerald-500 font-black">+23 人</span></p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-3xs">
                  <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-icons text-xl">schedule</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">本月学习总时长</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg md:text-xl font-black text-slate-900">1,245.6</span>
                      <span className="text-[11px] text-slate-400 font-bold">小时</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">较上月 <span className="text-emerald-500 font-black">+142.3 h</span></p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-3xs">
                  <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-icons text-xl">bar_chart</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">平均掌握度</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg md:text-xl font-black text-slate-900">72%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">较上月 <span className="text-emerald-500 font-black">+6%</span></p>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-3xs">
                  <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <span className="material-icons text-xl">assignment_turned_in</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">平均完成率</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg md:text-xl font-black text-slate-900">85%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">较上月 <span className="text-emerald-500 font-black">+7%</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area based on sub-tabs */}
            {classTab === 'classes' ? (
              /* Class Grid management */
              <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classesList.map(cl => (
                    <div key={cl.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs flex flex-col hover:border-blue-400 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                          {cl.id.toUpperCase()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedClassId(cl.id);
                              setClassTab('students');
                              triggerToast(`已成功转跳至 ${cl.name} 详情。`);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            管理名单
                          </button>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base">{cl.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        校级：{cl.college} · 规制规模：{cl.count}人
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500 font-bold">
                        <div>
                          <span className="text-slate-450 block text-[10px] tracking-wide mb-0.5">平均掌握度</span>
                          <span className="text-slate-800 text-sm font-black">74.5%</span>
                        </div>
                        <div>
                          <span className="text-slate-450 block text-[10px] tracking-wide mb-0.5">已提交习题</span>
                          <span className="text-slate-800 text-sm font-black">15 / 16 套</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Create Class trigger card */}
                  <div 
                    onClick={() => {
                      const name = prompt('请输入新建行政班级名称:');
                      if (name && name.trim()) {
                        const newId = 'c' + (classesList.length + 1);
                        setClassesList([...classesList, { id: newId, name: name.trim(), count: 40, college: '计算机学院' }]);
                        triggerToast(`🎉 成功录入新班级: ${name}`, 'success');
                      }
                    }}
                    className="bg-dashed border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center gap-3 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50/10 cursor-pointer group transition-all"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 group-hover:border-blue-500 flex items-center justify-center text-xl font-bold">
                      +
                    </div>
                    <span className="text-xs md:text-sm font-black">新建班级档案</span>
                    <span className="text-[10px] font-medium text-slate-400">一键与学情核心雷达自匹配绑定</span>
                  </div>

                </div>
              </div>
            ) : (
              <>
                {/* Student Management Column splits (Table + Right drawer) */}
                <div className="flex-1 flex p-6 gap-6 relative select-none bg-gray-100">
                
                {/* 1. Left Class Sidebar Panel */}
                <div className="w-64 bg-white border border-slate-200 rounded-xl flex flex-col shrink-0 overflow-hidden shadow-sm">
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 bg-white">
                    <h2 className="font-bold text-slate-805 text-sm shrink-0">班级列表</h2>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button 
                        onClick={() => triggerToast('📌 班籍列表同步：最新全真名册同步就绪。')}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer flex items-center justify-center shrink-0 w-7 h-7 hover:bg-slate-100 transition-colors"
                        title="刷新"
                      >
                        <span className="material-icons text-sm leading-none">refresh</span>
                      </button>
                      <button 
                        onClick={() => {
                          const name = prompt('请输入新行政班级名称 (e.g. 2024级软件工程3班):');
                          if (name && name.trim()) {
                            const newId = 'c' + (classesList.length + 1);
                            setClassesList([...classesList, { id: newId, name: name.trim(), count: 40, college: '计算机学院' }]);
                            setSelectedClassId(newId);
                            triggerToast(`🎉 成功录入新行政班级: ${name}`, 'success');
                          }
                        }}
                        className="flex items-center gap-0.5 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-xs leading-none transition-colors cursor-pointer shrink-0 h-7"
                      >
                        <span className="material-icons text-xs leading-none">add</span>新建
                      </button>
                    </div>
                  </div>

                  {/* Class selection links list */}
                  <div className="flex-1 p-2 space-y-1 bg-white">
                    <button 
                      onClick={() => setSelectedClassId('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                        selectedClassId === 'all' 
                          ? 'bg-blue-50/85 text-blue-600 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">全部班级 (8)</span>
                    </button>

                    {classesList.map((cl) => {
                      const isSelected = selectedClassId === cl.id;
                      return (
                        <button
                          key={cl.id}
                          onClick={() => {
                            setSelectedClassId(cl.id);
                            // Auto select first student in class
                            const classStudents = studentsList.filter(s => s.classId === cl.id);
                            if (classStudents.length > 0) {
                              setCurrentSelectedStudentId(classStudents[0].id);
                            }
                            triggerToast(`已调取${cl.name}名册。`);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50/80 text-blue-600 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm truncate pr-1" title={cl.name}>
                            {cl.name}
                          </span>
                          <span className="text-xs text-gray-400 font-normal shrink-0">
                            {cl.count}人
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-slate-200 text-center bg-white shrink-0">
                    <button 
                      onClick={() => triggerToast('批量班级重构功能目前处于锁定状态。')}
                      className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-4 py-1.5 w-full hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      批量管理班级
                    </button>
                  </div>
                </div>

                {/* 2. Middle Student Table Panel */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm h-auto min-h-fit">
                  
                  {/* Table Toolbar Header */}
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium text-gray-800">
                        {selectedClassId === 'all' 
                          ? '2024级计算机1班 (46人)' 
                          : `${classesList.find(c => c.id === selectedClassId)?.name} (${studentsList.filter(s => s.classId === selectedClassId).length}人)`} 
                      </h2>
                      <span className="material-icons text-gray-400 cursor-pointer">keyboard_arrow_down</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm select-none">
                      <button 
                        onClick={() => {
                          const n = prompt('请输入新学生姓名:');
                          const id = prompt('请输入新学生学号 (e.g. 2024011):');
                          if (n && id) {
                            const newS = {
                              id: 's' + (studentsList.length + 1),
                              classId: selectedClassId === 'all' ? 'c1' : selectedClassId,
                              name: n,
                              studentId: id,
                              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                              studyHours: 0,
                              mastery: 50,
                              completion: 0,
                              status: '活跃' as const,
                              grade: '中等' as const
                            };
                            setStudentsList([...studentsList, newS]);
                            setCurrentSelectedStudentId(newS.id);
                            triggerToast(`🎉 成功导入新学生: ${n}`, 'success');
                          }
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        导入学生
                      </button>
                      <button 
                        onClick={() => triggerToast('📤 导出本名单 Excel 配置就绪...')}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        导出名单
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedStudents.length === 0) {
                            triggerToast('请优先从左侧勾选复选学子进行调配班级！', 'error');
                            return;
                          }
                          const target = prompt('请输入拟转入目标班级编号 (eg. c1 - c8):');
                          if (target) {
                            setStudentsList(studentsList.map(s => selectedStudents.includes(s.id) ? { ...s, classId: target } : s));
                            setSelectedStudents([]);
                            triggerToast('调整班籍指令调配完毕！', 'success');
                          }
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        调整班级
                      </button>
                      <button 
                        onClick={() => triggerToast('批量状态转移与调解接口就位。')}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                      >
                        批量操作 <span className="material-icons text-sm">keyboard_arrow_down</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="p-4 flex flex-wrap items-center gap-4 bg-gray-50 border-b border-slate-200 shrink-0 select-text">
                    <div className="relative flex-1 min-w-[200px]">
                      <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                      <input 
                        value={studentSearchInput}
                        onChange={(e) => setStudentSearchInput(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 font-medium" 
                        placeholder="搜索学生姓名、学号" 
                        type="text"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">学习状态:</span>
                      <select 
                        value={statusFilterValue} 
                        onChange={(e) => setStatusFilterValue(e.target.value)}
                        className="border-gray-300 rounded text-sm py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                      >
                        <option value="全部">全部</option>
                        <option value="活跃">活跃</option>
                        <option value="一般">一般</option>
                        <option value="待提升">待提升</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">学习掌握度:</span>
                      <select 
                        value={masteryFilterValue}
                        onChange={(e) => setMasteryFilterValue(e.target.value)}
                        className="border-gray-300 rounded text-sm py-1.5 pl-3 pr-8 focus:ring-blue-550 focus:border-blue-550 font-medium bg-white"
                      >
                        <option value="全部">全部</option>
                        <option value="良好">良好</option>
                        <option value="中等">中等</option>
                        <option value="较差">较差</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        triggerToast('已为您刷新智能诊断过滤视图。');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 bg-white rounded hover:bg-gray-50 ml-auto font-medium cursor-pointer"
                    >
                      <span className="material-icons text-sm">filter_alt</span> 筛选
                    </button>
                  </div>

                  {/* Student Table core exactly replicating mockup rows */}
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full text-left border-collapse select-none">
                      <thead>
                        <tr className="bg-gray-50 border-b border-slate-200 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-4 w-12 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                              checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(filteredStudents.map(st => st.id));
                                } else {
                                  setSelectedStudents([]);
                                }
                              }}
                            />
                          </th>
                          <th className="p-4 font-medium">学生信息</th>
                          <th className="p-4 font-medium">学习时长 <span className="text-gray-400 font-normal">(本学期)</span></th>
                          <th className="p-4 font-medium">平均掌握度</th>
                          <th className="p-4 font-medium">完成率</th>
                          <th className="p-4 font-medium">学习状态</th>
                          <th className="p-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-200 bg-white">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-xs text-gray-400 font-medium leading-relaxed">
                              ⚠️ 暂无满足当前检索筛选条件学生记录
                            </td>
                          </tr>
                        ) : (
                          currentStudentsShown.map((student, idx) => {
                            const isCurrentlyViewed = currentSelectedStudentId === student.id;
                            
                            // Colors based on mockup styling exactly
                            let masteryColor = 'bg-yellow-100 text-yellow-700';
                            if (student.grade === '良好') masteryColor = 'bg-green-100 text-green-700';
                            if (student.grade === '中等') masteryColor = 'bg-yellow-100 text-yellow-700';
                            if (student.grade === '较差') masteryColor = 'bg-red-100 text-red-700';
                            
                            let statusBadge = 'bg-gray-100 text-gray-700';
                            if (student.status === '活跃') statusBadge = 'text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-200';
                            if (student.status === '一般') statusBadge = 'text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200';
                            if (student.status === '待提升') statusBadge = 'text-red-600 bg-red-50 px-2 py-1 rounded text-xs border border-red-250';

                            let progressColor = 'bg-blue-500';
                            if (student.completion > 85) progressColor = 'bg-green-500';
                            if (student.completion < 65) progressColor = 'bg-red-500';

                            return (
                              <tr 
                                key={student.id} 
                                onClick={() => {
                                  setCurrentSelectedStudentId(student.id);
                                  setStudentDetailPanelOpen(true);
                                }}
                                className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                                  isCurrentlyViewed 
                                    ? 'bg-blue-50/30' 
                                    : ''
                                }`}
                              >
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-gray-400 font-medium">{indexOfFirstStudent + idx + 1}</span>
                                </td>
                                
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      alt={student.name} 
                                      className="w-8 h-8 rounded-full object-cover border border-slate-105 shadow-sm" 
                                      referrerPolicy="no-referrer"
                                      src={student.avatar} 
                                    />
                                    <div>
                                      <p className="font-medium text-gray-800">{student.name}</p>
                                      <p className="text-xs text-gray-500">学号: {student.studentId}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4 text-gray-605 font-medium">{student.studyHours} 小时</td>
                                
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{student.mastery}%</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${masteryColor}`}>
                                      {student.grade}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-4">
                                  <div className="flex flex-col gap-1 w-24">
                                    <div className="flex justify-between text-xs">
                                      <span className="font-medium text-gray-800">{student.completion}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${progressColor} rounded-full transition-all`} 
                                        style={{ width: `${student.completion}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4">
                                  <span className={statusBadge}>
                                    {student.status}
                                  </span>
                                </td>

                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => {
                                        setCurrentSelectedStudentId(student.id);
                                        setStudentDetailPanelOpen(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                                    >
                                      查看详情
                                    </button>
                                    
                                    <button 
                                      onClick={() => {
                                        triggerToast(`更多操作配置中...`);
                                      }}
                                      className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                      title="更多操作"
                                    >
                                      <span className="material-icons text-sm block leading-none">more_horiz</span>
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-gray-500 shrink-0 bg-white">
                    <div>共 {filteredStudents.length} 条</div>
                    <div className="flex items-center gap-2 animate-fadeIn">
                      <button 
                        disabled={studentsCurrentPage === 1}
                        onClick={() => setStudentsCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer flex items-center justify-center border border-slate-200 bg-white shadow-3xs"
                      >
                        <span className="material-icons text-sm">chevron_left</span>
                      </button>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) || 1 }, (_, index) => {
                          const pageNum = index + 1;
                          const isSelected = studentsCurrentPage === pageNum;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setStudentsCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center ${
                                isSelected
                                  ? 'border border-blue-500 text-blue-600 bg-blue-50/50 font-extrabold'
                                  : 'border border-slate-200 text-slate-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        disabled={studentsCurrentPage >= Math.ceil(filteredStudents.length / studentsPerPage)}
                        onClick={() => setStudentsCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / studentsPerPage)))}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer flex items-center justify-center border border-slate-200 bg-white shadow-3xs"
                      >
                        <span className="material-icons text-sm">chevron_right</span>
                      </button>
                      <div className="ml-4 flex items-center gap-2">
                        <select 
                          value={studentsPerPage}
                          onChange={(e) => {
                            setStudentsPerPage(Number(e.target.value));
                          }}
                          className="border-gray-200 border rounded py-1 pl-2 pr-6 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white font-medium cursor-pointer"
                        >
                          <option value={10}>10 条/页</option>
                          <option value={20}>20 条/页</option>
                          <option value={50}>50 条/页</option>
                        </select>
                        <span>跳至</span>
                        <input 
                          className="w-12 border border-gray-300 rounded py-1 px-2 text-center focus:ring-blue-500 focus:border-blue-500" 
                          type="text" 
                          value={studentsCurrentPage} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const maxPage = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
                            if (val >= 1 && val <= maxPage) {
                              setStudentsCurrentPage(val);
                            }
                          }}
                        />
                        <span>页</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Floating Modal Detailed Panel */}
                {studentDetailPanelOpen && (
                  <div 
                    className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-2xs select-text"
                    onClick={() => setStudentDetailPanelOpen(false)}
                  >
                    <div 
                      className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slideUp text-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      
                      {/* Panel Header */}
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                        <h2 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                          学生学务画像
                        </h2>
                        <button 
                          onClick={() => setStudentDetailPanelOpen(false)}
                          className="text-slate-400 hover:text-slate-650 font-black text-xl hover:bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="关闭"
                        >
                          ×
                        </button>
                      </div>

                      {/* Scrollable Contents area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] text-slate-700">
                      
                      {/* Personal card basic information */}
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/85">
                        <img 
                          alt={currentStudent.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0" 
                          referrerPolicy="no-referrer"
                          src={currentStudent.avatar} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-slate-950 text-base md:text-lg">{currentStudent.name}</h3>
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                              {currentStudent.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-bold font-mono mt-1">学号: {currentStudent.studentId}</p>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">班级: {classesList.find(c => c.id === currentStudent.classId)?.name || '精品一班'}</p>
                        </div>
                      </div>

                      {/* Detail tabs navigation */}
                      <div className="flex border-b border-slate-100 shrink-0 text-xs font-bold font-sans">
                        <button 
                          onClick={() => setStudentDetailSubTab('overview')}
                          className={`flex-1 pb-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                            studentDetailSubTab === 'overview' ? 'text-blue-600 border-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          学习概览
                        </button>
                        <button 
                          onClick={() => { setStudentDetailSubTab('path'); triggerToast('自组织学习路径拓扑正在同步。'); }}
                          className={`flex-1 pb-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                            studentDetailSubTab === 'path' ? 'text-blue-600 border-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          学习路径
                        </button>
                        <button 
                          onClick={() => { setStudentDetailSubTab('mistakes'); triggerToast('正调取大模型汇聚错题日志...'); }}
                          className={`flex-1 pb-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                            studentDetailSubTab === 'mistakes' ? 'text-blue-600 border-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          错题记录
                        </button>
                        <button 
                          onClick={() => { setStudentDetailSubTab('assignments'); triggerToast('正在加载习题代码与评测编辑器...'); }}
                          className={`flex-1 pb-2.5 border-b-2 text-center transition-colors cursor-pointer ${
                            studentDetailSubTab === 'assignments' ? 'text-blue-600 border-blue-600 font-black' : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          作业批阅
                        </button>
                      </div>

                      {/* Switch content based on detailed tabs */}
                      {studentDetailSubTab === 'overview' && (
                        <>
                          {/* Profile Overview Indicators Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold mb-0.5">本期用时</p>
                              <div className="flex items-baseline gap-0.5 font-mono">
                                <span className="text-sm md:text-base font-black text-slate-900">{currentStudent.studyHours}</span>
                                <span className="text-[9px] text-slate-400 font-bold">h</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold mb-0.5">掌握程度</p>
                              <div className="flex items-baseline gap-0.5 font-sans">
                                <span className="text-sm md:text-base font-black text-slate-900">{currentStudent.mastery}%</span>
                                <span className="text-[9px] text-emerald-600 font-black">良</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold mb-0.5">题本完成率</p>
                              <div className="flex items-baseline gap-0.5 font-mono">
                                <span className="text-sm md:text-base font-black text-slate-900">{currentStudent.completion}%</span>
                              </div>
                            </div>
                          </div>

                          {/* SVG Trend chart exactly replicating screenshot layout with high fidelity points */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/75 relative">
                            <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center justify-between">
                              <span>技能成熟度曲线 (近 8 周)</span>
                              <span className="text-[10px] text-slate-400 font-bold">AI拟合：Dijkstra</span>
                            </h4>
                            
                            <div className="h-32 w-full relative pb-4 pl-4 font-mono select-none">
                              {/* Y-axis metrics */}
                              <div className="absolute -left-1 bottom-1 flex flex-col justify-between h-full text-[8px] text-slate-400 font-semibold select-none leading-none">
                                <span>100%</span>
                                <span>75%</span>
                                <span>50%</span>
                                <span>25%</span>
                                <span>0%</span>
                              </div>

                              {/* Target SVG lines with dynamic curve based on current student */}
                              <div className="w-full h-full border-b border-l border-slate-200 relative">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                  {/* Grid Lines */}
                                  <line stroke="#e2e8f0" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25" strokeDasharray="3,3"></line>
                                  <line stroke="#e2e8f0" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50" strokeDasharray="3,3"></line>
                                  <line stroke="#e2e8f0" strokeWidth="0.5" x1="0" x2="100" y1="75" y2="75" strokeDasharray="3,3"></line>
                                  
                                  {/* Area cover */}
                                  <polygon 
                                    fill="#ecfdf5" 
                                    opacity="0.6" 
                                    points={`0,100 ${studentTrends[currentStudent.id] || '0,75 20,70 40,65 60,50 80,45 100,40'},100`}
                                  ></polygon>
                                  
                                  {/* Trend outline polyline */}
                                  <polyline 
                                    fill="none" 
                                    points={studentTrends[currentStudent.id] || '0,75 15,70 30,68 45,60 60,50 75,45 90,40 100,35'} 
                                    stroke="#10b981" 
                                    strokeWidth="1.8"
                                  ></polyline>

                                  {/* Dots rendering */}
                                  <circle cx="0" cy="40" fill="#10b981" r="2.2"></circle>
                                  <circle cx="15" cy="35" fill="#10b981" r="2.2"></circle>
                                  <circle cx="30" cy="38" fill="#10b981" r="2.2"></circle>
                                  <circle cx="45" cy="25" fill="#10b981" r="2.2"></circle>
                                  <circle cx="60" cy="25" fill="#10b981" r="2.2"></circle>
                                  <circle cx="75" cy="22" fill="#10b981" r="2.2"></circle>
                                  <circle cx="90" cy="15" fill="#10b981" r="2.2"></circle>
                                  <circle cx="100" cy="15" fill="#10b981" r="2.2"></circle>
                                </svg>
                              </div>

                              {/* X-axis dates labels */}
                              <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-[8px] text-slate-400 font-bold tracking-tight px-1 select-none">
                                <span>03-24</span>
                                <span>04-07</span>
                                <span>04-21</span>
                                <span>05-05</span>
                                <span>05-12</span>
                              </div>
                            </div>
                          </div>

                          {/* Recent submit assignments list */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-extrabold text-slate-900">课后随堂作业报告</h4>
                              <button 
                                onClick={() => setStudentDetailSubTab('assignments')}
                                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer border-none bg-none"
                              >
                                查看全部
                              </button>
                            </div>
                            
                            <div className="space-y-2.5 text-xs font-semibold text-slate-800">
                              {currentAssignments.map((as, inx) => (
                                <div key={inx} className="flex items-center justify-between border-l-2 border-blue-500 pl-3 py-1 bg-slate-50/50 rounded-r-lg">
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">{as.title}</p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">{as.time}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold border border-green-200 font-sans">
                                      {as.status}
                                    </span>
                                    <span className="text-xs md:text-sm font-black text-slate-900 font-mono">{as.score}分</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recent dynamic timeline */}
                          <div className="space-y-3 text-left">
                            <h4 className="text-xs font-extrabold text-slate-900">同步学情观测轨迹</h4>
                            <ul className="space-y-3 text-xs leading-5">
                              {currentActivities.map((act, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-800 font-bold text-[11px] truncate">{act.title}</p>
                                    <span className="text-[9px] text-slate-405 font-bold font-mono mt-0.5 inline-block">{act.time}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                
                
                      {/* Close the overview subtab fragment and conditional */}
                        </>
                      )}

                      {studentDetailSubTab === 'path' && (
                        <div className="space-y-4 animate-fadeIn text-left text-xs bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-3">
                            <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
                            自组学习路径拓扑
                          </h4>
                          <div className="space-y-4 relative pl-6 border-l border-dashed border-blue-200">
                            <div className="relative">
                              <span className="absolute -left-[29px] top-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white shadow-xs flex items-center justify-center">
                                <span className="text-[8px] text-white font-mono font-bold">✓</span>
                              </span>
                              <h5 className="font-extrabold text-slate-850">已攻克：栈和单循环链表基本原理</h5>
                              <p className="text-slate-405 mt-0.5">完成度 100% · 耗时 2.5h</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-[29px] top-0 w-3.5 h-3.5 bg-blue-500 rounded-full border border-white shadow-xs animate-pulse"></span>
                              <h5 className="font-extrabold text-slate-850">当前进行：LinkQueue 队尾节点环形连通测试</h5>
                              <p className="text-slate-505 mt-0.5">已学完 60% · 核心诊断进行中</p>
                            </div>
                            <div className="relative opacity-65">
                              <span className="absolute -left-[29px] top-0 w-3.5 h-3.5 bg-slate-300 rounded-full border border-white shadow-xs"></span>
                              <h5 className="font-semibold text-slate-750">下一目标：深空网络平衡二叉树结构算法</h5>
                              <p className="text-slate-405 mt-0.5">未解锁</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {studentDetailSubTab === 'mistakes' && (
                        <div className="space-y-3 animate-fadeIn text-left text-xs">
                          <div className="flex items-center justify-between mb-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <h4 className="font-extrabold text-slate-905">大模型诊断纠偏错题集</h4>
                            <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100 font-black">
                              易错雷达点: 2 个
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            <div className="p-3 border border-red-100 rounded-xl bg-red-50/10">
                              <span className="text-red-600 font-extrabold block text-[10px]">【循环链表越界】判定指针失效</span>
                              <p className="text-slate-600 font-semibold mt-1 leading-relaxed">容易将 Q.front === Q.rear 设为全局循环终止，忽略了高并发重叠时的引用失效校验。</p>
                            </div>
                            <div className="p-3 border border-slate-150 rounded-xl bg-slate-50/20">
                              <span className="text-slate-500 font-extrabold block text-[10px]">【顺序存储表】静态动态混淆溢出</span>
                              <p className="text-slate-600 font-semibold mt-1 leading-relaxed">在满度测试时由于未执行强截断机制，指针继续偏移导致内存区间读取产生脏数据。</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {studentDetailSubTab === 'assignments' && (
                        <div className="space-y-4 animate-fadeIn text-left text-xs">
                          <div className="p-4 rounded-2xl border border-slate-150 space-y-4 bg-slate-50/50">
                            <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
                              设定评分成果与反馈
                            </h5>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-slate-500 font-extrabold">技能掌握程度估计</span>
                                <span className="text-sm font-black text-blue-600 font-mono">{inputScoreValue} 分</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={inputScoreValue} 
                                onChange={(e) => setInputScoreValue(Number(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-500 font-extrabold">教师精准提效点评</label>
                              <textarea 
                                value={inputScoreComment}
                                onChange={(e) => setInputScoreComment(e.target.value)}
                                rows={3}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold bg-white text-slate-750"
                                placeholder="点批核心语句和时空瓶颈..."
                              />
                            </div>

                            <button 
                              onClick={() => {
                                setStudentsList(prev => prev.map(s => s.id === currentStudent.id ? { ...s, mastery: inputScoreValue } : s));
                                playChime();
                                triggerToast(`🎉 成功录入 ${currentStudent.name} 的学情评阅，分数: ${inputScoreValue}分！`, 'success');
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-center py-2.5 rounded-xl shadow-md transition-colors cursor-pointer border-none"
                            >
                              保存并通知学生
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              </div>
            </>
          )}

          </main>
        ) : activeSidebarView === 'homework' ? (
          /* ══════════════════════════════════════════════════════════════════
             REAL HIGH-FIDELITY TEACHER WORKSTATION HOMEWORK MANAGEMENT (作业管理)
             ══════════════════════════════════════════════════════════════════ */
          <main id="homework-management-view" className="flex-1 flex flex-col bg-slate-50 text-slate-850 select-none animate-fadeIn font-sans h-auto min-h-screen">
            
            {/* 1. TOP STATS BAR WITH FILTER TABS */}
            <div className="bg-white px-6 pt-5 pb-0 border-b border-slate-200 shrink-0 shadow-3xs text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                    作业管理
                  </h1>
                  <p className="text-xs text-slate-405 font-semibold mt-1">
                    布置课程章末测验、微练习，支持AI自动辅助、交互批阅纠偏、多维学情诊断。
                  </p>
                </div>
                
                {/* Visual Category summary counts from mockup */}
                <div className="flex items-center gap-2 text-xs font-semibold mt-2 md:mt-0">
                  <span className="text-slate-400 font-bold shrink-0">过滤状态:</span>
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['全部', '待发布', '进行中', '已结束', '草稿'].map(stFilter => {
                      const counts: { [key: string]: number } = { '全部': 32, '待发布': 6, '进行中': 12, '已结束': 14, '草稿': 3 };
                      return (
                        <button 
                          key={stFilter}
                          onClick={() => setHomeworkStatusFilter(stFilter)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all border-none bg-transparent cursor-pointer ${
                            homeworkStatusFilter === stFilter 
                              ? 'bg-white text-blue-600 shadow-3xs font-black' 
                              : 'text-slate-500 hover:text-slate-850'
                          }`}
                        >
                          {stFilter} ({counts[stFilter]})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. THREE COLUMN SCENARIO */}
            <div className="flex-grow flex flex-col xl:flex-row p-4 gap-4 h-auto min-h-0 overflow-visible">
              
              {/* LEFT COLUMN: ASSIGNMENT LIST CARD INDEX */}
              <div className="w-[300px] bg-white rounded-2xl shadow-3xs border border-slate-150 flex flex-col shrink-0 overflow-hidden text-left">
                
                {/* Toolbar searching & controls */}
                <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <Search className="w-3.5 h-3.5 text-slate-405" />
                      </span>
                      <input 
                        type="text" 
                        value={homeworkSearchTerm}
                        onChange={(e) => setHomeworkSearchTerm(e.target.value)}
                        placeholder="搜索作业名称..."
                        className="w-full pl-8 pr-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-205 outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-705"
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        setHomeworkSearchTerm('');
                        setHomeworkStatusFilter('全部');
                        triggerToast('🔄 重置列表过滤条件成功');
                      }}
                      className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                      title="重置"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsAddHomeworkModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    创建作业
                  </button>
                </div>

                {/* Vertical Scrollable Assignment List */}
                <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar bg-slate-50/60">
                  {homeworkList
                    .filter(h => {
                      const matchSearch = h.title.toLowerCase().includes(homeworkSearchTerm.toLowerCase()) || h.course.toLowerCase().includes(homeworkSearchTerm.toLowerCase());
                      const matchStatus = homeworkStatusFilter === '全部' || h.status === homeworkStatusFilter;
                      return matchSearch && matchStatus;
                    })
                    .map((item) => {
                      const isSelected = item.id === selectedHomeworkId;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setSelectedHomeworkId(item.id);
                            setCurrentCenterTab('作业概览');
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                            isSelected 
                              ? 'bg-blue-50/70 border-blue-405 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-350'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <h3 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1 flex-1 pr-1">
                              {item.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] rounded shrink-0 font-bold ${
                              item.status === '进行中' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : item.status === '待发布'
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : item.status === '草稿'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-gray-200 text-slate-600 border border-gray-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black max-w-full truncate font-sans">
                              {item.course}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2 mt-2 font-mono">
                            <span>提交: <strong className="text-slate-700">{item.submittedCount}</strong>/{item.totalCount}人</span>
                            <span className="text-blue-600 font-extrabold">{item.avgScore > 0 ? `${item.avgScore}分` : '待评'}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* CENTER COLUMN: OVERVIEWS, DETAILS & STATS CORES */}
              {(() => {
                const currentHomework = homeworkList.find(h => h.id === selectedHomeworkId) || homeworkList[0];
                if (!currentHomework) {
                  return (
                    <div className="flex-1 bg-white rounded-3xl shadow-3xs border border-slate-150 flex flex-col items-center justify-center p-8 select-none text-slate-400 text-center">
                      <AlertCircle className="w-10 h-10 text-slate-200 mb-2" />
                      <p className="text-xs font-bold text-slate-400">暂无可展示的作业活动项</p>
                    </div>
                  );
                }

                return (
                  <div className="flex-grow bg-white rounded-2xl shadow-3xs border border-slate-150 flex flex-col overflow-hidden text-left min-w-[320px]">
                    
                    {/* Course outline identifier */}
                    <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/20 text-left">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] bg-blue-55 text-blue-600 px-2 py-0.5 rounded font-black border border-blue-105 font-sans uppercase">
                          {currentHomework.course}
                        </span>
                        <span className="text-[10px] bg-slate-50 text-slate-405 px-2 py-0.5 rounded font-bold border border-slate-200">
                          {currentHomework.chapter}
                        </span>
                      </div>
                      
                      <h2 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-1">
                        <span className="material-icons text-blue-600 text-sm">assignment</span>
                        {currentHomework.title}
                      </h2>
                      
                      {/* Nav Tabs conforming to mockup visual header */}
                      <div className="flex gap-4 border-b border-slate-150 pt-3 mt-1 text-xs select-none">
                        {['作业概览', '题目预览', `提交情况`, '成绩统计', '批改设置'].map(tabLabel => {
                          const simpleName = tabLabel.startsWith('提交情况') ? '提交情况' : tabLabel;
                          const isActive = currentCenterTab === simpleName;
                          const displayText = tabLabel.startsWith('提交情况') ? `提交情况 (${currentHomework.submittedCount})` : tabLabel;
                          return (
                            <button
                              key={tabLabel}
                              onClick={() => setCurrentCenterTab(simpleName)}
                              className={`pb-1.5 font-bold transition-all border-none bg-none cursor-pointer ${
                                isActive 
                                  ? 'text-blue-600 border-b-2 border-blue-600 font-black' 
                                  : 'text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {displayText}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable contents customized by Selected tab */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0">
                      
                      {currentCenterTab === '作业概览' && (
                        <div className="space-y-4 animate-fadeIn">
                          {/* Top row mini info tags */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-bold block">提交进度</span>
                              <span className="text-xs md:text-sm font-mono font-black text-slate-800 block mt-0.5">
                                {currentHomework.submittedCount} / {currentHomework.totalCount}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-bold block">班级均分</span>
                              <span className="text-xs md:text-sm font-mono font-black text-blue-600 block mt-0.5">
                                {currentHomework.avgScore}分
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-bold block">最高均分</span>
                              <span className="text-xs md:text-sm font-mono font-black text-green-600 block mt-0.5">
                                {currentHomework.avgScore > 0 ? 98 : 0}分
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                              <span className="text-[10px] text-slate-400 font-bold block">批改状态</span>
                              <span className="text-[10px] font-black text-slate-650 block mt-1">
                                AI辅助中
                              </span>
                            </div>
                          </div>

                          {/* Normal Distribution represented as a mini responsive CSS bar chart */}
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 text-left">
                            <div className="flex items-center justify-between mb-3 text-xs select-none">
                              <h4 className="font-extrabold text-slate-705">均分学情分布直方曲线</h4>
                              <span className="text-[10px] text-slate-400 font-bold">符合高斯常态分派</span>
                            </div>
                            <div className="h-24 flex items-end justify-between px-2 pb-1 border-b border-slate-200">
                              {[3, 8, 14, 25, 12].map((val, index) => {
                                const labels = ['0-59', '60-69', '70-79', '80-89', '90-100'];
                                return (
                                  <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer mx-1">
                                    <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-transform whitespace-nowrap shadow-sm z-50">
                                      {labels[index]}分: {val}人
                                    </div>
                                    <div 
                                      style={{ height: `${Math.max((val / 25) * 65, 4)}px` }}
                                      className={`w-full rounded-t transition-all ${
                                        index === 3 ? 'bg-blue-500' : index === 4 ? 'bg-emerald-500' : 'bg-slate-300'
                                      }`}
                                    ></div>
                                    <span className="text-[8px] text-slate-400 font-bold mt-1 whitespace-nowrap">{labels[index]}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Base deadline notification */}
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-850 font-semibold select-text leading-relaxed">
                            <span className="material-icons text-orange-500 text-sm mt-0.5">info_outline</span>
                            <div>
                              <p className="font-bold">到期截止督责提醒：</p>
                              <p className="text-[11px] text-orange-705 mt-0.5 font-medium">该测验方案将于 {currentHomework.deadline} 自动结课。届时将自动计算班级加权分，并锁定代码作业提交权限。</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentCenterTab === '题目预览' && (
                        <div className="space-y-3 animate-fadeIn text-left text-xs">
                          <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1.5">
                            <div className="flex items-center justify-between"><span className="text-[10px] text-blue-600 font-black">【一、核心客观选择】第 1 题 / 10分</span><span className="text-slate-400 font-bold">单选</span></div>
                            <h4 className="font-bold text-slate-800 text-xs">Q1. 栈和队列这两个经典线性数据结构的共同特征是：</h4>
                            <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-500 space-y-1">
                              <p>A. 所有的元素都可以在首端任何索引写入</p>
                              <p className="text-emerald-700 font-bold">B. 存取受限在两个指定的顶端端点进行 (正确选项)</p>
                            </div>
                          </div>

                          <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1.5">
                            <div className="flex items-center justify-between"><span className="text-[10px] text-blue-600 font-black">【二、程序解答题】第 6 题 / 30分</span><span className="text-slate-400 font-bold">算法大题</span></div>
                            <h4 className="font-bold text-slate-800 text-xs">Q6. 编写底层 LinkQueue 单循环链表的入队（EnQueue）实现。</h4>
                          </div>
                        </div>
                      )}

                      {currentCenterTab === '提交情况' && (
                        <div className="space-y-3 animate-fadeIn text-xs text-left">
                          <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider">该作业提交批复登记表</h4>
                          
                          <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                            <table className="w-full text-left font-sans">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-150 text-slate-700">
                                  <th className="p-2.5 font-bold text-[11px]">学生姓名</th>
                                  <th className="p-2.5 font-bold text-[11px]">所属班级</th>
                                  <th className="p-2.5 font-bold text-[11px] text-right">总得分</th>
                                  <th className="p-2.5 text-center font-bold text-[11px]">流程状态</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                                {submittedStudents.map((st, sIndex) => {
                                  const scoreTotal = Object.values(st.scores as Record<string, number>).reduce((a, b) => a + b, 0);
                                  return (
                                    <tr 
                                      key={st.id} 
                                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                                        gradingStudentIndex === sIndex ? 'bg-blue-50/20' : ''
                                      }`}
                                      onClick={() => setGradingStudentIndex(sIndex)}
                                    >
                                      <td className="p-2.5 flex items-center gap-2">
                                        <img src={st.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                                        <span className="font-bold text-slate-800">{st.name}</span>
                                      </td>
                                      <td className="p-2.5 text-[11px]">{st.className}</td>
                                      <td className="p-2.5 text-right font-mono font-black text-slate-800">{scoreTotal}分</td>
                                      <td className="p-2.5 text-center">
                                        <span className="text-blue-600 hover:underline font-extrabold text-[11px]">
                                          {gradingStudentIndex === sIndex ? '正在阅卷' : '点击阅卷'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {currentCenterTab === '成绩统计' && (
                        <div className="space-y-4 animate-fadeIn text-xs text-slate-620">
                          <h4 className="font-extrabold text-slate-900 text-sm">均分及优异度诊断大盘</h4>
                          <div className="grid grid-cols-2 gap-3 font-semibold">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left">
                              <span className="text-[10px] text-slate-400 block mb-0.5">优秀学员数 (90分+)</span>
                              <strong className="text-slate-800 text-sm font-mono">11 名 (22%)</strong>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left">
                              <span className="text-[10px] text-slate-400 block mb-0.5">待加强辅导 (60分-)</span>
                              <strong className="text-red-500 text-sm font-mono">2 名 (4%)</strong>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => triggerToast('📥 班级本章测验统计明细报表正在后台生成并导出...')}
                            className="bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors cursor-pointer border-none"
                          >
                            <Download className="w-3.5 h-3.5" /> 导出本班学务报表
                          </button>
                        </div>
                      )}

                      {currentCenterTab === '批改设置' && (
                        <div className="space-y-3.5 animate-fadeIn text-xs text-slate-600 text-left font-semibold">
                          <h4 className="font-extrabold text-slate-900 text-xs">大模型AI辅助及赋分设置</h4>
                          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                            <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                              <span>一键启用 Gemini 自动生成全员代码大题分析推荐</span>
                              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" />
                            </div>
                            <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                              <span>答题雷同超40%自动标记为高优先级人工审阅</span>
                              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })()}

              {/* RIGHT COLUMN: REAL-TIME INDIVIDUAL QUESTION SCORE & FEEDBACK EDITOR */}
              {(() => {
                const activeSt = submittedStudents[gradingStudentIndex] || submittedStudents[0];
                if (!activeSt) return null;

                const staticQuestions: { [key: number]: { title: string, req: string, max: number, ans: string } } = {
                  1: { title: "选择题：指定线性数据结构特征", req: "栈和队列共同的限制是什么？", max: 20, ans: "受限线性表：栈仅在表尾入出，队列仅在表尾入、表头出。" },
                  2: { title: "是非辩证：判断空树及指向", req: "判定循环表前驱及后继结点的引用关系...", max: 20, ans: "该生选择完全符合最优标准。" },
                  3: { title: "简答：单双向物理表防溢出机制", req: "对以下循环队列求模性质，判定是否会假溢出？", max: 10, ans: "该同学正确作答。写有利用取模循环使存储空间顺向首尾重合，避免指针越界的操作。" },
                  4: { title: "计算：循环队列头尾计数", req: "队列头尾front=15, rear=38, 容量40, 求元素长度", max: 20, ans: "(38 - 15 + 40) % 40 = 23。推导清晰！" },
                  5: { title: "概念探讨：先进先出核心特性", req: "请写出单向队列底层的先进先出（FIFO）理学性质。", max: 10, ans: "该学子说明：先压入的代码节点必定先被弹出，出入口分布于两端进行限制。" },
                  6: { title: "算法题：LinkQueue入队代码编写", req: "请编写底层LinkQueue入队的底层核心CPP逻辑。", max: 20, ans: "void EnQueue(LinkQueue &Q, ElemType elem) {\n  QueueNode* s = new QueueNode;\n  s->data = elem; s->next = nullptr;\n  Q.rear->next = s; Q.rear = s; // 完成尾链重连接\n}" }
                };

                const currentQ = staticQuestions[gradingQuestionIndex] || staticQuestions[5];
                const sumScore = Object.values(activeSt.scores as Record<string, number>).reduce((a, b) => a + b, 0);

                return (
                  <div className="w-[330px] bg-white rounded-2xl border border-slate-205 shadow-3xs flex flex-col shrink-0 overflow-hidden text-left">
                    
                    {/* Header pane */}
                    <div className="p-3 border-b border-slate-100 bg-slate-50/40 shrink-0 select-none">
                      <div className="flex justify-between items-center mb-1 bg-transparent">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">交互阅卷编辑器</span>
                        <div className="flex gap-1 items-center font-mono text-[9px]">
                          <button 
                            disabled={gradingStudentIndex === 0} 
                            onClick={() => setGradingStudentIndex(p => p - 1)} 
                            className="px-1.5 py-0.5 border border-slate-200 bg-white rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            &larr;
                          </button>
                          <span className="font-bold text-slate-600 px-1">{gradingStudentIndex + 1} / {submittedStudents.length}</span>
                          <button 
                            disabled={gradingStudentIndex === submittedStudents.length - 1} 
                            onClick={() => setGradingStudentIndex(p => p + 1)} 
                            className="px-1.5 py-0.5 border border-slate-200 bg-white rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <img src={activeSt.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-xs truncate">{activeSt.name}</h3>
                            <p className="text-[9px] text-slate-400 font-medium font-mono truncate">{activeSt.studentId}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-slate-400 font-bold block leading-none">实得分</p>
                          <span className="text-xl font-black text-blue-600 font-mono tracking-tight">{sumScore}</span>
                          <span className="text-[10px] text-slate-450 font-bold">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable inputs wrapper */}
                    <div className="flex-grow overflow-y-auto p-3 space-y-3.5 no-scrollbar min-h-0">
                      
                      {/* Grid题号 1..6 Selector bar */}
                      <div className="space-y-1 select-none">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase">逐题快速选读评分</h4>
                        <div className="grid grid-cols-6 gap-1">
                          {[1, 2, 3, 4, 5, 6].map(qNum => {
                            const isCurrent = gradingQuestionIndex === qNum;
                            const score = activeSt.scores[qNum] || 0;
                            return (
                              <button
                                key={qNum}
                                onClick={() => setGradingQuestionIndex(qNum)}
                                className={`py-1 rounded font-black text-xs border text-center transition-all cursor-pointer ${
                                  isCurrent 
                                    ? 'ring-1 ring-blue-500 border-blue-500 shadow-3xs font-black' 
                                    : 'hover:border-slate-350'
                                } ${score > 10 ? 'bg-green-50 border-green-400 text-green-700' : 'bg-orange-50 border-orange-400 text-orange-700'}`}
                              >
                                {qNum} <span className="text-[8px] font-medium block leading-none">{score}分</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Score editor module box */}
                      <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-150 space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-transparent">
                          <span className="text-[9px] text-slate-400 font-bold max-w-xs truncate">题{gradingQuestionIndex}：{currentQ.title}</span>
                          <span className="text-[9px] text-slate-400 font-black">满分: {currentQ.max}分</span>
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-700 text-[11px]">题目要点：</h4>
                          <div className="bg-white p-2 rounded border border-slate-150 font-semibold text-slate-600 text-[10px] leading-relaxed">
                            {currentQ.req}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-700 text-[11px]">学生作答详情：</h4>
                          <div className="bg-white p-2 rounded border border-slate-150 font-mono text-[10px] text-slate-800 tracking-tight leading-snug break-all max-h-24 overflow-y-auto select-text whitespace-pre-wrap">
                            {activeSt.answers[gradingQuestionIndex] || currentQ.ans}
                          </div>
                        </div>

                        {/* Slider score component */}
                        <div className="bg-white p-2 rounded border border-slate-205">
                          <div className="flex justify-between items-baseline mb-1 font-bold">
                            <span className="text-slate-700 text-[11px]">打分：</span>
                            <span className="text-orange-655 font-mono font-black text-xs">
                              <input 
                                type="number" 
                                min="0" 
                                max={currentQ.max}
                                value={activeSt.scores[gradingQuestionIndex] || 0}
                                onChange={(e) => {
                                  const val = Math.min(Math.max(parseInt(e.target.value) || 0, 0), currentQ.max);
                                  setSubmittedStudents(prev => prev.map((s, idx) => {
                                    if (idx === gradingStudentIndex) {
                                      return { ...s, scores: { ...s.scores, [gradingQuestionIndex]: val } };
                                    }
                                    return s;
                                  }));
                                }}
                                className="w-8 text-center border p-0.5 rounded bg-slate-50 focus:outline-none font-bold"
                              /> / {currentQ.max}分
                            </span>
                          </div>

                          {/* Quick shortcuts */}
                          <div className="flex justify-between items-center gap-1 mt-1 bg-transparent">
                            {[0, Math.floor(currentQ.max / 2), currentQ.max].map(scVal => (
                              <button 
                                key={scVal}
                                onClick={() => {
                                  setSubmittedStudents(prev => prev.map((s, idx) => {
                                    if (idx === gradingStudentIndex) {
                                      return { ...s, scores: { ...s.scores, [gradingQuestionIndex]: scVal } };
                                    }
                                    return s;
                                  }));
                                }}
                                className="flex-1 py-0.5 text-[9px] font-bold border border-slate-200 bg-slate-50 hover:bg-white rounded cursor-pointer text-slate-500"
                              >
                                {scVal} 分
                              </button>
                            ))}
                          </div>

                          {/* Specific feedback input */}
                          <div className="mt-2 text-left">
                            <label className="block text-[8px] font-black text-slate-400 mb-0.5">【逐题针对点评建议】</label>
                            <textarea 
                              value={activeSt.comments[gradingQuestionIndex] || ""}
                              onChange={(e) => {
                                const commentText = e.target.value;
                                setSubmittedStudents(prev => prev.map((s, idx) => {
                                  if (idx === gradingStudentIndex) {
                                    return { ...s, comments: { ...s.comments, [gradingQuestionIndex]: commentText } };
                                  }
                                  return s;
                                }));
                              }}
                              placeholder="大模型匹配中... 输入针对性点评"
                              className="w-full text-[10px] p-1.5 rounded border border-slate-200 focus:outline-none text-slate-705 bg-slate-50 resize-none h-11"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom action buttons */}
                    <div className="p-2 border-t border-slate-200 bg-white grid grid-cols-2 gap-2 shrink-0 select-none">
                      <button 
                        onClick={() => {
                          setSubmittedStudents(prev => prev.map((s, idx) => {
                            if (idx === gradingStudentIndex) {
                              return { ...s, status: "打回" as const };
                            }
                            return s;
                          }));
                          triggerToast(`✏️ 已将学生 ${activeSt.name} 的作业答卷安全打回重做。`);
                        }}
                        className="py-1 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                      >
                        打回重做
                      </button>
                      <button 
                        onClick={() => {
                          playChime();
                          triggerToast(`🎉 成功录入 ${activeSt.name} 本题成绩及随堂纠偏AI评比指数！`, 'success');
                          
                          if (gradingQuestionIndex < 6) {
                            setGradingQuestionIndex(p => p + 1);
                          } else if (gradingStudentIndex < submittedStudents.length - 1) {
                            setGradingStudentIndex(p => p + 1);
                            setGradingQuestionIndex(1); // rollover next student Q1
                            triggerToast(`💡 已自动载入下一名学生：${submittedStudents[gradingStudentIndex + 1].name} 答卷`, 'info');
                          } else {
                            triggerToast(`🥳 本次测验方案答卷全部判完！`, 'success');
                          }
                        }}
                        className="py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-black text-white shadow-md transition-all cursor-pointer text-center border-none"
                      >
                        提交批改
                      </button>
                    </div>

                  </div>
                );
              })()}

            </div>
          </main>
        ) : activeSidebarView === 'resources' ? (
          /* ══════════════════════════════════════════════════════════════════
             REAL HIGH-FIDELITY TEACHER WORKSTATION RESOURCE LIBRARY (资源库)
             ══════════════════════════════════════════════════════════════════ */
          <main className="flex-grow flex flex-col min-h-0 bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans overflow-hidden">
            
            {/* Top Stats Banner */}
            <div className="p-6 pb-4 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-6 h-6 text-blue-600 animate-pulse" />
                  资源库管理
                </h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  按课程分类管理教学资源，支持多种类型资源的上传、在线编辑、快捷关联及管理。
                </p>
              </div>

              {/* Category Counts Summary */}
              <div className="flex gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                <div className="px-2 border-r border-slate-200">
                  <span className="text-slate-400">资源总数:</span>
                  <strong className="text-slate-800 ml-1">{resources.length} 个</strong>
                </div>
                <div className="px-2 border-r border-slate-200">
                  <span className="text-slate-400">分类课程:</span>
                  <strong className="text-slate-800 ml-1">{resourceCourses.length} 门</strong>
                </div>
                <div className="px-2">
                  <span className="text-slate-400">累计容量:</span>
                  <strong className="text-blue-600 ml-1">1.2 GB</strong>
                </div>
              </div>
            </div>

            {/* Sub Filter Action Bar */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between shrink-0">
              
              {/* Dynamic filters matching specifications */}
              <div className="flex flex-wrap gap-2.5 items-center">
                
                {/* Text keywords search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input 
                    type="text"
                    value={resSearchKeyword}
                    onChange={(e) => setResSearchKeyword(e.target.value)}
                    placeholder="搜索资源名称、标签、描述..."
                    className="pl-9 pr-3 py-1.5 w-60 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                  />
                  {resSearchKeyword && (
                    <button 
                      onClick={() => setResSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-350 hover:text-slate-600 text-xs font-bold font-sans"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Course select filter dropdown */}
                <select 
                  value={resCourseFilter}
                  onChange={(e) => setResCourseFilter(e.target.value)}
                  className="border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-650"
                >
                  <option value="全部课程">全部课程</option>
                  {resourceCourses.map(rc => (
                    <option key={rc.name} value={rc.name}>{rc.name}</option>
                  ))}
                </select>

                {/* Resource type filter dropdown */}
                <select 
                  value={resTypeFilter}
                  onChange={(e) => setResTypeFilter(e.target.value)}
                  className="border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-650"
                >
                  <option value="全部资源类型">全部资源类型</option>
                  <option value="教材">教材</option>
                  <option value="PPT">PPT</option>
                  <option value="讲义">讲义</option>
                  <option value="标准代码">标准代码</option>
                  <option value="典型错例">典型错例</option>
                  <option value="练习题">练习题</option>
                </select>

                {/* Tags filter dropdown */}
                <select 
                  value={resTagFilter}
                  onChange={(e) => setResTagFilter(e.target.value)}
                  className="border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-650"
                >
                  <option value="全部标签">全部标签</option>
                  {resourceTags.map(rt => (
                    <option key={rt.name} value={rt.name}>{rt.name}</option>
                  ))}
                </select>

                {(resSearchKeyword || resCourseFilter !== '全部课程' || resTypeFilter !== '全部资源类型' || resTagFilter !== '全部标签') && (
                  <button 
                    onClick={() => {
                      setResSearchKeyword('');
                      setResCourseFilter('全部课程');
                      setResTypeFilter('全部资源类型');
                      setResTagFilter('全部标签');
                      setSelectedResChapter('');
                      setSelectedResTag('');
                      triggerToast('🧹 已重置全部高级搜索筛选条件。');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    重置筛选
                  </button>
                )}
              </div>

              {/* Bulk & Upload Action buttons precisely matching custom mockup */}
              <div className="flex gap-2.5">
                {selectedResIds.length > 0 && (
                  <button 
                    onClick={() => {
                      const count = selectedResIds.length;
                      setResources(prev => prev.filter(r => !selectedResIds.includes(r.id)));
                      setSelectedResIds([]);
                      triggerToast(`🗑️ 批量删除了选中的 ${count} 个教学教案资源。`, 'success');
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-105 border border-red-200 rounded-lg flex items-center transition-all cursor-pointer shadow-3xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    批量删除 ({selectedResIds.length})
                  </button>
                )}

                <button 
                  onClick={() => {
                    if (selectedResIds.length === 0) {
                      triggerToast('💡 请先在列表中勾选要批量导入的资源文件档案。', 'error');
                      return;
                    }
                    triggerToast(`📁 已为您排队批量导入 ${selectedResIds.length} 个资源切片至关联课程教材中。`, 'success');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-705 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center shadow-3xs hover:border-slate-300 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  批量导入
                </button>

                <button 
                  onClick={() => {
                    triggerToast('📥 正在将所选资源库清单及下载链接导出至本地系统 XLS 报表...', 'success');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-705 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center shadow-3xs hover:border-slate-300 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                  批量导出
                </button>

                <button 
                  onClick={handleOpenUploadModal}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1 shrink-0" />
                  上传资源
                </button>
              </div>

            </div>

            {/* Main Category Columns Layout */}
            <div className="flex-grow flex min-h-0 overflow-hidden select-none">

              {/* A. Left category tree panel (256px wide) */}
              <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
                
                {/* Course chapters categories tree */}
                <div className="p-4 border-b border-slate-100 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
                      课程分类
                    </h3>
                    <button 
                      onClick={() => {
                        const name = prompt('请输入新建分类名称：', '新建程序设计基础');
                        if (name) {
                          setResourceCourses(prev => [...prev, { name, count: 0, chapters: [] }]);
                          triggerToast(`🎉 新建课程分类“${name}”成功！`, 'success');
                        }
                      }}
                      className="text-blue-600 text-[10px] font-bold hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> 新建分类
                    </button>
                  </div>

                  {/* Root list tree items */}
                  <div className="space-y-1 text-xs font-semibold text-slate-700">
                    
                    {/* All selection root item */}
                    <div 
                      onClick={() => {
                        setSelectedResCourse('全部课程');
                        setSelectedResChapter('');
                        triggerToast('📂 已切换至展示“全部课程”的教师资源汇总列表');
                      }}
                      className={`flex items-center py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedResCourse === '全部课程' 
                          ? 'bg-blue-50 text-blue-600 font-extrabold' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 mr-1 transition-transform ${selectedResCourse === '全部课程' ? 'rotate-90' : ''}`} />
                      <span>全部课程</span>
                      <span className="text-slate-400 text-[10px] font-bold ml-auto">({resources.length})</span>
                    </div>

                    {/* Standard Course Lists */}
                    <ul className="pl-2 space-y-1">
                      {resourceCourses.map(rc => {
                        const isCourseActive = selectedResCourse === rc.name;
                        const matchCount = resources.filter(r => r.course === rc.name).length;
                        return (
                          <li key={rc.name}>
                            <div 
                              onClick={() => {
                                setSelectedResCourse(rc.name);
                                setSelectedResChapter('');
                                triggerToast(`📂 切换至课程：${rc.name}`);
                              }}
                              className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                                isCourseActive && !selectedResChapter 
                                  ? 'bg-blue-50/70 text-blue-600 font-extrabold' 
                                  : 'hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 mr-1 transition-transform ${isCourseActive ? 'rotate-90' : ''}`} />
                              <span className="truncate flex-1 text-left">{rc.name}</span>
                              <span className="text-slate-400 text-[9px] font-bold ml-1">({matchCount})</span>
                            </div>

                            {/* Sub level chapter trees */}
                            {isCourseActive && rc.chapters.length > 0 && (
                              <ul className="pl-4 mt-1 space-y-0.5 border-l border-slate-100 ml-2">
                                {rc.chapters.map(ch => {
                                  const isChapterActive = selectedResChapter === ch.name;
                                  const matchChCount = resources.filter(r => r.course === rc.name && r.chapter === ch.name).length;
                                  return (
                                    <li 
                                      key={ch.name}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedResChapter(ch.name);
                                        triggerToast(`📂 查看章节：${ch.name}`);
                                      }}
                                      className={`py-1.5 px-2 rounded-md cursor-pointer transition-colors flex justify-between items-center text-[11px] font-medium leading-normal ${
                                        isChapterActive 
                                          ? 'text-blue-600 font-black bg-slate-50' 
                                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span className="truncate pr-2 relative text-left">{ch.name}</span>
                                      <span className="text-slate-400 text-[9px] font-bold shrink-0">({matchChCount})</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                  </div>
                </div>

                {/* B. Tags Management Section */}
                <div className="p-4 flex-grow text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-purple-500 rounded-full"></span>
                      标签管理
                    </h3>
                    <button 
                      onClick={() => {
                        const newTag = prompt('请输入新标签名称：', '随堂测验');
                        if (newTag) {
                          setResourceTags(prev => [...prev, {
                            name: newTag,
                            color: 'bg-indigo-50 text-indigo-600 border border-indigo-150',
                            dot: 'bg-indigo-400',
                            count: 5
                          }]);
                          triggerToast(`🎉 创建新标签“${newTag}”成功！`, 'success');
                        }
                      }}
                      className="text-blue-600 text-[10px] font-bold hover:text-blue-800 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> 新建标签
                    </button>
                  </div>

                  <ul className="text-xs font-semibold text-slate-600 space-y-0.5">
                    <li 
                      onClick={() => {
                        setSelectedResTag('');
                        triggerToast('🏷️ 已清除侧边栏标签过滤筛选。');
                      }}
                      className={`flex items-center py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors ${
                        !selectedResTag ? 'bg-indigo-50/50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 shrink-0"></span>
                      <span>全部标签</span>
                    </li>

                    {resourceTags.map(rt => {
                      const isActive = selectedResTag === rt.name;
                      const countAssigned = resources.filter(r => r.tags.includes(rt.name)).length;
                      return (
                        <li 
                          key={rt.name}
                          onClick={() => {
                            setSelectedResTag(rt.name);
                            triggerToast(`🏷️ 当前仅展示带有“${rt.name}”标签的资源款目`);
                          }}
                          className={`flex items-center py-1 px-2.5 rounded-lg cursor-pointer transition-colors ${
                            isActive ? 'bg-slate-100 text-slate-900 font-extrabold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${rt.dot} mr-2 shrink-0`}></span>
                          <span className="truncate flex-1 text-left">{rt.name}</span>
                          <span className="text-slate-400 text-[9px] font-bold ml-1">({countAssigned})</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>

              {/* B. Right Panel - File details item lists (Flex columns) */}
              <div className="flex-grow flex flex-col min-w-0 bg-white">
                
                {/* Section title & count listing indicator */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 select-none text-left bg-slate-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs md:text-sm font-extrabold text-slate-900">
                      课程资源列表总览
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 shrink-0">
                      共计找到 {filteredResources.length} 项有效条目
                    </span>
                  </div>

                  {/* Active filters breadcrumbs indicators */}
                  <div className="flex gap-1.5 text-[10px] font-extrabold text-blue-600 select-none">
                    {selectedResCourse && <span className="bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-md">课程: {selectedResCourse}</span>}
                    {selectedResChapter && <span className="bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-md">章节: {selectedResChapter}</span>}
                    {selectedResTag && <span className="bg-indigo-50 border border-indigo-100/60 text-indigo-700 px-2 py-0.5 rounded-md">标签: {selectedResTag}</span>}
                  </div>
                </div>

                {/* Main Table Content section (scrollable layout) */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                  {filteredResources.length === 0 ? (
                    <div className="py-24 text-center select-none font-sans flex flex-col items-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50/80 border border-slate-150 flex items-center justify-center text-slate-350 mb-3 shadow-3xs animate-pulse">
                        <FolderOpen className="w-7 h-7" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm">暂无匹配的教资课件资源</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm">
                        推荐调整侧边分类树、顶级高级过滤筛选器或录入新的检索关键词检索。
                      </p>
                      <button 
                        onClick={() => {
                          setResSearchKeyword('');
                          setResCourseFilter('全部课程');
                          setResTypeFilter('全部资源类型');
                          setResTagFilter('全部标签');
                          setSelectedResCourse('全部课程');
                          setSelectedResChapter('');
                          setSelectedResTag('');
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        展示所有课程资源
                      </button>
                    </div>
                  ) : (
                    <table className="min-w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-400 font-bold sticky top-0 border-b border-slate-200 z-10 select-none">
                        <tr>
                          <th className="px-5 py-3 w-10 text-center">
                            <input 
                              type="checkbox" 
                              onChange={handleSelectAllRes}
                              checked={filteredResources.length > 0 && selectedResIds.length === filteredResources.length}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-5 py-3 font-extrabold">资源名称</th>
                          <th className="px-5 py-3 font-extrabold text-center">所属分类</th>
                          <th className="px-5 py-3 font-extrabold">关联章节章节</th>
                          <th className="px-5 py-3 font-extrabold">标签</th>
                          <th className="px-5 py-3 font-extrabold">文件大小</th>
                          <th className="px-5 py-3 font-extrabold">上传时间</th>
                          <th className="px-5 py-3 font-extrabold text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredResources.map((res) => {
                          const isChecked = selectedResIds.includes(res.id);
                          return (
                            <tr 
                              key={res.id} 
                              className={`hover:bg-slate-50 transition-all bg-white ${isChecked ? 'bg-blue-50' : ''}`}
                            >
                              <td className="px-5 py-3.5 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={(e) => handleSelectRes(res.id, e.target.checked)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-5 py-3.5 max-w-xs md:max-w-md">
                                <div className="flex items-center gap-3">
                                  {/* Icon representation according to the screenshot */}
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-3xs border border-transparent ${
                                    res.fileType === 'pdf' 
                                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                      : res.fileType === 'ppt' 
                                      ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                      : res.fileType === 'docx' 
                                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                                      : res.fileType === 'code' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                      : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                    {res.fileType === 'code' ? (
                                      <Code className="w-4 h-4" />
                                    ) : res.fileType === 'zip' ? (
                                      <FileArchive className="w-4 h-4" />
                                    ) : (
                                      <FileText className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <div 
                                      onClick={() => {
                                        triggerToast(`📖 正在呼唤在线预览引擎解析：“${res.name}”...`);
                                      }}
                                      className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer text-xs md:text-sm truncate select-text"
                                    >
                                      {res.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[200px] md:max-w-[320px]">
                                      {res.desc}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              {/* Type Badge Option */}
                              <td className="px-5 py-3.5 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-normal ${res.typeBadgeColor}`}>
                                  {res.type}
                                </span>
                              </td>

                              <td className="px-5 py-3.5 text-slate-500 font-semibold max-w-[150px] truncate select-text">
                                <span className="text-slate-400 font-bold block text-[10px]">{res.course}</span>
                                <span className="block mt-0.5 truncate">{res.chapter}</span>
                              </td>

                              <td className="px-5 py-3.5 max-w-[120px] truncate">
                                <div className="flex gap-1.5 flex-wrap">
                                  {res.tags.map(t => {
                                    // Match color palette dynamically or fallback
                                    const tagObj = resourceTags.find(rt => rt.name === t);
                                    const tagStyles = tagObj ? tagObj.color : 'bg-slate-50 text-slate-500';
                                    return (
                                      <span key={t} className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-normal ${tagStyles}`}>
                                        {t}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-slate-500 font-mono font-bold select-text">{res.size}</td>

                              <td className="px-5 py-3.5 text-slate-400 font-semibold select-text">{res.time}</td>

                              {/* Interactive Actions Operations Box */}
                              <td className="px-5 py-3.5 text-center font-bold">
                                <div className="flex items-center justify-center gap-3">
                                  <button 
                                    onClick={() => handleOpenEditModal(res)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer hover:underline"
                                  >
                                    编辑
                                  </button>
                                  <button 
                                    onClick={() => {
                                      triggerToast(`📥 资源“${res.name}”已加入浏览器下载序列！`);
                                      playChime();
                                    }}
                                    className="text-blue-650 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer hover:underline"
                                  >
                                    下载
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`确定要彻底删除该教研资源吗：${res.name}`)) {
                                        handleDeleteRes(res.id);
                                        playChime();
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination Foot bar closely resembling screenshot mockup */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-slate-500 text-xs select-none shrink-0 font-sans">
                  <div className="font-extrabold">
                    共找到 <strong className="text-blue-600">{filteredResources.length}</strong> 条记录（库中共 {resources.length} 个）
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <select defaultValue="20 条/页" className="border border-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold cursor-pointer">
                      <option value="10 条/页">10 条/页</option>
                      <option value="20 条/页">20 条/页</option>
                      <option value="50 条/页">50 条/页</option>
                    </select>

                    <div className="flex items-center space-x-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                        &lt;
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-3xs">1</button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-250 hover:bg-slate-50 font-bold">2</button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-250 hover:bg-slate-50 font-bold">3</button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-230 hover:bg-slate-50 font-semibold" disabled>&gt;</button>
                    </div>

                    <div className="flex items-center text-slate-400 font-bold text-xs">
                      <span>跳至</span>
                      <input 
                        type="text" 
                        defaultValue="1" 
                        className="w-8 mx-1.5 p-1 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono font-black"
                      />
                      <span>页</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </main>
        ) : activeSidebarView === 'report' ? (
          /* ══════════════════════════════════════════════════════════════════
             REAL HIGH-FIDELITY TEACHER WORKSTATION REPORT (学情分析报告)
             ══════════════════════════════════════════════════════════════════ */
          <main className="flex-grow flex flex-col min-h-0 bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* Top Control Header Panel matching standard mockup interface */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
              <div className="space-y-1 text-left">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 m-0 pad-0">
                  <PieChart className="w-6 h-6 text-blue-650" />
                  大模型智学学情全景诊断报告
                </h1>
                <p className="text-xs text-slate-400 font-semibold leading-normal m-0 pt-0.5">
                  汇聚周、月度微课习题评测、代码切片及考纲覆盖点；依托大模型提供深度分层改进策略。
                </p>
              </div>

              {/* Course, Class & Week Selector Group */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Course Select */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">诊断课程</span>
                  <select 
                    value={reportCourse}
                    onChange={(e) => {
                      setReportCourse(e.target.value);
                      triggerToast(`已切换诊断课程为：${e.target.value}`);
                    }}
                    className="border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white font-bold cursor-pointer text-slate-700"
                  >
                    <option value="数据结构与算法">数据结构与算法</option>
                    <option value="计算机系统组成">计算机系统组成</option>
                    <option value="高级软件测试">高级软件测试</option>
                  </select>
                </div>

                {/* Class Select */}
                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">班级</span>
                  <select 
                    value={reportClass}
                    onChange={(e) => {
                      setReportClass(e.target.value);
                      triggerToast(`已成功载入 ${e.target.value} 的全量智学大纲模型记录`);
                    }}
                    className="border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white font-bold cursor-pointer text-slate-700"
                  >
                    <option value="2024级计算机1班">2024级计算机1班</option>
                    <option value="2024级计算机2班">2024级计算机2班</option>
                    <option value="高级实践创新班">高级实践创新班</option>
                  </select>
                </div>

                {/* Date range picker dialog mockup text link */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">诊断时段</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const newRange = prompt('请输入自定义学情诊断统计时间范围：', reportDateRange);
                      if (newRange) {
                        setReportDateRange(newRange);
                        triggerToast(`统计周期成功重置到：${newRange}`);
                      }
                    }}
                    className="border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 bg-white font-bold text-slate-655 hover:bg-slate-50 flex items-center gap-1.5 transition-colors border-dashed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {reportDateRange}
                  </button>
                </div>

                {/* Trigger AI Diagnose */}
                <div className="flex items-end self-stretch md:self-auto pt-3.5">
                  <button 
                    type="button"
                    onClick={() => {
                      triggerToast('⏳ 正在重调 LLM 精准分层计算模型，重新校对 32 个微卡知识点...');
                      setTimeout(() => {
                        triggerToast('🎉 全局多维学情诊断完成！已自动刷新生成最佳改进教学指南。', 'success');
                      }, 1200);
                    }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 font-black text-xs text-white px-3.5 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] border-none"
                  >
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>一键重跑AI全景评估</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Core Bento Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Interactive Heatmap Matrix Grid for Classroom Progress */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 p-5 shadow-3xs flex flex-col h-[400px]">
                <header className="flex justify-between items-start mb-2.5 shrink-0">
                  <div className="space-y-0.5 text-left animate-fadeIn">
                    <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                      教学大纲考点掌握度矩阵热力图
                    </h2>
                    <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                      展示本班在各细分知识点的综合掌握得分率。点击格点调阅大模型薄弱建议并推送练习。
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-55 text-slate-500 border border-slate-150 rounded-lg px-2 py-0.5 font-bold shrink-0">格点交互</span>
                </header>

                <div className="flex-grow flex flex-col justify-between overflow-y-auto">
                  
                  {/* Heatmap Layout with Left Y-Axis (Chapters), Top X-Axis (Themes) */}
                  <div className="grid grid-cols-10 gap-2 py-1.5 inline-min-w-0">
                    
                    {/* Header Columns 1-10 labels */}
                    <div className="col-span-2"></div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">概念模型</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">物理实现</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">插入与删除</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">栈空/栈满</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">二叉树遍历</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">邻接矩阵</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">最小生成树</div>
                    <div className="text-[9px] text-slate-400 font-black text-center truncate">状态转移</div>

                    {/* Row 1: 绪论与时空分析 */}
                    <div className="col-span-2 text-[10px] text-slate-500 font-bold self-center truncate">第1章 绪论与复杂度</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '概念模型与时间开销', chapter: '第1章', value: '88% 得分率', color: 'text-emerald-700 bg-emerald-50' })}
                      className="h-8 rounded bg-emerald-550 bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >88</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '空间复杂度寻址公式', chapter: '第1章', value: '85% 得分率', color: 'text-emerald-750 bg-emerald-50' })}
                      className="h-8 rounded bg-emerald-500/80 hover:bg-emerald-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >85</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>

                    {/* Row 2: 线性表及其应用 */}
                    <div className="col-span-2 text-[10px] text-slate-505 font-bold self-center truncate">第2章 线性表及链表</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '单链表抽象概念', chapter: '第2章', value: '92% 得分率', color: 'text-emerald-700 bg-emerald-50' })}
                      className="h-8 rounded bg-emerald-550 bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none animate-pulse"
                    >92</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '双向循环链表实现', chapter: '第2章', value: '78% 得分率', color: 'text-teal-700 bg-teal-50' })}
                      className="h-8 rounded bg-teal-400 hover:bg-teal-555 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >78</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '单链表指针删除与越界', chapter: '第2章', value: '52% 得分率', color: 'text-rose-700 bg-rose-50' })}
                      className="h-8 rounded bg-rose-400 hover:bg-rose-500 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >52</div>
                    <div className="h-8 rounded bg-slate-100/80 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/80 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/80 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/80 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/80 text-slate-300 flex items-center justify-center text-[9px]">-</div>

                    {/* Row 3: 栈与队列 */}
                    <div className="col-span-2 text-[10px] text-slate-500 font-bold self-center truncate">第3章 栈与同步队列</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '顺序静态栈存储', chapter: '第3章', value: '86% 得分率', color: 'text-emerald-700 bg-emerald-50' })}
                      className="h-8 rounded bg-emerald-500/80 hover:bg-emerald-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >86</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '链式栈头插法则', chapter: '第3章', value: '80% 得分率', color: 'text-emerald-750 bg-emerald-50' })}
                      className="h-8 rounded bg-emerald-500/70 hover:bg-emerald-650 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >80</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '多路队列插删操作', chapter: '第3章', value: '62% 得分率', color: 'text-amber-700 bg-amber-50' })}
                      className="h-8 rounded bg-amber-400 hover:bg-amber-500 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >62</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '循环队列边界溢出判定', chapter: '第3章', value: '47% 得分率', color: 'text-rose-700 bg-rose-50' })}
                      className="h-8 rounded bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >47</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>

                    {/* Row 4: 树域与二叉数 */}
                    <div className="col-span-2 text-[10px] text-slate-500 font-bold self-center truncate">第4章 森林与二叉树</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '二叉树递归非递归深度遍历', chapter: '第4章', value: '55% 得分率', color: 'text-rose-750 bg-rose-50' })}
                      className="h-8 rounded bg-rose-400 hover:bg-rose-500 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >55</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100 text-slate-300 flex items-center justify-center text-[9px]">-</div>

                    {/* Row 5: 实用图算法 */}
                    <div className="col-span-2 text-[10px] text-slate-500 font-bold self-center truncate">第5章 复杂图论结构</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: '邻接矩阵与邻接表转化', chapter: '第5章', value: '72% 得分率', color: 'text-teal-700 bg-teal-50' })}
                      className="h-8 rounded bg-teal-400 hover:bg-teal-500 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >72</div>
                    <div 
                      onClick={() => setActiveCellInfo({ topic: 'Kruskal Prim最小生成算法', chapter: '第5章', value: '41% 得分率', color: 'text-rose-700 bg-rose-50' })}
                      className="h-8 rounded bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer text-white flex items-center justify-center text-[10px] font-mono font-black border-none"
                    >41</div>
                    <div className="h-8 rounded bg-slate-100/90 text-slate-300 flex items-center justify-center text-[9px]">-</div>

                  </div>

                  {/* Cell Info Interactive Overlay panel if selected */}
                  <div className="grid grid-cols-2 bg-slate-50 rounded-xl p-3.5 border border-slate-200 mt-2">
                    {activeCellInfo ? (
                      <div className="col-span-2 flex items-center justify-between text-xs select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0"></span>
                          <span>已选大纲考点：<strong>{activeCellInfo.chapter} · {activeCellInfo.topic}</strong></span>
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${activeCellInfo.color}`}>{activeCellInfo.value}</span>
                        </div>
                        <div className="flex items-center gap-2 font-bold shrink-0">
                          <span className="text-slate-400 hidden sm:inline">策略:</span>
                          <button 
                            type="button"
                            onClick={() => {
                              triggerToast(`针对知识点 “${activeCellInfo.topic}” 推送大模型定制微小练习题集`);
                              setActiveCellInfo(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2.5 py-1 text-[10px] rounded border-none cursor-pointer"
                          >
                            推送专项微练
                          </button>
                          <button type="button" onClick={() => setActiveCellInfo(null)} className="text-slate-400 hover:text-slate-605 text-sm font-black pl-1 border-none cursor-pointer bg-transparent">×</button>
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 text-[11px] text-slate-400 font-semibold text-center py-1 flex items-center justify-center gap-1.5">
                        <span>💡 点击掌握度热力格子（例如：47%）可以分析特定多选错例、自动分发个性化学案练习题。</span>
                      </div>
                    )}

                    {/* Color legends */}
                    <div className="col-span-2 flex items-center justify-end flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-200 mt-2">
                      <span>掌握图示:</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>&lt; 60% 极速预警</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span>60%-70% 偏心薄弱</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-400 rounded-sm"></span>70%-80% 良好待固</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>&gt; 80% 掌握牢靠</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 2: Copilot AI suggestions and recommendations */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-3xs flex flex-col h-[400px]">
                <header className="flex justify-between items-center pb-3 border-b border-slate-200 shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <h2 className="font-extrabold text-sm text-slate-800">生成式 AI 周教学策略</h2>
                  </div>
                  <span className="text-[10px] text-blue-600 font-black flex items-center bg-blue-50 border border-blue-105 px-2 py-0.5 rounded">LLM Copilot</span>
                </header>

                {/* List of custom recommendations in report schema */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3.5 scrollbar-thin text-left">
                  {reportAiSuggestions.map(rec => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 relative group select-none hover:bg-slate-100/50 transition duration-150">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          rec.color === 'blue' 
                            ? 'bg-blue-50 text-blue-650 border border-blue-100'
                            : rec.color === 'green'
                            ? 'bg-emerald-50 text-emerald-650 border border-emerald-100'
                            : 'bg-yellow-50 text-amber-650 border border-amber-100'
                        }`}>
                          {rec.type}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => {
                              const newText = prompt('编辑建议内容：', rec.text);
                              if (newText) {
                                setReportAiSuggestions(prev => prev.map(item => item.id === rec.id ? { ...item, text: newText } : item));
                                triggerToast('教研策略已成功修改生效！');
                              }
                            }}
                            className="text-slate-400 hover:text-slate-650 text-[10px] font-bold border-none bg-transparent cursor-pointer"
                          >
                            编辑
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-2 leading-relaxed">
                        {rec.text}
                      </p>
                      <div className="mt-2.5 flex justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => triggerToast('学情诊断已成功归纳至教研备忘清单中。')}
                          className="text-[10px] text-slate-450 hover:text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-2 py-0.5 rounded cursor-pointer"
                        >
                          收纳
                        </button>
                        <button 
                          type="button"
                          onClick={() => triggerToast(`已成功采纳策略为“${reportCourse}”的周教学主要努力纲领！`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2 py-0.5 rounded text-[10px] transition-colors border-none cursor-pointer"
                        >
                          采纳目标
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      const suggestText = prompt('请输入您主打的精品教法改进问讯（例如:“面对本周链表Segment fault高频，如何布置分层错题卡”）：');
                      if (suggestText) {
                        triggerToast('🤖 大模型正在精准聚类提取班级内 12 位学生的代码崩溃记录...');
                        setTimeout(() => {
                          const newDiagnose = {
                            id: Date.now(),
                            type: '专项定制策略',
                            text: `对于您提问的 “${suggestText}”，大模型分析有 18 位的核心落盘在 70% 左右。已针对性地为其配齐自适动画课案，并将 C++ 跳链防悬测试卡片下发。`,
                            color: 'blue'
                          };
                          setReportAiSuggestions(prev => [newDiagnose, ...prev]);
                          triggerToast('🎉 成功追加了大模型定制薄弱巩固方向建议！', 'success');
                        }, 1000);
                      }
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>💬 询问 AI 专属诊断策略</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Individual Student Evaluation Deep Dive Portal Container */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-3xs p-5 select-none text-left">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-4 mb-4 shrink-0">
                <div className="space-y-0.5">
                  <h2 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5 animate-fadeIn">
                    <Users className="w-5 h-5 text-indigo-500" />
                    个性化小颗粒：个案分层多维深度分析
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">
                    精确定位学生个体的知识落点，关联学习时长、编译错码记录、AI 纠偏等。
                  </p>
                </div>
                
                <div className="flex items-center gap-2 font-semibold text-xs shrink-0">
                  <span className="text-slate-400 font-bold">选择分析对象:</span>
                  <select 
                    value={reportSelectedStudentId}
                    onChange={(e) => {
                      setReportSelectedStudentId(e.target.value);
                      triggerToast(`已调阅学生 “${studentsList.find(s => s.id === e.target.value)?.name || ''}” 的特色智学研判底牌`);
                    }}
                    className="border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 bg-white cursor-pointer"
                  >
                    {studentsList.filter(s => s.classId === 'c1' || s.classId === 'c2').map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.studentId}) · 掌握度 {st.mastery}%</option>
                    ))}
                  </select>
                </div>
              </header>

              {/* Student Row: Left side quick selector + Right side deep dive tab layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Visual student roster select list on the left column */}
                <div className="md:col-span-1 border-r border-slate-150 pr-4 space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">行政班级学子列表</p>
                  
                  {studentsList.filter(s => s.classId === 'c1' || s.classId === 'c2').map(st => {
                    const isSelected = reportSelectedStudentId === st.id;
                    return (
                      <div 
                        key={st.id}
                        onClick={() => {
                          setReportSelectedStudentId(st.id);
                          triggerToast(`个案深挖：${st.name}`);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-150 shadow-3xs hover:bg-blue-50' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <img 
                          src={st.avatar} 
                          alt={st.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shadow-3xs shrink-0 border border-slate-205" 
                        />
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center bg-transparent">
                            <span className="font-extrabold text-xs md:text-sm text-slate-800 truncate">{st.name}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              st.mastery >= 80 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : st.mastery >= 70 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {st.mastery}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-0.5 bg-transparent text-[10px] text-slate-400">
                            <span className="font-mono font-bold truncate">{st.studentId}</span>
                            <span className="font-semibold shrink-0">{st.studyHours}h活跃</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Master detailed diagnostics viewport columns 3 */}
                <div className="md:col-span-3 flex flex-col h-[380px]">
                  
                  {/* Visual view tab control list */}
                  <div className="flex border-b border-slate-200 shrink-0 select-none scrollbar-none overflow-x-auto gap-1 pb-1">
                    <button 
                      type="button"
                      onClick={() => setReportStudentTab('progress')}
                      className={`pb-2 px-3 text-xs font-black transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                        reportStudentTab === 'progress' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      学习进度时长
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReportStudentTab('weaknesses')}
                      className={`pb-2 px-3 text-xs font-black transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                        reportStudentTab === 'weaknesses' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      易错薄弱缺陷
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReportStudentTab('mistakes')}
                      className={`pb-2 px-3 text-xs font-black transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                        reportStudentTab === 'mistakes' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      高频错题纠偏
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReportStudentTab('assignments')}
                      className={`pb-2 px-3 text-xs font-black transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                        reportStudentTab === 'assignments' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      日常批改详情
                    </button>
                    <button 
                      type="button"
                      onClick={() => setReportStudentTab('behavior')}
                      className={`pb-2 px-3 text-xs font-black transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                        reportStudentTab === 'behavior' ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      活跃提问行为
                    </button>
                  </div>

                  {/* Tab Contents View viewport */}
                  <div className="flex-grow overflow-y-auto py-3 scrollbar-thin text-left">
                    {(() => {
                      const activeSt = studentsList.find(s => s.id === reportSelectedStudentId) || studentsList[0];
                      
                      if (reportStudentTab === 'progress') {
                        return (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none text-left">
                              <div className="bg-indigo-50/25 p-3.5 rounded-xl border border-indigo-100/50">
                                <span className="text-[10px] text-slate-405 font-extrabold uppercase">课前/课后活跃时长</span>
                                <p className="text-xl font-mono font-black text-indigo-700 mt-1">{activeSt.studyHours}h</p>
                                <span className="text-[9px] text-emerald-500 font-bold block mt-1">越过本班 84% 均速</span>
                              </div>
                              <div className="bg-emerald-50/25 p-3.5 rounded-xl border border-emerald-100/50">
                                <span className="text-[10px] text-slate-405 font-extrabold uppercase">核心掌握得分率</span>
                                <p className="text-xl font-mono font-black text-emerald-600 mt-1">{activeSt.mastery}%</p>
                                <span className="text-[9px] text-slate-400 font-bold block mt-1">考纲覆盖评估就绪</span>
                              </div>
                              <div className="bg-purple-50/25 p-3.5 rounded-xl border border-purple-100/50">
                                <span className="text-[10px] text-slate-450 font-extrabold uppercase">周测验自测完成率</span>
                                <p className="text-xl font-mono font-black text-purple-650 mt-1">{activeSt.completion}%</p>
                                <span className="text-[9px] text-purple-500 font-bold block mt-1">3 份待重审自测</span>
                              </div>
                              <div className="bg-blue-50/25 p-3.5 rounded-xl border border-blue-100/50">
                                <span className="text-[10px] text-slate-450 font-extrabold uppercase">日常活跃行为</span>
                                <p className="text-xl font-bold text-blue-600 mt-1">{activeSt.status}</p>
                                <span className="text-[9px] text-slate-400 font-bold block mt-1">系统打卡足迹极佳</span>
                              </div>
                            </div>

                            {/* Unsplash/Mocked Dynamic vector SVG curve of learning growth activity */}
                            <div className="p-4 rounded-2xl border border-slate-150 bg-slate-50/40 select-none">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 text-left">
                                  <span>📈 自测知识得分成长轨迹</span>
                                  <span className="text-[9px] font-normal text-slate-400 leading-none">（基于各章大自测试卷平均算术分）</span>
                                </span>
                                <span className="text-[10px] text-blue-600 font-bold">24时刷新</span>
                              </div>
                              <div className="h-28 relative flex items-center justify-center">
                                <svg viewBox="0 0 450 110" className="w-full h-full text-blue-500">
                                  <defs>
                                    <linearGradient id="growthGradReport2" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Guidelines */}
                                  <line x1="0" y1="20" x2="450" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                                  <line x1="0" y1="60" x2="450" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                  <line x1="0" y1="100" x2="450" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />

                                  {/* Master curve representation */}
                                  <path 
                                    d="M 10 90 Q 90 72 160 50 T 280 35 T 390 25 T 440 15 L 440 100 L 10 100 Z" 
                                    fill="url(#growthGradReport2)"
                                  />
                                  <path 
                                    d="M 10 90 Q 90 72 160 50 T 280 35 T 390 25 T 440 15" 
                                    fill="none" 
                                    stroke="#2563EB" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round"
                                  />

                                  {/* Dots */}
                                  <circle cx="10" cy="90" r="3.5" fill="#ffffff" stroke="#2563EB" strokeWidth="2" />
                                  <circle cx="160" cy="50" r="3.5" fill="#ffffff" stroke="#2563EB" strokeWidth="2" />
                                  <circle cx="280" cy="35" r="3.5" fill="#ffffff" stroke="#2563EB" strokeWidth="2" />
                                  <circle cx="390" cy="25" r="3.5" fill="#ffffff" stroke="#2563EB" strokeWidth="2" />
                                  <circle cx="440" cy="15" r="4" fill="#2563EB" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />

                                  <text x="10" y="80" className="text-[8px] font-black font-mono fill-slate-400">绪论算法</text>
                                  <text x="160" y="40" className="text-[8px] font-black font-mono fill-slate-400">线性链链解门</text>
                                  <text x="280" y="25" className="text-[8px] font-black font-mono fill-slate-400">栈与异步队列</text>
                                  <text x="390" y="15" className="text-[8px] font-black font-mono fill-indigo-600 font-extrabold animate-pulse">森林二叉树</text>
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (reportStudentTab === 'weaknesses') {
                        return (
                          <div className="space-y-3.5 animate-fadeIn">
                            <p className="text-xs font-black text-slate-705">🔍 系统评估出该同学首要易错及能力断层考点：</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-2 text-left">
                              
                              {/* Weakness concept cell 1 */}
                              <div className="p-3.5 rounded-xl border border-red-150 bg-red-50/20 flex gap-3 items-start select-none">
                                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
                                  <AlertCircle className="w-4.5 h-4.5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <h4 className="text-xs font-extrabold text-slate-800 truncate">第2章《线性单链表删除指针悬空异常》</h4>
                                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                                    痛点表现：该生执行删除结点并释放临界边界时，常忘记对即将变动的 {"p->next"} 作空值断定，造成运行段内存读写冲突。
                                  </p>
                                  <button 
                                    type="button"
                                    onClick={() => triggerToast(`已成功为 “${activeSt.name}” 匹配推送【跳链级特殊临界条件防崩溃】专项动画！`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-2.5 py-1 mt-2.5 rounded transition-all border-none cursor-pointer"
                                  >
                                    一键进行专项推送
                                  </button>
                                </div>
                              </div>

                              {/* Weakness concept cell 2 */}
                              <div className="p-3.5 rounded-xl border border-yellow-150 bg-yellow-50/20 flex gap-3 items-start select-none">
                                <div className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center shrink-0">
                                  <AlertCircle className="w-4.5 h-4.5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <h4 className="text-xs font-extrabold text-slate-800 truncate">第3章《循环对称模队列尾随位移判定》</h4>
                                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                                    痛点表现：对在模容量 MAX_SIZE 状态下 `rear = (rear + 1) % MAX` 累增的越界回绕安全判定在自测中连续错落 2 次。
                                  </p>
                                  <button 
                                    type="button"
                                    onClick={() => triggerToast(`已成功为 “${activeSt.name}” 的错题本配齐【循环余数组越界环路设计】名师微讲内容`)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-2.5 py-1 mt-2.5 rounded transition-all border-none cursor-pointer"
                                  >
                                    一键进行专项推送
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      }

                      if (reportStudentTab === 'mistakes') {
                        return (
                          <div className="space-y-3.5 animate-fadeIn select-none">
                            <p className="text-xs font-black text-slate-705">⚠️ 该学子的代码调试越区错例（点击大模型诊断进行一键纠偏）：</p>

                            <div className="space-y-2.5">
                              {/* Error item 1 */}
                              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                <div className="text-left min-w-0 flex-1 pr-4">
                                  <span className="text-[10px] text-red-655 bg-red-50 border border-red-100 font-extrabold rounded px-1.5 py-0.5">运行段崩溃 (Segment Fault)</span>
                                  <h5 className="text-xs font-bold text-slate-800 truncate mt-1">双指针遍历删除结点时的临界判断：{"p->next = p->next->next"} 悬控检测</h5>
                                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">场景追溯：本周章末练习三 · 发生时间: 3天前</p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setSelectedErrorExample({
                                      title: '双指针删除链表结点空指针悬空纠偏',
                                      type: '指针悬控越界安全漏洞型错误',
                                      reason: '该生直接执行 `p->next->next` 变链寻址。当 `p` 是 nullptr、或者由于操作导致 `p->next` 就是尾节点 nullptr 时，由于无法解析 nullptr->next 引用，极高频爆破内存寻址段 SegFault 的软崩溃。',
                                      count: 3,
                                      date: '2026-05-25 (《作业3：双指针进阶》)',
                                      codeOrContent: `// 🔴【错误代码片段】：\nvoid deleteNode(ListNode* p) {\n    // 盲目越级跳过，当链表只有一个结点或 p->next 恰为尾结点时崩溃\n    ListNode* temp = p->next;\n    p->next = p->next->next;\n    delete temp;\n}\n\n// 🟢【AI 诊断大模型纠偏建议】：\nvoid deleteNode(ListNode* p) {\n    if (p == nullptr || p->next == nullptr) return; // 必须前置自清洗，拒绝野引用\n    ListNode* temp = p->next;\n    p->next = temp->next;\n    delete temp; // 回收空间\n}`
                                    });
                                    setShowErrorDetailModal(true);
                                    triggerToast('正在拉取大模型双针空引诊断解析...');
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-705 bg-blue-50/50 hover:bg-blue-50 hover:shadow-3xs transition-all border border-blue-100 hover:border-blue-200 rounded px-2.5 py-1 inline-block cursor-pointer shrink-0 font-sans border-solid-none"
                                >
                                  诊断大模型纠偏 &gt;
                                </button>
                              </div>

                              {/* Error item 2 */}
                              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                <div className="text-left min-w-0 flex-1 pr-4">
                                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 font-extrabold rounded px-1.5 py-0.5">环表越位逻辑问题</span>
                                  <h5 className="text-xs font-bold text-slate-800 truncate mt-1">循环队列入队：未对 `rear` 变轨进行取模导致数组溢流</h5>
                                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">场景追溯：本周随堂模拟测 · 发生时间: 5天前</p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setSelectedErrorExample({
                                      title: '循环队列入队尾索引模溢出纠偏',
                                      type: '索引取模环形逻辑算力错误',
                                      reason: '正向递增算法 rear = rear + 1 缺少了在物理上以最大容量限制 MAX_SIZE 取模重叠。导致循环数组退化为一次性浪费表格。',
                                      count: 2,
                                      date: '2026-05-23 (《队列随堂巩固卡》)',
                                      codeOrContent: `// 🔴【错误代码片段】:\nvoid enqueue(int val) {\n    rear = rear + 1;\n    queue[rear] = val;\n}\n\n// 🟢【大模型纠错改良建议】:\nvoid enqueue(int val) {\n    if ((rear + 1) % MAX_SIZE == front) {\n        // 队列存满不给越权写入，做环式保护\n        return;\n    }\n    rear = (rear + 1) % MAX_SIZE;\n    queue[rear] = val;\n}`
                                    });
                                    setShowErrorDetailModal(true);
                                    triggerToast('正在拉取环路复位重构地址...');
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-705 bg-blue-50/50 hover:bg-blue-50 hover:shadow-3xs transition-all border border-blue-105 hover:border-blue-200 rounded px-2.5 py-1 inline-block cursor-pointer shrink-0 font-sans border-solid-none"
                                >
                                  诊断大模型纠偏 &gt;
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      }

                      if (reportStudentTab === 'assignments') {
                        return (
                          <div className="space-y-3 animate-fadeIn">
                            <p className="text-xs font-black text-slate-705">📝 “{activeSt.name}”的历次测练等级及实战批语言：</p>
                            
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                              {(studentAssignments[activeSt.id] || []).map((asg, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs flex justify-between items-start gap-4 select-none">
                                  <div className="text-left min-w-0 flex-1">
                                    <h5 className="font-extrabold text-slate-800">{asg.title}</h5>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-1">提交批阅时间: {asg.time} · 归宿特征: <strong className="text-emerald-600">{asg.status}</strong></p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 bg-white/70 p-2 rounded-lg border border-slate-100">
                                      主理评定：总体解算合理，代码风貌整洁无异味。特别是针对空节点的安全性检测完全写到位。继续发光！
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <span className="text-lg font-black font-mono text-blue-600">{asg.score}</span>
                                    <span className="text-[10px] text-slate-400 font-bold ml-0.5">分</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newScore = prompt('请输入修正后的全新分数值 (0-100)：', String(asg.score));
                                        if (newScore && !isNaN(Number(newScore))) {
                                          triggerToast(`已重设分数为 ${newScore} 分，自动同步计入学情统计档案`);
                                        }
                                      }}
                                      className="block text-[10px] text-blue-600 hover:underline hover:text-blue-705 font-bold mt-2.5 border-none bg-transparent cursor-pointer"
                                    >
                                      微调得分
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (reportStudentTab === 'behavior') {
                        return (
                          <div className="space-y-4 animate-fadeIn select-none">
                            <p className="text-xs font-black text-slate-705">💬 本周该同学在系统问答与多媒体卡片下的足印跟踪：</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50 text-left">
                                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-150 pb-1.5 mb-2 shrink-0">
                                  <MessageSquare className="w-4 h-4 text-purple-600" />
                                  发起的微课研讨提问卡
                                </h5>
                                <div className="text-[11px] space-y-2 font-semibold">
                                  <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                                    <span className="text-[9px] text-slate-400 block pb-0.5">05/18 19:40 提问</span>
                                    <span className="text-slate-710 text-slate-700 leading-relaxed">“老师，为什么前序遍历与中序遍历一定能还原唯一的树，但前序和后序还原却可以产生多义歧义性二叉树？”</span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                                    <span className="text-[9px] text-slate-400 block pb-0.5">05/14 15:10 提问</span>
                                    <span className="text-slate-710 text-slate-700 leading-relaxed">“双循环链表在执行头结点的自删除时，跳针解挂该怎样设置过渡引用？”</span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50 text-left">
                                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-150 pb-1.5 mb-2 shrink-0">
                                  <Video className="w-4 h-4 text-emerald-600" />
                                  配套视频微课完播率明细
                                </h5>
                                <div className="text-[11px] space-y-2 font-semibold">
                                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-slate-100">
                                    <span className="text-slate-705 font-bold truncate pr-3">《单向链表空悬指针调试解链技巧》</span>
                                    <span className="text-emerald-600 font-black text-[10px] shrink-0">100% 完播</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-slate-100">
                                    <span className="text-slate-705 font-bold truncate pr-3">《树递归遍历算术深度及递归工作栈规律》</span>
                                    <span className="text-emerald-600 font-black text-[10px] shrink-0">100% 完播</span>
                                  </div>
                                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-slate-100">
                                    <span className="text-slate-705 font-bold truncate pr-3">《环型双端模寻址空满判断边界算法》</span>
                                    <span className="text-amber-500 font-black text-[10px] shrink-0">35% 退出</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>

                </div>

              </div>
            </div>

          </main>
        ) : activeSidebarView === 'settings' ? (
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <SettingsView 
              setActiveView={setActiveSidebarView}
              currentUser={currentUser}
              onLogout={onLogout}
            />
          </main>
        ) : activeSidebarView === 'class-report' ? (
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <ClassReportView 
              currentUser={currentUser}
              triggerToast={triggerToast}
            />
          </main>
        ) : activeSidebarView === 'student-analysis' ? (
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <StudentAnalysisView 
              currentUser={currentUser}
              triggerToast={triggerToast}
            />
          </main>
        ) : activeSidebarView === 'learning-behavior' ? (
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <LearningBehaviorView 
              currentUser={currentUser}
              triggerToast={triggerToast}
            />
          </main>
        ) : activeSidebarView === 'question-bank' ? (
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <QuestionBankView 
              currentUser={currentUser}
              triggerToast={triggerToast}
            />
          </main>
        ) : activeSidebarView === 'papers' ? (
          <main className="flex-grow p-2 md:p-4 overflow-y-auto bg-slate-55 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <PaperManagementView 
              currentUser={currentUser || undefined}
              triggerToast={triggerToast}
            />
          </main>
        ) : activeSidebarView === 'accounts' ? (
          <main className="flex-grow p-2 md:p-4 overflow-y-auto bg-slate-55 text-slate-800 text-left select-none animate-fadeIn font-sans">
            <AccountManagementView 
              currentUser={currentUser || undefined}
              triggerToast={triggerToast}
            />
          </main>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
             REAL HIGH-FIDELITY TEACHER WORKSTATION DASHBOARD PORTAL (首页)
             ══════════════════════════════════════════════════════════════════ */
          <main className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50/50 select-none text-left">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* 1. Welcoming Header Banner with custom AI info overlay */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md select-none animate-fadeIn">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl font-semibold"></div>
                <div className="relative z-10">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                    上午好，{currentUser?.name || '张老师'}
                  </h1>
                  <p className="text-xs md:text-sm text-blue-105 font-bold mt-1.5 max-w-xl leading-relaxed">
                    欢迎进入您执教的大模型智学云工作台。系统自动为您分析了本周学生的重点章节考查动态。
                  </p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto self-stretch md:self-auto relative z-10">
                  <div className="bg-white/10 backdrop-blur-md p-3.5 py-2.5 rounded-xl border border-white/10 flex-1 min-w-[140px]">
                    <div className="text-[10px] text-blue-200 font-extrabold tracking-wide">AI 诊断切片雷达库</div>
                    <div className="text-xl md:text-2xl font-black mt-1 font-mono">84.2% 近似度</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3.5 py-2.5 rounded-xl border border-white/10 flex-1 min-w-[110px] hidden sm:block">
                    <div className="text-[10px] text-emerald-250 font-extrabold tracking-wide">系统运行状态</div>
                    <div className="text-sm font-black mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      诊断就绪
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Stats Summary Row Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                {/* Card 1: 授课课程数 */}
                <div 
                  onClick={() => {
                    setActiveSidebarView('courses');
                    triggerToast('已为您转跳到课程章节，您可以批改作业、展开各知识点、或新增大纲。');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100/90 flex items-center gap-4 shadow-3xs hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105">
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold font-sans">授课课程数</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      8 <span className="text-xs text-slate-500 font-bold ml-0.5">门</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      较上周 <span className="text-emerald-500 font-black">+1 门</span>
                    </p>
                  </div>
                </div>

                {/* Card 2: 学生总数 */}
                <div 
                  onClick={() => {
                    setActiveSidebarView('classes');
                    setClassTab('classes');
                    triggerToast('👥 已成功为您跳转至班级管理页面。', 'success');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100/90 flex items-center gap-4 shadow-3xs hover:border-teal-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105">
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold font-sans">学生总数</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      326 <span className="text-xs text-slate-500 font-bold ml-0.5">人</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      较上周 <span className="text-emerald-500 font-black">+23 人</span>
                    </p>
                  </div>
                </div>

                {/* Card 3: 待批改作业数 */}
                <div 
                  onClick={() => {
                    setActiveSidebarView('homework');
                    setSelectedHomeworkId('h_ds3');
                    setCurrentCenterTab('提交情况');
                    triggerToast('📚 已为您跳转至作业管理：【数据结构 第3章 作业3】的提交列表中。', 'success');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100/90 flex items-center gap-4 shadow-3xs hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105">
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold font-sans">待批改作业数</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      46 <span className="text-xs text-slate-500 font-bold ml-0.5">份</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      较上周 <span className="text-emerald-500 font-black">+12 份</span>
                    </p>
                  </div>
                </div>

                {/* Card 4: 待回复提问数 */}
                <div 
                  onClick={() => {
                    setHeaderMessagesOpen(true);
                    setHeaderNotificationsOpen(false);
                    triggerToast('📬 已为您定位并开启顶部最近消息，可实时回复学生提答疑！', 'info');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100/90 flex items-center gap-4 shadow-3xs hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105">
                    <MessageSquare className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold font-sans">待回复提问数</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">
                      18 <span className="text-xs text-slate-500 font-bold ml-0.5">条</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      较上周 <span className="text-emerald-500 font-black">+5 条</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Middle 3-Column Bento Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bento Column 1: 待办任务 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs flex flex-col min-h-[380px] p-5 select-none font-sans">
                  <header className="flex justify-between items-center pb-4 border-b border-slate-100/60 shrink-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-sm md:text-base text-slate-800">待办任务</h2>
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                        {teacherTodoTasks.reduce((acc, curr) => acc + curr.count, 0)}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTeacherTask('作业');
                        triggerToast('🎉 已成功为您展示全量教学任务快捷交互舱！');
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-xs font-bold bg-blue-50 px-2.5 py-0.5 rounded-full cursor-pointer transition-all hover:scale-102"
                      title="打开全量快捷交互舱"
                    >
                      <Plus className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>快捷介入</span>
                    </button>
                  </header>
                  
                  {/* Scrollable Tasks Area */}
                  <div className="flex-1 space-y-3.5 py-4 text-left">
                    {teacherTodoTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => {
                          if (task.type === '作业') {
                            setActiveSidebarView('homework');
                            setSelectedHomeworkId('h_ds3');
                            setCurrentCenterTab('提交情况');
                            triggerToast('📚 已为您跳转至作业管理：【数据结构 第3章 作业3】的提交列表中。', 'success');
                          } else if (task.type === '提问') {
                            setHeaderMessagesOpen(true);
                            setHeaderNotificationsOpen(false);
                            triggerToast('📬 已为您定位并开启顶部最近消息，可实时回复学生提答疑！', 'info');
                          } else if (task.type === '互动') {
                            setActiveSidebarView('class-report');
                            triggerToast('🖥️ 已为您跳转至【课堂报告】的互动点评与学情复盘分析面板。', 'success');
                          }
                        }}
                        className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-all hover:translate-x-1 duration-200 group border border-slate-100"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold shrink-0 border ${
                          task.type === '作业' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          task.type === '提问' ? 'bg-blue-50 text-blue-505 border-blue-105' :
                          'bg-emerald-50 text-emerald-500 border-emerald-100'
                        }`}>
                          {task.type === '作业' && <FileText className="w-4.5 h-4.5" />}
                          {task.type === '提问' && <MessageSquare className="w-4.5 h-4.5" />}
                          {task.type === '互动' && <Users className="w-4.5 h-4.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs md:text-sm text-slate-800">{task.title}</p>
                          <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{task.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs shrink-0 pl-1">
                          <span>{task.count}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100/60 mt-auto text-center shrink-0 animate-fadeIn">
                    <button 
                      onClick={() => {
                        setActiveTeacherTask('作业');
                        triggerToast('💡 已为您同步并加载全量教学督导工作舱！');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline cursor-pointer"
                    >
                      查看全部待办任务
                    </button>
                  </div>
                </div>

                {/* Bento Column 2: 最近教学活动 */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs flex flex-col min-h-[380px] p-5 select-none">
                  <header className="flex justify-between items-center pb-4 border-b border-slate-100/60 shrink-0">
                    <h2 className="font-extrabold text-sm md:text-base text-slate-800">最近教学活动</h2>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md">Realtime</span>
                  </header>

                  <div className="flex-1 pt-4 relative pr-1 text-left">
                    {/* Timeline vertical axis line */}
                    <div className="absolute left-6 top-3 bottom-4 w-0.5 bg-slate-100/80 -z-10"></div>
                    
                    <div className="space-y-5.5 relative z-10">
                      {/* Item 1 */}
                      <div 
                        className="flex gap-3.5 group cursor-pointer" 
                        onClick={() => {
                          setActiveSidebarView('homework');
                          setSelectedHomeworkId('h_ds3');
                          setCurrentCenterTab('提交情况');
                          triggerToast('📚 已为您跳转至作业管理：【数据结构 第3章 作业3】的提交列表中。', 'success');
                        }}
                      >
                        <div className="w-11 h-11 rounded-full bg-blue-50 group-hover:bg-blue-100 border-2 border-white ring-4 ring-slate-50/50 text-blue-600 flex items-center justify-center text-xs shrink-0 transition-colors">
                          <FileCode className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start select-none">
                            <h3 className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">数据结构 作业3</h3>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">10分钟前</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">2024级计算机1班 · 32 人提交</p>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div 
                        className="flex gap-3.5 group cursor-pointer" 
                        onClick={() => {
                          setHeaderMessagesOpen(true);
                          setHeaderNotificationsOpen(false);
                          triggerToast('📬 已为您定位并开启顶部最近消息，可实时回复学生提答疑！', 'info');
                        }}
                      >
                        <div className="w-11 h-11 rounded-full bg-purple-50 group-hover:bg-purple-100 border-2 border-white ring-4 ring-slate-50/50 text-purple-600 flex items-center justify-center text-xs shrink-0 transition-colors">
                          <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start select-none">
                            <h3 className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-purple-600 transition-colors truncate">算法设计 课堂提问</h3>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">25分钟前</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                            2024级计算机2班 · 学生提问: 动态规划的状态转移方程如何理解?
                          </p>
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div 
                        className="flex gap-3.5 group cursor-pointer" 
                        onClick={() => {
                          setActiveSidebarView('homework');
                          setSelectedHomeworkId('h_ds3');
                          setCurrentCenterTab('提交情况');
                          triggerToast('📚 已为您跳转至作业管理：【计算机组成原理 作业2】的提交列表中。', 'success');
                        }}
                      >
                        <div className="w-11 h-11 rounded-full bg-indigo-50 group-hover:bg-indigo-100 border-2 border-white ring-4 ring-slate-50/50 text-indigo-600 flex items-center justify-center text-xs shrink-0 transition-colors">
                          <FileText className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start select-none">
                            <h3 className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-indigo-600 transition-colors truncate">计算机组成原理 作业2</h3>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">1小时前</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">2024级计算机1班 · 28 人已提交</p>
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div 
                        className="flex gap-3.5 group cursor-pointer" 
                        onClick={() => {
                          setActiveSidebarView('student-analysis');
                          triggerToast('📈 已为您跳转至【学情分析】以查看学生的详细学习打卡与学习动态。', 'success');
                        }}
                      >
                        <div className="w-11 h-11 rounded-full bg-emerald-50 group-hover:bg-emerald-100 border-2 border-white ring-4 ring-slate-50/50 text-emerald-600 flex items-center justify-center text-xs shrink-0 transition-colors">
                          <Book className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start select-none">
                            <h3 className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-emerald-600 transition-colors truncate">离散数学 学生学习动态</h3>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">2小时前</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">2024级计算机3班 · 张同学完成了第3章《组合数学》打卡</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100/60 mt-auto text-center shrink-0">
                    <button 
                      onClick={() => triggerToast('📚 正在拉取您下属所有8门主讲学科在过去3个月的一切综合轨迹...')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline cursor-pointer"
                    >
                      查看全部教学活动
                    </button>
                  </div>
                </div>

                {/* Bento Column 3: Quick Ops & Line Chart Progress */}
                <div className="flex flex-col gap-5 min-h-[380px]">
                  {/* Upper Cell: Quick Operations */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-4 flex-grow flex flex-col justify-between">
                    <h3 className="font-extrabold text-slate-800 text-xs md:text-sm shrink-0 mb-3 select-none flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                      快速操作
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2.5 flex-grow select-none">
                      {/* Op button 1: 发布作业 */}
                      <button 
                        onClick={() => {
                          setActiveSidebarView('homework');
                          triggerToast('📝 已跳转至作业管理页面。', 'success');
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-left p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                          <PenTool className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-800 truncate">发布作业</p>
                          <p className="text-[9px] text-blue-500/80 font-semibold truncate mt-0.5">布置新任务</p>
                        </div>
                      </button>

                      {/* Op button 2: 查看学情 */}
                      <button 
                        onClick={() => {
                          setActiveSidebarView('report');
                          triggerToast('📊 已成功为您跳转至学情总览页面。', 'success');
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-left p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <PieChart className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-800 truncate">查看学情</p>
                          <p className="text-[9px] text-emerald-500/80 font-semibold truncate mt-0.5">多维对比评估</p>
                        </div>
                      </button>

                      {/* Op button 3: 管理课程 */}
                      <button 
                        onClick={() => {
                          setActiveSidebarView('courses');
                          triggerToast('已经跳转到您的 8 门在授学科，可编辑、创建或废止微课章节。', 'success');
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-left p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-purple-800 truncate">管理课程</p>
                          <p className="text-[9px] text-purple-500/80 font-semibold truncate mt-0.5">大纲与微课</p>
                        </div>
                      </button>

                      {/* Op button 4: 创建课堂 */}
                      <button 
                        onClick={() => {
                          setActiveSidebarView('courses');
                          setIsAddCourseModalOpen(true);
                          triggerToast('🚀 已为您跳转至课程管理并成功开启创建课程窗口。', 'success');
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-left p-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-800 truncate">创建课堂</p>
                          <p className="text-[9px] text-amber-500/80 font-semibold truncate mt-0.5">发起互动抢答</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Lower Cell: Class Progress Report (Line Chart) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-4 flex flex-col justify-between h-[180px] select-none text-left">
                    <header className="flex justify-between items-start shrink-0">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-xs md:text-sm">班级学情简报 <span className="text-[10px] text-slate-400 font-semibold">（本周）</span></h3>
                      </div>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-black">
                        较上周 ↑ 6%
                      </span>
                    </header>

                    <div className="flex items-center gap-4 py-2 flex-grow min-y-0 relative">
                      <div className="w-[30%] shrink-0 text-left cursor-help" onClick={() => triggerToast('通过对比上周时间片，全班对“线性表”及“树”的理解增长了6分度。')}>
                        <p className="text-[10px] text-slate-400 font-bold leading-none uppercase">整体掌握度</p>
                        <p className="text-3xl font-black mt-1 text-slate-900 tracking-tight font-sans">
                          78%
                        </p>
                        <p className="text-[10px] text-slate-400 font-extrabold mt-1">
                          成长反馈极佳
                        </p>
                      </div>
                      
                      {/* Beautiful client-side vector interactive SVG Line chart */}
                      <div className="w-[70%] h-full relative flex items-center justify-center">
                        <svg viewBox="0 0 180 85" className="w-full h-full text-teal-400">
                          {/* Horizontal guidelines */}
                          <line x1="0" y1="10" x2="180" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="40" x2="180" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="70" x2="180" y2="70" stroke="#f8fafc" strokeWidth="1.5" />

                          {/* Gradient filled curve area under path shape */}
                          <defs>
                            <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#20C997" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#20C997" stopOpacity="0.01" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 5 65 Q 35 48 65 38 T 120 42 T 150 25 T 175 12 L 175 75 L 5 75 Z" 
                            fill="url(#dashboardAreaGrad)" 
                          />
                          
                          {/* Main line stroke curve */}
                          <path 
                            d="M 5 65 Q 35 48 65 38 T 120 42 T 150 25 T 175 12" 
                            fill="none" 
                            stroke="#20C997" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                          />

                          {/* Dots data points with standard responsive animations on hover */}
                          <circle cx="5" cy="65" r="3" fill="#ffffff" stroke="#20C997" strokeWidth="2.2" className="cursor-pointer" />
                          <circle cx="65" cy="38" r="3" fill="#ffffff" stroke="#20C997" strokeWidth="2.2" className="cursor-pointer" />
                          <circle cx="120" cy="42" r="3" fill="#ffffff" stroke="#20C997" strokeWidth="2.2" className="cursor-pointer" />
                          <circle cx="175" cy="12" r="3" fill="#20C997" stroke="#ffffff" strokeWidth="1.5" className="cursor-pointer animate-pulse" />
                        </svg>
                        
                        {/* Custom absolute positioned ticks mapping nicely */}
                        <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1 text-[8px] font-black font-mono text-slate-300">
                          <span>05-12</span>
                          <span>05-14</span>
                          <span>05-16</span>
                          <span>05-18</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                
              </div>

              {/* 4. Bottom 3-Column Rich Metrics Row (Pie, Dynamic Student List, Resource Usage + Error TOP3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Box A: 课程学情分布 (Doughnut Chart mockup) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs flex flex-col p-5 select-none relative min-h-[360px]">
                  <header className="flex justify-between items-center pb-4 border-b border-slate-100/60 shrink-0">
                    <h2 className="font-extrabold text-sm md:text-base text-slate-800">课程学情分布 <span className="text-xs font-normal text-slate-400">（本周）</span></h2>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md">整体</span>
                  </header>

                  <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                    <div className="flex items-center justify-between w-full gap-4">
                      
                      {/* Ring graphics */}
                      <div className="flex-1 flex justify-center items-center relative">
                        <div className="w-28 h-28 md:w-32 md:h-32 relative flex items-center justify-center shrink-0">
                          {/* Pure math computed SVG segment arc donut chart representing 25/35/25/15 ratio */}
                          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {/* Segment 1: Blue (25%), strokeDasharray="59.69 238.76" */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="none" 
                              stroke="#186BFD" 
                              strokeWidth="10" 
                              strokeDasharray="59.69 238.76" 
                              strokeDashoffset="0" 
                              className="hover:stroke-[11] transition-all cursor-pointer"
                            />
                            {/* Segment 2: Teal (35%), strokeDasharray="83.57 238.76", offset="59.69" */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="none" 
                              stroke="#20C997" 
                              strokeWidth="10" 
                              strokeDasharray="83.57 238.76" 
                              strokeDashoffset="-59.69" 
                              className="hover:stroke-[11] transition-all cursor-pointer"
                            />
                            {/* Segment 3: Yellow (25%), strokeDasharray="59.69 238.76", offset="143.26" */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="none" 
                              stroke="#FFC107" 
                              strokeWidth="10" 
                              strokeDasharray="59.69 238.76" 
                              strokeDashoffset="-143.26" 
                              className="hover:stroke-[11] transition-all cursor-pointer"
                            />
                            {/* Segment 4: Red/Error (15%), strokeDasharray="35.81 238.76", offset="202.95" */}
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="38" 
                              fill="none" 
                              stroke="#FF8080" 
                              strokeWidth="10" 
                              strokeDasharray="35.81 238.76" 
                              strokeDashoffset="-202.95" 
                              className="hover:stroke-[11] transition-all cursor-pointer"
                            />
                          </svg>

                          {/* Center information badge overlay */}
                          <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center text-center">
                            <p className="text-xl md:text-2xl font-black text-slate-800 font-sans tracking-tight leading-none">
                              78%
                            </p>
                            <p className="text-[8px] text-slate-400 font-black mt-1 uppercase tracking-wider">
                              整体掌握度
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Legends right-aligned */}
                      <div className="flex flex-col gap-2.5 text-left font-sans pl-1 min-w-[120px] shrink-0">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => triggerToast('优秀率(>90分)：25% 的高分学子具备极佳的大纲领悟。')}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#186BFD] shrink-0"></span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold leading-none">优秀 (90-100%)</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">25%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => triggerToast('良好率(80-89分)：35% 的学子达成了推荐教学轨迹。')}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] shrink-0"></span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold leading-none">良好 (80-89%)</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">35%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => triggerToast('中等率(60-79分)：25% 学子仍需AI推荐答疑。')}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC107] shrink-0"></span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold leading-none">中等 (60-79%)</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">25%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => triggerToast('不及格率(0-59分)：15% 的边缘学子，已在“需要关注”一栏列举。')}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8080] shrink-0"></span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold leading-none">较差 (0-59%)</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">15%</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100/60 mt-auto text-center shrink-0">
                    <button 
                      onClick={() => triggerToast('📈 本学期全部课程的错题与加权均分，自组织聚类中')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline cursor-pointer"
                    >
                      查看全部课程学情
                    </button>
                  </div>
                </div>

                {/* Box B: 学生学习动态 + Custom Toggle Switch */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs flex flex-col p-5 select-none min-h-[360px]">
                  
                  <header className="flex justify-between items-center pb-2 border-b border-slate-100/60 shrink-0">
                    <h2 className="font-extrabold text-sm md:text-base text-slate-800">学生学习动态 <span className="text-xs font-normal text-slate-400">（本周）</span></h2>
                  </header>

                  {/* Switch tab selector bar */}
                  <div className="flex border-b border-slate-100 mb-4 shrink-0 font-sans">
                    <button 
                      onClick={() => {
                        setStudentDynamicTab('active');
                        triggerToast('已切换至本周“最积极主导”的活跃学生榜');
                      }}
                      className={`flex-1 py-1.5 text-center text-xs font-black transition-all border-b-2 ${
                        studentDynamicTab === 'active' 
                          ? 'text-blue-600 border-blue-500' 
                          : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      活跃学生
                    </button>
                    <button 
                      onClick={() => {
                        setStudentDynamicTab('attention');
                        triggerToast('⚠️ 正在过滤长期不及格或作业逾期的学生清单...');
                      }}
                      className={`flex-1 py-1.5 text-center text-xs font-black transition-all border-b-2 ${
                        studentDynamicTab === 'attention' 
                          ? 'text-red-500 border-red-500' 
                          : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      需要关注
                    </button>
                  </div>

                  {/* Core Items lists mapping accurately */}
                  <div className="flex-1 space-y-3.5 pr-0.5">
                    {studentDynamicTab === 'active' ? (
                      <>
                        {/* Li Ming */}
                        <div className="flex items-center gap-3 text-left">
                          <img 
                            alt="李明" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            referrerPolicy="no-referrer"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline select-none">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">李明</span>
                              <span className="text-[10px] text-slate-400 font-bold">累计学习 12.5 小时</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 font-sans">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '98%' }}></div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-black shrink-0">98%</span>
                            </div>
                          </div>
                        </div>

                        {/* Wang Xiaohua */}
                        <div className="flex items-center gap-3 text-left">
                          <img 
                            alt="王晓华" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            referrerPolicy="no-referrer"
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline select-none">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">王晓华</span>
                              <span className="text-[10px] text-slate-400 font-bold">累计学习 10.2 小时</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 font-sans">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-black shrink-0">85%</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Needs attention student 1 */}
                        <div className="flex items-center gap-3 text-left">
                          <img 
                            alt="赵磊" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            referrerPolicy="no-referrer"
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline select-none">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">赵磊</span>
                              <span className="text-[10px] text-red-500 font-bold">进度停滞 5 天</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 font-sans">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: '42%' }}></div>
                              </div>
                              <span className="text-[10px] text-red-500 font-black shrink-0">42%</span>
                            </div>
                          </div>
                        </div>

                        {/* Needs attention student 2 */}
                        <div className="flex items-center gap-3 text-left">
                          <img 
                            alt="钱芳" 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            referrerPolicy="no-referrer"
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline select-none">
                              <span className="font-extrabold text-xs md:text-sm text-slate-800">钱芳</span>
                              <span className="text-[10px] text-slate-400 font-bold">2个作业待交</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 font-sans">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: '56%' }}></div>
                              </div>
                              <span className="text-[10px] text-amber-500 font-black shrink-0">56%</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100/60 mt-auto text-center shrink-0">
                    <button 
                      onClick={() => triggerToast('👤 已为您同步本学期所有不活跃或需要关注的学生名单！')}
                      className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline cursor-pointer"
                    >
                      看全部动态
                    </button>
                  </div>
                </div>

                {/* Box C: Top Errors & Resources Summary */}
                <div className="flex flex-col gap-4 min-h-[360px]">
                  
                  {/* Upper: High Frequency Errors TOP3 */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-4 flex flex-col flex-grow select-none text-left font-sans">
                    <header className="pb-2 border-b border-slate-100/60 shrink-0 mb-2">
                      <h3 className="font-extrabold text-xs md:text-sm text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-red-500 rounded-full"></span>
                        高频错误 TOP3
                      </h3>
                    </header>

                    <div className="flex-grow flex flex-col justify-center space-y-3 font-semibold text-xs py-1">
                      {/* Error Item 1 */}
                      <div className="flex justify-between items-center text-xs group cursor-pointer" onClick={() => triggerToast('💡 [AI解析] 动态规划状态转移方程理解错误：23% 的学生对递推初值及状态覆盖存在阻碍，建议在习题课着重讲解。')}>
                        <div className="flex gap-2 items-center truncate">
                          <span className="text-red-500 font-black w-4 text-center">1</span>
                          <span className="text-slate-600 truncate group-hover:text-blue-600 transition-colors">
                            动态规划 - 状态转移方程理解错误
                          </span>
                        </div>
                        <span className="font-black text-slate-900 ml-2">23%</span>
                      </div>

                      {/* Error Item 2 */}
                      <div className="flex justify-between items-center text-xs group cursor-pointer" onClick={() => triggerToast('💡 [AI解析] 递归终止条件判断错误：18% 的学子忘记对非递归边界进行防御回归。')}>
                        <div className="flex gap-2 items-center truncate">
                          <span className="text-amber-500 font-black w-4 text-center">2</span>
                          <span className="text-slate-600 truncate group-hover:text-amber-600 transition-colors">
                            递归算法 - 递归终止条件判断
                          </span>
                        </div>
                        <span className="font-black text-slate-900 ml-2">18%</span>
                      </div>

                      {/* Error Item 3 */}
                      <div className="flex justify-between items-center text-xs group cursor-pointer" onClick={() => triggerToast('💡 [AI解析] 链表双向断开指针操作错频：15% 的学生写栈与表插入时造成空端挂死。')}>
                        <div className="flex gap-2 items-center truncate">
                          <span className="text-yellow-500 font-black w-4 text-center">3</span>
                          <span className="text-slate-600 truncate group-hover:text-yellow-600 transition-colors">
                            数据结构 - 链表双向指针断开
                          </span>
                        </div>
                        <span className="font-black text-slate-900 ml-2">15%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100/60 text-center shrink-0 mt-auto">
                      <button 
                        onClick={() => triggerToast('💡 已聚类分析出各班核心难点的易错考查切片！')}
                        className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline cursor-pointer"
                      >
                        详情诊断
                      </button>
                    </div>
                  </div>

                  {/* Lower: Teaching Resources usage */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-4 flex flex-col justify-between select-none text-left h-[160px] shrink-0 font-sans">
                    <header className="pb-1.5 border-b border-slate-100/60 shrink-0">
                      <h3 className="font-extrabold text-xs md:text-sm text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-blue-500 rounded-full"></span>
                        教学资源使用统计 <span className="text-[10px] font-normal text-slate-400">（本月）</span>
                      </h3>
                    </header>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center">
                      {/* Item 1 */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-1 shadow-3xs text-xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-black">课件资源</p>
                        <p className="font-black text-slate-800 text-sm mt-0.5">156</p>
                      </div>

                      {/* Item 2 */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center mb-1 shadow-3xs text-xs">
                          <Database className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-black">题库资源</p>
                        <p className="font-black text-slate-800 text-sm mt-0.5">892</p>
                      </div>

                      {/* Item 3 */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center mb-1 shadow-3xs text-xs">
                          <Video className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-black">视频资源</p>
                        <p className="font-black text-slate-800 text-sm mt-0.5">45</p>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100/60 text-center shrink-0 mt-auto font-semibold text-xs text-blue-600">
                      <button 
                        onClick={() => {
                          setActiveSidebarView('courses');
                          setActiveCourseDetailTab('resources');
                          triggerToast('正在拉取并切换至课程多媒体教资切片数据面板...');
                        }}
                        className="hover:text-blue-700 hover:underline cursor-pointer font-bold"
                      >
                        教资大纲比对
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bento cells detailing stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none animate-fadeIn">
                
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs">
                  <h3 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
                    近期重点答疑考点词频统计
                  </h3>
                  <div className="space-y-4 mt-2 font-semibold">
                    <div>
                      <div className="flex justify-between text-xs select-none">
                        <span className="text-slate-600">1. 【时间复杂度与空间寻址模型】(绪论概念)</span>
                        <span className="text-indigo-600 text-[11px]">42次索问</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mt-1 select-none">
                        <span className="text-slate-600">2. 【双单向循环链表空值指针边界判空】</span>
                        <span className="text-indigo-600 text-[11px]">29次索问</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mt-1 select-none">
                        <span className="text-slate-600">3. 【Dijkstra单源残差路径矩阵更新演算】</span>
                        <span className="text-indigo-600 text-[11px]">18次索问</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-3xs select-none">
                  <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
                    活跃教学班级提交质量雷达
                  </h3>
                  <div className="space-y-3 font-semibold text-xs text-slate-600">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/60 items-center">
                      <span>计算机科学与技术2022级1班</span>
                      <span className="text-emerald-600 text-[11px]">提交率 98.4% · 均分优秀</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/60 items-center">
                      <span>计算机科学与技术2022级2班</span>
                      <span className="text-amber-600 text-[11px]">提交率 94.1% · 建议AI错题推送</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/60 items-center">
                      <span>软件工程高级实践创新班</span>
                      <span className="text-indigo-600 text-[11px]">自测覆盖率 100% · 代码切片健全</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom CTA navigation button */}
              <div className="text-center pt-3 select-none">
                <button 
                  onClick={() => {
                    setActiveSidebarView('courses');
                    triggerToast('已为您切换至系统精品学科章节大纲列表。');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2 group hover:shadow-lg transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>管理精品学科的章节大纲及微课卡片</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

            </div>
          </main>
        )}

      </div>

      {/* ======================================================== */}
      {/* 5. REACT MODAL DIALOGS AND FORMS EXECUTING SECURELY */}
      {/* ======================================================== */}

      {/* ─── RESOURCE LIBRARY DIALOGS AND FORMS ─── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100 animate-slideUp">
            
            <header className="flex justify-between items-center mb-5 select-none text-left">
              <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4.5 bg-blue-600 rounded-full inline-block"></span>
                上传新教学课资
              </h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-black cursor-pointer"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleCreateResource} className="space-y-4 text-left font-sans">
              
              {/* File upload drag-and-drop placeholder visual block */}
              <div 
                onClick={() => {
                  const inputName = prompt('请模拟选择本地文件上传，输入文件名：', 'Java多线程并发实战教案.pdf');
                  if (inputName) {
                    setResFormName(inputName);
                    if (inputName.endsWith('.pdf')) setResFormType('教材');
                    else if (inputName.endsWith('.pptx') || inputName.endsWith('.ppt')) setResFormType('PPT');
                    else if (inputName.endsWith('.docx') || inputName.endsWith('.doc')) setResFormType('讲义');
                    else setResFormType('标准代码');
                    triggerToast(`📎 成功模拟选中本地临时文件: ${inputName}`);
                  }
                }}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/10"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-2.5 shadow-3xs">
                  <Upload className="w-5 h-5" />
                </div>
                {resFormName ? (
                  <div>
                    <span className="text-xs font-black text-blue-600 block">{resFormName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">点击可更换本地要模拟上传的文件</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">点击此处或拖拽本地课件文件进行上传</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">支持 PDF, PPTX, DOCX, ZIP, JAVA 等多类教学课件，大小限制 50M</span>
                  </div>
                )}
              </div>

              {/* Resource Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">* 资源显示标题名称</label>
                <input 
                  type="text" 
                  required
                  value={resFormName}
                  onChange={(e) => setResFormName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Java高级核心大纲.pdf"
                />
              </div>

              {/* Resource Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">课件教案补充描述 (可选)</label>
                <textarea 
                  value={resFormDesc}
                  onChange={(e) => setResFormDesc(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 简短描述该大纲课件的讲解目标或核心覆盖范围。"
                  rows={2}
                />
              </div>

              {/* Course & Chapter Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 指派关联课程</label>
                  <select 
                    value={resFormCourse}
                    onChange={(e) => {
                      setResFormCourse(e.target.value);
                      const course = resourceCourses.find(c => c.name === e.target.value);
                      if (course && course.chapters.length > 0) {
                        setResFormChapter(course.chapters[0].name);
                      } else {
                        setResFormChapter('全书综合章');
                      }
                    }}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    {resourceCourses.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 指派关联教学章节</label>
                  <select 
                    value={resFormChapter}
                    onChange={(e) => setResFormChapter(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    {resourceCourses.find(c => c.name === resFormCourse)?.chapters.map(ch => (
                      <option key={ch.name} value={ch.name}>{ch.name}</option>
                    )) || <option value="全书综合章">全书综合章</option>}
                  </select>
                </div>
              </div>

              {/* Resource Type & Size Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 资源格式分类</label>
                  <select 
                    value={resFormType}
                    onChange={(e) => setResFormType(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="教材">教材 (课本PDF)</option>
                    <option value="PPT">PPT (讲授演示)</option>
                    <option value="讲义">讲义 (复习纲要)</option>
                    <option value="标准代码">标准代码 (工程案例)</option>
                    <option value="典型错例">典型错例 (错题微例)</option>
                    <option value="练习题">练习题 (课外自测)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 估算文件容量大小</label>
                  <input 
                    type="text" 
                    required
                    value={resFormSize}
                    onChange={(e) => setResFormSize(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="e.g. 5.6 MB"
                  />
                </div>
              </div>

              {/* Checkbox tags */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">赋予标签 (复选，可多选控制分类)</label>
                <div className="flex flex-wrap gap-2">
                  {resourceTags.map(tagObj => {
                    const isSelected = resFormTags.includes(tagObj.name);
                    return (
                      <button 
                        type="button"
                        key={tagObj.name}
                        onClick={() => {
                          if (isSelected) {
                            setResFormTags(prev => prev.filter(t => t !== tagObj.name));
                          } else {
                            setResFormTags(prev => [...prev, tagObj.name]);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {tagObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Foot action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={!resFormName}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-md disabled:cursor-not-allowed hover:shadow transition-all"
                >
                  开始录入上传并生效
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100 animate-slideUp">
            
            <header className="flex justify-between items-center mb-5 select-none text-left">
              <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4.5 bg-blue-600 rounded-full inline-block"></span>
                在线编辑教研资源款目
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-black cursor-pointer"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSaveEditRes} className="space-y-4 text-left font-sans">
              
              {/* Resource Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">* 资源显示标题名称</label>
                <input 
                  type="text" 
                  required
                  value={resFormName}
                  onChange={(e) => setResFormName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Java高级核心大纲.pdf"
                />
              </div>

              {/* Resource Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">课件教案补充描述 (可选)</label>
                <textarea 
                  value={resFormDesc}
                  onChange={(e) => setResFormDesc(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 描述大纲覆盖知识范围..."
                  rows={2}
                />
              </div>

              {/* Course & Chapter Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 指派关联课程</label>
                  <select 
                    value={resFormCourse}
                    onChange={(e) => {
                      setResFormCourse(e.target.value);
                      const course = resourceCourses.find(c => c.name === e.target.value);
                      if (course && course.chapters.length > 0) {
                        setResFormChapter(course.chapters[0].name);
                      } else {
                        setResFormChapter('全书综合章');
                      }
                    }}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    {resourceCourses.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 指派关联教学章节</label>
                  <select 
                    value={resFormChapter}
                    onChange={(e) => setResFormChapter(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    {resourceCourses.find(c => c.name === resFormCourse)?.chapters.map(ch => (
                      <option key={ch.name} value={ch.name}>{ch.name}</option>
                    )) || <option value="全书综合章">全书综合章</option>}
                  </select>
                </div>
              </div>

              {/* Resource Type & Size Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 资源格式分类</label>
                  <select 
                    value={resFormType}
                    onChange={(e) => setResFormType(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="教材">教材 (课本PDF)</option>
                    <option value="PPT">PPT (讲授演示)</option>
                    <option value="讲义">讲义 (复习纲要)</option>
                    <option value="标准代码">标准代码 (工程案例)</option>
                    <option value="典型错例">典型错例 (错题微例)</option>
                    <option value="练习题">练习题 (课外自测)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">* 估算文件容量大小</label>
                  <input 
                    type="text" 
                    required
                    value={resFormSize}
                    onChange={(e) => setResFormSize(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="e.g. 5.6 MB"
                  />
                </div>
              </div>

              {/* Checkbox tags */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">赋予标签 (复选控制分类)</label>
                <div className="flex flex-wrap gap-2">
                  {resourceTags.map(tagObj => {
                    const isSelected = resFormTags.includes(tagObj.name);
                    return (
                      <button 
                        type="button"
                        key={tagObj.name}
                        onClick={() => {
                          if (isSelected) {
                            setResFormTags(prev => prev.filter(t => t !== tagObj.name));
                          } else {
                            setResFormTags(prev => [...prev, tagObj.name]);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-3xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {tagObj.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Foot action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={!resFormName}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl shadow-md disabled:cursor-not-allowed hover:shadow transition-all"
                >
                  保存更新并提交同步
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* C. TEACHER TODO WORKSPACE INTERACTIVE MODAL */}
      {activeTeacherTask !== null && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[620px] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp text-slate-800 dark:text-slate-100">
            
            {/* Header */}
            <header className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-xl text-white shadow ${
                  activeTeacherTask === '作业' ? 'bg-amber-500' :
                  activeTeacherTask === '提问' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`}>
                  {activeTeacherTask === '作业' && <FileText className="w-5 h-5" />}
                  {activeTeacherTask === '提问' && <MessageSquare className="w-5 h-5" />}
                  {activeTeacherTask === '互动' && <Users className="w-5 h-5" />}
                </span>
                <div className="text-left">
                  <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                    智慧导师决策交互舱
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/10">
                      Interactive Hub
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">授课导师：李老师 • 正在精准推进：{
                    activeTeacherTask === '作业' ? '待批改学生微作业大纲指标' :
                    activeTeacherTask === '提问' ? '在线多模态微解答与大模型研判' :
                    '现场课堂大屏投屏分组互动点评'
                  }</p>
                </div>
              </div>

              {/* Close and quick tab controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['作业', '提问', '互动'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTeacherTask(tab);
                        if (tab === '作业') {
                          setSaActiveIndex(0);
                          setSaGradingScore(studentAnswersList[0]?.score || 85);
                          setSaGradingComment("");
                        } else if (tab === '提问') {
                          setSqActiveIndex(0);
                          setSqReplyText("");
                        } else if (tab === '互动') {
                          setGdReplyText("");
                        }
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        activeTeacherTask === tab 
                          ? 'bg-white dark:bg-slate-905 text-slate-800 dark:text-white shadow-3xs' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}面板
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setActiveTeacherTask(null);
                    triggerToast('已为您临时挂起当前教研决策交互舱，数据均已云同步。');
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 rounded-full transition-all cursor-pointer hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Content Body Layout */}
            <div className="flex-1 flex overflow-hidden min-h-0 bg-white dark:bg-slate-900">
              
              {/* 1. WORKFLOW VIEW: HOMEWORK GRADING */}
              {activeTeacherTask === '作业' && (
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Left Rail: List of student submissions */}
                  <div className="w-62 border-r border-slate-100 dark:border-slate-800 flex flex-col p-4 shrink-0 bg-slate-50/30 dark:bg-slate-950/20 overflow-y-auto">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mb-3 block tracking-widest text-left">待阅学生队列</span>
                    <div className="space-y-2">
                      {studentAnswersList.map((sa, idx) => (
                        <button
                          key={sa.id}
                          onClick={() => {
                            setSaActiveIndex(idx);
                            setSaGradingScore(sa.score);
                            setSaGradingComment("");
                          }}
                          className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            saActiveIndex === idx
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-3xs'
                              : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{sa.student}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              sa.finished 
                                ? 'bg-emerald-50 text-emerald-500 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                : 'bg-amber-50 text-amber-500 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse'
                            }`}>
                              {sa.finished ? '已阅' : '待阅'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-semibold">{sa.answer}</p>
                          {sa.finished && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">成绩评分：{sa.score}分</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Content Pane */}
                  <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left space-y-5">
                    {/* Course details & problem header */}
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">高保真自适应作业评测</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">科目：数据结构与算法</span>
                      </div>
                      <h4 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        考查知识点：链表局部反转算法的指针覆盖防崩溃设计
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                        题目要求：请简述单链表原地逆序反转的核心指针迭代机制，并特别阐述如何防范由前驱及后继指针覆盖导致链表段落挂靠断空崩溃的问题。
                      </p>
                    </div>

                    {/* Active student submission details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
                        <span className="text-[11px] font-black text-slate-400">【{studentAnswersList[saActiveIndex]?.student}】提交的原生代码与文字思路：</span>
                      </div>
                      <div className="p-4 bg-slate-950 font-mono text-cyan-400 text-xs rounded-xl border border-slate-850 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap max-h-[130px] shadow-inner">
                        {studentAnswersList[saActiveIndex]?.answer}
                      </div>
                    </div>

                    {/* Scoring & Comments Input Zone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Slider Scoring */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-slate-600 dark:text-slate-350">本题量得分评定 (Score)</span>
                            <span className="text-base md:text-lg font-black text-blue-600 dark:text-blue-400">{saGradingScore} <span className="text-xs text-slate-400 font-bold">/ 100 分</span></span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            step="1"
                            value={saGradingScore}
                            onChange={(e) => setSaGradingScore(parseInt(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-3">
                          {[60, 75, 85, 95, 100].map((sc) => (
                            <button
                              key={sc}
                              onClick={() => setSaGradingScore(sc)}
                              className="px-2 py-1 text-[10px] font-black rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 cursor-pointer"
                            >
                              {sc}分
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Assistant helper & presets */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-600 dark:text-slate-350">名师智能辅导评语</span>
                          <button
                            type="button"
                            onClick={() => {
                              const curStudent = studentAnswersList[saActiveIndex]?.student;
                              if (curStudent === "李沐阳") {
                                setSaGradingScore(98);
                                setSaGradingComment("【AI智能辅助阅卷】算法思路全面。精准指明了双指针 prev 与 curr 的跳转配合，同时对末尾断空防崩溃的指针保留做出了极其严谨的说明，建议予以最高认可。建议继续保持！");
                              } else if (curStudent === "马化凡") {
                                setSaGradingScore(82);
                                setSaGradingComment("【AI智能辅助阅卷】应用辅助栈来进行空间逆序是一个可行的过渡思路。时间复杂度在O(n)内成型，但带来了额外的O(n)空间复杂开销，偏离了题目要求的『原地逆序』。建议课后对比练习双指针的原地翻转方法以降低内存占用。");
                              } else {
                                setSaGradingScore(88);
                                setSaGradingComment("【AI智能辅助阅卷】递归代码设计书写标准规范。逻辑回归严丝合缝，但需要格外警惕递归调用引起的方法栈深度，如果测试集存在大容量链表，容易造成系统栈溢出 StackOverflow 错误。整体表现相当出色。");
                              }
                              triggerToast('💡 AI 阅卷意见与评语推荐加载成功！', 'success');
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-805 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>💡 AI 智能评卷建议</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={saGradingComment}
                          onChange={(e) => setSaGradingComment(e.target.value)}
                          placeholder="请输入该生批改评语，或点击右上角AI辅助一键分析推荐..."
                          className="w-full text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Grade Actions */}
                    <div className="flex justify-end gap-3 pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...studentAnswersList];
                          updatedList[saActiveIndex].finished = true;
                          updatedList[saActiveIndex].score = saGradingScore;
                          setStudentAnswersList(updatedList);

                          // Reduce task count
                          setTeacherTodoTasks((prev) => prev.map(t => t.type === '作业' ? { ...t, count: Math.max(0, t.count - 1), desc: `本周尚有 ${Math.max(0, t.count - 1)} 份全学科大纲作业待批` } : t));
                          
                          triggerToast(`🎉 【${studentAnswersList[saActiveIndex].student}】的作业已成功录得分数 ${saGradingScore} 分并同步学籍档！`, 'success');
                          
                          // Synthesize audio chime
                          try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
                            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
                            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.start();
                            osc.stop(audioCtx.currentTime + 0.2);
                          } catch (_) {}

                          // Auto advance next
                          if (saActiveIndex < studentAnswersList.length - 1) {
                            setSaActiveIndex(saActiveIndex + 1);
                            setSaGradingScore(studentAnswersList[saActiveIndex + 1].score);
                            setSaGradingComment("");
                          } else {
                            triggerToast('👍 本轮快捷预发布阅改队列已全部推进完毕！', 'success');
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-500/10 hover:shadow active:scale-95 transition-all text-center flex items-center gap-1.5 cursor-pointer border-none"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>同步录入并批出成绩</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. WORKFLOW VIEW: STUDENT ASKS REPLY */}
              {activeTeacherTask === '提问' && (
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Left Rail: List of studentasks */}
                  <div className="w-62 border-r border-slate-100 dark:border-slate-800 flex flex-col p-4 shrink-0 bg-slate-50/30 dark:bg-slate-950/20 overflow-y-auto">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mb-3 block tracking-widest text-left">未解答学生求助提问</span>
                    <div className="space-y-2 text-left">
                      {studentAsksList.map((sq, idx) => (
                        <button
                          key={sq.id}
                          onClick={() => {
                            setSqActiveIndex(idx);
                            setSqReplyText("");
                          }}
                          className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            sqActiveIndex === idx
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-3xs'
                              : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{sq.student}同学</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              sq.status === 'answered'
                                ? 'bg-emerald-50 text-emerald-500 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                : 'bg-red-50 text-red-500 border border-red-100 dark:bg-red-950/30 dark:text-red-400 animate-pulse'
                            }`}>
                              {sq.status === 'answered' ? '已处理' : '急需答疑'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate font-semibold">{sq.q}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Content Pane */}
                  <div className="flex-1 flex flex-col p-6 overflow-y-auto text-left space-y-5 select-text">
                    {/* Active Question Box */}
                    <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-955 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black border border-blue-200 dark:border-blue-800">
                          提问主题：{sqActiveIndex === 0 ? '算法差异探究' : sqActiveIndex === 1 ? '线性结构安全特性' : '高级检索树分析'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">提问人：{studentAsksList[sqActiveIndex]?.student}同学</span>
                      </div>
                      <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-relaxed text-left">
                        ❓ “{studentAsksList[sqActiveIndex]?.q}”
                      </p>
                    </div>

                    {/* Editor response box */}
                    <div className="space-y-2 flex-grow flex flex-col">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                          <span className="w-1.5 h-3 bg-blue-500 rounded-full inline-block"></span>
                          导师专业讲评解答：
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setSqReplyText(studentAsksList[sqActiveIndex]?.aiGeneratedReply || "");
                            triggerToast('🪄 已通过大模型底稿进行高精度格式化讲评撰写！', 'success');
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-black flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900 cursor-pointer animate-pulse"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>💡 AI 一键辅助推荐最佳专家解答</span>
                        </button>
                      </div>

                      <textarea
                        rows={8}
                        value={sqReplyText}
                        onChange={(e) => setSqReplyText(e.target.value)}
                        placeholder="请输入您的答疑意见与讲评代码。您也可以直接点击右上方AI一键调用按钮直接载入严密推导底页..."
                        className="w-full flex-grow text-xs font-bold font-sans rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed shadow-inner"
                      />
                    </div>

                    {/* Replying Action Footer */}
                    <div className="flex justify-end gap-3 pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        disabled={!sqReplyText.trim()}
                        onClick={() => {
                          const updatedList = [...studentAsksList];
                          updatedList[sqActiveIndex].status = "answered";
                          setStudentAsksList(updatedList);

                          // Reduce tasks count for prompt
                          setTeacherTodoTasks((prev) => prev.map(t => t.type === '提问' ? { ...t, count: Math.max(0, t.count - 1), desc: `有 ${Math.max(0, t.count - 1)} 条热点问答等待大模型微调审核` } : t));

                          triggerToast(`📬 回复已成功同步推送并发布到该生的答疑板块中心！`, 'success');

                          // play feedback tone
                          try {
                            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc = audioCtx.createOscillator();
                            const gain = audioCtx.createGain();
                            osc.type = 'triangle';
                            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                            osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
                            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                            osc.connect(gain);
                            gain.connect(audioCtx.destination);
                            osc.start();
                            osc.stop(audioCtx.currentTime + 0.2);
                          } catch (_) {}

                          // Advance next if possible
                          if (sqActiveIndex < studentAsksList.length - 1) {
                            setSqActiveIndex(sqActiveIndex + 1);
                            setSqReplyText("");
                          } else {
                            triggerToast('🎉 今日所有急需督导的求助提问已完美推进并妥投完毕！', 'success');
                          }
                        }}
                        className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all text-center flex items-center gap-1.5 cursor-pointer border-none ${
                          sqReplyText.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-755 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>推送讲评并同步发布</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* 3. WORKFLOW VIEW: CLASSROOM REAL-TIME MONITOR / COMMENTS */}
              {activeTeacherTask === '互动' && (
                <div className="flex-1 flex flex-col p-6 text-left space-y-4">
                  {/* Banner header of current active discussions */}
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 p-4 rounded-2xl shrink-0 select-text">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black border border-emerald-200 dark:border-emerald-800">
                        课堂正在进行的实时热烈脑暴讨论组
                      </span>
                      <span className="text-xs text-orange-500 font-extrabold animate-pulse">● 实时监听中 (Realtime Link)</span>
                    </div>
                    <h4 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      课题：{groupDiscussionSelected.topic}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                      互动成员：陈维宇、孙立宏、余华 等2024级精品卓越班级学员
                    </p>
                  </div>

                  {/* Chat feed layout & Intervention area */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                    {/* Left feed: chat details */}
                    <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-4 overflow-y-auto flex flex-col justify-between select-text">
                      <div className="space-y-3.5">
                        <span className="text-[10px] text-slate-400 font-black block border-b border-dashed border-slate-150- dark:border-slate-800 pb-1.5">学生发言追踪</span>
                        {groupDiscussionSelected.chat.map((msg, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 text-left block">{msg.who}：</span>
                            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-800 leading-relaxed shadow-3xs text-left">
                              {msg.speech}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold text-center mt-3 shrink-0">
                        🎯 提示：李老师，孙同学的探讨其实指出了内存布局与逻辑模型的核心边界，极为难得，建议通过下方绿色按钮给他们组 “+2” 学分激励！
                      </div>
                    </div>

                    {/* Right console: Intervention suggestion & feedback dispatch */}
                    <div className="flex flex-col justify-between border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-905">
                      <div className="space-y-2 flex-1 flex flex-col">
                        <div className="flex justify-between items-center shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                            定制介入指导讲评输入：
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setGdReplyText(groupDiscussionSelected.aiGuidance);
                              triggerToast('💡 已为您一键载入对该组脑暴的精准教辅介入词！', 'success');
                            }}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>💡 AI一键撰写介入词</span>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={gdReplyText}
                          onChange={(e) => setGdReplyText(e.target.value)}
                          placeholder="请输入点评，或通过右上方AI辅助一键生成标准学术纠偏反馈..."
                          className="w-full flex-grow text-xs font-bold font-sans rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed shadow-inner"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast('🏆 已激励全组成员 +2 学分并下发大屏喜报！', 'success');
                            try {
                              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                              const osc1 = audioCtx.createOscillator();
                              const osc2 = audioCtx.createOscillator();
                              const gain = audioCtx.createGain();
                              
                              osc1.type = 'sine';
                              osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                              osc1.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.15); // C6

                              osc2.type = 'sine';
                              osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
                              osc2.frequency.exponentialRampToValueAtTime(1318.51, audioCtx.currentTime + 0.15); // E6
                              
                              gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                              
                              osc1.connect(gain);
                              osc2.connect(gain);
                              gain.connect(audioCtx.destination);
                              
                              osc1.start();
                              osc2.start();
                              osc1.stop(audioCtx.currentTime + 0.7);
                              osc2.stop(audioCtx.currentTime + 0.7);
                            } catch (_) {}
                          }}
                          className="px-4 py-2 text-[11px] font-black shrink-0 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-xl hover:scale-102 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          <span>授予学分和勋章励志</span>
                        </button>

                        <button
                          type="button"
                          disabled={!gdReplyText.trim()}
                          onClick={() => {
                            // Reduce tasks count for interaction from 3 to 2
                            setTeacherTodoTasks((prev) => prev.map(t => t.type === '互动' ? { ...t, count: Math.max(0, t.count - 1), desc: `有 ${Math.max(0, t.count - 1)} 个正在互动的活跃讨论组建议关注` } : t));

                            triggerToast(`🖥️ 点评指导已直接投送广播在大屏和各个学生的个人笔记终端上！`, 'success');
                            setGdReplyText("");
                            setActiveTeacherTask(null);
                          }}
                          className={`px-5 py-2 text-xs font-black rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                            gdReplyText.trim()
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-750 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          <span>广播讲评意见到全组</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* General Help tip footer */}
            <footer className="p-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between text-[10px] text-slate-400 font-bold select-none px-6">
              <span>💡 温馨提示：教师可以通过“作业”、“提问”和“互动”选项卡快速穿梭批注。</span>
              <span>同步频率：实时自检并云端录档中</span>
            </footer>

          </div>
        </div>
      )}

      {/* A. Create New Course Modal Dialect */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-slate-100 animate-slideUp">
            
            <header className="flex justify-between items-center mb-5 select-none">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4.5 bg-blue-600 rounded-full inline-block"></span>
                创建精品教学课程档案
              </h3>
              <button 
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 text-xl font-black transition-colors"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              
              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 mb-1">* 课程精品课命名</label>
                <input 
                  type="text" 
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 机器学习与大模型优化"
                />
              </div>

              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 mb-1">唯一课程代码 (英文/数字缩写)</label>
                <input 
                  type="text" 
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="e.g. CS410 (可选，不选则自动分配)"
                />
              </div>

              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 mb-1">* 教学开课物理学期</label>
                <select 
                  value={newCourseTerm}
                  onChange={(e) => setNewCourseTerm(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500 bg-white text-slate-800"
                >
                  <option>2024春季学期</option>
                  <option>2024秋季学期</option>
                  <option>2025新创学期</option>
                </select>
              </div>

              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 mb-1">主授行政班级</label>
                <input 
                  type="text" 
                  value={newCourseClasses}
                  onChange={(e) => setNewCourseClasses(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 计算机类2022级3班、4班"
                />
              </div>

              <div className="pt-3 flex gap-3 select-none">
                <button 
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 bg-white cursor-pointer"
                >
                  取消创建
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-98 cursor-pointer"
                >
                  确认挂牌开课
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* B. Add Chapter Modal Dialect */}
      {isAddChapterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-slideUp">
            
            <header className="flex justify-between items-center mb-5 select-none">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"></span>
                挂载新章节结点
              </h3>
              <button 
                onClick={() => setIsAddChapterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-black"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleCreateChapter} className="space-y-4">
              
              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-400 mb-1">所属学科</label>
                <div className="text-xs font-black text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {activeCourse.title}
                </div>
              </div>

              <div className="text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 mb-1">* 章节业务标题</label>
                <input 
                  type="text" 
                  required
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 树的表示及堆排序优化"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  * 自动分配：系统将按照物理尾排算法，将其排序在前置章节之后。
                </p>
              </div>

              <div className="pt-3 flex gap-3 select-none">
                <button 
                  type="button"
                  onClick={() => setIsAddChapterModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-98"
                >
                  确认挂在树上
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* C. Add Homework Modal */}
      {isAddHomeworkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-slideUp text-slate-800">
            
            <header className="flex justify-between items-center mb-5 select-none text-left">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                布置随堂考核作业
              </h3>
              <button 
                onClick={() => setIsAddHomeworkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-black cursor-pointer"
              >
                ×
              </button>
            </header>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newHomeworkTitle.trim() || !newHomeworkDeadline.trim()) {
                  triggerToast('题目名称/截止日期填写不完整！', 'error');
                  return;
                }
                const newH = {
                  id: 'h_' + Date.now(),
                  title: newHomeworkTitle.trim(),
                  course: newHomeworkCourse,
                  chapter: '章末综合单元训练',
                  classes: '2024级计算机1班, 2024级软件1班',
                  deadline: newHomeworkDeadline,
                  publishTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  submittedCount: 0,
                  totalCount: 100,
                  status: '进行中',
                  avgScore: 0,
                  highestScore: 0,
                  lowestScore: 0,
                  questionCount: 6,
                  fullScore: 100,
                  scoreDistribution: [0, 0, 0, 0, 0],
                  classAverages: [
                    { name: '2024级计算机1班 (86人)', score: 0 },
                    { name: '2024级软件1班 (54人)', score: 0 }
                  ]
                };
                setHomeworkList([newH, ...homeworkList]);
                setIsAddHomeworkModalOpen(false);
                setNewHomeworkTitle('');
                triggerToast(`🎉 成功分发随堂训练《${newHomeworkTitle}》至对应选课单元！`, 'success');
              }} 
              className="space-y-4"
            >
              
              <div className="text-left font-sans text-xs">
                <label className="block text-xs font-bold text-slate-500 mb-1">选择考核课程</label>
                <select 
                  value={newHomeworkCourse}
                  onChange={(e) => setNewHomeworkCourse(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white"
                >
                  <option>数据结构</option>
                  <option>算法设计与分析基础</option>
                  <option>计算机组成原理课程设计</option>
                </select>
              </div>

              <div className="text-left font-sans text-xs">
                <label className="block text-xs font-bold text-slate-500 mb-1">* 作业训练名称</label>
                <input 
                  type="text" 
                  required
                  value={newHomeworkTitle}
                  onChange={(e) => setNewHomeworkTitle(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white"
                  placeholder="e.g. 树深度递归探索随堂练"
                />
              </div>

              <div className="text-left font-sans text-xs">
                <label className="block text-xs font-bold text-slate-500 mb-1">* 提交截止时间</label>
                <input 
                  type="date" 
                  required
                  value={newHomeworkDeadline}
                  onChange={(e) => setNewHomeworkDeadline(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 p-2.5 bg-white"
                />
              </div>

              <div className="pt-3 flex gap-3 select-none text-xs">
                <button 
                  type="button"
                  onClick={() => setIsAddHomeworkModalOpen(false)}
                  className="flex-1 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-98 cursor-pointer"
                >
                  确认并立即派发
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ─── ERROR DETAIL MODAL DIALOG FOR LEARNING DIAGNOSTICS ─── */}
      {showErrorDetailModal && selectedErrorExample && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[999] animate-fadeIn backdrop-blur-xs text-left">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative border border-slate-100 animate-slideUp max-h-[90vh] overflow-y-auto">
            
            <header className="flex justify-between items-center mb-5 select-none text-left border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-red-655 bg-red-50 font-black rounded px-2 py-0.5 uppercase tracking-wide border border-red-100">
                  {selectedErrorExample.type}
                </span>
                <h3 className="text-base md:text-lg font-black text-slate-950 mt-1 flex items-center gap-1.5 leading-tight">
                  <span className="w-1.5 h-4.5 bg-red-600 rounded-full inline-block"></span>
                  大模型诊断：{selectedErrorExample.title}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowErrorDetailModal(false);
                  setSelectedErrorExample(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-black cursor-pointer leading-none p-1 border-none bg-transparent"
              >
                ×
              </button>
            </header>

            <div className="space-y-4 text-left font-sans text-xs">
              
              {/* Context metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 text-[11px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <div>
                  <span>频发次数:</span>
                  <strong className="text-red-655 ml-1 font-mono font-black">{selectedErrorExample.count} 次</strong>
                </div>
                <div>
                  <span>捕获演化周期:</span>
                  <strong className="text-slate-800 ml-1 leading-none">{selectedErrorExample.date}</strong>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span>诊断匹配可靠指数:</span>
                  <strong className="text-emerald-600 ml-1">98.4% 高可信</strong>
                </div>
              </div>

              {/* Fail Reason */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase">1. 薄弱逻辑深层次诱因</span>
                <p className="p-3 bg-red-50/20 border border-red-100 rounded-xl text-slate-600 leading-relaxed font-semibold">
                  {selectedErrorExample.reason}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase">2. 编译测试点比对与修正树 (C++)</span>
                <div className="bg-slate-905 bg-slate-900 leading-normal rounded-xl p-4 font-mono text-[11px] text-teal-300 overflow-x-auto select-text whitespace-pre">
                  {selectedErrorExample.codeOrContent}
                </div>
              </div>

            </div>

            {/* Foot action buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
              <button 
                type="button"
                onClick={() => {
                  setShowErrorDetailModal(false);
                  setSelectedErrorExample(null);
                }}
                className="px-4 py-2 text-xs font-bold border border-slate-205 text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                完成
              </button>
              <button 
                type="button"
                onClick={() => {
                  triggerToast(`已推送大模型纠错切片分析至该生的自学控制台！`);
                  setShowErrorDetailModal(false);
                  setSelectedErrorExample(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer transition-all hover:shadow border-none"
              >
                一键派发讲解卡片
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
