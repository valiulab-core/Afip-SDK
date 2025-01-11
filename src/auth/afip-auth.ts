import { Parser } from "../libs/utils/parser";
import { promises as fs } from "fs";
import { resolve } from "path";
import { SoapClientFacade } from "../libs/soap/soap-client-facade";
import {
  ILoginCmsSoap,
  LoginTicketResponse,
} from "../libs/soap/interfaces/LoginCMSService/LoginCms";
import { AccessTicket } from "./access-ticket";
import { ServiceNamesEnum } from "../libs/soap/service-names.enum";
import { WsdlPathEnum } from "../libs/soap/wsdl-path.enum";
import { Cryptography } from "../libs/utils/crypt-data";
import { Context, WSAuthParam } from "../types";
import { EndpointsEnum } from "../enums";
import { logger } from "../libs/utils/logger";

export class AfipAuth {
  resolvedFolderPath: string;

  constructor(private readonly context: Context) {
    this.resolvedFolderPath =
      context.ticketPath ?? resolve(__dirname, "tickets");
  }

  private async getAuthClient() {
    return SoapClientFacade.create<ILoginCmsSoap>({
      wsdl: WsdlPathEnum.WSAA,
      options: {
        disableCache: true,
        endpoint: this.context.production
          ? EndpointsEnum.WSAA
          : EndpointsEnum.WSAA_TEST,
      },
    });
  }

  /**
   * Tokent request authorization
   *
   * @param serviceName
   * @returns
   */
  private getTRA(serviceName: ServiceNamesEnum) {
    const date = new Date();
    return {
      loginTicketRequest: {
        $: { version: "1.0" },
        header: [
          {
            uniqueId: [Math.floor(date.getTime() / 1000)],
            generationTime: [new Date(date.getTime() - 600000).toISOString()],
            expirationTime: [new Date(date.getTime() + 600000).toISOString()],
          },
        ],
        service: [serviceName],
      },
    };
  }

  /**
   * Sign tokent request authorization
   *
   * @param serviceName
   * @param cert
   * @param key
   */
  private signTRA(traXml: string): string {
    const crypto = new Cryptography(this.context.cert, this.context.key);
    return crypto.sign(traXml);
  }

  /**
   * Get login cms from new request to afip
   *
   * @param serviceName ServiceNamesEnum
   * @returns ILoginCmsReturn
   */
  private async requestLogin(
    serviceName: ServiceNamesEnum
  ): Promise<AccessTicket> {
    // Create amd sign TRA
    const traXml = await Parser.jsonToXml(this.getTRA(serviceName));
    const signedTRA = this.signTRA(traXml);

    // Request TR
    const client = await this.getAuthClient();
    const [loginCmsResult] = await client.loginCmsAsync({ in0: signedTRA });
    const loginReturn = await Parser.xmlToJson<LoginTicketResponse>(
      loginCmsResult.loginCmsReturn
    );

    return new AccessTicket(loginReturn.loginticketresponse);
  }

  /**
   * Creates the format of the authentication headers requested by the afip endpoints
   *
   * @param ticket AccessTicket
   * @returns WSAuthParam
   */
  async getWSAuthForRequest(ticket: AccessTicket): Promise<WSAuthParam> {
    return {
      Auth: {
        Token: ticket.getToken(),
        Sign: ticket.getSign(),
        Cuit: this.context.cuit,
      },
    };
  }

  /**
   * Create the file name with a standard format
   *
   * @param serviceName name from Afip WS
   * @returns
   */
  public createFileName(serviceName: ServiceNamesEnum): string {
    return `TA-${this.context.cuit.toString()}-${serviceName}${
      this.context.production ? "-production" : ""
    }.json`;
  }

  /**
   * Get path to the ticket file
   *
   * @param serviceName ServiceNamesEnum
   * @returns
   */
  private getTicketFilePathByService(serviceName: ServiceNamesEnum): string {
    return resolve(this.resolvedFolderPath, this.createFileName(serviceName));
  }

  /**
   * Get token authorization
   *
   * @param serviceName ServiceNamesEnum
   * @returns AccessTicket
   */
  public async login(serviceName: ServiceNamesEnum): Promise<AccessTicket> {
    if (this.context.handleTicket) return await this.requestLogin(serviceName);
    let accessTicket = await this.getLocalAccessTicket(serviceName);

    if (!accessTicket || accessTicket.isExpired()) {
      accessTicket = await this.requestLogin(serviceName);
      await this.saveLocalAccessTicket(accessTicket, serviceName);
    }

    return accessTicket;
  }

  /**
   * Save the access ticket locally using file system
   *
   * @param ticket accessmticket header and credentials
   * @param serviceName name from Afip WS
   * @returns void
   */
  public async saveLocalAccessTicket(
    ticket: AccessTicket,
    serviceName: ServiceNamesEnum
  ): Promise<void> {
    try {
      fs.mkdir(this.resolvedFolderPath, { recursive: true });
    } catch (error) {
      logger.error(error.message);
      throw error;
    }

    const filePath = this.getTicketFilePathByService(serviceName);
    await fs.writeFile(filePath, JSON.stringify(ticket), "utf8");
  }

  /**
   * Get the access ticket locally using file system.
   * If the file is not found, the catch take the error and return undefined.
   *
   * ** Check if the folder has the correct access permission. **
   *
   * @param serviceName name from Afip WS
   * @returns access ticket or undefined if it is not there
   */
  public async getLocalAccessTicket(
    serviceName: ServiceNamesEnum
  ): Promise<AccessTicket | undefined> {
    const filePath = this.getTicketFilePathByService(serviceName);

    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch (error) {
      return undefined;
    }

    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Access denied to ticket file: ${filePath}`);
    }

    const fileData = await fs.readFile(filePath, "utf8");

    try {
      return new AccessTicket(JSON.parse(fileData));
    } catch (error) {
      throw new Error("Invalid access ticket format");
    }
  }
}
