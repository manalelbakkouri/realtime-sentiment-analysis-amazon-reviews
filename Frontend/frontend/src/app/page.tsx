import { ThemeProvider } from "../components/contexts/ThemeContext"
import { ThemeToggle } from "../components/theme-toggle"

export default function Page() {
  return (
    <ThemeProvider>
      <div className="dark:bg-gray-900 dark:text-white min-h-screen">
        <div className="container mx-auto p-4">
          <header className="flex justify-end py-4">
            <ThemeToggle />
          </header>
          <main>
            <h1 className="text-2xl font-bold mb-4">Amazon Reviews Analysis</h1>
            <p>Welcome to the Amazon Reviews Analysis application.</p>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
