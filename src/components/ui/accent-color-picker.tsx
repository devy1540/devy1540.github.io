import { useThemeStore, type AccentColor } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

const accentColors = [
  { name: 'blue', label: 'Blue', color: 'oklch(65% 0.15 230)' },
  { name: 'green', label: 'Green', color: 'oklch(60% 0.16 142)' },
  { name: 'purple', label: 'Purple', color: 'oklch(62% 0.18 263)' },
  { name: 'orange', label: 'Orange', color: 'oklch(68% 0.18 25)' },
  { name: 'red', label: 'Red', color: 'oklch(62% 0.25 25)' },
  { name: 'pink', label: 'Pink', color: 'oklch(65% 0.20 330)' },
  { name: 'gray', label: 'Gray', color: 'oklch(45% 0.02 0)' },
  { name: 'black', label: 'Black', color: 'oklch(20% 0 0)' },
] as const;

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Accent Color</h2>
      <div className="flex flex-wrap gap-2">
        {accentColors.map((color) => (
          <div
            key={color.name}
            className={cn(
              'flex items-center gap-2 cursor-pointer p-2 rounded-md border transition-all hover:scale-105',
              accentColor === color.name 
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' 
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => setAccentColor(color.name as AccentColor)}
          >
            <div 
              className="w-4 h-4 rounded-full border border-border/50"
              style={{ backgroundColor: color.color }}
            />
            <span className="text-sm font-medium">{color.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Choose an accent color to personalize your experience
      </p>
    </div>
  );
}