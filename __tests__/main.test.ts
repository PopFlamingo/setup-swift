import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as main from '../src/main';
import * as path from 'path'

describe('Test suite', () => {
  it('Comming soon... tests', async () => {
    core.warning("Called test suite");
    const installPath = await main.install("5.0.2");
    core.warning("After calling install");
    const binpath = path.join(installPath, '/usr', '/bin');
    await exec.exec(path.join(binpath, '/swift'), ['--version']);
  }, 180000);
});
