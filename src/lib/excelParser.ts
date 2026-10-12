import * as XLSX from 'xlsx';

export interface NameData {
  name: string;
  row: number;
}

const HEADER_HINTS = ['name', 'full name', 'student name', 'participant', 'recipient', 'certificate name'];

const normalizeCell = (value: unknown) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const getBestNameColumn = (rows: unknown[][]) => {
  const maxColumns = Math.max(1, ...rows.slice(0, 25).map((row) => row.length));
  const headerRow = rows[0] ?? [];
  const headerIndex = headerRow.findIndex((cell) => HEADER_HINTS.includes(normalizeCell(cell).toLowerCase()));

  if (headerIndex >= 0) return headerIndex;

  let bestColumn = 0;
  let bestScore = -1;

  for (let column = 0; column < maxColumns; column += 1) {
    const score = rows.slice(0, 100).reduce((total, row) => {
      const value = normalizeCell(row[column]);
      if (!value) return total;
      const hasLetters = /[a-zA-Z]/.test(value);
      const isMostlyNumeric = /^[\d\s+().-]+$/.test(value);
      return total + (hasLetters && !isMostlyNumeric ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }

  return bestColumn;
};

export const parseExcelFile = (file: File): Promise<NameData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error('No worksheet found in this file.'));
          return;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as unknown[][];
        const nameColumn = getBestNameColumn(rows);
        const names: NameData[] = [];
        const seen = new Set<string>();

        rows.forEach((row, index) => {
          const name = normalizeCell(row[nameColumn]);
          const lower = name.toLowerCase();

          if (!name || HEADER_HINTS.includes(lower)) return;

          const duplicateKey = lower.replace(/\s+/g, ' ');
          if (seen.has(duplicateKey)) return;
          seen.add(duplicateKey);

          names.push({
            name,
            row: index + 1,
          });
        });

        if (names.length === 0) {
          reject(new Error('No names found. Add a Name column or put names in the first populated text column.'));
          return;
        }

        resolve(names);
      } catch (error) {
        reject(new Error('Failed to parse the file. Please upload a valid .xlsx, .xls, or .csv file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};
