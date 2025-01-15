import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
  className?: string
  header?: ReactNode
}

const PageLayout = ({ children, className = "", header }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-nature-50 to-nature-100 ${className}`}>
      {header}
      <main className="container mx-auto px-4 py-6 animate-fadeIn">
        {children}
      </main>
    </div>
  )
}

export default PageLayout