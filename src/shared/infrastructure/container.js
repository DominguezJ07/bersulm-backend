import { MongoUserRepository } from '../../domains/auth/infrastructure/MongoUserRepository.js';
import { MongoAppointmentRepository } from '../../domains/appointments/infrastructure/MongoAppointmentRepository.js';
import { MongoServiceRepository } from '../../domains/services/infrastructure/MongoServiceRepository.js';
import { MongoLoyaltyRepository } from '../../domains/loyalty/infrastructure/MongoLoyaltyRepository.js';
import { MongoRewardRepository } from '../../domains/rewards/infrastructure/MongoRewardRepository.js';
import { MongoRaffleRepository } from '../../domains/raffles/infrastructure/MongoRaffleRepository.js';
import { MongoGalleryRepository } from '../../domains/gallery/infrastructure/MongoGalleryRepository.js';

import { RegisterUseCase } from '../../domains/auth/application/RegisterUseCase.js';
import { LoginUseCase } from '../../domains/auth/application/LoginUseCase.js';
import { SearchUsersUseCase } from '../../domains/auth/application/SearchUsersUseCase.js';

import { CreateAppointmentUseCase } from '../../domains/appointments/application/CreateAppointmentUseCase.js';
import { GetAvailableSlotsUseCase } from '../../domains/appointments/application/GetAvailableSlotsUseCase.js';
import { CancelAppointmentUseCase } from '../../domains/appointments/application/CancelAppointmentUseCase.js';
import { GetUserAppointmentsUseCase } from '../../domains/appointments/application/GetUserAppointmentsUseCase.js';

import { CreateServiceUseCase } from '../../domains/services/application/CreateServiceUseCase.js';
import { GetServicesUseCase } from '../../domains/services/application/GetServicesUseCase.js';
import { UpdateServiceUseCase } from '../../domains/services/application/UpdateServiceUseCase.js';

import { GetLoyaltyCardUseCase } from '../../domains/loyalty/application/GetLoyaltyCardUseCase.js';
import { AddVisitUseCase } from '../../domains/loyalty/application/AddVisitUseCase.js';
import { SpinCardUseCase } from '../../domains/loyalty/application/SpinCardUseCase.js';
import { InitMinigameUseCase } from '../../domains/loyalty/application/InitMinigameUseCase.js';
import { RevealCardUseCase } from '../../domains/loyalty/application/RevealCardUseCase.js';

import { GetCurrentRaffleUseCase } from '../../domains/raffles/application/GetCurrentRaffleUseCase.js';
import { VoteForRewardUseCase } from '../../domains/raffles/application/VoteForRewardUseCase.js';
import { SpinRaffleUseCase } from '../../domains/raffles/application/SpinRaffleUseCase.js';
import { GetVotesUseCase } from '../../domains/raffles/application/GetVotesUseCase.js';
import { AddManualParticipantUseCase } from '../../domains/raffles/application/AddManualParticipantUseCase.js';
import { RemoveManualParticipantUseCase } from '../../domains/raffles/application/RemoveManualParticipantUseCase.js';
import { CreateMonthlyRaffleUseCase } from '../../domains/raffles/application/CreateMonthlyRaffleUseCase.js';
import { GetVotesByMonthUseCase } from '../../domains/raffles/application/GetVotesByMonthUseCase.js';

import { CreateRewardUseCase } from '../../domains/rewards/application/CreateRewardUseCase.js';
import { GetRewardsUseCase } from '../../domains/rewards/application/GetRewardsUseCase.js';

import { CreateGalleryItemUseCase } from '../../domains/gallery/application/CreateGalleryItemUseCase.js';
import { DeleteGalleryItemUseCase } from '../../domains/gallery/application/DeleteGalleryItemUseCase.js';
import { GetGalleryUseCase } from '../../domains/gallery/application/GetGalleryUseCase.js';

import BcryptService from './bcrypt/BcryptService.js';
import JwtService from './jwt/JwtService.js';

const _cache = {};

function singleton(key, factory) {
  if (!_cache[key]) _cache[key] = factory();
  return _cache[key];
}

export const repos = {
  user: () => singleton('userRepo', () => new MongoUserRepository()),
  appointment: () => singleton('appointmentRepo', () => new MongoAppointmentRepository()),
  service: () => singleton('serviceRepo', () => new MongoServiceRepository()),
  loyalty: () => singleton('loyaltyRepo', () => new MongoLoyaltyRepository()),
  reward: () => singleton('rewardRepo', () => new MongoRewardRepository()),
  raffle: () => singleton('raffleRepo', () => new MongoRaffleRepository()),
  gallery: () => singleton('galleryRepo', () => new MongoGalleryRepository())
};

export const useCases = {
  auth: {
    register: () => singleton('registerUC', () => new RegisterUseCase(repos.user(), BcryptService)),
    login: () => singleton('loginUC', () => new LoginUseCase(repos.user(), JwtService, BcryptService)),
    searchUsers: () => singleton('searchUsersUC', () => new SearchUsersUseCase(repos.user()))
  },
  appointments: {
    create: () =>
      singleton(
        'createApptUC',
        () => new CreateAppointmentUseCase(repos.appointment(), useCases.loyalty.addVisit(), repos.service())
      ),
    getSlots: () => singleton('getSlotsUC', () => new GetAvailableSlotsUseCase(repos.appointment())),
    cancel: () =>
      singleton('cancelApptUC', () => new CancelAppointmentUseCase(repos.appointment(), useCases.loyalty.addVisit())),
    getUserAppointments: () => singleton('getUserApptUC', () => new GetUserAppointmentsUseCase(repos.appointment()))
  },
  services: {
    create: () => singleton('createSvcUC', () => new CreateServiceUseCase(repos.service())),
    getAll: () => singleton('getSvcsUC', () => new GetServicesUseCase(repos.service())),
    update: () => singleton('updateSvcUC', () => new UpdateServiceUseCase(repos.service()))
  },
  loyalty: {
    getCard: () => singleton('getLoyaltyUC', () => new GetLoyaltyCardUseCase(repos.loyalty())),
    addVisit: () => singleton('addVisitUC', () => new AddVisitUseCase(repos.loyalty(), repos.reward())),
    spinCard: () => singleton('spinCardUC', () => new SpinCardUseCase(repos.reward())),
    initMinigame: () => singleton('initMinigameUC', () => new InitMinigameUseCase(repos.loyalty(), repos.reward())),
    revealCard: () => singleton('revealCardUC', () => new RevealCardUseCase(repos.loyalty()))
  },
  raffles: {
    getCurrent: () =>
      singleton('getCurrentRaffleUC', () => new GetCurrentRaffleUseCase(repos.raffle(), repos.reward())),
    vote: () => singleton('voteUC', () => new VoteForRewardUseCase(repos.raffle())),
    spin: () => singleton('spinRaffleUC', () => new SpinRaffleUseCase(repos.raffle())),
    getVotes: () => singleton('getVotesUC', () => new GetVotesUseCase(repos.raffle())),
    addParticipant: () => singleton('addParticipantUC', () => new AddManualParticipantUseCase(repos.raffle())),
    removeParticipant: () => singleton('removeParticipantUC', () => new RemoveManualParticipantUseCase(repos.raffle())),
    createMonthly: () => singleton('createMonthlyUC', () => new CreateMonthlyRaffleUseCase(repos.raffle())),
    getVotesByMonth: () => singleton('getVotesByMonthUC', () => new GetVotesByMonthUseCase(repos.raffle()))
  },
  rewards: {
    create: () => singleton('createRewardUC', () => new CreateRewardUseCase(repos.reward())),
    getAll: () => singleton('getRewardsUC', () => new GetRewardsUseCase(repos.reward()))
  },
  gallery: {
    create: () => singleton('createGalleryUC', () => new CreateGalleryItemUseCase(repos.gallery())),
    delete: () => singleton('deleteGalleryUC', () => new DeleteGalleryItemUseCase(repos.gallery())),
    getAll: () => singleton('getGalleryUC', () => new GetGalleryUseCase(repos.gallery()))
  }
};
