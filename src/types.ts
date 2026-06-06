/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveView = 'home' | 'courses' | 'space' | 'mistakes' | 'exams' | 'discuss' | 'settings' | 'studying' | 'report' | 'profile';

export interface Course {
  id: string;
  title: string;
  teacher: string;
  university: string;
  progress: number;
  coverUrl: string;
  status: 'studying' | 'not-started' | 'completed';
  category: string;
}

export interface Exam {
  id: string;
  title: string;
  course: string;
  time: string;
  duration: number;
  score: number;
  questionType: string;
  status: 'waiting' | 'active' | 'finished';
  remainingTime?: string;
  myScore?: number;
  ranking?: string;
  coverUrl: string;
}

export interface MistakeQuestion {
  id: string;
  course: string;
  section: string;
  timestamp: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'completed' | 'passed' | 'joined' | 'submitted';
  title: string;
  time: string;
}

export interface TaskItem {
  id: string;
  type: 'homework' | 'exam' | 'task';
  title: string;
  course: string;
  deadline: string;
  status: 'pending' | 'active';
}
