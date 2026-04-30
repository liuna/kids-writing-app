import type { Character, SearchResult } from '../types'

// 内存缓存
const characterCache: Record<string, Character> = {}

// 笔画名称数据缓存
let strokeData: Record<string, string[]> | null = null
let strokeDataLoading: Promise<Record<string, string[]>> | null = null

// 加载笔画名称数据
async function loadStrokeData(): Promise<Record<string, string[]>> {
  if (strokeData !== null) {
    return strokeData
  }

  if (strokeDataLoading !== null) {
    return strokeDataLoading
  }

  strokeDataLoading = (async () => {
    try {
      const response = await fetch('/data/character-strokes.json')
      if (response.ok) {
        strokeData = await response.json()
        console.log('笔画数据加载成功，字符数:', Object.keys(strokeData!).length)
        return strokeData!
      }
    } catch (err) {
      console.error('加载笔画数据失败:', err)
    }
    return {}
  })()

  return strokeDataLoading
}

// 获取单个汉字数据 - 只使用本地数据
export async function getCharacterData(char: string): Promise<Character | null> {
  // 1. 检查缓存
  if (characterCache[char]) {
    console.log(`[Cache] 命中: ${char}`, characterCache[char].strokeOrder?.map((s: any) => s.name))
    return characterCache[char]
  }

  // 2. 从笔画数据加载
  try {
    const strokeNames = await loadStrokeData()
    const accurateStrokes = strokeNames[char]

    if (accurateStrokes && accurateStrokes.length > 0) {
      const strokeOrder = accurateStrokes.map((name: string, idx: number) => ({
        index: idx + 1,
        name,
        direction: '',
        path: '',
        tips: '',
      }))

      const character: Character = {
        char,
        pinyin: [getPinyin(char)],
        strokes: accurateStrokes.length,
        radical: char,
        strokeOrder,
      }

      characterCache[char] = character
      console.log(`[Stroke Data] 加载: ${char}`, strokeOrder.map((s: any) => s.name))
      return character
    }

    console.warn(`[Stroke Data] 未找到: ${char}`)
  } catch (err) {
    console.warn('加载笔画数据失败:', char, err)
  }

  // 3. 未收录，返回空
  return null
}

// 获取简单拼音（不使用外部库时的备选）
function getPinyin(char: string): string {
  // 常用字拼音映射
  const pinyinMap: Record<string, string> = {
    // 数字
    '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
    '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí',
    '百': 'bǎi', '千': 'qiān', '万': 'wàn', '零': 'líng',
    // 基础字
    '天': 'tiān', '地': 'dì', '人': 'rén', '你': 'nǐ', '我': 'wǒ',
    '他': 'tā', '她': 'tā', '它': 'tā', '们': 'men', '大': 'dà',
    '小': 'xiǎo', '多': 'duō', '少': 'shǎo', '男': 'nán', '女': 'nǚ',
    '自': 'zì', '己': 'jǐ', '朋': 'péng', '友': 'yǒu', '是': 'shì',
    // 方向
    '上': 'shàng', '下': 'xià', '左': 'zuǒ', '右': 'yòu', '前': 'qián',
    '后': 'hòu', '里': 'lǐ', '外': 'wài', '中': 'zhōng', '东': 'dōng',
    '南': 'nán', '西': 'xī', '北': 'běi', '边': 'biān',
    // 自然
    '日': 'rì', '月': 'yuè', '星': 'xīng', '水': 'shuǐ', '火': 'huǒ',
    '木': 'mù', '土': 'tǔ', '金': 'jīn', '石': 'shí', '山': 'shān',
    '川': 'chuān', '河': 'hé', '江': 'jiāng', '湖': 'hú', '海': 'hǎi',
    '林': 'lín', '森': 'sēn', '树': 'shù', '枝': 'zhī', '叶': 'yè',
    '花': 'huā', '草': 'cǎo', '根': 'gēn', '果': 'guǒ', '皮': 'pí',
    '种': 'zhǒng', '苗': 'miáo', '芽': 'yá',
    // 季节天气
    '春': 'chūn', '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '季': 'jì',
    '节': 'jié', '气': 'qì', '晴': 'qíng', '阴': 'yīn', '雨': 'yǔ',
    '雪': 'xuě', '霜': 'shuāng', '露': 'lù', '雾': 'wù', '云': 'yún',
    '风': 'fēng', '雷': 'léi', '电': 'diàn', '冰': 'bīng', '冷': 'lěng',
    '热': 'rè', '暖': 'nuǎn', '凉': 'liáng', '温': 'wēn',
    // 植物
    '松': 'sōng', '柏': 'bǎi', '杨': 'yáng', '柳': 'liǔ', '桃': 'táo',
    '李': 'lǐ', '杏': 'xìng', '梅': 'méi', '梨': 'lí', '枣': 'zǎo',
    '柿': 'shì', '苹': 'píng', '蕉': 'jiāo', '橘': 'jú', '橙': 'chéng',
    '葡': 'pú', '萄': 'táo', '樱': 'yīng', '枫': 'fēng', '梧': 'wú',
    '桐': 'tóng', '银': 'yín', '竹': 'zhú', '笋': 'sǔn', '茶': 'chá',
    '药': 'yào', '荷': 'hé', '莲': 'lián', '菊': 'jú', '兰': 'lán',
    '桂': 'guì', '葵': 'kuí', '芦': 'lú', '苇': 'wěi',
    // 颜色
    '红': 'hóng', '黄': 'huáng', '蓝': 'lán', '绿': 'lǜ', '白': 'bái',
    '黑': 'hēi', '灰': 'huī', '粉': 'fěn', '紫': 'zǐ',
    '青': 'qīng', '棕': 'zōng', '褐': 'hè', '彩': 'cǎi', '淡': 'dàn',
    '浓': 'nóng', '深': 'shēn', '浅': 'qiǎn', '鲜': 'xiān', '暗': 'àn',
    '亮': 'liàng',
    // 身体部位
    '身': 'shēn', '体': 'tǐ', '头': 'tóu', '面': 'miàn', '脸': 'liǎn',
    '眼': 'yǎn', '睛': 'jīng', '眉': 'méi', '鼻': 'bí', '口': 'kǒu',
    '耳': 'ěr', '舌': 'shé', '牙': 'yá', '唇': 'chún', '齿': 'chǐ',
    '颈': 'jǐng', '项': 'xiàng', '肩': 'jiān', '背': 'bèi', '胸': 'xiōng',
    '腹': 'fù', '腰': 'yāo', '臂': 'bì', '肘': 'zhǒu', '腕': 'wàn',
    '掌': 'zhǎng', '指': 'zhǐ', '拳': 'quán', '腿': 'tuǐ', '膝': 'xī',
    '脚': 'jiǎo', '骨': 'gǔ', '血': 'xuè', '脉': 'mài', '肉': 'ròu',
    '肤': 'fū', '汗': 'hàn', '泪': 'lèi',
    // 家庭成员
    '爸': 'bà', '妈': 'mā', '父': 'fù', '母': 'mǔ', '爹': 'diē',
    '娘': 'niáng', '哥': 'gē', '姐': 'jiě', '弟': 'dì', '妹': 'mèi',
    '兄': 'xiōng', '嫂': 'sǎo', '夫': 'fū', '妻': 'qī', '子': 'zǐ',
    '孙': 'sūn', '儿': 'ér', '侄': 'zhí', '甥': 'shēng', '叔': 'shū',
    '伯': 'bó', '姑': 'gū', '姨': 'yí', '舅': 'jiù', '婶': 'shěn',
    '爷': 'yé', '奶': 'nǎi', '姥': 'lǎo', '婆': 'pó', '岳': 'yuè',
    '丈': 'zhàng', '婿': 'xù', '媳': 'xí', '继': 'jì', '养': 'yǎng',
    '亲': 'qīn', '戚': 'qī',
    // 动作
    '有': 'yǒu', '要': 'yào', '会': 'huì', '能': 'néng', '可': 'kě',
    '行': 'xíng', '成': 'chéng', '好': 'hǎo', '坏': 'huài', '对': 'duì',
    '错': 'cuò', '真': 'zhēn', '假': 'jiǎ', '开': 'kāi', '关': 'guān',
    '合': 'hé', '分': 'fēn', '离': 'lí', '散': 'sàn', '聚': 'jù',
    '集': 'jí', '完': 'wán', '整': 'zhěng', '全': 'quán', '齐': 'qí',
    '杂': 'zá', '乱': 'luàn', '脏': 'zāng', '净': 'jìng', '清': 'qīng',
    '浑': 'hún', '浊': 'zhuó', '稠': 'chóu', '稀': 'xī', '密': 'mì',
    '疏': 'shū', '紧': 'jǐn', '软': 'ruǎn', '硬': 'yìng',
    '干': 'gān', '湿': 'shī', '潮': 'cháo', '润': 'rùn', '燥': 'zào',
    '枯': 'kū', '荣': 'róng', '盛': 'shèng', '衰': 'shuāi', '败': 'bài',
    '亡': 'wáng', '灭': 'miè', '绝': 'jué', '生': 'shēng', '死': 'sǐ',
    '存': 'cún', '活': 'huó', '在': 'zài', '没': 'méi', '无': 'wú',
    '空': 'kōng', '实': 'shí', '虚': 'xū', '满': 'mǎn', '缺': 'quē',
    '够': 'gòu', '足': 'zú', '丰': 'fēng', '富': 'fù', '贫': 'pín',
    '穷': 'qióng', '贵': 'guì', '贱': 'jiàn', '廉': 'lián', '便': 'biàn',
    '宜': 'yi', '奢': 'shē', '侈': 'chǐ', '俭': 'jiǎn',
    '勤': 'qín', '朴': 'pǔ', '素': 'sù', '华': 'huá', '丽': 'lì',
    '浮': 'fú', '夸': 'kuā', '伪': 'wěi', '诚': 'chéng', '恳': 'kěn',
    '切': 'qiè', '殷': 'yīn', '情': 'qíng', '漠': 'mò', '严': 'yán',
    '厉': 'lì', '和': 'hé', '暴': 'bào', '柔': 'róu', '文': 'wén',
    '雅': 'yǎ', '俗': 'sú', '鲁': 'lǔ', '莽': 'mǎng', '谨': 'jǐn',
    '慎': 'shèn', '意': 'yì', '细': 'xì', '致': 'zhì', '精': 'jīng',
    '用': 'yòng', '专': 'zhuān', '刻': 'kè', '苦': 'kǔ', '努': 'nǔ',
    '力': 'lì', '奋': 'fèn', '懒': 'lǎn', '惰': 'duò', '慢': 'màn',
    '快': 'kuài', '捷': 'jié', '敏': 'mǐn', '感': 'gǎn', '机': 'jī',
    '灵': 'líng', '聪': 'cōng', '明': 'míng', '智': 'zhì', '慧': 'huì',
    '愚': 'yú', '蠢': 'chǔn', '傻': 'shǎ', '痴': 'chī', '呆': 'dāi',
    '疯': 'fēng', '狂': 'kuáng', '癫': 'diān', '瓜': 'guā', '蛋': 'dàn',
    '材': 'cái', '废': 'fèi', '物': 'wù', '垃': 'lā', '圾': 'jī',
    '宝': 'bǎo', '贝': 'bèi', '瑰': 'guī', '珍': 'zhēn', '珠': 'zhū',
    '钻': 'zuàn', '翡': 'fěi', '翠': 'cuì', '玛': 'mǎ', '瑙': 'nǎo',
    '琥': 'hǔ', '珀': 'pò', '珊': 'shān', '瑚': 'hú', '象': 'xiàng',
    '犀': 'xī', '牛': 'niú', '角': 'jiǎo',
  }

  return pinyinMap[char] || char
}

// 搜索汉字
export function searchCharacters(query: string): SearchResult[] {
  const results: SearchResult[] = []
  const q = query.toLowerCase().trim()

  if (!q) return results

  // 检查是否是汉字
  const isChinese = /[\u4e00-\u9fa5]/.test(q)

  if (isChinese && q.length === 1) {
    // 直接匹配汉字
    results.push({
      char: q,
      pinyin: getPinyin(q),
      strokes: 0,
      matchType: 'exact',
    })
  } else {
    // 拼音搜索（简单匹配）
    const commonChars = getCommonCharacters()
    commonChars.forEach(char => {
      const py = getPinyin(char).toLowerCase()
      if (py.includes(q) || py.startsWith(q)) {
        results.push({
          char,
          pinyin: getPinyin(char),
          strokes: 0,
          matchType: py === q ? 'exact' : 'pinyin',
        })
      }
    })
  }

  return results.slice(0, 20)
}

// 获取常用汉字
export function getCommonCharacters(): string[] {
  return [
    '一', '二', '三', '四', '五', '上', '下', '天', '地', '人',
    '你', '我', '他', '大', '小', '多', '少', '日', '月', '水',
    '火', '山', '石', '田', '禾', '土', '口', '耳', '目', '手',
    '足', '站', '坐', '云', '雨', '风', '雪', '花', '鸟', '虫',
    '六', '七', '八', '九', '十', '爸', '妈', '哥', '姐', '弟',
    '妹', '爷', '奶', '春', '夏', '秋', '冬', '东', '南', '西',
    '北', '男', '女', '不', '了', '子', '在', '是', '有', '和',
    '也', '这', '那', '个', '国', '家', '学', '书', '老', '师'
  ]
}

// 设置缓存
export function setCharacterCache(char: string, data: Character) {
  characterCache[char] = data
}

export function getCacheInfo() {
  return {
    size: Object.keys(characterCache).length,
    chars: Object.keys(characterCache),
  }
}
