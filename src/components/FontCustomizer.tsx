import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Type } from 'lucide-react';
import { FontSettings } from '@/lib/certificateGenerator';

interface FontCustomizerProps {
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Courier New',
  'Palatino'
];

export default function FontCustomizer({ fontSettings, onFontChange }: FontCustomizerProps) {
  const updateFont = (key: keyof FontSettings, value: string | number) => {
    onFontChange({
      ...fontSettings,
      [key]: value
    });
  };

  return (
    <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Type className="w-5 h-5" />
          Font Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-white">Font Family</Label>
          <Select value={fontSettings.family} onValueChange={(value) => updateFont('family', value)}>
            <SelectTrigger className="bg-transparent border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#1e2a3b' }} className="border-white/30">
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font} className="text-white hover:bg-white/10">
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <Label className="text-white">Font Size: {fontSettings.size}px</Label>
          <Slider
            value={[fontSettings.size]}
            onValueChange={(value) => updateFont('size', value[0])}
            min={12}
            max={120}
            step={1}
            className="w-full"
          />
        </div>

        {/* Font Color */}
        <div className="space-y-2">
          <Label className="text-white">Font Color</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={fontSettings.color}
              onChange={(e) => updateFont('color', e.target.value)}
              className="w-12 h-10 p-1 border-white/30 bg-transparent"
            />
            <Input
              type="text"
              value={fontSettings.color}
              onChange={(e) => updateFont('color', e.target.value)}
              className="flex-1 bg-transparent border-white/30 text-white"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 border rounded-lg border-white/30" style={{ backgroundColor: '#0f182a' }}>
          <Label className="text-white text-sm">Preview:</Label>
          <div
            className="mt-2 text-center"
            style={{
              fontFamily: fontSettings.family,
              fontSize: `${Math.min(fontSettings.size, 32)}px`,
              color: fontSettings.color,
              fontWeight: 'bold'
            }}
          >
            Sample Name
          </div>
        </div>
      </CardContent>
    </Card>
  );
}