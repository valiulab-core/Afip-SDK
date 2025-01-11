import { config } from "dotenv";

export class Environment {
  public readonly testCredentialsFolder: string;
  public readonly testPrivateKeyFileName: string;
  public readonly testCertFileName: string;
  public readonly nodeEnv: string;

  constructor() {
    config();
    this.testCredentialsFolder = process.env.TEST_CREDENTIALS_FOLDER as string;
    this.testPrivateKeyFileName = process.env
      .TEST_PRIVATE_KEY_FILE_NAME as string;
    this.testCertFileName = process.env.TEST_CERT_FILE_NAME as string;
    this.nodeEnv = (process.env.NODE_ENV || "local") as string;
  }

  checkEnv(): void {
    try {
      if (!this.testCredentialsFolder)
        throw new Error("TEST_CREDENTIALS_FOLDER");
      if (!this.testPrivateKeyFileName)
        throw new Error("TEST_PRIVATE_KEY_FILE_NAME");
      if (!this.testCertFileName) throw new Error("TEST_CERT_FILE_NAME");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(
        `Env parameter not defined on .env file: ${error.message}`
      );
    }
  }
}

const Env = new Environment();

export default Env;
