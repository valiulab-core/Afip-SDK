# Obtención de Certificado de Producción

### Paso 1 - Instalación de OpenSSL
Para generar el certificado de producción, vamos a utilizar OpenSSL, que ya está incluido en sistemas Linux/Unix. Si estás utilizando Windows, puedes descargar OpenSSL desde https://sourceforge.net/projects/openssl. Una vez descargado, copia la carpeta `bin` en `C:\` y nómbrala como `OpenSSL`. Luego, abre una consola. Si estás en Windows, asegúrate de abrirla en modo administrador y navegar hasta `C:\OpenSSL`.

### Paso 2 - Generación de la Clave de Cifrado (Key)
Dentro de la consola, el primer comando que debemos ejecutar es el siguiente para generar el archivo key.
```
openssl genrsa -out [nombre de archivo] 2048
```

Reemplaza:
 - `[nombre de archivo]` con el nombre que deseas para el archivo key. Este archivo key es esencial, ya que representa la "contraseña" con la que funcionará el certificado. Asegúrate de no perderlo. Por ejemplo:
```
openssl genrsa -out keytest 2048
```
De esta forma, el nombre de mi archivo key sería "keytest".

### Paso 3 - Generación del Certificate Signing Request (CSR)
Una vez generada la key, estamos listos para crear el CSR. Ejecuta el siguiente comando:

```
openssl req -new -key [nombre de archivo key] -subj "/C=AR/O=[nombre de la empresa]/CN=[nombre del certificado]/serialNumber=CUIT [CUIT]" -out [nombre de archivo para el CSR]
```

Reemplaza:
 - `[nombre de archivo key]` con el nombre del archivo key generado en el paso anterior.
 - `[nombre de la empresa]` con el nombre de la empresa para la que es el certificado (en producción, se recomienda utilizar tu propio nombre para evitar confusiones).
 - `[nombre del certificado]` con el nombre que deseas para el certificado (solo se permiten letras y números).
 - `[CUIT]` con el CUIT de la empresa a la que pertenece el certificado (en producción, se recomienda usar tu propio CUIT para evitar confusiones).
 - `[nombre de archivo para el CSR]` con el nombre que deseas para el archivo CSR. Por ejemplo:
```
openssl req -new -key keytest -subj "/C=AR/O=RA/CN=Test1/serialNumber=CUIT 11111111111" -out csr-test1
```

Ahora, el archivo CSR está listo, y podemos proceder a la página de AFIP para generar el certificado.

### Paso 4 - Generación del Certificado (Cert)
Dentro de tu escritorio de AFIP, accede a **«Administración de Certificados Digitales»**.

![Paso 1](/tutorial/tutorial_6_1.png)

Si no tienes esta aplicación en tu escritorio, consulta el tutorial **Habilitar administrador de certificados de producción**. En caso de tener permiso para administrar las relaciones de otros contribuyentes, se te pedirá que elijas a quién deseas administrar.

![Paso 2](/tutorial/tutorial_6_2.png)

Dentro de esta aplicación, selecciona **«Agregar alias»**.

![Paso 3](/tutorial/tutorial_6_3.png)

En el campo **«Alias»**, coloca el nombre que proporcionaste al certificado en el CSR. Luego, haz clic en **Examinar** y selecciona el CSR que generaste anteriormente. Finalmente, presiona **«Agregar Alias»** y habrás obtenido tu certificado.

![Paso 4](/tutorial/tutorial_6_4.png)

Ahora, en la lista de Alias, selecciona **«ver»**.

![Paso 5](/tutorial/tutorial_6_5.png)

Luego, haz clic en el botón debajo de **«descargar»**.

![Paso 6](/tutorial/tutorial_6_6.png)

¡Eso es todo! Ahora tienes tu certificado y la key necesaria para utilizarlos en la biblioteca.

> El CSR ya no es necesario y puede ser eliminado. 

Ahora, lo que falta es autorizar el acceso a los servicios web que desees utilizar con este certificado.