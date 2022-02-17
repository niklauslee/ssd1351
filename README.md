# SSD1351

Kaluma library for SSD1351 (16-bit Color OLED Display)

![ssd1351](https://github.com/niklauslee/ssd1351/blob/main/images/ssd1351.jpg?raw=true)

You can get OLED displays from belows:

- [1.5" 128x128 (from Adafruit)](https://www.adafruit.com/product/1431)
- [1.27" 128x96 (from Adafruit)](https://www.adafruit.com/product/1673)

# Wiring

Here is a wiring example for `SPI0`.

| Raspberry Pi Pico | SSD1351 (OLED) |
| ----------------- | -------------- |
|3V3                | 3V3            |
|GND                | GND            |
|GP19 (SPI0 TX)     | DATA (MOSI)    |
|GP18 (SPI0 CLK)    | CLK            |
|GP20               | D/C            |
|GP21               | RST            |
|GP17               | CS             |

![wiring](https://github.com/niklauslee/ssd1351/blob/main/images/wiring.png?raw=true)

# Usage

You can initialize SSD1351 driver using SPI interface as below:

```js
const {SSD1351} = require('ssd1351');
const ssd1351 = new SSD1351();

ssd1351.setup(board.spi(0), {
  width: 128,
  height: 128,
  dc: 20,
  rst: 21,
  cs: 17  
});

const gc = ssd1351.getContext();
// gc.drawRect(0, 0, width, height);
```

You can use `BufferedGraphicsContext` instead of general callback-based graphics context as below:

```js
// buffered graphic context
const gc = ssd1351.getContext('buffer');
gc.drawRect(0, 0, width, height);
gc.display(); // must call if buffered graphic context
...
```

> Note that `BufferedGraphicsContext` allocates a lot of memory (32KB for 128x128 resolution).

# API

## Class: SSD1351

A class for SSD1351 driver communicating with SPI interface.

### new SSD1351()

Create an instance of SSD1351 driver for SPI interface.

### ssd1351.setup(spi[, options])

- **`spi`** `<SPI>` An instance of `SPI` to communicate.
- **`options`** `<object>` Options for initialization.
  - **`width`** `<number>` Width of display in pixels. Default: `128`.
  - **`height`** `<number>` Height of display in pixels. Default: `128`.
  - **`dc`** `<number>` Pin number for DC. Default: `-1`.
  - **`rst`** `<number>` Pin number for RST (Reset). Default: `-1`.
  - **`cs`** `<number>` Pin number of CS (Chip select). Default: `-1`.
  - **`extVcc`** `<boolean>` Indicate whether to use external VCC. Default: `false`.
  - **`rotation`** `<number>` Rotation of screen. One of `0` (0 degree), `1` (90 degree in clockwise), `2` (180 degree in clockwise), and `3` (270 degree in clockwise). Default: `0`.

Setup SSD1351 driver for a given SPI bus and options.

### ssd1351.getContext([type])

- **`type`**: Optional. Type of graphic context. If `"buffer"` is given, `BufferedGraphicContext` is returned.
- **Returns**: `<GraphicContext>` An instance of graphic context for SSD1351.

Get a graphic context.

> Note that `BufferedGraphicContext` is much faster, but it consumes memory a lot.

> Note that `gc.getPixel(x, y)` function is supported only if `BufferedGraphicsContext`.

# Examples

* `examples/ex_128x128.js` (128x128 resolution)
* `examples/ex_128x96.js` (128x96 resolution)
* `examples/ex_buffer_128x128.js` (128x128 resolution with buffered graphics context)
* `examples/ex_buffer_128x96.js` (128x96 resolution with buffered graphics context)


```sh
kaluma flash ./examples/ex_128x128.js --bundle --port <port>
```
