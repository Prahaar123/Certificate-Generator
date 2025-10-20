import * as XLSX from 'xlsx';

export interface NameData {
  name: string;
  row: number;
}

export const parseExcelFile = (file: File): Promise<NameData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        
        // Extract names from the first column, skip empty rows
        const names: NameData[] = [];
        jsonData.forEach((row: unknown[], index) => {
          if (row[0] && typeof row[0] === 'string' && row[0].trim()) {
            names.push({
              name: row[0].trim(),
              row: index + 1
            });
          }
        });
        
        if (names.length === 0) {
          reject(new Error('No names found in the Excel file. Please ensure names are in the first column.'));
          return;
        }
        
        resolve(names);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it\'s a valid Excel file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};