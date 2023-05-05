import { FileRecord } from '@app/shared/entities/file-record.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FilesRecordService {
  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepository: Repository<FileRecord>,
  ) {}

  /**
   * Создает картинку
   *
   * @param essenceId Идентификатор сущности
   * @param essenceTable Название сущности
   * @param fileName Название картинки
   * @returns Объект картинки
   */
  async recordFile(essenceId: number, essenceTable: string, fileName: string) {
    const fileRecord = await this.fileRepository.create({
      essenceId: essenceId,
      essenceTable: essenceTable,
      file: fileName,
    });

    return this.fileRepository.save(fileRecord);
  }

  /**
   * Обновляет информации о картинке
   *
   * @param essenceId Идентификатор сущности
   * @param fileName Название картинки
   * @returns Обновленную информацию о картинке
   */
  async updateFile(essenceId: number, fileName: string) {
    const file = await this.fileRepository.findOneBy({ essenceId: essenceId });
    await this.fileRepository.save({ ...file, file: fileName });

    return await this.fileRepository.findOneBy({ id: essenceId });
  }

  /**
   * Удаляет информацию о сущности
   *
   * @param essenceId Идентификатор сущности
   * @returns Обновленную информацию о картинке
   */
  async deleteFile(essenceId: number) {
    const file = await this.fileRepository.findOneBy({ essenceId: essenceId });

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
