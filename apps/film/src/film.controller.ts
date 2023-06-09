import { Controller } from '@nestjs/common';
import { FilmService } from './film.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  ADD_COMMENT,
  ADD_REVIEW,
  CREATE_FILM,
  DELETE_FILM,
  DELETE_REVIEW,
  GET_FILMS,
  GET_ONE_FILM,
  PARSED_DATA,
  UPDATE_FILM,
  UPDATE_REVIEW,
} from '@app/rabbit/events';
import {
  FilmQueryDTO,
  ParsedFilmDTO,
  CreateFilmDTO,
  UpdateFilmDTO,
  CreateReviewDTO,
  Review,
} from '@app/shared';
import { ResponseDTO, ack } from '@app/rabbit';
import { ParserSaverService } from './parser.saver/parser.saver.service';
import { ReviewService } from './review/review.service';
import { CreateCommentDTO } from '@app/shared/dto/create-comment.dtos';
import { CommentService } from './comment/comment.service';
import { UpdateReviewDTO } from '@app/shared/dto/update-review.dto';
import { DeleteReviewDTO } from '@app/shared/dto/delete-review.dto';

@Controller()
export class FilmController {
  constructor(
    private readonly filmService: FilmService,
    private readonly parserSaverService: ParserSaverService,
    private readonly reviewService: ReviewService,
    private readonly commentService: CommentService,
  ) {}

  // вобще говоря emit здесь подходит больше, чем send
  // но тогда непонятно как протестировать, что данные создались
  @MessagePattern({ cmd: PARSED_DATA })
  async saveParsedData(@Payload() data: ParsedFilmDTO) {
    return await this.parserSaverService.createFromParsedData(data);
  }

  @MessagePattern({ cmd: GET_FILMS })
  async getFilms(@Payload() dto: FilmQueryDTO, @Ctx() context: RmqContext) {
    ack(context);
    return (await this.filmService.find(dto)) ?? [];
  }

  @MessagePattern({ cmd: GET_ONE_FILM })
  async getOneFilm(@Payload() id: number, @Ctx() context: RmqContext) {
    ack(context);
    return this.filmService.findOneById(id);
  }

  @MessagePattern({ cmd: DELETE_FILM })
  deleteFilm(@Payload() id: number, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.delete(id);
  }

  @MessagePattern({ cmd: CREATE_FILM })
  create(@Payload() dto: CreateFilmDTO, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.create(dto);
  }

  @MessagePattern({ cmd: UPDATE_FILM })
  update(@Payload() dto: UpdateFilmDTO, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.update(dto);
  }

  @MessagePattern({ cmd: ADD_REVIEW })
  addReview(@Payload() dto: CreateReviewDTO, @Ctx() context: RmqContext) {
    ack(context);
    return this.reviewService.addReview(dto);
  }

  @MessagePattern({ cmd: UPDATE_REVIEW })
  updateReview(
    @Payload() dto: UpdateReviewDTO,
    @Ctx() context: RmqContext,
  ): Promise<ResponseDTO<Review>> {
    ack(context);
    return this.reviewService.updateReview(dto);
  }

  @MessagePattern({ cmd: DELETE_REVIEW })
  deleteReview(
    @Payload() dto: DeleteReviewDTO,
    @Ctx() context: RmqContext,
  ): Promise<ResponseDTO<Review>> {
    ack(context);
    return this.reviewService.deleteReview(dto);
  }

  @MessagePattern({ cmd: ADD_COMMENT })
  addComment(@Payload() dto: CreateCommentDTO, @Ctx() context: RmqContext) {
    ack(context);
    return this.commentService.addComment(dto);
  }
}
