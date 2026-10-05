import { jest } from '@jest/globals';
import { InitMinigameUseCase } from '../../src/domains/loyalty/application/InitMinigameUseCase.js';

const mockLoyaltyRepository = {
  findByUserId: jest.fn(),
  update: jest.fn()
};

const mockRewardRepository = {
  findLoyaltyRewards: jest.fn()
};

describe('InitMinigameUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new InitMinigameUseCase(mockLoyaltyRepository, mockRewardRepository);
    mockLoyaltyRepository.findByUserId.mockImplementation(() => Promise.resolve({ ...baseCard }));
  });

  const baseCard = {
    userId: 'user1',
    visits: 5,
    status: 'reward_pending',
    currentCycle: 1
  };

  const loyaltyRewards = [
    { _id: 'r1', name: 'Bebida Gratis', type: 'bebida' },
    { _id: 'r2', name: '30% Descuento', type: 'descuento' },
    { _id: 'r3', name: 'Corte Gratis', type: 'corte' }
  ];

  it('should create 10 cards and every card must be a winner', async () => {
    mockRewardRepository.findLoyaltyRewards.mockResolvedValue(loyaltyRewards);

    await useCase.execute('user1');

    const updated = mockLoyaltyRepository.update.mock.calls[0][0];
    expect(updated.minigameCards).toHaveLength(10);
    expect(updated.minigameCards.every((c) => c.isWinner)).toBe(true);
    updated.minigameCards.forEach((c) => {
      expect(c.rewardId).toBeTruthy();
      expect(c.rewardName).toBeTruthy();
      expect(c.revealed).toBe(false);
    });
  });

  it('should pick weighted rewards and always resolve to a known reward', async () => {
    mockRewardRepository.findLoyaltyRewards.mockResolvedValue(loyaltyRewards);

    const picked = [];
    for (let i = 0; i < 100; i++) {
      picked.push(useCase._pickWeightedReward(loyaltyRewards));
    }

    expect(picked).toHaveLength(100);
    expect(picked.every((r) => loyaltyRewards.includes(r))).toBe(true);
  });

  it('should build availableRewards from the cards with unique reward ids', async () => {
    mockRewardRepository.findLoyaltyRewards.mockResolvedValue(loyaltyRewards);

    await useCase.execute('user1');

    const updated = mockLoyaltyRepository.update.mock.calls[0][0];
    const response = useCase._buildResponse(updated);

    expect(response.cardsCount).toBe(10);
    const ids = response.availableRewards.map((r) => r.rewardId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
