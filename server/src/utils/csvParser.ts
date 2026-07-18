import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { z } from 'zod';

/**
 * CSV row validation schema for employee import.
 */
const csvRowSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  salary: z.string().transform((val) => parseFloat(val)).pipe(z.number().positive('Salary must be positive')),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export type CsvEmployeeRow = z.infer<typeof csvRowSchema>;

export interface CsvParseResult {
  validRows: CsvEmployeeRow[];
  errors: Array<{ row: number; field: string; message: string }>;
  totalRows: number;
}

/**
 * Parses a CSV buffer into validated employee records.
 * Returns both valid rows and per-row validation errors.
 */
export async function parseCsvBuffer(buffer: Buffer): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    const validRows: CsvEmployeeRow[] = [];
    const errors: Array<{ row: number; field: string; message: string }> = [];
    let rowIndex = 0;

    const stream = Readable.from(buffer);
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        rowIndex++;
        const result = csvRowSchema.safeParse(record);

        if (result.success) {
          validRows.push(result.data);
        } else {
          result.error.issues.forEach((issue) => {
            errors.push({
              row: rowIndex,
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        }
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => {
      resolve({ validRows, errors, totalRows: rowIndex });
    });

    stream.pipe(parser);
  });
}
