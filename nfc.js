// Module to read from an arduino connected via USB, that uses a PN532 NFC reader
// https://dangerousthings.com/wp-content/uploads/PN532_Manual_V3-1.pdf
// Made to work with the Arduino library Adafruit PN532, example readMifare.pde

const SerialPort = require('serialport');
const Readline = require('parser-readline');
const sockets = require('./core/sockets');

module.exports = function() {
  const port = new SerialPort('/dev/cu.usbmodem1411', {
    baudRate: 115200
  });
  const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
  parser.on('data', d => {
    // console.log(d);
    if (d.length > 0) {
      if (d.includes('UID Value:')) {
        const tag = d.substr(13);
        console.log('Got new microtag with UID value = ' + tag);
        sockets.sendTagUID(tag);
      }
    }
  });
};
