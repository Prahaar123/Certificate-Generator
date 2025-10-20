import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateCertificates, FontSettings } from '@/lib/certificateGenerator';
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
}

export default function GenerateButton({
  templateImage,
  names,
  position,
  fontSettings,
  templateWidth,
  templateHeight
}: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = templateImage && names.length > 0 && templateWidth > 0 && templateHeight > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Please upload both a certificate template and names list');
      return;
    }

    setIsGenerating(true);
    try {
      await generateCertificates({
        templateImage,
        names,
        position,
        fontSettings,
        templateWidth,
        templateHeight
      });
      
      toast.success(`Generated ${names.length} certificate${names.length !== 1 ? "s" : ""} successfully 🎉`, {
  description: "Your ZIP file has been downloaded."
});
    } catch (error) {
      console.error('Certificate generation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate certificates');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5" />
          Generate Certificates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          {canGenerate ? (
            <div className="space-y-2">
              <p className="text-sm text-blue-100">
                Ready to generate <strong>{names.length}</strong> certificate{names.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-200">
                All certificates will be downloaded as a ZIP file
              </p>
            </div>
          ) : (
            <p className="text-sm text-blue-100">
              Upload a template and names list to get started
            </p>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full text-white font-semibold"
          style={{ backgroundColor: '#e11d48' }}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Certificates
            </>
          )}
        </Button>

        {canGenerate && (
          <div className="text-xs text-blue-200 space-y-1">
            <p>• Template: {templateWidth} × {templateHeight}px</p>
            <p>• Font: {fontSettings.family}, {fontSettings.size}px</p>
            <p>• Position: {Math.round(position.x)}, {Math.round(position.y)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}