<template>
    <div class="schedule-wrap">
        <BoxLoading :loading="loading" />
        <div class="schedule-header">
            <div class="schedule-title">Weekly Schedule</div>
            <div class="schedule-controls">
                <button class="btn-refresh" @click="refreshSchedule">Refresh</button>
            </div>
        </div>
        <div class="schedule-content">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th v-for="schedule in schedules" :key="schedule.date" class="date">
                            {{ new Date(schedule.date).toLocaleDateString('en-GB', {month: 'short', day: 'numeric'}) }}
                        </th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue';
import { api } from '@/utils';
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const loading = ref(false)

const prop = defineProps({
    schedules: {
        type: Object,
        default: () => ({})
    }
})

</script>

<style lang="scss" scoped>
.schedule-wrap {
    position: relative;
    width: 40vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: ea-gray(5);
}
</style>