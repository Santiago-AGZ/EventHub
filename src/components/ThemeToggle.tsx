import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/lib/theme'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  const cycle = () => {
    const next: Record<string, 'dark' | 'light' | 'system'> = {
      dark: 'light',
      light: 'system',
      system: 'dark',
    }
    setMode(next[mode])
  }

  const icons = {
    dark: <Moon size={18} data-icon="inline-start" />,
    light: <Sun size={18} data-icon="inline-start" />,
    system: <Monitor size={18} data-icon="inline-start" />,
  }

  const labels = {
    dark: 'Oscuro',
    light: 'Claro',
    system: 'Sistema',
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycle}
      aria-label={`Tema: ${labels[mode]}. Click para cambiar`}
    >
      {icons[mode]}
      <span className="hidden sm:inline">{labels[mode]}</span>
    </Button>
  )
}
