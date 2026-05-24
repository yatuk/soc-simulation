import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  open: 'Açık',
  investigating: 'İnceleniyor',
  contained: 'Kontrol Altında',
  closed: 'Kapatıldı',
  pending: 'Bekliyor',
  running: 'Çalışıyor',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
  waiting_approval: 'Onay Bekliyor',
  new: 'Yeni',
  acknowledged: 'Onaylandı',
  resolved: 'Çözüldü',
  normal: 'Normal',
  isolated: 'İzole',
  pending_isolation: 'İzolasyon Bekliyor',
}

interface StatusPillProps {
  status: string
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const label = labels[status] || status
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        status === 'open'            && 'text-status-open            border-status-open/30            bg-status-open/10',
        status === 'investigating'   && 'text-status-investigating   border-status-investigating/30   bg-status-investigating/10',
        status === 'contained'       && 'text-status-contained       border-status-contained/30       bg-status-contained/10',
        status === 'closed'          && 'text-status-closed          border-status-closed/30          bg-status-closed/10',
        status === 'completed'       && 'text-status-completed       border-status-completed/30       bg-status-completed/10',
        status === 'failed'          && 'text-status-failed          border-status-failed/30          bg-status-failed/10',
        status === 'running'         && 'text-status-running         border-status-running/30         bg-status-running/10',
        status === 'pending'         && 'text-status-pending         border-status-pending/30         bg-status-pending/10',
        status === 'isolated'        && 'text-status-failed          border-status-failed/30          bg-status-failed/10',
        !Object.keys(labels).includes(status) && 'text-muted-foreground border-border bg-muted/30',
        className
      )}
      role="status"
      aria-label={`Durum: ${label}`}
    >
      {label}
    </span>
  )
}
