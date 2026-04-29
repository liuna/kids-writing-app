import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Clock, X, ArrowLeft } from 'lucide-react'
import { searchCharacters, getCommonCharacters } from '../services/characterService'
import type { SearchResult } from '../types'
import { CharacterCardMini } from '../components/CharacterCard'
import { useAppStore } from '../store'

export const Search: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { searchHistory, addSearchHistory, clearSearchHistory } = useAppStore()

  // 实时搜索
  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.length >= 1) {
      const chars = searchCharacters(value)
      setResults(chars)
    } else {
      setResults([])
    }
  }, [])

  // 点击汉字
  const handleCharClick = (char: string) => {
    addSearchHistory(char)
    navigate(`/character/${char}`)
  }

  // 清除搜索
  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  // 热门汉字
  const hotChars = getCommonCharacters().slice(0, 15)

  return (
    <div className="min-h-screen bg-paper">
      {/* 搜索栏 */}
      <div className="sticky top-0 bg-white px-4 py-3 shadow-sm flex items-center gap-3 safe-top">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索汉字或拼音..."
            className="flex-1 bg-transparent outline-none text-ink placeholder-gray-400"
            autoFocus
          />
          {query && (
            <button onClick={clearSearch} className="p-1 -mr-1">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {query ? (
        <div className="p-4">
          {results.length > 0 ? (
            <>
              <p className="text-sm text-gray-400 mb-3">找到 {results.length} 个结果</p>
              <div className="grid grid-cols-5 gap-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.char}-${index}`}
                    onClick={() => handleCharClick(result.char)}
                    className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <span className="tianzi-font text-xl mb-1">{result.char}</span>
                    <span className="text-xs text-gray-500">{result.pinyin}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">😔</div>
              <p className="text-gray-400">未找到相关汉字</p>
              <p className="text-sm text-gray-300 mt-1">试试其他关键词</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-ink">搜索历史</h3>
                <button
                  onClick={clearSearchHistory}
                  className="text-sm text-gray-400"
                >
                  清空
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleCharClick(item)}
                    className="flex items-center gap-1 bg-white px-3 py-2 rounded-full text-sm shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 热门汉字 */}
          <div className="p-4 pt-0">
            <h3 className="font-medium text-ink mb-3">热门汉字</h3>
            <div className="grid grid-cols-5 gap-3">
              {hotChars.map((char) => (
                <CharacterCardMini
                  key={char}
                  char={char}
                  onClick={() => handleCharClick(char)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
