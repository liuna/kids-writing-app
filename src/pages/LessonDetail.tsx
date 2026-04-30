import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Header } from '../components/Header'

interface LessonContent {
  id: string
  title: string
  subtitle: string
  content: string[]
  type: string
}

type PlaySpeed = 0.8 | 1 | 1.2

export const LessonDetail: React.FC = () => {
  const { textbookId, lessonId } = useParams<{ textbookId: string; lessonId: string }>()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [speed, setSpeed] = useState<PlaySpeed>(1)
  const [progress, setProgress] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 加载课文内容
  useEffect(() => {
    const loadLesson = async () => {
      if (!textbookId || !lessonId) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/lesson-contents.json`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const lessonData = data[textbookId]?.[lessonId]
        setLesson(lessonData || null)
      } catch (error) {
        console.error('Failed to load lesson:', error)
        setLesson(null)
      } finally {
        setLoading(false)
      }
    }
    loadLesson()
  }, [textbookId, lessonId])

  // 清理语音合成
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // 播放当前句子
  const playSentence = (index: number, autoContinue: boolean = true) => {
    if (!lesson || !window.speechSynthesis) return

    const text = lesson.content[index]
    if (!text || text.trim() === '') {
      // 跳过空行，播放下一句
      if (autoContinue && index < lesson.content.length - 1) {
        playSentence(index + 1, autoContinue)
      } else {
        setIsPlaying(false)
        setCurrentIndex(-1)
      }
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = speed
    utterance.pitch = 1

    utterance.onstart = () => {
      setCurrentIndex(index)
      // 自动滚动到当前句子
      const element = document.getElementById(`sentence-${index}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    utterance.onend = () => {
      // 自动继续播放下一句
      if (autoContinue && index < lesson.content.length - 1) {
        playSentence(index + 1, autoContinue)
      } else {
        setIsPlaying(false)
        setCurrentIndex(-1)
        setProgress(100)
      }
    }

    utterance.onerror = () => {
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // 播放/暂停控制
  const togglePlay = () => {
    if (!lesson) return

    if (isPlaying) {
      window.speechSynthesis?.cancel()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      const startIndex = currentIndex >= 0 ? currentIndex : 0
      playSentence(startIndex)
    }
  }

  // 停止播放
  const stopPlay = () => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setCurrentIndex(-1)
    setProgress(0)
  }

  // 切换语速
  const toggleSpeed = () => {
    const speeds: PlaySpeed[] = [0.8, 1, 1.2]
    const currentIndex = speeds.indexOf(speed)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newSpeed = speeds[nextIndex]
    setSpeed(newSpeed)

    // 如果正在播放，重新开始以应用新语速
    if (isPlaying && utteranceRef.current) {
      window.speechSynthesis.cancel()
      setTimeout(() => {
        playSentence(currentIndex >= 0 ? currentIndex : 0)
      }, 100)
    }
  }

  // 更新进度
  useEffect(() => {
    if (lesson && currentIndex >= 0) {
      setProgress(((currentIndex + 1) / lesson.content.length) * 100)
    }
  }, [currentIndex, lesson])

  // 点击句子播放（只播放当前句，不自动继续）
  const handleSentenceClick = (index: number) => {
    window.speechSynthesis?.cancel()
    setIsPlaying(true)
    playSentence(index, false)  // false = 不自动继续
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="课文详情" showBack={true} onBack={() => navigate(-1)} />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-paper">
        <Header title="课文详情" showBack={true} onBack={() => navigate(-1)} />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-4xl mb-3">📖</div>
          <div className="text-gray-400">暂无课文内容</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
      <Header
        title={lesson.title}
        showBack={true}
        onBack={() => navigate(-1)}
      />

      {/* 课文内容 */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">{lesson.subtitle}</h1>
            <span className="inline-block bg-orange-100 text-primary text-xs px-3 py-1 rounded-full">
              {lesson.type}
            </span>
          </div>

          {/* 正文内容 */}
          <div ref={contentRef} className="space-y-4">
            {lesson.content.map((sentence, index) => (
              <div
                key={index}
                id={`sentence-${index}`}
                onClick={() => handleSentenceClick(index)}
                className={`
                  relative p-4 rounded-xl cursor-pointer transition-all duration-300
                  ${currentIndex === index
                    ? 'bg-orange-50 border-l-4 border-primary'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <p className={`
                  text-lg leading-relaxed
                  ${currentIndex === index ? 'text-ink font-medium' : 'text-gray-700'}
                `}>
                  {sentence}
                </p>

                {/* 播放指示器 */}
                {currentIndex === index && isPlaying && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-0.5 bg-primary animate-[bounce_0.6s_infinite]" style={{ height: '60%' }}></span>
                      <span className="w-0.5 bg-primary animate-[bounce_0.8s_infinite]" style={{ height: '100%' }}></span>
                      <span className="w-0.5 bg-primary animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '60%' }}></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部播放控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom z-50">
        {/* 进度条 */}
        <div className="mb-3">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{currentIndex >= 0 ? currentIndex + 1 : 0} / {lesson.content.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          {/* 语速切换 */}
          <button
            onClick={toggleSpeed}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{speed}x</span>
          </button>

          {/* 播放/暂停按钮 */}
          <button
            onClick={togglePlay}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              transition-all active:scale-95
              ${isPlaying
                ? 'bg-gray-100 text-gray-600'
                : 'bg-primary text-white shadow-lg shadow-orange-200'
              }
            `}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* 重置按钮 */}
          <button
            onClick={stopPlay}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}
