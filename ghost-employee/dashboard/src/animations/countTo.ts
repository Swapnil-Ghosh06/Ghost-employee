import gsap from 'gsap'

/**
 * Animates a numeric value from 0 to target using GSAP.
 * @param target - The DOM element whose innerHTML will be updated
 * @param endValue - The final numeric value
 * @param duration - Animation duration in seconds
 * @param formatter - Optional formatter function
 */
export function animateCountTo(
  target: HTMLElement | null,
  endValue: number,
  duration = 1.5,
  formatter: (n: number) => string = (n) => Math.round(n).toString()
): void {
  if (!target) return
  const obj = { val: 0 }
  gsap.to(obj, {
    val: endValue,
    duration,
    ease: 'power2.out',
    onUpdate() {
      target.innerHTML = formatter(obj.val)
    },
  })
}
