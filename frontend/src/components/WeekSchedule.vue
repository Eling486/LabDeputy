<template>
  <div class="schedule-wrap">
    <BoxLoading :loading="loading" />
    <div class="schedule-header">
      <el-button size="small" :icon="ArrowLeft" @click="$emit('prevWeek')">
        {{ langs[settings.lang].booking.prev_week }}
      </el-button>
      <div class="week-period">
        {{ schedules.monday }} ~ {{ moment(schedules.monday).add(1, 'w').format('YYYY-MM-DD') }}
      </div>
      <el-button size="small" @click="$emit('nextWeek')">
        {{ langs[settings.lang].booking.next_week
        }}<el-icon class="el-icon--right"><ArrowRight /></el-icon>
      </el-button>
    </div>
    <div
      class="schedule-content"
      v-if="schedules.monday"
      @mouseup="handleSlotMouseUp()"
      :key="dates"
    >
      <table class="time-grid">
        <thead>
          <tr>
            <th></th>
            <th
              v-for="date in dateItems"
              :key="date"
              class="time-grid-date"
              ref="dateRefs"
              :class="{ today: date.format('YYYY-MM-DD') == todayItem.format('YYYY-MM-DD') }"
            >
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
        <tbody @mouseleave="handleSlotMouseUp()">
          <tr
            class="time-grid-row"
            :class="{
              selecting: selectInfo.isSelecting
            }"
            v-for="hour in Array.from(
              { length: (timeRange[1] - timeRange[0]) * 2 + 1 },
              (_, i) => timeRange[0] * 2 + i
            )"
            :key="hour / 2"
            ref="timeRefs"
          >
            <th
              :rowspan="(hour == timeRange[1] * 2) ? 1 : 2"
              v-if="hour % 2 === 0"
              class="time-grid-hour"
              :class="{
                additional: hour == timeRange[1] * 2
              }"
            >
              <div class="time-label">{{ hour / 2 < 10 ? '0' + hour / 2 : hour / 2 }}:00</div>
            </th>
            <td
              v-for="(date, index) in dates"
              :key="date"
              class="time-grid-cell"
              :class="{
                additional: hour == timeRange[1] * 2,
                passed: moment(`${date} ${hourToText(hour / 2)}`).isBefore(moment(), 'minute'),
                'last-column': index == dates.length - 1
              }"
              :title="hourToText(hour / 2)"
              @mousedown="handleSlotMouseDown(date, hourToText(hour / 2), $event)"
              @touchstart="handleSlotMouseDown(date, hourToText(hour / 2), $event)"
              @touchenter="handleSlotMouseEnter(date, hourToText(hour / 2), $event)"
              @mouseenter="handleSlotMouseEnter(date, hourToText(hour / 2), $event)"
            ></td>
          </tr>
        </tbody>
      </table>
      <div class="time-slot-wrap">
        <div
          class="time-line"
          :style="{
            left: dateRefs[0]?.offsetLeft + 'px',
            top:
              timeRefs[Math.floor(now * 2) - timeRange[0] * 2]?.offsetTop -
              0.5 +
              (timeRefs[Math.floor(now * 2) - timeRange[0] * 2 + 1]?.offsetTop -
                timeRefs[Math.floor(now * 2) - timeRange[0] * 2]?.offsetTop) *
                ((now * 2) % 1) +
              'px'
          }"
          v-if="
            moment().isBetween(
              schedules.monday,
              moment(schedules.monday).add(1, 'w').format('YYYY-MM-DD')
            ) && (now >= timeRange[0] && now <= timeRange[1])
          "
        ></div>
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
          @mouseenter="handleSlotMouseUp($event, hourToText(textToHour(time_slot.start) - 0.5))"
          @touchenter="handleSlotMouseUp($event, hourToText(textToHour(time_slot.start) - 0.5))"
        >
          <div class="time-slot-del" v-if="(time_slot.user.uid === userData.uid) || userData.is_admin" @click="$emit('cancelBooking', time_slot.booking_id)">
            <el-icon :size="12"><Close /></el-icon>
          </div>
          <div class="time-slot-content">
            <span class="time-slot-user">{{ time_slot.user.realname }}</span>
          </div>
        </div>
        <template :key="`${time_slot}-${resizeKey}`" v-for="(time_slot, index) in tempTimeSlots">
          <div
            class="time-slot booking"
            :class="{ highlight: highlight == index }"
            v-if="dateToIndex(time_slot.date) >= 0"
            :style="{
              top:
                timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop +
                0.8 +
                'px',
              left: dateRefs[dateToIndex(time_slot.date)]?.offsetLeft + 1 + 'px',
              width: dateRefs[dateToIndex(time_slot.date)]?.offsetWidth - 2.6 + 'px',
              height:
                timeRefs[textToHour(time_slot.end) * 2 - timeRange[0] * 2]?.offsetTop -
                timeRefs[textToHour(time_slot.start) * 2 - timeRange[0] * 2]?.offsetTop -
                2.6 +
                'px'
            }"
            :title="`${time_slot.date}: ${time_slot.start} - ${time_slot.end}`"
            @mouseenter="handleSlotMouseUp($event, hourToText(textToHour(time_slot.start) - 0.5))"
            @touchenter="handleSlotMouseUp($event, hourToText(textToHour(time_slot.start) - 0.5))"
          >
            <div class="time-slot-content"></div>
          </div>
        </template>
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
import { ref, onMounted, inject, onBeforeUnmount, watch } from 'vue'
import moment from 'moment'
import { ArrowLeft, ArrowRight, Close } from '@element-plus/icons-vue'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings, userData } = storeToRefs(store)
const langs = inject('langs')

const todayItem = moment()
const timeRefs = ref([])
const dateRefs = ref([])

const now = ref(0)

const emit = defineEmits(['addBooking', 'prevWeek', 'nextWeek'])

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
  dateItems: {
    type: Array,
    default: () => []
  },
  dates: {
    type: Array,
    default: () => []
  },
  highlight: {
    type: Number,
    default: () => null
  },
  loading: {
    type: Boolean,
    default: true
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
  return props.dates.indexOf(date)
}

const selectInfo = ref({
  isSelecting: false,
  date: null,
  start: null,
  end: null
})

const updateNowTime = () => {
  now.value = textToHour(moment().format('HH:mm'))
}

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

const isTimeClash = (timeItem) => {
  if (
    props.schedules.time_slots.filter((time_slot) => {
      return (
        timeItem.isSameOrAfter(`${time_slot.date} ${time_slot.start}`) &&
        timeItem.isBefore(`${time_slot.date} ${time_slot.end}`)
      )
    }).length > 0
  )
    return true
  if (
    props.tempTimeSlots.filter((time_slot) => {
      return (
        timeItem.isSameOrAfter(`${time_slot.date} ${time_slot.start}`) &&
        timeItem.isBefore(`${time_slot.date} ${time_slot.end}`)
      )
    }).length > 0
  )
    return true
  return false
}

const handleSlotMouseDown = (date, time, event) => {
  event.preventDefault()

  let timeItem = moment(`${date} ${time}`)
  if (timeItem.isBefore(moment(), 'minute')) return
  if (isTimeClash(timeItem)) return
  if (textToHour(time) >= props.timeRange[1]) return

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

  let timeItem = moment(`${date} ${time}`)
  if (isTimeClash(timeItem)) return addBooking()

  selectInfo.value.end = hourToText(textToHour(time) + 0.5)
}

const handleSlotMouseUp = (event = null, time = null) => {
  if (!selectInfo.value.isSelecting) return
  if (event) event.preventDefault()
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

const lastElement = ref()

const handleTouchmove = (e) => {
  const touch = e.touches[0]
  const currentElement = document.elementFromPoint(touch.clientX, touch.clientY)
  if (currentElement !== lastElement.value) {
    if (lastElement.value) {
      const leaveEvent = new Event('touchleave')
      lastElement.value.dispatchEvent(leaveEvent)
    }
    if (currentElement) {
      const enterEvent = new Event('touchenter')
      currentElement.dispatchEvent(enterEvent)
    }

    lastElement.value = currentElement
  }
}

const handleTouchend = () => {
  lastElement.value = null
  handleSlotMouseUp()
}

const resizeKey = ref(0)
let timer = null

onMounted(() => {
  window.onresize = () => {
    resizeKey.value++
  }
  updateNowTime()
  timer = setInterval(() => {
    updateNowTime()
  }, 1000 * 60)

  document.addEventListener('touchmove', handleTouchmove)
  document.addEventListener('touchend', handleTouchend)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('touchmove', handleTouchmove)
  document.removeEventListener('touchend', handleTouchend)
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

  .schedule-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-grow: 1;
    width: 100%;
    padding: 10px 0;
    box-sizing: border-box;
  }

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
    table-layout: fixed;
    user-select: none;

    thead {
      th {
        background-color: ea-gray(5);
        height: 30px;

        &.today {
          background-color: ea-blue(2);
        }
      }
    }

    th,
    td {
      border: 1px solid ea-gray(13);
      text-align: center;
      padding: 0;
      box-sizing: border-box;
      background-color: $ea-white;

      &.passed {
        background-color: ea-gray(5);
        cursor: not-allowed;
      }

      &.additional {
        background-color: ea-gray(5);
        border: none;
        border-bottom: 1px solid ea-gray(13);

        &.time-grid-hour {
          border-left: 1px solid ea-gray(13);
        }

        &.last-column {
          border-right: 1px solid ea-gray(13);
        }
      }
    }

    .time-grid-row {
      .time-grid-hour {
        position: relative;
        vertical-align: top;
        padding: 0 5px 5px 0;
        font-size: 12px;
        line-height: 12px;
        background-color: ea-gray(5);

        .time-label {
          position: relative;
          top: -7px;
          background-color: ea-gray(5);
          text-align: right;
          padding-right: 2px;
        }
      }

      &:not(.selecting):has(+ .time-grid-row:hover) {
        .time-grid-cell {
          border-bottom: 1px solid ea-gray(50);
        }
      }

      &.selecting:hover {
        .time-grid-cell:not(.additional) {
          border-bottom: 1px solid ea-gray(50);
        }
      }
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

    .time-line {
      position: absolute;
      right: 0;
      height: 1px;
      background-color: red;
      pointer-events: none;
    }

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
      transition: background-color 0.2s;

      &.self {
        background-color: ea-blue(5);
        border-color: ea-blue(8);
      }

      .time-slot-del {
        position: absolute;
        width: 12px;
        height: 12px;
        line-height: 12px;
        top: 0;
        right: 0;
        border-radius: 2px;
        color: $ea-white;
        opacity: 0;

        &:hover {
          background-color: ea-main(3);
        }
      }

      &:hover {
        .time-slot-del {
          opacity: 1;
          cursor: pointer;
        }
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

@media (max-width: 900px) {
  .schedule-wrap {
    position: relative;
    width: 95vw;
    min-width: 95vw;

    .schedule-header {
      font-size: 12px;
    }
  }
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
  @supports (-webkit-appearance: none) and (stroke-color: transparent) {
    .time-grid tbody tr {
      /* 在Safari中强制行高一致 */
      height: 1.5dvh !important;
      min-height: 0 !important;
      max-height: 1.5dvh !important;
      line-height: 1 !important;

      th, td:not(.additional) {
        /* 确保单元格在Safari中高度一致 */
        line-height: 1 !important;
        vertical-align: baseline !important;
      }
    }
  }
}
</style>
