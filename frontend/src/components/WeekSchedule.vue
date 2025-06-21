<template>
  <div class="schedule-wrap">
    <BoxLoading :loading="loading" />
    <div class="schedule-header"></div>
    <div class="schedule-content">
      <table class="time-grid">
        <thead>
          <tr>
            <th></th>
            <th v-for="date in dateItems" :key="date" class="time-grid-date" ref="dateRefs" :class="{today: date.format('YYYY-MM-DD') == todayItem.format('YYYY-MM-DD')}">
              <div class="date-label-wrap">
                <div class="date-label-weekday">
                  {{ date.format('ddd') }}
                </div>
                <div class="date-label-date">
                  {{ date.format('DD MMM') }}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="time-grid-row"
            v-for="hour in Array.from(
              { length: (timeRange[1] - timeRange[0]) * 2 + 1 },
              (_, i) => timeRange[0] * 2 + i
            )"
            :key="hour / 2"
            ref="timeRefs"
          >
            <th rowspan="2" v-if="hour % 2 === 0" class="time-grid-hour">
              <div class="time-label">{{ hour / 2 < 10 ? '0' + hour / 2 : hour / 2 }}:00</div>
            </th>
            <td
              v-for="date in dates"
              :key="date"
              class="time-grid-cell"
              :class="{ last: hour == 48 }"
              :title="hourToText(hour / 2)"
              @mousedown="handleSlotMouseDown(date, hourToText(hour / 2), $event)"
              @mouseenter="handleSlotMouseEnter(date, hourToText(hour / 2), $event)"
            ></td>
          </tr>
        </tbody>
      </table>
      <div class="time-slot-wrap">
        <div
          class="time-slot"
          :class="{ self: time_slot.user.uid === userData.uid }"
          v-for="(time_slot, index) in schedules.time_slots"
          :key="`${index}-${resizeKey}`"
          :style="{
            top:
              timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop + 0.8 + 'px',
            left: dateRefs[dateToIndex(time_slot.date)]?.offsetLeft + 1 + 'px',
            width: dateRefs[dateToIndex(time_slot.date)]?.offsetWidth - 2.6 + 'px',
            height:
              timeRefs[textToHour(time_slot.end) * 2 - timeRange[0] * 2]?.offsetTop -
              timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop -
              2.6 +
              'px'
          }"
          :title="`${time_slot.date}: ${time_slot.start} - ${time_slot.end}`"
          @mouseenter="handleSlotMouseUp(hourToText(textToHour(time_slot.start) - 0.5))"
        >
          <div class="time-slot-content">
            <span class="time-slot-user">{{ time_slot.user.realname }}</span>
          </div>
        </div>
        <div
          class="time-slot booking"
          :class="{ highlight: highlight == index }"
          :key="`${time_slot}-${resizeKey}`"
          v-for="(time_slot, index) in tempTimeSlots"
          :style="{
            top:
              timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop + 0.8 + 'px',
            left: dateRefs[dateToIndex(time_slot.date)]?.offsetLeft + 1 + 'px',
            width: dateRefs[dateToIndex(time_slot.date)]?.offsetWidth - 2.6 + 'px',
            height:
              timeRefs[textToHour(time_slot.end) * 2 - timeRange[0] * 2]?.offsetTop -
              timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop -
              2.6 +
              'px'
          }"
          :title="`${time_slot.date}: ${time_slot.start} - ${time_slot.end}`"
          @mouseenter="handleSlotMouseUp(hourToText(textToHour(time_slot.start) - 0.5))"
        >
          <div class="time-slot-content"></div>
        </div>
        <div
          class="time-slot selecting"
          :key="`selecting-${resizeKey}`"
          v-if="selectInfo.start"
          :style="{
            top:
              timeRefs[textToHour(selectInfo.start) * 2 - timeRange[0] * 2]?.offsetTop + 0.8 + 'px',
            left: dateRefs[dateToIndex(selectInfo.date)]?.offsetLeft + 1 + 'px',
            width: dateRefs[dateToIndex(selectInfo.date)]?.offsetWidth - 2.6 + 'px',
            height:
              timeRefs[textToHour(selectInfo.end) * 2 - timeRange[0] * 2]?.offsetTop -
              timeRefs[textToHour(selectInfo.start) * 2 - timeRange[0] * 2]?.offsetTop -
              2.6 +
              'px'
          }"
          :title="`${selectInfo.date}: ${selectInfo.start} - ${selectInfo.end}`"
        >
          <div class="time-slot-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import moment from 'moment'
import { api } from '@/utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings, userData } = storeToRefs(store)
const langs = inject('langs')

const dateItems = ref([])
const dates = ref([])
const todayItem = moment()
const timeRefs = ref([])
const dateRefs = ref([])

const loading = ref(true)

const emit = defineEmits(['addBooking'])

const props = defineProps({
  schedules: {
    type: Object,
    default: () => ({})
  },
  tempTimeSlots: {
    type: Array,
    default: () => []
  },
  timeRange: {
    type: Array,
    default: () => [0, 24]
  },
  highlight: {
    type: Number,
    default: () => null
  }
})

const hourToText = (hour) => {
  if (hour > props.timeRange[1]) hour = props.timeRange[1]
  let h = Math.floor(hour)
  let m = hour % 1 === 0 ? '00' : '30'
  return `${h < 10 ? '0' + h : h}:${m}`
}

const textToHour = (text) => {
  if (!text || !text.includes(':')) return 0
  const [h, m] = text.split(':').map(Number)
  return h + m / 60
}

const dateToIndex = (date) => {
  return dates.value.indexOf(date)
}

const selectInfo = ref({
  isSelecting: false,
  date: null,
  start: null,
  end: null
})

const addBooking = () => {
  selectInfo.value.isSelecting = false
  emit('addBooking', selectInfo.value)
  resetSelectInfo()
}

const resetSelectInfo = () => {
  selectInfo.value.isSelecting = false
  selectInfo.value.start = null
  selectInfo.value.end = null
  selectInfo.value.date = null
}

const handleSlotMouseDown = (date, time, event) => {
  event.preventDefault()
  selectInfo.value.isSelecting = true
  selectInfo.value.date = date
  selectInfo.value.start = time
  selectInfo.value.end = hourToText(textToHour(time) + 0.5)
}

const handleSlotMouseEnter = (date, time, event) => {
  event.preventDefault()
  if (!selectInfo.value.isSelecting) return
  if (date !== selectInfo.value.date) return addBooking()
  if (textToHour(time) < textToHour(selectInfo.value.start)) {
    // selectInfo.value.end = selectInfo.value.start
    // selectInfo.value.start = time
    return
  }
  selectInfo.value.end = hourToText(textToHour(time) + 0.5)
}

const handleSlotMouseUp = (time = null) => {
  if (!selectInfo.value.isSelecting) return
  event.preventDefault()
  if (time) {
    /*if (textToHour(time) < textToHour(selectInfo.value.start)) {
      selectInfo.value.end = hourToText(textToHour(selectInfo.value.start) + 0.5)
    } else {*/
    selectInfo.value.end = hourToText(textToHour(time) + 0.5)
    //}
  }
  selectInfo.value.isSelecting = false
  return addBooking()
}

const resizeKey = ref(0)

onMounted(() => {
  let mondayDate = moment(props.schedules.monday)
  for (let i = 0; i < 7; i++) {
    let date = mondayDate.clone().add(i, 'd')
    dateItems.value.push(date)
    dates.value.push(date.format('YYYY-MM-DD'))
  }

  loading.value = false
  window.onresize = () => {
    resizeKey.value++
  }
  window.addEventListener('mouseup', () => {
    handleSlotMouseUp()
  })
})
</script>

<style lang="scss" scoped>
.schedule-wrap {
  position: relative;
  width: 40vw;
  min-width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  .schedule-content {
    position: relative;
    width: 100%;
    height: calc(100% - 50px);
  }

  .time-grid {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    box-sizing: border-box;
    font-size: 0.9em;
    table-layout: auto;
    user-select: none;
    background-color: $ea-white;

    thead {
      th {
        background-color: ea-gray(5);
        height: 30px;

        &.today {
            background-color: ea-blue(2)
        }
      }
    }

    th,
    td {
      border: 1px solid #ddd;
      text-align: center;
      padding: 0;
      box-sizing: border-box;
    }

    .time-grid-hour {
      padding: 0 5px 5px 5px;
      font-size: 12px;
      line-height: 12px;
      background-color: ea-gray(5);
    }

    .time-grid-date {
      padding: 2px 5px;

      .date-label-weekday {
        font-size: 14px;
        line-height: 14px;
      }

      .date-label-date {
        font-size: 10px;
        line-height: 10px;
        color: ea-gray(50);
      }
    }
  }

  .time-slot-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .time-slot {
      position: absolute;
      width: 100px;
      height: 30px;
      background-color: ea-gray(40, 5);
      border-radius: 4px;
      box-shadow: $shadow-1;
      pointer-events: auto;
      border: 1px solid ea-gray(40, 8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &.self {
        background-color: ea-blue(5);
        border-color: ea-blue(8);
      }

      .time-slot-content {
        font-size: 10px;
        line-height: 10px;
        user-select: none;

        .time-slot-user {
          color: #fff;
          font-weight: bold;
        }
      }

      &.selecting {
        background-color: ea-green(5);
        border-color: ea-green(8);
        pointer-events: none;
      }

      &.booking {
        background-color: ea-green(5);
        border-color: ea-green(8);

        &.highlight {
          background-color: ea-yellow(5);
          border-color: ea-yellow(8);
        }
      }
    }
  }
}
</style>
