"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

type NotificationType = "success" | "error" | "info"

interface NotificationProps {
  type: NotificationType
  message: string
  duration?: number
  onClose?: () => void
}

const NotificationToast = ({ type, message, duration = 5000, onClose }: NotificationProps) => {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)

    // Animation de la barre de progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0
        return prev - 100 / (duration / 100)
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, onClose])

  if (!visible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-danger" />
      case "info":
        return <Info className="h-5 w-5 text-info" />
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "bg-success"
      case "error":
        return "bg-danger"
      case "info":
        return "bg-info"
    }
  }

  return (
    <div className="notification">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${getProgressColor()}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

export default NotificationToast
