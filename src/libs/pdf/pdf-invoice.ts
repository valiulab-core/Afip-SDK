import { PathLike } from "fs";
import { PDF } from "./utils/pdf";
import { QR } from "./utils/qr";
import { readFile, writeFile, FileHandle } from "fs/promises";
import { TemplateCompiler } from "./template/compiler";
import {
  CreatePDFFromBuffer,
  CreatePDFFromPath,
  FilePath,
  GenerateInvoiceParams,
  InvoiceTemplateParams,
  QRContent,
} from "./types";
import { InvoiceTypeMap } from "./invoice-type-map";

class PDFInvoiceConfig {
  static templatePath: PathLike = `${__dirname}/assets`;
  static encoding: BufferEncoding = "utf8";
  static baseQrUrl = "https://www.afip.gob.ar/fe/qr/?p=";

  static defaultInvoiceFileName: string = "invoice_b_c.html";

  static setTemplatePath(path: PathLike) {
    this.templatePath = path;
  }

  static setEncoding(encoding: BufferEncoding) {
    this.encoding = encoding;
  }

  static getHTMLTemplatePath(
    htmlFileName = PDFInvoiceConfig.defaultInvoiceFileName
  ) {
    return `${this.templatePath}/${htmlFileName}`;
  }

  static getQrUrl(qrString: string) {
    return `${this.baseQrUrl}${qrString}`;
  }
}

export class PDFInvoice {
  constructor(private payload: GenerateInvoiceParams) {}

  /**
   * QR content based on AFIP specifications
   *
   * URL https://www.afip.gob.ar/fe/qr/especificaciones.asp
   *
   * @returns string
   */
  async getQr(): Promise<string> {
    const qrContent = this.getQrContent(this.payload);
    const qrContentBase64 = Buffer.from(JSON.stringify(qrContent)).toString(
      "base64"
    );
    const url = PDFInvoiceConfig.getQrUrl(qrContentBase64);
    return QR.toBase64(url);
  }

  /**
   * Get QR content based on invoice data
   *
   * @param params GenerateInvoiceParams
   * @returns QRContent
   */
  private getQrContent({
    header,
    meta,
    info,
  }: GenerateInvoiceParams): QRContent {
    let tipoCmp: number = meta?.tipoCmp || 0;
    if (!meta?.tipoCmp)
      if (InvoiceTypeMap.has(header.type))
        tipoCmp = InvoiceTypeMap.get(header.type) as number;
      else
        throw new Error("Invalid invoice type to generate the invoice QR code");

    return {
      ver: meta?.ver || 1,
      fecha: info.caeDate,
      cuit: parseInt(header.business.cuit),
      ptoVta: parseInt(header.business.salesPoint),
      tipoCmp,
      nroCmp: parseInt(header.business.invoiceNumber),
      importe: meta?.importe || parseFloat(info.total),
      moneda: meta?.moneda || "PES",
      ctz: meta?.ctz || 1,
      tipoDocRec: meta?.tipoDocRec || 80,
      nroDocRec: meta?.nroDocRec || parseInt(header.client.cuit),
      tipoCodAut: meta?.tipoCodAut || "E",
      codAut: parseInt(info.caeNumber),
    };
  }

  /**
   * Read invoice template from file system and return its content
   *
   * @param templatePath
   * @param encoding
   * @returns
   */
  private async readInvoiceTemplate(
    templatePath: PathLike | FileHandle,
    encoding: BufferEncoding
  ): Promise<string> {
    return readFile(templatePath, encoding);
  }

  /**
   * Save invoice PDF in the specified path
   *
   * @param pdfBuffer
   * @param path
   */
  private async saveInvoice(pdfBuffer: Buffer, path: FilePath): Promise<void> {
    await writeFile(path, pdfBuffer);
  }

  /**
   * Compile invoice template
   * @param template string
   * @returns
   */
  async compilePdfTemplate(template: string) {
    const compiler = new TemplateCompiler<InvoiceTemplateParams>(template, {
      qr: await this.getQr(),
      ...this.payload,
    });
    return compiler.execute();
  }

  /**
   * Generate invoice PDF from buffer
   *
   * @param template CreatePDFFromBuffer
   * @returns
   */
  async createPDF({ template, saveIn }: CreatePDFFromBuffer) {
    const templateCompiled = await this.compilePdfTemplate(template);
    const buffer = await PDF.generateFromHTML(templateCompiled);
    if (saveIn) await this.saveInvoice(buffer, saveIn);
    return buffer;
  }

  /**
   * Generate invoice PDF. Default invoice template is used if no templatePath is provided.
   *
   * @returns Promise<Buffer>
   * @throws Error
   */
  async createPDFFromPath(params?: CreatePDFFromPath): Promise<Buffer> {
    const { templatePath, encoding, saveIn } = params || {};
    let htmlContent: string;
    try {
      htmlContent = await this.readInvoiceTemplate(
        templatePath || PDFInvoiceConfig.getHTMLTemplatePath(),
        encoding || PDFInvoiceConfig.encoding
      );
    } catch (error) {
      console.log("Error reading invoice template", error);
      throw new Error("Error reading invoice template: " + error.message);
    }
    return this.createPDF({ template: htmlContent, saveIn });
  }
}
