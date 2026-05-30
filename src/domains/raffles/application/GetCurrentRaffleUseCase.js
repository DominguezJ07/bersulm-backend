import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class GetCurrentRaffleUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

   _getCurrentMonth() {
    const now = new Date();
    const month = now.getMonth() + 1;
    return `${now.getFullYear()}-${month.toString().padStart(2, '0')}`;
  }

  async execute() {
    const raffle = await this.raffleRepository.findCurrent();
    if (!raffle) {
      throw new RaffleNotFound();
    }

    const now = new Date();
    const countdown = Math.max(0, raffle.raffleDate.getTime() - now.getTime());

    return { raffle, countdown };
  }
}
