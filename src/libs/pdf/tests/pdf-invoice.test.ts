import { readFile } from "fs/promises";
import { invoiceParamsTest } from "./pdf-invoice-payload";
import { PDFInvoice } from "../pdf-invoice";
import { PDF } from "../utils/pdf";

describe("PDFInvoice", () => {
  describe("createPDF", () => {
    it("should create PDF buffer from string template", async () => {
      // Mock dependencies and setup test conditions
      const pdfInvoice = new PDFInvoice(invoiceParamsTest);
      const template = await readFile(
        `${__dirname}/assets/invoice_b_c-test.html`,
        "utf-8"
      );
      const pdf = await readFile(`${__dirname}/assets/test.pdf`);

      // Mock the methods being called internally
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
      jest.spyOn(pdfInvoice, "getQr").mockResolvedValueOnce("mocked QR string");
      jest
        .spyOn(pdfInvoice as any, "readInvoiceTemplate")
        .mockResolvedValueOnce(template);
      jest
        .spyOn(pdfInvoice as any, "saveInvoice")
        .mockResolvedValueOnce(undefined);
      jest.spyOn(PDF, "generateFromHTML").mockResolvedValueOnce(pdf);

      const result = await pdfInvoice.createPDF({
        template,
      });

      // new PDFInvoice(invoiceParamsTest)
      //   .createPDFFromPath({
      //     templatePath: `${__dirname}/tests/assets/invoice_b_c-test.html`,
      //   })
      //   .then((buffer) => writeFile("test-invoice.pdf", buffer))
      //   .then(() => console.log("Done."));

      // Assert the result
      expect(result).toEqual(pdf);
    });
  });
});
