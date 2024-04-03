import * as vscode from 'vscode';
import { PowerShell } from 'node-powershell';

export async function installBcContainerHelper() {
    const ps = new PowerShell({
        pwsh: true,
        pwshPrev: false,
        executableOptions: {
            '-ExecutionPolicy': 'Bypass',
            '-NoProfile': true
        }
    });

    const progressOptions: vscode.ProgressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: 'Installing BcContainerHelper...',
        cancellable: false
    };

    vscode.window.withProgress(progressOptions, async () => {
        try {
            await ps.invoke('Install-Module -Name BcContainerHelper -RequiredVersion 6.0.12');
        } catch (error) {
            console.error(error);
        } finally {
            ps.dispose();
        }
    });
}