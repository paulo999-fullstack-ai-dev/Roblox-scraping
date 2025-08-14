import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { gamesApi, Game } from '../lib/api'
import { Search, ExternalLink, TrendingUp, Users, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Games() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const limit = 10

  // Debug logging
  console.log('Games component render - search:', search, 'sortBy:', sortBy, 'sortOrder:', sortOrder)

  const { data: games, isLoading } = useQuery({
    queryKey: ['games', { search, sortBy, sortOrder, page, limit }],
    queryFn: () => {
      console.log('API call with params:', { search, sortBy, sortOrder, page, limit })
      return gamesApi.getGames({ 
        skip: page * limit, 
        limit, 
        search, 
        sort_by: sortBy, 
        sort_order: sortOrder 
      })
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    enabled: true, // Always enabled
  })

  console.log('API response - games count:', games?.length, 'isLoading:', isLoading)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700"
    >
      <span>{children}</span>
      {sortBy === field && (
        <span className="text-gray-400">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Games</h1>
        <p className="mt-2 text-gray-600">
          Browse and analyze all Roblox games in our database
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              key="search-input"
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => {
                console.log('Search input changed to:', e.target.value)
                setSearch(e.target.value)
              }}
              className="input pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="roblox_created">Roblox Created</option>
            <option value="roblox_updated">Roblox Updated</option>
            <option value="updated_at">DB Updated</option>
            <option value="name">Name</option>
            <option value="visits">Visits</option>
            <option value="favorites">Favorites</option>
            <option value="likes">Likes</option>
            <option value="dislikes">Dislikes</option>
            <option value="active_players">Active Players</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn btn-secondary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {/* <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
        Debug: Search="{search}", Sort="{sortBy}" {sortOrder}, Page={page}, Games: {games?.length || 0}
      </div> */}

      {/* Games Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <SortableHeader field="name">Game</SortableHeader>
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader field="creator_name">Creator</SortableHeader>
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader field="genre">Genre</SortableHeader>
                </th>
                {/* <th className="px-6 py-3 text-right">
                  <SortableHeader field="visits">
                    <div className="flex items-center justify-end space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Visits</span>
                    </div>
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-right">
                  <SortableHeader field="favorites">
                    <div className="flex items-center justify-end space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>Favorites</span>
                    </div>
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-right">
                  <SortableHeader field="likes">
                    <div className="flex items-center justify-end space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Likes</span>
                    </div>
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-right">
                  <SortableHeader field="dislikes">
                    <div className="flex items-center justify-end space-x-1">
                      <ThumbsDown className="h-4 w-4" />
                      <span>Dislikes</span>
                    </div>
                  </SortableHeader>
                </th> */}
                <th className="px-6 py-3 text-right">
                  <SortableHeader field="active_players">
                    <div className="flex items-center justify-end space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Active</span>
                    </div>
                  </SortableHeader>
                </th>
                {/* <th className="px-6 py-3 text-left">
                  <SortableHeader field="roblox_created">Roblox Created</SortableHeader>
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader field="roblox_updated">Roblox Updated</SortableHeader>
                </th> */}
                <th className="px-6 py-3 text-left">
                  <SortableHeader field="updated_at">DB Updated</SortableHeader>
                </th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games?.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {game.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {game.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {game.roblox_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {game.creator_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {game.genre && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {game.genre}
                      </span>
                    )}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {game.visits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {game.favorites.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {game.likes.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {game.dislikes?.toLocaleString() || '0'}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {game.active_players.toLocaleString()}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.roblox_created ? formatDistanceToNow(new Date(game.roblox_created), { addSuffix: true }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.roblox_updated ? formatDistanceToNow(new Date(game.roblox_updated), { addSuffix: true }) : 'N/A'}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(game.updated_at + 'Z'), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        to={`/games/${game.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                      <a
                        href={`https://www.roblox.com/games/${game.roblox_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!games || games.length < limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{page * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {page * limit + (games?.length || 0)}
                </span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!games || games.length < limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 