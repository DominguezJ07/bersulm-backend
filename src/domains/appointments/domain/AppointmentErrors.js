import { DomainError } from '../../../shared/domain/DomainError.js';

export class SlotNotAvailable extends DomainError {
  constructor() {
    super('El horario seleccionado no está disponible', 409);
  }
}

export class AppointmentNotFound extends DomainError {
  constructor() {
    super('Cita no encontrada', 404);
  }
}

export class CannotCancelPastAppointment extends DomainError {
  constructor() {
    super('No se puede cancelar una cita pasada o completada', 400);
  }
}
