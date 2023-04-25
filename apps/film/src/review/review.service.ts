import { CreateReviewDTO } from '@app/shared';
import { Review } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // TODO: сохраняй коментарии к отзывам
  createReviews(dtos: CreateReviewDTO[]) {
    console.log('Review is not implemented yet');

    const reviews = this.reviewRepository.create(dtos);
  }
}
