# Facturación Electrónica


Los métodos de este Web Service se encuentran disponibles en `afip.electronicBillingService`

La especificación de este Web Service se encuentra disponible [aquí](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

<strong> 
</strong>

`Nota:`
Hablaremos de `comprobante` indistintamente si es una `factura`, nota de crédito, etc

<h2> Índice </h2>

[[toc]]

## Obtener número del último comprobante creado

Debemos utilizar el método `getLastVoucher` con los parámetros punto de venta y tipo de comprobante que queremos consultar.

```js
const lastVoucher = await afip.electronicBillingService.getLastVoucher(1, 6); //Devuelve el número del último comprobante creado para el punto de venta 1 y el tipo de comprobante 6 (Factura B)
```

Para mas información acerca de este método ver el item 4.15 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Crear y asignar CAE a un comprobante

Debemos utilizar el método `createVoucher` pasándole como parámetro un Objeto con los detalles del comprobante y si queremos tener la respuesta completa enviada por el WS debemos pasarle como segundo parámetro `true`, en caso de no enviarle el segundo parámetro nos devolverá como respuesta `{ CAE : CAE asignado el comprobante, CAEFchVto : Fecha de vencimiento del CAE (yyyy-mm-dd) }`.

```js
const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

let data = {
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

// Tip: .createInvoice() es un alias de .createVoucher()
const res = await afip.electronicBillingService.createVoucher(data);
```

Este método acepta mas parámetros, pueden ver todos los parámetros disponibles [Aqui](https://github.com/valiulab/afip.ts/blob/main/src/interfaces/index.ts#L5)

Para mas información acerca de este método ver el item 4.1 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Crear y asignar CAE a siguiente comprobante

Debemos utilizar el método `createNextVoucher` pasándole como parámetro un Objeto con los detalles del comprobante al igual que el método `createVoucher`, nos devolverá como respuesta `{ CAE : CAE asignado al comprobante, CAEFchVto : Fecha de vencimiento del CAE (yyyy-mm-dd), voucher_number : Número asignado al comprobante }`.

```js
const res = await afip.electronicBillingService.createNextVoucher(data);
```

## Obtener información de un comprobante

Con este método podemos obtener toda la información relacionada a un comprobante o simplemente saber si el comprobante existe, debemos ejecutar el método `getVoucherInfo` pasándole como parámetros el número de comprobante, el punto de venta y el tipo de comprobante, nos devolverá un Objeto con toda la información del comprobante o `null` si el comprobante no existe.

```js
const voucherInfo = await afip.electronicBillingService.getVoucherInfo(1, 1, 6); //Devuelve la información del comprobante 1 para el punto de venta 1 y el tipo de comprobante 6 (Factura B)

if (voucherInfo === null) {
  console.log("El comprobante no existe");
} else {
  console.log("Esta es la información del comprobante:");
  console.log(voucherInfo);
}
```

Para mas información acerca de este método ver el item 4.19 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener puntos de venta disponibles

```js
const salesPoints = await afip.electronicBillingService.getSalesPoints();
```

## Obtener tipos de comprobantes disponibles

```js
const voucherTypes = await afip.electronicBillingService.getVoucherTypes();
```

Para mas información acerca de este método ver el item 4.4 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de conceptos disponibles

```js
const conceptTypes = await afip.electronicBillingService.getConceptTypes();
```

Para mas información acerca de este método ver el item 4.5 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de documentos disponibles

```js
const documentTypes = await afip.electronicBillingService.getDocumentTypes();
```

Para mas información acerca de este método ver el item 4.6 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de alícuotas disponibles

```js
const aloquotTypes = await afip.electronicBillingService.getAliquotTypes();
```

Para mas información acerca de este método ver el item 4.7 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de monedas disponibles

```js
const currenciesTypes =
  await afip.electronicBillingService.getCurrenciesTypes();
```

Para mas información acerca de este método ver el item 4.8 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de opciones disponibles para el comprobante

```js
const optionTypes = await afip.electronicBillingService.getOptionsTypes();
```

Para mas información acerca de este método ver el item 4.9 de la [especificacion del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener tipos de tributos disponibles

```js
const taxTypes = await afip.electronicBillingService.getTaxTypes();
```

Para mas información acerca de este método ver el item 4.10 de la [especificación del Web service](http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf)

## Obtener estado del servidor

Para esto utilizaremos el método `getServerStatus`

```js
const serverStatus = await afip.electronicBillingService.getServerStatus();

console.log("Este es el estado del servidor:");
console.log(serverStatus);
```
