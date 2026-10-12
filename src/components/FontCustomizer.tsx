import { AlignCenter, AlignLeft, AlignRight, CaseUpper, FileArchive, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { FontSettings, GenerateOptions, TextAlign, TextBox } from '@/lib/certificateGenerator';

interface FontCustomizerProps {
  fontSettings: FontSettings;
  textBox: TextBox;
  generateOptions: GenerateOptions;
  onFontChange: (settings: FontSettings) => void;
  onTextBoxChange: (settings: TextBox) => void;
  onGenerateOptionsChange: (options: GenerateOptions) => void;
}

const FONT_FAMILIES = [
  'Alegreya',
  'Alegreya Sans',
  'Alice',
  'Allura',
  'Almendra',
  'Amiri',
  'Arapey',
  'Archivo',
  'Archivo Black',
  'Arima',
  'Arizonia',
  'Assistant',
  'Baskerville',
  'Bebas Neue',
  'Bitter',
  'Bodoni 72',
  'Bodoni MT',
  'Bree Serif',
  'Cabin',
  'Cardo',
  'Caveat',
  'Chivo',
  'Cinzel',
  'Cinzel Decorative',
  'Cormorant',
  'Cormorant Garamond',
  'Cormorant SC',
  'Courier New',
  'Crimson Pro',
  'Crimson Text',
  'Dancing Script',
  'DM Sans',
  'DM Serif Display',
  'Domine',
  'EB Garamond',
  'Eczar',
  'El Messiri',
  'Elsie',
  'Figtree',
  'Forum',
  'Fraunces',
  'Garamond',
  'Georgia',
  'Gloock',
  'Great Vibes',
  'Helvetica',
  'IBM Plex Sans',
  'IBM Plex Serif',
  'Impact',
  'Inconsolata',
  'Instrument Sans',
  'Josefin Sans',
  'Josefin Slab',
  'Jost',
  'Kalam',
  'Karla',
  'Libre Baskerville',
  'Libre Bodoni',
  'Libre Caslon Display',
  'Libre Caslon Text',
  'Libre Franklin',
  'Lora',
  'Manrope',
  'Marcellus',
  'Merriweather',
  'Montserrat',
  'Mulish',
  'Nunito Sans',
  'Old Standard TT',
  'Open Sans',
  'Orbitron',
  'Oswald',
  'Outfit',
  'Pacifico',
  'Palatino',
  'Parisienne',
  'Petit Formal Script',
  'Philosopher',
  'Playfair Display',
  'Plus Jakarta Sans',
  'Poppins',
  'Prata',
  'PT Sans',
  'PT Serif',
  'Quattrocento',
  'Quattrocento Sans',
  'Quicksand',
  'Raleway',
  'Roboto',
  'Roboto Condensed',
  'Roboto Slab',
  'Rokkitt',
  'Rosarivo',
  'Sacramento',
  'Sanchez',
  'Satisfy',
  'Source Sans 3',
  'Source Serif 4',
  'Space Grotesk',
  'Spectral',
  'Tangerine',
  'Tenor Sans',
  'Times New Roman',
  'Trajan Pro',
  'Ubuntu',
  'Unna',
  'Vollkorn',
  'Work Sans',
  'Yeseva One',
  'Ysabeau',
  'Zilla Slab',
  'Arial',
  'Verdana',
  'Trebuchet MS',
];

const PRESET_COLORS = ['#171717', '#2f241d', '#6b4f1d', '#0f3d2e', '#1e3a8a', '#7f1d1d', '#ffffff'];

const panelClass =
  'interactive-panel rounded-xl border border-white/10 bg-[#0a0d14]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl';

export default function FontCustomizer({
  fontSettings,
  textBox,
  generateOptions,
  onFontChange,
  onTextBoxChange,
  onGenerateOptionsChange,
}: FontCustomizerProps) {
  const updateFont = (key: keyof FontSettings, value: string | number | boolean) => {
    onFontChange({
      ...fontSettings,
      [key]: value,
    });
  };

  const updateOptions = (key: keyof GenerateOptions, value: string) => {
    onGenerateOptionsChange({
      ...generateOptions,
      [key]: value,
    });
  };

  const setAlign = (align: TextAlign) => updateFont('align', align);

  return (
    <section className={panelClass}>
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
            <Type className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-normal text-white">Text styling</h2>
            <p className="text-sm text-[#8f96aa]">Type, spacing, export, and naming controls</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-white">Font family</Label>
          <Select value={fontSettings.family} onValueChange={(value) => updateFont('family', value)}>
            <SelectTrigger className="border-white/15 bg-white/[0.04] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[360px] border-white/10 bg-[#111520] text-white">
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font} className="focus:bg-[#6f7cff]/20 focus:text-white">
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm font-medium text-white">Size</Label>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs tabular-nums text-[#cdd2e3]">
              {fontSettings.size}px
            </span>
          </div>
          <Slider value={[fontSettings.size]} onValueChange={(value) => updateFont('size', value[0])} min={14} max={160} step={1} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">Weight</Label>
            <Select value={String(fontSettings.weight)} onValueChange={(value) => updateFont('weight', Number(value))}>
              <SelectTrigger className="border-white/15 bg-white/[0.04] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111520] text-white">
                {[400, 500, 600, 700, 800].map((weight) => (
                  <SelectItem key={weight} value={String(weight)} className="focus:bg-[#6f7cff]/20 focus:text-white">
                    {weight}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">Output</Label>
            <Select value={generateOptions.outputFormat} onValueChange={(value) => updateOptions('outputFormat', value)}>
              <SelectTrigger className="border-white/15 bg-white/[0.04] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111520] text-white">
                <SelectItem value="pdf" className="focus:bg-[#6f7cff]/20 focus:text-white">PDF</SelectItem>
                <SelectItem value="png" className="focus:bg-[#6f7cff]/20 focus:text-white">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm font-medium text-white">Text area width</Label>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs tabular-nums text-[#cdd2e3]">
              {textBox.width}px
            </span>
          </div>
          <Slider
            value={[textBox.width]}
            onValueChange={(value) => onTextBoxChange({ width: value[0] })}
            min={120}
            max={1400}
            step={10}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-sm font-medium text-white">Letter spacing</Label>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs tabular-nums text-[#cdd2e3]">
              {fontSettings.letterSpacing}px
            </span>
          </div>
          <Slider
            value={[fontSettings.letterSpacing]}
            onValueChange={(value) => updateFont('letterSpacing', value[0])}
            min={0}
            max={12}
            step={0.5}
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium text-white">
            <Palette className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
            Color
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={fontSettings.color}
              onChange={(e) => updateFont('color', e.target.value)}
              className="h-10 w-12 border-white/15 bg-white/[0.04] p-1"
            />
            <Input
              type="text"
              value={fontSettings.color}
              onChange={(e) => updateFont('color', e.target.value)}
              className="border-white/15 bg-white/[0.04] text-white placeholder:text-[#73798d]"
              placeholder="#171717"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="h-7 w-7 rounded-md border border-white/15 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f7cff]"
                style={{ backgroundColor: color }}
                onClick={() => updateFont('color', color)}
                aria-label={`Use ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: 'Left' },
            { value: 'center', icon: AlignCenter, label: 'Center' },
            { value: 'right', icon: AlignRight, label: 'Right' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = fontSettings.align === item.value;
            return (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                className={`border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white ${
                  isActive ? 'border-[#6f7cff]/60 bg-[#6f7cff]/18' : ''
                }`}
                onClick={() => setAlign(item.value as TextAlign)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <label className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm text-white">
              <CaseUpper className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
              Uppercase names
            </span>
            <Switch checked={fontSettings.uppercase} onCheckedChange={(value) => updateFont('uppercase', value)} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white">Auto-fit long names</span>
            <Switch checked={fontSettings.autoFit} onCheckedChange={(value) => updateFont('autoFit', value)} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-white">Subtle text shadow</span>
            <Switch checked={fontSettings.shadow} onCheckedChange={(value) => updateFont('shadow', value)} />
          </label>
        </div>

        <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <Label className="flex items-center gap-2 text-sm font-medium text-white">
            <FileArchive className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
            ZIP settings
          </Label>
          <Input
            value={generateOptions.zipName}
            onChange={(event) => updateOptions('zipName', event.target.value)}
            className="border-white/15 bg-white/[0.04] text-white placeholder:text-[#73798d]"
            placeholder="certificates"
          />
          <Input
            value={generateOptions.filePrefix}
            onChange={(event) => updateOptions('filePrefix', event.target.value)}
            className="border-white/15 bg-white/[0.04] text-white placeholder:text-[#73798d]"
            placeholder="Optional file prefix"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-medium text-[#8f96aa]">Live type sample</p>
          <div
            className="overflow-hidden rounded-md bg-white p-4 text-center"
            style={{
              fontFamily: fontSettings.family,
              fontSize: `${Math.min(fontSettings.size, 34)}px`,
              color: fontSettings.color,
              fontWeight: fontSettings.weight,
              letterSpacing: `${fontSettings.letterSpacing}px`,
              textTransform: fontSettings.uppercase ? 'uppercase' : 'none',
              textShadow: fontSettings.shadow ? '1px 1px 2px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            Sample Name
          </div>
        </div>
      </div>
    </section>
  );
}
