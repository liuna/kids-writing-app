import React, { useEffect, useRef, useState, useCallback } from 'react'
import HanziWriter from 'hanzi-writer'
import { Play, Volume2 } from 'lucide-react'
import type { Character } from '../types'

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

interface StrokeAnimatorProps {
  character: string
  characterData?: Character
  speed?: number
  onComplete?: () => void
}

export const StrokeAnimator: React.FC<StrokeAnimatorProps> = ({
  character,
  characterData,
  speed = 1,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  // 预加载语音引擎
  useEffect(() => {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance('')
    utterance.volume = 0
    try {
      window.speechSynthesis.speak(utterance)
      window.speechSynthesis.cancel()
    } catch (e) {}
  }, [])

  // 播报笔画名称
  const speakStroke = useCallback((strokeName: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(strokeName)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }, [])

  // 获取当前笔画名称
  const getCurrentStrokeName = useCallback((index: number): string => {
    if (!characterData?.strokeOrder || index < 0 || index >= characterData.strokeOrder.length) {
      return ''
    }
    const stroke = characterData.strokeOrder[index]
    return stroke.name || strokeNames[stroke.direction] || ''
  }, [characterData])

  // 初始化 hanzi-writer
  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    // 创建米字格背景
    const gridDiv = document.createElement('div')
    gridDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    `
    gridDiv.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="260" height="260" fill="none" stroke="#D0C0B0" stroke-width="2"/>
        <line x1="140" y1="10" x2="140" y2="270" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="10" y1="140" x2="270" y2="140" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="10" y1="10" x2="270" y2="270" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="270" y1="10" x2="10" y2="270" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
      </svg>
    `

    const targetDiv = document.createElement('div')
    targetDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    `

    containerRef.current.appendChild(gridDiv)
    containerRef.current.appendChild(targetDiv)

    const writer = HanziWriter.create(targetDiv, character, {
      width: 280,
      height: 280,
      padding: 10,
      strokeColor: '#333333',
      radicalColor: '#333333',
      strokeAnimationSpeed: speed * 0.8,
      delayBetweenStrokes: 1200 / speed,
      showOutline: true,
      outlineColor: '#E8D4B8',
      drawingWidth: 16,
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      highlightColor: '#E8684A',
    })

    writerRef.current = writer
    setIsReady(true)
    setCurrentStrokeIndex(-1)
    setIsPlaying(false)
    writer.showOutline()

    return () => {
      writerRef.current = null
      window.speechSynthesis?.cancel()
    }
  }, [character, speed])

  // 播放
  const handlePlay = async () => {
    if (!writerRef.current || !characterData?.strokeOrder || isPlaying) return

    setIsPlaying(true)
    setCurrentStrokeIndex(0)
    writerRef.current.hideCharacter()

    try {
      for (let i = 0; i < characterData.strokeOrder.length; i++) {
        setCurrentStrokeIndex(i)
        const strokeName = getCurrentStrokeName(i)
        if (strokeName) {
          speakStroke(strokeName)
        }
        await writerRef.current.animateStroke(i)
        if (i < characterData.strokeOrder.length - 1) {
          await new Promise(r => setTimeout(r, 300))
        }
      }

      setCurrentStrokeIndex(-1)
      setIsPlaying(false)
      onComplete?.()
    } catch (e) {
      console.error('Animation error:', e)
      setIsPlaying(false)
    }
  }

  // 手动播报
  const handleSpeakCurrent = () => {
    const name = getCurrentStrokeName(currentStrokeIndex)
    if (name) speakStroke(name)
  }

  const currentStrokeName = currentStrokeIndex >= 0
    ? getCurrentStrokeName(currentStrokeIndex)
    : isPlaying ? '预备' : ''

  return (
    <div className="flex items-center gap-3">
      {/* 笔画名称显示 */}
      <div className="flex flex-col items-center">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          text-base font-bold transition-all duration-300
          ${currentStrokeIndex >= 0
            ? 'bg-primary text-white scale-110 shadow-lg'
            : 'bg-gray-100 text-gray-400'
          }
        `}>
          {currentStrokeName ? currentStrokeName.slice(0, 1) : '-'}
        </div>
        {currentStrokeName && (
          <button
            onClick={handleSpeakCurrent}
            className="mt-2 p-2.5 rounded-full bg-orange-100 text-primary active:bg-orange-200 transition-colors"
            aria-label="重播笔画名称"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 动画框 - 响应式大小 */}
      <div
        ref={containerRef}
        className="w-64 h-64 sm:w-72 sm:h-72 rounded-xl border-2 border-[#E8D4B8] bg-[#FDF5E6] relative flex-shrink-0"
      />

      {/* 播放按钮 */}
      <div className="flex flex-col items-center">
        <button
          onClick={handlePlay}
          disabled={!isReady || isPlaying}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            transition-all active:scale-95
            ${!isReady || isPlaying
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-primary text-white shadow-lg active:shadow-md hover:bg-primary-dark'
            }
          `}
          aria-label="播放笔顺动画"
        >
          <Play className="w-7 h-7 ml-0.5" />
        </button>
      </div>
    </div>
  )
}
