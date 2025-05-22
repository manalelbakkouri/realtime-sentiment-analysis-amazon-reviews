import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import RealTimeStream from "./components/RealTimeStream"
import Dashboard from "./components/Dashboard"
import "./App.css"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RealTimeStream />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
