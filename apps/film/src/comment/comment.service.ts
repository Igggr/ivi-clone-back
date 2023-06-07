import { ParsedReviewDTO, Profile, Review, Comment } from '@app/shared';
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
}
