import { FileRecord } from '@app/shared/entities/file-record.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesService } from './files.service';

@Injectable()
export class FilesRecordService {
  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepository: Repository<FileRecord>,
    private readonly fileService: FilesService,
  ) {}

  /**
   * Создает картинку
   *
   * @param essenceId Идентификатор сущности
   * @param essenceTable Название сущности
   * @param fileName Название картинки
   * @returns Объект картинки
   */
  async recordFile(essenceId: number, essenceTable: string, file: any) {
    const fileName = await this.fileService.createFile(file);
    const fileRecord = await this.fileRepository.create({
      essenceId: essenceId,
      essenceTable: essenceTable,
      file: fileName,
    });
    await this.fileRepository.save(fileRecord);

    return fileName;
  }

  /**
   * Обновляет информации о картинке
   *
   * @param essenceId Идентификатор сущности
   * @param fileName Название картинки
   * @returns Обновленную информацию о картинке
   */
  async updateFile(essenceId: number, file: any, oldFileName: string) {
    const foundFile = await this.fileRepository.findOneBy({
      essenceId: essenceId,
    });
    await this.fileService.deleteFile(oldFileName);
    const fileName = await this.fileService.createFile(file);
    await this.fileRepository.save({ ...foundFile, file: fileName });

    return fileName;
  }

  /**
   * Удаляет информацию о сущности
   *
   * @param essenceId Идентификатор сущности
   * @returns Обновленную информацию о картинке
   */
  async deleteFile(essenceId: number, photoName: string) {
    const file = await this.fileRepository.findOneBy({ essenceId: essenceId });
    await this.fileService.deleteFile(photoName);

    return this.fileRepository.remove(file);
  }

  //   /**
  //    * Удаляет ненужные картинки спустя время
  //    *
  //    * @returns Оставшиеся картинки
  //    */
  //   async clearImages() {
  //     const images = await this.imageRepository.findAll();
  //     images.forEach(async (image) => {
  //       const nowTime = Date.now();
  //       const diff = nowTime - image.createdAt;
  //       const read = await this.fileService.readFile(image.image);

  //       if (!read) {
  //         await this.imageRepository.destroy({ where: { id: image.id } });
  //       } else if (diff > 3600000 && !image.essenceId && !image.essenceTable) {
  //         await this.fileService.deleteFile(image.image);
  //         await this.imageRepository.destroy({ where: { id: image.id } });
  //       }
  //     });
  //     return await this.imageRepository.findAll({ include: { all: true } });
  //   }
}
