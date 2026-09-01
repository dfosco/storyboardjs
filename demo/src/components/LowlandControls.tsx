import type { ChangeEvent } from 'react'

export const CABINS = [
  { id: 'north', label: 'North cabin', shortLabel: 'North' },
  { id: 'field', label: 'Field cabin', shortLabel: 'Field' },
  { id: 'sea', label: 'Sea cabin', shortLabel: 'Sea' },
] as const

export type CabinId = (typeof CABINS)[number]['id']

interface CabinSelectorProps {
  value: CabinId
  onChange: (value: CabinId) => void
  compact?: boolean
}

export function CabinSelector({ value, onChange, compact = false }: CabinSelectorProps) {
  return (
    <fieldset className="cabin-selector tc-no-drag" data-compact={compact || undefined}>
      <legend className={compact ? 'visually-hidden' : undefined}>Cabin</legend>
      <div>
        {CABINS.map((cabin) => (
          <label key={cabin.id} data-selected={value === cabin.id || undefined}>
            <input
              type="radio"
              name={compact ? 'specimen-cabin' : 'booking-cabin'}
              value={cabin.id}
              checked={value === cabin.id}
              onChange={() => onChange(cabin.id)}
            />
            <span>{compact ? cabin.shortLabel : cabin.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface GuestStepperProps {
  value: number
  onChange: (value: number) => void
}

export function GuestStepper({ value, onChange }: GuestStepperProps) {
  return (
    <div className="guest-stepper tc-no-drag" aria-label="Number of guests">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Remove one guest">
        <span aria-hidden="true">−</span>
      </button>
      <output aria-live="polite">{value} {value === 1 ? 'guest' : 'guests'}</output>
      <button type="button" onClick={() => onChange(Math.min(4, value + 1))} disabled={value >= 4} aria-label="Add one guest">
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}

interface AvailabilityStatusProps {
  children: string
  tone?: 'available' | 'confirmed'
}

export function AvailabilityStatus({ children, tone = 'available' }: AvailabilityStatusProps) {
  return (
    <p className="availability-status" data-tone={tone} role="status">
      <span aria-hidden="true">✓</span>
      {children}
    </p>
  )
}

export function CalendarDayStates() {
  return (
    <div className="calendar-state-row" aria-label="Calendar date states">
      <span data-state="available">14</span>
      <span data-state="selected">15</span>
      <span data-state="range">16</span>
      <span data-state="unavailable">18</span>
    </div>
  )
}

interface LowlandFieldProps {
  value: string
  onChange: (value: string) => void
}

export function LowlandField({ value, onChange }: LowlandFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <label className="lowland-field tc-no-drag">
      <span>Email</span>
      <input type="email" value={value} onChange={handleChange} placeholder="you@example.com" />
    </label>
  )
}
