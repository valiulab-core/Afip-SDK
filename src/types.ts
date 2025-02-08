import { IOptions } from "soap";
import { ILoginCmsReturn } from "./soap/interfaces/LoginCMSService/LoginCms";
import { ServiceSoapTypes } from "./soap/interfaces/Service/ServiceSoap";
import {
  IFEParamGetPtosVentaOutput,
  ServiceSoap12Types,
} from "./soap/interfaces/Service/ServiceSoap12";
import { EndpointsEnum, SoapServiceVersion } from "./enums";
import { WsdlPathEnum } from "./soap/wsdl-path.enum";
import { ServiceNamesEnum } from "./soap/service-names.enum";

export type SoapAsyncFunc<I, O> = (
  input: I,
  options?: any,
  extraHeaders?: any
) => Promise<[O, string, { [k: string]: any }, string]>;

export type WSAuthParam = { Auth: ServiceSoapTypes.IAuth };

export type WSAuthTokens = {
  token: string;
  sign: string;
  expirationDate: string;
};

export type SoapClientParams = {
  wsdl: WsdlPathEnum;
  options?: IOptions;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILoginCredentials extends ILoginCmsReturn { }

export interface IAccessTicket extends ILoginCredentials {
  getSign(): string;
  getToken(): string;
  getExpiration(): Date;
  getWSAuthFormat(cuit: number): WSAuthParam;
  isExpired(): boolean;
}

export type AfipServiceSoapParam = SoapClientParams & {
  v12?: boolean;
  url: EndpointsEnum;
  url_test?: EndpointsEnum;
  wsdl_test?: WsdlPathEnum;
} & { serviceName: ServiceNamesEnum };

export type SoapServices<T> = Record<
  "Service",
  Record<
    SoapServiceVersion,
    Record<keyof T, Record<"input" | "output", Record<string, any>>>
  >
>;

export type Context = {
  /**
   * Flag for production or testing environment
   *
   * @var boolean
   **/
  production?: boolean;

  /**
   * Content file for the X.509 certificate in PEM format
   *
   * @var string
   **/
  cert: string;

  /**
   * Content file for the private key correspoding to CERT (PEM)
   *
   * @var string
   **/
  key: string;

  /**
   * The CUIT to use
   *
   * @var int
   **/
  cuit: number;

  /**
   * Tokens object if you have one created before
   *
   * @var credentials
   **/
  credentials?: ILoginCredentials;

  /**
   * Flag that if is true, the access tickets data is handled by the developer, otherwise is saved locally.
   */
  handleTicket?: boolean;

  /**
   * The path of the auth obj if the package is auto managed
   */
  ticketPath?: string;
};

export interface IVoucher {
  CantReg: number;
  PtoVta: number;
  CbteTipo: number;
  Concepto: number;
  DocTipo: number;
  DocNro: number;
  CbteDesde: number;
  CbteHasta: number;
  CbteFch: string;
  ImpTotal: number;
  ImpTotConc: number;
  ImpNeto: number;
  ImpOpEx: number;
  ImpIVA: number;
  ImpTrib: number;
  FchServDesde?: string;
  FchServHasta?: string;
  FchVtoPago?: string;
  MonId: string;
  MonCotiz: number;
  CanMisMonExt?: string;
  CondicionIVAReceptorId: number;
  CbtesAsoc?: ICbtesAsoc[];
  Tributos?: ITributo[];
  Iva?: IIva[];
  Opcionales?: IOpcional[];
  Compradores?: IComprador[];
}

export interface INextVoucher
  extends Omit<IVoucher, "CbteDesde" | "CbteHasta"> {
  CbteDesde?: number;
  CbteHasta?: number;
}

export interface ICbtesAsoc {
  Tipo: number;
  PtoVta: number;
  Nro: number;
  Cuit: string;
  CbteFch?: string;
}

export interface IComprador {
  DocTipo: number;
  DocNro: number;
  Porcentaje: number;
}

export interface IIva {
  Id: number;
  BaseImp: number;
  Importe: number;
}

export interface IOpcional {
  Id: string;
  Valor: string;
}

export interface ITributo {
  Id: number;
  Desc: string;
  BaseImp: number;
  Alic: number;
  Importe: number;
}

export interface ICreateVoucherResult {
  response: ServiceSoap12Types.IFECAESolicitarResult;
  cae: string;
  caeFchVto: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGetSalesPointsResult extends IFEParamGetPtosVentaOutput { }
