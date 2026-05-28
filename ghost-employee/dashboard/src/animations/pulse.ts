import gsap from 'gsap'

/**
 * Looping GSAP pulse for the online status dot.
 */
export function pulseLoop(element: Element | null): gsap.core.Tween | null {
  if (!element) return null
  return gsap.to(element, {
    scale: 1.5,
    opacity: 0.35,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

/**
 * Ripple fade for the LIVE badge green dot.
 */
export function livePulse(element: Element | null): gsap.core.Tween | null {
  if (!element) return null
  return gsap.to(element, {
    boxShadow: '0 0 0 6px rgba(34,197,94,0)',
    duration: 1.2,
    repeat: -1,
    ease: 'power2.out',
  })
}
