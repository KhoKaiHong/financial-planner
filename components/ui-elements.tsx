import type React from "react"
import { View, TouchableOpacity, type ViewStyle, type TextStyle } from "react-native"
import { Text } from "~/components/ui/text"

export const Card = ({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
}) => {
  const Component = onPress ? TouchableOpacity : View
  return (
    <Component
      onPress={onPress}
      className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-4"
      style={style}
    >
      {children}
    </Component>
  )
}

export const SectionTitle = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: TextStyle
}) => (
  <Text className="text-lg font-semibold text-foreground mb-3" style={style}>
    {children}
  </Text>
)

export const Badge = ({
  label,
  color = "indigo",
}: {
  label: string
  color?: "indigo" | "green" | "red" | "yellow" | "blue"
}) => {
  const colorClasses = {
    indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
    green: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    red: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  }

  return (
    <View className={`px-2 py-1 rounded-full ${colorClasses[color]}`}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  )
}

export const ProgressBar = ({
  progress,
  color = "indigo",
  height = 8,
}: {
  progress: number
  color?: "indigo" | "green" | "red" | "yellow" | "blue"
  height?: number
}) => {
  const colorClasses = {
    indigo: "bg-indigo-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  }

  return (
    <View className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden" style={{ height }}>
      <View
        className={`h-full rounded-full ${colorClasses[color]}`}
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </View>
  )
}

export const Button = ({
  children,
  onPress,
  variant = "primary",
  fullWidth = false,
  size = "md",
  disabled = false,
  className, // ✅ Add this line
}: {
  children: React.ReactNode
  onPress?: () => void
  variant?: "primary" | "secondary" | "outline" | "destructive"
  fullWidth?: boolean
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string // ✅ Add this!
}) => {
  const variantClasses = {
    primary: "bg-indigo-600 dark:bg-indigo-500 text-white",
    secondary: "bg-gray-200 dark:bg-zinc-700 text-foreground",
    outline: "bg-transparent border border-gray-300 dark:border-zinc-700 text-foreground",
    destructive: "bg-red-600 dark:bg-red-500 text-white",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-2.5 text-lg",
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""} base-styles ${className ?? ""}`}
    >
      <Text
        className={`font-medium text-center ${variant === "outline" ? "text-foreground" : variant === "secondary" ? "text-foreground" : "text-white"}`}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

export const Divider = () => <View className="h-px bg-gray-200 dark:bg-zinc-800 my-4" />