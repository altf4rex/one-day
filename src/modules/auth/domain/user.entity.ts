export class User {
  constructor(
    public readonly id: string | null,
    public readonly email: string,
    public readonly name: string,
    public passwordHash: string,
    public role: 'user' | 'admin' = 'user',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}