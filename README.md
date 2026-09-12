# Generala

Aplicación web para tirar dados y llevar la cuenta de partidas de Generala. Está diseñada para jugar de 1 a 8 personas, con opciones para personalizar nombres, controlar el orden de turno, aplicar reglas del juego y guardar automáticamente la partida.

## Modos

1. **Juego:** cinco dados animados. Tocá los dados para fijarlos o soltarlos y tirá sólo los restantes, hasta tres veces por turno. El botón Nuevo turno reinicia los dados con confirmación.
2. **Tanteador:** planilla manual para hasta ocho jugadores, usando dados físicos o resultados comunicados desde otros dispositivos.
3. **Juego + Tanteador:** dados y planilla personal juntos, para anotar únicamente tus propios puntos. Confirmá cada turno con el cubilete para reiniciar los dados. El guardado es independiente del tanteador grupal.

Los dispositivos funcionan de manera independiente: una persona registra manualmente los resultados. No hay sala ni sincronización automática.

## Descripción

Esta app funciona como una planilla digital de Generala, permitiendo:

- registrar jugadores con alias personalizados
- elegir cantidad de participantes (de 1 a 8)
- definir si el orden de juego es secuencial o aleatorio
- apuntar puntajes por categoría
- activar o desactivar la regla de Doble Generala
- elegir la regla de Generala Servida
- usar un sistema de guardado automático en el navegador
- deshacer la última anotación
- ver rankings y podio final
- alternar entre vista de tabla y vista de foco por jugador

## Características principales

- Planilla de puntajes para varias personas
- Soporte para hasta 8 jugadores
- Validación de categorías de la Generala
- Puntuación de Escalera, Full, Poker y Generala
- Regulación de Doble Generala como opción
- Opción de Generala Servida con victoria instantánea o +60 puntos
- Guardado persistente con localStorage
- Modo de turno aleatorio o por orden de carga
- Vista compacta para celulares y escritorio
- Animación de confetti y modal de final de partida
- Sonidos de dados y puntuación configurables

## Reglas que incluye

La aplicación contempla las reglas principales de la Generala:

- Ases, doses, treses, cuatros, cincos y seises
- Escalera
- Full
- Poker
- Generala
- Doble Generala (opcional)
- Generala Servida

## Tecnologías

- HTML
- CSS
- JavaScript
- localStorage para persistencia local

No requiere instalación de dependencias ni backend.

## Cómo ejecutar la aplicación

### Opción 1: Abrir directamente

1. Abre el archivo `generala.html` en tu navegador.
2. La aplicación debería cargar y funcionar sin ninguna configuración extra.

### Opción 2: Servir localmente

Desde la carpeta del proyecto, puedes levantar un servidor local:

```bash
cd /ruta/al/proyecto
python3 -m http.server 8000
```

Luego abrí en el navegador:

```text
http://localhost:8000/generala.html
```

## Uso

1. Elegí Juego, Tanteador o Juego + Tanteador. En Juego podés empezar a tirar directamente; para los otros modos, seleccioná la cantidad de jugadores.
2. Editá los alias de cada jugador.
3. Elegí el tipo de orden de turno.
4. Configurá las reglas deseadas.
5. Presioná "¡Comenzar Partida!".
6. En la planilla, seleccioná la categoría a anotar para cada jugador.
7. Cuando termine la partida, la app mostrará el podio final y el ranking.

## Guardado

Las tiradas guardan valores, dados fijos y cantidad de tiros. En Juego se guardan por separado de la planilla. Recargar durante la animación conserva el tiro realizado.

La partida se guarda automáticamente en el navegador usando localStorage, por lo que si recargás la página o vuelves a abrir la app, podés continuar la partida guardada si aún no terminó.

## Estructura del proyecto

```text
generala/
├── generala.html
├── README.md
└── tests/dice.test.cjs
```

## Nota

Esta aplicación está pensada como una herramienta de juego local y no incluye sincronización online ni base de datos.

## Autor

Proyecto desarrollado como tanteador web para partidas de Generala.

## Pruebas

Ejecutá `node --test tests/dice.test.cjs`. Cubren conservación de dados fijos, límite de tres tiros, bloqueo de dobles clics, separación de jugadores y guardado independiente.
