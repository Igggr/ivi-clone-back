import { Controller } from '@nestjs/common';
import { FilesRecordService } from './files-record.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELETE_FILE, RECORD_FILE, UPDATE_FILE } from '@app/rabbit';
import { FilesService } from './files.service';

@Controller()
export class FilesRecordController {
  constructor(
    private readonly filesRecordService: FilesRecordService,
    private readonly fileService: FilesService,
  ) {}

  @MessagePattern({ cmd: RECORD_FILE })
  recordFile(@Payload() recordInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.recordFile(
      recordInfo.essenceId,
      recordInfo.essenceTable,
      recordInfo.file,
    );
  }

  @MessagePattern({ cmd: UPDATE_FILE })
  updateFile(@Payload() recordInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.updateFile(
      recordInfo.essenceId,
      recordInfo.fileForCreate,
      recordInfo.fileForDelete,
    );
  }

  @MessagePattern({ cmd: DELETE_FILE })
  deleteFile(@Payload() recordInfo, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filesRecordService.deleteFile(
      recordInfo.essenceId,
      recordInfo.fileName,
    );
  }
}
