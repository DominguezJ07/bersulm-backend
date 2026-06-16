export class Review {
  constructor({ _id, userId, appointmentId, rating, comment, status, authorName, authorAvatar, createdAt, updatedAt }) {
    this._id = _id;
    this.userId = userId;
    this.appointmentId = appointmentId;
    this.rating = rating;
    this.comment = comment;
    this.status = status || 'pending';
    this.authorName = authorName;
    this.authorAvatar = authorAvatar || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
