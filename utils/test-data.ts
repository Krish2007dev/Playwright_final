import fs from 'fs';
import path from 'path';

export type CsvRow = Record<string, string>;

function resolveDataPath(filePath: string): string {
  return path.resolve(process.cwd(), filePath);
}

function readTextFile(filePath: string): string {
  const resolvedPath = resolveDataPath(filePath);

  try {
    return fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    throw new Error(
      `Unable to read test data file "${resolvedPath}": ${(error as Error).message}`
    );
  }
}

export function readJson<T>(filePath: string): T {
  const resolvedPath = resolveDataPath(filePath);
  const content = readTextFile(filePath);

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(
      `Unable to parse JSON test data file "${resolvedPath}": ${(error as Error).message}`
    );
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === ',' && !inQuotes) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }

  if (inQuotes) {
    throw new Error('CSV contains an unclosed quoted value');
  }

  values.push(value.trim());
  return values;
}

export function readCsv(filePath: string): CsvRow[] {
  const resolvedPath = resolveDataPath(filePath);
  const lines = readTextFile(filePath)
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  let headers: string[];

  try {
    headers = parseCsvLine(lines[0]);
  } catch (error) {
    throw new Error(
      `Unable to parse CSV header in "${resolvedPath}": ${(error as Error).message}`
    );
  }

  if (headers.length === 0 || headers.some((header) => header.length === 0)) {
    throw new Error(
      `CSV file "${resolvedPath}" must contain non-empty headers`
    );
  }

  if (new Set(headers).size !== headers.length) {
    throw new Error(`CSV file "${resolvedPath}" contains duplicate headers`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    let values: string[];

    try {
      values = parseCsvLine(line);
    } catch (error) {
      throw new Error(
        `Unable to parse CSV row ${rowIndex + 2} in "${resolvedPath}": ${(error as Error).message}`
      );
    }

    if (values.length !== headers.length) {
      throw new Error(
        `CSV row ${rowIndex + 2} in "${resolvedPath}" has ${values.length} values; expected ${headers.length}`
      );
    }

    return headers.reduce<CsvRow>((row, header, columnIndex) => {
      row[header] = values[columnIndex];
      return row;
    }, {});
  });
}
