<script setup>
    import HomeCard from '../components/HomeCard.vue';
</script>

<template >
    <div class="flex items-center justify-center " style="height:77vh;">
    <div class="p-4 ">
     <div class="flex items-center">
            <HomeCard toPage="/Generator" image="/images/generation.png" title="Generate Playlist" subTitle="Let AI build your playlists" />
            <HomeCard toPage="/GuessSong" image="/images/questionsmark.png" title="Guess The Song" subTitle="Guess what song" />
            <HomeCard toPage="/FindSong" image="/images/finding.png" title="Match Lyrics to Song" subTitle="Find a song by lyrics" />
            <HomeCard toPage="/Stats" image="/images/stats.jpg" title="Your Top Tracks" subTitle="See your most listened to tracks" />
        </div>
    </div>
</div>
    <!-- <div class="p-3">
        <div class="flex items-center">
            <HomeCard image="https://picsum.photos/id/120/300/300" title="Title is here" subTitle="Subtitle is here" />
            <HomeCard image="https://picsum.photos/id/110/300/300" title="Title is here" subTitle="Subtitle is here" />
            <HomeCard class="md:block hidden" image="https://picsum.photos/id/221/300/300" title="Title is here" subTitle="Subtitle is here" />
            <HomeCard class="lg:block hidden" image="https://picsum.photos/id/232/300/300" title="Title is here" subTitle="Subtitle is here" />
            <HomeCard class="xl:block hidden" image="https://picsum.photos/id/187/300/300" title="Title is here" subTitle="Subtitle is here" />
        </div>
    </div> -->
</template>
