import { ref } from 'vue'
import confetti from 'canvas-confetti'

export function useConfetti() {
  const isActive = ref(false)

  /**
   * Trigger a confetti explosion
   * @param options Optional configuration for the confetti animation
   */
  const triggerConfetti = (options = {}) => {
    isActive.value = true
    
    // Default confetti configuration with festive colors
    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    }
    
    // Merge default options with any provided options
    const mergedOptions = { ...defaultOptions, ...options }
    
    // Fire the confetti
    confetti(mergedOptions)
    
    // Reset active state after animation completes
    setTimeout(() => {
      isActive.value = false
    }, 2000)
  }

  /**
   * Create a more celebratory confetti effect with multiple bursts
   */
  const triggerCelebration = () => {
    isActive.value = true
    
    // Fire multiple confetti bursts in sequence
    const duration = 3000
    const end = Date.now() + duration
    
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval)
        isActive.value = false
        return
      }
      
      // Randomize confetti position
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      })
      
      // Fire from the opposite side too
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      })
    }, 250)
  }

  return {
    isActive,
    triggerConfetti,
    triggerCelebration
  }
}
