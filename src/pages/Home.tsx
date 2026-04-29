import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Star, Settings, Clock } from 'lucide-react'
import { CharacterCardMini } from '../components/CharacterCard'
import { useAppStore } from '../store'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const { searchHistory, favorites } = useAppStore()

  const menuItems = [
    {
      icon: Search,
      label: '查汉字',
      path: '/search',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BookOpen,
      label: '课本',
      path: '/textbooks',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Star,
      label: '收藏',
      path: '/favorites',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: Settings,
      label: '设置',
      path: '/settings',
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  // 热门汉字
  const hotCharacters = ['天', '地', '人', '你', '我', '他', '一', '二', '三', '四', '五']

  return (
    <div className="min-h-screen bg-paper pb-8 safe-bottom">
      {/* 顶部标题 */}
      <div className="pt-safe-top px-6 py-8 text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">宝宝学写字</h1>
        <p className="text-gray-500">快乐学习，轻松写字 ✨</p>
      </div>

      {/* 快捷搜索 */}
      <div className="px-6 mb-6">
        <button
          onClick={() => navigate('/search')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">搜索汉字或拼音...</span>
        </button>
      </div>

      {/* 功能入口 */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shadow-sm`}
              >
                <item.icon className="w-7 h-7" />
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 最近查看 */}
      {searchHistory.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-ink flex items-center gap-2">
              <Clock className="w-4 h-4" />
              最近查看
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {searchHistory.slice(0, 6).map((char) => (
              <CharacterCardMini
                key={char}
                char={char}
                onClick={() => navigate(`/character/${char}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 我的收藏 */}
      {favorites.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-ink flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              我的收藏
            </h3>
            <button
              onClick={() => navigate('/favorites')}
              className="text-sm text-primary"
            >
              查看全部
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {favorites.slice(0, 6).map((char) => (
              <CharacterCardMini
                key={char}
                char={char}
                onClick={() => navigate(`/character/${char}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 热门汉字 */}
      <div className="px-6">
        <h3 className="font-medium text-ink mb-3">热门汉字</h3>
        <div className="grid grid-cols-5 gap-2">
          {hotCharacters.map((char) => (
            <button
              key={char}
              onClick={() => navigate(`/character/${char}`)}
              className="bg-white py-3 rounded-xl text-xl tianzi-font text-ink shadow-sm hover:shadow-md transition-shadow active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* 学习提示 */}
      <div className="px-6 mt-6">
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-orange-700 text-sm">
            💡 今日建议：学习 "天、地、人" 三个字
          </p>
        </div>
      </div>
    </div>
  )
}
