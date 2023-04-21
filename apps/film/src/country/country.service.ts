import { CreateCountryDTO } from '@app/shared/dto/create-country.dto';
import { Country } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(Country) private readonly countryRepository: Repository<Country>, 
    ) { }

    async ensureCountry(dto: CreateCountryDTO) {
        const country = await this.countryRepository.findOne({
            where: {
                countryName: Equal(dto.countryName)
            }
        });
        if (country) {
            this.setFlag(country, dto);
            return country;
        }
        const newCountry = this.countryRepository.create(dto);
        return await this.countryRepository.save(newCountry);
    }


    private async setFlag(country: Country, dto: CreateCountryDTO) {
        if (dto.flag && !country.flag) {
            country.flag = dto.flag;
            this.countryRepository.save(country);
        }
    }
}
