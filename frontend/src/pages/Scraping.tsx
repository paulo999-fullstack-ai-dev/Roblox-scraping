import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scrapingApi } from '../lib/api'
import { 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  Timer
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Scraping() {
  const [isStarting, setIsStarting] = useState(false)
  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['scraping-status'],
    queryFn: () => scrapingApi.getStatus(),
    refetchInterval: 10000, // Default refresh interval
  })

  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['scraping-logs'],
    queryFn: () => scrapingApi.getLogs(20),
    refetchInterval: status?.is_running ? 3000 : 15000, // Refresh logs more frequently when running
  })

  // Update refetch interval based on status
  const statusRefetchInterval = status?.is_running ? 2000 : 10000

  const startScrapingMutation = useMutation({
    mutationFn: scrapingApi.startScraping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-status'] })
      queryClient.invalidateQueries({ queryKey: ['scraping-logs'] })
      // Start more frequent polling
      refetchStatus()
      refetchLogs()
    },
    onError: (error) => {
      console.error('Scraping start error:', error)
      // Don't show error to user as scraping might still be running in background
    },
  })

  const stopScrapingMutation = useMutation({
    mutationFn: scrapingApi.stopScraping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-status'] })
      queryClient.invalidateQueries({ queryKey: ['scraping-logs'] })
      refetchStatus()
      refetchLogs()
    },
  })

  const handleStartScraping = async () => {
    setIsStarting(true)
    try {
      await startScrapingMutation.mutateAsync()
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopScraping = async () => {
    try {
      await stopScrapingMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to stop scraping:', error)
    }
  }

  const handleRefresh = () => {
    refetchStatus()
    refetchLogs()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (statusLoading || logsLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Scraping Control</h1>
        <p className="mt-2 text-gray-600">
          Monitor and control the automated Roblox games scraping process
        </p>
      </div>

      {/* Status Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
          <div className="flex items-center space-x-2">
            {status?.is_running ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Running</span>
              </>
            ) : status?.next_run ? (
              <>
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Scheduled</span>
              </>
            ) : (
              <>
                <div className="rounded-full h-4 w-4 bg-gray-300"></div>
                <span className="text-sm text-gray-600">Idle</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {status?.total_games_scraped || 0}
            </div>
            <div className="text-sm text-gray-600">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {status?.new_games_found || 0}
            </div>
            <div className="text-sm text-gray-600">New Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {status?.last_run ? formatDistanceToNow(new Date(status.last_run), { addSuffix: true }) : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last Run</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {status?.next_run ? formatDistanceToNow(new Date(status.next_run), { addSuffix: true }) : 'Not scheduled'}
            </div>
            <div className="text-sm text-gray-600">Next Run</div>
          </div>
        </div>

        {/* Scheduler Status */}
        {status?.scheduler_active && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Hourly Scheduler Active</span>
            </div>
            <div className="text-sm text-green-700">
              <p>• Next run: <strong>{status.next_run ? new Date(status.next_run).toLocaleString() : 'N/A'}</strong></p>
              <p>• Runs every hour automatically</p>
              <p>• Click "Start Scraping" again to reschedule</p>
            </div>
          </div>
        )}

        {/* Scheduling Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">How Scheduling Works</span>
          </div>
          <div className="text-sm text-blue-700">
            <p>• <strong>First click:</strong> Starts scraping immediately and schedules hourly runs</p>
            <p>• <strong>Subsequent clicks:</strong> Cancels current schedule and starts new hourly schedule</p>
            <p>• <strong>Stop button:</strong> Stops current job and cancels all scheduled runs</p>
            <p>• <strong>Automatic:</strong> Runs every hour without manual intervention</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleStartScraping}
            disabled={isStarting || status?.is_running}
            className={`btn btn-primary flex items-center space-x-2 ${
              isStarting || status?.is_running 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-primary-700'
            }`}
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : status?.is_running ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{status?.scheduler_active ? 'Reschedule & Start' : 'Start Scraping'}</span>
              </>
            )}
          </button>

          {status?.is_running && (
            <button
              onClick={handleStopScraping}
              disabled={stopScrapingMutation.isPending}
              className="btn btn-danger flex items-center space-x-2"
            >
              {stopScrapingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Stopping...</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop Scraping</span>
                </>
              )}
            </button>
          )}
          
        </div>
      </div>

      {/* Logs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Scraping Logs</h2>
          <button
            onClick={handleRefresh}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Games Scraped:</span>
                    <span className="ml-2 font-medium">{log.games_scraped}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">New Games:</span>
                    <span className="ml-2 font-medium">{log.new_games_found}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {log.duration_seconds ? `${Math.round(log.duration_seconds)}s` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-2 font-medium">
                      {new Date(log.started_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {log.errors && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm text-red-800">
                      <strong>Error:</strong> {log.errors}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No scraping logs found</p>
              <p className="text-sm">Start a scraping job to see logs here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 