var ndn = require('ndn-lib');
var ElementReader = ndn.ElementReader;
var ndnbuf = ndn.customBuffer;
var Name = ndn.Name
var Data = ndn.Data
var local = {}

local.transport = function (stream) {
  this.port = stream
};


/**
 * Connect to the host and port in face.  This replaces a previous connection and sets connectedHost
 *   and connectedPort.  Once connected, call onopenCallback().
 * Listen on the port to read an entire binary XML encoded element and call
 *    face.onReceivedElement(element).
 */
local.transport.prototype.connect = function(face, onopenCallback)
{
  this.elementReader = new ElementReader(face);
  var self = this;
  this.port.on('onmessage', function(ev) {
    console.log('RecvHandle called on local face', ev);

    
    if (ev instanceof ArrayBuffer) {
      console.log(typeof ev)
      var bytearray = new ndnbuf(ev);

      
      try {
        // Find the end of the binary XML element and call face.onReceivedElement.
        self.elementReader.onReceivedData(ev);
      } catch (ex) {
        console.log("NDN.ws.onmessage exception: " + ex);
        return;
      }
      // garbage collect arraybuffer
      //var ms = new MessageChannel()
      //ms.port1.postMessage(ev.data, [ev.data])
    }
  });

  onopenCallback();

};

/**
 * Send the Uint8Array data.
 */
local.transport.prototype.send = function(data)
{
  if (true) {
        // If we directly use data.buffer to feed ws.send(),
        // WebSocket may end up sending a packet with 10000 bytes of data.
        // That is, WebSocket will flush the entire buffer
        // regardless of the offset of the Uint8Array. So we have to create
        // a new Uint8Array buffer with just the right size and copy the
        // content from binaryInterest to the new buffer.
        //    ---Wentao
        var bytearray = new Uint8Array(data.length)
        bytearray.set(data)
        this.port.emit('postMessage', bytearray.buffer);

        //garbage collect
        //var ms = new MessageChannel();
        //ms.port1.postMessage(bytearray.buffer, [bytearray.buffer])
        //ms.port1.postMessage(data.buffer, [data.buffer])
    console.log('local.send() returned.');
  }
  else
    console.log('local connection is not established.');
};

module.exports = local;
