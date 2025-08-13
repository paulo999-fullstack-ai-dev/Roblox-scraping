import requests
import time
import logging
from typing import List, Dict, Optional
from config import settings

logger = logging.getLogger(__name__)

class RobloxScraper:
    def __init__(self):
        self.base_url = "https://www.roblox.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.roblox.com/',
        })
        # Set longer timeout for VPN environments
        self.session.timeout = 30

    def get_trending_games(self) -> List[Dict]:
        """Get top trending games using the Roblox API"""
        try:
            logger.info("Fetching top trending games from Roblox...")

            # Use the trending games API
            trending_url = "https://apis.roblox.com/explore-api/v1/get-sort-content"
            params = {
                'sessionId': '71bacc17-bda5-4e3c-aa85-6aaeb527a190',
                'sortId': 'top-trending',
                'country': 'all',
                'device': 'all',
                'cpuCores': '12',
                'maxResolution': '1920x1080',
                'maxMemory': '8192',
                'networkType': '3g'
            }

            response = self.session.get(trending_url, params=params)
            logger.info(f"Trending API Response Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                games = []

                for game_data in data.get('games', []):
                    game = {
                        'id': str(game_data.get('rootPlaceId')),
                        'universe_id': str(game_data.get('universeId')),
                        'name': game_data.get('name', 'Unknown'),
                        'player_count': game_data.get('playerCount', 0),
                        'likes': game_data.get('totalUpVotes', 0),  # Map totalUpVotes to likes
                        'dislikes': game_data.get('totalDownVotes', 0)  # Map totalDownVotes to dislikes
                    }
                    games.append(game)

                logger.info(f"Found {len(games)} trending games via API")

                # Get detailed information for each game using universe IDs
                if games:
                    games = self._enrich_games_with_details(games)

                return games
            logger.warning("Could not fetch trending games")
            return []

        except Exception as e:
            logger.error(f"Error getting trending games: {str(e)}")
            return []

    def _enrich_games_with_details(self, games: List[Dict]) -> List[Dict]:
        """Enrich games with detailed information using universe IDs"""
        try:
            logger.info("Enriching games with detailed information...")

            # Extract universe IDs
            universe_ids = [game['universe_id'] for game in games if game.get('universe_id')]

            if not universe_ids:
                return games

            # Process in chunks of 49 (API limit is 50, using 49 to be safe)
            chunk_size = 49

            for i in range(0, len(universe_ids), chunk_size):
                chunk = universe_ids[i:i + chunk_size]
                chunk_str = ','.join(chunk)

                # Get detailed game information
                details_url = f"https://games.roblox.com/v1/games?universeIds={chunk_str}"
                response = self.session.get(details_url)

                if response.status_code == 200:
                    data = response.json()

                    # Create a mapping of universe_id to game details
                    details_map = {}
                    for game_detail in data.get('data', []):
                        details_map[str(game_detail.get('id'))] = game_detail

                    # Update games with detailed information
                    for game in games:
                        if game.get('universe_id') in details_map:
                            detail = details_map[game['universe_id']]

                            # Update game with detailed information
                            game.update({
                                'description': detail.get('description', ''),
                                'creator': {
                                    'id': str(detail.get('creator', {}).get('id', '')),
                                    'name': detail.get('creator', {}).get('name', 'Unknown'),
                                    'type': detail.get('creator', {}).get('type', ''),
                                    'has_verified_badge': detail.get('creator', {}).get('hasVerifiedBadge', False)
                                },
                                'genre': detail.get('genre', 'Unknown'),
                                'visits': detail.get('visits', 0),
                                'favorited_count': detail.get('favoritedCount', 0),
                                'playing': detail.get('playing', 0),
                                'created': detail.get('created', ''),
                                'updated': detail.get('updated', '')
                                # Note: likes and dislikes are preserved from the original trending data
                            })

                # Rate limiting between chunks
                if i + chunk_size < len(universe_ids):
                    time.sleep(settings.REQUEST_DELAY_SECONDS)

            logger.info(f"Enriched {len(games)} games with detailed information")
            return games

        except Exception as e:
            logger.error(f"Error enriching games with details: {str(e)}")
            return games