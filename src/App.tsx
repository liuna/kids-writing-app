import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Search } from './pages/Search'
import { CharacterDetail } from './pages/CharacterDetail'
import { TextbookList } from './pages/TextbookList'
import { LessonList } from './pages/LessonList'
import { CharacterList } from './pages/CharacterList'
import { Favorites } from './pages/Favorites'

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/character/:char" element={<CharacterDetail />} />
        <Route path="/textbooks" element={<TextbookList />} />
        <Route path="/textbook/:id" element={<LessonList />} />
        <Route path="/lesson/:id" element={<CharacterList />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </div>
  )
}

export default App
