import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import * as installer from './installer';



async function run() {
    let version = core.getInput('swift-version');
    console.log('Installing Swift version ' + version);
    installer.install(version);
}

run();
