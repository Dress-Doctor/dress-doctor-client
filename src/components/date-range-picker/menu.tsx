import { m } from '@/paraglide/messages'
import { Button, For, Menu, Portal } from '@chakra-ui/react'
import { forwardRef, useId } from 'react'
import { FaChevronDown } from 'react-icons/fa6'
import { GiAlarmClock } from 'react-icons/gi'
import { Tooltip } from '../ui/tooltip'
import { timeIntervalLabel, timeIntervals } from './data'
import type { TimeInterval } from './interface'

interface Props {
  timeInterval: TimeInterval
  onSelectItem: (item: TimeInterval) => void
}

const TimeIntervalMenu = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { onSelectItem, timeInterval, ...rest } = props

  const triggerId = useId()

  const onValueChange = (event: { value: string }) => {
    onSelectItem(event.value as TimeInterval)
  }

  return (
    <Menu.Root ids={{ trigger: triggerId }}>
      <Tooltip
        showArrow
        openDelay={0}
        closeDelay={0}
        content={m.common_dateRange_timeInterval()}
        ids={{ trigger: triggerId }}
        positioning={{ placement: 'top' }}
      >
        <Menu.Trigger asChild>
          <Button
            ref={ref}
            size="xs"
            // rounded="full"
            variant="outline"
            colorPalette="gray"
            touchAction="manipulation"
            {...rest}
          >
            <GiAlarmClock aria-hidden="true" />
            {timeIntervalLabel(timeInterval)}
            <FaChevronDown
              aria-hidden="true"
              style={{ width: 11, height: 11 }}
            />
          </Button>
        </Menu.Trigger>
      </Tooltip>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.RadioItemGroup
              value={timeInterval}
              onValueChange={onValueChange}
            >
              <For each={timeIntervals}>
                {({ value }) => {
                  const color = value === timeInterval ? 'turquoise-blue' : 'fg'
                  return (
                    <Menu.RadioItem
                      key={value}
                      color={color}
                      value={value}
                      cursor="pointer"
                    >
                      {timeIntervalLabel(value)}
                    </Menu.RadioItem>
                  )
                }}
              </For>
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})

export default TimeIntervalMenu
