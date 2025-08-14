import axios from 'axios'

const api = axios.create({
  baseURL: 'https://roblox-scraping.onrender.com/api',
  timeout: 600000, // Increased to 10 minutes for full scraping operations
})

// Response types
export interface Game {
  id: number
  roblox_id: string
  name: string
  description?: string
  creator_id?: string
  creator_name?: string
  genre?: string
  roblox_created?: string
  roblox_updated?: string
  created_at: string
  updated_at: string
  visits: number
  favorites: number
  likes: number
  dislikes: number
  active_players: number
}

export interface GameDetail extends Game {
  metrics: GameMetric[]
}

export interface GameMetric {
  id: number
  game_id: number
  visits: number
  favorites: number
  likes: number
  dislikes: number
  active_players: number
  created_at: string
}

export interface ScrapingStatus {
  is_running: boolean
  last_run?: string
  next_run?: string
  total_games_scraped: number
  new_games_found: number
  scheduler_active?: boolean
}

export interface ScrapingLog {
  id: number
  status: string
  games_scraped: number
  new_games_found: number
  errors?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
}

export interface RetentionData {
  game_id: number
  game_name: string
  d1_retention?: number
  d7_retention?: number
  d30_retention?: number
  avg_playtime_minutes?: number
  total_visits: number
  unique_visitors: number
}

export interface GrowthData {
  game_id: number
  game_name: string
  growth_percent: number
  visits_growth: number
  favorites_growth: number
  likes_growth: number
  active_players_growth: number
  period_start: string
  period_end: string
}

export interface ResonanceData {
  game_id: number
  game_name: string
  overlap_percent: number
  resonance_score: number
  shared_groups: string[]
  genre_similarity: number
}

export interface AnalyticsSummary {
  total_games: number
  total_visits: number
  total_active_players: number
  avg_d1_retention: number
  avg_growth_rate: number
  last_updated: string
}

export interface GameAnalyticsTableData {
  game_id: number
  game_name: string
  genre?: string
  roblox_created?: string
  roblox_updated?: string
  created_at?: string
  updated_at?: string
  visits: number
  favorites: number
  likes: number
  dislikes: number
  active_players: number
  d1_retention: number
  d7_retention: number
  d30_retention: number
  growth_percent: number
}

// API functions
export const gamesApi = {
  getGames: async (params?: {
    skip?: number
    limit?: number
    search?: string
    sort_by?: string
    sort_order?: string
  }) => {
    const response = await api.get<Game[]>('/games', { params })
    return response.data
  },

  getGame: async (id: number) => {
    const response = await api.get<GameDetail>(`/games/${id}`)
    return response.data
  },

  getGameByRobloxId: async (robloxId: string) => {
    const response = await api.get<GameDetail>(`/games/roblox/${robloxId}`)
    return response.data
  },
}

export const scrapingApi = {
  startScraping: async () => {
    const response = await api.post('/scrape/start')
    return response.data
  },

  stopScraping: async () => {
    const response = await api.post('/scrape/stop')
    return response.data
  },

  getStatus: async () => {
    const response = await api.get<ScrapingStatus>('/scrape/status')
    return response.data
  },

  getLogs: async (limit?: number) => {
    const response = await api.get<ScrapingLog[]>('/scrape/logs', { params: { limit } })
    return response.data
  },

  getLog: async (id: number) => {
    const response = await api.get<ScrapingLog>(`/scrape/logs/${id}`)
    return response.data
  },
}

export const analyticsApi = {
  getRetention: async (params?: {
    days?: number
    min_visits?: number
  }) => {
    const response = await api.get<RetentionData[]>('/analytics/retention', { params })
    return response.data
  },

  getGrowth: async (params?: {
    window_days?: number
    min_growth_percent?: number
  }) => {
    const response = await api.get<GrowthData[]>('/analytics/growth', { params })
    return response.data
  },

  getResonance: async (gameId: number, limit?: number, min_overlap?: number) => {
    const response = await api.get<ResonanceData[]>(`/analytics/resonance/${gameId}`, { 
      params: { limit, min_overlap } 
    })
    return response.data
  },

  getGameAnalytics: async (gameId: number) => {
    const response = await api.get(`/analytics/game/${gameId}`)
    return response.data
  },

  getSummary: async () => {
    const response = await api.get<AnalyticsSummary>('/analytics/summary')
    return response.data
  },

  getTrending: async (limit?: number) => {
    const response = await api.get('/analytics/trending', { params: { limit } })
    return response.data
  },

  getGamesTable: async (params?: {
    skip?: number
    limit?: number
    sort_by?: string
    sort_order?: string
  }) => {
    const response = await api.get<GameAnalyticsTableData[]>('/analytics/games-table', { params })
    return response.data
  },
}

export default api 