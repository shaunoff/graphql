import { Day, PrismaClient } from '@prisma/client'

import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import week from 'dayjs/plugin/weekOfYear'
import dayYear from 'dayjs/plugin/dayOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(dayYear)
dayjs.extend(advancedFormat)
dayjs.extend(week)

// Make sure the week starts on Monday
dayjs.extend(isoWeek)

let startDate = dayjs('2022-01-01')
let numberOfDays = 3650

const data: Day[] = []

const createDates = async (prisma: PrismaClient) => {
  await prisma.day.deleteMany({})

  while (numberOfDays >= 0) {
    const dayData = {
      id: parseInt(startDate.format('YYYYMMDD')),
      actualDate: startDate.format('YYYY-MM-DD'),
      year: parseInt(startDate.format('YYYY')),
      weekOfYear: startDate.isoWeek(),
      unix: BigInt(startDate.format('X')),
      dayOfWeek: startDate.isoWeekday(),
      dayOfMonth: parseInt(startDate.format('D')),
      daySuffix: startDate.format('Do'),
      dayName: startDate.format('dddd'),
      dayOfYear: startDate.dayOfYear(),
      monthOfYear: parseInt(startDate.format('M')),
      monthNameAbbreviated: startDate.format('MMM'),
      monthName: startDate.format('MMMM'),
      isWeekend: parseInt(startDate.format('D')) >= 6,
      mmyyyy: startDate.format('MMYYYY'),
      mmddyyyy: startDate.format('MMDDYYYY'),
    }

    data.push(dayData)
    startDate = startDate.add(1, 'day')
    numberOfDays--
  }

  return prisma.day.createMany({ data })
}

export default createDates
