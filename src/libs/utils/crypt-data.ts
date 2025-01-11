import forge from "node-forge";

export class Cryptography {
  constructor(private readonly cert: string, private readonly key: string) {}
  sign(data: string): string {
    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(data, "utf8");
    try {
      p7.addCertificate(this.cert);
    } catch (error) {
      throw new Error("Invalid PEM formatted message. Check your cert.");
    }
    p7.addSigner({
      authenticatedAttributes: [
        {
          type: forge.pki.oids.contentType,
          value: forge.pki.oids.data,
        },
        {
          type: forge.pki.oids.messageDigest,
        },
        {
          type: forge.pki.oids.signingTime,
          value: new Date() as any,
        },
      ],
      certificate: this.cert,
      digestAlgorithm: forge.pki.oids.sha256,
      key: this.key,
    });
    p7.sign();
    const bytes = forge.asn1.toDer(p7.toAsn1()).getBytes();
    return Buffer.from(bytes, "binary").toString("base64");
  }
}
