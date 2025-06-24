<template>
  <main class="page-booking">
    <BoxLoading :loading="loading" />
    <div class="operation-panel">
      <div class="panel-title">{{ langs[settings.lang].general.equipment }}</div>
      <el-select
        v-model="selectedEquipmentId"
        :placeholder="langs[settings.lang].booking.epuipment_placeholder"
        style="width: 100%"
      >
        <el-option
          v-for="equipment in equipments"
          :key="equipment.equipment_id"
          :label="equipment.name"
          :value="equipment.equipment_id"
          :disabled="equipment.status < 1"
        />
      </el-select>
      <div class="booking-list-title panel-title">
        {{
          bookingList.length > 0
            ? langs[settings.lang].booking.booking_list
            : langs[settings.lang].booking.booking_tips
        }}
      </div>
      <el-scrollbar class="booking-list">
        <template v-for="(booking, index) in bookingList" :key="booking">
          <div
            class="booking-date-wrap"
            v-if="index == 0 || booking.date !== bookingList[index - 1].date"
          >
            <span class="booking-weekday">{{ moment(booking.date).format('ddd') }}</span
            ><span class="booking-date">{{ moment(booking.date).format('YYYY-MM-DD') }}</span>
          </div>
          <div
            class="booking-item"
            @mousemove="handleBookingMouseMove(index)"
            @mouseout="handleBookingMouseOut"
          >
            <div class="time-wrap">
              <span class="time-start">{{ booking.start }}</span>
              <span class="time-to">−</span>
              <span class="time-end">{{ booking.end }}</span>
              <span class="time-period"
                >{{
                  moment(`${booking.date} ${booking.end}`).diff(
                    `${booking.date} ${booking.start}`,
                    'hours',
                    true
                  )
                }}
                {{ langs[settings.lang].general.hour_attr }}</span
              >
            </div>
            <div class="del-btn" @click="removeBooking(index)">
              <el-icon :size="16"><Close /></el-icon>
            </div>
          </div>
        </template>
      </el-scrollbar>
      <div class="btn-wrap" v-if="bookingList.length > 0">
        <el-button type="primary" @click="submitBooking()" :loading="submitting">{{
          langs[settings.lang].booking.booking
        }}</el-button>
      </div>
    </div>
    <div class="schedule-panel">
      <WeekSchedule
        :equipmentId="selectedEquipmentId"
        :schedules
        :dateItems="dateItems"
        :dates="dates"
        :tempTimeSlots="bookingList"
        @add-booking="addBooking"
        :time-range="timeRange"
        :highlight="highlightBooking"
        :loading="scheduleLoading"
        @prevWeek="prevWeek"
        @nextWeek="nextWeek"
      />
    </div>
  </main>
</template>

<script setup>
import moment from 'moment'
import BoxLoading from '@/components/BoxLoading.vue'
import WeekSchedule from '@/components/WeekSchedule.vue'
import { ref, reactive, onMounted, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { api } from '@/utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const loading = ref(true)
const scheduleLoading = ref(true)
const submitting = ref(false)

const selectedEquipmentId = ref(null)

const equipments = ref([])

const schedules = ref({})

const bookingList = ref([])
const highlightBooking = ref(null)
const timeRange = ref([0, 24])

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
  highlightBooking.value = null
}

const handleBookingMouseMove = (index) => {
  highlightBooking.value = index
}

const handleBookingMouseOut = () => {
  highlightBooking.value = null
}

const updateTimeRange = () => {
  let index = equipments.value.findIndex((item) => item.equipment_id == selectedEquipmentId.value)
  timeRange.value = [equipments.value[index].booking_start, equipments.value[index].booking_end]
  console.log(index, timeRange.value)
}

const loadSchedule = async (date) => {
  scheduleLoading.value = true
  let result = await api(
    'GET',
    `/api/equipment/booking/get/week?equipment_id=${selectedEquipmentId.value}&date=${date}`
  ).catch((err) => {
    return console.log(err)
  })
  if (result.code !== 0) return console.error('Error:', result.msg)
  updateTimeRange()
  schedules.value = result.data

  dateItems.value = []
  dates.value = []
  let mondayDate = moment(schedules.value.monday)
  for (let i = 0; i < 7; i++) {
    let date = mondayDate.clone().add(i, 'd')
    dateItems.value.push(date)
    dates.value.push(date.format('YYYY-MM-DD'))
  }
  scheduleLoading.value = false
}

const submitBooking = async () => {
  submitting.value = true
  let result = await api('POST', `/api/equipment/booking/submit`, {
    equipment_id: selectedEquipmentId.value,
    booking_list: bookingList.value
  }).catch((err) => {
    submitting.value = false
    if (err.code === -505) {
      let content = ''
      for (let i = 0; i < err.data.length; i++) {
        content += `${err.data[i].date}: ${err.data[i].start} − ${err.data[i].end}<br />`
      }
      bookingList.value = err.data
      ElMessageBox.alert(content, langs[settings.value.lang].booking.msg_error_time_clash, {
        confirmButtonText: langs[settings.value.lang].confirm,
        dangerouslyUseHTMLString: true
      })
    } else {
      bookingList.value = []
      ElMessage.error(langs[settings.value.lang].booking.msg_error_booking)
    }
    loadSchedule(schedules.value.monday)
    return console.log(err)
  })

  if (result.code !== 0) return console.error('Error:', result.msg)

  bookingList.value = []
  submitting.value = false
  if (result.code == 0) {
    ElMessage({
      message: langs[settings.value.lang].booking.msg_success_booked,
      type: 'success'
    })
  }
  loadSchedule(schedules.value.monday)
}

const prevWeek = () => {
  let date = moment(schedules.value.monday).subtract(1, 'w').format('YYYY-MM-DD')
  loadSchedule(date)
}

const nextWeek = () => {
  let date = moment(schedules.value.monday).add(1, 'w').format('YYYY-MM-DD')
  loadSchedule(date)
}

const dateItems = ref([])
const dates = ref([])

onMounted(async () => {
  let result = await api('GET', '/api/equipment/list').catch((err) => {
    return console.log(err)
  })
  equipments.value = result.data
  selectedEquipmentId.value = equipments.value[0].equipment_id
  loading.value = false
  await loadSchedule(moment().format('YYYY-MM-DD'))
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
    padding: 0 100px;
    width: 50%;
    box-sizing: border-box;
    user-select: none;

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
        transition: background-color 0.2s;

        &:hover {
          background-color: ea-gray(1);
        }

        .time-start {
          margin-right: 5px;
        }

        .time-end {
          margin-left: 5px;
        }

        .time-period {
          color: ea-gray(40);
          margin-left: 15px;
          font-size: 12px;
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

@media (max-width: 900px) {
  .page-booking {
    flex-direction: column;

    .operation-panel {
      padding: 0;
      height: 35%;
      max-height: 35%;
      width: 80vw;
    }
  }

  .schedule-panel {
    margin-bottom: 5vh;
  }
}
</style>
