import { Body, Controller } from '@nestjs/common';
import { FilesRecordService } from './files-record.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELETE_FILE, RECORD_FILE, UPDATE_FILE } from '@app/shared';

@Controller()
export class FilesRecordController {
  constructor(private readonly filesRecordService: FilesRecordService) {}

  @MessagePattern({ cmd: RECORD_FILE })
  recordFile(@Body() recordInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.recordFile(
      recordInfo.essenceId,
      recordInfo.essenceTable,
      recordInfo.fileName,
    );
  }

  @MessagePattern({ cmd: UPDATE_FILE })
  updateFile(@Body() recordInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.updateFile(
      recordInfo.essenceId,
      recordInfo.fileName,
    );
  }

  @MessagePattern({ cmd: DELETE_FILE })
  deleteFile(@Payload() essenceId: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.deleteFile(essenceId);
  }
}
