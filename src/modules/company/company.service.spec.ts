import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationCompanyRequest } from './dto/request/findall-company.dto';

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: Repository<Company>;
  let userService: UserService;

  const mockCompanyRepository = () => ({
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  });

  const mockUserService = () => ({
    get: jest.fn(),
    getById: jest.fn(),
    calculateSkip: jest.fn(),
  });

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.COSTUMER,
    keycloakId: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    companies: [] as Company[],
    ownerCompanies: [] as Company[],
  };
  const mockAdmin = {
    id: '2',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.ADMIN,
    keycloakId: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    companies: [] as Company[],
    ownerCompanies: [] as Company[],
  };
  const mockCompany: Company = {
    id: '1',
    name: 'Test Company',
    cnpj: '12345678901234',
    address: 'Test Address',
    city: 'Test City',
    uf: 'TS',
    cep: '12345-678',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    owner: mockUser,
    users: [mockUser],
  };
  mockUser.companies = [mockCompany];
  mockUser.ownerCompanies = [mockCompany];
  mockAdmin.companies = [mockCompany];
  mockAdmin.ownerCompanies = [mockCompany];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(Company),
          useFactory: mockCompanyRepository,
        },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a company for a customer', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        cnpj: '98765432109876',
        address: 'New Address',
        city: 'New City',
        uf: 'NC',
        cep: '87654321',
      };

      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.save as jest.Mock).mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(companyRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should create a company for an admin with userIds', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Admin Company',
        cnpj: '11223344556677',
        address: 'Admin Address',
        city: 'Admin City',
        uf: 'AC',
        cep: '11223344',
        userIds: ['1'],
      };

      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (companyRepository.save as jest.Mock).mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(companyRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });
  });

  describe('findAll', () => {
    it('should find all companies for a customer', async () => {
      const query: PaginationCompanyRequest = { page: 1, limit: 10 };

      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (userService.calculateSkip as jest.Mock).mockReturnValue(0);
      (companyRepository.findAndCount as jest.Mock).mockResolvedValue([
        [mockCompany],
        1,
      ]);

      const result = await service.findAll(query);

      expect(companyRepository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        current_page: 1,
        total_pages: 1,
        total_per_pages: 10,
        list: [mockCompany],
        totalItems: 1,
      });
    });

    it('should find all companies for an admin with userIds', async () => {
      const query: PaginationCompanyRequest = {
        page: 1,
        limit: 10,
        userIds: ['1'],
      };

      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (userService.calculateSkip as jest.Mock).mockReturnValue(0);
      (companyRepository.findAndCount as jest.Mock).mockResolvedValue([
        [mockCompany],
        1,
      ]);

      const result = await service.findAll(query);

      expect(companyRepository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        current_page: 1,
        total_pages: 1,
        total_per_pages: 10,
        list: [mockCompany],
        totalItems: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should find a company by id', async () => {
      (userService.get as jest.Mock).mockReturnValue(mockUser);

      const companyWithUsers = {
        ...mockCompany,
        users: [mockUser],
      };

      (companyRepository.findOne as jest.Mock).mockResolvedValue(
        companyWithUsers,
      );

      const result = await service.findOne('1');
      expect(companyRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(companyWithUsers);
    });

    it('should throw NotFoundException if company is not found or user is not authorized', async () => {
      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };

      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.preload as jest.Mock).mockResolvedValue({
        ...mockCompany,
        ...updateCompanyDto,
      });
      (companyRepository.update as jest.Mock).mockResolvedValue(undefined);
      (companyRepository.save as jest.Mock).mockResolvedValue({
        ...mockCompany,
        ...updateCompanyDto,
      });

      const result = await service.update('1', updateCompanyDto);

      expect(companyRepository.update).toHaveBeenCalled();
      expect(result).toEqual({ ...mockCompany, ...updateCompanyDto });
    });

    it('should throw NotFoundException if company is not found or user is not authorized', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };

      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (companyRepository.preload as jest.Mock).mockResolvedValue(null);

      await expect(service.update('1', updateCompanyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.findOne as jest.Mock).mockResolvedValue(mockCompany);
      (companyRepository.softRemove as jest.Mock).mockResolvedValue(undefined);

      await service.remove('1');

      expect(companyRepository.softRemove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if company is not found or user is not authorized', async () => {
      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (companyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addUserToCompany', () => {
    it('should add a user to a company', async () => {
      const newUser: User = mockUser;

      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockCompany,
        users: [mockUser],
      });
      (userService.getById as jest.Mock).mockResolvedValue(newUser);
      (companyRepository.save as jest.Mock).mockResolvedValue({
        ...mockCompany,
        users: [mockUser, newUser],
      });

      const result = await service.addUserToCompany('1', '3');

      expect(companyRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockCompany, users: [mockUser, newUser] });
    });

    it('should throw NotFoundException if company is not found or user is not authorized', async () => {
      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (companyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.addUserToCompany('1', '3')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUserFromCompany', () => {
    it('should remove a user from a company', async () => {
      const removeUser: User = mockUser;

      (userService.get as jest.Mock).mockResolvedValue(mockUser);
      (companyRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockCompany,
        users: [removeUser],
      });
      (userService.getById as jest.Mock).mockResolvedValue(removeUser);
      (companyRepository.save as jest.Mock).mockResolvedValue({
        ...mockCompany,
        users: [],
      });

      const result = await service.removeUserFromCompany('1', '1');

      expect(companyRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ ...mockCompany, users: [] });
    });

    it('should throw NotFoundException if company is not found or user is not authorized', async () => {
      (userService.get as jest.Mock).mockResolvedValue(mockAdmin);
      (companyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.removeUserFromCompany('1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
