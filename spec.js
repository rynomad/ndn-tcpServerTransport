var ndn = require('ndn-lib')
ndn.messageChannelTransport = require('./ndn-streamTransport.js')

function onInterest1 (prefix,interest,transport){
  console.log("got interest", prefix)
  var d = new ndn.Data(new ndn.Name(interest.name.toUri()), new ndn.SignedInfo(), "success")
  d.signedInfo.setFields()
  var encoded = d.wireEncode()
  console.log("sending encoded", encoded)
  transport.send(encoded.buffer)
}

function onInterest2 (prefix,interest,transport){
  console.log("got interest", prefix)
  var d = new ndn.Data(new ndn.Name(interest.name.toUri()), new ndn.SignedInfo(), "success")
  d.signedInfo.setFields()
  var encoded = d.wireEncode()
  console.log("sending encoded", encoded)
  transport.send(encoded.buffer)
}


var testvars = {}

var event = require('events').EventEmitter
function init(){

var ms1 = new event()
  , ms2 = new event()

function tangleDuplex (s1, s2){
console.log(s1)
s2.on('postMessage', function(data){
  s1.emit("onmessage", data)
  console.log("face2 sending")
} )
s1.on('postMessage', function(data){
  s2.emit('onmessage', data)
  console.log("face1 sending")
})

 return{port1: s1, port2: s2};
}
var ms = tangleDuplex(ms1, ms2)
var RegisteredPrefix = function RegisteredPrefix(prefix, closure) { this.prefix = new ndn.Name(prefix); this.closure = closure}
  , transport1 = new ndn.messageChannelTransport.transport(ms.port1)
  , transport2 = new ndn.messageChannelTransport.transport(ms.port2)
  , face1 = new ndn.Face({host: 1, port: 1, getTransport: function(){return transport1}})
  , face2 = new ndn.Face({host: 1, port: 1, getTransport: function(){return transport2}})
  , closure1 = new ndn.Face.CallbackClosure(null, null, onInterest1, 'face1', face1.transport)
  , closure2 = new ndn.Face.CallbackClosure(null, null, onInterest2, 'face2', face2.transport)
testvars.interest1 = new ndn.Interest(new ndn.Name('face2/test'))
testvars.interest2 = new ndn.Interest(new ndn.Name('face1/test'))
testvars.face1 = face1
testvars.face2 = face2

  face1.transport.connect(face1, function(){console.log('connect')})
  face2.transport.connect(face2, function(){console.log('connect')})
  ndn.Face.registeredPrefixTable.push(new RegisteredPrefix('face1', closure1));
  ndn.Face.registeredPrefixTable.push(new RegisteredPrefix('face2', closure2));
}

describe('messageChannelTransport', function(){
  describe('should allow bi-directional interest and data exchange', function(){
    before(init)

    it('face1 --> face2 --> face1', function(done){
    this.timeout(30000)
    function onData(a,b) {
      console.log(a,b)
      done()
    }
    function onTimeout(){
      throw new Error('not working')
    }
      testvars.face1.expressInterest(testvars.interest2, onData, onTimeout)
    })
    it('face2 --> face1 --> face2', function(done){
    function onData(a,b) {
      console.log(a,b)
      done()
    }
    function onTimeout(){
      throw new Error('not working')
    }

      testvars.face2.expressInterest(testvars.interest1, onData, onTimeout)

    })

  })


})


