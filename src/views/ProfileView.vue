<template>
    <div>
        <h1>Hello {{name}}</h1>
    </div>
</template>

<script setup>
 import { useSongStore } from '../stores/song'
 
 const useSong = useSongStore()
 let name = useSong.user.display_name

</script>