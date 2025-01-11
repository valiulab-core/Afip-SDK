import { IVoucher } from "../../../src/types";
import moment from "moment";
import EnvTest from "../../libs/utils/env-test";

export const testCuit = parseInt(EnvTest.cuit);
export const testPtoVta = 2;
export const testCbteTipo = 11;
export const testCbteNro = 1;

const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

export const data: IVoucher = {
  CantReg: 1, // Cantidad de comprobantes a registrar
  PtoVta: testPtoVta, // Punto de venta
  CbteTipo: testCbteTipo, // Tipo de comprobante (ver tipos disponibles)
  Concepto: 2, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
  DocTipo: 99, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
  DocNro: 0, // Número de documento del comprador (0 consumidor final)
  CbteDesde: testCbteNro, // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
  CbteHasta: 1, // Número de comprobante o numero del último comprobante en caso de ser mas de uno
  CbteFch: date.replace(/-/g, ""), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
  ImpTotal: 100, // Importe total del comprobante
  ImpTotConc: 0, // Importe neto no gravado
  ImpNeto: 100, // Importe neto gravado
  ImpOpEx: 0, // Importe exento de IVA
  ImpIVA: 0, //Importe total de IVA
  ImpTrib: 0, //Importe total de tributos
  MonId: "PES", //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
  MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
  FchServDesde: moment().format("YYYYMMDD"),
  FchServHasta: moment().format("YYYYMMDD"),
  FchVtoPago: moment().format("YYYYMMDD"),
};
