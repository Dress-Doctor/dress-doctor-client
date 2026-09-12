import type { Dayjs } from 'dayjs'

export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
export type GetPickerType = Record<TimeInterval, PickerType>
export type GetPickerFormat = Record<TimeInterval, string>
export type TimeInterval =
  'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'

export interface TimeRangeByIntervalProps {
  timeInterval: TimeInterval
  dateRange: string
}

export interface TimeIntervalItem {
  value: TimeInterval
}

export interface Query {
  dateRange: string
  dates?: [Dayjs, Dayjs]
  timeInterval: TimeInterval
}
