import { Country } from "../domain/country.entity";
import { CountryRepository } from "../domain/country.repository.interface";
import { Pool } from 'pg';

export class CountryRepositoryPg implements CountryRepository {
  constructor(private readonly db: Pool) { }

  /** Вернуть все страны */
  async findAll(): Promise<Country[]> {
    const res = await this.db.query(
      `SELECT id, name, importance, wishes, region, quote
       FROM countries
       ORDER BY name`
    );
    return res.rows.map(
      (row) =>
        new Country(
          String(row.id),
          row.name,
          row.importance,
          row.wishes,
          row.region,
          row.quote,
        )
    );
  }

  /** Вернуть одну страну по ID или null */
  async findById(id: string): Promise<Country | null> {
    const res = await this.db.query(
      `SELECT id, name, importance, wishes, region, quote
       FROM countries
       WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    return new Country(
      String(row.id),
      row.name,
      row.importance,
      row.wishes,
      row.region,
      row.quote,
    );
  }

  /**
   * Сохранить новую страну или обновить существующую.
   * Если `country.id` задан — обновляем, иначе создаём новую.
   */
  async save(country: Country): Promise<Country> {
    if (country.id) {
      // Обновление: предполагаем, что id существует
      const res = await this.db.query(
        `UPDATE countries
           SET name = $1,
               importance = $2,
               wishes = $3,
               region = $4,
               quote = $5,
               updated_at = NOW()
         WHERE id = $6
         RETURNING id, name, importance, wishes, region, quote`,
        [
          country.name,
          country.importance,
          country.wishes,
          country.region,
          country.quote,
          country.id,
        ],
      );
      if (res.rows.length === 0) {
        // Если не нашлось записи для обновления, можно либо бросить, либо вернуть null
        throw new Error(`Country with id ${country.id} not found`);
      }
      const row = res.rows[0];
      return new Country(
        String(row.id),
        row.name,
        row.importance,
        row.wishes,
        row.region,
        row.quote,
      );
    } else {
      // Вставка новой страны
      const res = await this.db.query(
        `INSERT INTO countries (name, importance, wishes, region, quote)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, importance, wishes, region, quote`,
        [
          country.name,
          country.importance,
          country.wishes,
          country.region,
          country.quote,
        ],
      );
      const row = res.rows[0];
      return new Country(
        String(row.id),
        row.name,
        row.importance,
        row.wishes,
        row.region,
        row.quote,
      );
    }
  }

  /** Удалить страну по ID */
  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM countries WHERE id = $1`, [id]);
  }

}
