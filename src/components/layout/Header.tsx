import { Bird } from "lucide-react"
import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-white border-b border-nature-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-nature-800 hover:text-nature-600 transition-colors">
            <Bird className="h-6 w-6" />
            <span className="text-xl font-semibold">BirdWatch</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header