import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BadgeCheck, Files, PenLine, Wand2 } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import FontCustomizer from '@/components/FontCustomizer';
import CertificatePreview from '@/components/CertificatePreview';
import GenerateButton from '@/components/GenerateButton';
import { NameData } from '@/lib/excelParser';
import { FontSettings, GenerateOptions, TextBox } from '@/lib/certificateGenerator';

interface Position {
  x: number;
  y: number;
}

const steps = [
  { label: 'Template', icon: Files },
  { label: 'Names', icon: BadgeCheck },
  { label: 'Design', icon: Wand2 },
  { label: 'Export', icon: Award },
];

export default function Index() {
  const [templateImage, setTemplateImage] = useState<string>('');
  const [templateDimensions, setTemplateDimensions] = useState({ width: 0, height: 0 });
  const [names, setNames] = useState<NameData[]>([]);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'Playfair Display',
    size: 64,
    color: '#171717',
    weight: 700,
    letterSpacing: 0,
    align: 'center',
    shadow: false,
    uppercase: false,
    autoFit: true,
  });
  const [position, setPosition] = useState<Position>({ x: 400, y: 300 });
  const [textBox, setTextBox] = useState<TextBox>({ width: 520 });
  const [generateOptions, setGenerateOptions] = useState<GenerateOptions>({
    outputFormat: 'pdf',
    zipName: 'certificates',
    filePrefix: '',
  });

  const handleTemplateUpload = (imageUrl: string, width: number, height: number) => {
    setTemplateImage(imageUrl);
    setTemplateDimensions({ width, height });
    setPosition({ x: width / 2, y: height / 2 });
    setTextBox({ width: Math.max(260, Math.round(width * 0.46)) });
  };

  const completion = useMemo(() => {
    const total = 4;
    const done =
      (templateImage ? 1 : 0) +
      (names.length > 0 ? 1 : 0) +
      (fontSettings.family && fontSettings.size ? 1 : 0) +
      (templateImage && names.length > 0 ? 1 : 0);

    return Math.round((done / total) * 100);
  }, [fontSettings.family, fontSettings.size, names.length, templateImage]);

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#05070d] text-white">
      <div className="studio-background" aria-hidden="true">
        <div className="studio-grid" />
        <div className="studio-beam studio-beam-one" />
        <div className="studio-beam studio-beam-two" />
        <div className="studio-scanline" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <PenLine className="h-5 w-5 text-[#aab2ff]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#aab2ff]">Certificate production desk</p>
              <h1 className="mt-1 max-w-3xl text-3xl font-semibold leading-[1.04] tracking-normal text-white sm:text-5xl">
                Place once. Export the whole batch cleanly.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a9afc3] sm:text-base">
                A sharper workspace for template checks, name placement, typography, and ZIP export.
              </p>
            </div>
          </div>

          <div className="interactive-panel rounded-xl border border-white/10 bg-white/[0.05] p-3 lg:min-w-[360px]">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[#a9afc3]">Setup progress</span>
              <span className="font-medium text-white">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-[#6f7cff]"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const isDone = completion >= ((index + 1) / steps.length) * 100;
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-xs ${
                      isDone
                        ? 'border-[#6f7cff]/40 bg-[#6f7cff]/15 text-white'
                        : 'border-white/10 bg-black/20 text-[#7e8497]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.header>

        <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)_360px]">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-6"
          >
            <FileUploader
              onTemplateUpload={handleTemplateUpload}
              onNamesUpload={setNames}
              templateImage={templateImage}
              names={names}
            />
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="min-w-0"
          >
            <CertificatePreview
              templateImage={templateImage}
              templateWidth={templateDimensions.width}
              templateHeight={templateDimensions.height}
              fontSettings={fontSettings}
              position={position}
              textBox={textBox}
              onPositionChange={setPosition}
              onTextBoxChange={setTextBox}
            />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="space-y-6"
          >
            <FontCustomizer
              fontSettings={fontSettings}
              textBox={textBox}
              generateOptions={generateOptions}
              onFontChange={setFontSettings}
              onTextBoxChange={setTextBox}
              onGenerateOptionsChange={setGenerateOptions}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${templateImage}-${names.length}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <GenerateButton
                  templateImage={templateImage}
                  names={names}
                  position={position}
                  fontSettings={fontSettings}
                  templateWidth={templateDimensions.width}
                  templateHeight={templateDimensions.height}
                  textBox={textBox}
                  options={generateOptions}
                />
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </section>
      </div>
    </main>
  );
}
