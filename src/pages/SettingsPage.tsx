import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccentColorPicker } from '@/components/ui/accent-color-picker';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useThemeStore } from '@/stores/useThemeStore';
import { useToastStore } from '@/stores/useToastStore';
import { useState } from 'react';

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { success, error, warning, info } = useToastStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    setSaving(false);
    success('Settings Saved!', 'Your preferences have been updated.');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-sm font-medium">Theme</h2>
                <div className="flex gap-2" role="group" aria-label="Theme selection">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    aria-pressed={theme === 'light'}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    aria-pressed={theme === 'dark'}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    aria-pressed={theme === 'system'}
                  >
                    System
                  </Button>
                </div>
              </div>
              
              <AccentColorPicker />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Toast Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Test toast notification system</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="default" size="sm" onClick={() => success('Success!', 'Settings saved successfully.')}>
                    Success
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => error('Error!', 'Failed to save settings.')}>
                    Error
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => warning('Warning!', 'Changes will take effect after refresh.')}>
                    Warning
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => info('Info', 'New features are available.')}>
                    Info
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Test loading components</p>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Loading Button</h3>
                  <LoadingButton loading={saving} onClick={handleSave}>
                    Save Settings
                  </LoadingButton>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Loading Spinner</h3>
                  <LoadingSpinner text="Loading..." />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Skeleton Loading</h3>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}