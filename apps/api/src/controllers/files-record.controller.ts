import { FILES_RECORD, GET_PHOTO } from "@app/rabbit";
import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";

@ApiTags('files-record')
@Controller()
export class FilesController {
  constructor(@Inject(FILES_RECORD) private readonly client: ClientProxy) {}

  @Get('/photos/:name')
  async getPhoto(@Param('name') name: string) {
    return await firstValueFrom(
        this.client.send(
          {
            cmd: GET_PHOTO,
          },
          name,
        ),
    );
  }

  @Get('/photo')
  async getP() {
    return "fgg";
  }
}
