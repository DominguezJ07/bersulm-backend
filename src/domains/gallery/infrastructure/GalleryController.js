import { useCases } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

export class GalleryController {
  constructor() {
    this.getGalleryUseCase = useCases.gallery.getAll();
    this.createGalleryItemUseCase = useCases.gallery.create();
    this.deleteGalleryItemUseCase = useCases.gallery.delete();
  }

  async getAll(req, res) {
    try {
      const { category } = req.query;
      const items = await this.getGalleryUseCase.execute(category);
      const { statusCode, body } = ApiResponse.success(items);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async create(req, res) {
    try {
      const user = req.user;
      const { imageUrl, title, category, isActive, order } = req.body;

      if (!imageUrl || !title || !category) {
        return res.status(400).json({ success: false, message: 'imageUrl, title and category are required' });
      }

      const item = await this.createGalleryItemUseCase.execute(user, {
        imageUrl,
        title,
        category,
        isActive,
        order
      });

      const { statusCode, body } = ApiResponse.created(item);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async delete(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Gallery item id is required' });
      }

      await this.deleteGalleryItemUseCase.execute(user, id);
      res.status(204).send();
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
