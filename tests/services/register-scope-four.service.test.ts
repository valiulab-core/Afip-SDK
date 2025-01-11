import { testCuit } from "../mocks/data/voucher.mock";
import { Afip } from "../../src/afip";
import { TestConfigUtils } from "../libs/utils/config.utils";
import {
  scopeFourDummyAsyncReturnMocks,
  scopeFourGetPersonaAsyncReturnMocks,
} from "../mocks/data/soapClient.mock";
import { mockLoginCredentials } from "../mocks/data/credential-json.mock";
import { RegisterScopeFourService } from "../../src/services/register-scope-four.service";

describe("Register Scope Four Service", () => {
  const originalNodeTlsRejectUnauthStatus =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  let registerScopeFourService: RegisterScopeFourService;
  const cuitPayload = 20111111111;

  beforeAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  });

  afterAll(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED =
      originalNodeTlsRejectUnauthStatus;
  });

  beforeEach(async () => {
    registerScopeFourService = new Afip({
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    }).registerScopeFourService;

    registerScopeFourService.getWsAuth = jest.fn().mockReturnValue({
      Auth: {
        Token: mockLoginCredentials.credentials.token,
        Sign: mockLoginCredentials.credentials.sign,
        Cuit: testCuit,
      },
    });

    const afipMockParams = {
      dummyAsync: jest.fn().mockResolvedValue(scopeFourDummyAsyncReturnMocks),
      getPersonaAsync: jest
        .fn()
        .mockResolvedValue(scopeFourGetPersonaAsyncReturnMocks),
    } as any;

    jest
      .spyOn(registerScopeFourService, "getClient")
      .mockReturnValue(afipMockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get server status", async () => {
    expect(await registerScopeFourService.getServerStatus()).toEqual(
      scopeFourDummyAsyncReturnMocks[0]
    );
  });

  it("should get taxpayer details", async () => {
    expect(
      await registerScopeFourService.getTaxpayerDetails(cuitPayload)
    ).toStrictEqual(scopeFourGetPersonaAsyncReturnMocks[0].personaReturn);
  });
});
