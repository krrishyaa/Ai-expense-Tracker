import { useRef, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'

export function useCountUp(value, options = {}) {
  const { prefix = '', suffix = '', decimals = 0 } = options
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
  const nodeRef = useRef(null)

  const setRef = useCallback(
    (node) => {
      nodeRef.current = node
      inViewRef(node)
    },
    [inViewRef],
  )

  const num = Number(value) || 0
  const displayValue = inView
    ? `${prefix}${num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`
    : `${prefix}${(0).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`

  return {
    ref: setRef,
    inView,
    displayValue,
    end: num,
    prefix,
    suffix,
    decimals,
  }
}
