import { useMemo, useState } from 'react'
import {
  AvailabilityStatus,
  CABINS,
  CabinSelector,
  GuestStepper,
  type CabinId,
} from './LowlandControls'

const MONTHS = [
  { year: 2026, month: 8, unavailable: [6, 13, 22, 23, 27], initialRange: [17, 20] },
  { year: 2026, month: 9, unavailable: [3, 4, 11, 18, 25], initialRange: [8, 11] },
  { year: 2026, month: 10, unavailable: [1, 8, 9, 22, 29], initialRange: [12, 15] },
] as const

const MONTH_FORMATTER = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const DATE_FORMATTER = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' })
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCalendarOffset(year: number, month: number) {
  const sundayFirstDay = new Date(year, month, 1).getDay()
  return (sundayFirstDay + 6) % 7
}

function formatDate(year: number, month: number, day: number) {
  return DATE_FORMATTER.format(new Date(year, month, day))
}

function isUnavailable(day: number, unavailable: readonly number[]) {
  return unavailable.includes(day)
}

export function LowlandBooking() {
  const [monthIndex, setMonthIndex] = useState(0)
  const [arrival, setArrival] = useState<number | null>(MONTHS[0].initialRange[0])
  const [departure, setDeparture] = useState<number | null>(MONTHS[0].initialRange[1])
  const [cabin, setCabin] = useState<CabinId>('north')
  const [guests, setGuests] = useState(2)
  const [confirmed, setConfirmed] = useState(false)
  const month = MONTHS[monthIndex]

  const calendarDays = useMemo(() => {
    const offset = getCalendarOffset(month.year, month.month)
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  }, [month])

  const nights = arrival && departure ? departure - arrival : 0
  const total = nights * 210
  const selectedCabin = CABINS.find((option) => option.id === cabin) ?? CABINS[0]

  function moveMonth(direction: -1 | 1) {
    const nextIndex = monthIndex + direction
    if (nextIndex < 0 || nextIndex >= MONTHS.length) return
    const nextMonth = MONTHS[nextIndex]
    setMonthIndex(nextIndex)
    setArrival(nextMonth.initialRange[0])
    setDeparture(nextMonth.initialRange[1])
    setConfirmed(false)
  }

  function selectDay(day: number) {
    if (isUnavailable(day, month.unavailable)) return
    if (arrival === null || departure !== null || day <= arrival) {
      setArrival(day)
      setDeparture(null)
    } else if (month.unavailable.some((blockedDay) => blockedDay > arrival && blockedDay < day)) {
      setArrival(day)
      setDeparture(null)
    } else {
      setDeparture(day)
    }
    setConfirmed(false)
  }

  function submitRequest() {
    if (arrival && departure) setConfirmed(true)
  }

  return (
    <section className="site-booking" id="stay">
      <div className="booking-heading">
        <h2>Choose your stay</h2>
        <AvailabilityStatus tone={confirmed ? 'confirmed' : 'available'}>
          {confirmed ? 'Request ready — we’ll confirm within a day.' : 'Selected dates look good. You can request these dates.'}
        </AvailabilityStatus>
      </div>

      <div className="booking-shell">
        <div className="booking-calendar">
          <div className="calendar-toolbar">
            <button type="button" onClick={() => moveMonth(-1)} disabled={monthIndex === 0} aria-label="Previous month">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
            </button>
            <strong>{MONTH_FORMATTER.format(new Date(month.year, month.month, 1))}</strong>
            <button type="button" onClick={() => moveMonth(1)} disabled={monthIndex === MONTHS.length - 1} aria-label="Next month">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
            </button>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid" role="grid" aria-label={`${MONTH_FORMATTER.format(new Date(month.year, month.month, 1))} availability`}>
            {calendarDays.map((day, index) => {
              if (day === null) return <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true" />
              const unavailable = isUnavailable(day, month.unavailable)
              const isArrival = day === arrival
              const isDeparture = day === departure
              const inRange = arrival !== null && departure !== null && day > arrival && day < departure
              const state = unavailable ? 'unavailable' : isArrival ? 'arrival' : isDeparture ? 'departure' : inRange ? 'range' : 'available'
              return (
                <button
                  type="button"
                  key={day}
                  role="gridcell"
                  data-state={state}
                  disabled={unavailable}
                  aria-label={`${formatDate(month.year, month.month, day)}${unavailable ? ', unavailable' : ''}`}
                  aria-selected={isArrival || isDeparture || inRange}
                  onClick={() => selectDay(day)}
                >
                  <span>{day}</span>
                  {isArrival ? <small>Arrival</small> : null}
                  {isDeparture ? <small>Departure</small> : null}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="booking-summary" aria-label="Stay choices">
          <CabinSelector value={cabin} onChange={(value) => { setCabin(value); setConfirmed(false) }} />
          <div className="guest-choice">
            <span>Guests</span>
            <GuestStepper value={guests} onChange={(value) => { setGuests(value); setConfirmed(false) }} />
          </div>
          <dl>
            <div><dt>Cabin</dt><dd>{selectedCabin.label}</dd></div>
            <div><dt>Arrival</dt><dd>{arrival ? formatDate(month.year, month.month, arrival) : 'Choose a date'}</dd></div>
            <div><dt>Departure</dt><dd>{departure ? formatDate(month.year, month.month, departure) : 'Choose a date'}</dd></div>
            <div><dt>Guests</dt><dd>{guests}</dd></div>
            <div><dt>Stay</dt><dd>{nights || '—'} {nights === 1 ? 'night' : 'nights'}</dd></div>
          </dl>
          <div className="booking-total">
            <span>{total ? `€${total} total` : 'Choose your departure'}</span>
            <button type="button" className="lowland-button" onClick={submitRequest} disabled={!arrival || !departure}>
              Request these dates
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
