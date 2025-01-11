/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FECAESolicitarAsyncReturnMocks,
  FECompConsultarAsyncReturnMocks,
  FECompUltimoAutorizadoAsyncReturnMocks,
  FEDummyAsyncReturnMocks,
  FEParamGetPtosVentaAsyncReturnMocks,
  FEParamGetTiposCbteAsyncReturnMocks,
  FEParamGetTiposConceptoAsyncReturnMocks,
  FEParamGetTiposDocAsyncReturnMocks,
  FEParamGetTiposIvaAsyncReturnMocks,
  FEParamGetTiposMonedasAsyncReturnMocks,
  FEParamGetTiposOpcionalAsyncReturnMocks,
  FEParamGetTiposTributosAsyncReturnMocks,
} from "../mocks/data/soapClient.mock";
import {
  data,
  testCbteNro,
  testCbteTipo,
  testCuit,
  testPtoVta,
} from "../mocks/data/voucher.mock";
import { Afip } from "../../src/afip";
import { TestConfigUtils } from "./../libs/utils/config.utils";
import { AccessTicket } from "../../src/auth/access-ticket";
import { mockLoginCredentials } from "../mocks/data/credential-json.mock";

describe("Electronic Billings Service", () => {
  let afip: Afip;
  let afipRemote: Afip;

  beforeEach(async () => {
    afip = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    });

    afipRemote = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
      handleTicket: true,
    });

    const afipMockParams = {
      FEDummyAsync: jest.fn().mockResolvedValue(FEDummyAsyncReturnMocks),
      FEParamGetPtosVentaAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetPtosVentaAsyncReturnMocks),
      FECompUltimoAutorizadoAsync: jest
        .fn()
        .mockResolvedValue(FECompUltimoAutorizadoAsyncReturnMocks),
      FECAESolicitarAsync: jest
        .fn()
        .mockResolvedValue(FECAESolicitarAsyncReturnMocks),
      FECompConsultarAsync: jest
        .fn()
        .mockResolvedValue(FECompConsultarAsyncReturnMocks),
      FEParamGetTiposCbteAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposCbteAsyncReturnMocks),
      FEParamGetTiposConceptoAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposConceptoAsyncReturnMocks),
      FEParamGetTiposDocAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposDocAsyncReturnMocks),
      FEParamGetTiposIvaAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposIvaAsyncReturnMocks),
      FEParamGetTiposMonedasAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposMonedasAsyncReturnMocks),
      FEParamGetTiposOpcionalAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposOpcionalAsyncReturnMocks),
      FEParamGetTiposTributosAsync: jest
        .fn()
        .mockResolvedValue(FEParamGetTiposTributosAsyncReturnMocks),
    } as any;

    jest
      .spyOn(afip.electronicBillingService, "getClient")
      .mockReturnValue(afipMockParams);
    jest
      .spyOn(afipRemote.electronicBillingService, "getClient")
      .mockReturnValue(afipMockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get server status", async () => {
    const { electronicBillingService } = afip;
    const status = await electronicBillingService.getServerStatus();
    expect(status).toEqual(FEDummyAsyncReturnMocks[0]);
  });

  it("should get the last type 11 voucher from sale point 2", async () => {
    const { electronicBillingService } = afip;
    const lastVoucher = await electronicBillingService.getLastVoucher(
      testPtoVta,
      testCbteTipo
    );
    expect(lastVoucher).toStrictEqual(
      FECompUltimoAutorizadoAsyncReturnMocks[0].FECompUltimoAutorizadoResult
    );
  });

  it("should get sales points", async () => {
    const { electronicBillingService } = afip;
    const status = await electronicBillingService.getSalesPoints();
    expect(status).not.toBeNull();
  });

  it("should create a voucher from correct params with createVoucher", async () => {
    const { electronicBillingService } = afip;
    const lastVoucher = await electronicBillingService.getLastVoucher(
      testPtoVta,
      testCbteTipo
    );
    const CbteDesde = lastVoucher.CbteNro + 1;
    const CbteHasta = lastVoucher.CbteNro + 1;
    const voucher = await electronicBillingService.createVoucher({
      ...data,
      CbteDesde,
      CbteHasta,
    });
    expect(voucher.response.Errors).toBeUndefined();
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteDesde).toEqual(
      CbteDesde
    );
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteHasta).toEqual(
      CbteHasta
    );
  });

  it("should create the next voucher using the previous voucher created as a starting point", async () => {
    const { electronicBillingService } = afip;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { CbteDesde, CbteHasta, ...voucherData } = data;
    const voucher = await electronicBillingService.createNextVoucher(
      voucherData
    );
    expect(voucher.response.Errors).toBeUndefined();
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteDesde).toEqual(
      testCbteNro + 1
    );
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteHasta).toEqual(
      testCbteNro + 1
    );
  });

  it("should get voucher info", async () => {
    expect(
      await afip.electronicBillingService.getVoucherInfo(
        testCbteNro,
        testPtoVta,
        testCbteTipo
      )
    ).toStrictEqual(FECompConsultarAsyncReturnMocks[0].FECompConsultarResult);
  });

  it("should get sales points with an authorized ticket after an initialization of afib with handleTicket true", async () => {
    const { electronicBillingService } = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
      handleTicket: true,
    });

    const afipAuthMock = {
      login: jest
        .fn()
        .mockResolvedValue(new AccessTicket(mockLoginCredentials)),
    };

    electronicBillingService["_afipAuth"] = afipAuthMock as any;

    jest.spyOn(electronicBillingService, "getWsAuth");
    const ticket = await electronicBillingService.login();
    electronicBillingService.setCredentials(ticket);
    const status = await electronicBillingService.getSalesPoints();
    expect(status).not.toBeNull();
    expect(electronicBillingService.getWsAuth).toHaveBeenCalled();
  });

  it("should create a voucher with an authorized ticket after an initialization of afib with handleTicket true", async () => {
    const { electronicBillingService } = afipRemote;
    const afipAuthMock = {
      login: jest
        .fn()
        .mockResolvedValue(new AccessTicket(mockLoginCredentials)),
    };

    electronicBillingService["_afipAuth"] = afipAuthMock as any;

    const ticket = await electronicBillingService.login();
    electronicBillingService.setCredentials(ticket);
    const { CbteDesde, CbteHasta, ...voucherData } = data;
    const voucher = await electronicBillingService.createNextVoucher(
      voucherData
    );
    expect(voucher.response.Errors).toBeUndefined();
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteDesde).toEqual(
      testCbteNro + 1
    );
    expect(voucher.response.FeDetResp.FECAEDetResponse[0].CbteHasta).toEqual(
      testCbteNro + 1
    );
  });

  it("should get voucher types", async () => {
    expect(await afip.electronicBillingService.getVoucherTypes()).toStrictEqual(
      FEParamGetTiposCbteAsyncReturnMocks[0].FEParamGetTiposCbteResult
    );
  });

  it("should get concept types", async () => {
    expect(await afip.electronicBillingService.getConceptTypes()).toStrictEqual(
      FEParamGetTiposConceptoAsyncReturnMocks[0].FEParamGetTiposConceptoResult
    );
  });

  it("should get document types", async () => {
    expect(
      await afip.electronicBillingService.getDocumentTypes()
    ).toStrictEqual(
      FEParamGetTiposDocAsyncReturnMocks[0].FEParamGetTiposDocResult
    );
  });

  it("should get aliquota types", async () => {
    expect(await afip.electronicBillingService.getAliquotTypes()).toStrictEqual(
      FEParamGetTiposIvaAsyncReturnMocks[0].FEParamGetTiposIvaResult
    );
  });

  it("should get currencies types", async () => {
    expect(
      await afip.electronicBillingService.getCurrenciesTypes()
    ).toStrictEqual(
      FEParamGetTiposMonedasAsyncReturnMocks[0].FEParamGetTiposMonedasResult
    );
  });

  it("should get Options types", async () => {
    expect(await afip.electronicBillingService.getOptionsTypes()).toStrictEqual(
      FEParamGetTiposOpcionalAsyncReturnMocks[0].FEParamGetTiposOpcionalResult
    );
  });

  it("should get Tax types", async () => {
    expect(await afip.electronicBillingService.getTaxTypes()).toStrictEqual(
      FEParamGetTiposTributosAsyncReturnMocks[0].FEParamGetTiposTributosResult
    );
  });
});
