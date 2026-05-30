import { GetGalleryUseCase } from '../application/GetGalleryUseCase.js';
import { CreateGalleryItemUseCase } from '../application/CreateGalleryItemUseCase.js';
import { DeleteGalleryItemUseCase } from '../application/DeleteGalleryItemUseCase.js';
import { MongoGalleryRepository } from './MongoGalleryRepository.js';

const galleryRepository = new MongoGalleryRepository();
const getGalleryUseCase = new GetGalleryUseCase(galleryRepository);
const createGalleryItemUseCase = new CreateGalleryItemUseCase(galleryRepository);
const deleteGalleryItemUseCase = new DeleteGalleryItemUseCase(galleryRepository);

export class GalleryController {
  async getAll(req, res) {
    try {
      const { category } = req.query;
      const items = await getGalleryUseCase.execute(category);
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const user = req.user;
      const { imageUrl, title, category, isActive, order } = req.body;

      if (!imageUrl || !title || !category) {
        return res.status(400).json({
          success: false,
          message: 'imageUrl, title and category are required'
        });
      }

      const item = await createGalleryItemUseCase.execute(user, {
        imageUrl,
        title,
        category,
        isActive,
        order
      });

      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Gallery item id is required' });
      }

      const deletedItem = await deleteGalleryItemUseCase.execute(user, id);
      res.json({ success: true, data: deletedItem });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}
