import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../lib/api'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function Analytics() {
  const [retentionDays, setRetentionDays] = useState(7)
  const [growthWindow, setGrowthWindow] = useState(7)
  const [minGrowth, setMinGrowth] = useState(10)

  const { data: retentionData, isLoading: retentionLoading, error: retentionError } = useQuery({
    queryKey: ['retention', retentionDays],
    queryFn: () => analyticsApi.getRetention({ days: retentionDays, min_visits: 1000 }),
    retry: 1,
    staleTime: 600000, // 10 minutes
    cacheTime: 1800000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  const { data: growthData, isLoading: growthLoading, error: growthError } = useQuery({
    queryKey: ['growth', growthWindow, minGrowth],
    queryFn: () => analyticsApi.getGrowth({ window_days: growthWindow, min_growth_percent: minGrowth }),
    retry: 1,
    staleTime: 600000, // 10 minutes
    cacheTime: 1800000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  const { data: summary, error: summaryError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
    retry: 1,
    staleTime: 600000, // 10 minutes
    cacheTime: 1800000, // 30 minutes
    refetchOnWindowFocus: false,
  })

  // Show errors if any
  if (retentionError || growthError || summaryError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Analytics</div>
          <div className="text-gray-600 text-sm">
            {retentionError && `Retention data: ${retentionError.toString()}`}<br/>
            {growthError && `Growth data: ${growthError.toString()}`}<br/>
            {summaryError && `Summary data: ${summaryError.toString()}`}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (retentionLoading || growthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics data...</span>
      </div>
    )
  }

  // Check if we have any data first
  const hasData = (retentionData && retentionData.length > 0) || 
                  (growthData && growthData.length > 0) || 
                  summary

  // Show no data state
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Deep dive into game performance metrics and trends
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-semibold mb-2">No Analytics Data Available</div>
            <div className="text-gray-400 text-sm mb-4">
              Start scraping games to see analytics data
            </div>
            <button 
              onClick={() => window.location.href = '/scraping'} 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Go to Scraping
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const retentionChartData = retentionData?.slice(0, 10).map((game, index) => ({
    name: game.game_name,
    d1: game.d1_retention || 0,
    d7: game.d7_retention || 0,
    d30: game.d30_retention || 0,
  })) || []

  const growthChartData = growthData?.slice(0, 10).map((game, index) => ({
    name: game.game_name,
    growth: game.growth_percent || 0,
    visits: game.visits_growth || 0,
    favorites: game.favorites_growth || 0,
  })) || []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Deep dive into game performance metrics and trends
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_games?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.avg_growth_rate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg D7 Retention</p>
              <p className="text-2xl font-bold text-gray-900">
                {retentionData?.[0]?.d7_retention?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Active Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_active_players?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Retention Analysis */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Retention Analysis</h2>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="input w-32"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Top Retention Games</h3>
            <div className="space-y-3">
              {retentionData?.slice(0, 5).map((game) => (
                <div key={game.game_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{game.game_name}</p>
                    <p className="text-sm text-gray-600">{game.total_visits?.toLocaleString() || 0} visits</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">D7: {game.d7_retention?.toFixed(1) || 'N/A'}%</p>
                    <p className="text-sm text-gray-600">D1: {game.d1_retention?.toFixed(1) || 'N/A'}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Retention Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={retentionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="d7" fill="#3B82F6" name="D7 Retention" />
                <Bar dataKey="d1" fill="#10B981" name="D1 Retention" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Growth Analysis */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Growth Analysis</h2>
          <div className="flex space-x-4">
            <select
              value={growthWindow}
              onChange={(e) => setGrowthWindow(Number(e.target.value))}
              className="input w-32"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
            <select
              value={minGrowth}
              onChange={(e) => setMinGrowth(Number(e.target.value))}
              className="input w-32"
            >
              <option value={5}>5%+ growth</option>
              <option value={10}>10%+ growth</option>
              <option value={20}>20%+ growth</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Top Growing Games</h3>
            <div className="space-y-3">
              {growthData?.slice(0, 5).map((game) => (
                <div key={game.game_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{game.game_name}</p>
                    <p className="text-sm text-gray-600">
                      {game.visits_growth?.toFixed(1) || '0'}% visits growth
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{game.growth_percent?.toFixed(1) || '0'}%</p>
                    <p className="text-sm text-gray-600">
                      {game.favorites_growth?.toFixed(1) || '0'}% favorites
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Growth Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="growth" fill="#10B981" name="Overall Growth" />
                <Bar dataKey="visits" fill="#3B82F6" name="Visits Growth" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 