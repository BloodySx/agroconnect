import { adminUserRepository, AdminUserFilters, CreateAdminUserInput } from './admin-user.repository';
import { NotFoundError, ConflictError, ValidationError } from '../../../shared/errors';
import { hash } from 'bcrypt';

export class AdminUserService {
   async listAdmin(filters: AdminUserFilters) {
     return adminUserRepository.findManyAdmin(filters);
   }

   async getByIdAdmin(id: string) {
     const user = await adminUserRepository.findByIdAdmin(id);
     if (!user) {
       throw new NotFoundError('Usuário não encontrado');
     }
     return user;
   }

   async createAdmin(data: { 
     name: string; 
     email?: string; 
     username: string; 
     password: string; 
     role: 'USER' | 'ADMIN'; 
     active?: boolean 
   }) {
     if (!data.username) {
       throw new ValidationError('Usuário é obrigatório');
     }
     const existingUsername = await adminUserRepository.findByUsername(data.username);
     if (existingUsername) {
       throw new ConflictError('Usuário já está em uso');
     }
     if (data.email) {
       const existing = await adminUserRepository.findByEmail(data.email);
       if (existing) {
         throw new ConflictError('E-mail já cadastrado');
       }
     }

     const passwordHash = await hash(data.password, 10);

     return adminUserRepository.create({
       name: data.name,
       email: data.email,
       username: data.username,
       passwordHash,
       role: data.role,
       active: data.active ?? true,
     });
   }

   async setActiveAdmin(id: string, active: boolean, requestUserId: string) {
     if (id === requestUserId && !active) {
       throw new ConflictError('Você não pode desativar o próprio usuário administrativo.');
     }

     const user = await adminUserRepository.findByIdAdmin(id);
     if (!user) {
       throw new NotFoundError('Usuário não encontrado');
     }

     return adminUserRepository.setActive(id, active);
   }

   async setRoleAdmin(id: string, role: 'USER' | 'ADMIN', requestUserId: string) {
     if (id === requestUserId && role === 'USER') {
       throw new ConflictError('Você não pode remover o próprio acesso administrativo.');
     }

     const user = await adminUserRepository.findByIdAdmin(id);
     if (!user) {
       throw new NotFoundError('Usuário não encontrado');
     }

     return adminUserRepository.setRole(id, role);
   }

   async deleteAdmin(id: string, requestUserId: string) {
     // Prevent deleting oneself
     if (id === requestUserId) {
       throw new ConflictError('Você não pode excluir o próprio usuário.');
     }
     // Prevent deleting the last admin
     const user = await adminUserRepository.findByIdAdmin(id);
     if (!user) {
       throw new NotFoundError('Usuário não encontrado');
     }
     if (user.role === 'ADMIN') {
       const { total } = await adminUserRepository.findManyAdmin({ role: 'ADMIN', page: 1, limit: 1000 });
       if (total === 1) {
         throw new ConflictError('Não é possível excluir o último administrador do sistema.');
       }
     }
     return adminUserRepository.delete(id);
   }
 }

 export const adminUserService = new AdminUserService();
