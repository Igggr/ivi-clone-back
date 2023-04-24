import { CreateAgeRestrictionDTO } from '@app/shared/dto/create-age-restriction.dto';
import { AgeRestriction } from '@app/shared/entities/age-restriction';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class AgeRestrictionService {
  constructor(
    @InjectRepository(AgeRestriction)
    private readonly ageRestrictionRepository: Repository<AgeRestriction>,
  ) {}

  async ensureRestrictionExist(dto: CreateAgeRestrictionDTO) {
    const restriction = await this.ageRestrictionRepository.findOne({
      where: {
        url: Equal(dto.url),
      },
    });
    if (restriction) {
      return restriction;
    }
    const newrestriction = await this.ageRestrictionRepository.create(dto);
    return this.ageRestrictionRepository.save(newrestriction);
  }
}
