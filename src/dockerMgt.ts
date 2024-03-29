import * as vscode from 'vscode';
import * as childProcess from 'child_process';

// check if docker is installed and return a boolean
export function isDockerInstalled(): boolean {
    let result = false;

    try {
        childProcess.execSync('docker -v');
        result = true;
    } catch (err) {
        result = false;
    }

    return result;
}