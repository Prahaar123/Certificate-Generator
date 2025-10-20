import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileImage, FileSpreadsheet, X } from 'lucide-react';
import { parseExcelFile, NameData } from '@/lib/excelParser';
import { toast } from 'sonner';

interface FileUploaderProps {
  onTemplateUpload: (imageUrl: string, width: number, height: number) => void;
  onNamesUpload: (names: NameData[]) => void;
  templateImage: string | null;
  names: NameData[];
}

export default function FileUploader({ 
  onTemplateUpload, 
  onNamesUpload, 
  templateImage, 
  names 
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('FileReader result length:', result?.length);
      
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          src: result.substring(0, 50) + '...'
        });
        
        // Ensure we have valid dimensions
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          onTemplateUpload(result, img.naturalWidth, img.naturalHeight);
          toast.success('Certificate template uploaded successfully');
        } else {
          console.error('Invalid image dimensions');
          toast.error('Invalid image file - could not read dimensions');
        }
      };
      
      img.onerror = (error) => {
        console.error('Image load error:', error);
        toast.error('Failed to load image. Please try a different file.');
      };
      
      img.src = result;
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Failed to read the file.');
    };
    
    reader.readAsDataURL(file);
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const names = await parseExcelFile(file);
      onNamesUpload(names);
      toast.success(`Successfully loaded ${names.length} names from Excel file`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse Excel file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearTemplate = () => {
    onTemplateUpload('', 0, 0);
  };

  const clearNames = () => {
    onNamesUpload([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileImage className="w-5 h-5" />
            Certificate Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templateImage ? (
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={templateImage} 
                  alt="Certificate template" 
                  className="w-full h-32 object-contain border rounded-lg bg-gray-50"
                  onLoad={() => console.log('Thumbnail loaded successfully')}
                  onError={() => console.error('Thumbnail failed to load')}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearTemplate}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-blue-100">Template uploaded successfully</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="template-upload" className="text-white">Upload Certificate Template</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="template-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateUpload}
                  className="flex-1 bg-transparent border-white/30 text-white"
                />
                <Upload className="w-5 h-5 text-blue-100" />
              </div>
              <p className="text-sm text-blue-100">
                Upload a high-quality image of your certificate template (JPG, PNG, etc.)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#1e2a3b' }} className="border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileSpreadsheet className="w-5 h-5" />
            Names List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {names.length > 0 ? (
            <div className="space-y-3">
              <div className="p-3 border rounded-lg border-white/30" style={{ backgroundColor: '#0f182a' }}>
                <p className="font-medium text-white">{names.length} names loaded</p>
                <div className="mt-2 max-h-24 overflow-y-auto">
                  <p className="text-sm text-blue-100">
                    {names.slice(0, 3).map(n => n.name).join(', ')}
                    {names.length > 3 && ` and ${names.length - 3} more...`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearNames} className="border-white/30 text-white hover:bg-white/10">
                <X className="w-4 h-4 mr-2" />
                Clear Names
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="excel-upload" className="text-white">Upload Excel File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  disabled={isUploading}
                  className="flex-1 bg-transparent border-white/30 text-white"
                />
                <Upload className="w-5 h-5 text-blue-100" />
              </div>
              <p className="text-sm text-blue-100">
                Upload an Excel file with names in the first column
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}