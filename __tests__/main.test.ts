import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as main from '../src/main';
import * as path from 'path'

describe('Test suite', () => {
  it('Comming soon... tests', async () => {
    const installPath = await main.install('5.0');
    const binpath = path.join(installPath, '/usr', '/bin');
    exec.exec(path.join(binpath, '/swift'), ['--version']);
  }, 120000);
});
