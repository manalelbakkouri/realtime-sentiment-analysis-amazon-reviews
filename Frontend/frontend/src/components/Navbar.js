import { Link, useLocation } from "react-router-dom"

function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <svg
                  className="h-8 w-8 text-purple-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <span className="font-bold text-xl text-purple-700 ml-2">SentiAnalyse</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className={`py-4 px-3 text-gray-700 font-semibold hover:text-purple-600 transition duration-300 ${
                location.pathname === "/" ? "border-b-2 border-purple-600 text-purple-600" : ""
              }`}
            >
              Flux en Temps Réel
            </Link>
            <Link
              to="/dashboard"
              className={`py-4 px-3 text-gray-700 font-semibold hover:text-purple-600 transition duration-300 ${
                location.pathname === "/dashboard" ? "border-b-2 border-purple-600 text-purple-600" : ""
              }`}
            >
              Tableau de Bord
            </Link>
            <div className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
