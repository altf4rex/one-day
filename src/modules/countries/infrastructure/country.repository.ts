import { Country } from '../domain/country.entity';
import { CountryRepository } from '../domain/country.repository.interface';
import { Pool } from 'pg';

export class CountryRepositoryPg implements CountryRepository {
  constructor(private readonly db: Pool) {}

  async findAll(
    userId: number,
    { limit, offset }: { limit: number; offset: number },
  ): Promise<{ items: Country[]; total: number }> {
    const res = await this.db.query(
      `SELECT
         id, name, importance, wishes, region, quote, user_id,
         COUNT(*) OVER() AS total_count
       FROM countries
       WHERE user_id = $1
       ORDER BY importance DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const total = res.rows.length > 0
      ? Number(res.rows[0].total_count)
      : 0;

    const items = res.rows.map(row =>
      new Country(
        row.id,
        row.name,
        row.importance,
        row.wishes,
        row.region,
        row.quote,
        row.user_id,
      ),
    );

    return { items, total };
  }

  async findById(id: number): Promise<Country | null> {
    const res = await this.db.query(
      `SELECT id, name, importance, wishes, region, quote, user_id
       FROM countries
       WHERE id = $1`,
      [id],
    );
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return new Country(
      row.id,
      row.name,
      row.importance,
      row.wishes,
      row.region,
      row.quote,
      row.user_id,
    );
  }

  async save(country: Country): Promise<Country> {
    if (country.id) {
      const res = await this.db.query(
        `UPDATE countries
           SET name = $1, importance = $2, wishes = $3,
               region = $4, quote = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, name, importance, wishes, region, quote, user_id`,
        [
          country.name,
          country.importance,
          country.wishes,
          country.region,
          country.quote,
          country.id,
        ],
      );
      const row = res.rows[0];
      return new Country(
        row.id,
        row.name,
        row.importance,
        row.wishes,
        row.region,
        row.quote,
        row.user_id,
      );
    } else {
      const res = await this.db.query(
        `INSERT INTO countries
           (user_id, name, importance, wishes, region, quote)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, importance, wishes, region, quote, user_id`,
        [
          country.userId,
          country.name,
          country.importance,
          country.wishes,
          country.region,
          country.quote,
        ],
      );
      const row = res.rows[0];
      return new Country(
        row.id,
        row.name,
        row.importance,
        row.wishes,
        row.region,
        row.quote,
        row.user_id,
      );
    }
  }

  async delete(id: number): Promise<void> {
    await this.db.query(`DELETE FROM countries WHERE id = $1`, [id]);
  }
}