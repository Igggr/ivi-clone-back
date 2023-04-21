import { Review } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review) reviewRepository: Repository<Review>,
    ) { }

    createReviews() {
        
    }

}
