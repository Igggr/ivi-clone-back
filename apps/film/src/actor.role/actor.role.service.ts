import { Actor, ActorRole } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ActorRoleService {
    constructor (
        @InjectRepository(ActorRole)
        private readonly actroRoleRepository: Repository<ActorRole>,
    ) { }
    

    async ensureAllRolesExist(roleNames: string[]): Promise<Map<string, ActorRole>> {
        const roles = await Promise.all(
            roleNames.map(async (roleName) => ({
                role: await this.ensureRoleExist(roleName),
                roleName
            }))
        );
        return new Map(roles.map(({role, roleName}) => [roleName, role]))

    }
    
    private async ensureRoleExist(roleName) {
        const role = await this.actroRoleRepository.findOne({
            where: {
                roleName: Equal(roleName)
            }
        });
        if (role) {
            return role;
        } 
        const newRole = this.actroRoleRepository.create({ roleName });
        return await this.actroRoleRepository.save(newRole);
    }

}
