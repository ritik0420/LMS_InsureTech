import { type MouseEvent as ReactMouseEvent } from 'react'

/** Material-style ripple at click position for pressable auth controls. */
export function useRipple<T extends HTMLElement>() {
  return (e: ReactMouseEvent<T>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'auth-ripple'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    el.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  }
}
