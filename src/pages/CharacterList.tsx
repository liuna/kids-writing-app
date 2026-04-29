import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'

// 模拟各课生字
const lessonChars: Record<string, string[]> = {
  'l1': ['天', '地', '人', '你', '我', '他'],
  'l2': ['一', '二', '三', '四', '五', '上', '下'],
  'l3': ['口', '耳', '目', '手', '足', '站', '坐'],
  'l4': ['日', '月', '水', '火', '山', '石'],
  'l5': ['云', '雨', '风', '花', '鸟', '虫'],
}

const lessonNames: Record<string, string> = {
  'l1': '天地人',
  'l2': '金木水火土',
  'l3': '口耳目',
  'l4': '日月水火',
  'l5': '对韵歌',
}

export const CharacterList: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const chars = lessonChars[id || ''] || []
  const lessonName = lessonNames[id || ''] || '课文'

  return (
    <div className="min-h-screen bg-paper">
      <Header title={`${lessonName}的生字`} />

      <div className="p-4">
        <p className="text-sm text-gray-400 mb-4">
          共 {chars.length} 个生字
        </p>

        <div className="grid grid-cols-4 gap-3">
          {chars.map((char) => (
            <button
              key={char}
              onClick={() => navigate(`/character/${char}`)}
              className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm"
            >
              <span className="tianzi-font text-2xl mb-2">{char}</span>
              <span className="text-xs text-gray-400">点击查看</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
