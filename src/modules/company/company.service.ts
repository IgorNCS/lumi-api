import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, In, Like, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { PaginationCompanyRequest } from './dto/request/findall-company.dto';
import { CompanyResponseDTO } from './dto/response/company.response.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private modelRepository: Repository<Company>,
    private userService: UserService,
  ) {}
  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const user = await this.userService.get();

      const company = new Company();
      company.address = createCompanyDto.address;
      company.city = createCompanyDto.city;
      company.cnpj = createCompanyDto.cnpj;
      company.cep = createCompanyDto.cep;
      company.name = createCompanyDto.name;
      company.uf = createCompanyDto.uf;
      if (user.role == Role.COSTUMER) {
        company.owner = user;
        company.users = [user];
      } else {
        company.users = createCompanyDto.userIds
          ? (createCompanyDto.userIds.map((id) => ({ id })) as User[])
          : [];
      }

      return await this.modelRepository.save(company);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: PaginationCompanyRequest): Promise<CompanyResponseDTO> {
    try {
      const user = await this.userService.get();

      const {
        initialDate,
        finalDate,
        page = 1,
        limit = 10,
        name,
        cnpj,
        address,
        city,
        uf,
        cep,
        userIds,
      } = query;
      const where: any = {};
      if (initialDate && finalDate){
        where.createdAt = Between(
          new Date(new Date(initialDate).setHours(0, 0, 0, 0)).toISOString(),
          new Date(new Date(finalDate).setHours(23, 59, 59, 999)).toISOString()
        );
      }
      if (name) where.name = Like(`%${name}%`);
      if (cnpj) where.cnpj = Like(`%${cnpj}%`);
      if (address) where.address = Like(`%${address}%`);
      if (city) where.city = Like(`%${city}%`);
      if (uf) where.uf = Like(`%${uf}%`);
      if (cep) where.cep = Like(`%${cep}%`);

      if (user.role == Role.COSTUMER) {
        where.users = { id: In([user.id]) };
      } else if (user.role == Role.ADMIN && userIds) {
        where.users = { id: In(userIds) };
      }
      if (userIds) where.users = Like(`%${userIds}%`);
      const skip = this.userService.calculateSkip(page, limit);
      const findOptions: FindManyOptions<Company> = {
        order: {
          createdAt: 'DESC',
        },
        where: where,
        take: limit,
        skip: skip,
        relations: ['owner', 'users','companyInvoices'],
      };
      const [result, total] =
        await this.modelRepository.findAndCount(findOptions);

      return {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_per_pages: limit,
        list: result,
        totalItems: total,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<Company> {
    try {
      const userLogged:User = await this.userService.get();
      const company = await this.modelRepository.findOne({
        where: { id },
        relations: ['owner', 'users'],
      });

      if (!company || (userLogged.role !== Role.ADMIN && !company.users.some((user) => user.id === userLogged.id)))
        throw new NotFoundException('Company not found');
      return company;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    try {
      const user = await this.userService.get();
      const company = await this.modelRepository.preload({
        id,
        ...updateCompanyDto,
      });
      if (
        !company ||
        (user.role !== Role.ADMIN && company.owner.id !== user.id)
      ) {
        throw new NotFoundException('Company not found');
      }

      if (updateCompanyDto.userIds) delete updateCompanyDto.userIds;
      this.modelRepository.update(id, updateCompanyDto);
      return await this.modelRepository.save(company);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.userService.get();
      const company = await this.modelRepository.findOne({
        where: { id },
        relations: ['owner', 'users'],
      });
      if (
        !company ||
        (user.role !== Role.ADMIN && company.owner.id !== user.id)
      ) {
        throw new NotFoundException('Company not found');
      }

      await this.modelRepository.softRemove(company);
    } catch (error) {
      throw error;
    }
  }

  async addUserToCompany(companyId: string, userId: string): Promise<Company> {
    try {
      const user = await this.userService.get();
      const company = await this.modelRepository.findOne({
        where: { id: companyId },
        relations: ['owner', 'users'],
      });
      if (
        !company ||
        (user.role !== Role.ADMIN && company.owner.id !== user.id)
      ) {
        throw new NotFoundException('Company not found');
      }
      const newUser = await this.userService.getById(userId);
      company.users.push(newUser);
      return await this.modelRepository.save(company);
    } catch (error) {
      throw error;
    }
  }

  async removeUserFromCompany(
    companyId: string,
    userId: string,
  ): Promise<Company> {
    try {
      const user = await this.userService.get();
      const company = await this.modelRepository.findOne({
        where: { id: companyId },
        relations: ['owner', 'users'],
      });
      if (
        !company ||
        (user.role !== Role.ADMIN && company.owner.id !== user.id)
      ) {
        throw new NotFoundException('Company not found');
      }
      const newUser = await this.userService.getById(userId);
      company.users = company.users.filter((user) => user.id !== newUser.id);
      return await this.modelRepository.save(company);
    } catch (error) {
      throw error;
    }
  }
}
