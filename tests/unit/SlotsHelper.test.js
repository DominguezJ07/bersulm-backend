import { generateSlots } from '../../src/shared/domain/SlotsHelper.js';

describe('generateSlots', () => {
  it('should generate 20 slots from 09:00 to 18:30', () => {
    const slots = generateSlots();
    expect(slots).toHaveLength(20);
    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('18:30');
  });

  it('should have 30-minute intervals', () => {
    const slots = generateSlots();
    for (let i = 0; i < slots.length - 1; i++) {
      const [h1, m1] = slots[i].split(':').map(Number);
      const [h2, m2] = slots[i + 1].split(':').map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      expect(diff).toBe(30);
    }
  });

  it('should not have duplicates', () => {
    const slots = generateSlots();
    expect(new Set(slots).size).toBe(slots.length);
  });
});
