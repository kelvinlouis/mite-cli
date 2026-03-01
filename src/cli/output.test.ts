import {
  truncateCell,
  formatUsersTable,
  formatCustomersTable,
  formatProjectsTable,
  formatServicesTable,
  formatSummaryTable,
  formatEntriesTable,
  formatConfigOutput,
} from './output.js';

describe('truncateCell', () => {
  it('returns EMPTY_CELL for empty string', () => {
    expect(truncateCell('')).toBe('-');
  });

  it('collapses newlines to spaces', () => {
    expect(truncateCell('line1\nline2')).toBe('line1 line2');
  });

  it('escapes pipe characters', () => {
    expect(truncateCell('a|b')).toBe('a\\|b');
  });

  it('truncates long strings', () => {
    const long = 'a'.repeat(100);
    const result = truncateCell(long);
    expect(result.length).toBe(80);
    expect(result.endsWith('...')).toBe(true);
  });

  it('preserves short strings', () => {
    expect(truncateCell('hello')).toBe('hello');
  });
});

describe('formatUsersTable', () => {
  it('formats users as markdown table', () => {
    const result = formatUsersTable([
      { id: 1, name: 'HB', role: 'admin', archived: false },
      { id: 2, name: 'KL', role: 'time_tracker', archived: true },
    ]);

    expect(result).toContain('| ID | Name | Role | Archived |');
    expect(result).toContain('| 1 | HB | admin | no |');
    expect(result).toContain('| 2 | KL | time_tracker | yes |');
  });
});

describe('formatCustomersTable', () => {
  it('formats customers as markdown table', () => {
    const result = formatCustomersTable([{ id: 100, name: 'ACME', archived: false }]);

    expect(result).toContain('| ID | Name | Archived |');
    expect(result).toContain('| 100 | ACME | no |');
  });
});

describe('formatProjectsTable', () => {
  it('formats projects as markdown table', () => {
    const result = formatProjectsTable([
      { id: 200, name: 'SS', customer_id: 100, customer_name: 'ACME', archived: false },
    ]);

    expect(result).toContain('| ID | Name | Customer | Archived |');
    expect(result).toContain('| 200 | SS | ACME | no |');
  });
});

describe('formatServicesTable', () => {
  it('formats services as markdown table', () => {
    const result = formatServicesTable([
      {
        id: 30,
        name: 'Development',
        note: '',
        hourly_rate: null,
        archived: false,
        billable: true,
        created_at: '',
        updated_at: '',
      },
    ]);

    expect(result).toContain('| ID | Name | Billable | Archived |');
    expect(result).toContain('| 30 | Development | yes | no |');
  });
});

describe('formatSummaryTable', () => {
  it('formats grouped summary with default fields', () => {
    const result = formatSummaryTable(
      [
        { minutes: 480, user_name: 'HB', project_name: 'SS', service_name: 'Development' },
        { minutes: 120, user_name: 'KL', project_name: 'WEB', service_name: 'Design' },
      ],
      ['user', 'project', 'service'],
    );

    expect(result).toContain('| User | Project | Service | Hours |');
    expect(result).toContain('| HB | SS | Development | 8.00 |');
    expect(result).toContain('| KL | WEB | Design | 2.00 |');
    expect(result).toContain('**Total**');
    expect(result).toContain('**10.00**');
  });

  it('formats with customer and project fields only', () => {
    const result = formatSummaryTable(
      [
        { minutes: 240, customer_name: 'ACME', project_name: 'SS' },
        { minutes: 60, customer_name: 'BIS', project_name: 'WEB' },
      ],
      ['customer', 'project'],
    );

    expect(result).toContain('| Customer | Project | Hours |');
    expect(result).toContain('| ACME | SS | 4.00 |');
    expect(result).toContain('| BIS | WEB | 1.00 |');
    expect(result).toContain('**5.00**');
  });

  it('shows dash for missing field values', () => {
    const result = formatSummaryTable([{ minutes: 60, user_name: 'HB' }], ['user', 'project']);

    expect(result).toContain('| User | Project | Hours |');
    expect(result).toContain('| HB | - | 1.00 |');
  });

  it('formats with a single group field', () => {
    const result = formatSummaryTable([{ minutes: 300, service_name: 'Dev' }], ['service']);

    expect(result).toContain('| Service | Hours |');
    expect(result).toContain('| Dev | 5.00 |');
    expect(result).toContain('**Total**');
    expect(result).toContain('**5.00**');
  });
});

describe('formatEntriesTable', () => {
  it('formats time entries with total', () => {
    const result = formatEntriesTable([
      {
        id: 1,
        minutes: 120,
        date_at: '2024-01-15',
        note: 'Did work',
        billable: true,
        locked: false,
        user_id: 1,
        user_name: 'HB',
        project_id: 200,
        project_name: 'SS',
        customer_id: 100,
        customer_name: 'ACME',
        service_id: 30,
        service_name: 'Development',
      },
    ]);

    expect(result).toContain('| Date | Customer | Project | Service | Note | Hours |');
    expect(result).toContain('| 2024-01-15 | ACME | SS | Development | Did work | 2.00 |');
    expect(result).toContain('**Total**');
    expect(result).toContain('**2.00**');
  });
});

describe('formatConfigOutput', () => {
  it('formats config as JSON', () => {
    const result = formatConfigOutput({ apiKey: 'abcd****', account: 'yooapps' });
    expect(result).toContain('"apiKey": "abcd****"');
    expect(result).toContain('"account": "yooapps"');
  });
});
