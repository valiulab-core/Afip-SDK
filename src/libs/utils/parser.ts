import { Builder, Parser as xmlParser } from "xml2js";

/**
 * Parser based on node-xml2js package (https://github.com/Leonidas-from-XIV/node-xml2js).
 */
export class Parser {
  static options = {
    normalizeTags: true,
    normalize: true,
    explicitArray: false,
    attrkey: "header",
    tagNameProcessors: [(key: string) => key.replace("soapenv:", "")],
  };

  public static async xmlToJson<T = Record<string, any>>(
    xml: string
  ): Promise<T> {
    const parser = new xmlParser(Parser.options);
    return parser.parseStringPromise(xml);
  }

  public static jsonToXml(obj: Record<string, any>): string {
    return new Builder().buildObject(obj);
  }
}
