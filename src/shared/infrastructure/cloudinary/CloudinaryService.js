import { v2 as cloudinary } from 'cloudinary';
import env from '../../../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
  /**
   * Sube un buffer de imagen a Cloudinary
   * @param {Buffer} buffer
   * @param {string} folder
   * @param {string} publicId
   * @returns {Promise<string>} URL de la imagen
   */
  async uploadBuffer(buffer, folder, publicId) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      stream.end(buffer);
    });
  }

  /**
   * Elimina una imagen de Cloudinary por URL
   * @param {string} imageUrl
   */
  async deleteByUrl(imageUrl) {
    try {
      // Extraer el public_id de la URL
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${filename}`);
    } catch (err) {
      console.warn('Cloudinary delete failed:', err.message);
    }
  }
}

export default new CloudinaryService();
