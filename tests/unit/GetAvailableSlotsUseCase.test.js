import { jest } from '@jest/globals';
import { GetAvailableSlotsUseCase } from '../../src/domains/appointments/application/GetAvailableSlotsUseCase.js';

const mockRepository = {
  findByDate: jest.fn(),
  findBlockedSlots: jest.fn()
};

describe('GetAvailableSlotsUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAvailableSlotsUseCase(mockRepository);
  });

  it('should return all slots when none are booked or blocked', async () => {
    mockRepository.findByDate.mockResolvedValue([]);
    mockRepository.findBlockedSlots.mockResolvedValue([]);

    const slots = await useCase.execute('2026-06-15');
    expect(slots).toContain('09:00');
    expect(slots).toContain('18:30');
    expect(slots.length).toBe(20);
  });

  it('should exclude booked slots', async () => {
    mockRepository.findByDate.mockResolvedValue([
      { time: '10:00', status: 'confirmed' },
      { time: '10:30', status: 'confirmed' }
    ]);
    mockRepository.findBlockedSlots.mockResolvedValue([]);

    const slots = await useCase.execute('2026-06-15');
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('10:30');
    expect(slots).toContain('09:00');
  });

  it('should exclude cancelled slots from booking', async () => {
    mockRepository.findByDate.mockResolvedValue([{ time: '11:00', status: 'cancelled' }]);
    mockRepository.findBlockedSlots.mockResolvedValue([]);

    const slots = await useCase.execute('2026-06-15');
    expect(slots).toContain('11:00');
  });

  it('should exclude blocked slots', async () => {
    mockRepository.findByDate.mockResolvedValue([]);
    mockRepository.findBlockedSlots.mockResolvedValue(['12:00', '12:30']);

    const slots = await useCase.execute('2026-06-15');
    expect(slots).not.toContain('12:00');
    expect(slots).not.toContain('12:30');
  });
});
