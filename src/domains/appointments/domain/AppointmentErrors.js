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

export class InvalidStatusTransition extends DomainError {
  constructor(from, to) {
    super(`No se puede cambiar el estado de '${from}' a '${to}'`, 400);
  }
}

export class AppointmentAlreadyFinished extends DomainError {
  constructor() {
    super('La cita ya está completada o cancelada', 400);
  }
}
