import { useMemo, useState } from 'react';
import { Archive, CheckCircle2, Download, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateCertificates, FontSettings, GenerateOptions, TextBox } from '@/lib/certificateGenerator';
import { NameData } from '@/lib/excelParser';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface GenerateButtonProps {
  templateImage: string;
  names: NameData[];
  position: Position;
  fontSettings: FontSettings;
  templateWidth: number;
  templateHeight: number;
  textBox: TextBox;
  options: GenerateOptions;
}

const panelClass =
  'interactive-panel rounded-xl border border-white/10 bg-[#0a0d14]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl';

export default function GenerateButton({
  templateImage,
  names,
  position,
  fontSettings,
  templateWidth,
  templateHeight,
  textBox,
  options,
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeName, setActiveName] = useState('');

  const canGenerate = Boolean(templateImage && names.length > 0 && templateWidth > 0 && templateHeight > 0);
  const outputLabel = options.outputFormat.toUpperCase();

  const readiness = useMemo(
    () => [
      { label: 'Template', done: Boolean(templateImage) },
      { label: 'Names', done: names.length > 0 },
      { label: 'Position', done: templateWidth > 0 && templateHeight > 0 },
    ],
    [names.length, templateHeight, templateImage, templateWidth]
  );

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Upload a template and names list before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActiveName('');

    try {
      await generateCertificates({
        templateImage,
        names,
        position,
        fontSettings,
        templateWidth,
        templateHeight,
        textBox,
        options,
        onProgress: (current, total, name) => {
          setProgress(Math.round((current / total) * 100));
          setActiveName(name);
        },
      });

      toast.success(`Generated ${names.length} certificate${names.length !== 1 ? 's' : ''}`, {
        description: `${options.zipName || 'certificates'}.zip has been downloaded.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate certificates.');
    } finally {
      setIsGenerating(false);
      setActiveName('');
    }
  };

  return (
    <section className={panelClass}>
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
            <Archive className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-normal text-white">Export batch</h2>
            <p className="text-sm text-[#8f96aa]">ZIP with one file per recipient</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-2">
          {readiness.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 text-center text-xs ${
                item.done ? 'border-[#6f7cff]/40 bg-[#6f7cff]/15 text-white' : 'border-white/10 bg-black/20 text-[#7e8497]'
              }`}
            >
              <CheckCircle2 className={`mx-auto mb-1 h-4 w-4 ${item.done ? 'text-[#9da7ff]' : 'text-[#565d70]'}`} aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[#8f96aa]">Recipients</span>
            <span className="font-medium tabular-nums text-white">{names.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-[#8f96aa]">Format</span>
            <span className="font-medium text-white">{outputLabel}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-[#8f96aa]">ZIP name</span>
            <span className="max-w-36 truncate font-medium text-white">{options.zipName || 'certificates'}.zip</span>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2 rounded-lg border border-[#6f7cff]/30 bg-[#6f7cff]/10 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white">Generating {activeName}</span>
              <span className="tabular-nums text-[#dfe2ff]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="h-12 w-full bg-[#6f7cff] text-sm font-semibold text-white hover:bg-[#8791ff]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Building ZIP
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Generate certificates
            </>
          )}
        </Button>

        <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-[#a9afc3]">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#9da7ff]" aria-hidden="true" />
          Long names auto-fit inside the selected text area, and duplicate filenames get numbered automatically.
        </div>
      </div>
    </section>
  );
}
