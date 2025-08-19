import { Toaster as Sonner } from "sonner"
import { useThemeStore } from "@/stores/useThemeStore"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useThemeStore()

  return (
    <Sonner
      theme={theme === "system" ? "system" : theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
