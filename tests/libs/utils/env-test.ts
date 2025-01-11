import { Environment } from "../../../src/libs/utils/env";

class EnvirnonmentTest extends Environment {
  cuit: string;
  testCredentialsFolder: string;
  testPrivateKeyFileName: string;
  testCertFileName: string;
  nodeEnv: string;

  constructor() {
    super();
    this.testCredentialsFolder = (process.env.TEST_CREDENTIALS_FOLDER ??
      "folder_name") as string;
    this.testPrivateKeyFileName = (process.env.TEST_PRIVATE_KEY_FILE_NAME ??
      "priv_key") as string;
    this.testCertFileName = (process.env.TEST_CERT_FILE_NAME ??
      "cert") as string;
    this.nodeEnv = (process.env.NODE_ENV || "local") as string;
    this.cuit = (process.env.CUIT ?? "1123456789") as string;
  }

  checkEnv(): void {
    super.checkEnv();
    try {
      if (!this.cuit) throw new Error("CUIT");
    } catch (error) {
      throw new Error(
        `Env parameter not defined on .env file: ${error.message}`
      );
    }
  }
}

const EnvTest = new EnvirnonmentTest();

export default EnvTest;
