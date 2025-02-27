
import { ReactNode } from "react"

interface AudioPlayerLayoutProps {
  children: ReactNode
  showProgress?: boolean
}

const AudioPlayerLayout = ({ children, showProgress = true }: AudioPlayerLayoutProps) => {
  return (
    <div className="rounded-xl border bg-gray-50 p-4 space-y-4">
      {children}
    </div>
  )
}

export default AudioPlayerLayout
