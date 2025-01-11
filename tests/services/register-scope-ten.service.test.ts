import { testCuit } from "../mocks/data/voucher.mock";
import { Afip } from "../../src/afip";
import { TestConfigUtils } from "../libs/utils/config.utils";
import { mockLoginCredentials } from "../mocks/data/credential-json.mock";
import { RegisterScopeTenService } from "../../src/services/register-scope-ten.service";
import {
  scopeTenDummyAsyncReturnMocks,
  scopeTenGetPersonaAsyncReturnMocks,
} from "../mocks/data/soapClient.mock";

describe("Register Scope Ten Service", () => {
  const originalNodeTlsRejectUnauthStatus =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  let registerScopeTenService: RegisterScopeTenService;
  const cuitPayload = 20111111111;

  beforeAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  });

  afterAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED =
      originalNodeTlsRejectUnauthStatus;
  });

  beforeEach(async () => {
    registerScopeTenService = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    }).registerScopeTenService;

    registerScopeTenService.getWsAuth = jest.fn().mockReturnValue({
      Auth: {
        Token: mockLoginCredentials.credentials.token,
        Sign: mockLoginCredentials.credentials.sign,
        Cuit: testCuit,
      },
    });

    const afipMockParams = {
      dummyAsync: jest.fn().mockResolvedValue(scopeTenDummyAsyncReturnMocks),
      getPersonaAsync: jest
        .fn()
        .mockResolvedValue(scopeTenGetPersonaAsyncReturnMocks),
    } as any;

    jest
      .spyOn(registerScopeTenService, "getClient")
      .mockReturnValue(afipMockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get server status", async () => {
    expect(await registerScopeTenService.getServerStatus()).toEqual(
      scopeTenDummyAsyncReturnMocks[0]
    );
  });

  it("should get taxpayer details", async () => {
    expect(
      await registerScopeTenService.getTaxpayerDetails(cuitPayload)
    ).toStrictEqual(scopeTenGetPersonaAsyncReturnMocks[0].personaReturn);
  });
});
