import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { Country } from "../entities";

export class CreateCountryDTO extends IntersectionType(
    PickType(Country, ['countryName', 'url']),
    PartialType(PickType(Country, ['flag'])),
){}