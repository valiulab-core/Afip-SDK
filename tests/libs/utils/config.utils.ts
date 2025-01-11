import { resolve } from "path";
import { readFileSync } from "fs";
import { config } from "dotenv";
import { promises as fs } from "fs";
import EnvTest from "./env-test";
config();

export class TestConfigUtils {
  static getTestCredentialsFolder() {
    return EnvTest.testCredentialsFolder;
  }
  static getKeyPath() {
    return resolve(
      `/${EnvTest.testCredentialsFolder}/${EnvTest.testPrivateKeyFileName}`
    );
  }
  static getCertPath() {
    return resolve(
      `/${EnvTest.testCredentialsFolder}/${EnvTest.testCertFileName}`
    );
  }
  static async getKey(): Promise<string> {
    const filePath = TestConfigUtils.getKeyPath();

    try {
      await fs.access(filePath, fs.constants.F_OK);
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      return "test_key";
    }

    return readFileSync(filePath, { encoding: "utf8" });
  }
  static async getCert(): Promise<string> {
    const filePath = TestConfigUtils.getCertPath();

    try {
      await fs.access(filePath, fs.constants.F_OK);
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      return "test_cert";
    }

    return readFileSync(filePath, { encoding: "utf8" });
  }
}
