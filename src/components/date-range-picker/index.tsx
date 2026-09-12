import { m } from '@/paraglide/messages'
import { Button, ButtonGroup, HStack } from '@chakra-ui/react'
import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { MdOutlineClose } from 'react-icons/md'
import {
  DEFAULT_TIME_INTERVAL,
  defaultTimeIntervalValues,
  getPickerFormat,
  getPickerType,
  timeIntervalOptions,
} from './data'
import type { Query, TimeInterval } from './interface'
import TimeIntervalMenu from './menu'
import TimeButton from './time-button'
import { getDatesByRange } from './utils'
import AppPresence from '../app-presence'

type Props = {
  showCloseButton?: boolean
  /**
   * Pass this to drive the selection from outside — the URL, typically. Doing
   * so makes the component controlled: the internal `dates` are ignored, so
   * whoever owns the params can clear them and have the UI follow. Leave it off
   * and the picker keeps its own selection as before.
   */
  value?: [Dayjs, Dayjs]
  onChange?: (dates?: [Dayjs, Dayjs]) => void
  onIntervalChange?: (interval: TimeInterval) => void
}

const { RangePicker } = DatePicker

export default function DateRangePicker(props: Props) {
  const { showCloseButton = true } = props

  const [customDate, setCustomDate] = useState(false)
  const [query, setQuery] = useState<Query>(() => {
    const dateRange = defaultTimeIntervalValues[DEFAULT_TIME_INTERVAL]
    const dates = getDatesByRange(DEFAULT_TIME_INTERVAL, dateRange)
    return {
      dateRange,
      timeInterval: DEFAULT_TIME_INTERVAL,
      dates: showCloseButton ? undefined : dates,
    }
  })

  /**
   * `'value' in props` rather than `props.value !== undefined`, so that a
   * controlled parent clearing its range reads as "no selection" instead of
   * falling back to whatever was last picked internally.
   */
  const isControlled = 'value' in props
  const selectedDates = isControlled ? props.value : query.dates

  useEffect(() => {
    if (!showCloseButton && query.dates && props.onChange) {
      props.onChange(query.dates)
    }
    // Run once so the default date range initialises the parent params.
  }, [])

  const onIntervalChange = (timeInterval: TimeInterval) => {
    const dateRange = defaultTimeIntervalValues[timeInterval]
    const dates = getDatesByRange(timeInterval, dateRange)
    setQuery((q) => ({ ...q, timeInterval, dateRange, dates }))
    setCustomDate(false)
    if (props.onChange) props.onChange(dates)
    if (props.onIntervalChange) props.onIntervalChange(timeInterval)
  }

  const onDateRangeChange = (dateRange: string) => {
    const dates = getDatesByRange(query.timeInterval, dateRange)
    setQuery((q) => ({ ...q, dateRange, dates }))
    setCustomDate(false)
    if (props.onChange) props.onChange(dates)
  }

  const handleDateChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      const dateRange = 'unknown'
      setQuery((q) => ({ ...q, dateRange, dates: values as [Dayjs, Dayjs] }))
      if (props.onChange) props.onChange(values as [Dayjs, Dayjs])
    }
  }

  const handleClearDate = () => {
    setCustomDate(false)
    setQuery({ ...query, dates: undefined })
    if (props.onChange) props.onChange(undefined)
  }

  return (
    <AppPresence present>
      <HStack bgColor="bg" _dark={{ bgColor: 'bg.subtle' }} p={0} gap={0}>
        <ButtonGroup attached>
          <TimeIntervalMenu
            onSelectItem={onIntervalChange}
            timeInterval={query.timeInterval}
          />
          {!customDate &&
            timeIntervalOptions[query.timeInterval].map(({ name, tooltip }) => {
              const defaultValue = selectedDates ? query.dateRange : ''
              const variant = name === defaultValue ? 'subtle' : 'outline'
              const colorPalette =
                name === defaultValue ? 'turquoise-blue' : 'gray'

              return (
                <TimeButton
                  size="xs"
                  key={name}
                  variant={variant}
                  tooltips={tooltip()}
                  colorPalette={colorPalette}
                  onClick={() => onDateRangeChange(name)}
                >
                  {name}
                </TimeButton>
              )
            })}

          {!customDate && (
            <TimeButton
              size="xs"
              variant="outline"
              colorPalette="gray"
              tooltips={m.common_dateRange_customDate()}
              onClick={() => setCustomDate(true)}
            >
              <FaCalendarAlt aria-hidden="true" />
            </TimeButton>
          )}

          {customDate && (
            <Button
              size="xs"
              type="button"
              variant="outline"
              css={{
                'table tbody tr td.ant-picker-cell:': { color: 'inherit' },
              }}
            >
              <RangePicker
                width={200}
                size="small"
                allowClear={false}
                value={selectedDates}
                variant="borderless"
                onChange={handleDateChange}
                picker={getPickerType[query.timeInterval]}
                format={getPickerFormat[query.timeInterval]}
                style={{ fontFamily: 'Rebond Grotesque', color: 'inherit' }}
              />
            </Button>
          )}

          {(selectedDates || customDate) && showCloseButton && (
            <TimeButton
              h="30px"
              size="xs"
              variant="surface"
              colorPalette="red"
              onClick={handleClearDate}
              tooltips={m.common_dateRange_clearDates()}
            >
              <MdOutlineClose aria-hidden="true" />
            </TimeButton>
          )}
        </ButtonGroup>
      </HStack>
    </AppPresence>
  )
}
