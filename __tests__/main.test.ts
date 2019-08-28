import * as exec from '@actions/exec';

describe('Test suite', () => {
  it('Attempt to call Swift', async () => {
    exec.exec("swift", ["--version"]);
  });
});
