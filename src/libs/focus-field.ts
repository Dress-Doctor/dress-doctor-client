/**
 * Moves focus to the first usable control called `name` inside `form` — the
 * first wrong answer after a failed submit, so a keyboard or screen reader
 * visitor lands on it instead of having to look for it.
 */
export function focusField(form: HTMLFormElement, name: string) {
  form.querySelector<HTMLElement>(`[name="${name}"]:not(:disabled)`)?.focus()
}
