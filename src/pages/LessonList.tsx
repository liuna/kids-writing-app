import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, ChevronDown, FileText, Play, Pause, Volume2 } from 'lucide-react'
import { Header } from '../components/Header'
import { CharacterCardMini } from '../components/CharacterCard'

// 部编版一年级上册完整课文数据
const mockLessons: Record<string, Array<{
  id: string
  title: string
  subtitle?: string
  chars: string[]
}>> = {
  'grade1-sem1': [
    // 识字一（5课）
    { id: 'l1', title: '识字 1', subtitle: '天地人', chars: ['天', '地', '人', '你', '我', '他'] },
    { id: 'l2', title: '识字 2', subtitle: '金木水火土', chars: ['金', '木', '水', '火', '土'] },
    { id: 'l3', title: '识字 3', subtitle: '口耳目', chars: ['口', '耳', '目', '手', '足'] },
    { id: 'l4', title: '识字 4', subtitle: '日月水火', chars: ['日', '月', '山', '石', '田', '禾'] },
    { id: 'l5', title: '识字 5', subtitle: '对韵歌', chars: ['云', '雨', '风', '花', '鸟', '虫', '六', '七', '八', '九', '十'] },
    // 汉语拼音（8课）- 无识字内容
    { id: 'l6', title: '汉语拼音', subtitle: 'a o e i u ü', chars: [] },
    // 课文（4课）
    { id: 'l7', title: '课文 1', subtitle: '秋天', chars: ['秋', '气', '了', '树', '叶', '片', '大', '飞', '会', '个'] },
    { id: 'l8', title: '课文 2', subtitle: '小小的船', chars: ['的', '船', '两', '头', '在', '里', '看', '见', '闪', '星'] },
    { id: 'l9', title: '课文 3', subtitle: '江南', chars: ['江', '南', '可', '采', '莲', '鱼', '东', '西', '北'] },
    { id: 'l10', title: '课文 4', subtitle: '四季', chars: ['尖', '说', '春', '夏', '弯', '青', '蛙', '冬', '男', '女'] },
    // 识字二（5课）
    { id: 'l11', title: '识字 6', subtitle: '画', chars: ['画', '远', '近', '色', '听', '无', '声', '去', '还', '有'] },
    { id: 'l12', title: '识字 7', subtitle: '大小多少', chars: ['多', '少', '黄', '牛', '只', '猫', '边', '鸭', '苹', '果'] },
    { id: 'l13', title: '识字 8', subtitle: '小书包', chars: ['包', '尺', '作', '业', '本', '笔', '刀', '课', '早', '校'] },
    { id: 'l14', title: '识字 9', subtitle: '日月明', chars: ['明', '力', '尘', '从', '众', '双', '木', '林', '森', '条', '心'] },
    { id: 'l15', title: '识字 10', subtitle: '升国旗', chars: ['升', '国', '旗', '中', '红', '歌', '起', '么', '美', '丽', '立'] },
    // 课文（5课）
    { id: 'l16', title: '课文 5', subtitle: '影子', chars: ['影', '前', '后', '黑', '狗', '左', '右', '它', '好', '朋', '友'] },
    { id: 'l17', title: '课文 6', subtitle: '比尾巴', chars: ['比', '尾', '巴', '谁', '长', '短', '把', '伞', '兔', '最', '公'] },
    { id: 'l18', title: '课文 7', subtitle: '青蛙写诗', chars: ['写', '诗', '点', '要', '过', '给', '当', '串', '们', '以', '成'] },
    { id: 'l19', title: '课文 8', subtitle: '雨点儿', chars: ['数', '彩', '半', '空', '问', '到', '方', '没', '更', '绿', '出', '长'] },
    { id: 'l20', title: '课文 9', subtitle: '明天要远足', chars: ['才', '明', '同', '学', '睡', '那', '海', '真', '老', '师', '吗', '什', '亮'] },
  ],
  'grade1-sem2': [
    // 识字一（4课）
    { id: 'l1', title: '识字 1', subtitle: '春夏秋冬', chars: ['春', '夏', '秋', '冬', '风', '雪', '花', '飞', '入'] },
    { id: 'l2', title: '识字 2', subtitle: '姓氏歌', chars: ['姓', '什', '么', '双', '国', '王', '方'] },
    { id: 'l3', title: '识字 3', subtitle: '小青蛙', chars: ['青', '清', '气', '晴', '情', '请', '生'] },
    { id: 'l4', title: '识字 4', subtitle: '猜字谜', chars: ['字', '左', '右', '红', '时', '动', '万'] },
    // 课文一（3课）
    { id: 'l5', title: '课文 1', subtitle: '吃水不忘挖井人', chars: ['吃', '叫', '主', '江', '住', '没', '以'] },
    { id: 'l6', title: '课文 2', subtitle: '我多想去看看', chars: ['会', '走', '北', '京', '门', '广'] },
    { id: 'l7', title: '课文 3', subtitle: '一个接一个', chars: ['过', '各', '种', '样', '伙', '伴', '这'] },
    { id: 'l8', title: '课文 4', subtitle: '四个太阳', chars: ['太', '阳', '道', '送', '忙', '尝', '香', '甜', '温', '暖', '该', '颜', '因'] },
    // 课文二（5课）
    { id: 'l9', title: '课文 5', subtitle: '小公鸡和小鸭子', chars: ['他', '河', '说', '也', '地', '听', '哥', '捉', '急', '直', '行', '死', '信', '跟', '忽', '喊', '身'] },
    { id: 'l10', title: '课文 6', subtitle: '树和喜鹊', chars: ['单', '居', '招', '呼', '快', '乐'] },
    { id: 'l11', title: '课文 7', subtitle: '怎么都快乐', chars: ['玩', '很', '当', '音', '讲', '行', '许'] },
    // 课文三（4课）
    { id: 'l12', title: '课文 8', subtitle: '静夜思', chars: ['思', '床', '前', '光', '低', '故', '乡'] },
    { id: 'l13', title: '课文 9', subtitle: '夜色', chars: ['胆', '敢', '往', '外', '勇', '窗', '乱', '偏', '散', '原', '像', '微'] },
    { id: 'l14', title: '课文 10', subtitle: '端午粽', chars: ['端', '粽', '节', '总', '米', '间', '分', '豆', '肉', '带', '知', '据', '念'] },
    { id: 'l15', title: '课文 11', subtitle: '彩虹', chars: ['虹', '座', '浇', '提', '洒', '挑', '兴', '拿', '镜', '照'] },
    // 识字二（4课）
    { id: 'l16', title: '识字 5', subtitle: '动物儿歌', chars: ['间', '迷', '造', '运', '池', '欢', '网'] },
    { id: 'l17', title: '识字 6', subtitle: '古对今', chars: ['古', '凉', '细', '夕', '李', '语', '香'] },
    { id: 'l18', title: '识字 7', subtitle: '操场上', chars: ['操', '场', '拔', '拍', '跑', '踢', '铃', '热', '闹', '锻', '炼', '体'] },
    { id: 'l19', title: '识字 8', subtitle: '人之初', chars: ['之', '初', '性', '善', '习', '教', '迁', '贵', '专', '幼', '玉', '器', '义'] },
    // 课文四（4课）
    { id: 'l20', title: '课文 12', subtitle: '古诗二首（池上/小池）', chars: ['首', '池', '爱', '尖', '角', '亮', '机', '台', '放', '鱼', '朵', '美'] },
    { id: 'l21', title: '课文 13', subtitle: '荷叶圆圆', chars: ['珠', '摇', '躺', '晶', '停', '机', '展', '透', '翅', '膀', '唱', '朵'] },
    { id: 'l22', title: '课文 14', subtitle: '要下雨了', chars: ['腰', '坡', '沉', '伸', '潮', '湿', '呢', '空', '闷', '消', '息', '搬', '响'] },
    { id: 'l23', title: '课文 15', subtitle: '文具的家', chars: ['文', '具', '次', '丢', '哪', '新', '每', '平', '她', '些', '仔', '找', '所', '钟', '元', '洗', '共', '已', '经'] },
  ]
}

interface LessonContentData {
  id: string
  title: string
  subtitle: string
  content: string[]
  type: string
}

type PlaySpeed = 0.8 | 1 | 1.2

export const LessonList: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [lessonContents, setLessonContents] = useState<Record<string, LessonContentData>>({})

  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(-1)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1)
  const [speed, setSpeed] = useState<PlaySpeed>(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const lessons = mockLessons[id || ''] || []

  // 加载课文内容数据
  useEffect(() => {
    const loadContents = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/lesson-contents.json`)
        if (!response.ok) return
        const data = await response.json()
        setLessonContents(data[id || ''] || {})
      } catch (error) {
        console.error('Failed to load lesson contents:', error)
      }
    }
    loadContents()
  }, [id])

  // 清理语音合成
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId)
  }

  // 播放指定课文的指定句子
  const playSentence = (lessonIdx: number, sentenceIdx: number) => {
    const lesson = lessons[lessonIdx]
    if (!lesson) return

    const content = lessonContents[lesson.id]
    if (!content || !content.content[sentenceIdx]) {
      // 当前课文播完了，尝试下一课
      if (lessonIdx < lessons.length - 1) {
        playSentence(lessonIdx + 1, 0)
      } else {
        // 所有课文播完
        setIsPlaying(false)
        setCurrentLessonIndex(-1)
        setCurrentSentenceIndex(-1)
      }
      return
    }

    const text = content.content[sentenceIdx]
    if (!text || text.trim() === '') {
      // 跳过空行
      playSentence(lessonIdx, sentenceIdx + 1)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = speed
    utterance.pitch = 1

    utterance.onstart = () => {
      setCurrentLessonIndex(lessonIdx)
      setCurrentSentenceIndex(sentenceIdx)
    }

    utterance.onend = () => {
      // 继续播放下一句
      playSentence(lessonIdx, sentenceIdx + 1)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  // 开始/停止播放
  const togglePlay = (startLessonIndex: number = 0) => {
    if (isPlaying) {
      window.speechSynthesis?.cancel()
      setIsPlaying(false)
      setCurrentLessonIndex(-1)
      setCurrentSentenceIndex(-1)
    } else {
      setIsPlaying(true)
      // 如果从当前播放位置继续
      const lessonIdx = currentLessonIndex >= 0 ? currentLessonIndex : startLessonIndex
      const sentenceIdx = currentSentenceIndex >= 0 ? currentSentenceIndex : 0
      playSentence(lessonIdx, sentenceIdx)
    }
  }

  // 切换语速
  const toggleSpeed = () => {
    const speeds: PlaySpeed[] = [0.8, 1, 1.2]
    const currentIdx = speeds.indexOf(speed)
    const nextIdx = (currentIdx + 1) % speeds.length
    setSpeed(speeds[nextIdx])
  }

  // 计算总进度
  const getProgress = () => {
    if (currentLessonIndex < 0) return 0
    const totalLessons = lessons.length
    return Math.round(((currentLessonIndex + 1) / totalLessons) * 100)
  }

  // 获取当前播放的课文标题
  const getCurrentLessonTitle = () => {
    if (currentLessonIndex < 0 || currentLessonIndex >= lessons.length) return ''
    return lessons[currentLessonIndex]?.subtitle || ''
  }

  return (
    <div className="min-h-screen bg-paper pb-24">
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
        {lessons.map((lesson, index) => {
          const isExpanded = expandedLesson === lesson.id
          const isCurrentPlaying = isPlaying && currentLessonIndex === index

          return (
            <div
              key={lesson.id}
              className={`bg-white rounded-2xl overflow-hidden ${isCurrentPlaying ? 'ring-2 ring-primary' : ''}`}
            >
              {/* 课文标题 */}
              <div className="p-4 flex items-center justify-between">
                {/* 播放按钮 */}
                <button
                  onClick={() => {
                    if (isCurrentPlaying) {
                      togglePlay()
                    } else {
                      // 从这篇课文开始播放
                      window.speechSynthesis?.cancel()
                      setCurrentLessonIndex(index)
                      setCurrentSentenceIndex(0)
                      togglePlay(index)
                    }
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                    transition-all active:scale-95
                    ${isCurrentPlaying
                      ? 'bg-primary text-white'
                      : 'bg-orange-50 text-primary hover:bg-orange-100'
                    }
                  `}
                >
                  {isCurrentPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 cursor-pointer" onClick={() => lesson.chars.length > 0 && toggleLesson(lesson.id)}>
                  <h3 className="font-medium text-ink">{lesson.title}</h3>
                  {lesson.subtitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{lesson.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* 查看原文按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/lesson/${id}/${lesson.id}`)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-primary rounded-full text-sm hover:bg-orange-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>原文</span>
                  </button>

                  {lesson.chars.length > 0 && (
                    <span className="text-sm text-gray-400">{lesson.chars.length}字</span>
                  )}
                  {lesson.chars.length > 0 && (
                    <div onClick={() => toggleLesson(lesson.id)} className="cursor-pointer">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
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

      {/* 底部播放控制栏 */}
      {isPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom z-50">
          {/* 当前播放信息 */}
          <div className="text-center mb-2">
            <span className="text-sm text-gray-600">
              正在播放：{getCurrentLessonTitle()}
            </span>
          </div>

          {/* 进度条 */}
          <div className="mb-3">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{currentLessonIndex + 1} / {lessons.length} 课</span>
              <span>{getProgress()}%</span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4">
            {/* 语速切换 */}
            <button
              onClick={toggleSpeed}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{speed}x</span>
            </button>

            {/* 暂停/继续按钮 */}
            <button
              onClick={() => togglePlay()}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-orange-200"
            >
              <Pause className="w-6 h-6" />
            </button>

            {/* 停止按钮 */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel()
                setIsPlaying(false)
                setCurrentLessonIndex(-1)
                setCurrentSentenceIndex(-1)
              }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              停止
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
