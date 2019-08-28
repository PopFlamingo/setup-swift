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
function install(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const platformName = os.platform();
        if (platformName === "linux") {
            let myOutput = "";
            const options = {
                listeners: {
                    stdout: (data) => {
                        myOutput += data.toString();
                    }
                }
            };
            yield exec.exec('lsb_release', ['-r'], options);
            core.warning(myOutput);
            let uversion = myOutput.split('\t')[1];
            uversion = uversion.substring(0, uversion.length - 1);
            core.warning(uversion);
            const dotLessPlatformNum = uversion.replace('.', '');
            let swiftPath = tc.find('swift', version);
            if (!swiftPath) {
                try {
                    const url = 'https://swift.org/builds/swift-' + version + '-release/ubuntu' + dotLessPlatformNum + '/swift-' + version + '-RELEASE/swift-' + version + '-RELEASE-ubuntu' + uversion + '.tar.gz';
                    core.warning(url);
                    const tarPath = yield tc.downloadTool(url);
                    yield io.mkdirP(os.homedir() + '/swift-downloads/');
                    const installPath = yield tc.extractTar(tarPath, os.homedir() + '/swift-downloads/');
                    yield tc.cacheDir(installPath, 'swift', version);
                }
                catch (e) {
                    core.setFailed("Couldn't download and install Swift, error: " + e);
                    return;
                }
            }
            core.addPath(path.join(swiftPath, 'usr', 'bin'));
        }
        else {
            core.setFailed("Platform " + platformName + " isn't currently supported.");
            return;
        }
    });
}
exports.install = install;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        install(core.getInput('version'));
    });
}
run();
