export class GetPendingReviewsUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    return this.reviewRepository.findPending({ skip, limit });
  }
}
