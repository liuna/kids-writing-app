import { useState, useEffect, useCallback } from 'react'
import type { Character } from '../types'
import { getCharacterData } from '../services/characterService'

export const useCharacter = (char: string | undefined) => {
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!char) return

    let cancelled = false

    const loadCharacter = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getCharacterData(char)
        if (!cancelled) {
          setCharacter(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError('加载汉字失败')
          console.error(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCharacter()

    return () => {
      cancelled = true
    }
  }, [char])

  return { character, loading, error }
}

// 批量获取汉字
export const useCharacters = (chars: string[]) => {
  const [characters, setCharacters] = useState<Record<string, Character>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCharacters = async () => {
      if (chars.length === 0) return

      setLoading(true)

      try {
        const charData: Record<string, Character> = {}
        await Promise.all(
          chars.map(async (char) => {
            const data = await getCharacterData(char)
            if (data) {
              charData[char] = data
            }
          })
        )
        setCharacters(charData)
      } catch (err) {
        console.error('批量加载汉字失败', err)
      } finally {
        setLoading(false)
      }
    }

    loadCharacters()
  }, [chars.join(',')])

  return { characters, loading }
}

// 收藏列表
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('favorites')
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [])

  const toggleFavorite = useCallback((char: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(char)
      const newFavorites = isFav
        ? prev.filter(c => c !== char)
        : [...prev, char]
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const isFavorite = useCallback((char: string) => {
    return favorites.includes(char)
  }, [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
