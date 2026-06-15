import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidationErrors
];

export const validateCreateAppointment = [
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time must be in HH:mm format'),
  handleValidationErrors
];

export const validateCancelAppointment = [
  param('id').notEmpty().withMessage('Appointment ID is required'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
  handleValidationErrors
];

export const validateIdParam = [param('id').notEmpty().withMessage('ID parameter is required'), handleValidationErrors];

export const validateCreateService = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  handleValidationErrors
];

export const validateUpdateService = [
  param('id').notEmpty().withMessage('Service ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  handleValidationErrors
];

export const validateDeleteService = [
  param('id').notEmpty().withMessage('Service ID is required'),
  handleValidationErrors
];

export const validateCreateGalleryItem = [
  body('imageUrl').trim().notEmpty().withMessage('Image URL is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  handleValidationErrors
];

export const validateDeleteGalleryItem = [
  param('id').notEmpty().withMessage('Gallery item ID is required'),
  handleValidationErrors
];

export const validateCreateReward = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('isLoyaltyReward').optional().isBoolean().withMessage('isLoyaltyReward must be a boolean'),
  handleValidationErrors
];

export const validateUpdateReward = [
  param('id').notEmpty().withMessage('Reward ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('isLoyaltyReward').optional().isBoolean().withMessage('isLoyaltyReward must be a boolean'),
  handleValidationErrors
];

export const validateDeleteReward = [
  param('id').notEmpty().withMessage('Reward ID is required'),
  handleValidationErrors
];

export const validateCreateRaffle = [
  body('month').notEmpty().withMessage('Month is required'),
  body('raffleDate').notEmpty().withMessage('Raffle date is required'),
  handleValidationErrors
];

export const validateVote = [
  body('rewardId').notEmpty().withMessage('Reward ID is required'),
  body('raffleId').notEmpty().withMessage('Raffle ID is required'),
  handleValidationErrors
];

export const validateSpinRaffle = [
  body('raffleId').notEmpty().withMessage('Raffle ID is required'),
  handleValidationErrors
];

export const validateAddVisit = [body('userId').notEmpty().withMessage('User ID is required'), handleValidationErrors];

export const validateRevealCard = [
  body('cardIndex').isInt({ min: 0, max: 9 }).withMessage('cardIndex must be an integer between 0 and 9'),
  handleValidationErrors
];

export const validateSearchUsers = [query('q').optional().trim(), handleValidationErrors];

export const validateFcmToken = [
  body('fcmToken').trim().notEmpty().withMessage('FCM token is required'),
  handleValidationErrors
];

export const validateAddManualParticipant = [
  body('raffleId').notEmpty().withMessage('Raffle ID is required'),
  body('name').trim().notEmpty().withMessage('Participant name is required'),
  handleValidationErrors
];

export const validateRemoveManualParticipant = [
  param('raffleId').notEmpty().withMessage('Raffle ID is required'),
  param('participantId').notEmpty().withMessage('Participant ID is required'),
  handleValidationErrors
];

export const validateUpdateAppointmentStatus = [
  param('id').notEmpty().withMessage('Appointment ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['confirmed', 'completed'])
    .withMessage('Status must be confirmed or completed'),
  handleValidationErrors
];
