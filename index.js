const Config = require('config');
const Crypto = require('crypto');
const Express = require('express');
const Fs = require('fs');
const Http = require('http');
const Util = require('util');

const httpConfig = Config.util.toObject(Config.get('http'));
// remove null entries
Object.entries(httpConfig).forEach(([ key, val ]) => val === null ? delete httpConfig[key] : null);
const webhookSecret = Buffer.from(Config.get('millicast.webhookSecret'), 'base64');

process.on('exit', async (_code) => {
  await socketCleanupAsync(httpConfig?.path);
});

async function mainAsync() {
  const httpServer = Http.createServer();

  httpServer.on('error', (err) => {
    console.error(`Http server error. ${err.stack}`);
    process.exit(1);
  });

  const expressApp = new Express();
  httpServer.addListener('request', /** @type{RequestListener} */expressApp);

  expressApp.use((req, res, _next) => {
    const isThumbnail = req.is('image/jpeg');
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);

      const calculatedSignature = 'sha1=' + Crypto.createHmac('sha1', webhookSecret).update(body).digest('hex');
      const headerSignature = req.get('X-Millicast-Signature');
      console.log('header', headerSignature);
      console.log('calculated', calculatedSignature);

      if (calculatedSignature !== headerSignature) {
        console.warn('Invalid signature sent to us, unsafe data');
        res.status(400).send('BAD');
        return;
      }

      if (!isThumbnail) {
        const webhookEvent = JSON.parse(body.toString());
        // operate on webhook data
        console.log('EVENT:', Util.inspect(webhookEvent, false, null, true));
      } else {
        console.log('THUMB SIZE:', body.length);
      }

      res.status(200).send('OK');
    });
  });

  httpServer.listen(httpConfig, () => {
    console.log('Server listening');
  });

  function gracefulExit(signal) {
    console.log(`Shutting down server from: ${signal}`);

    httpServer.close(() => {
      console.log('Http server shutdown');
    });
  }

  /** @type{Signals[]} */
  const stopSignals = [ 'SIGINT', 'SIGTERM', 'SIGQUIT' ];
  stopSignals.forEach((signal) => process.on(signal, () => gracefulExit(signal)));
}

async function socketCleanupAsync(socketPath) {
  await unlinkAsync(socketPath);
}

async function unlinkAsync(path, throwIfDNE = false) {
  return new Promise((resolve, reject) => {
    Fs.unlink(path, (err) => {
      if (err) {
        // ignore error if file does not exist
        if (err.code === 'ENOENT' && !throwIfDNE) {
          resolve(false);
        } else {
          // else reject
          reject(err);
        }
        return;
      }

      resolve(true);
    });
  });
}

mainAsync()
  .catch((err) => {
    console.error(err);
  });
