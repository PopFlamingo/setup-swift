import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';

export async function install(version: string) {
    
    const platformName = os.platform()

    if (platformName === "linux") {
        let myOutput = os.release()        

        const dotLessPlatformNum = myOutput.replace('.', '');

        let swiftPath = tc.find('swift', version)
        if (!swiftPath) {
            try {
                const url = 'https://swift.org/builds/swift-'+version+'-release/ubuntu'+dotLessPlatformNum+'/swift-'+version+'-RELEASE/swift-'+version+'-RELEASE-ubuntu'+myOutput+'.tar.gz';
                core.warning(url);
                const tarPath = await tc.downloadTool(url);
                await io.mkdirP(os.homedir() + '/swift-downloads/')
                const installPath = await tc.extractTar(tarPath, os.homedir() + '/swift-downloads/')
                await tc.cacheDir(installPath, 'swift', version)
            } catch(e) {
                core.setFailed("Couldn't download and install Swift, error: " + e)
                return
            }
        }
        
        core.addPath(path.join(swiftPath, 'usr', 'bin'));

    } else {
        core.setFailed("Platform " + platformName + " isn't currently supported.");
        return
    }
        
}

async function run() {
    install(core.getInput('version'));
}

run();
