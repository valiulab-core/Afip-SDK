import { mockLoginCredentials } from "./../mocks/data/credential-json.mock";
import moment from "moment";
import { AccessTicket } from "../../src/auth/access-ticket";
import { ILoginCredentials } from "../../src/types";
import EnvTest from "../libs/utils/env-test";

describe("Access Ticket", () => {
  describe("getSign", () => {
    it("should return the sign", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      expect(accessTicket.getSign()).toBe(
        mockLoginCredentials.credentials.sign
      );
    });
  });

  describe("getToken", () => {
    it("should return the token", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      expect(accessTicket.getToken()).toBe(
        mockLoginCredentials.credentials.token
      );
    });
  });

  describe("getExpiration", () => {
    it("should return the expiration date as a Date object", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      const expirationDate = accessTicket.getExpiration();
      expect(expirationDate instanceof Date).toBe(true);
    });
  });

  describe("getHeaders", () => {
    it("should return the headers", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      const headers = accessTicket.getHeaders();
      expect(headers).toEqual([
        { version: "1.0" },
        {
          source: "source",
          destination: "destination",
          uniqueid: "uniqueid",
          generationtime: expect.any(String),
          expirationtime: expect.any(String),
        },
      ]);
    });
  });

  describe("getCredentials", () => {
    it("should return the credentials", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      const credentials = accessTicket.getCredentials();
      expect(credentials).toEqual({
        sign: mockLoginCredentials.credentials.sign,
        token: mockLoginCredentials.credentials.token,
      });
    });
  });

  describe("getWSAuthFormat", () => {
    it("should return the authentication key properties", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      const authKeyProps = accessTicket.getWSAuthFormat(parseInt(EnvTest.cuit));
      expect(authKeyProps).toEqual({
        Auth: {
          Token: mockLoginCredentials.credentials.token,
          Sign: mockLoginCredentials.credentials.sign,
          Cuit: parseInt(EnvTest.cuit),
        },
      });
    });
  });

  describe("isExpired", () => {
    it("should return true if the access ticket is expired", () => {
      const expiredCredentials: ILoginCredentials = {
        header: [
          {
            version: "1.0",
          },
          {
            source: "source",
            destination: "destination",
            uniqueid: "uniqueid",
            generationtime: moment().toISOString(),
            expirationtime: moment().subtract(1, "day").toISOString(),
          },
        ],
        credentials: {
          sign: mockLoginCredentials.credentials.sign,
          token: mockLoginCredentials.credentials.token,
        },
      };
      const accessTicket = new AccessTicket(expiredCredentials);
      expect(accessTicket.isExpired()).toBe(true);
    });

    it("should return false if the access ticket is not expired", () => {
      const accessTicket = new AccessTicket(mockLoginCredentials);
      expect(accessTicket.isExpired()).toBe(false);
    });
  });
});
