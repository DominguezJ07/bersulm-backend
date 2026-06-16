import { NotFoundError } from '../../../shared/domain/DomainError.js';

export class DeleteReviewUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(reviewId) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Reseña no encontrada');
    await this.reviewRepository.delete(reviewId);
  }
}
