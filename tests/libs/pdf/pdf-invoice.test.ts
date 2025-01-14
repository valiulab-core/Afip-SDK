import { readFile } from "fs/promises";
import { largeInvoiceParamsTest } from "./pdf-invoice-payload";
import { PDFInvoice } from "../../../src/libs/pdf/pdf-invoice";

describe("PDFInvoice", () => {
  describe("compilePdfTemplate", () => {
    it("should create PDF buffer from string template (Invoice B C)", async () => {
      const pdfInvoice = new PDFInvoice(largeInvoiceParamsTest);
      const template = await readFile(
        `${__dirname}/../../../src/libs/pdf/assets/invoice_b_c.html`,
        "utf-8"
      );

      jest.spyOn(pdfInvoice as any, "getQrContent").mockReturnValueOnce({
        ver: 1,
        fecha: "2020-10-13",
        cuit: 30000000007,
        ptoVta: 10,
        tipoCmp: 11,
        nroCmp: 94,
        importe: 12100,
        moneda: "DOL",
        ctz: 1,
        tipoDocRec: 80,
        nroDocRec: 20000000001,
        tipoCodAut: "E",
        codAut: 70417054367476,
      });

      const compiledTemplate = await pdfInvoice.compilePdfTemplate(template);
      const expectedTemplate = await readFile(
        `${__dirname}/test-b-c-template-compiled.html`,
        "utf-8"
      );

      expect(compiledTemplate).toEqual(expectedTemplate);
    });
  });
});
