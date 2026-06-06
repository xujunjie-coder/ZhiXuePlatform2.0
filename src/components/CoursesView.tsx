import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Grid, 
  List, 
  MoreVertical, 
  CheckCircle, 
  Info,
  Award,
  BookOpenCheck
} from 'lucide-react';
import { Course, ActiveView } from '../types';

interface CoursesViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setActiveView: (view: ActiveView) => void;
  setSelectedCourseId: (id: string | null) => void;
  searchTerm: string;
  selectedFolder: string | null;
}

export default function CoursesView({ 
  courses, 
  setCourses,
  setActiveView, 
  setSelectedCourseId,
  searchTerm,
  selectedFolder
}: CoursesViewProps) {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'studying' | 'completed' | 'fav'>('all');
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('全部难度');
  
  // Custom filter states representing dropdown simulation
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [courseType, setCourseType] = useState('全部类型');

  const categories = [
    '全部', '计算机科学', '数学', '人工智能', '数据科学', 
    '经济管理', '外语学习', '理学', '工学'
  ];

  // Join Course handler
  const handleJoinCourse = (courseId: string) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        return { ...course, status: 'studying', progress: 5 }; // initialize with 5% progress
      }
      return course;
    }));
    alert('成功加入课程！您可以点击【继续学习】查看深度教学资源包。');
  };

  const handleStudyCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveView('studying');
  };

  // Filter logic
  const filteredCourses = courses.filter((course) => {
    // 1. Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        course.title.toLowerCase().includes(query) || 
        course.teacher.toLowerCase().includes(query) || 
        course.university.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // 2. Folder filter
    if (selectedFolder) {
      if (selectedFolder === '专业基础课') {
        const matches = ['机器学习基础', '数据结构与算法', '线性代数'].includes(course.title);
        if (!matches) return false;
      } else if (selectedFolder === '数据科学方向') {
        const matches = ['机器学习基础', '深度学习入门', '数据分析与可视化'].includes(course.title);
        if (!matches) return false;
      } else if (selectedFolder === '考研课程') {
        const matches = ['高等数学（上）', '线性代数', '概率论与数理统计'].includes(course.title);
        if (!matches) return false;
      } else {
        // Fallback or random set for newly added folders
        const matches = ['Python 程序设计', '操作系统原理'].includes(course.title);
        if (!matches) return false;
      }
    }

    // 3. Category filter
    if (activeCategory !== '全部') {
      if (course.category !== activeCategory) return false;
    }

    // 4. Sub-tab filter (All, Studying, Completed, Fav matches)
    if (activeSubTab === 'studying') {
      if (course.status !== 'studying') return false;
    } else if (activeSubTab === 'completed') {
      if (course.status !== 'completed') return false;
    } else if (activeSubTab === 'fav') {
      // Simulate favorites (e.g., machine learning and data structures)
      if (!['1', '3', '7'].includes(course.id)) return false;
    }

    // 5. Difficulty Filter Simulation
    if (difficultyFilter !== '全部难度') {
      const isHard = ['1', '3', '5'].includes(course.id);
      if (difficultyFilter === '高难度' && !isHard) return false;
      if (difficultyFilter === '基础入门' && isHard) return false;
    }

    // 6. Course Type simulation
    if (courseType !== '全部类型') {
      const isCore = ['1', '2', '3', '5', '6'].includes(course.id);
      if (courseType === '核心专业课' && !isCore) return false;
      if (courseType === '通识必修课' && isCore) return false;
    }

    return true;
  });

  // Calculate dynamic stats for the badges
  const studyingCount = courses.filter(c => c.status === 'studying').length;
  const completedCount = courses.filter(c => c.status === 'completed').length;
  const favCount = 3; // Mock favorites count

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/60 select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {selectedFolder ? `文件夹: ${selectedFolder}` : '课程中心'}
        </h2>
        {selectedFolder && (
          <button 
            onClick={() => {}} 
            className="text-xs text-blue-600 hover:underline px-2 py-1 bg-blue-50/50 rounded"
          >
            文件夹筛选模式
          </button>
        )}
      </div>

      {/* Categories Tabs Scroll Container */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full cursor-pointer transition-all ${
              activeCategory === cat 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Dropdown Simulation */}
          <div className="relative">
            <button
              onClick={() => { setDifficultyOpen(!difficultyOpen); setTypeOpen(false); }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs md:text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <span>{difficultyFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {difficultyOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDifficultyOpen(false)}></div>
                <div className="absolute left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs md:text-sm">
                  {['全部难度', '基础入门', '高难度'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => { setDifficultyFilter(diff); setDifficultyOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50"
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Course Type Dropdown Simulation */}
          <div className="relative">
            <button
              onClick={() => { setTypeOpen(!typeOpen); setDifficultyOpen(false); }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs md:text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <span>{courseType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {typeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)}></div>
                <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs md:text-sm">
                  {['全部类型', '核心专业课', '通识必修课'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setCourseType(t); setTypeOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Layout Layout Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={() => setIsGridLayout(true)}
              className={`p-1.5 rounded cursor-pointer ${isGridLayout ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="网格视图"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsGridLayout(false)}
              className={`p-1.5 rounded cursor-pointer ${!isGridLayout ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Counters */}
      <div className="flex items-center space-x-6 mb-6 border-b border-slate-100 pb-2">
        <button 
          onClick={() => setActiveSubTab('all')}
          className={`text-sm pb-2 font-medium relative ${
            activeSubTab === 'all' 
              ? 'text-blue-600 border-b-2 border-blue-500 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          全部课程 <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded ml-1 font-semibold">{courses.length}</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('studying')}
          className={`text-sm pb-2 font-medium relative ${
            activeSubTab === 'studying' 
              ? 'text-blue-600 border-b-2 border-blue-500 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          正在学习 <span className="text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">{studyingCount}</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('completed')}
          className={`text-sm pb-2 font-medium relative ${
            activeSubTab === 'completed' 
              ? 'text-blue-600 border-b-2 border-blue-500 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          已完成 <span className="text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">{completedCount}</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('fav')}
          className={`text-sm pb-2 font-medium relative ${
            activeSubTab === 'fav' 
              ? 'text-blue-600 border-b-2 border-blue-500 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          我的收藏 <span className="text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">{favCount}</span>
        </button>
      </div>

      {/* Grid or List list output */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <BookCheckIcon className="w-12 h-12 text-slate-300 mb-2" />
          <p className="text-sm">暂无符合筛选条件的课程</p>
        </div>
      ) : isGridLayout ? (
        /* grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              {/* Cover visual banner */}
              <div className="relative h-40 w-full overflow-hidden shrink-0">
                <img 
                  src={course.coverUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 select-none">
                  {course.status === 'studying' && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      正在学习
                    </span>
                  )}
                  {course.status === 'not-started' && (
                    <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      未开始
                    </span>
                  )}
                  {course.status === 'completed' && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-0.5">
                      已完成
                    </span>
                  )}
                </div>
              </div>

              {/* Course descriptor area */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg mb-1 leading-snug line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{course.teacher} · {course.university}</p>
                </div>

                <div className="mt-auto pt-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 leading-none">
                    <span className="flex items-center">
                      <BookOpenCheck className="w-3.5 h-3.5 text-blue-500 mr-1" />
                      学习进度：{course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-2">
                    {course.status === 'studying' && (
                      <button 
                        onClick={() => handleStudyCourse(course.id)}
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs md:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        继续学习
                      </button>
                    )}
                    {course.status === 'not-started' && (
                      <button 
                        onClick={() => handleJoinCourse(course.id)}
                        className="flex-1 py-2 bg-white border border-blue-500 hover:bg-blue-50 text-blue-600 text-xs md:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        加入课程
                      </button>
                    )}
                    {course.status === 'completed' && (
                      <button 
                        onClick={() => handleStudyCourse(course.id)}
                        className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-600 text-xs md:text-sm font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        查看课程
                      </button>
                    )}
                    <button 
                      onClick={() => alert(`选项菜单：分享此课 / 退修课程 / 更改分类`)}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 shrink-0 border border-slate-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* list style representation */
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:shadow-sm transition-all"
            >
              <div className="flex gap-4 items-center w-full md:w-auto">
                <img 
                  src={course.coverUrl} 
                  alt={course.title}
                  className="w-20 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">{course.title}</h3>
                  <p className="text-xs text-slate-500">{course.teacher} · {course.university}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0">
                <div className="w-32 md:w-44 shrink-0">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>进度 {course.progress}%</span>
                    {course.status === 'completed' && <span className="text-green-500 font-bold">已完成</span>}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1">
                    <div 
                      className={`h-full rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {course.status === 'studying' && (
                    <button 
                      onClick={() => handleStudyCourse(course.id)}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      继续学习
                    </button>
                  )}
                  {course.status === 'not-started' && (
                    <button 
                      onClick={() => handleJoinCourse(course.id)}
                      className="px-4 py-1.5 bg-white border border-blue-500 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      加入课程
                    </button>
                  )}
                  {course.status === 'completed' && (
                    <button 
                      onClick={() => handleStudyCourse(course.id)}
                      className="px-4 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100 cursor-pointer"
                    >
                      查看
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginated Bar Block representation */}
      <div className="flex flex-col items-center mt-10">
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-xs">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors">
            3
          </button>
          <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors">
            9
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
            &gt;
          </button>
        </div>
        <p className="text-slate-400 text-[11px] mt-3">
          正在加载 1-9 则核心课程，共 {filteredCourses.length} 则可用
        </p>
      </div>
    </div>
  );
}

function BookCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="m9 9.5 2 2 4-4" />
    </svg>
  );
}
