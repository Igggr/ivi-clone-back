import { PARSE_DATA } from '@app/rabbit/events';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('dummy')
export class DummyController {
    @EventPattern(PARSE_DATA)
    dummyHadndler(@Payload() data) {
        console.log('Dummy handler recieved dater');
        console.log(data);
    }
}
