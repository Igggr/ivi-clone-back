import { CREATE_PROFILE_WITH_DUMMY_USER } from '@app/rabbit';
import { ParsedProfileDTO, ParsedReviewDTO } from '@app/shared';
import { Review, Comment, Profile } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @Inject('AUTH') private client: ClientProxy,
  ) {}

  async ensureProfile(saved: Map<string, Profile>, dto: ParsedProfileDTO) {
    if (saved.has(dto.url)) {
      return saved.get(dto.url);
    }
    console.log('Отправляю запрос на создание профиля');
    const profile = await firstValueFrom(
      this.client.send({ cmd: CREATE_PROFILE_WITH_DUMMY_USER }, dto),
    );

    saved.set(dto.url, profile);
    return profile;
  }

  async createReviews(dtos: ParsedReviewDTO[], filmId: number) {
    const savedProfiles = new Map<string, Profile>();

    const reviewDTOs = [];
    for (const dto of dtos) {
      const profile = await this.ensureProfile(savedProfiles, dto.profile);
      reviewDTOs.push({ ...dto, profile, filmId, comments: undefined });
    }

    const reviews = this.reviewRepository.create(reviewDTOs);
    await this.reviewRepository.save(reviews);

    const savedReviews = new Map<string, Review>();

    for (const dto of dtos) {
      const review = await this.reviewRepository.findOne({
        where: {
          url: Equal(dto.url),
        },
      });
      savedReviews.set(review.url, review);
    }

    const commentsDTO = dtos.flatMap((review) =>
      review.comments.map((dto) => ({
        ...dto,
        reviewId: savedReviews.get(review.url).id,
      })),
    );

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
        id: Equal(id),
      },
    });
  }
}
