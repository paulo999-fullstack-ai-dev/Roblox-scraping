import { useQuery } from '@tanstack/react-query'
import { analyticsApi, scrapingApi } from '../lib/api'
import { 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
  })

  const { data: scrapingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['scraping-status'],
    queryFn: () => scrapingApi.getStatus(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const { data: trendingGames } = useQuery({
    queryKey: ['trending-games'],
    queryFn: () => analyticsApi.getTrending(5),
  })

  if (summaryLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of Roblox games analytics and scraping status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gamepad2 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_games.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_visits.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
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
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg D1 Retention</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.avg_d1_retention?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scraping Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Scraping Status</h2>
          <div className="flex items-center space-x-2">
            {scrapingStatus?.is_running ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Running</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Idle</span>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Last Run</p>
            <p className="text-sm font-medium text-gray-900">
              {scrapingStatus?.last_run 
                ? formatDistanceToNow(new Date(scrapingStatus.last_run), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Games Scraped</p>
            <p className="text-sm font-medium text-gray-900">
              {scrapingStatus?.total_games_scraped || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">New Games Found</p>
            <p className="text-sm font-medium text-gray-900">
              {scrapingStatus?.new_games_found || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Total Games</p>
                <p className="text-xs text-gray-500">
                  {summary?.total_games || 0} games tracked
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Total Visits</p>
                <p className="text-xs text-gray-500">
                  {summary?.total_visits?.toLocaleString() || 0} visits
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Growing
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Active Players</p>
                <p className="text-xs text-gray-500">
                  {summary?.total_active_players?.toLocaleString() || 0} players
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">
                  Connected to Supabase
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Scraper</p>
                <p className="text-xs text-gray-500">
                  {scrapingStatus?.is_running ? 'Running' : 'Idle'}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  scrapingStatus?.is_running 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {scrapingStatus?.is_running ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Last Update</p>
                <p className="text-xs text-gray-500">
                  {summary?.last_updated 
                    ? formatDistanceToNow(new Date(summary.last_updated), { addSuffix: true })
                    : 'Never'
                  }
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Updated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 