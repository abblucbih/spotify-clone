<template>
    <div>
        <div class="flex justify-center items-aligned text-white">
            <h1 class="text-4xl font-bold">Generate a playlist of your liking</h1>
        </div>

        <!-- Topic buttons -->
        <div class="flex justify-center mt-8 flex-wrap">
            <!-- Loop through the array of topics to generate buttons -->
            <button v-for="topic in topics" :key="topic" @click="generatePlaylist(token, userId, topic)"
                class="topic-button">{{ topic }}</button>
        </div>

        <!-- Display loading indicator or playlist content -->
        <div v-if="loading" class="flex justify-center text-white items-center mt-4">
            <span>Loading...</span>
        </div>
        <div v-else-if="playlist" class="mt-4">
            <!-- Display generated playlist here -->
        </div>

        <!-- Message indicating successful playlist generation -->
        <div v-if="showSuccessMessage" class="success-message">
            Playlist successfully generated!
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useSongStore } from '../stores/song'

const useSong = useSongStore()
let token = useSong.accestoken
let userId = useSong.user.id
const topTracks = ref([])
const recommendedTracks = ref([])
const loading = ref(false) // Loading indicator
const playlist = ref(null) // Store generated playlist

// Array of music topics
const topics = ['Personal For You','Rap', 'R&B','Epa Dunk','Birthday', 'Romantic', 'Party', 'Rock', 'Pop', 'Hip Hop', 'Country', 'EDM', 'Reggae', 'Indie', 'Metal']

// Control variable for showing success message
const showSuccessMessage = ref(false)
async function addTracksToPlaylist (token, playlistId, trackURIs) {
    try {
        console.log("Trying to add tracks to playlist")

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: trackURIs,
                position: 0 // You can adjust the position if you want to add tracks at a specific position in the playlist
            })
        })

        if (!response.ok) {
            // Handle non-successful response
            const errorMessage = await response.text()
            throw new Error(`Failed to add tracks to playlist: ${errorMessage}`)
        }

        console.log("Tracks added to playlist successfully")
        return true
    } catch (error) {
        // Handle errors
        console.error('Error adding tracks to playlist:', error)
        throw error
    }
}

async function fetchTracks (token, topic, playlistId) {
    try {
        console.log("Trying to fetch tracks")
        const response = await fetch(`https://api.spotify.com/v1/search?q=${topic}&type=track&market=SE&limit=50&offset=0`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            // Handle non-successful response
            const errorMessage = await response.text()
            throw new Error(`Failed to fetch tracks: ${errorMessage}`)
        }

        const result = await response.json() // Parse JSON response
        console.log("Tracks fetched successfully", result)

        // Extract URIs of tracks and add to trackURIs array
        const trackURIs = result.tracks.items.map(track => track.uri)

        console.log("Track URIs:", trackURIs)
        const success = addTracksToPlaylist(token, playlistId, trackURIs)
        if(success){
            console.log("Playlist generated, tracks fetched and tracks added")
        }else{
            console.log("Womp Womp")
        }
        return trackURIs
    } catch (error) {
        // Handle errors
        console.error('Error fetching tracks:', error)
        throw error
    }
}



async function generatePlaylist (token, userId, playlistName) {
    try {
        loading.value = true // Show loading indicator

        const playlistData = {
            name: playlistName,
            description: `New ${playlistName} playlist`,
            public: false
        }

        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlistData)
        })

        if (!response.ok) {
            // Handle non-successful response
            const errorMessage = await response.text()
            throw new Error(`Failed to create playlist: ${errorMessage}`)
        }

        // If response is successful, return the playlist data
        playlist.value = await response.json()
        console.log("Playlist id"+playlist._rawValue.id)

        if(playlistName == "Personal For You"){

            console.log("Making a playlist personal for")

            const topTracksResponse = await getTopTracks(token)
            console.log("Top tracks;"+ topTracksResponse)
            const topTracksIds = topTracksResponse.map(track => track.id)
            const recommendedTracksResponse = await getRecommendations(token, topTracksIds.slice(0, 5))
            console.log(recommendedTracksResponse)
            const trackURIs = recommendedTracksResponse.map(track => track.uri)

            console.log("Track URIs:", trackURIs);
            const success = addTracksToPlaylist(token, playlist._rawValue.id, trackURIs)

            
        }else{
        const result =  fetchTracks(token,playlistName, playlist._rawValue.id)
        }
        // Show success message
        showSuccessMessage.value = true
        // Hide success message after 5 seconds
        setTimeout(() => {
            showSuccessMessage.value = false
        }, 5000)

    } catch (error) {
        // Handle errors
        console.error('Error generating playlist:', error)
    } finally {
        loading.value = false // Hide loading indicator
    }
}
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
    const response = await fetch(`https://api.spotify.com/v1/recommendations?limit=20&seed_tracks=${topTracksIds.join(',')}`, {
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
</script>

<style scoped>
/* Styles for topic buttons */
.topic-button {
    margin: 10px;
    padding: 12px 24px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.topic-button:hover {
    background-color: #45a049;
}

/* Style for success message */
.success-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #4CAF50;
    color: white;
    padding: 20px;
    border-radius: 8px;
    opacity: 1;
    transition: opacity 1s ease-in-out;
}

.success-message.fade-out {
    opacity: 0;
}
</style>
