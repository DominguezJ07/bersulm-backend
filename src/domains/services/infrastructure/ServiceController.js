import { GetServicesUseCase } from '../application/GetServicesUseCase.js';
import { CreateServiceUseCase } from '../application/CreateServiceUseCase.js';
import { UpdateServiceUseCase } from '../application/UpdateServiceUseCase.js';
import { MongoServiceRepository } from './MongoServiceRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

const serviceRepository = new MongoServiceRepository();
const getServicesUseCase = new GetServicesUseCase(serviceRepository);
const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);

export class ServiceController {
  async getAll(req, res) {
    try {
      const services = await getServicesUseCase.execute();
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
      const service = await serviceRepository.findById(id);
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
      const service = await createServiceUseCase.execute(req.body);
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
      const service = await updateServiceUseCase.execute(id, req.body);
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
      await serviceRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }
}
