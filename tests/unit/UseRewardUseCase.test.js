import { jest } from '@jest/globals';
import { UseRewardUseCase } from '../../src/domains/loyalty/application/UseRewardUseCase.js';

const mockLoyaltyRepository = {
  findByUserId: jest.fn(),
  update: jest.fn()
};

describe('UseRewardUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UseRewardUseCase(mockLoyaltyRepository);
  });

  const baseCard = () => ({
    _id: 'card1',
    userId: 'user1',
    claimedRewards: [
      { rewardId: 'r1', rewardName: 'Bebida Gratis', claimedAt: new Date(), usedAt: null },
      { rewardId: 'r2', rewardName: '30% Descuento', claimedAt: new Date(), usedAt: null }
    ]
  });

  it('should mark the reward as used', async () => {
    mockLoyaltyRepository.findByUserId.mockResolvedValue(baseCard());
    mockLoyaltyRepository.update.mockImplementation((card) => Promise.resolve(card));

    const result = await useCase.execute('user1', 'r1');

    const usedReward = result.claimedRewards.find((r) => r.rewardId === 'r1');
    expect(usedReward.usedAt).toBeInstanceOf(Date);
    expect(result.claimedRewards.find((r) => r.rewardId === 'r2').usedAt).toBeNull();
    expect(mockLoyaltyRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should throw when reward is already used or does not exist', async () => {
    mockLoyaltyRepository.findByUserId.mockResolvedValue(baseCard());

    await expect(useCase.execute('user1', 'zzz')).rejects.toThrow('El premio no existe o ya ha sido usado');
    expect(mockLoyaltyRepository.update).not.toHaveBeenCalled();
  });

  it('should throw when loyalty card does not exist', async () => {
    mockLoyaltyRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user1', 'r1')).rejects.toThrow('Loyalty card not found');
  });
});
