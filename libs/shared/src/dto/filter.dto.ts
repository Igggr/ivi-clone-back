import { PickType } from "@nestjs/swagger";
import { Country } from "../entities";

// Фильтр
// - жанры
// - по странам должен работать
// - по рейтингу кинопоиска (вводить конкретное значение)
// - по количеству оценок на кинопоиске (больше, чем заданное число)
// - фильтр по режиссеру
// - фильтр по актеру

export type Rating = `${1 | 2 | 3 | 4}.${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | '5.0';

export class FilterDTO extends PickType(Country, ['countryName']) {
    genres: string[]; // AND - если указаны несколько жанров возвращаются фильмы принадлежащие им всем
    actorId: number;
    directorId: number;
    rating: Rating; // ====. Какой смысл? Обычно люди хотят рейтинг не меньше, чем, а не точно равный
    marks: number;  // >=
}
