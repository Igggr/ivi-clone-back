import { ParsedReviewDTO } from '@app/shared';
import { Review, Comment } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async createReviews(dtos: ParsedReviewDTO[], filmId: number) {
    console.log('Review is not implemented yet');
    
    const reviews = this.reviewRepository.create(dtos.map((dto) => ({...dto, filmId})));
    await this.reviewRepository.save(reviews);

    const savedReviews = new Map<string, Review>();

    for (const dto of dtos) {
      const review = await this.reviewRepository.findOne({
        where: {
          url: Equal(dto.url)
        }
      });
      savedReviews.set(review.url, review);
    }

    const commentsDTO = dtos.flatMap((review) => review.comments.map((dto) => ({ ...dto, reviewId: savedReviews.get(review.url).id })));
    
    const map = new Map<number, Comment>();
    for (const dto of commentsDTO) {
      const comment = this.commentRepository.create(dto);
      await this.commentRepository.save(comment);
      // commentId - соответсвует id на кинопоиске
      map.set(+dto.commentId, comment); 
    }

    const commentsWithParent = commentsDTO.filter((dto) => dto.parentId);
    for (const dto of commentsWithParent) {
      const child = map.get(+dto.commentId);
      const parent = map.get(+dto.parentId);
      child.parentComment = parent;
      await this.commentRepository.save(child);
    }
  }

  findCommentById(id: number) {
    return this.commentRepository.findOne({
      where: {
        id: Equal(id)
      }
    })
  }
}
