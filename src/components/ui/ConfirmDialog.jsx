import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'

export default function ConfirmDialog({
  open,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 py-2 text-sm text-[var(--text-primary)]">
            <span className="flex-1">{message}</span>
            <Button variant={danger ? 'danger' : 'primary'} className="!py-1.5 !px-3 text-xs" onClick={onConfirm}>
              {confirmLabel}
            </Button>
            <Button variant="ghost" className="!py-1.5 !px-3 text-xs" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
