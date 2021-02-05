import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from 'child_process';

const defaultConfig = {
  "log": {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "debug"
  },
  "inbounds": [
    {
      "port": 1081,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": false,
        "ip": "127.0.0.1"
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      }
    },
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "http"
    }
  ],
  "outbounds": [{
    "protocol": "freedom",
    "settings": {},
    "tag": "direct"
  },{
    "protocol": "blackhole",
    "settings": {},
    "tag": "blocked"
  }],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules":[
      {
        "type": "field",
        "ip": ["geoip:private"],
        "outboundTag": "blocked"
      }
    ]
  },
  "dns": {
    "servers": [
      "1.1.1.1",
      "8.8.8.8",
      "localhost"
    ]
  },
  "other": {}
};

export async function setV2ray(
  versionSpec: string,
  configJson: any,
) {
  core.info(`Attempting to download v2ray ${versionSpec}...`);
  const downloadPath = await tc.downloadTool(`https://github.com/v2fly/v2ray-core/releases/download/v${versionSpec}/v2ray-linux-64.zip`);
  core.info('Extracting ...');
  const baseDir = process.env.RUNNER_TEMP!;
  await tc.extractZip(downloadPath, path.join(baseDir, 'v2ray'));
  const config = { ...defaultConfig };
  config.outbounds.unshift(configJson);
  config.log.access = path.join(baseDir, 'v2ray-access.log');
  config.log.error = path.join(baseDir, 'v2ray-error.log');
  fs.writeFileSync(path.join(baseDir, 'v2ray/config.json'), JSON.stringify(config, null, 4));
  // core.info('Spawn');
  // spawn(path.join(baseDir, 'v2ray/v2ray'), { stdio: 'ignore', detached: true }).unref();
  core.info('Copy scripts');
  fs.copyFileSync('./start.sh', path.join(baseDir, 'start-v2ray.sh'))
  fs.copyFileSync('./stop.sh', path.join(baseDir, 'stop-v2ray.sh'))
  core.info('Done');
}
