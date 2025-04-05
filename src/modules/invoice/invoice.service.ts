import { Injectable, NotFoundException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import { Public } from 'nest-keycloak-connect';
import * as natural from 'natural';
import { Tesseract } from 'tesseract.ts';
import * as fs from 'fs';
import e from 'express';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { Invoice } from './entities/invoice.entity';
import { EnergyData } from './entities/energyData.entity';
import { HistoryEnergy } from './entities/historyEnergy.entity';
import {
  Between,
  EntityManager,
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import {
  IEnergyData,
  IHistoryEnergy,
  IInvoiceData,
} from './interfaces/interfaces';
import { PaginationInvoiceRequest } from './dto/request/findall-invoice.dto';
import { InvoiceResponseDTO } from './dto/response/invoice.response.dto';

@Public()
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private modelRepository: Repository<Invoice>,
    @InjectRepository(EnergyData)
    private energyDataRepository: Repository<EnergyData>,
    @InjectRepository(HistoryEnergy)
    private historyEnergyRepository: Repository<HistoryEnergy>,
    private readonly userService: UserService,
  ) {}

  async findAll(query: PaginationInvoiceRequest): Promise<InvoiceResponseDTO> {
    try {
      const user = await this.userService.get();
      const {
        initialDate,
        finalDate,
        page = 1,
        limit = 10,
        minAmount,
        maxAmount,
        companiyIds,
        userIds,
      } = query;

      const where: any = {};
      if (initialDate && finalDate)
        where.createdAt = Between(
          new Date(new Date(initialDate).setHours(0, 0, 0, 0)).toISOString(),
          new Date(new Date(finalDate).setHours(23, 59, 59, 999)).toISOString(),
        );
      if (minAmount) where.amount = MoreThanOrEqual(minAmount);
      if (maxAmount) where.amount = LessThanOrEqual(maxAmount);

      if (companiyIds) {
        const userCompanies = user.companies;
        const allowedCompanyIds = userCompanies.map((company) => company.id);
        where.company = In([
          ...new Set([...companiyIds, ...allowedCompanyIds]),
        ]);
      }
      if (userIds && user.role == Role.ADMIN) where.user = In(userIds);
      const skip = this.userService.calculateSkip(page, limit);

      const findOptions: FindManyOptions<Invoice> = {
        order: {
          createdAt: 'DESC',
        },
        where: where,
        take: limit,
        skip: skip,
        relations: [
          'user',
          'company',
          'energyEletric',
          'energySCEE',
          'compensatedEnergy',
          'historyEnergy',
        ],
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

  async findOne(id: string): Promise<Invoice> {
    try {
      const user: User = this.userService.get();
      const invoice = await this.modelRepository.findOne({
        where: { id },
        relations: [
          'user',
          'company',
          'energyEletric',
          'energySCEE',
          'compensatedEnergy',
          'historyEnergy',
        ],
      });
      const userCompanies = user.companies;
      const allowedCompanyIds = userCompanies.map((company) => company.id);

      if (
        !invoice ||
        (!allowedCompanyIds.includes(invoice.company.id) &&
          user.role == Role.COSTUMER)
      ) {
        throw new NotFoundException(`Invoice #${id} not found`);
      }
      return invoice;
    } catch (error) {
      throw error;
    }
  }


  async remove(id: string) {
    try {
      const user: User = this.userService.get();
      const invoice = await this.modelRepository.findOne({
        where: { id },
        relations: [
          'user',
          'company',
          'energyEletric',
          'energySCEE',
          'compensatedEnergy',
          'historyEnergy',
        ],
      });
      const userCompanies = user.companies;
      const allowedCompanyIds = userCompanies.map((company) => company.id);

      if (
        !invoice ||
        (!allowedCompanyIds.includes(invoice.company.id) &&
          user.role == Role.COSTUMER)
      ) {
        throw new NotFoundException(`Invoice #${id} not found`);
      }
      return await this.modelRepository.softRemove(invoice);
    } catch (error) {
      throw error;
    }
  }

  async createInvoice(invoiceData: IInvoiceData, user: User, company: Company) {
    return this.modelRepository.manager.transaction(async (manager) => {
      const invoice = await this.saveInvoice(
        invoiceData,
        user,
        company,
        manager,
      );
      await this.saveEnergyData(invoiceData.energyEletric, invoice, manager);
      await this.saveEnergyData(invoiceData.energySCEE, invoice, manager);
      await this.saveEnergyData(
        invoiceData.compensatedEnergy,
        invoice,
        manager,
      );
      await this.saveHistoryEnergy(invoiceData, invoice, manager);
    });
  }

  private async saveInvoice(
    invoiceData: IInvoiceData,
    user: User,
    company: Company,
    manager: EntityManager,
  ) {
    const invoice = new Invoice();
    invoice.installation = invoiceData.installation;
    invoice.client = invoiceData.client;
    invoice.dueDate = invoiceData.dueDate;
    invoice.totalAmount = invoiceData.totalAmount;
    invoice.publicContribution = invoiceData.publicContribution;
    invoice.notaFiscal = invoiceData.notaFiscal;
    invoice.referencyMonth = invoiceData.referencyMonth;
    invoice.band = invoiceData.band;
    invoice.user = user;
    invoice.company = company;
    return manager.save(invoice);
  }

  private async saveEnergyData(
    energyData: IEnergyData,
    invoice: Invoice,
    manager: EntityManager,
  ) {
    const energy = new EnergyData();
    energy.invoice = invoice;
    energy.quantity = energyData.quantity;
    energy.value = energyData.value;
    energy.unitPrice = energyData.unitPrice;
    return manager.save(energy);
  }

  private async saveHistoryEnergy(
    invoiceData: IInvoiceData,
    invoice: Invoice,
    manager: EntityManager,
  ) {
    const history = new HistoryEnergy();
    history.invoice = invoice;
    history.consumptionHistory = invoiceData.historyEnergy.map((item) => ({
      month: item.month,
      year: item.year,
      consumption: item.consumption,
    }));
    return manager.save(history);
  }
  async uploadFile(file: Express.Multer.File, companyId: string) {
    try {
      const user = await this.userService.get();
      const company = user.companies.find(
        (company) => company.id === companyId,
      );
      if (!company && user.role !== Role.ADMIN) {
        throw new NotFoundException('Company not found');
      }
      user.companies.find((company) => company.id === companyId);

      const text = await this.extractTextFromPDF(file.buffer);
      const invoiceData = this.parseInvoiceData(text);
      console.log(invoiceData);
      return invoiceData;
    } catch (error) {
      console.error('Erro ao ler o PDF:', error);
      throw error;
    }
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    if (!data.text) {
      const tempFilePath = `/tmp/${Date.now()}.pdf`;
      fs.writeFileSync(tempFilePath, buffer);
      const { text } = await new Tesseract(tempFilePath, 'por', {
        psm: 11,
      });
      fs.unlinkSync(tempFilePath);
      return text;
    }
    return data.text;
  }

  private parseInvoiceData(text: string): IInvoiceData {
    const installation = this.extractSingleValue(
      text,
      /Nº DA INSTALAÇÃO\s+(\d+)/,
    );
    const client = this.extractSingleValue(
      text,
      /Nº DO CLIENTE[\s\S]*?(\d+\n)/,
    );
    const band = this.extractSingleValue(text, /Band\. (\w+)/);
    const dueDate = this.extractSingleValue(
      text,
      /Valor a pagar[\s\S]*?(\d+\S+\D+\d+\s)/,
    );

    const energyEletric = this.extractEnergyData(
      text,
      /Energia ElétricakWh\s+(\d+)\s+([\d,.]+)\s+(-?[\d,.]+)/,
    );
    const energySCEE = this.extractEnergyData(
      text,
      /Energia SCEE s\/ ICMSkWh\s+(\d+)\s+([\d,.]+)\s+(-?[\d,.]+)/,
    );
    const compensatedEnergy = this.extractEnergyData(
      text,
      /Energia compensada GD IkWh\s+(\d+)\s+([\d,.]+)\s+(-?[\d,.]+)/,
    );

    const publicContribution = parseFloat(
      this.extractSingleValue(
        text,
        /Contrib Ilum Publica Municipal\s+(\d+\D+\d+)/,
      )?.replace(',', '.') || '0',
    );

    const historyEnergy = this.extractHistoryEnergy(text);
    const referencyMonth = historyEnergy[0]
      ? `${historyEnergy[0].month}/${historyEnergy[0].year}`
      : null;

    if (!referencyMonth)
      throw new NotFoundException('referencyMonth not found');

    const notaFiscal = this.extractSingleValue(text, /NOTA FISCAL Nº\s+(\d+)/);

    const totalAmount = this.calculateTotalAmount([
      energyEletric.value,
      energySCEE.value,
      compensatedEnergy.value,
      publicContribution,
    ]);

    return {
      installation,
      client,
      dueDate,
      totalAmount,
      energyEletric,
      energySCEE,
      compensatedEnergy,
      publicContribution,
      historyEnergy,
      notaFiscal,
      referencyMonth,
      band,
    };
  }

  private extractSingleValue(text: string, regex: RegExp): string {
    const exctactedText = text.match(regex)?.[1]?.trim();
    if (!exctactedText) throw new NotFoundException('Value not found');
    return exctactedText;
  }

  private extractEnergyData(text: string, regex: RegExp): IEnergyData {
    const match = text.match(regex);
    return {
      quantity: match ? parseFloat(match[1]?.replace(',', '.') || '0') : 0,
      value: match ? parseFloat(match[3]?.replace(',', '.') || '0') : 0,
      unitPrice: match ? parseFloat(match[2]?.replace(',', '.') || '0') : 0,
    };
  }

  private extractHistoryEnergy(text: string) {
    const historicoMatch = text.match(
      /Histórico de Consumo[\s\S]*?Reservado ao Fisco/,
    )?.[0];
    const historyConsumer: any[] = [];
    if (historicoMatch) {
      const linhas = historicoMatch.trim().split('\n');
      for (let i = 2; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (linha && !linha.includes('Reservado ao Fisco')) {
          const partes = linha.split(/\s+/);
          if (partes.length >= 3) {
            const mesAno = partes[0];
            const consumo = partes[1];
            if (mesAno.includes('/')) {
              const [mes, ano] = mesAno.split('/');
              historyConsumer.push({
                month: mes,
                year: ano,
                consumption: consumo,
              });
            }
          }
        }
      }
    }
    return historyConsumer;
  }

  private calculateTotalAmount(values: number[]): number {
    return values.reduce((sum, value) => sum + (value || 0), 0);
  }

  classifyText(text: string) {
    const categories = {
      fatura: ['fatura', 'TARIFA SOCIAL DE ENERGIA'],
    };
    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(text.toLowerCase());

    let bestCategory = 'desconhecido';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = words.filter((word) => keywords.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }
    return bestCategory;
  }
}
