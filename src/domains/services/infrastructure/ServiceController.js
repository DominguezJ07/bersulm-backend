import { useCases, repos } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

export class ServiceController {
  constructor() {
    this.getServicesUseCase = useCases.services.getAll();
    this.createServiceUseCase = useCases.services.create();
    this.updateServiceUseCase = useCases.services.update();
    this.serviceRepository = repos.service();
  }

  async getAll(req, res) {
    try {
      const services = await this.getServicesUseCase.execute();
      const { statusCode, body } = ApiResponse.success(services);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await this.serviceRepository.findById(id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      const { statusCode, body } = ApiResponse.success(service);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async create(req, res) {
    try {
      const service = await this.createServiceUseCase.execute(req.body);
      const { statusCode, body } = ApiResponse.created(service);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const service = await this.updateServiceUseCase.execute(id, req.body);
      const { statusCode, body } = ApiResponse.success(service);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.serviceRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }
}
