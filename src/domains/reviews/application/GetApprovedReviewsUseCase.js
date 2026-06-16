export class GetApprovedReviewsUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute({ limit = 10, skip = 0 } = {}) {
    const reviews = await this.reviewRepository.findApproved({ limit, skip });
    const avgRating = await this.reviewRepository.getAverageRating();
    return { reviews, avgRating: Math.round(avgRating * 10) / 10 };
  }
}
