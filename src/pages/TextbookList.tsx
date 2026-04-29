import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Header } from '../components/Header'

const grades = [
  { grade: 1, name: '一年级' },
  { grade: 2, name: '二年级' },
  // { grade: 3, name: '三年级' },
  // { grade: 4, name: '四年级' },
  // { grade: 5, name: '五年级' },
  // { grade: 6, name: '六年级' },
]

// 模拟课本数据
const textbooks: Record<string, Array<{ id: string; name: string; totalLessons: number; totalChars: number }>> = {
  '1-1': [{ id: 'grade1-sem1', name: '一年级上册', totalLessons: 14, totalChars: 300 }],
  '1-2': [{ id: 'grade1-sem2', name: '一年级下册', totalLessons: 14, totalChars: 400 }],
  '2-1': [{ id: 'grade2-sem1', name: '二年级上册', totalLessons: 16, totalChars: 450 }],
  '2-2': [{ id: 'grade2-sem2', name: '二年级下册', totalLessons: 16, totalChars: 450 }],
}

export const TextbookList: React.FC = () => {
  const navigate = useNavigate()
  const [selectedGrade, setSelectedGrade] = useState(1)
  const [semester, setSemester] = useState<1 | 2>(1)

  const key = `${selectedGrade}-${semester}`
  const currentTextbooks = textbooks[key] || []

  return (
    <div className="min-h-screen bg-paper">
      <Header title="选择课本" />

      {/* 年级选择 */}
      <div className="bg-white px-4 py-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {grades.map((g) => (
            <button
              key={g.grade}
              onClick={() => setSelectedGrade(g.grade)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedGrade === g.grade
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* 学期切换 */}
      <div className="px-4 mb-6">
        <div className="flex bg-white rounded-full p-1">
          <button
            onClick={() => setSemester(1)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              semester === 1 ? 'bg-primary text-white' : 'text-gray-600'
            }`}
          >
            上册
          </button>
          <button
            onClick={() => setSemester(2)}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              semester === 2 ? 'bg-primary text-white' : 'text-gray-600'
            }`}
          >
            下册
          </button>
        </div>
      </div>

      {/* 课本列表 */}
      <div className="px-4">
        {currentTextbooks.length > 0 ? (
          currentTextbooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/textbook/${book.id}`)}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* 封面 */}
                <div className="w-24 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-12 h-12 text-orange-400" />
                </div>

                {/* 信息 */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-ink mb-1">{book.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">部编版 · 人教版</p>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{book.totalLessons}课</span>
                    <span>{book.totalChars}字</span>
                  </div>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-300" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📚</div>
            <div className="text-gray-400">暂无课本数据</div>
          </div>
        )}
      </div>
    </div>
  )
}
