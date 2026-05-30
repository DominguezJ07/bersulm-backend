import { GetServicesUseCase } from '../application/GetServicesUseCase.js';
import { CreateServiceUseCase } from '../application/CreateServiceUseCase.js';
import { UpdateServiceUseCase } from '../application/UpdateServiceUseCase.js';
import { MongoServiceRepository } from './MongoServiceRepository.js';

const serviceRepository = new MongoServiceRepository();
const getServicesUseCase = new GetServicesUseCase(serviceRepository);
const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);

export class ServiceController {
  async getAll(req, res) {
    try {
      const services = await getServicesUseCase.execute();
      res.status(200).json({
        status: 'success',
        data: services
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await serviceRepository.findById(id);
      if (!service) {
        return res.status(404).json({
          status: 'error',
          message: 'Service not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: service
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const service = await createServiceUseCase.execute(req.body);
      res.status(201).json({
        status: 'success',
        data: service
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const service = await updateServiceUseCase.execute(id, req.body);
      res.status(200).json({
        status: 'success',
        data: service
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await serviceRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}
