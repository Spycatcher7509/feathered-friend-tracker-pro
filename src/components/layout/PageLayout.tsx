import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-nature-50 to-nature-100 p-4 ${className}`}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  )
}

export default PageLayout