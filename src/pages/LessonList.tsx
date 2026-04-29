import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { Header } from '../components/Header'
import { CharacterCardMini } from '../components/CharacterCard'

// 模拟课文数据
const mockLessons: Record<string, Array<{
  id: string
  title: string
  subtitle?: string
  chars: string[]
}>> = {
  'grade1-sem1': [
    { id: 'l1', title: '识字 1', subtitle: '天地人', chars: ['天', '地', '人', '你', '我', '他'] },
    { id: 'l2', title: '识字 2', subtitle: '金木水火土', chars: ['一', '二', '三', '四', '五', '上', '下'] },
    { id: 'l3', title: '识字 3', subtitle: '口耳目', chars: ['口', '耳', '目', '手', '足', '站', '坐'] },
    { id: 'l4', title: '识字 4', subtitle: '日月水火', chars: ['日', '月', '水', '火', '山', '石'] },
    { id: 'l5', title: '识字 5', subtitle: '对韵歌', chars: ['云', '雨', '风', '花', '鸟', '虫'] },
    { id: 'l6', title: '汉语拼音 1', subtitle: 'a o e', chars: [] },
  ],
  'grade1-sem2': [
    { id: 'l1', title: '识字 1', subtitle: '春夏秋冬', chars: ['春', '夏', '秋', '冬', '风', '雪'] },
    { id: 'l2', title: '识字 2', subtitle: '姓氏歌', chars: ['姓', '什', '么', '双', '国', '王'] },
    { id: 'l3', title: '识字 3', subtitle: '小青蛙', chars: ['青', '清', '气', '晴', '情', '请'] },
  ]
}

export const LessonList: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)

  const lessons = mockLessons[id || ''] || []

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId)
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header
        title="课文列表"
        rightElement={
          <div className="text-sm text-gray-500">
            共{lessons.length}课
          </div>
        }
      />

      {/* 课本信息 */}
      <div className="bg-white px-4 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">
              {id === 'grade1-sem1' ? '一年级上册' : '一年级下册'}
            </h2>
            <p className="text-sm text-gray-400">部编版 · 人教版</p>
          </div>
        </div>
      </div>

      {/* 课文列表 */}
      <div className="px-4 space-y-3">
        {lessons.map((lesson) => {
          const isExpanded = expandedLesson === lesson.id

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl overflow-hidden"
            >
              {/* 课文标题 */}
              <div
                onClick={() => lesson.chars.length > 0 && toggleLesson(lesson.id)}
                className="p-4 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-ink">{lesson.title}</h3>
                  {lesson.subtitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{lesson.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {lesson.chars.length > 0 && (
                    <span className="text-sm text-gray-400">{lesson.chars.length}字</span>
                  )}
                  {lesson.chars.length > 0 && (
                    isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )
                  )}
                </div>
              </div>

              {/* 生字展开 */}
              {isExpanded && lesson.chars.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-5 gap-2">
                      {lesson.chars.map((char) => (
                        <CharacterCardMini
                          key={char}
                          char={char}
                          onClick={() => navigate(`/character/${char}`)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
