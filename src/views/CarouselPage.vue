<template>
  <carousel show-arrows :gutter="15" :feather="15">
    <div v-for="i in 5" :key="i" style="border: 1px solid darkgrey" class="">
      {{ i }}
      <img :src="`https://picsum.photos/id/${1000 + i}/400/300`" />
    </div>
  </carousel>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Carousel from "vue-ssr-carousel";
import "vue-ssr-carousel/index.css";

export default defineComponent({
  components: {
    Carousel,
  },
});
</script>
