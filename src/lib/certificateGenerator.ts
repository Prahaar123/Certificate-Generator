import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { NameData } from './excelParser';

export type OutputFormat = 'pdf' | 'png';
export type TextAlign = 'left' | 'center' | 'right';

export interface FontSettings {
  family: string;
  size: number;
  color: string;
  weight: number;
  letterSpacing: number;
  align: TextAlign;
  shadow: boolean;
  uppercase: boolean;
  autoFit: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface TextBox {
  width: number;
}

export interface GenerateOptions {
  outputFormat: OutputFormat;
  zipName: string;
  filePrefix: string;
}

const DEFAULT_OPTIONS: GenerateOptions = {
  outputFormat: 'pdf',
  zipName: 'certificates',
  filePrefix: '',
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load certificate template.'));
    img.src = src;
  });

const sanitizeFilename = (value: string, fallback: string) => {
  const clean = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s._-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 120);

  return clean || fallback;
};

const uniqueFilename = (base: string, extension: string, seen: Map<string, number>) => {
  const key = base.toLowerCase();
  const count = seen.get(key) ?? 0;
  seen.set(key, count + 1);
  return count === 0 ? `${base}.${extension}` : `${base}_${count + 1}.${extension}`;
};

const getTextStartX = (position: Position, textBox: TextBox, align: TextAlign) => {
  if (align === 'left') return position.x - textBox.width / 2;
  if (align === 'right') return position.x + textBox.width / 2;
  return position.x;
};

const drawName = (
  ctx: CanvasRenderingContext2D,
  rawName: string,
  position: Position,
  fontSettings: FontSettings,
  textBox: TextBox
) => {
  const name = fontSettings.uppercase ? rawName.toUpperCase() : rawName;
  let fontSize = fontSettings.size;
  const minSize = Math.max(12, Math.floor(fontSettings.size * 0.62));

  const applyFont = () => {
    ctx.font = `${fontSettings.weight} ${fontSize}px "${fontSettings.family}", Arial, sans-serif`;
  };

  applyFont();

  if (fontSettings.autoFit) {
    while (fontSize > minSize && ctx.measureText(name).width + Math.max(0, name.length - 1) * fontSettings.letterSpacing > textBox.width) {
      fontSize -= 1;
      applyFont();
    }
  }

  ctx.fillStyle = fontSettings.color;
  ctx.textAlign = fontSettings.align;
  ctx.textBaseline = 'middle';

  if (fontSettings.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.26)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  const startX = getTextStartX(position, textBox, fontSettings.align);

  if (fontSettings.letterSpacing === 0 || fontSettings.align !== 'center') {
    ctx.fillText(name, startX, position.y, textBox.width);
    return;
  }

  const characters = Array.from(name);
  const totalWidth =
    characters.reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
    Math.max(0, characters.length - 1) * fontSettings.letterSpacing;

  let currentX = position.x - totalWidth / 2;
  characters.forEach((char) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, currentX + charWidth / 2, position.y);
    currentX += charWidth + fontSettings.letterSpacing;
  });
};

const renderCertificateCanvas = async (
  templateImage: string,
  name: string,
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number,
  textBox: TextBox
) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas is not supported in this browser.');
  }

  const scale = 3;
  canvas.width = templateWidth * scale;
  canvas.height = templateHeight * scale;
  ctx.scale(scale, scale);

  const img = await loadImage(templateImage);
  ctx.drawImage(img, 0, 0, templateWidth, templateHeight);
  drawName(ctx, name, position, fontSettings, textBox);

  return canvas;
};

export const generateCertificatePDF = async (
  templateImage: string,
  name: string,
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number,
  textBox: TextBox
): Promise<Uint8Array> => {
  const canvas = await renderCertificateCanvas(
    templateImage,
    name,
    position,
    fontSettings,
    templateWidth,
    templateHeight,
    textBox
  );

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: templateWidth > templateHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  const pdfBytes = pdf.output('arraybuffer');
  return new Uint8Array(pdfBytes);
};

export const generateCertificatePNG = async (
  templateImage: string,
  name: string,
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number,
  textBox: TextBox
): Promise<Blob> => {
  const canvas = await renderCertificateCanvas(
    templateImage,
    name,
    position,
    fontSettings,
    templateWidth,
    templateHeight,
    textBox
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export PNG certificate.'));
    }, 'image/png');
  });
};

export const generateAllCertificates = async (
  templateImage: string,
  names: NameData[],
  position: Position,
  fontSettings: FontSettings,
  templateWidth: number,
  templateHeight: number,
  textBox: TextBox,
  options: GenerateOptions = DEFAULT_OPTIONS,
  onProgress?: (current: number, total: number, activeName: string) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const seenFilenames = new Map<string, number>();
  const extension = options.outputFormat;

  for (let i = 0; i < names.length; i += 1) {
    const nameData = names[i];
    onProgress?.(i + 1, names.length, nameData.name);

    const baseName = sanitizeFilename(`${options.filePrefix}${nameData.name}`, `certificate_${i + 1}`);
    const filename = uniqueFilename(baseName, extension, seenFilenames);

    if (options.outputFormat === 'png') {
      const pngBlob = await generateCertificatePNG(
        templateImage,
        nameData.name,
        position,
        fontSettings,
        templateWidth,
        templateHeight,
        textBox
      );
      zip.file(filename, pngBlob);
    } else {
      const pdfBytes = await generateCertificatePDF(
        templateImage,
        nameData.name,
        position,
        fontSettings,
        templateWidth,
        templateHeight,
        textBox
      );
      zip.file(filename, pdfBytes);
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
};

export const downloadZip = (blob: Blob, filename: string = 'certificates.zip') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateCertificates = async (params: {
  templateImage: string;
  names: NameData[];
  position: Position;
  fontSettings: FontSettings;
  templateWidth: number;
  templateHeight: number;
  textBox: TextBox;
  options?: GenerateOptions;
  onProgress?: (current: number, total: number, activeName: string) => void;
}) => {
  const {
    templateImage,
    names,
    position,
    fontSettings,
    templateWidth,
    templateHeight,
    textBox,
    options = DEFAULT_OPTIONS,
    onProgress,
  } = params;

  const zipBlob = await generateAllCertificates(
    templateImage,
    names,
    position,
    fontSettings,
    templateWidth,
    templateHeight,
    textBox,
    options,
    onProgress
  );

  downloadZip(zipBlob, options.zipName || 'certificates');
};
