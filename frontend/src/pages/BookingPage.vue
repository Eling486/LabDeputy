<template>
  <main class="page-booking">
    <BoxLoading :loading="loading" />
    <div class="operation-panel">
      <div class="panel-title">Equipment</div>
      <el-select v-model="selectedEquipment" placeholder="Select an Equipment" style="width: 400px">
        <el-option
          v-for="equipment in equipments"
          :key="equipment.equipment_id"
          :label="equipment.name"
          :value="equipment.equipment_id"
          :disabled="equipment.status < 1"
        />
      </el-select>
      <div class="booking-list-title panel-title">Book the following times</div>
      <div class="booking-list">
        <template v-for="dateItem in dateItems" :key="`${dateItem}-${bookingList}`">
          <div
            class="booking-date-wrap"
            v-if="
              bookingList.filter((item) => item.date == dateItem.format('YYYY-MM-DD')).length > 0
            "
          >
            <span class="booking-weekday">{{ dateItem.format('ddd') }}</span
            ><span class="booking-date">{{ dateItem.format('YYYY-MM-DD') }}</span>
          </div>
          <template v-for="(booking, index) in bookingList" :key="booking">
            <div class="booking-item" v-if="booking.date == dateItem.format('YYYY-MM-DD')" @mousemove="handleBookingMouseMove(index)" @mouseout="handleBookingMouseOut">
              <div class="time-wrap">
                <span class="time-start">{{ booking.start }}</span>
                <span class="time-to">−</span>
                <span class="time-end">{{ booking.end }}</span>
              </div>
              <div class="del-btn" @click="removeBooking(index)">
                <el-icon :size="16"><Close /></el-icon>
              </div>
            </div>
          </template>
        </template>
      </div>
      <div class="btn-wrap" v-if="bookingList.length > 0">
        <el-button type="primary" @click="submitBooking()">Book</el-button>
      </div>
    </div>
    <div class="schedule-panel">
      <WeekSchedule
        :equipmentId="selectedEquipment"
        :schedules
        :tempTimeSlots="bookingList"
        @add-booking="addBooking"
        :time-range="[0, 24]"
        :highlight="highlightBooking"
      />
    </div>
  </main>
</template>

<script setup>
import moment from 'moment'
import BoxLoading from '@/components/BoxLoading.vue'
import WeekSchedule from '@/components/WeekSchedule.vue'
import { ref, reactive, onMounted, inject } from 'vue'
import { Close } from '@element-plus/icons-vue'
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
const highlightBooking = ref(null)

const sortBooking = () => {
  bookingList.value.sort(
    (a, b) =>
      new Date(`${a.date} ${a.start}`).getTime() - new Date(`${b.date} ${b.start}`).getTime()
  )
}

const addBooking = (booking) => {
  bookingList.value.push({
    date: booking.date,
    start: booking.start,
    end: booking.end
  })
  sortBooking()
}

const removeBooking = (index) => {
  bookingList.value.splice(index, 1)
}

const submitBooking = () => {
  console.log(bookingList.value)
}

const handleBookingMouseMove = (index) => {
  highlightBooking.value = index
}

const handleBookingMouseOut = () => {
  highlightBooking.value = null
}

const dateItems = ref([])

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

  let mondayDate = moment(schedules.value.monday)
  for (let i = 0; i < 7; i++) {
    let date = mondayDate.clone().add(i, 'd')
    dateItems.value.push(date)
    // dates.value.push(date.format('YYYY-MM-DD'))
  }

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

    .booking-list {
      flex-grow: 1;
      width: 100%;
      padding-left: 10px;
      box-sizing: border-box;
      overflow: auto;

      .booking-date-wrap {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        height: 30px;
        color: $ea-text;

        .booking-weekday {
          font-size: 16px;
        }

        .booking-date {
          margin-left: 10px;
          font-size: 12px;
          color: ea-gray(40);
        }
      }

      .booking-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 35px;
        padding: 0 10px;
        border-radius: 5px;
        border: 1px $light-gray solid;
        background-color: $ea-white;
        box-sizing: border-box;

        &:hover {
          background-color: ea-gray(1);
        }

        .time-start {
          margin-right: 5px;
        }

        .time-end {
          margin-left: 5px;
        }

        .del-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 20px;
          width: 20px;
          border-radius: 3px;
          cursor: pointer;

          &:hover {
            background-color: ea-gray(50, 1);
          }
        }
      }
    }

    .btn-wrap {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
      margin-top: 10px;
      width: 100%;
    }

    .panel-title {
      margin: 10px 0 5px 0;
    }
  }

  .schedule-panel {
    height: 80vh;
  }
}
</style>
