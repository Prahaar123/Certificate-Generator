import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import FontCustomizer from '@/components/FontCustomizer';
import CertificatePreview from '@/components/CertificatePreview';
import GenerateButton from '@/components/GenerateButton';
import { NameData } from '@/lib/excelParser';
import { FontSettings } from '@/lib/certificateGenerator';

interface Position {
  x: number;
  y: number;
}

export default function Index() {
  const [templateImage, setTemplateImage] = useState<string>('');
  const [templateDimensions, setTemplateDimensions] = useState({ width: 0, height: 0 });
  const [names, setNames] = useState<NameData[]>([]);
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'Arial',
    size: 48,
    color: '#000000'
  });
  const [position, setPosition] = useState<Position>({ x: 400, y: 300 });

  const handleTemplateUpload = (imageUrl: string, width: number, height: number) => {
    setTemplateImage(imageUrl);
    setTemplateDimensions({ width, height });
    // Reset position to center when new template is uploaded
    setPosition({ x: width / 2, y: height / 2 });
  };

  const handleNamesUpload = (namesList: NameData[]) => {
    setNames(namesList);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f182a' }}>
      {/* Animated Background Squares */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 bg-white/20 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 100 + 50}px`,
              borderRadius: `${Math.random() * 10}px`,
              animation: `float-down ${Math.random() * 20 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Certificate Generator
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Upload your certificate template and names list, customize the font, position the text, 
              and generate high-quality PDF certificates in bulk.
            </p>
          </div>

          {/* File Upload Section */}
          <FileUploader
            onTemplateUpload={handleTemplateUpload}
            onNamesUpload={handleNamesUpload}
            templateImage={templateImage}
            names={names}
          />

          {/* Configuration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Font Customizer */}
            <div className="lg:col-span-1">
              <FontCustomizer
                fontSettings={fontSettings}
                onFontChange={setFontSettings}
              />
            </div>

            {/* Certificate Preview */}
            <div className="lg:col-span-2">
              <CertificatePreview
                templateImage={templateImage}
                templateWidth={templateDimensions.width}
                templateHeight={templateDimensions.height}
                fontSettings={fontSettings}
                position={position}
                onPositionChange={setPosition}
              />
            </div>
          </div>

          {/* Generate Section */}
          <div className="max-w-md mx-auto">
            <GenerateButton
              templateImage={templateImage}
              names={names}
              position={position}
              fontSettings={fontSettings}
              templateWidth={templateDimensions.width}
              templateHeight={templateDimensions.height}
            />
          </div>
        </div>
      </div>

    

      <style>{`
        @keyframes float-down {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}