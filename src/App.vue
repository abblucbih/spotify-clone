<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { RouterLink, RouterView } from 'vue-router'
  import MenuItem from './components/MenuItem.vue';
  import MusicPlayer from './components/MusicPlayer.vue'
  import ChevronUp from 'vue-material-design-icons/ChevronUp.vue';
  import ChevronDown from 'vue-material-design-icons/ChevronDown.vue';
  import ChevronRight from 'vue-material-design-icons/ChevronRight.vue';
  import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue';
  import { useSongStore } from './stores/song'
  import { storeToRefs } from 'pinia';

  const clientId = "3224e5f16e8e4850b80203f539a24587"
  let code;
  const useSong = useSongStore()
  const { isPlaying, currentTrack } = storeToRefs(useSong)
  onMounted(async () => {
    code = getCodeFromURL();
    isPlaying.value = false 
    if (code) {
        const accessToken = await getAccessToken(clientId, code);
        useSong.accestoken = accessToken
        console.log("Acces token set"+ useSong.accestoken)
        const profile = await fetchProfile(accessToken);
        useSong.user = profile;
        const play = await fetchPlaylists(accessToken)
        useSong.playlists = play;

      
        
    }
})
  const isUserLoggedIn = ref(useSong.user && Object.keys(useSong.user).length > 0);


// Watch for changes in the user variable in the store
watch(() => useSong.user, (newUser) => {
  isUserLoggedIn.value = newUser && Object.keys(newUser).length > 0;
});

  let openMenu = ref(false)
  let openMenu2 = ref(false)
  function LogOut(){
    useSong.user = {}
    useSong.accestoken = ""
    console.log("Logged out user")
  }
  function getCodeFromURL() {
  // Get the current URL
  const url = new URL(window.location.href);
  // Extract the 'code' parameter from the URL query string
  return url.searchParams.get('code');
}

  async function redirectToAuthCodeFlow (clientId) {
    const verifier = generateCodeVerifier(128)
    const challenge = await generateCodeChallenge(verifier)

    localStorage.setItem("verifier", verifier)

    const params = new URLSearchParams()
    params.append("client_id", clientId)
    params.append("response_type", "code")
    params.append("redirect_uri", "http://localhost:5173/")
    params.append("scope", "user-top-read user-library-read user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public")
    params.append("code_challenge_method", "S256")
    params.append("code_challenge", challenge)

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
}

function generateCodeVerifier (length) {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

async function generateCodeChallenge (codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

async function getAccessToken (clientId, code){
    const verifier = localStorage.getItem("verifier")

    const params = new URLSearchParams()
    params.append("client_id", clientId)
    params.append("grant_type", "authorization_code")
    params.append("code", code)
    params.append("redirect_uri", "http://localhost:5173/")
    params.append("code_verifier", verifier)

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    })

    const { access_token } = await result.json()
    return access_token
}

async function fetchProfile (token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}
async function fetchPlaylists (token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists?limit=10&offset=0", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    })

    return await result.json()
}
function goBack() {
  window.history.back();
}
function goForward() {
  window.history.forward();
}

</script>

<template>
    <div>
        <div 
          id="TopNav"
          class="
            w-[calc(100%-240px)] 
            h-[60px] 
            fixed 
            right-0 
            z-20 
            bg-[#101010] 
            bg-opacity-80 
            flex 
            items-center 
            justify-between
          "
        >
            <div class="flex items-center ml-6">
               <button @click="goBack()" type="button" class="rounded-full bg-black p-[1px] cursor-pointer">
                    <ChevronLeft fillColor="#FFFFFF" :size="30" />
                </button>
                <button @click="goForward()" type="button" class="rounded-full bg-black p-[1px] hover:bg-[#] ml-4 cursor-pointer">
                    <ChevronRight fillColor="#FFFFFF" :size="30" />
                </button>
            </div>
                <div v-if="isUserLoggedIn">
                    <button @click="openMenu = !openMenu" :class="openMenu ? 'bg-[#282828]' : 'bg-black'"
                        class="bg-black hover:bg-[#282828] rounded-full p-0.5 mr-8 mt-0.5 cursor-pointer">
                        <div class="flex items-center">
                            <img v-if="useSong.user.images"
                            class="rounded-full" 
                            width="27"
                            :src= useSong.user.images[0].url 
                            >
                            <div class="text-white text-[14px] ml-1.5 font-semibold">{{ useSong.user.display_name }}</div>
                            <ChevronDown v-if="!openMenu" @click="openMenu = true" fillColor="#FFFFFF" :size="25" />
                            <ChevronUp v-else @click="openMenu = false" fillColor="#FFFFFF" :size="25" />
                        </div>
                    </button>

                    <span v-if="openMenu"
                        class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-sm top-[52px] right-[35px] p-1 cursor-pointer">
                        <ul class="text-gray-200 font-semibold text-[14px]">
                            <RouterLink to="/profile">
                            <li class="px-3 py-2.5 hover:bg-[#3E3D3D] border-b border-b-gray-600">Profile</li>
                            </RouterLink>
                            <li class="px-3 py-2.5 hover:bg-[#3E3D3D]"><button @click="LogOut()">Log out</button></li>
                        </ul>
                    </span>
                </div>
                <div v-else>
                    <button @click="openMenu2 = !openMenu2" :class="openMenu2 ? 'bg-[#282828]' : 'bg-black'"
                        class="bg-black hover:bg-[#282828] rounded-full p-0.5 mr-8 mt-0.5 cursor-pointer">
                        <div class="flex items-center">
                            <img 
                            class="rounded-full" 
                            width="27"
                            src="https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0="
                            >
                            <div class="text-white text-[14px] ml-1.5 font-semibold">Profile</div>
                            <ChevronDown v-if="!openMenu2" @click="openMenu2 = true" fillColor="#FFFFFF" :size="25" />
                            <ChevronUp v-else @click="openMenu2 = false" fillColor="#FFFFFF" :size="25" />
                        </div>
                    </button>

                    <span v-if="openMenu2"
                        class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-sm top-[52px] right-[35px] p-1 cursor-pointer">
                        <ul class="text-gray-200 font-semibold text-[14px]">
                            <li  class="px-3 py-2.5 hover:bg-[#3E3D3D] border-b border-b-gray-600"><button @click="redirectToAuthCodeFlow(clientId)">Log In</button></li>
                        </ul>
                    </span>
                </div>
        </div>


        <div id="SideNav" class="h-[100%] p-6 w-[240px] fixed z-50 bg-black">
            <RouterLink to="/">
              <img width="125" src="/images/icons/spotify-logo.png">
            </RouterLink>
            <div class="my-8"></div>
            <ul>
                <RouterLink to="/">
                    <MenuItem class="ml-[1px]" :iconSize="23" name="Home" iconString="home" pageUrl="/" />
                </RouterLink>
                <RouterLink to="/search">
                    <MenuItem class="ml-[1px]" :iconSize="24" name="Search" iconString="search" pageUrl="/search" />
                </RouterLink>
                <RouterLink v-if="isUserLoggedIn" to="/library">
                    <MenuItem class="ml-[2px]" :iconSize="23" name="Your Library" iconString="library" pageUrl="/library" />
                </RouterLink>
                <div class="py-3.5"></div>
                <MenuItem v-if="isUserLoggedIn" :iconSize="24" name="Create Playlist" iconString="playlist" pageUrl="/playlist" />
                <MenuItem v-if="isUserLoggedIn" @click="LogOut()" :iconSize="24" name="Log Out" iconString="playlist" pageUrl="/playlist" />
                <MenuItem v-if="isUserLoggedIn" class="-ml-[1px]" :iconSize="27" name="Liked Songs" iconString="liked" pageUrl="/liked" />
                 <MenuItem @click="redirectToAuthCodeFlow(clientId)" v-else class="-ml-[1px]" :iconSize="30" name="Log In" iconString="profile"  />
            </ul>
            <div class="border-b border-b-gray-700"></div>
            <div v-if="isUserLoggedIn" class="text-white flex items-center justify-center font-semibold"><p>Your Playlists</p></div>
            <div v-if="isUserLoggedIn && useSong.playlists && useSong.playlists.items && useSong.playlists.items.length > 0" class="playlists-container">
                <ul class="playlist-list">
                    <li v-for="playlist in useSong.playlists.items" :key="playlist.id" class="font-semibold flex items-center cursor-pointer text-[13px] mt-3 text-gray-300 hover:text-white">
                        <img style="width: 40px; height: 40px; margin-right: 15px;" :src="playlist.images[0].url" alt="Playlist Image">
                        {{ playlist.name }}
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div
        class="
            fixed
            right-0
            top-0
            w-[calc(100%-240px)]
            overflow-auto
            h-full
            bg-gradient-to-b
            from-[#1C1C1C]
            to-black
        "
    >
        <div class="mt-[70px]"></div>
        <RouterView />
        <div class="mb-[100px]"></div>
    </div>

    <!-- <MusicPlayer v-if="currentTrack"/> -->
</template>

<style scoped>
.playlists-container {
  max-height: calc(100% - 350px); /* Adjust the height as needed */
  overflow-y: auto;
}
.playlist-list {
  padding-right: 10px; /* Add padding to avoid scrollbar overlapping content */
}
</style>