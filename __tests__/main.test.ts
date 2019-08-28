import * as exec from '@actions/exec';
import * as main from '../src/main';

describe('Test suite', () => {
  it('Attempt to call Swift', async () => {
    await main.install('5.0.0');
    await exec.exec("swift", ["--version"]);
  });
});
