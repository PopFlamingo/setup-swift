import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as main from '../src/main';

describe('Test suite', () => {
  it('Attempt to call Swift', async () => {
    await main.install('5.0.2');
    try {
    await exec.exec("swift", ["--version"]);
    } catch(e) { 
    core.setFailed(e)
    return
    }
  }, 120000);
});
