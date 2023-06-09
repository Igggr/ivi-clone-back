import {
  CreateReviewDTO,
  NotYours,
  ParsedReviewDTO,
  ReviewDoesNotExist,
} from '@app/shared';
import { Review, Profile } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { CommentService } from '../comment/comment.service';
import { UpdateReviewDTO } from '@app/shared/dto/update-review.dto';
import { ResponseDTO } from '@app/rabbit';
import { DeleteReviewDTO } from '@app/shared/dto/delete-review.dto';

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

  async addReview(dto: CreateReviewDTO): Promise<Review> {
    const review = this.reviewRepository.create(dto);
    return this.reviewRepository.save(review);
  }

  async updateReview(dto: UpdateReviewDTO): Promise<ResponseDTO<Review>> {
    const check = await this.checkPermission(dto.id, dto.profileId);
    if (check.status === 'error') {
      return check;
    }
    const review = check.value;
    review.title = dto.title ?? review.title;
    review.text = dto.text ?? review.text;
    review.isPositive = dto.isPositive ?? review.isPositive;
    await this.reviewRepository.save(review);
    return {
      status: 'ok',
      value: review,
    };
  }

  async deleteReview(dto: DeleteReviewDTO): Promise<ResponseDTO<Review>> {
    const check = await this.checkPermission(dto.id, dto.profileId);
    if (check.status === 'error') {
      return check;
    }

    const review = check.value;
    if (review.comments.length === 0) {
      const res = await this.reviewRepository.remove(review);
      return {
        status: 'ok',
        value: res,
      };
    } else {
      review.title = '';
      review.text = '';
      review.isPositive = null;
      const res = await this.reviewRepository.save(review);
      return {
        status: 'ok',
        value: res,
      };
    }
  }

  private async checkPermission(
    reviewId: number,
    profileId: number,
  ): Promise<ResponseDTO<Review>> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['comments'],
    });
    if (!review) {
      return {
        status: 'error',
        error: ReviewDoesNotExist,
      };
    }

    if (review.profileId !== profileId) {
      return {
        status: 'error',
        error: NotYours,
      };
    }

    return {
      status: 'ok',
      value: review,
    };
  }
}
