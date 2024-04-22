<template>
    <div class="container text-white">
        <h1 class="heading">Your Top 10 Tracks</h1>
        <div v-if="loadingTopTracks">Loading...</div>
        <ul v-else class="track-list">
            <li v-for="(track, index) in topTracks" :key="track.id" class="track-card">
                <div class="track-info">
                    <span class="track-index">{{ index + 1 }}</span>
                    <img :src="getTrackImage(track)" class="track-image" />
                    <div>
                        <div class="track-name">{{ track.name }}</div>
                        <div class="track-artists">
                            by {{ track.artists.map(artist => artist.name).join(', ') }}
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <h2 class="heading">Recommended Tracks</h2>
        <div v-if="loadingRecommendedTracks">Loading...</div>
        <ul v-else class="track-list">
            <li v-for="(track, index) in recommendedTracks" :key="track.id" class="track-card">
                <div class="track-info">
                    <span class="track-index">{{ index + 1 }}</span>
                    <img :src="getTrackImage(track)" class="track-image" />
                    <div>
                        <div class="track-name">{{ track.name }}</div>
                        <div class="track-artists">
                            by {{ track.artists.map(artist => artist.name).join(', ') }}
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSongStore } from '@/stores/song' // Import your Pinia store

const useSong = useSongStore()
let token = useSong.accestoken
const topTracks = ref([])
const recommendedTracks = ref([])
const loadingTopTracks = ref(true)
const loadingRecommendedTracks = ref(true)

onMounted(async () => {
    try {
        const topTracksResponse = await getTopTracks(token)
        topTracks.value = topTracksResponse
        loadingTopTracks.value = false

        const topTracksIds = topTracksResponse.map(track => track.id)
        const recommendedTracksResponse = await getRecommendations(token, topTracksIds.slice(0, 5))
        recommendedTracks.value = recommendedTracksResponse
        loadingRecommendedTracks.value = false
    } catch (error) {
        console.error('Error fetching data:', error)
    }
})

async function getTopTracks (token) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=8', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Access token may be invalid or expired.')
            } else {
                throw new Error(`Failed to fetch top tracks: ${response.status} - ${response.statusText}`)
            }
        }

        const data = await response.json()
        return data.items
    } catch (error) {
        console.error('Error fetching top tracks:', error)
        throw error
    }
}

async function getRecommendations (token, topTracksIds) {
    const response = await fetch(`https://api.spotify.com/v1/recommendations?limit=8&seed_tracks=${topTracksIds.join(',')}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch recommended tracks')
    }

    const data = await response.json()
    return data.tracks
}

function getTrackImage (track) {
    return track.album.images[0]?.url || ''
}
</script>

<style scoped>
.container {
    margin: 0px;
}

.heading {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
}

.track-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.track-card {
    background-color: green;
    color: white;
    width: calc(25% - 10px);
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
}

.track-info {
    display: flex;
    align-items: center;
}

.track-index {
    font-weight: bold;
    margin-right: 10px;
}

.track-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.track-name {
    font-size: 1rem;
    font-weight: bold;
}

.track-artists {
    font-size: 0.8rem;
    flex-grow: 1;
    margin-top: 5px;
}
</style>
