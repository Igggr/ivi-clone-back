import { CreateActorDTO } from '../create-actor.dto';

export class ParsedActorDTO extends CreateActorDTO {
  role: string;
  dub?: CreateActorDTO;
}
