import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import LibraryView from '../views/LibraryView.vue'
import ProfileView from '../views/ProfileView.vue'
import Generator from '../views/Generator.vue'
import GuessSong from '../views/GuessSong.vue'
import FindSong from '../views/FindSong.vue'
import Stats from '../views/Stats.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/search',
      component: SearchView
    },
    {
      path: '/library',
      component: LibraryView
    },
    {
      path: '/profile',
      component: ProfileView
    },
    {
      path: '/Generator',
      component: Generator
    },
    {
      path: '/GuessSong',
      component: GuessSong
    },
    {
      path: '/FindSong',
      component: FindSong
    },
    {
      path: '/Stats',
      component: Stats
    }
  ]
})

export default router
