import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import {spawn} from 'child_process';

const defaultConfig = {
  "log": {
    "loglevel": "warning"
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
  await tc.extractZip(downloadPath, '/etc/v2ray');
  const config = { ...defaultConfig };
  config.outbounds.push(configJson);
  fs.writeFileSync('/etc/v2ray/config.json', JSON.stringify(config, null, 4));
  core.info('Spawn');
  spawn('/etc/v2ray/v2ray', { stdio: 'ignore', detached: true }).unref();
  core.info('Done');
}
