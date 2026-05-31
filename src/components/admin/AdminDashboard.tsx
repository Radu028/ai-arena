import { AdminGuard } from '#/components/AdminGuard'
import { AdminDashboardContent } from '#/components/admin/AdminDashboardContent'

export function AdminDashboard() {
  return (
    <div className="shell space-y-16">
      <AdminGuard title="Admin console">
        <AdminDashboardContent />
      </AdminGuard>
    </div>
  )
}
