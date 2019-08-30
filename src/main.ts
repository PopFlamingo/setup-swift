import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import { stringLiteral } from '@babel/types';

function extractLsbOutput(raw: string): string {
    const secondPart = raw.split('\t')[1];
    return secondPart.substr(0, secondPart.length-1);
}

async function lsbRelease(option: string): Promise<string> {
    let execOutput = "";
    const execOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                execOutput += data.toString();
            }
        }
    }
    await exec.exec("lsb_release", [option], execOptions);
    return extractLsbOutput(execOutput);
}

interface PlatformInfo {
    platform: string;
    distributor: string;
    release: string;
}

async function getPlatformInfo(): Promise<PlatformInfo> {
    const platformName = os.platform();
    if (platformName === "linux") {
        let distributor: string;
        let release: string;
        try {
            return {
                platform: platformName,
                distributor: await lsbRelease("-i"),
                release: await lsbRelease("-r")
            };
        } catch(e) {
            throw new Error("The action only support GNU Linux currently. Error: " + e)
        }
    } else {
        throw new Error(platformName + "isn't currently supported");
    }
}

function normalizeSwiftVersion(swiftVersion: string): string {
    let nsv: string;
    let splitVersion = swiftVersion.split('.')
    let partCount = splitVersion.length;
    core.warning(swiftVersion);
    core.warning('' + splitVersion.length);
    if (partCount === 2) {
        nsv = swiftVersion;
    } else if (partCount === 3) {
        if (splitVersion[2] === '0') {
            nsv = splitVersion[0] + '.' + splitVersion[1]
        } else {
            nsv = swiftVersion;
        }
    } else {
        throw new Error("Invalid Swift verison " + swiftVersion)
    }
    return nsv;
}

async function getDownloadURL(swiftVersion: string, platformInfo: PlatformInfo): Promise<string> {
    // Normalize Swift version
    let nsv = swiftVersion;

    // Dotless release
    let osName = (platformInfo.distributor + platformInfo.release).toLowerCase();
    let dlOSName = osName.replace('.','').toLowerCase();
    return 'https://swift.org/builds/swift-'+nsv+'-release/'+dlOSName+'/swift-'+nsv+'-RELEASE/swift-'+nsv+'-RELEASE-'+osName+'.tar.gz';
}

async function downloadAndExtract(swiftURL: string, destination: string): Promise<string> {
    let donwloadPath = await tc.downloadTool(swiftURL)

    if (swiftURL.endsWith(".tar.gz")) {
        return await tc.extractTar(donwloadPath, destination);
    } else {
        throw new Error('Unrecognized archive format');
    }
}

export async function install(swiftVersion: string): Promise<string> {
    const platformInfo = await getPlatformInfo();
    let osName = (platformInfo.distributor + platformInfo.release).toLowerCase();
    const nsv = normalizeSwiftVersion(swiftVersion);  
    const downloadURL = await getDownloadURL(swiftVersion, platformInfo);
    let versionSpecificPath = tc.find('swift', nsv, osName);

    if (!versionSpecificPath) {
        console.log("Didn't find specified Swift tools version in the cache, downloading at " + downloadURL);
        // Download and extract the Swift tools
        let toolBaseDir = process.env["RUNNER_TOOL_CACHE"] || os.homedir();
        const swiftDownloadsDir = path.join(toolBaseDir, '/swift-downloads/');
        await io.mkdirP(swiftDownloadsDir);
        let extractedPath = await downloadAndExtract(downloadURL, swiftDownloadsDir);
        versionSpecificPath = path.join(extractedPath, '/swift-'+nsv+'-RELEASE-'+osName); 
        tc.cacheDir(versionSpecificPath, "swift", nsv, osName);
    } else {
        console.log("Found existing Swift tools in cache at path: " + versionSpecificPath)
    }

    let binPath = path.join(versionSpecificPath, "/usr", "/bin/");
    
    // Install required dependencies
    if (platformInfo.platform === "linux") {
        console.log("Installing Swift dependencies for Linux Ubuntu")
        await exec.exec('sudo', ['apt-get', 'install', '-y', 'clang', 'libicu-dev']);
    }

    // Add swift tools to the path
    await core.addPath(binPath);
    return versionSpecificPath;
}

async function run() {
    let version = core.getInput('swift-version');
    console.log('Installing Swift version ' + version);
    install(version);
}

run();
