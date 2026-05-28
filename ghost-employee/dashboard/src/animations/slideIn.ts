import gsap from 'gsap'

/**
 * Slide + fade in a batch of elements from below.
 * @param elements - NodeList or array of DOM elements
 * @param stagger - Stagger delay in seconds (default 0.05)
 */
export function slideInBatch(
  elements: Element[] | NodeListOf<Element>,
  stagger = 0.05,
  fromY = 16
): void {
  gsap.from(elements, {
    y: fromY,
    opacity: 0,
    duration: 0.35,
    stagger,
    ease: 'power2.out',
  })
}

/**
 * Slide + fade in a single element.
 */
export function slideIn(element: Element | null, fromY = 16, delay = 0): void {
  if (!element) return
  gsap.from(element, {
    y: fromY,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out',
    delay,
  })
}

/**
 * Fade labels out quickly (sidebar collapse).
 */
export function fadeOut(elements: Element[] | NodeListOf<Element>, duration = 0.15): void {
  gsap.to(elements, { opacity: 0, duration, ease: 'power1.in' })
}

/**
 * Fade labels in (sidebar expand).
 */
export function fadeIn(elements: Element[] | NodeListOf<Element>, duration = 0.2): void {
  gsap.to(elements, { opacity: 1, duration, ease: 'power1.out' })
}

/**
 * Elastic scale bounce — used on ghost avatar after save.
 */
export function elasticScale(element: Element | null): void {
  if (!element) return
  gsap.fromTo(
    element,
    { scale: 0.8 },
    { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }
  )
}

/**
 * Infinite pulse loop for status dot.
 */
export function pulseDot(element: Element | null): gsap.core.Tween | null {
  if (!element) return null
  return gsap.to(element, {
    scale: 1.4,
    opacity: 0.4,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}
