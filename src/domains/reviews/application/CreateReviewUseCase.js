import { ValidationError } from '../../../shared/domain/DomainError.js';

export class CreateReviewUseCase {
  constructor(reviewRepository, appointmentRepository) {
    this.reviewRepository = reviewRepository;
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ userId, appointmentId, rating, comment, authorName, authorAvatar }) {
    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError('La calificación debe ser entre 1 y 5');
    }

    if (!comment || comment.trim().length < 10) {
      throw new ValidationError('El comentario debe tener al menos 10 caracteres');
    }

    if (appointmentId) {
      const appointment = await this.appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new ValidationError('Cita no encontrada');
      }

      if (appointment.userId.toString() !== userId.toString()) {
        throw new ValidationError('No puedes reseñar una cita que no es tuya');
      }

      if (appointment.status !== 'completed') {
        throw new ValidationError('Solo puedes reseñar citas completadas');
      }

      const existing = await this.reviewRepository.findByUserAndAppointment(userId, appointmentId);
      if (existing) {
        throw new ValidationError('Ya dejaste una reseña para esta cita');
      }
    }

    const review = await this.reviewRepository.create({
      userId,
      appointmentId: appointmentId || null,
      rating: parseInt(rating),
      comment: comment.trim(),
      status: 'pending',
      authorName,
      authorAvatar: authorAvatar || null
    });

    return review;
  }
}
