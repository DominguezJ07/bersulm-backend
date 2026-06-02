export class SearchUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(query) {
    const users = await this.userRepository.search(query.trim());
    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }));
  }
}
