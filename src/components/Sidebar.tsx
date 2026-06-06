import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  LayoutDashboard, 
  FileQuestion, 
  FileText, 
  MessageSquare, 
  Settings, 
  Folder, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BarChart2,
  User
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;
}

export default function Sidebar({ 
  activeView, 
  setActiveView,
  selectedFolder,
  setSelectedFolder
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/sidebar/folders')
      .then(res => res.json())
      .then(data => setFolders(data))
      .catch(err => console.error("Failed to fetch folders:", err));
  }, []);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddFolder = () => {
    const name = prompt('请输入新文件夹名称:');
    if (name && name.trim()) {
      setFolders([...folders, { name: name.trim(), count: 0 }]);
    }
  };

  const menuItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'courses', label: '我的课程', icon: BookOpen },
    { id: 'space', label: '学习空间', icon: LayoutDashboard },
    { id: 'mistakes', label: '错题本', icon: FileQuestion },
    { id: 'exams', label: '考试中心', icon: FileText },
    { id: 'report', label: '学习报告', icon: BarChart2 },
    { id: 'profile', label: '个人中心', icon: User },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside 
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`relative h-screen border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } z-20`}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 overflow-hidden">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        {!collapsed && (
          <h1 className="text-lg font-bold text-slate-900 tracking-wide whitespace-nowrap">
            智学平台
          </h1>
        )}
      </div>

      {/* Navigation Buttons Stack */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as ActiveView);
                setSelectedFolder(null); // Clear folder filters
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}

        {/* Promotion Widget */}
        {!collapsed && (
          <div className="mt-8 mb-4 mx-1 p-4.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl border border-blue-500/30 relative overflow-hidden shadow-lg shadow-blue-600/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="relative z-10 text-left">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <h3 className="font-extrabold text-xs tracking-wide text-white">
                  开启智能学习之旅
                </h3>
              </div>
              <p className="text-[10.5px] text-blue-100/95 leading-relaxed mb-3.5">
                自适应生成诊断画像，<br />助您精准提分吃透考点。
              </p>
              <button 
                onClick={() => {
                  setActiveView('report');
                }}
                className="bg-white hover:bg-blue-50 text-blue-700 text-[10px] px-3.5 py-1.5 rounded-lg transition-all duration-150 active:scale-95 shadow-xs font-bold cursor-pointer"
              >
                立即生成报告
              </button>
            </div>
            {/* Elegant background blob accents */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none" />
            <div className="absolute top-1/2 left-2/3 w-8 h-8 bg-blue-500/20 rounded-full blur-md pointer-events-none" />
          </div>
        )}

        {/* Folders Management Area */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-slate-100 select-none">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                我的文件夹
              </span>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                {isEditing ? '完成' : '编辑'}
              </button>
            </div>

            <button
              onClick={handleAddFolder}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 mb-2 bg-slate-50 border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新建文件夹</span>
            </button>

            <div className="space-y-1 mt-2">
              {folders.map((folder, index) => {
                const isActive = selectedFolder === folder.name;
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between group"
                  >
                    <button
                      onClick={() => {
                        setSelectedFolder(isActive ? null : folder.name);
                        setActiveView('courses'); // Navigate to courses to view filtered entries
                      }}
                      className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all text-left ${
                        isActive 
                          ? 'bg-blue-50/70 text-blue-600 font-medium' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-blue-400'}`} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 ml-1">
                        ({folder.count})
                      </span>
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => {
                          if (confirm(`确认删除文件夹「${folder.name}」吗？`)) {
                            setFolders(folders.filter((_, i) => i !== index));
                            if (isActive) setSelectedFolder(null);
                          }
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded text-xs ml-1 cursor-pointer"
                      >
                        删除
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
