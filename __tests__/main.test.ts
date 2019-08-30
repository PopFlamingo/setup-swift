import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as installer from '../src/installer';
import * as path from 'path'

describe('Test suite', () => {
  it('Comming soon... tests', async () => {
    const installPath = await installer.install("5.0.2");
    const binpath = path.join(installPath, '/usr', '/bin');
    await exec.exec(path.join(binpath, '/swift'), ['--version']);
  }, 240000);
});
