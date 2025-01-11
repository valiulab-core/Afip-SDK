import { testCuit } from "../mocks/data/voucher.mock";
import { Afip } from "../../src/afip";
import { TestConfigUtils } from "../libs/utils/config.utils";
import { mockLoginCredentials } from "../mocks/data/credential-json.mock";
import { RegisterScopeThirteenService } from "../../src/services/register-scope-thirteen.service";
import {
  scopeThirteenDummyAsyncReturnMocks,
  scopeThirteenGetPersonaAsyncReturnMocks,
} from "../mocks/data/soapClient.mock";

describe("Register Scope Thirteen Service", () => {
  const originalNodeTlsRejectUnauthStatus =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  let registerScopeThirteenService: RegisterScopeThirteenService;
  const cuitPayload = 20111111111;

  beforeAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  });

  afterAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED =
      originalNodeTlsRejectUnauthStatus;
  });

  beforeEach(async () => {
    registerScopeThirteenService = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    }).registerScopeThirteenService;

    registerScopeThirteenService.getWsAuth = jest.fn().mockReturnValue({
      Auth: {
        Token: mockLoginCredentials.credentials.token,
        Sign: mockLoginCredentials.credentials.sign,
        Cuit: testCuit,
      },
    });

    const afipMockParams = {
      dummyAsync: jest
        .fn()
        .mockResolvedValue(scopeThirteenDummyAsyncReturnMocks),
      getPersonaAsync: jest
        .fn()
        .mockResolvedValue(scopeThirteenGetPersonaAsyncReturnMocks),
    } as any;

    jest
      .spyOn(registerScopeThirteenService, "getClient")
      .mockReturnValue(afipMockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get server status", async () => {
    expect(await registerScopeThirteenService.getServerStatus()).toEqual(
      scopeThirteenDummyAsyncReturnMocks[0]
    );
  });

  it("should get taxpayer details", async () => {
    expect(
      await registerScopeThirteenService.getTaxpayerDetails(cuitPayload)
    ).toStrictEqual(scopeThirteenGetPersonaAsyncReturnMocks[0].personaReturn);
  });
});
