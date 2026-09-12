import { getLocale } from '#/paraglide/runtime'

class Utils {
  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object')
      return JSON.stringify(value)

    if (Array.isArray(value))
      return `[${value.map((v) => this.stableStringify(v)).join(',')}]`

    const record = value as Record<string, unknown>
    const body = Object.keys(record)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${this.stableStringify(record[key])}`,
      )
      .join(',')
    return `{${body}}`
  }

  private fnv1a32(input: string): string {
    let hash = 0x811c9dc5
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193)
    }
    return (hash >>> 0).toString(16)
  }

  /**
   * Two FNV-1a 32-bit hashes (forward string + reversed string), keys sorted
   * so key order never changes the hash — used to derive a stable
   * idempotency key that survives retries of an unchanged payload.
   */
  idempotencyHash(payload: unknown): string {
    const str = this.stableStringify(payload)
    const forward = this.fnv1a32(str)
    const reversed = this.fnv1a32(str.split('').reverse().join(''))
    return `${forward}-${reversed}`
  }

  /**
   *Generate uuid to be use as keys for component without unique key
   *
   * @returns uuid
   */
  uuid() {
    let dt = new Date().getTime()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = ((dt + Math.random() * 16) % 16) | 0
        dt = Math.floor(dt / 16)
        return (c === 'x' ? r : r && 0x3 | 0x8).toString(16)
      },
    )
    return uuid
  }

  /**
   * `—` rather than "undefined undefined" when the API omits a related user,
   * or half a name when only one part is set.
   */
  fullName(user?: { firstName?: string; lastName?: string }) {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    return name || '—'
  }

  /** Strips everything that is not a digit. */
  digitsOnly(value: string) {
    return value.replace(/\D/g, '')
  }

  /**
   * Renders `689688248` as `689 688 248`. Display only — never send the
   * grouped form to the API.
   */
  groupDigits(digits: string) {
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
  }

  /** Shape check only; the API remains the source of truth. */
  isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
  }

  /**
   * Hides the middle of an identifier so a shoulder-surfer cannot read it back
   * — `689688248` becomes `689 ••• 248`, `raymond@ejara.africa` becomes
   * `r•••••d@ejara.africa`.
   */
  maskIdentifier(value: string) {
    if (this.isEmail(value)) {
      const [local, domain] = value.split('@')
      if (local.length <= 2) return `${local}@${domain}`
      const hidden = '•'.repeat(Math.max(local.length - 2, 1))
      return `${local[0]}${hidden}${local.at(-1)}@${domain}`
    }

    const digits = this.digitsOnly(value)
    if (digits.length <= 6) return digits
    return `${digits.slice(0, 3)} ••• ${digits.slice(-3)}`
  }

  /**
   * Converts a country code to its corresponding flag emoji.
   * Uses regional indicator symbols to construct the flag emoji.
   *
   * @param countryCode - Two-letter ISO country code (e.g., 'US', 'FR', 'JP')
   * @returns Flag emoji for the country code, or white flag (🏳️) if invalid
   */
  countryCodeToFlag(countryCode?: string) {
    // Validate the input to be exactly two characters long and all alphabetic
    if (
      !countryCode ||
      countryCode.length !== 2 ||
      !/^[a-zA-Z]+$/.test(countryCode)
    ) {
      return '🏳️' // White Flag Emoji for unknown or invalid country codes
    }

    // Convert the country code to uppercase to match the regional indicator symbols
    const code = countryCode.toUpperCase()

    // Calculate the offset for the regional indicator symbols
    const offset = 127397

    // Convert each letter in the country code to its corresponding regional indicator symbol
    const flag = Array.from(code)
      .map((letter) => String.fromCodePoint(letter.charCodeAt(0) + offset))
      .join('')

    return flag
  }

  /**
   * `Intl`, not a hand-rolled template: the day/month order and the 12- vs
   * 24-hour clock follow the reader's locale, which is the whole point of
   * shipping the console in two of them.
   */
  toDatetime(date?: string | Date): string {
    if (!date) return '—'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '—'

    return new Intl.DateTimeFormat(getLocale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  /**
   * A business date with no clock on it — a requested pickup day, a delivery
   * date. Same `Intl` treatment as `toDatetime`, so the day/month order follows
   * the reader's locale; `toYYYYMMDD` stays for the API's own wire format.
   */
  toDate(date?: string | Date): string {
    if (!date) return '—'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '—'

    return new Intl.DateTimeFormat(getLocale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  }

  /**
   * The clock alone, for a list already grouped under a day heading. Same
   * `Intl` treatment as the two above, so a reader on the French console gets
   * a 24-hour clock without this having to know that.
   */
  toTime(date?: string | Date): string {
    if (!date) return '—'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '—'

    return new Intl.DateTimeFormat(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  /**
   * A money figure as a plain string, for the few places one has to sit inside
   * a translated sentence. Everywhere else renders `<FormatNumber>` instead.
   */
  toMoney(amount: number, currency?: string): string {
    return new Intl.NumberFormat(getLocale(), {
      currency,
      maximumFractionDigits: 2,
      style: currency ? 'currency' : 'decimal',
    }).format(amount)
  }

  toYYYYMMDD(dateInput: string | Date): string | null {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

    if (isNaN(date.getTime())) return null

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  /**
   * How many whole days ago something happened. Negative dates clamp to 0 —
   * a record cannot have been on file for a negative number of days.
   */
  daysSince(date?: string | Date): number {
    if (!date) return 0
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return 0
    return Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000))
  }

  /**
   * "3 days ago", "last month" — the human half of a timestamp, beside the
   * exact one rather than instead of it.
   *
   * `Intl.RelativeTimeFormat`, not a hand-rolled table: French says "il y a 3
   * jours", and the unit thresholds (a day becomes a month becomes a year)
   * are the reader's convention, not ours to invent.
   */
  toRelative(date?: string | Date): string {
    if (!date) return '—'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return '—'

    const seconds = Math.round((d.getTime() - Date.now()) / 1000)
    const format = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' })

    // Largest unit that still has a whole number in it, so a two-month-old
    // record reads as "2 months ago" rather than "61 days ago".
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['week', 604_800],
      ['day', 86_400],
      ['hour', 3_600],
      ['minute', 60],
    ]

    for (const [unit, size] of units) {
      const value = Math.round(seconds / size)
      if (value !== 0) return format.format(value, unit)
    }

    return format.format(0, 'day')
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
}

export default new Utils()
