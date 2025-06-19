<template>
  <main class="page-booking">
    <BoxLoading :loading="loading" />
    <div class="equipment-panel">
      <el-select v-model="selectedEquipment" placeholder="Select Equipment" style="width: 400px">
        <el-option v-for="equipment in equipments" :key="equipment.equipment_id" :label="equipment.name"
          :value="equipment.equipment_id" :disabled="equipment.status < 1"/>
      </el-select>
    </div>
    <div class="schedule-panel">
      <WeekSchedule :equipmentId="selectedEquipment" :schedules />
    </div>
  </main>
</template>

<script setup>
import BoxLoading from '@/components/BoxLoading.vue';
import WeekSchedule from '@/components/WeekSchedule.vue';
import { ref, reactive, onMounted, inject } from 'vue';
import { api } from '@/utils';
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const loading = ref(true)

const selectedEquipment = ref(null)

const equipments = ref([])

const schedules = ref([{
  date: '2025-06-16',
  time_slots: [
    { start: '09:00', end: '10:00', user: 1 },
    { start: '10:00', end: '11:00', user: 2 }
  ]
},
{
  date: '2025-06-17',
  time_slots: [
    { start: '14:00', end: '16:00', user: 1 },
    { start: '10:00', end: '11:00', user: 2 }
  ]
},
{
  date: '2025-06-18',
  time_slots: [
    { start: '14:00', end: '16:00', user: 1 },
    { start: '10:00', end: '11:00', user: 2 }
  ]
},
{
  date: '2025-06-19',
  time_slots: []
},
{
  date: '2025-06-20',
  time_slots: []
},
{
  date: '2025-06-21',
  time_slots: []
},
{
  date: '2025-06-22',
  time_slots: []
}])

onMounted(async () => {
  let result = await api('GET', '/api/equipment/list').catch((err) => {
    return console.log(err)
  })
  equipments.value.push(
    {
      equipment_id: 1,
      name: "BSC",
      type: "Tissue Culture",
      status: 1
    },
    {
      equipment_id: 2,
      name: "PCR",
      type: "Molecular Biology",
      status: 0
    }
  )
  selectedEquipment.value = equipments.value[0].equipment_id
  console.log(equipments.value)
  loading.value = false
})
</script>

<style lang="scss" scoped>
.page-booking {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - $ea-header-height);
  background-color: ea-gray(5);
  

  .equipment-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    height: 80vh;
    padding: 50px 100px;
  }

  .schedule-panel {
    height: 80vh;
  }
}
</style>
