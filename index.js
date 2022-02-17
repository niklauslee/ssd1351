const graphics = require("graphics");

/**
 * SSD1351 class
 */
class SSD1351 {
  /**
   * Setup SSD1351 for SPI connection
   * @param {SPI} spi
   * @param {Object} options
   *   .width {number=128}
   *   .height {number=128}
   *   .dc {number=-1}
   *   .rst {number=-1}
   *   .cs {number=-1}
   *   .rotation {number=0}
   */
  setup(spi, options) {
    this.spi = spi;
    options = Object.assign(
      {
        width: 128,
        height: 128,
        dc: -1,
        rst: -1,
        cs: -1,
        rotation: 0,
      },
      options
    );
    this.width = options.width;
    this.height = options.height;
    this.dc = options.dc;
    this.rst = options.rst;
    this.cs = options.cs;
    this.rotation = options.rotation;
    this.context = null;
    if (this.dc > -1) pinMode(this.dc, OUTPUT);
    if (this.rst > -1) pinMode(this.rst, OUTPUT);
    if (this.cs > -1) pinMode(this.cs, OUTPUT);
    digitalWrite(this.cs, HIGH); // deselect
    // reset
    digitalWrite(this.rst, LOW);
    delay(20);
    digitalWrite(this.rst, HIGH);
    delay(50);
    digitalWrite(this.cs, LOW); // select
    this.cmd(0xfd, [0x12]); // unlock
    this.cmd(0xfd, [0xb1]); // unlock
    this.cmd(0xae); // display off
    this.cmd(0xb3, [0xf1]); // clock div
    this.cmd(0xca, [0x7f]); // Multiplex Ratio
    this.cmd(0xa0, [0x74]); // remap
    this.cmd(0x15, [0, 0x7f]); // col
    this.cmd(0x65, [0, 0x7f]); // row
    this.cmd(0xa1, [0]); // startline
    this.cmd(0xa2, [0]); // display offset
    this.cmd(0xb5, [0]); // GPIO
    this.cmd(0xab, [1]); // func select
    this.cmd(0xb1, [0x32]); // precharge
    this.cmd(0xbe, [5]); // vcomh
    this.cmd(0xa6); // normal display
    this.cmd(0xc1, [0xc8, 0x80, 0xc8]); // contrast abc
    this.cmd(0xc7, [0x0f]); // contrast master
    this.cmd(0xb4, [0xa0, 0xb5, 0x55]); // set vsl
    this.cmd(0xb6, [1]); // precharge2
    this.cmd(0xaf); // display on
    digitalWrite(this.cs, HIGH); // deselect
    delay(50);
  }

  /**
   * Send command
   * @param {number} cmd
   * @param {Array<number>} data
   */
  cmd(cmd, data) {
    digitalWrite(this.dc, LOW); // command
    this.spi.send(new Uint8Array([cmd]));
    if (data) {
      digitalWrite(this.dc, HIGH); // data
      this.spi.send(new Uint8Array(data));
    }
  }

  /**
   * Get a graphic context
   * @param {string} type Type of graphic context.
   *     'buffer' or 'callback'. Default is 'callback'
   */
  getContext(type) {
    if (!this.context) {
      if (type === "buffer") {
        this.context = new graphics.BufferedGraphicsContext(
          this.width,
          this.height,
          {
            rotation: this.rotation,
            bpp: 16,
            display: (buffer) => {
              digitalWrite(this.cs, LOW); // select
              this.cmd(0x15, [0, this.width - 1]);
              this.cmd(0x75, [0, this.height - 1]);
              digitalWrite(this.dc, LOW); // command
              this.spi.send(new Uint8Array([0x5c]));
              digitalWrite(this.dc, HIGH); // data
              this.spi.send(buffer);
              digitalWrite(this.cs, HIGH); // deselect
            },
          }
        );
      } else {
        // 'callback'
        this.context = new graphics.GraphicsContext(this.width, this.height, {
          rotation: this.rotation,
          setPixel: (x, y, color) => {
            digitalWrite(this.cs, LOW); // select
            this.cmd(0x15, [x, 127]);
            this.cmd(0x75, [y, 127]);
            this.cmd(0x5c, [color >> 8, color]);
            digitalWrite(this.cs, HIGH); // deselect
          },
          fillRect: (x, y, w, h, color) => {
            digitalWrite(this.cs, LOW); // select
            this.cmd(0x15, [x, x + w - 1]);
            this.cmd(0x75, [y, y + h - 1]);
            digitalWrite(this.dc, LOW); // command
            this.spi.send(new Uint8Array([0x5c]));
            digitalWrite(this.dc, HIGH); // data
            this.spi.send(new Uint8Array([color >> 8, color]), 5000, w * h);
            digitalWrite(this.cs, HIGH); // deselect
          },
        });
      }
    }
    return this.context;
  }

  /**
   * Turn on display
   */
  on() {
    digitalWrite(this.cs, LOW); // select
    this.cmd(0xaf);
    digitalWrite(this.cs, HIGH); // deselect
  }

  /**
   * Turn off display
   */
  off() {
    digitalWrite(this.cs, LOW); // select
    this.cmd(0xae);
    digitalWrite(this.cs, HIGH); // deselect
  }

  /**
   * Set contrast
   * @param {number} c
   */
  setContrast(c) {
    digitalWrite(this.cs, LOW); // select
    this.spi.send(new Uint8Array([0x81, c]));
    digitalWrite(this.cs, HIGH); // deselect
  }
}

exports.SSD1351 = SSD1351;
