const https = require('https');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http-server');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
};

const server = createServer({
  root: '.',
  https: options,
  proxy: false,
  cors: true,
  cache: 'no-store',
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
}); 