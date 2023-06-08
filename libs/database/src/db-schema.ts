import * as Joi from 'joi';
import { DB_HOST, DB_PORT, DOCKER_CONTAINER, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER } from './keys';

export const db_schema = Joi.object({
  [DOCKER_CONTAINER]: Joi.string().required(),
  [DB_HOST]: Joi.string().required(),
  [DB_PORT]: Joi.number().required(),
  [POSTGRES_USER]: Joi.string().required(),
  [POSTGRES_PASSWORD]: Joi.string().required(),
  [POSTGRES_DB]: Joi.string().required(),
});
