import React, { useEffect, useRef } from 'react'
import HanziWriter from 'hanzi-writer'

interface TianziGridProps {
  char?: string
  size?: number
  showGuideLines?: boolean
  className?: string
}

export const TianziGrid: React.FC<TianziGridProps> = ({
  char,
  size = 200,
  showGuideLines: _showGuideLines,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || !char) return

    // 清空容器
    containerRef.current.innerHTML = ''

    // 创建网格背景
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

    // SVG 米字格 - 与 StrokeAnimator 一致
    gridDiv.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="280" height="280" fill="none" stroke="#D0C0B0" stroke-width="2"/>
        <line x1="150" y1="10" x2="150" y2="290" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="10" y1="150" x2="290" y2="150" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="10" y1="10" x2="290" y2="290" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
        <line x1="290" y1="10" x2="10" y2="290" stroke="#C8B8A8" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.7"/>
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

    // 用 hanzi-writer 显示静态描红 - 尺寸与容器一致
    const writer = HanziWriter.create(targetDiv, char, {
      width: size,
      height: size,
      padding: Math.round(size * 0.03), // 按比例计算 padding
      strokeColor: '#333333',
      radicalColor: '#333333',
      showOutline: true,
      outlineColor: '#E8D4B8', // 淡色描红
      drawingWidth: Math.round(size * 0.04),
    })

    writerRef.current = writer

    // 只显示轮廓（描红），不播放动画
    writer.showOutline()

    return () => {
      writerRef.current = null
    }
  }, [char, size])

  return (
    <div
      ref={containerRef}
      className={`inline-block rounded-xl border-2 border-[#E8D4B8] bg-[#FDF5E6] relative ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
