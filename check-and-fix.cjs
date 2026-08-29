const { Client } = require('ssh2');

const config = {
  host: '89.125.129.62',
  port: 22,
  username: 'root',
  password: 'NC7gSA2ZM6hDu',
};

const conn = new Client();

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        resolve({ code, stdout, stderr });
      }).on('data', (d) => { stdout += d.toString(); }).stderr.on('data', (d) => { stderr += d.toString(); });
    });
  });
}

conn.on('ready', async () => {
  console.log('Connected!');

  // Remove the conflicting 8080 conf
  await execCommand(conn, 'rm -f /etc/nginx/conf.d/farm-game.conf');

  // Check existing sites
  const sites = await execCommand(conn, 'ls -la /etc/nginx/sites-enabled; echo "=== SITES CONTENT ==="; cat /etc/nginx/sites-enabled/* 2>/dev/null; cat /etc/nginx/conf.d/* 2>/dev/null');
  console.log(sites.stdout);

  // Setup farm-game on port 3000 (and also test if we can do 3000 or /farm/ or subpath)
  const setupCmd = `
cat << 'EOF' > /etc/nginx/conf.d/farm-game-3000.conf
server {
    listen 3000;
    server_name _;

    root /var/www/farm-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

nginx -t && nginx -s reload

if command -v ufw >/dev/null 2>&1; then
  ufw allow 3000/tcp || true
fi
iptables -I INPUT -p tcp --dport 3000 -j ACCEPT || true

curl -I http://127.0.0.1:3000
`;
  const res = await execCommand(conn, setupCmd);
  console.log('Setup result:');
  console.log(res.stdout);
  console.log(res.stderr);

  conn.end();
}).connect(config);
