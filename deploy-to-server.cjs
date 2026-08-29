const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
  host: '89.125.129.62',
  port: 22,
  username: 'root',
  password: 'NC7gSA2ZM6hDu',
  readyTimeout: 30000,
};

const conn = new Client();

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

function uploadDirectory(sftp, localDir, remoteDir) {
  return new Promise((resolve, reject) => {
    function ensureRemoteDir(dir, cb) {
      sftp.mkdir(dir, (err) => {
        cb(); // ignore if already exists
      });
    }

    async function walk(currentLocal, currentRemote) {
      await new Promise(r => ensureRemoteDir(currentRemote, r));
      const items = fs.readdirSync(currentLocal);
      for (const item of items) {
        const lPath = path.join(currentLocal, item);
        const rPath = currentRemote + '/' + item;
        const stat = fs.statSync(lPath);
        if (stat.isDirectory()) {
          await walk(lPath, rPath);
        } else {
          await new Promise((res, rej) => {
            sftp.fastPut(lPath, rPath, (err) => {
              if (err) rej(err);
              else res();
            });
          });
          console.log(`Uploaded: ${item}`);
        }
      }
    }

    walk(localDir, remoteDir).then(resolve).catch(reject);
  });
}

conn.on('ready', async () => {
  console.log('SSH Connection ready!');

  // 1. Inspect running services & ports
  const inspectRes = await execCommand(conn, 'ss -tulpn; echo "=== DOCKER ==="; docker ps 2>&1; echo "=== NGINX ==="; nginx -v 2>&1; echo "=== PM2 ==="; pm2 list 2>&1');
  console.log('--- SERVER STATUS ---');
  console.log(inspectRes.stdout);

  // 2. Create target directory
  await execCommand(conn, 'mkdir -p /var/www/farm-game');

  // 3. Upload dist files
  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    const distPath = path.resolve(__dirname, 'dist');
    console.log(`Uploading ${distPath} to /var/www/farm-game ...`);
    try {
      await uploadDirectory(sftp, distPath, '/var/www/farm-game');
      console.log('All files uploaded successfully!');

      // 4. Configure web server on a dedicated port (e.g. 3000) or Nginx
      const setupScript = `
# Check if nginx is installed
if command -v nginx >/dev/null 2>&1; then
  cat << 'EOF' > /etc/nginx/conf.d/farm-game-3000.conf
server {
    listen 3000;
    server_name _;

    root /var/www/farm-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0";
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF
  nginx -t && nginx -s reload || systemctl reload nginx || systemctl restart nginx
  echo "NGINX_CONFIGURED_PORT_3000"
fi

# Open firewall port 8080 if ufw/iptables is active
if command -v ufw >/dev/null 2>&1; then
  ufw allow 8080/tcp || true
fi
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT || true

# Also start a fallback Node static server on port 8080 using serve / python / pm2 if needed
echo "DEPLOYMENT_DONE"
`;
      const deployRes = await execCommand(conn, setupScript);
      console.log('Setup output:', deployRes.stdout);
      if (deployRes.stderr) console.error('Setup stderr:', deployRes.stderr);

      // Verify port 8080 response
      const testRes = await execCommand(conn, 'curl -I http://127.0.0.1:8080 2>&1');
      console.log('Local curl test:', testRes.stdout);

      conn.end();
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      conn.end();
    }
  });

}).on('error', (err) => {
  console.error('SSH connection error:', err);
}).connect(config);
