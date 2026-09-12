import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { TimeInterval, TimeRangeByIntervalProps } from './interface'
import {
  subDays,
  subWeeks,
  subMonths,
  subYears,
  subQuarters,
  startOfQuarter,
  startOfWeek,
  startOfMonth,
} from 'date-fns'

/**
 * Calculates the start and end dates based on the given time interval and date range.
 *
 * @param props - The properties for calculating the time range.
 * @param props.timeInterval - The interval type (e.g., "Hourly", "Daily", "Weekly", "Monthly", "Quarterly").
 * @param props.dateRange - The range of dates to subtract from the current date.
 * @returns An object containing the start date and end date.
 * @throws Will throw an error if the time interval is invalid.
 */
export function getTimeRangeByInterval(props: TimeRangeByIntervalProps) {
  const { timeInterval, dateRange } = props
  const endDate = new Date()
  let startDate: Date

  switch (timeInterval) {
    case 'Hourly':
    case 'Daily':
      startDate = subDays(endDate, parseInt(dateRange))
      break
    case 'Weekly': {
      const lastFullWeek = subWeeks(endDate, parseInt(dateRange))
      startDate = startOfWeek(lastFullWeek)
      break
    }
    case 'Monthly': {
      const lastFullMonth = subMonths(endDate, parseInt(dateRange))
      startDate = startOfMonth(lastFullMonth)
      break
    }
    case 'Quarterly': {
      const lastFullQuarter = subQuarters(endDate, parseInt(dateRange))
      startDate = startOfQuarter(lastFullQuarter)
      break
    }

    case 'Yearly': {
      const lastFullYear = subYears(endDate, parseInt(dateRange))
      startDate = new Date(lastFullYear.getFullYear(), 0, 1)
      break
    }

    default:
      throw new Error('Invalid time interval')
  }

  return { startDate, endDate }
}

export const getDatesByRange = (
  timeInterval: TimeInterval,
  dateRange: string,
): [Dayjs, Dayjs] => {
  const { startDate, endDate } = getTimeRangeByInterval({
    timeInterval,
    dateRange,
  })

  return [dayjs(startDate), dayjs(endDate)]
}
