import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Star, Share2 } from 'lucide-react'
import HanziWriter from 'hanzi-writer'
import { Header } from '../components/Header'
import { StrokeAnimator } from '../components/StrokeAnimator'
import { useCharacter, useFavorites } from '../hooks/useCharacter'
import { useAppStore } from '../store'
import type { Character } from '../types'
import { writingTipsData, defaultTips } from '../data/writingTips'

// 笔画名称映射 - Unicode 笔画符号到中文名称
const strokeNames: Record<string, string> = {
  // 基本笔画
  '一': '横',
  '丨': '竖',
  '丿': '撇',
  '丶': '点',
  '㇀': '提',
  '㇏': '捺',
  // 钩系列
  '亅': '竖钩',
  '㇁': '弯钩',
  '㇂': '斜钩',
  '㇃': '卧钩',
  '㇆': '横折钩',
  '𠃌': '横折钩',
  '𠂈': '横折钩',
  '㇌': '横折弯钩',
  '㇈': '横折弯钩',
  '㇊': '横折折折钩',
  '㇍': '横折弯',
  // 折系列
  'ㄱ': '横折',
  '𠃍': '横折',
  '㇕': '横折',
  '㇅': '竖折折钩',
  '㇉': '竖折折',
  '㇞': '竖折折',
  '㇄': '竖折',
  // 撇系列
  '㇇': '横撇',
  '㇋': '横折折撇',
  '㇓': '竖撇',
  // 点系列
  '㇔': '点',
  '㇖': '横钩',
  '乚': '竖弯钩',
  '㇟': '竖弯钩',
  'ㄴ': '竖弯',
  '㇙': '竖提',
  '𠄌': '竖提',
  '㇜': '撇折',
  '𠃋': '撇折',
  '㇛': '撇点',
  '𡿨': '撇点',
  '㇚': '弯钩',
  '㇘': '竖折撇',
  '㇗': '横折折',
  // 组合笔画
  '㇎': '横折折折',
  '㇠': '横斜钩',
  '𠃊': '竖折',
  '𠄎': '横折折折钩',
  '㇢': '斜钩',
}

// 获取拼音
function getPinyin(char: string): string {
  const map: Record<string, string> = {
    '天': 'tiān', '地': 'dì', '人': 'rén', '你': 'nǐ', '我': 'wǒ', '他': 'tā',
    '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
    '上': 'shàng', '下': 'xià', '大': 'dà', '小': 'xiǎo',
    '柳': 'liǔ', '杨': 'yáng', '松': 'sōng', '柏': 'bǎi', '桃': 'táo',
    '李': 'lǐ', '梅': 'méi', '花': 'huā', '草': 'cǎo', '树': 'shù',
  }
  return map[char] || char
}

// 获取例词
function getExampleWords(char: string): Array<{ word: string; pinyin: string }> {
  const words: Record<string, Array<{ word: string; pinyin: string }>> = {
    '天': [{ word: '天空', pinyin: 'tiān kōng' }, { word: '今天', pinyin: 'jīn tiān' }],
    '地': [{ word: '大地', pinyin: 'dà dì' }, { word: '地面', pinyin: 'dì miàn' }],
    '人': [{ word: '人民', pinyin: 'rén mín' }, { word: '大人', pinyin: 'dà rén' }],
    '上': [{ word: '上学', pinyin: 'shàng xué' }, { word: '上面', pinyin: 'shàng miàn' }],
    '下': [{ word: '下面', pinyin: 'xià miàn' }, { word: '下降', pinyin: 'xià jiàng' }],
  }
  return words[char] || []
}

// 获取书写要点
function getWritingTips(char: string): string[] {
  return writingTipsData[char] || defaultTips
}

// 单个步骤展示组件 - 渐进式显示笔画
const StepBox: React.FC<{ char: string; step: number }> = ({ char, step }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const gridSvg = document.createElement('div')
    gridSvg.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%;`
    gridSvg.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="#E8D4B8" stroke-width="1"/>
        <line x1="50" y1="2" x2="50" y2="98" stroke="#E8D4B8" stroke-width="0.5" stroke-dasharray="3,3"/>
        <line x1="2" y1="50" x2="98" y2="50" stroke="#E8D4B8" stroke-width="0.5" stroke-dasharray="3,3"/>
        <line x1="2" y1="2" x2="98" y2="98" stroke="#E8D4B8" stroke-width="0.5" stroke-dasharray="3,3"/>
        <line x1="98" y1="2" x2="2" y2="98" stroke="#E8D4B8" stroke-width="0.5" stroke-dasharray="3,3"/>
      </svg>
    `
    containerRef.current.appendChild(gridSvg)

    const targetDiv = document.createElement('div')
    targetDiv.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;`
    containerRef.current.appendChild(targetDiv)

    const writer = HanziWriter.create(targetDiv, char, {
      width: 72,
      height: 72,
      padding: 4,
      strokeColor: '#333333',
      radicalColor: '#333333',
      strokeAnimationSpeed: 3,
      delayBetweenStrokes: 0,
      showOutline: false,
      drawingWidth: 3,
    })

    writerRef.current = writer
    writer.hideCharacter()

    const playStrokes = async () => {
      for (let i = 0; i < step; i++) {
        try {
          await writer.animateStroke(i)
        } catch (e) {}
      }
    }
    playStrokes()

    return () => {
      writerRef.current = null
    }
  }, [char, step])

  return <div ref={containerRef} className="relative w-[72px] h-[72px] rounded-lg border border-[#E8D4B8] bg-[#FDF5E6] flex-shrink-0" />
}

// 笔画递进展示组件 - 支持横向滚动
const StrokeBreakdown: React.FC<{ char: string; character: Character }> = ({ char, character }) => {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex items-start gap-3 min-w-max">
        {Array.from({ length: character.strokes }, (_, i) => {
          const stroke = character.strokeOrder?.[i]
          const strokeName = stroke?.name || strokeNames[stroke?.direction || ''] || `第${i + 1}笔`
          return (
            <div key={i} className="flex flex-col items-center">
              <StepBox char={char} step={i + 1} />
              <span className="text-xs text-primary mt-1.5 font-medium whitespace-nowrap">{strokeName}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const CharacterDetail: React.FC = () => {
  const { char } = useParams<{ char: string }>()
  const { character, loading } = useCharacter(char)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { markAsLearned } = useAppStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="汉字详情" />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400 text-base">加载中...</div>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="汉字详情" />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-4xl mb-3">😔</div>
          <div className="text-gray-400">未找到该汉字</div>
        </div>
      </div>
    )
  }

  const writingTips = getWritingTips(character.char)
  const exampleWords = getExampleWords(character.char)

  return (
    <div className="min-h-screen bg-paper safe-bottom">
      <Header
        title={character.char}
        rightElement={
          <div className="flex gap-1">
            <button
              onClick={() => toggleFavorite(char!)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              aria-label="收藏"
            >
              <Star className={`w-6 h-6 transition-colors ${isFavorite(char!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </button>
            <button
              className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              aria-label="分享"
            >
              <Share2 className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        }
      />

      <div className="max-w-lg mx-auto">
        {/* 书写要点 */}
        <div className="bg-white px-4 py-4 mb-3">
          <div className="bg-paper rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2 font-medium">书写要点</div>
            <ul className="space-y-2">
              {writingTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                  <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 主要动画区域 */}
        <div className="bg-white px-4 py-6 mb-3">
          {/* 汉字和拼音 */}
          <div className="text-center mb-5">
            <div className="text-5xl font-medium text-ink mb-2">{character.char}</div>
            <div className="text-xl text-gray-500">{character.pinyin?.[0] || getPinyin(character.char)}</div>
          </div>

          {/* 笔画动画 */}
          <div className="flex justify-center mb-5">
            <StrokeAnimator
              character={character.char}
              characterData={character}
              speed={1}
              onComplete={() => markAsLearned(character.char)}
            />
          </div>

          {/* 基本信息标签 */}
          <div className="flex justify-center gap-3">
            <span className="bg-orange-100 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              {character.strokes}画
            </span>
            <span className="bg-orange-100 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              {character.radical}部
            </span>
          </div>
        </div>

        {/* 笔画拆解 */}
        <div className="bg-white px-4 py-5 mb-3">
          <h3 className="text-base font-semibold text-ink mb-4">笔画拆解</h3>
          <StrokeBreakdown char={character.char} character={character} />
        </div>

        {/* 例词 */}
        <div className="bg-white px-4 py-5">
          <h3 className="text-base font-semibold text-ink mb-4">例词</h3>
          <div className="space-y-3">
            {exampleWords.length > 0 ? exampleWords.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-paper rounded-xl active:bg-orange-50 transition-colors">
                <div>
                  <div className="font-medium text-lg text-ink">{word.word}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{word.pinyin}</div>
                </div>
                <div className="text-2xl text-primary font-medium">
                  {word.word.replace(character.char, '　')}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">暂无例词数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
