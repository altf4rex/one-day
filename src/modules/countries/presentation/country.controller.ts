// src/modules/countries/presentation/country.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CountryService } from '../application/country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from '../domain/country.entity';

@Controller('countries')
export class CountryController {
  constructor(private readonly service: CountryService) {}

  /**
   * GET /countries
   * Возвращает список всех стран.
   * Код ответа: 200 OK
   */
  @Get()
  async findAll(): Promise<Country[]> {
    const countries = await this.service.findAll();
    // Если сервис возвращает null или пустой массив — значит просто вернём []
    return countries ?? [];
  }

  /**
   * GET /countries/:id
   * Возвращает одну страну по ID.
   * Код ответа: 200 OK, или 404 Not Found, если не найдена.
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Country> {
    const country = await this.service.findById(id);
    if (!country) {
      // Если сервис вернул null, бросаем исключение с 404
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  /**
   * POST /countries
   * Создаёт новую страну.
   * Код ответа: 201 Created
   * Заголовок Location: /countries/{newId}
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateCountryDto): Promise<Country> {
    try {
      const created = await this.service.create(dto);
      // service.create может вернуть созданную сущность или выбросить ошибку
      return created;
    } catch (e) {
      // Если DTO некорректен или другие ошибки
      throw new BadRequestException(e.message);
    }
  }

  /**
   * PATCH /countries/:id
   * Обновляет поля существующей страны.
   * Код ответа: 200 OK, или 404 Not Found, если не найдена.
   */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCountryDto,
  ): Promise<Country> {
    // Сначала проверим, что существуют данные
    const existing = await this.service.findById(id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }

    try {
      const updated = await this.service.updateById(id, dto);
      // service.updateById либо вернёт обновлённую сущность, либо бросит ошибку
      return updated;
    } catch (e) {
      // Если что-то пошло не так на уровне сервиса: валидация, дублирование и т.д.
      throw new BadRequestException(e.message);
    }
  }

  /**
   * DELETE /countries/:id
   * Удаляет страну по ID.
   * Код ответа: 204 No Content, если удалено,
   *               404 Not Found, если не найдено
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    const existing = await this.service.findById(id);
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }

    await this.service.deleteById(id);
    // возвращаем пустое тело, NestJS отдаст 204 No Content
  }
}
