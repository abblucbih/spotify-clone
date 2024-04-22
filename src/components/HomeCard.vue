<script setup>
import { toRefs } from 'vue'
import { RouterLink } from 'vue-router';

const props = defineProps({
    image: String,
    title: String,
    subTitle: String,
    toPage: String
})
const { image, title, subTitle, toPage } = toRefs(props)
</script>

<template>
    <RouterLink :to="toPage">
        <div class="bg-[#111111] p-4 rounded-md m-2 hover:bg-[#252525] cursor-pointer">
            <img class="rounded-md" :src="image" alt="">
            <div class="text-white pt-4 font-semibold text-[17px]">{{ title }}</div>
            <div class="text-gray-400 pt-1 pb-3 text-[14px]">{{ subTitle }}</div>
        </div>
    </RouterLink>
</template>

<style scoped>
/* Style to set fixed width and height for images */
img {
  width: 200px; /* Adjust the width as needed */
  height: 180px; /* Adjust the height as needed */
}
</style>