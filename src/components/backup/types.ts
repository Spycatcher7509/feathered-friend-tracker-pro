
export interface BackupSchedule {
  id: string
  created_at: string
  frequency: "daily" | "weekly" | "monthly"
  time_of_day: string
  day_of_week: number | null
  day_of_month: number | null
  operation_type: "backup" | "restore"
  is_active?: boolean
  source_file_id?: string
  updated_at?: string
  user_id?: string
}

export interface BackupOperationsProps {
  isLoading: boolean
  handleBackup: () => void
  handleRestore: () => void
  sendDiscordNotification: (message: string) => Promise<void>
  setShowInstructions: (show: boolean) => void
  showInstructions: boolean
  currentDomain: string
  showDisclaimer: boolean
  setShowDisclaimer: (show: boolean) => void
  operationType: 'backup' | 'restore'
  initiateBackup: () => void
  initiateRestore: () => void
}
