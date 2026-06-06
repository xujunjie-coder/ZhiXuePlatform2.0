export interface Chapter {
  id: string;
  title: string;
  status: 'completed' | 'studying' | 'not-started';
  progress?: number;
  subItems?: { id: string; title: string; status: 'completed' | 'studying' | 'not-started'; progress?: number }[];
}

export interface TaskItem {
  id: string;
  course: string;
  type: '作业' | '随堂测试' | '考试';
  title: string;
  deadline: string;
  status: 'pending' | 'completed';
}

export interface CourseProgressDetail {
  id: string;
  title: string;
  completedChapters: string;
  todoCount: number;
  progress: number;
  status: 'studying' | 'behind' | 'completed';
  hours: number;
  chapters: Chapter[];
  tasksTable: {
    type: string;
    total: number;
    completed: number;
    uncompleted: number;
    rate: string;
  }[];
  mastery: {
    overall: number;
    mastered: number;
    weak: number;
    unlearned: number;
  };
  trend: {
    myProgress: number[];
    classAvg: number[];
  };
}
