import { AdminGuard } from '#/components/AdminGuard'
import { AdminSessionDetailContent } from '#/components/admin/AdminSessionDetailContent'

export function AdminSessionDetailPage() {
  return (
    <div className="shell space-y-12">
      <AdminGuard title="Session controls">
        <AdminSessionDetailContent />
      </AdminGuard>
    </div>
  )
}
