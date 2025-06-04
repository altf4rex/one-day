import { Pool } from 'pg';
import { User } from '../domain/user.entity';

export class UserRepositoryPg {
    constructor(private readonly db: Pool) {}

    async findByEmail(email: string): Promise<User | null>{
        const res = await this.db.query('SELECT id, email, name, password_hash, role, created_at, updated_at FROM users WHERE email = $1', [email]);

        if(res.rows.length === 0) return null;
        const r = res.rows[0];
        return new User(
            String(r.id),
            r.email,
            r.name,
            r.password_hash,
            r.role,
            r.created_at,
            r.updated_at,
        );
    }

    async findById(id: string): Promise<User | null>{
        const res = await this.db.query('SELECT id, email, name, password_hash, role, created_at, updated_at FROM users WHERE id = $1', [id]);

        if(res.rows.length === 0) return null;
        const r = res.rows[0];
        return new User(
            String(r.id),
            r.email,
            r.name,
            r.password_hash,
            r.role,
            r.created_at,
            r.updated_at,
        );
    }

    async save(user: User): Promise<User>{
        const res = await this.db.query('INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, password_hash, role, created_at, updated_at',
        [user.email, user.passwordHash, user.role]);

        const r = res.rows[0];
        return new User(
            String(r.id),
            r.email,
            r.name,
            r.password_hash,
            r.role,
            r.created_at,
            r.updated_at,
        );
    }

}