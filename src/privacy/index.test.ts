import { vi, beforeEach } from 'vitest';

const mockAbbreviateUser = vi.fn();
const mockAbbreviateCustomer = vi.fn();
const mockAbbreviateProject = vi.fn();

vi.mock('../config/index.js', () => ({
  config: {
    abbreviateUser: mockAbbreviateUser,
    abbreviateCustomer: mockAbbreviateCustomer,
    abbreviateProject: mockAbbreviateProject,
  },
}));

const {
  sanitizeTimeEntry,
  sanitizeTimeEntryGroup,
  sanitizeUser,
  sanitizeCustomer,
  sanitizeProject,
} = await import('./index.js');

describe('privacy', () => {
  beforeEach(() => {
    mockAbbreviateUser.mockReset();
    mockAbbreviateCustomer.mockReset();
    mockAbbreviateProject.mockReset();
  });

  describe('sanitizeTimeEntry', () => {
    const createRawTimeEntry = () => ({
      id: 1,
      minutes: 120,
      date_at: '2024-01-15',
      note: 'Did work',
      billable: true,
      locked: false,
      revenue: 500.0,
      hourly_rate: 100,
      user_id: 219528,
      user_name: 'Real Name',
      project_id: 88309,
      project_name: 'Secret Project',
      customer_id: 179138,
      customer_name: 'Secret Customer',
      service_id: 123,
      service_name: 'Software Engineering',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
    });

    it('replaces user name with abbreviation', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result.user_name).toBe('HB');
    });

    it('replaces customer name with abbreviation', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result.customer_name).toBe('ACME');
    });

    it('replaces project name with abbreviation', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result.project_name).toBe('SS');
    });

    it('preserves service name', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result.service_name).toBe('Software Engineering');
    });

    it('strips revenue', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result).not.toHaveProperty('revenue');
    });

    it('strips hourly rate', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result).not.toHaveProperty('hourly_rate');
    });

    it('strips created_at', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result).not.toHaveProperty('created_at');
    });

    it('strips updated_at', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      mockAbbreviateProject.mockReturnValue('SS');

      const result = sanitizeTimeEntry(createRawTimeEntry());
      expect(result).not.toHaveProperty('updated_at');
    });

    it('uses real names when useRealNames is true', () => {
      const result = sanitizeTimeEntry(createRawTimeEntry(), { useRealNames: true });
      expect(result.user_name).toBe('Real Name');
      expect(result.project_name).toBe('Secret Project');
      expect(result.customer_name).toBe('Secret Customer');
      expect(mockAbbreviateUser).not.toHaveBeenCalled();
      expect(mockAbbreviateProject).not.toHaveBeenCalled();
      expect(mockAbbreviateCustomer).not.toHaveBeenCalled();
    });

    it('still strips financial fields when useRealNames is true', () => {
      const result = sanitizeTimeEntry(createRawTimeEntry(), { useRealNames: true });
      expect(result).not.toHaveProperty('revenue');
      expect(result).not.toHaveProperty('hourly_rate');
    });

    it('handles null project and customer with useRealNames', () => {
      const raw = {
        ...createRawTimeEntry(),
        project_id: null,
        project_name: '',
        customer_id: null,
        customer_name: '',
      };
      const result = sanitizeTimeEntry(raw, { useRealNames: true });
      expect(result.project_name).toBe('-');
      expect(result.customer_name).toBe('-');
    });

    it('handles null project and customer', () => {
      mockAbbreviateUser.mockReturnValue('HB');

      const raw = {
        id: 2,
        minutes: 60,
        date_at: '2024-01-15',
        note: '',
        billable: false,
        locked: false,
        revenue: null,
        hourly_rate: 0,
        user_id: 219528,
        user_name: 'Real Name',
        project_id: null,
        project_name: '',
        customer_id: null,
        customer_name: '',
        service_id: null,
        service_name: '',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = sanitizeTimeEntry(raw);
      expect(result.project_name).toBe('-');
      expect(result.customer_name).toBe('-');
    });
  });

  describe('sanitizeTimeEntryGroup', () => {
    const createRawGroup = () => ({
      minutes: 480,
      revenue: 1000,
      user_id: 1,
      user_name: 'Real User',
      project_id: 2,
      project_name: 'Real Project',
      service_id: 3,
      service_name: 'Development',
      customer_id: 4,
      customer_name: 'Real Customer',
    });

    it('abbreviates group user name', () => {
      mockAbbreviateUser.mockReturnValue('KL');
      mockAbbreviateProject.mockReturnValue('WEB');
      mockAbbreviateCustomer.mockReturnValue('BIS');

      const result = sanitizeTimeEntryGroup(createRawGroup());
      expect(result.user_name).toBe('KL');
    });

    it('abbreviates group project name', () => {
      mockAbbreviateUser.mockReturnValue('KL');
      mockAbbreviateProject.mockReturnValue('WEB');
      mockAbbreviateCustomer.mockReturnValue('BIS');

      const result = sanitizeTimeEntryGroup(createRawGroup());
      expect(result.project_name).toBe('WEB');
    });

    it('preserves group service name', () => {
      mockAbbreviateUser.mockReturnValue('KL');
      mockAbbreviateProject.mockReturnValue('WEB');
      mockAbbreviateCustomer.mockReturnValue('BIS');

      const result = sanitizeTimeEntryGroup(createRawGroup());
      expect(result.service_name).toBe('Development');
    });

    it('abbreviates group customer name', () => {
      mockAbbreviateUser.mockReturnValue('KL');
      mockAbbreviateProject.mockReturnValue('WEB');
      mockAbbreviateCustomer.mockReturnValue('BIS');

      const result = sanitizeTimeEntryGroup(createRawGroup());
      expect(result.customer_name).toBe('BIS');
    });

    it('strips group revenue', () => {
      mockAbbreviateUser.mockReturnValue('KL');
      mockAbbreviateProject.mockReturnValue('WEB');
      mockAbbreviateCustomer.mockReturnValue('BIS');

      const result = sanitizeTimeEntryGroup(createRawGroup());
      expect(result).not.toHaveProperty('revenue');
    });

    it('uses real names when useRealNames is true', () => {
      const result = sanitizeTimeEntryGroup(createRawGroup(), { useRealNames: true });
      expect(result.user_name).toBe('Real User');
      expect(result.project_name).toBe('Real Project');
      expect(result.customer_name).toBe('Real Customer');
      expect(mockAbbreviateUser).not.toHaveBeenCalled();
      expect(mockAbbreviateProject).not.toHaveBeenCalled();
      expect(mockAbbreviateCustomer).not.toHaveBeenCalled();
    });

    it('still strips revenue when useRealNames is true', () => {
      const result = sanitizeTimeEntryGroup(createRawGroup(), { useRealNames: true });
      expect(result).not.toHaveProperty('revenue');
    });
  });

  describe('sanitizeUser', () => {
    const createRawUser = () => ({
      id: 219528,
      name: 'Real Name',
      email: 'real@email.com',
      note: '',
      archived: false,
      role: 'admin',
      language: 'en',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    it('replaces user name', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      const result = sanitizeUser(createRawUser());
      expect(result.name).toBe('HB');
    });

    it('uses real name when useRealNames is true', () => {
      const result = sanitizeUser(createRawUser(), { useRealNames: true });
      expect(result.name).toBe('Real Name');
      expect(mockAbbreviateUser).not.toHaveBeenCalled();
    });

    it('preserves user role', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      const result = sanitizeUser(createRawUser());
      expect(result.role).toBe('admin');
    });

    it('strips user email', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      const result = sanitizeUser(createRawUser());
      expect(result).not.toHaveProperty('email');
    });

    it('strips user note', () => {
      mockAbbreviateUser.mockReturnValue('HB');
      const result = sanitizeUser(createRawUser());
      expect(result).not.toHaveProperty('note');
    });
  });

  describe('sanitizeCustomer', () => {
    const createRawCustomer = () => ({
      id: 100,
      name: 'Acme Corporation',
      note: 'Important client',
      archived: false,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      hourly_rate: 150,
      active_hourly_rate: 'hourly_rate',
    });

    it('replaces customer name', () => {
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeCustomer(createRawCustomer());
      expect(result.name).toBe('ACME');
    });

    it('uses real name when useRealNames is true', () => {
      const result = sanitizeCustomer(createRawCustomer(), { useRealNames: true });
      expect(result.name).toBe('Acme Corporation');
      expect(mockAbbreviateCustomer).not.toHaveBeenCalled();
    });

    it('strips customer note', () => {
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeCustomer(createRawCustomer());
      expect(result).not.toHaveProperty('note');
    });

    it('strips customer hourly rate', () => {
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeCustomer(createRawCustomer());
      expect(result).not.toHaveProperty('hourly_rate');
    });
  });

  describe('sanitizeProject', () => {
    const createRawProject = () => ({
      id: 200,
      name: 'Secret Project',
      note: 'Classified',
      customer_id: 100,
      customer_name: 'Acme Corporation',
      budget: 50000,
      budget_type: 'minutes',
      archived: false,
      hourly_rate: 100,
      active_hourly_rate: 'hourly_rate',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    it('replaces project name', () => {
      mockAbbreviateProject.mockReturnValue('SS');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeProject(createRawProject());
      expect(result.name).toBe('SS');
    });

    it('replaces project customer name', () => {
      mockAbbreviateProject.mockReturnValue('SS');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeProject(createRawProject());
      expect(result.customer_name).toBe('ACME');
    });

    it('uses real names when useRealNames is true', () => {
      const result = sanitizeProject(createRawProject(), { useRealNames: true });
      expect(result.name).toBe('Secret Project');
      expect(result.customer_name).toBe('Acme Corporation');
      expect(mockAbbreviateProject).not.toHaveBeenCalled();
      expect(mockAbbreviateCustomer).not.toHaveBeenCalled();
    });

    it('strips project budget', () => {
      mockAbbreviateProject.mockReturnValue('SS');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeProject(createRawProject());
      expect(result).not.toHaveProperty('budget');
    });

    it('strips project hourly rate', () => {
      mockAbbreviateProject.mockReturnValue('SS');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeProject(createRawProject());
      expect(result).not.toHaveProperty('hourly_rate');
    });

    it('strips project note', () => {
      mockAbbreviateProject.mockReturnValue('SS');
      mockAbbreviateCustomer.mockReturnValue('ACME');
      const result = sanitizeProject(createRawProject());
      expect(result).not.toHaveProperty('note');
    });

    it('still strips budget and hourly_rate when useRealNames is true', () => {
      const result = sanitizeProject(createRawProject(), { useRealNames: true });
      expect(result).not.toHaveProperty('budget');
      expect(result).not.toHaveProperty('hourly_rate');
      expect(result).not.toHaveProperty('note');
    });
  });
});
