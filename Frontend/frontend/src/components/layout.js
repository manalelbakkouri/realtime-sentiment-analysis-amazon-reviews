import Navbar from "./Navbar"

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4">{children}</div>
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">© 2025 SentiAnalyse. Tous droits réservés.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-purple-600 transition duration-300">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition duration-300">
                Confidentialité
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600 transition duration-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
