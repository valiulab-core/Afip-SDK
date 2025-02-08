# 🚀 Afip SDK

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

[![npm](https://img.shields.io/npm/v/afip.ts.svg?style=flat-square)](https://npmjs.org/package/afip.ts)
![GitHub Repo stars](https://img.shields.io/github/stars/ralcorta/afip.ts)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ralcorta/afip.ts)
![GitHub](https://img.shields.io/github/license/ralcorta/afip.ts)
![npm](https://img.shields.io/npm/dt/afip.ts)


<br />
<p align="center">
  <a href="https://github.com/ralcorta/afip.ts">
    <img src="https://user-images.githubusercontent.com/19806540/198080937-468e851b-2ae4-40a7-b2c5-cb929ff7749a.png" alt="afip.ts" width="230">
  </a>

  <h3 align="center">Afip Ts</h3>

  <p align="center">
    SDK para consumir y usar los Web Services de AFIP
    <br />
    <a href="https://ralcorta.github.io/afip.ts">Ver documentacion completa</a>
    <br />
    <br />
    <small> 
        Inspirado en <a href="https://github.com/AfipSDK/afip.js">afip.js</a> 
      <br />
      <a href="https://github.com/ralcorta/afip.ts/issues">Reportar un bug</a>
    </small>
  </p>
</p>


<br />
<p align="center">
<a href='https://cafecito.app/rodrigoalcorta' rel='noopener' target='_blank'><img srcset='https://cdn.cafecito.app/imgs/buttons/button_5.png 1x, https://cdn.cafecito.app/imgs/buttons/button_5_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_5_3.75x.png 3.75x' src='https://cdn.cafecito.app/imgs/buttons/button_5.png' alt='Invitame un café en cafecito.app' /></a>
</p>

## Guia

### Instalación

##### NPM

```sh
npm i afip.ts --save
```

##### Yarn

```sh
yarn add afip.ts
```

### Uso de la SDK

##### Requisitos previos

Se debe tener los certificados emitidos por AFIP, ya sean para los servidores de homologacion (test) o produccion, para poder pasarselos como parametro al paquete y que este haga uso de ellos para comunicarse con los web services.

- [Guia de como obtenerlos](https://ralcorta.github.io/afip.ts/tutorial/enable_testing_certificates.html)
- [Documentacion oficial de certificados](https://www.afip.gob.ar/ws/documentacion/certificados.asp)

##### Ejemplo basico

Ejemplo de como generar factura electronica:

```ts
import { Afip } from "afip.ts";

const afip: Afip = new Afip({
  key: "private_key_content",
  cert: "crt_content",
  cuit: 20111111112,
});

const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

const payload = {
  CantReg: 1, // Cantidad de comprobantes a registrar
  PtoVta: 1, // Punto de venta
  CbteTipo: 6, // Tipo de comprobante (ver tipos disponibles)
  Concepto: 1, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
  DocTipo: 99, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
  DocNro: 0, // Número de documento del comprador (0 consumidor final)
  CbteDesde: 1, // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
  CbteHasta: 1, // Número de comprobante o numero del último comprobante en caso de ser mas de uno
  CbteFch: parseInt(date.replace(/-/g, "")), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
  ImpTotal: 121, // Importe total del comprobante
  ImpTotConc: 0, // Importe neto no gravado
  ImpNeto: 100, // Importe neto gravado
  ImpOpEx: 0, // Importe exento de IVA
  ImpIVA: 21, //Importe total de IVA
  ImpTrib: 0, //Importe total de tributos
  MonId: "PES", //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
  MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
  CondicionIVAReceptorId: 1, // Condición de IVA del receptor
  Iva: [
    // (Opcional) Alícuotas asociadas al comprobante
    {
      Id: 5, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles)
      BaseImp: 100, // Base imponible
      Importe: 21, // Importe
    },
  ],
};


const invoice = await afip.electronicBillingService.createInvoice(payload);

```

Ejemplo de otros endpoints:
```ts
const points = await afip.electronicBillingService.getSalesPoints();
```

## Caracteristicas

Toda configuracion del package es pasada por el constructor de la clase `Afip` la cual recibe [Context](https://www.afipts.com/guide/config.html).

Caracteristicas:
- Escrito enteramente con `Typescript`
- Soporte para `Serverless`. El package permite manejar los token de autenticacion de manera aislada. 

Para mas <strong>documentacion</strong>, ir al [sitio oficial](https://ralcorta.github.io/afip.ts).

## Desarrollo y contribuciones

### Contribuciones

Si encontras un bug o desaes sugerir algo, revisa de que no haya [issues](https://github.com/ralcorta/afip.ts/issues) con el mismo tema, y de ser asi [puedes generar uno aqui](https://github.com/ralcorta/afip.ts/issues/new).

### Desarrollo

Seria genial si puedes ayudarnos mejorando `afip.ts`. ¿Como hacer?

1. [Clonar](https://github.com/ralcorta/afip.ts).

2. `npm install`.

3. Rompela escribiendo tu codigo.

4. Correr los test: `npm test`.

5. Cear un [Pull Request](https://github.com/ralcorta/afip.ts/compare).

## Licencia

Este proyecto esta bajo la licencia `MIT` - Ver [LICENSE](LICENSE) para mas detalles.

<small>
Este software y sus desarrolladores no tienen ninguna relación con la AFIP.
</small>
