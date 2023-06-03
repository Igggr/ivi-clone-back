import { ParsedReviewDTO } from '@app/shared';
import { Review, Profile } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { CommentService } from '../comment/comment.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly commentService: CommentService,
  ) {}

  async saveParsedReviews(
    parsedReviews: ParsedReviewDTO[],
    profiles: Map<string, Profile>, // авторы review / комментариев
    filmId: number,
  ) {
    const reviewDTOs = parsedReviews.map((review) => ({
      ...review,
      filmId,
      profileId: profiles.get(review.profile.url).id,
    }));

    const reviews = this.reviewRepository.create(reviewDTOs);
    await this.reviewRepository.save(reviews);

    const savedReviews = new Map<string, Review>();

    for (const dto of parsedReviews) {
      const review = await this.reviewRepository.findOne({
        where: {
          url: Equal(dto.url),
        },
      });
      savedReviews.set(review.url, review);
    }

    await this.commentService.saveParsedComments(
      parsedReviews,
      savedReviews,
      profiles,
    );
    return reviews;
  }
}
