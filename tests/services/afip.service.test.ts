/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "soap";
import { EndpointsEnum, SoapServiceVersion } from "../../src/enums";
import { AfipService } from "../../src/services/afip.service";
import { IServiceSoap12Soap } from "../../src/libs/soap/interfaces/Service/ServiceSoap12";
import { ServiceNamesEnum } from "../../src/libs/soap/service-names.enum";
import { WsdlPathEnum } from "../../src/libs/soap/wsdl-path.enum";
import { AfipServiceSoapParam, Context } from "../../src/types";
import { testCuit } from "../mocks/data/voucher.mock";
import { TestConfigUtils } from "../libs/utils/config.utils";
import { mockFn } from "../libs/utils/jest.utils";

describe("AfipService", () => {
  let afipService: AfipService<Client>;
  let context: Context;
  let soapParams: AfipServiceSoapParam;

  beforeAll(async () => {
    context = {
      key: await TestConfigUtils.getKey(),
      cert: await TestConfigUtils.getCert(),
      cuit: testCuit,
    };
    soapParams = {
      url: EndpointsEnum.WSFEV1,
      url_test: EndpointsEnum.WSFEV1_TEST,
      wsdl: WsdlPathEnum.WSFE,
      wsdl_test: WsdlPathEnum.WSFE_TEST,
      serviceName: ServiceNamesEnum.WSFE,
      v12: true,
    };
  });

  it("should call AfipAuth login method and return the result", async () => {
    afipService = new AfipService<Client>(context, soapParams);
    const expectedLoginResult = {
      Auth: {
        Token: "your_token",
        Sign: "your_sign",
        Cuit: 123456789,
      },
    };

    const afipAuthMock = {
      login: jest.fn().mockResolvedValue(expectedLoginResult),
    };

    afipService["_afipAuth"] = afipAuthMock as any;

    const result = await afipService.login();

    expect(result).toEqual(expectedLoginResult);
    expect(afipAuthMock.login).toHaveBeenCalledWith(ServiceNamesEnum.WSFE);
  });

  it("should create a proxy client with the correct behavior", async () => {
    afipService = new AfipService<IServiceSoap12Soap>(context, soapParams);
    const methodName = "FEDummy";
    const asyncMethodName = `${methodName}Async`;
    const soapServiceContent = {
      input: {
        Auth: "auth_content",
      },
    };
    const soapServices = {
      [asyncMethodName]: soapServiceContent,
      [methodName]: soapServiceContent,
    };
    const expectedDescribeResult = {
      Service: {
        [SoapServiceVersion.ServiceSoap12]: soapServices,
        [SoapServiceVersion.ServiceSoap]: soapServices,
      },
    };
    const expectedWsAuthResult = {
      Auth: {
        Token: "your_token",
        Sign: "your_sign",
        Cuit: 123456789,
      },
    };
    const methodInput = { param1: "value1", param2: "value2" };

    const soapClientMock: any = {
      describe: jest.fn().mockReturnValue(expectedDescribeResult),
      [asyncMethodName]: mockFn(),
      [methodName]: mockFn(),
    };

    afipService["instanceSoapClient"] = jest
      .fn()
      .mockResolvedValue(soapClientMock);

    afipService["getWsAuth"] = jest
      .fn()
      .mockResolvedValue(expectedWsAuthResult);

    const proxyClient = await afipService["proxySoapClient"]();

    const describeResult = proxyClient.describe();
    expect(describeResult).toEqual(expectedDescribeResult);

    await proxyClient[asyncMethodName](methodInput);

    const nonExistentMethod = "NonExistentMethod";
    const nonExistentMethodResult = proxyClient[nonExistentMethod];
    expect(nonExistentMethodResult).toBeUndefined();

    expect(soapClientMock.describe).toHaveBeenCalled();
    expect(afipService["getWsAuth"]).toHaveBeenCalled();
  });
});
