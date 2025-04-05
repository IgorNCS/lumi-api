export interface IEnergyData {
  quantity: number;
  value: number;
  unitPrice: number;
}

export interface IHistoryEnergy {
  month: string;
  year: string;
  consumption: string;
}

export interface IInvoiceData {
  installation: string;
  client: string;
  dueDate: string;
  totalAmount: number;
  energyEletric: IEnergyData;
  energySCEE: IEnergyData;
  compensatedEnergy: IEnergyData;
  publicContribution: number;
  historyEnergy: IHistoryEnergy[];
  notaFiscal: string;
  referencyMonth: string;
  band: string;
}