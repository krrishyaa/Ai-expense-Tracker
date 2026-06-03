import toast from 'react-hot-toast'
import RoastToast from '../components/ui/RoastToast'

export function fireRoastNotification(roast, categoryName, spent, budget) {
  toast.custom(
    (t) => (
      <RoastToast
        t={t}
        roast={roast}
        categoryName={categoryName}
        spent={spent}
        budget={budget}
      />
    ),
    { duration: 7000, position: 'bottom-right' },
  )

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification('Budget Roasted', {
        body: roast,
        icon: '/favicon.ico',
      })
    } catch {
      /* ignore */
    }
  }
}
