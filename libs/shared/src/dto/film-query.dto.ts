import { PaginationDTO } from "./pagination.dto";

export class FilmQueryDTO {
    genres: string[];
    pagination: PaginationDTO;
}