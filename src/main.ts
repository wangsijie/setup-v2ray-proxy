import * as core from '@actions/core';
import { config } from 'process';
import * as installer from './installer';

export async function run() {
  try {
    const configJson = core.getInput('outbound-json');
    let version = core.getInput('version');
    if (!version) {
      version = '4.34.0';
    }

    // if architecture supplied but node-version is not
    // if we don't throw a warning, the already installed x64 node will be used which is not probably what user meant.
    if (!configJson) {
      core.setFailed(
        'Missing v2ray outbound json!'
      );
    }

    await installer.setV2ray(version, JSON.parse(configJson));
  } catch (error) {
    core.setFailed(error.message);
  }
}
