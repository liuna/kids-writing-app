import React from 'react'
import { Star } from 'lucide-react'
import { useFavorites } from '../hooks/useCharacter'

interface CharacterCardProps {
  char: string
  pinyin?: string
  strokes?: number
  showFavorite?: boolean
  isLearned?: boolean
  onClick?: () => void
  className?: string
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  char,
  pinyin,
  strokes,
  showFavorite = false,
  isLearned = false,
  onClick,
  className = '',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-xl p-4 shadow-sm
        flex flex-col items-center justify-center
        cursor-pointer transition-all
        hover:shadow-md active:scale-95
        ${className}
      `}
    >
      {/* 学习标记 */}
      {isLearned && (
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-green-400" />
      )}

      {/* 收藏按钮 */}
      {showFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(char)
          }}
          className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-gray-100"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              isFavorite(char)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      )}

      {/* 汉字 */}
      <div className="tianzi-font text-2xl mb-1 text-ink">
        {char}
      </div>

      {/* 拼音 */}
      {pinyin && (
        <div className="text-xs text-gray-500">
          {pinyin}
        </div>
      )}

      {/* 笔画数 */}
      {strokes && strokes > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {strokes}画
        </div>
      )}
    </div>
  )
}

// 简版卡片（仅显示汉字）
export const CharacterCardMini: React.FC<{ char: string; onClick?: () => void }> = ({
  char,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        w-14 h-14 bg-white rounded-lg shadow-sm
        flex items-center justify-center
        tianzi-font text-xl text-ink
        hover:shadow-md transition-shadow active:scale-95
      "
    >
      {char}
    </button>
  )
}

// 详细卡片（含更多信息）
export const CharacterCardDetailed: React.FC<{
  char: string
  pinyin: string
  strokes: number
  radical: string
  onClick?: () => void
}> = ({ char, pinyin, strokes, radical, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-16 h-16 bg-paper rounded-lg flex items-center justify-center tianzi-font text-2xl">
        {char}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="tianzi-font text-2xl text-ink">{char}</span>
          <span className="text-gray-500">{pinyin}</span>
        </div>
        <div className="flex gap-4 text-sm text-gray-400 mt-1">
          <span>{strokes}画</span>
          <span>部首：{radical}</span>
        </div>
      </div>
      <div className="text-gray-400">›</div>
    </div>
  )
}
