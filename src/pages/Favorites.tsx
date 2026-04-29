import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Trash2 } from 'lucide-react'
import { Header } from '../components/Header'
import { useAppStore } from '../store'

export const Favorites: React.FC = () => {
  const navigate = useNavigate()
  const { favorites, toggleFavorite } = useAppStore()

  // 模拟获取汉字详细信息
  const getCharInfo = (char: string) => {
    const pinyinMap: Record<string, string> = {
      '天': 'tiān', '地': 'dì', '人': 'rén', '你': 'nǐ', '我': 'wǒ',
      '他': 'tā', '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
    }
    return {
      char,
      pinyin: pinyinMap[char] || '',
      strokes: char.length,
      radical: char.charAt(0),
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header
        title="我的收藏"
        rightElement={
          favorites.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定要清空所有收藏吗？')) {
                  favorites.forEach(char => toggleFavorite(char))
                }
              }}
              className="text-red-500 text-sm"
            >
              清空
            </button>
          )
        }
      />

      {favorites.length > 0 ? (
        <div className="p-4 space-y-3">
          {favorites.map((char) => {
            const info = getCharInfo(char)
            return (
              <div
                key={char}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/character/${char}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="tianzi-font text-2xl">{char}</span>
                    <span className="text-gray-500">{info.pinyin}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {info.strokes}画 · {info.radical}部
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(char)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-400 font-medium mb-2">暂无收藏</h3>
          <p className="text-sm text-gray-300">点击汉字详情页的星星图标添加收藏</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-full"
          >
            去搜索汉字
          </button>
        </div>
      )}
    </div>
  )
}
