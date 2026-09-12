import { m } from '@/paraglide/messages'
import type {
  GetPickerFormat,
  GetPickerType,
  TimeInterval,
  TimeIntervalItem,
} from './interface'

export const DEFAULT_TIME_INTERVAL: TimeInterval = 'Daily'

/** Localized display label for a time interval (value doubles as a logic key). */
export function timeIntervalLabel(value: TimeInterval): string {
  switch (value) {
    case 'Hourly':
      return m.common_dateRange_interval_hourly()
    case 'Daily':
      return m.common_dateRange_interval_daily()
    case 'Weekly':
      return m.common_dateRange_interval_weekly()
    case 'Monthly':
      return m.common_dateRange_interval_monthly()
    case 'Quarterly':
      return m.common_dateRange_interval_quarterly()
    case 'Yearly':
      return m.common_dateRange_interval_yearly()
  }
}
export const defaultTimeIntervalValues: GetPickerFormat = {
  Hourly: '7d',
  Daily: '7d',
  Weekly: '12w',
  Monthly: '6m',
  Quarterly: '4q',
  Yearly: '2y',
}

export const getPickerType: GetPickerType = {
  Hourly: 'date',
  Daily: 'date',
  Weekly: 'week',
  Monthly: 'month',
  Quarterly: 'quarter',
  Yearly: 'year',
}

export const getPickerFormat: GetPickerFormat = {
  Hourly: 'YYYY-MM-DD',
  Daily: 'YYYY-MM-DD',
  Weekly: 'wo [week] YYYY',
  Monthly: 'YYYY-MM',
  Quarterly: 'YYYY [Q]Q',
  Yearly: 'YYYY',
}

export const timeIntervals: TimeIntervalItem[] = [
  { value: 'Hourly' },
  { value: 'Daily' },
  { value: 'Weekly' },
  { value: 'Monthly' },
  { value: 'Quarterly' },
  { value: 'Yearly' },
]

/** tooltip resolves at render so the label follows the active locale. */
export const timeIntervalOptions = {
  Hourly: [
    { name: '1d', tooltip: () => m.common_dateRange_lastDays({ count: 1 }) },
    { name: '3d', tooltip: () => m.common_dateRange_lastDays({ count: 3 }) },
    { name: '7d', tooltip: () => m.common_dateRange_lastDays({ count: 7 }) },
  ],
  Daily: [
    { name: '7d', tooltip: () => m.common_dateRange_lastDays({ count: 7 }) },
    { name: '30d', tooltip: () => m.common_dateRange_lastDays({ count: 30 }) },
    { name: '60d', tooltip: () => m.common_dateRange_lastDays({ count: 60 }) },
    { name: '90d', tooltip: () => m.common_dateRange_lastDays({ count: 90 }) },
  ],
  Weekly: [
    { name: '4w', tooltip: () => m.common_dateRange_lastWeeks({ count: 4 }) },
    { name: '8w', tooltip: () => m.common_dateRange_lastWeeks({ count: 8 }) },
    { name: '12w', tooltip: () => m.common_dateRange_lastWeeks({ count: 12 }) },
    { name: '24w', tooltip: () => m.common_dateRange_lastWeeks({ count: 24 }) },
  ],
  Monthly: [
    { name: '3m', tooltip: () => m.common_dateRange_lastMonths({ count: 3 }) },
    { name: '6m', tooltip: () => m.common_dateRange_lastMonths({ count: 6 }) },
    {
      name: '12m',
      tooltip: () => m.common_dateRange_lastMonths({ count: 12 }),
    },
  ],
  Quarterly: [
    {
      name: '2q',
      tooltip: () => m.common_dateRange_lastQuarters({ count: 2 }),
    },
    {
      name: '3q',
      tooltip: () => m.common_dateRange_lastQuarters({ count: 3 }),
    },
    {
      name: '4q',
      tooltip: () => m.common_dateRange_lastQuarters({ count: 4 }),
    },
  ],
  Yearly: [
    { name: '2y', tooltip: () => m.common_dateRange_lastYears({ count: 2 }) },
    { name: '3y', tooltip: () => m.common_dateRange_lastYears({ count: 3 }) },
    { name: '4y', tooltip: () => m.common_dateRange_lastYears({ count: 4 }) },
  ],
}
