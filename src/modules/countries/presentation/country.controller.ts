import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
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

  /** GET /countries?page=1&limit=10 */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{ items: Country[]; total: number }> {
    const userId = Number(req.user.id);
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Number(limit));
    return this.service.findAllForUser(userId, pageNum, limitNum);
  }

  /** GET /countries/:id */
  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string): Promise<Country> {
    const userId = Number(req.user.id);
    const country = await this.service.findByIdForUser(userId, Number(id));
    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  /** POST /countries */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Req() req: any,
    @Body() dto: CreateCountryDto,
  ): Promise<Country> {
    try {
      const userId = Number(req.user.id);
      return await this.service.createForUser(userId, dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /** PATCH /countries/:id */
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCountryDto,
  ): Promise<Country> {
    const userId = Number(req.user.id);
    const existing = await this.service.findByIdForUser(userId, Number(id));
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    try {
      return await this.service.updateByIdForUser(userId, Number(id), dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /** DELETE /countries/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<void> {
    const userId = Number(req.user.id);
    const existing = await this.service.findByIdForUser(userId, Number(id));
    if (!existing) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    await this.service.deleteByIdForUser(userId, Number(id));
  }
}
