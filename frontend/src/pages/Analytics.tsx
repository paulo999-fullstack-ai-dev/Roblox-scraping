import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi, GameAnalyticsTableData, DailyGrowthChartData } from '../lib/api'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  BarChart3,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  Cell,
  Legend
} from 'recharts'

export default function Analytics() {
  const [retentionDays, setRetentionDays] = useState(7)
  const [growthWindow, setGrowthWindow] = useState(7)
  const [minGrowth, setMinGrowth] = useState(10)
  
  // Games table state
  const [tableSortBy, setTableSortBy] = useState('visits')
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tablePage, setTablePage] = useState(0)
  const tableLimit = 20

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

  // Games table data
  const { data: gamesTableData, isLoading: tableLoading, error: tableError } = useQuery({
    queryKey: ['games-table', tableSortBy, tableSortOrder, tablePage],
    queryFn: () => analyticsApi.getGamesTable({ 
      skip: tablePage * tableLimit, 
      limit: tableLimit, 
      sort_by: tableSortBy, 
      sort_order: tableSortOrder 
    }),
    retry: 1,
    staleTime: 300000, // 5 minutes
    cacheTime: 900000, // 15 minutes
    refetchOnWindowFocus: false,
  })

  // Daily growth chart data for current displayed games
  const { data: dailyGrowthData, isLoading: dailyGrowthLoading } = useQuery({
    queryKey: ['daily-growth-chart', gamesTableData?.map(g => g.game_id)],
    queryFn: () => {
      if (gamesTableData && gamesTableData.length > 0) {
        const gameIds = gamesTableData.map(g => g.game_id)
        return analyticsApi.getDailyGrowthChart(gameIds)
      }
      return []
    },
    enabled: !!gamesTableData && gamesTableData.length > 0,
    retry: 1,
    staleTime: 300000, // 5 minutes
    cacheTime: 900000, // 15 minutes
    refetchOnWindowFocus: false,
  })

  const handleTableSort = (field: string) => {
    if (tableSortBy === field) {
      setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setTableSortBy(field)
      setTableSortOrder('desc')
    }
    setTablePage(0) // Reset to first page when sorting changes
  }

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleTableSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700"
    >
      <span>{children}</span>
      {tableSortBy === field && (
        <span className="text-gray-400">
          {tableSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </span>
      )}
    </button>
  )

  // Show errors if any
  if (retentionError || growthError || summaryError || tableError) {
    const errorMessages = []
    if (retentionError) errorMessages.push(`Retention data: ${retentionError}`)
    if (growthError) errorMessages.push(`Growth data: ${growthError}`)
    if (summaryError) errorMessages.push(`Summary data: ${summaryError}`)
    if (tableError) errorMessages.push(`Table data: ${tableError}`)
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Analytics</div>
          <div className="text-gray-600 text-sm">
            {errorMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
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

  if (retentionLoading || growthLoading || tableLoading) {
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
      
      {/* Comprehensive Games Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Games Analytics</h2>
          <div className="flex space-x-4">
            <select
              value={tableSortBy}
              onChange={(e) => setTableSortBy(e.target.value)}
              className="input w-40"
            >
              <option value="visits">Sort by Visits</option>
              <option value="favorites">Sort by Favorites</option>
              <option value="likes">Sort by Likes</option>
              <option value="dislikes">Sort by Dislikes</option>
              <option value="active_players">Sort by Active Players</option>
              <option value="d1_retention">Sort by D1 Retention</option>
              <option value="d7_retention">Sort by D7 Retention</option>
              <option value="growth_percent">Sort by Growth</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              onClick={() => setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary"
            >
              {tableSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {tableLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading games data...</span>
          </div>
        ) : gamesTableData && gamesTableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Favorites
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dislikes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Players
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Growth %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D1 Retention
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D7 Retention
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gamesTableData.map((game) => (
                  <tr key={game.game_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{game.game_name}</div>
                      <div className="text-sm text-gray-500">{game.genre || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.visits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.favorites.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.likes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.dislikes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.active_players.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${(game.growth_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(game.growth_percent || 0) >= 0 ? '+' : ''}{Number(game.growth_percent || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.d1_retention.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.d7_retention.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg font-semibold mb-2">No Games Data Available</div>
            <div className="text-gray-400 text-sm">
              Start scraping games to see analytics data
            </div>
          </div>
        )}

        {/* Pagination */}
        {gamesTableData && gamesTableData.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {tablePage * tableLimit + 1} to {tablePage * tableLimit + gamesTableData.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                disabled={tablePage === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setTablePage(tablePage + 1)}
                disabled={gamesTableData.length < tableLimit}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Growth Chart for Current Games */}
      {gamesTableData && gamesTableData.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Daily Active Player Growth</h2>
            <div className="text-sm text-gray-600">
              Showing growth for {gamesTableData.length} displayed games
            </div>
          </div>
          
          {dailyGrowthLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading growth chart data...</span>
            </div>
          ) : dailyGrowthData && dailyGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  type="category"
                  allowDuplicatedCategory={false}
                  scale="point"
                />
                <YAxis 
                  label={{ value: 'Daily Growth (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [`${value}%`, name]}
                />
                <Legend />
                {Array.from(new Set(dailyGrowthData.map(item => item.series_name))).map((seriesName, index) => {
                  const colors = [
                    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
                    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
                    '#14B8A6', '#F43F5E', '#EAB308', '#A855F7', '#0EA5E9',
                    '#22C55E', '#F97316', '#8B5CF6', '#06B6D4', '#84CC16'
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <Line
                      key={seriesName}
                      type="monotone"
                      dataKey="growth_percent"
                      name={seriesName}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: '#fff' }}
                      connectNulls={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg font-semibold mb-2">No Growth Data Available</div>
              <div className="text-gray-400 text-sm">
                Need at least 2 days of data to calculate growth
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 