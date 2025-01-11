import { mockLoginCredentials } from "./../mocks/data/credential-json.mock";
import { AfipAuth } from "./../../src/auth/afip-auth";
import { ServiceNamesEnum } from "../../src/libs/soap/service-names.enum";
import { Context, ILoginCredentials } from "./../../src/types";
import { AccessTicket } from "../../src/auth/access-ticket";
import moment from "moment";
import { promises as fs } from "fs";

jest.mock("../../src/soap/soap-client-facade", () => ({
  create: jest.fn(() => ({
    loginCmsAsync: jest.fn(() => {
      return [{ loginCmsReturn: "" }, "", {}, ""];
    }),
  })),
}));

jest.mock("../../src/utils/parser", () => ({
  jsonToXml: jest.fn((json) => JSON.stringify(json)),
  xmlToJson: jest.fn((xml) => JSON.parse(xml)),
}));

jest.mock("../../src/utils/crypt-data", () => ({
  Cryptography: jest.fn(() => ({
    sign: jest.fn(() => "signedTRA"),
  })),
}));

jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn().mockReturnValue(JSON.stringify(mockLoginCredentials)),
    constants: {
      F_OK: 0,
      R_OK: 4,
    },
    access: jest.fn(() => true), // Always return true for file existence check
  },
}));

jest.mock("../../src/utils/logger", () => ({
  error: jest.fn(),
}));

describe("AfipAuth", () => {
  const mockContext: Context = {
    cuit: 123456789,
    cert: "mock-cert",
    key: "mock-key",
  };

  const serviceName = ServiceNamesEnum.WSFE;

  const credentials: ILoginCredentials = {
    header: [
      { version: "1.0" },
      {
        source: "source",
        destination: "destination",
        uniqueid: "uniqueid",
        generationtime: moment().toISOString(),
        expirationtime: moment().add(1, "day").toISOString(),
      },
    ],
    credentials: { sign: "mock-signature", token: "mock-token" },
  };

  describe("getAccessTicket", () => {
    it("should return a access ticket of login", async () => {
      const ticket = new AccessTicket(credentials);
      const afipAuth = new AfipAuth({
        ...mockContext,
        handleTicket: true,
      });
      afipAuth["requestLogin"] = jest.fn().mockResolvedValue(ticket);
      afipAuth["getLocalAccessTicket"] = jest.fn();

      const accessTicket = await afipAuth.login(serviceName);

      expect(accessTicket).toBeInstanceOf(AccessTicket);
      expect(accessTicket).toStrictEqual(ticket);
      expect(afipAuth["requestLogin"]).toBeCalled();
      expect(afipAuth["getLocalAccessTicket"]).not.toBeCalled();
    });

    it("should return a new access ticket if not found locally", async () => {
      const afipAuth = new AfipAuth(mockContext);

      const accessTicket = await afipAuth.login(serviceName);

      expect(accessTicket).toBeInstanceOf(AccessTicket);
    });

    it("should return a locally cached access ticket if not expired", async () => {
      const afipAuth = new AfipAuth(mockContext);

      // Mock a non-expired local access ticket
      const mockAccessTicket = new AccessTicket(credentials);

      jest
        .spyOn(afipAuth, "getLocalAccessTicket")
        .mockResolvedValue(mockAccessTicket);

      const accessTicket = await afipAuth.login(serviceName);

      expect(accessTicket).toBe(mockAccessTicket);
    });
  });

  describe("saveLocalAccessTicket", () => {
    it("should save the access ticket locally", async () => {
      const afipAuth = new AfipAuth(mockContext);
      const accessTicket = new AccessTicket(credentials);

      await afipAuth.saveLocalAccessTicket(accessTicket, serviceName);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "utf8"
      );
    });
  });
});
