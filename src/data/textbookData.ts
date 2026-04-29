import type { Textbook } from '../types'

export const grade1Semester1: Textbook = {
  id: 'grade1-sem1',
  name: '一年级上册',
  grade: 1,
  semester: 1,
  version: '部编版',
  publisher: '人民教育出版社',
  lessons: [
    {
      id: 'l1',
      title: '识字 1',
      subtitle: '天地人',
      order: 1,
      writingChars: [],
      readingChars: ['天', '地', '人', '你', '我', '他'],
    },
    {
      id: 'l2',
      title: '识字 2',
      subtitle: '金木水火土',
      order: 2,
      writingChars: [],
      readingChars: ['一', '二', '三', '四', '五', '上', '下'],
    },
    {
      id: 'l3',
      title: '识字 3',
      subtitle: '口耳目',
      order: 3,
      writingChars: [],
      readingChars: ['口', '耳', '目', '手', '足', '站', '坐'],
    },
    {
      id: 'l4',
      title: '识字 4',
      subtitle: '日月水火',
      order: 4,
      writingChars: [],
      readingChars: ['日', '月', '水', '火', '山', '石'],
    },
    {
      id: 'l5',
      title: '识字 5',
      subtitle: '对韵歌',
      order: 5,
      writingChars: [],
      readingChars: ['云', '雨', '风', '花', '鸟', '虫'],
    },
  ],
}

export const grade1Semester2: Textbook = {
  id: 'grade1-sem2',
  name: '一年级下册',
  grade: 1,
  semester: 2,
  version: '部编版',
  publisher: '人民教育出版社',
  lessons: [
    {
      id: 'l1',
      title: '识字 1',
      subtitle: '春夏秋冬',
      order: 1,
      writingChars: [],
      readingChars: ['春', '夏', '秋', '冬', '风', '雪'],
    },
    {
      id: 'l2',
      title: '识字 2',
      subtitle: '姓氏歌',
      order: 2,
      writingChars: [],
      readingChars: ['姓', '什', '么', '双', '国', '王'],
    },
    {
      id: 'l3',
      title: '识字 3',
      subtitle: '小青蛙',
      order: 3,
      writingChars: [],
      readingChars: ['青', '清', '气', '晴', '情', '请'],
    },
  ],
}

export const textbooks = [grade1Semester1, grade1Semester2]

export const getTextbookById = (id: string): Textbook | undefined => {
  return textbooks.find(t => t.id === id)
}

export const getLessonById = (textbookId: string, lessonId: string) => {
  const textbook = getTextbookById(textbookId)
  return textbook?.lessons.find(l => l.id === lessonId)
}
