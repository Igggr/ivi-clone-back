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
      const filePath = path.join(process.cwd(), 'libs', 'static');

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
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
      const filePath = path.join(process.cwd(), 'libs', 'static');
      fs.unlinkSync(path.join(filePath, fileName));
      return 'Success';
    } catch (error) {
      throw new HttpException(
        'Произошла ошибка при удалении файла',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Читает файл
   *
   * @param fileName Название файла
   * @returns Название файла
   */
  async readFile(fileName): Promise<string> {
    try {
      const filePath = path.join(process.cwd(), 'libs', 'static');
      fs.readFileSync(path.join(filePath, fileName), 'utf-8');
      return fileName;
    } catch (error) {
      return null;
    }
  }
}
