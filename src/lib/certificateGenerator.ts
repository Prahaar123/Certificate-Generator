import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { NameData } from './excelParser';

export interface FontSettings {
  family: string;
  size: number;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export const generateCertificatePDF = async (
  templateImage: string,
  name: string,
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number
): Promise<Uint8Array> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set high DPI for quality (300 DPI equivalent)
    const scale = 3;
    canvas.width = templateWidth * scale;
    canvas.height = templateHeight * scale;
    ctx.scale(scale, scale);
    
    const img = new Image();
    img.onload = () => {
      // Draw the certificate template
      ctx.drawImage(img, 0, 0, templateWidth, templateHeight);
      
      // Set font properties
      ctx.font = `${fontSettings.size}px ${fontSettings.family}`;
      ctx.fillStyle = fontSettings.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Draw the name
      ctx.fillText(name, position.x, position.y);
      
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Calculate PDF dimensions (A4 landscape for certificates)
      const pdf = new jsPDF({
        orientation: templateWidth > templateHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBytes = pdf.output('arraybuffer');
      resolve(new Uint8Array(pdfBytes));
    };
    
    img.src = templateImage;
  });
};

export const generateAllCertificates = async (
  templateImage: string,
  names: NameData[],
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> => {
  const zip = new JSZip();
  
  for (let i = 0; i < names.length; i++) {
    const nameData = names[i];
    onProgress?.(i + 1, names.length);
    
    const pdfBytes = await generateCertificatePDF(
      templateImage,
      nameData.name,
      position,
      fontSettings,
      templateWidth,
      templateHeight
    );
    
    // Clean filename (remove special characters)
    const cleanName = nameData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    zip.file(`${cleanName}.pdf`, pdfBytes);
  }
  
  return zip.generateAsync({ type: 'blob' });
};

export const downloadZip = (blob: Blob, filename: string = 'certificates.zip') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Main function that GenerateButton component expects
export const generateCertificates = async (params: {
  templateImage: string;
  names: NameData[];
  position: Position;
  fontSettings: FontSettings;
  templateWidth: number;
  templateHeight: number;
}) => {
  const { templateImage, names, position, fontSettings, templateWidth, templateHeight } = params;
  
  const zipBlob = await generateAllCertificates(
    templateImage,
    names,
    position,
    fontSettings,
    templateWidth,
    templateHeight
  );
  
  downloadZip(zipBlob, 'certificates.zip');
};