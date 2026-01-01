<template>
  <div class="q-gutter-md">
    <SkeletonCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup lang="ts">
import SkeletonCard from './SkeletonCard.vue';

interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 5,
});
</script>

