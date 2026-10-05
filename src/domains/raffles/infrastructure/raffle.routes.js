import { Router } from 'express';
import multer from 'multer';
import { RaffleController } from './RaffleController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import {
  validateCreateRafflePrize,
  validateSpinRaffle,
  validateAddManualParticipant,
  validateRemoveManualParticipant
} from '../../../shared/middlewares/validators.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
  }
});

const router = Router();
const controller = new RaffleController();

router.get('/current', (req, res) => controller.getCurrent(req, res));
router.get('/history', (req, res) => controller.getHistory(req, res));
router.get('/admin/all', authMiddleware, adminMiddleware, (req, res) => controller.getAll(req, res));

router.post(
  '/create-monthly',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 3),
  validateCreateRafflePrize,
  (req, res) => controller.createPrize(req, res)
);

router.post('/spin', authMiddleware, adminMiddleware, validateSpinRaffle, (req, res) => controller.spin(req, res));

router.post('/participants', authMiddleware, adminMiddleware, validateAddManualParticipant, (req, res) =>
  controller.addParticipant(req, res)
);

router.delete(
  '/participants/:raffleId/:participantId',
  authMiddleware,
  adminMiddleware,
  validateRemoveManualParticipant,
  (req, res) => controller.removeParticipant(req, res)
);

router.get('/participants/:raffleId', authMiddleware, (req, res) => controller.getParticipants(req, res));

router.put('/:raffleId/prize', authMiddleware, adminMiddleware, upload.array('images', 3), (req, res) =>
  controller.updatePrize(req, res)
);

router.delete('/:raffleId', authMiddleware, adminMiddleware, (req, res) => controller.delete(req, res));
router.patch('/:raffleId/deadline', authMiddleware, adminMiddleware, (req, res) => controller.updateDeadline(req, res));

export default router;
