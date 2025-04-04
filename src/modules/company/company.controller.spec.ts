import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { PaginationCompanyRequest } from './dto/request/findall-company.dto';
import { CompanyResponseDTO } from './dto/response/company.response.dto';
import { Company } from './entities/company.entity';
import { Role, User } from '../user/entities/user.entity';

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: CompanyService;

  const mockCompanyService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addUserToCompany: jest.fn(),
    removeUserFromCompany: jest.fn(),
  });

  const mockCompany: Company = {
    id: '1',
    name: 'Test Company',
    cnpj: '12345678901234',
    address: 'Test Address',
    city: 'Test City',
    uf: 'TS',
    cep: '12345678',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    owner: { id: '1', name: 'Test User', email: 'test@example.com', role: Role.COSTUMER, keycloakId: '123', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, companies: [], ownerCompanies: [] },
    users: [{ id: '1', name: 'Test User', email: 'test@example.com', role: Role.COSTUMER, keycloakId: '123', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, companies: [], ownerCompanies: [] }],
  };

  const mockCompanyResponse: CompanyResponseDTO = {
    current_page: 1,
    total_pages: 1,
    total_per_pages: 10,
    list: [mockCompany],
    totalItems: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useFactory: mockCompanyService }],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call companyService.create with the provided dto', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        cnpj: '12345678901234',
        address: 'Test Address',
        city: 'Test City',
        uf: 'TS',
        cep: '12345678',
      };
      (service.create as jest.Mock).mockResolvedValue(mockCompany);

      await controller.create(createCompanyDto);

      expect(service.create).toHaveBeenCalledWith(createCompanyDto);
    });
  });

  describe('findAll', () => {
    it('should call companyService.findAll with the provided query', async () => {
      const query: PaginationCompanyRequest = { page: 1, limit: 10 };
      (service.findAll as jest.Mock).mockResolvedValue(mockCompanyResponse);

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should call companyService.findOne with the provided id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockCompany);

      await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call companyService.update with the provided id and dto', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };
      (service.update as jest.Mock).mockResolvedValue(mockCompany);

      await controller.update('1', updateCompanyDto);

      expect(service.update).toHaveBeenCalledWith('1', updateCompanyDto);
    });
  });

  describe('remove', () => {
    it('should call companyService.remove with the provided id', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('addUserToCompany', () => {
    it('should call companyService.addUserToCompany with the provided ids', async () => {
      (service.addUserToCompany as jest.Mock).mockResolvedValue(mockCompany);

      await controller.addUserToCompany('1', '2');

      expect(service.addUserToCompany).toHaveBeenCalledWith('1', '2');
    });
  });

  describe('removeUserFromCompany', () => {
    it('should call companyService.removeUserFromCompany with the provided ids', async () => {
      (service.removeUserFromCompany as jest.Mock).mockResolvedValue(mockCompany);

      await controller.removeUserFromCompany('1', '2');

      expect(service.removeUserFromCompany).toHaveBeenCalledWith('1', '2');
    });
  });
});