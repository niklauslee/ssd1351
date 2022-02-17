/**
 * Example for 128x128 resolution
 */

const { SSD1351 } = require("../index");
const showcase = require("./gc-color-showcase");

const ssd1351 = new SSD1351();
ssd1351.setup(board.spi(0), {
  width: 128,
  height: 128,
  dc: 20,
  rst: 21,
  cs: 17,
  extVcc: false,
  rotation: 0,
});

const gc = ssd1351.getContext(); // callback-style context
showcase(gc, 3000);
