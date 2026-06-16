export class IReviewRepository {
  /** @returns {Promise<Review>} */
  async create(reviewData) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<Review[]>} */
  async findApproved({ limit, skip }) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<{ reviews: Review[], total: number }>} */
  async findPending({ skip, limit }) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<Review|null>} */
  async findById(id) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<Review>} */
  async updateStatus(id, status) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<void>} */
  async delete(id) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<Review|null>} */
  async findByUserAndAppointment(userId, appointmentId) {
    throw new Error('Not implemented');
  }

  /** @returns {Promise<number>} */
  async getAverageRating() {
    throw new Error('Not implemented');
  }
}
