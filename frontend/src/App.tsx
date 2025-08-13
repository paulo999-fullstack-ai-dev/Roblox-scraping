import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import Analytics from './pages/Analytics'
import Scraping from './pages/Scraping'
import GameDetail from './pages/GameDetail'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/scraping" element={<Scraping />} />
      </Routes>
    </Layout>
  )
}

export default App 