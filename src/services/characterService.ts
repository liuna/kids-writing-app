import type { Character, SearchResult } from '../types'

// 内存缓存
const characterCache: Record<string, Character> = {}

// hanzi-writer 数据缓存
let hanziWriterData: Record<string, any> | null = null
let hanziWriterLoading: Promise<Record<string, any>> | null = null

// 加载 hanzi-writer 数据
async function loadHanziWriterData(): Promise<Record<string, any>> {
  // 如果已经加载完成，直接返回
  if (hanziWriterData !== null) {
    return hanziWriterData
  }

  // 如果正在加载中，返回同一个 Promise
  if (hanziWriterLoading !== null) {
    return hanziWriterLoading
  }

  // 开始加载
  hanziWriterLoading = (async () => {
    try {
      console.log('开始加载 hanzi-writer 数据...')
      const response = await fetch('https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer-data/all.json')
      if (response.ok) {
        hanziWriterData = await response.json()
        console.log('hanzi-writer 数据加载成功，字符数:', Object.keys(hanziWriterData!).length)
        return hanziWriterData!
      } else {
        console.error('hanzi-writer CDN 返回错误:', response.status)
      }
    } catch (err) {
      console.error('加载 hanzi-writer 数据失败:', err)
    }
    return {}
  })()

  return hanziWriterLoading
}

// 从 CDN 按需加载单个字符数据
async function loadSingleCharData(char: string): Promise<any> {
  try {
    // 编码汉字用于 URL
    const encoded = encodeURIComponent(char)
    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encoded}.json`
    console.log('尝试加载单个字符数据:', url)

    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      console.log('单个字符数据加载成功:', char)
      return data
    } else {
      console.warn('单个字符数据加载失败:', response.status, char)
    }
  } catch (err) {
    console.warn('加载单个字符数据出错:', char, err)
  }
  return null
}

// 从 hanzi-writer 数据提取笔画信息
function extractStrokeInfo(char: string, hwData: any): Character | null {
  if (!hwData || !hwData.strokes) return null

  const strokeCount = hwData.strokes.length
  const strokeOrder = hwData.strokes.map((path: string, index: number) => ({
    order: index + 1,
    name: guessStrokeName(path, index),
    direction: path.charAt(0),
    path,
  }))

  return {
    char,
    pinyin: [getPinyin(char)],
    strokes: strokeCount,
    radical: char,
    strokeOrder,
  }
}

// 解析 SVG path 提取所有坐标点和命令
function parsePathData(path: string): { points: Array<{x: number, y: number}>, commands: string[] } {
  const points: Array<{x: number, y: number}> = []
  const commands: string[] = []

  // 提取所有命令字母
  const cmdMatches = path.match(/[MmLlHhVvCcSsQqTtAaZz]/g)
  if (cmdMatches) commands.push(...cmdMatches)

  // 匹配所有数字（包括小数）
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)
  if (!numbers) return { points, commands }

  for (let i = 0; i < numbers.length; i += 2) {
    const x = parseFloat(numbers[i])
    const y = parseFloat(numbers[i + 1])
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y })
    }
  }
  return { points, commands }
}

// 计算向量角度（弧度）
function getAngle(x: number, y: number): number {
  return Math.atan2(y, x)
}

// 判断是否为钩：末端有急剧回弯
function hasHook(points: Array<{x: number, y: number}>): boolean {
  if (points.length < 4) return false

  const n = points.length
  // 取末端的几点来判断走向变化
  const lastSegmentX = points[n-1].x - points[n-2].x
  const lastSegmentY = points[n-1].y - points[n-2].y

  const prevSegmentX2 = points[n-3].x - points[n-4].x
  const prevSegmentY2 = points[n-3].y - points[n-4].y

  // 计算角度变化
  const angle1 = getAngle(prevSegmentX2, prevSegmentY2)
  const angle2 = getAngle(lastSegmentX, lastSegmentY)
  const angleDiff = Math.abs(angle2 - angle1)

  // 如果有明显的方向回弯（钩的特征）
  if (angleDiff > Math.PI / 3 && angleDiff < Math.PI * 1.5) {
    return true
  }

  return false
}

// 改进的笔画名称识别算法
function guessStrokeName(path: string, index: number): string {
  if (!path) return `第${index + 1}笔`

  const { points } = parsePathData(path)
  if (points.length < 2) return `第${index + 1}笔`

  const start = points[0]
  const end = points[points.length - 1]

  // 计算位移
  const dx = end.x - start.x
  const dy = end.y - start.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // 判断复杂度
  const hasCurve = /[CcQq]/.test(path)
  const hasArc = /[Aa]/.test(path)

  // 计算主体走向（前80%部分）
  const bodyEndIndex = Math.floor(points.length * 0.8)
  const bodyDx = points[bodyEndIndex].x - start.x
  const bodyDy = points[bodyEndIndex].y - start.y
  const bodyAbsDx = Math.abs(bodyDx)
  const bodyAbsDy = Math.abs(bodyDy)

  // 判断是否有钩
  const isHook = hasHook(points)

  // 判断是否有明显转折
  let directionChanges = 0
  if (points.length >= 3) {
    let prevAngle = getAngle(points[1].x - points[0].x, points[1].y - points[0].y)
    for (let i = 2; i < points.length - 1; i++) {
      const angle = getAngle(points[i].x - points[i-1].x, points[i].y - points[i-1].y)
      const angleDiff = Math.abs(normalizeAngle(angle - prevAngle))
      if (angleDiff > Math.PI / 4) {
        directionChanges++
      }
      prevAngle = angle
    }
  }

  // 辅助函数：角度归一化到 -PI ~ PI
  function normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI
    while (angle < -Math.PI) angle += 2 * Math.PI
    return angle
  }

  // ========== 复合笔画判断 ==========
  if (directionChanges >= 1 || hasCurve || hasArc) {
    // 比例判断
    const isHorizontalBody = bodyAbsDx > bodyAbsDy
    const isVerticalBody = bodyAbsDy > bodyAbsDx

    // 横折/横折钩系列：主体是横 + 转折
    if (isHorizontalBody) {
      // 横钩
      if (isHook && dy < bodyAbsDx * 0.3) return '横钩'
      // 横撇
      if (dx < 0 || (bodyDx > 0 && dx < bodyDx * 0.5)) return '横撇'
      // 横折折撇
      if (directionChanges >= 2) return '横折折撇'
      // 横折钩
      if (isHook || hasCurve) return '横折钩'
      return '横折'
    }

    // 竖钩/竖提系列：主体是竖 + 转折
    if (isVerticalBody) {
      // 判断末端方向
      const endDx = points[points.length-1].x - points[points.length-2].x
      const endDy = points[points.length-1].y - points[points.length-2].y

      // 末端向上（提）
      if (endDy < -Math.abs(endDx)) return '竖提'
      // 末端向左或向右（钩）
      if (Math.abs(endDx) > Math.abs(endDy) * 0.5) return '竖钩'
      // 有曲线通常是竖弯钩
      if (hasCurve || hasArc) {
        if (dx > bodyAbsDy * 0.3) return '竖弯钩'
        return '竖弯'
      }
      return '竖折'
    }

    // 撇钩系列
    if (bodyDx < 0 && bodyDy > 0) {
      if (isHook) return '斜钩'
    }

    // 撇点
    if (dx < 0 && dy < 0 && hasCurve) return '撇点'

    return '横折'
  }

  // ========== 简单笔画判断 ==========

  // 1. 竖：主要是垂直向下
  if (bodyAbsDy > bodyAbsDx * 2 && Math.abs(dx) < bodyAbsDy * 0.3) {
    // 检查末端是否有小钩
    if (points.length >= 3) {
      const endDx = points[points.length-1].x - points[points.length-2].x
      if (Math.abs(endDx) > 30) return '竖钩'
    }
    return '竖'
  }

  // 2. 横：主要是水平
  if (bodyAbsDx > bodyAbsDy * 3 && Math.abs(dy) < bodyAbsDx * 0.2) {
    return '横'
  }

  // 3. 提：从左下到右上
  if (dx > 0 && dy < -absDx * 0.3) {
    return '提'
  }

  // 4. 撇：从右上到左下
  if (dx < -absDy * 0.2 && dy > 0) {
    return '撇'
  }

  // 5. 捺：从左上到右下，有弧度
  if (dx > absDy * 0.2 && dy > 0) {
    if (hasCurve || points.length > 3) return '捺'
    return '点'
  }

  // 6. 点：短小，右下方向
  const totalLength = Math.sqrt(absDx * absDx + absDy * absDy)
  if (dx > 0 && dy > 0 && totalLength < 300) {
    return '点'
  }

  // 默认根据主要方向判断
  if (absDx > absDy) {
    return dx > 0 ? '横' : '提'
  } else {
    return dy > 0 ? '竖' : '提'
  }
}

// 获取单个汉字数据
export async function getCharacterData(char: string): Promise<Character | null> {
  // 1. 检查缓存
  if (characterCache[char]) {
    console.log(`[Cache] 命中: ${char}`, characterCache[char].strokeOrder?.map((s: any) => s.name))
    return characterCache[char]
  }

  // 2. 从静态 JSON 加载
  try {
    const response = await fetch('/data/characters/common.json')
    const data = await response.json()

    if (data[char]) {
      // 确保每个笔画都有 name 字段
      const strokeOrder = data[char].strokeOrder?.map((stroke: any, idx: number) => ({
        order: stroke.order || idx + 1,
        name: stroke.name || '',  // 保留原始 name
        direction: stroke.direction || '',
        path: stroke.path || '',
        tips: stroke.tips || '',
      }))

      const character: Character = {
        char,
        pinyin: data[char].pinyin,
        strokes: data[char].strokes,
        radical: data[char].radical,
        strokeOrder,
      }

      // 存入缓存
      characterCache[char] = character
      console.log(`[Local JSON] 加载: ${char}`, strokeOrder.map((s: any) => s.name))
      return character
    }
  } catch (err) {
    console.warn('加载本地汉字数据失败:', char, err)
  }

  // 3. 从 hanzi-writer CDN 按需加载单个字符数据
  try {
    console.log('尝试按需加载字符:', char)
    const singleCharData = await loadSingleCharData(char)
    if (singleCharData) {
      const charData = extractStrokeInfo(char, singleCharData)
      if (charData) {
        characterCache[char] = charData
        return charData
      }
    }
  } catch (err) {
    console.error('按需加载字符失败:', char, err)
  }

  // 4. 尝试从完整的 hanzi-writer 数据加载
  try {
    const hwData = await loadHanziWriterData()
    console.log('hanzi-writer 数据加载完成，字符数:', Object.keys(hwData).length)

    if (hwData[char]) {
      console.log('在完整数据中找到:', char)
      const charData = extractStrokeInfo(char, hwData[char])
      if (charData) {
        characterCache[char] = charData
        return charData
      }
    } else {
      console.warn('hanzi-writer 数据中未找到:', char)
    }
  } catch (err) {
    console.error('加载 hanzi-writer 数据失败:', char, err)
  }

  // 5. 如果都不在，返回基础信息
  return {
    char,
    pinyin: [getPinyin(char)],
    strokes: 0,
    radical: char,
    strokeOrder: [],
  }
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
