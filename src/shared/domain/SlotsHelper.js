/**
 * Generates time slots from 09:00 to 18:30 in 30-min intervals
 * @returns {string[]} Array of 'HH:mm' strings
 */
export function generateSlots() {
  const slots = [];
  let hour = 9;
  let min = 0;

  while (hour < 18 || (hour === 18 && min <= 30)) {
    const hStr = hour.toString().padStart(2, '0');
    const mStr = min.toString().padStart(2, '0');
    slots.push(`${hStr}:${mStr}`);

    min += 30;
    if (min === 60) {
      hour++;
      min = 0;
    }
  }
  return slots;
}
