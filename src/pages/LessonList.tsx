import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react'
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

export const LessonList: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)

  const lessons = mockLessons[id || ''] || []

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId)
  }

  return (
    <div className="min-h-screen bg-paper">
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
        {lessons.map((lesson) => {
          const isExpanded = expandedLesson === lesson.id

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl overflow-hidden"
            >
              {/* 课文标题 */}
              <div
                onClick={() => lesson.chars.length > 0 && toggleLesson(lesson.id)}
                className="p-4 flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-ink">{lesson.title}</h3>
                  {lesson.subtitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{lesson.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {lesson.chars.length > 0 && (
                    <span className="text-sm text-gray-400">{lesson.chars.length}字</span>
                  )}
                  {lesson.chars.length > 0 && (
                    isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )
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
    </div>
  )
}
