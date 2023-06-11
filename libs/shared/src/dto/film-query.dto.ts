import { PaginationDTO } from './pagination.dto';
import { FilterDTO } from './filter.dto';
import { FilmSort } from '../constants/sort-filter';

export class FilmQueryDTO {
  pagination: PaginationDTO;
  filter: FilterDTO;

  // Сортировка
  // - По количеству оценок на кинопоиске
  // - по рейтингу
  // - По дате выхода(сначала свежие)
  // - по алфавиту
  sort: FilmSort;
}
