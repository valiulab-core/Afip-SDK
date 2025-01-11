import { testCuit } from "./../mocks/data/voucher.mock";
import { Afip } from "../../src/afip";
import { TestConfigUtils } from "../libs/utils/config.utils";
import {
  dummyAsyncReturnMocks,
  getPersonaList_v2AsyncReturnMocks,
  getPersona_v2AsyncReturnMocks,
} from "../mocks/data/soapClient.mock";
import { mockLoginCredentials } from "../mocks/data/credential-json.mock";
import { RegisterScopeFiveService } from "../../src/services/register-scope-five.service";

describe("Register Scope Five Service", () => {
  const originalNodeTlsRejectUnauthStatus =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  let registerScopeFiveService: RegisterScopeFiveService;
  const cuitPayload = 20111111111;

  beforeAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  });

  afterAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED =
      originalNodeTlsRejectUnauthStatus;
  });

  beforeEach(async () => {
    registerScopeFiveService = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    }).registerScopeFiveService;

    registerScopeFiveService.getWsAuth = jest.fn().mockReturnValue({
      Auth: {
        Token: mockLoginCredentials.credentials.token,
        Sign: mockLoginCredentials.credentials.sign,
        Cuit: testCuit,
      },
    });

    const afipMockParams = {
      dummyAsync: jest.fn().mockResolvedValue(dummyAsyncReturnMocks),
      getPersona_v2Async: jest
        .fn()
        .mockResolvedValue(getPersona_v2AsyncReturnMocks),
      getPersonaList_v2Async: jest
        .fn()
        .mockResolvedValue(getPersonaList_v2AsyncReturnMocks),
    } as any;

    jest
      .spyOn(registerScopeFiveService, "getClient")
      .mockReturnValue(afipMockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get server status", async () => {
    const status = await registerScopeFiveService.getServerStatus();
    expect(status).toEqual(dummyAsyncReturnMocks[0]);
  });

  it("should get taxpayer details", async () => {
    const details = await registerScopeFiveService.getTaxpayerDetails(
      cuitPayload
    );
    expect(details).toStrictEqual(
      getPersona_v2AsyncReturnMocks[0].personaReturn
    );
  });

  it("should get taxpayers details", async () => {
    const details = await registerScopeFiveService.getTaxpayersDetails([
      cuitPayload,
      cuitPayload,
    ]);
    expect(details).toStrictEqual(
      getPersonaList_v2AsyncReturnMocks[0].personaListReturn
    );
  });
});
