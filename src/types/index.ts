// 汉字笔画
export interface Stroke {
  index: number;
  path: string;
  direction: string;
  name: string;
  tips?: string;
}

// 汉字
export interface Character {
  char: string;
  pinyin: string[];
  strokes: number;
  radical: string;
  strokeOrder: Stroke[];
  examples?: Word[];
}

// 词语
export interface Word {
  word: string;
  pinyin: string;
  meaning?: string;
}

// 课文
export interface Lesson {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  writingChars: string[];
  readingChars: string[];
}

// 课本
export interface Textbook {
  id: string;
  name: string;
  grade: 1 | 2 | 3 | 4 | 5 | 6;
  semester: 1 | 2;
  version: string;
  publisher: string;
  lessons: Lesson[];
}

// 搜索结果
export interface SearchResult {
  char: string;
  pinyin: string;
  strokes: number;
  matchType: 'exact' | 'pinyin' | 'partial';
}

// 用户设置
export interface UserSettings {
  autoPlay: boolean;
  animationSpeed: number;
  showPinyin: boolean;
  showGuideLines: boolean;
}

// 学习进度
export interface LearnProgress {
  char: string;
  learnedAt: number;
  viewCount: number;
}
