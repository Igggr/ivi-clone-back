import { staticDir } from '@app/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
  /**
   * Создает файл
   *
   * @param file Объект файла
   * @returns Название файла
   */
  async createFile(file): Promise<string> {
    try {
      const fileName = uuid.v4() + '.jpg';
      const directory = staticDir();

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      fs.writeFileSync(
        path.join(directory, fileName),
        Buffer.from(file.buffer),
      );

      return fileName;
    } catch (error) {
      throw new HttpException(
        'Произошла ошибка при записи файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Удаляет файл
   *
   * @param fileName Название файла
   * @returns "Success"
   */
  async deleteFile(fileName): Promise<string> {
    try {
      const filePath = path.join(staticDir(), fileName);
      fs.unlinkSync(filePath);
      return 'Success';
    } catch (error) {
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
