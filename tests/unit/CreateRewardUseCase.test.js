import { jest } from '@jest/globals';
import { CreateRewardUseCase } from '../../src/domains/rewards/application/CreateRewardUseCase.js';

const mockRewardRepository = {
  save: jest.fn()
};

describe('CreateRewardUseCase', () => {
  let useCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateRewardUseCase(mockRewardRepository);
  });

  it('should throw ForbiddenError when user is not admin', async () => {
    const user = { role: 'client' };
    await expect(
      useCase.execute(user, { name: 'Test', description: 'Desc', icon: 'icon', type: 'corte' })
    ).rejects.toThrow('Admin privileges required');
  });

  it('should create reward when user is admin', async () => {
    const user = { role: 'admin' };
    const rewardData = { name: 'Test Reward', description: 'A test reward', icon: 'star', type: 'corte' };
    const savedReward = { _id: '123', ...rewardData };
    mockRewardRepository.save.mockResolvedValue(savedReward);

    const result = await useCase.execute(user, rewardData);
    expect(result).toBe(savedReward);
    expect(mockRewardRepository.save).toHaveBeenCalledTimes(1);
  });
});
