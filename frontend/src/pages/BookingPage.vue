<template>
  <main class="page-booking">
    <BoxLoading :loading="loading" />
    <div class="operation-panel">
      <el-select v-model="selectedEquipment" placeholder="Select Equipment" style="width: 400px">
        <el-option
          v-for="equipment in equipments"
          :key="equipment.equipment_id"
          :label="equipment.name"
          :value="equipment.equipment_id"
          :disabled="equipment.status < 1"
        />
      </el-select>
      <div class="booking-list-wrap">
        <div class="booking-item" v-for="booking in bookingList" :key="booking">
          {{ booking.date }}: {{ booking.start }}-{{ booking.end }}
        </div>
      </div>
    </div>
    <div class="schedule-panel">
      <WeekSchedule
        :equipmentId="selectedEquipment"
        :schedules
        :tempTimeSlots="bookingList"
        @add-booking="addBooking"
        :time-range="[0, 24]"
      />
    </div>
  </main>
</template>

<script setup>
import BoxLoading from '@/components/BoxLoading.vue'
import WeekSchedule from '@/components/WeekSchedule.vue'
import { ref, reactive, onMounted, inject } from 'vue'
import { api } from '@/utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const loading = ref(true)

const selectedEquipment = ref(null)

const equipments = ref([])

const schedules = ref({
  monday: '2025-06-16',
  time_slots: [
    {
      date: '2025-06-16',
      start: '09:00',
      end: '10:00',
      user: {
        uid: 1,
        realname: 'XXX1'
      }
    },
    {
      date: '2025-06-16',
      start: '10:00',
      end: '11:00',
      user: {
        uid: 2,
        realname: 'XXX2'
      }
    },
    {
      date: '2025-06-17',
      start: '14:00',
      end: '16:00',
      user: {
        uid: 1,
        realname: 'XXX1'
      }
    },
    {
      date: '2025-06-17',
      start: '10:00',
      end: '11:00',
      user: {
        uid: 2,
        realname: 'XXX2'
      }
    },
    {
      date: '2025-06-17',
      start: '17:00',
      end: '17:30',
      user: {
        uid: 1,
        realname: 'XXX1'
      }
    },
    {
      date: '2025-06-18',
      start: '14:00',
      end: '16:00',
      user: {
        uid: 3,
        realname: 'XXX3'
      }
    },
    {
      date: '2025-06-18',
      start: '10:00',
      end: '11:00',
      user: {
        uid: 2,
        realname: 'XXX2'
      }
    }
  ]
})

const bookingList = ref([])

const addBooking = (booking) => {
  bookingList.value.push({
    date: booking.date,
    start: booking.start,
    end: booking.end
  })
}

onMounted(async () => {
  let result = await api('GET', '/api/equipment/list').catch((err) => {
    return console.log(err)
  })
  equipments.value.push(
    {
      equipment_id: 1,
      name: 'BSC',
      type: 'Tissue Culture',
      status: 1
    },
    {
      equipment_id: 2,
      name: 'PCR',
      type: 'Molecular Biology',
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

  .operation-panel {
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
