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

// 获取拼音 - 部编版一年级上册生字
function getPinyin(char: string): string {
  const map: Record<string, string> = {
    // 识字一
    '天': 'tiān', '地': 'dì', '人': 'rén', '你': 'nǐ', '我': 'wǒ', '他': 'tā',
    '金': 'jīn', '木': 'mù', '水': 'shuǐ', '火': 'huǒ', '土': 'tǔ',
    '口': 'kǒu', '耳': 'ěr', '目': 'mù', '手': 'shǒu', '足': 'zú',
    '日': 'rì', '月': 'yuè', '山': 'shān', '石': 'shí', '田': 'tián', '禾': 'hé',
    '云': 'yún', '雨': 'yǔ', '风': 'fēng', '花': 'huā', '鸟': 'niǎo', '虫': 'chóng',
    '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí',
    // 课文 1-4
    '秋': 'qiū', '气': 'qì', '了': 'le', '树': 'shù', '叶': 'yè', '片': 'piàn', '大': 'dà', '飞': 'fēi', '会': 'huì', '个': 'gè',
    '的': 'de', '船': 'chuán', '两': 'liǎng', '头': 'tóu', '在': 'zài', '里': 'lǐ', '看': 'kàn', '见': 'jiàn', '闪': 'shǎn', '星': 'xīng',
    '江': 'jiāng', '南': 'nán', '可': 'kě', '采': 'cǎi', '莲': 'lián', '鱼': 'yú', '东': 'dōng', '西': 'xī', '北': 'běi',
    '尖': 'jiān', '说': 'shuō', '春': 'chūn', '夏': 'xià', '弯': 'wān', '青': 'qīng', '蛙': 'wā', '冬': 'dōng', '男': 'nán', '女': 'nǚ',
    // 识字二
    '画': 'huà', '远': 'yuǎn', '近': 'jìn', '色': 'sè', '听': 'tīng', '无': 'wú', '声': 'shēng', '去': 'qù', '还': 'hái', '有': 'yǒu',
    '多': 'duō', '少': 'shǎo', '黄': 'huáng', '牛': 'niú', '只': 'zhī', '猫': 'māo', '边': 'biān', '鸭': 'yā', '苹': 'píng', '果': 'guǒ',
    '包': 'bāo', '尺': 'chǐ', '作': 'zuò', '业': 'yè', '本': 'běn', '笔': 'bǐ', '刀': 'dāo', '课': 'kè', '早': 'zǎo', '校': 'xiào',
    '明': 'míng', '力': 'lì', '尘': 'chén', '从': 'cóng', '众': 'zhòng', '双': 'shuāng', '林': 'lín', '森': 'sēn', '条': 'tiáo', '心': 'xīn',
    '升': 'shēng', '国': 'guó', '旗': 'qí', '中': 'zhōng', '红': 'hóng', '歌': 'gē', '起': 'qǐ', '么': 'me', '美': 'měi', '丽': 'lì', '立': 'lì',
    // 课文 5-9
    '影': 'yǐng', '前': 'qián', '后': 'hòu', '黑': 'hēi', '狗': 'gǒu', '左': 'zuǒ', '右': 'yòu', '它': 'tā', '好': 'hǎo', '朋': 'péng', '友': 'yǒu',
    '比': 'bǐ', '尾': 'wěi', '巴': 'bā', '谁': 'shuí', '长': 'cháng', '短': 'duǎn', '把': 'bǎ', '伞': 'sǎn', '兔': 'tù', '最': 'zuì', '公': 'gōng',
    '写': 'xiě', '诗': 'shī', '点': 'diǎn', '要': 'yào', '过': 'guò', '给': 'gěi', '当': 'dāng', '串': 'chuàn', '们': 'men', '以': 'yǐ', '成': 'chéng',
    '数': 'shǔ', '彩': 'cǎi', '半': 'bàn', '空': 'kōng', '问': 'wèn', '到': 'dào', '没': 'méi', '更': 'gèng', '绿': 'lǜ', '出': 'chū',
    '才': 'cái', '同': 'tóng', '学': 'xué', '睡': 'shuì', '那': 'nà', '海': 'hǎi', '真': 'zhēn', '老': 'lǎo', '师': 'shī', '吗': 'ma',
    // 补充常用字
    '站': 'zhàn', '坐': 'zuò', '是': 'shì', '这': 'zhè',
    // 一年级下册 - 识字一
    '入': 'rù', '姓': 'xìng',
    '清': 'qīng', '晴': 'qíng', '情': 'qíng', '请': 'qǐng', '生': 'shēng',
    '字': 'zì', '时': 'shí', '动': 'dòng', '万': 'wàn',
    // 一年级下册 - 课文一
    '吃': 'chī', '叫': 'jiào', '主': 'zhǔ', '住': 'zhù',
    '走': 'zǒu', '京': 'jīng', '门': 'mén', '广': 'guǎng',
    '各': 'gè', '种': 'zhǒng', '样': 'yàng',
    '太': 'tài', '阳': 'yáng', '道': 'dào', '送': 'sòng', '忙': 'máng', '尝': 'cháng', '香': 'xiāng', '甜': 'tián', '温': 'wēn', '暖': 'nuǎn', '该': 'gāi', '颜': 'yán', '因': 'yīn',
    // 一年级下册 - 课文二
    '哥': 'gē', '捉': 'zhuō', '急': 'jí', '直': 'zhí', '行': 'xíng', '死': 'sǐ', '信': 'xìn', '跟': 'gēn', '忽': 'hū', '喊': 'hǎn', '身': 'shēn',
    '单': 'dān', '居': 'jū', '招': 'zhāo', '呼': 'hū', '乐': 'lè',
    '玩': 'wán', '很': 'hěn', '音': 'yīn', '讲': 'jiǎng', '许': 'xǔ',
    // 一年级下册 - 课文三
    '思': 'sī', '床': 'chuáng', '光': 'guāng', '低': 'dī', '故': 'gù', '乡': 'xiāng',
    '胆': 'dǎn', '敢': 'gǎn', '往': 'wǎng', '外': 'wài', '勇': 'yǒng', '窗': 'chuāng', '乱': 'luàn', '偏': 'piān', '散': 'sàn', '原': 'yuán', '像': 'xiàng', '微': 'wēi',
    '端': 'duān', '粽': 'zòng', '节': 'jié', '总': 'zǒng', '米': 'mǐ', '间': 'jiān', '分': 'fēn', '豆': 'dòu', '肉': 'ròu', '带': 'dài', '知': 'zhī', '据': 'jù', '念': 'niàn',
    '虹': 'hóng', '座': 'zuò', '浇': 'jiāo', '提': 'tí', '洒': 'sǎ', '挑': 'tiāo', '兴': 'xìng', '拿': 'ná', '镜': 'jìng', '照': 'zhào',
    // 一年级下册 - 识字二
    '迷': 'mí', '造': 'zào', '运': 'yùn', '池': 'chí', '欢': 'huān', '网': 'wǎng',
    '古': 'gǔ', '凉': 'liáng', '细': 'xì', '夕': 'xī', '李': 'lǐ', '语': 'yǔ',
    '操': 'cāo', '场': 'chǎng', '拔': 'bá', '拍': 'pāi', '跑': 'pǎo', '踢': 'tī', '铃': 'líng', '热': 'rè', '闹': 'nào', '锻': 'duàn', '炼': 'liàn', '体': 'tǐ',
    '之': 'zhī', '初': 'chū', '性': 'xìng', '善': 'shàn', '习': 'xí', '教': 'jiào', '迁': 'qiān', '贵': 'guì', '专': 'zhuān', '幼': 'yòu', '玉': 'yù', '器': 'qì', '义': 'yì',
    // 一年级下册 - 课文四
    '首': 'shǒu', '爱': 'ài', '角': 'jiǎo', '台': 'tái', '放': 'fàng',
    '珠': 'zhū', '摇': 'yáo', '躺': 'tǎng', '晶': 'jīng', '停': 'tíng', '展': 'zhǎn', '透': 'tòu', '翅': 'chì', '膀': 'bǎng', '唱': 'chàng',
    '腰': 'yāo', '坡': 'pō', '沉': 'chén', '伸': 'shēn', '潮': 'cháo', '湿': 'shī', '呢': 'ne', '闷': 'mēn', '消': 'xiāo', '息': 'xī', '搬': 'bān', '响': 'xiǎng',
    '文': 'wén', '具': 'jù', '次': 'cì', '丢': 'diū', '哪': 'nǎ', '新': 'xīn', '每': 'měi', '平': 'píng', '她': 'tā', '些': 'xiē', '仔': 'zǎi', '找': 'zhǎo', '所': 'suǒ', '钟': 'zhōng', '元': 'yuán', '洗': 'xǐ', '共': 'gòng', '已': 'yǐ', '经': 'jīng',
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

// 笔画递进展示组件 - 支持自动换行
const StrokeBreakdown: React.FC<{ char: string; character: Character }> = ({ char, character }) => {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {Array.from({ length: character.strokes }, (_, i) => {
        const stroke = character.strokeOrder?.[i]
        // 优先用查表法，其次用 JSON 的 name，最后用默认
        const strokeName = strokeNames[stroke?.direction || ''] || stroke?.name || `第${i + 1}笔`
        return (
          <div key={i} className="flex flex-col items-center">
            <StepBox char={char} step={i + 1} />
            <span className="text-xs text-primary mt-1.5 font-medium whitespace-nowrap">{strokeName}</span>
          </div>
        )
      })}
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
        {/* 主卡片：书写要点 + 动画区域 */}
        <div className="bg-white px-4 py-4 mb-3">
          {/* 书写要点 */}
          <div className="bg-paper rounded-xl p-3 mb-4">
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

          {/* 主要动画区域 */}
          {/* 拼音 */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl text-gray-500">{character.pinyin?.[0] || getPinyin(character.char)}</span>
              <button
                onClick={() => {
                  if (window.speechSynthesis) {
                    window.speechSynthesis.cancel()
                    const utterance = new SpeechSynthesisUtterance(character.char)
                    utterance.lang = 'zh-CN'
                    utterance.rate = 0.9
                    window.speechSynthesis.speak(utterance)
                  }
                }}
                className="p-1.5 rounded-full bg-orange-100 text-primary hover:bg-orange-200 transition-colors"
                aria-label="播汉字发音"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            </div>
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
