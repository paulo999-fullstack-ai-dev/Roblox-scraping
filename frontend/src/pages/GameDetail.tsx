import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gamesApi, analyticsApi } from '../lib/api'
import { 
  ExternalLink, 
  Users, 
  Heart, 
  ThumbsUp, 
  TrendingUp,
  Clock,
  Target,
  BarChart3
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const gameId = parseInt(id || '0')

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gamesApi.getGame(gameId),
    enabled: !!gameId,
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['game-analytics', gameId],
    queryFn: () => analyticsApi.getGameAnalytics(gameId),
    enabled: !!gameId,
  })

  const { data: resonance, isLoading: resonanceLoading } = useQuery({
    queryKey: ['game-resonance', gameId],
    queryFn: () => analyticsApi.getResonance(gameId, 10, 0.01),
    enabled: !!gameId,
  })

  if (gameLoading || analyticsLoading || resonanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h2>
        <p className="text-gray-600">The requested game could not be found.</p>
      </div>
    )
  }

  // Get latest metrics for display
  const latestMetric = game.metrics?.[0] || null

  // Prepare chart data for separate charts (oldest to newest)
  const visitsChartData = game.metrics?.slice(-30).reverse().map((metric) => ({
    date: new Date(metric.created_at + 'Z').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    visits: metric.visits,
  })) || []
  
  const engagementChartData = game.metrics?.slice(-30).reverse().map((metric) => ({
    date: new Date(metric.created_at + 'Z').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    favorites: metric.favorites,
    likes: metric.likes,
    dislikes: metric.dislikes,
  })) || []
  
  const playersChartData = game.metrics?.slice(-30).reverse().map((metric) => ({
    date: new Date(metric.created_at + 'Z').toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    active_players: metric.active_players,
  })) || []

  const resonanceChartData = resonance?.slice(0, 10).map((item) => ({
    name: item.game_name,
    overlap: item.overlap_percent,
    resonance: item.resonance_score,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
          <p className="mt-2 text-gray-600">
            Created by {game.creator_name || 'Unknown'} • ID: {game.roblox_id}
          </p>
        </div>
        <div className="flex space-x-2">
          <a
            href={`https://www.roblox.com/games/${game.roblox_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Roblox</span>
          </a>
        </div>
      </div>

      {/* Game Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Game Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
            <p className="text-gray-900">
              {game.description || 'No description available'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Genre:</span>
                <span className="font-medium">{game.genre || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Roblox Created:</span>
                <span className="font-medium">
                  {game.roblox_created ? formatDistanceToNow(new Date(game.roblox_created), { addSuffix: true }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Roblox Updated:</span>
                <span className="font-medium">
                  {game.roblox_updated ? formatDistanceToNow(new Date(game.roblox_updated), { addSuffix: true }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DB Created:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(game.created_at + 'Z'), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DB Updated:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(game.updated_at + 'Z'), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Dates */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Date Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Roblox Dates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created on Roblox:</span>
                <span className="font-medium">
                  {game.roblox_created ? new Date(game.roblox_created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated on Roblox:</span>
                <span className="font-medium">
                  {game.roblox_updated ? new Date(game.roblox_updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Database Dates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Added to Database:</span>
                <span className="font-medium">
                  {new Date(game.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Database Update:</span>
                <span className="font-medium">
                  {new Date(game.updated_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetric?.visits.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetric?.favorites.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <ThumbsUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetric?.likes.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestMetric?.active_players.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Analysis</h3>
            {analytics.retention ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                                     <div className="text-center">
                     <div className="text-2xl font-bold text-blue-600">
                       {analytics.retention.d1_retention?.toFixed(3) || 'N/A'}%
                     </div>
                     <div className="text-sm text-gray-600">D1 Retention</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">
                       {analytics.retention.d7_retention?.toFixed(3) || 'N/A'}%
                     </div>
                     <div className="text-sm text-gray-600">D7 Retention</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-purple-600">
                       {analytics.retention.d30_retention?.toFixed(3) || 'N/A'}%
                     </div>
                     <div className="text-sm text-gray-600">D30 Retention</div>
                   </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No retention data available</p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Analysis</h3>
            {analytics.growth ? (
              <div className="space-y-4">
                                 <div className="text-center">
                   <div className={`text-3xl font-bold ${analytics.growth.growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {analytics.growth.growth_percent >= 0 ? '+' : ''}{analytics.growth.growth_percent.toFixed(3)}%
                   </div>
                   <div className="text-sm text-gray-600">Overall Growth</div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="text-gray-600">Visits Growth:</span>
                     <span className={`ml-2 font-medium ${analytics.growth.visits_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {analytics.growth.visits_growth >= 0 ? '+' : ''}{analytics.growth.visits_growth.toFixed(3)}%
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-600">Favorites Growth:</span>
                     <span className={`ml-2 font-medium ${analytics.growth.favorites_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {analytics.growth.favorites_growth >= 0 ? '+' : ''}{analytics.growth.favorites_growth.toFixed(3)}%
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-600">Likes Growth:</span>
                     <span className={`ml-2 font-medium ${analytics.growth.likes_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {analytics.growth.likes_growth >= 0 ? '+' : ''}{analytics.growth.likes_growth.toFixed(3)}%
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-600">Active Players Growth:</span>
                     <span className={`ml-2 font-medium ${analytics.growth.active_players_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {analytics.growth.active_players_growth >= 0 ? '+' : ''}{analytics.growth.active_players_growth.toFixed(3)}%
                     </span>
                   </div>
                 </div>
              </div>
            ) : (
              <p className="text-gray-500">No growth data available</p>
            )}
          </div>
        </div>
      )}

      {/* Metrics Charts */}
      {visitsChartData.length > 0 && (
        <div className="space-y-6">
          {/* Visits Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visits Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={visitsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#3B82F6" name="Visits" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={engagementChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="favorites" stroke="#EF4444" name="Favorites" />
                <Line type="monotone" dataKey="likes" stroke="#10B981" name="Likes" />
                <Line type="monotone" dataKey="dislikes" stroke="#F59E0B" name="Dislikes" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Active Players Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Players Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={playersChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="active_players" stroke="#8B5CF6" name="Active Players" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Resonance Analysis */}
      {resonance && resonance.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Games (Resonance)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Top Similar Games</h4>
              <div className="space-y-3">
                {resonance.slice(0, 5).map((item) => (
                  <div key={item.game_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.game_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.shared_groups.length} shared groups
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {item.overlap_percent.toFixed(1)}% overlap
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.resonance_score.toFixed(1)} resonance
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Resonance Chart</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resonanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="resonance" fill="#3B82F6" name="Resonance Score" />
                  <Bar dataKey="overlap" fill="#10B981" name="Overlap %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Metrics */}
      {game.metrics && game.metrics.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Favorites
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dislikes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Players
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {game.metrics.slice(-10).map((metric) => (
                  <tr key={metric.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDistanceToNow(new Date(metric.created_at + 'Z'), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {metric.visits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {metric.favorites.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {metric.likes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {metric.dislikes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {metric.active_players.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 