"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
function extractLsbOutput(raw) {
    const secondPart = raw.split('\t')[1];
    return secondPart.substr(0, secondPart.length - 1);
}
function lsbRelease(option) {
    return __awaiter(this, void 0, void 0, function* () {
        let execOutput = "";
        const execOptions = {
            listeners: {
                stdout: (data) => {
                    execOutput += data.toString();
                }
            }
        };
        yield exec.exec("lsb_release", [option], execOptions);
        return extractLsbOutput(execOutput);
    });
}
function getPlatformInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const platformName = os.platform();
        if (platformName === "linux") {
            let distributor;
            let release;
            try {
                return {
                    platform: platformName,
                    distributor: yield lsbRelease("-i"),
                    release: yield lsbRelease("-r")
                };
            }
            catch (e) {
                throw new Error("The action only support GNU Linux currently. Error: " + e);
            }
        }
        else {
            throw new Error(platformName + "isn't currently supported");
        }
    });
}
function normalizeSwiftVersion(swiftVersion) {
    let nsv;
    let splitVersion = swiftVersion.split('.');
    let partCount = splitVersion.length;
    if (partCount === 2) {
        nsv = swiftVersion;
    }
    else if (partCount === 3) {
        if (splitVersion[2] === '0') {
            nsv = splitVersion[0] + '.' + splitVersion[1];
        }
        else {
            nsv = swiftVersion;
        }
    }
    else {
        throw new Error("Invalid Swift verison " + swiftVersion);
    }
    return nsv;
}
function getDownloadURL(swiftVersion, platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Normalize Swift version
        let nsv = swiftVersion;
        // Dotless release
        let osName = (platformInfo.distributor + platformInfo.release).toLowerCase();
        let dlOSName = osName.replace('.', '').toLowerCase();
        return 'https://swift.org/builds/swift-' + nsv + '-release/' + dlOSName + '/swift-' + nsv + '-RELEASE/swift-' + nsv + '-RELEASE-' + osName + '.tar.gz';
    });
}
function downloadAndExtract(swiftURL, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        let donwloadPath = yield tc.downloadTool(swiftURL);
        if (swiftURL.endsWith(".tar.gz")) {
            return yield tc.extractTar(donwloadPath, destination);
        }
        else {
            throw new Error('Unrecognized archive format');
        }
    });
}
function install(swiftVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const platformInfo = yield getPlatformInfo();
        let osName = (platformInfo.distributor + platformInfo.release).toLowerCase();
        const nsv = normalizeSwiftVersion(swiftVersion);
        const downloadURL = yield getDownloadURL(swiftVersion, platformInfo);
        let versionSpecificPath = tc.find('swift', nsv, osName);
        if (!versionSpecificPath) {
            console.log("Didn't find specified Swift tools version in the cache, downloading at " + downloadURL);
            // Download and extract the Swift tools
            let toolBaseDir = process.env["RUNNER_TOOL_CACHE"] || os.homedir();
            const swiftDownloadsDir = path.join(toolBaseDir, '/swift-downloads/');
            yield io.mkdirP(swiftDownloadsDir);
            let extractedPath = yield downloadAndExtract(downloadURL, swiftDownloadsDir);
            versionSpecificPath = path.join(extractedPath, '/swift-' + nsv + '-RELEASE-' + osName);
            tc.cacheDir(versionSpecificPath, "swift", nsv, osName);
        }
        else {
            console.log("Found existing Swift tools in cache at path: " + versionSpecificPath);
        }
        let binPath = path.join(versionSpecificPath, "/usr", "/bin/");
        // Install required dependencies
        if (platformInfo.platform === "linux") {
            console.log("Installing Swift dependencies for Linux Ubuntu");
            yield exec.exec('sudo', ['apt-get', 'install', '-y', 'clang', 'libicu-dev']);
        }
        // Add swift tools to the path
        yield core.addPath(binPath);
        return versionSpecificPath;
    });
}
exports.install = install;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let version = core.getInput('swift-version');
        console.log('Installing Swift version ' + version);
        install(version);
    });
}
run();
