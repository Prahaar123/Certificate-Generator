import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, FileImage, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseExcelFile, NameData } from '@/lib/excelParser';
import { toast } from 'sonner';

interface FileUploaderProps {
  onTemplateUpload: (imageUrl: string, width: number, height: number) => void;
  onNamesUpload: (names: NameData[]) => void;
  templateImage: string | null;
  names: NameData[];
}

const panelClass =
  'interactive-panel rounded-xl border border-white/10 bg-[#0a0d14]/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl';

export default function FileUploader({
  onTemplateUpload,
  onNamesUpload,
  templateImage,
  names,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const sampleNames = useMemo(() => names.slice(0, 6), [names]);

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a JPG, PNG, or WebP image template.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          onTemplateUpload(result, img.naturalWidth, img.naturalHeight);
          toast.success('Template loaded', {
            description: `${img.naturalWidth} x ${img.naturalHeight}px`,
          });
        } else {
          toast.error('Could not read the template dimensions.');
        }
      };

      img.onerror = () => toast.error('Failed to load this image. Try another template file.');
      img.src = result;
    };

    reader.onerror = () => toast.error('Failed to read the template file.');
    reader.readAsDataURL(file);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const parsedNames = await parseExcelFile(file);
      onNamesUpload(parsedNames);
      toast.success(`${parsedNames.length} names loaded`, {
        description: 'Duplicates and header rows were filtered automatically.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse names file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={panelClass}>
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
              <FileImage className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-normal text-white">Template</h2>
              <p className="text-sm text-[#8f96aa]">JPG, PNG, or WebP certificate artwork</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {templateImage ? (
              <motion.div
                key="template-loaded"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white">
                  <img src={templateImage} alt="Certificate template" className="h-44 w-full object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-3 top-3 h-8 w-8"
                    onClick={() => onTemplateUpload('', 0, 0)}
                    aria-label="Remove template"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#cdd2e3]">
                  <BadgeCheck className="h-4 w-4 text-[#6f7cff]" aria-hidden="true" />
                  Template ready for positioning
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="template-empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                <Label htmlFor="template-upload" className="text-sm font-medium text-white">
                  Upload template
                </Label>
                <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-center transition hover:border-[#6f7cff]/60 hover:bg-[#6f7cff]/10">
                  <Upload className="mb-3 h-6 w-6 text-[#9da7ff]" aria-hidden="true" />
                  <span className="text-sm font-medium text-white">Choose certificate image</span>
                  <span className="mt-1 text-xs text-[#8f96aa]">High resolution templates export best</span>
                  <Input
                    id="template-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateUpload}
                    className="sr-only"
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className={panelClass}>
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
              <FileSpreadsheet className="h-4 w-4 text-[#9da7ff]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-normal text-white">Names</h2>
              <p className="text-sm text-[#8f96aa]">Excel or CSV with a name column</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {names.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold tracking-normal text-white">{names.length}</p>
                    <p className="text-sm text-[#8f96aa]">recipients loaded</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onNamesUpload([])}
                    className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sampleNames.map((name) => (
                    <span key={`${name.row}-${name.name}`} className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs text-[#cdd2e3]">
                      {name.name}
                    </span>
                  ))}
                  {names.length > sampleNames.length && (
                    <span className="rounded-md bg-[#6f7cff]/15 px-2.5 py-1 text-xs text-[#dfe2ff]">
                      +{names.length - sampleNames.length} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="excel-upload" className="text-sm font-medium text-white">
                Upload names
              </Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-4 py-4 transition hover:border-[#6f7cff]/60 hover:bg-[#6f7cff]/10">
                <Upload className="h-5 w-5 text-[#9da7ff]" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-white">
                    {isUploading ? 'Reading file...' : 'Choose .xlsx, .xls, or .csv'}
                  </span>
                  <span className="mt-1 block text-xs text-[#8f96aa]">Headers and duplicate names are cleaned up</span>
                </span>
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
