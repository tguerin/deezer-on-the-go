const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const DeezerNative = require('node-deezer-native');

const index = require('./routes/index');

const app = express();

const os = require('os');

const interfaces = os.networkInterfaces();
const addresses = [];
for (let k in interfaces) {
  for (let k2 in interfaces[k]) {
    let address = interfaces[k][k2];
    if (address.family === 'IPv4' && !address.internal) {
      addresses.push(address.address);
    }
  }
}

console.log(addresses);

const connect = new DeezerNative.Connect(
  '161135',
  'plop',
  ' plopi',
  '/var/tmp/dzrcache_NDK_SAMPLE_LOL',
  function (a) {
    console.log('Plop', a);
  }
);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

connect
  .disableLog()
  .activate()
  .setOfflineMode()
  .setAccessToken();

const player = new DeezerNative.Player(process.env.DEEZER_ACCESS_TOKEN);
player.loadUrl('dzmedia:///track/10287076').play();


const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  try {
    const json = JSON.parse(msg);
    if(json.request === "on_the_go_discovery"){
      const on_the_go = JSON.stringify({
        request:"on_the_go_discovered",
        name:"My On The Go",
        adress:addresses[0]
      });
      server.send(on_the_go, rinfo.port, rinfo.address, (err) => {
        console.log(err)
      });
    }
  } catch (e){
    console.log(e);
  }
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(11111);

module.exports = app;
