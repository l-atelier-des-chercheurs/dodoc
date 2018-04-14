// Module to read from an arduino connected via USB, that uses a PN532 NFC reader
// https://dangerousthings.com/wp-content/uploads/PN532_Manual_V3-1.pdf
// Made to work with the Arduino library Adafruit PN532, example readMifare.pde

const SerialPort = require('serialport');
const Readline = require('parser-readline');
const sockets = require('./core/sockets');

module.exports = function() {
  var busy = false;
  function setReady() {
    busy = false;
  }
  function setBusy() {
    busy = true;
  }

  // Poll available vcp's
  setInterval(function() {
    console.log('Poll for new devices..');

    SerialPort.list((err, ports) => {
      ports.forEach(port => {
        // Create serialport instance, if not existing
        if (
          typeof port.manufacturer === 'string' &&
          port.manufacturer.includes('Arduino') &&
          !busy
        ) {
          setBusy();
          console.log('Device found. port.comName = ' + port.comName);
          create(port);
        }
      });
    });
  }, 2000);

  // Create a serialport instance
  function create(port) {
    var com = new SerialPort(port.comName, {
      baudRate: 115200
    });

    com.on('open', function(err) {
      console.log('Port opened. Error: ', err);
    });

    // com.on('data', function(data) {
    //   console.log('data', data);
    // });

    let parser = com.pipe(new Readline({ delimiter: '\r\n' }));
    parser.on('data', d => {
      console.log(d);
      if (d.length > 0) {
        if (d.includes('UID Value:')) {
          const tag = d.substr(13);
          console.log('Got new microtag with UID value = ' + tag);
          sockets.sendTagUID(tag);
        }
      }
    });

    com.on('error', function(err) {
      console.log('Error: ', err);
    });

    com.on('disconnect', function(err) {
      console.log('Disconnected. Error: ', err);
      setTimeout(function() {
        setReady();
      }, 2000);
    });
  }
};
