import { ResponseDTO } from '@app/rabbit';
import {
  ParsedReviewDTO,
  Profile,
  Review,
  Comment,
  CommentDoesNotExist,
  NotYours,
} from '@app/shared';
import { CreateCommentDTO } from '@app/shared/dto/create-comment.dtos';
import { DeleteReviewDTO } from '@app/shared/dto/delete-review.dto';
import { UpdateCommentDTO } from '@app/shared/dto/update-comment.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findCommentById(id: number) {
    return await this.commentRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
  }

  async saveParsedComments(
    parsedReviews: ParsedReviewDTO[],
    reviews: Map<string, Review>,
    profiles: Map<string, Profile>,
  ) {
    // подготовить данные
    const commentsDTO = parsedReviews.flatMap((review) =>
      review.comments.map((dto) => ({
        ...dto,
        review: reviews.get(review.url),
        profileId: profiles.get(dto.profile.url).id,
      })),
    );

    // сохранить комменты
    const commentsMap = new Map<string, Comment>();

    for (const dto of commentsDTO) {
      const comment = this.commentRepository.create(dto);
      await this.commentRepository.save(comment);
      // commentId - соответсвует id на кинопоиске
      commentsMap.set(dto.commentId, comment);
    }

    // востановить связь родитель-ребенок
    const commentsWithParent = commentsDTO.filter((dto) => dto.parentId);
    for (const dto of commentsWithParent) {
      const child = commentsMap.get(dto.commentId);
      const parent = commentsMap.get(dto.parentId);
      child.parentComment = parent;
      await this.commentRepository.save(child);
    }
  }

  async addComment(dto: CreateCommentDTO): Promise<Comment> {
    const comment = this.commentRepository.create(dto);
    return this.commentRepository.save(comment);
  }

  async updateComment(dto: UpdateCommentDTO): Promise<ResponseDTO<Comment>> {
    const check = await this.checkPermission(dto.id, dto.profileId);
    if (check.status === 'error') {
      return check;
    }
    const comment = check.value;
    comment.text = dto.text;
    await this.commentRepository.save(comment);
    return {
      status: 'ok',
      value: comment,
    };
  }

  async deleteComment(dto: DeleteReviewDTO): Promise<ResponseDTO<Comment>> {
    const check = await this.checkPermission(dto.id, dto.profileId);
    if (check.status === 'error') {
      return check;
    }
    let comment = check.value;
    if (comment.childrens.length === 0) {
      await this.commentRepository.remove(comment);
      return {
        status: 'ok',
        value: comment,
      };
    } else {
      comment.text = '';
      comment = await this.commentRepository.save(comment);
      return {
        status: 'ok',
        value: comment,
      };
    }
  }

  private async checkPermission(
    commentId: number,
    profileId: number,
  ): Promise<ResponseDTO<Comment>> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['childrens'],
    });
    if (!comment) {
      return {
        status: 'error',
        error: CommentDoesNotExist,
      };
    }

    if (comment.profileId !== profileId) {
      return {
        status: 'error',
        error: NotYours,
      };
    }

    return {
      status: 'ok',
      value: comment,
    };
  }
}
