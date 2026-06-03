import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Tooltip({ content, children }) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded-lg whitespace-nowrap bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)] z-50"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
