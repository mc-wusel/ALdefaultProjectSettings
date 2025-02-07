import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as settingsMgt from './settingsMgt';

const settingsFileName = 'settings.json';
const launchFileName = 'launch.json';
const dirName = '.vscode';

async function createPermissionSet() {
    // frage nach dem Namen des Permission Sets
    const permissionSetName = await vscode.window.showInputBox({
        prompt: 'Please enter the name of the Permission Set.'
    });

    if (permissionSetName === undefined) {
        vscode.window.showInformationMessage('Permission Set was not created.');
        return;
    }

    // im aktuellen arbeisverzeichnis
    if (vscode.workspace.workspaceFolders) {

        const directory = vscode.workspace.workspaceFolders[0];
        const permissionSetDirectory = path.join(directory.uri.fsPath, 'PermissionSets');
        const permissionSetPath = path.join(permissionSetDirectory, `${permissionSetName}Admin.permissionset.al`);
        const editPermissionSetPath = path.join(permissionSetDirectory, `${permissionSetName}Edit.permissionset.al`);
        const readPermissionSetPath = path.join(permissionSetDirectory, `${permissionSetName}Read.permissionset.al`);
        const objectsPermissionSetPath = path.join(permissionSetDirectory, `${permissionSetName}Objects.permissionset.al`);

        if (!fs.existsSync(permissionSetDirectory)) {
            fs.mkdirSync(permissionSetDirectory);
        }

        if (fs.existsSync(permissionSetPath) || fs.existsSync(editPermissionSetPath) || fs.existsSync(readPermissionSetPath) || fs.existsSync(objectsPermissionSetPath)) {
            vscode.window.showErrorMessage('Error: Permission Set already exists.');
            return;
        }

        // erstelle die Dateien
        fs.writeFileSync(permissionSetPath, `
namespace App.App;

permissionset 5000 "${permissionSetName} Admin" {
\tAccess = Public;
\tAssignable = true;

\tCaption = '${permissionSetName} Admin', Locked = true;

\tIncludedPermissionSets = "${permissionSetName} - Edit";
}`);

        fs.writeFileSync(editPermissionSetPath, `
namespace App.App;

permissionset 5001 "${permissionSetName} - Edit" {
\tAccess = Internal;
\tAssignable = false;

\tIncludedPermissionSets = "${permissionSetName} - Read";

\tPermissions = ;
}`);

        fs.writeFileSync(readPermissionSetPath, `
namespace App.App;

permissionset 5002 "${permissionSetName} - Read" {
\tAccess = Internal;
\tAssignable = false;

\tIncludedPermissionSets = "${permissionSetName} - Objects";

\tPermissions = ;
}`);

        fs.writeFileSync(objectsPermissionSetPath, `
namespace App.App;

permissionset 5003 "${permissionSetName} - Objects" {

\tAccess = Internal;
\tAssignable = false;

\tPermissions = ;
}`);

        vscode.window.showInformationMessage('Permission Set has been created.');
    }
}

/**
 * 
 * @param location 
 */
async function handleSidebarLocation(context: vscode.ExtensionContext, location: string) {
    const property = 'workbench.sideBar.location';
    const value = location;

    if (settingsMgt.settingsFileExists()) {
        // check the property
        if (settingsMgt.propertyExists(property)) {
            // modify
            settingsMgt.setProperty(property, value);
        } else {
            // add property
            settingsMgt.setProperty(property, value);
        }
    } else {
        vscode.window.showErrorMessage(settingsFileName + ' is missing.');
    }
}

/**
 * 
 */
async function toggleAppSourceCop() {
    if (settingsMgt.settingsFileExists()) {
        const property = 'al.codeAnalyzers';
        if (settingsMgt.propertyExists(property)) {
            settingsMgt.ToggleAppSourceCop();
        }
    } else {
        vscode.window.showErrorMessage('Error: settings.json is missing.');
    }
}

function registerCMD(context: vscode.ExtensionContext, cmdName: string, callback: (...arg: unknown[]) => unknown) {
    let disposable = vscode.commands.registerCommand(cmdName, callback);
    context.subscriptions.push(disposable);
}

function workspaceFactory() {
    if (vscode.workspace.workspaceFile) {
        const workspaceFilePath = vscode.workspace.workspaceFile.fsPath;

        fs.readFile(workspaceFilePath, 'utf8', async (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`Error reading the workspace file: ${err.message}`);
                return;
            }

            try {
                const workspaceJson = JSON.parse(data);

                let alPrefix: string | undefined;
                while (alPrefix === undefined || alPrefix === '') {
                    alPrefix = await vscode.window.showInputBox({
                        prompt: 'Please enter the prefix for your AL project.'
                    });

                    if (alPrefix === undefined) {
                        vscode.window.showInformationMessage('Workspace settings were not updated.');
                        return;
                    }
                }

                if (workspaceJson.settings) {
                    if (workspaceJson.settings) {
                        workspaceJson.settings = getDefaultSettings(alPrefix);
                        fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceJson, null, 4));
                        vscode.window.showInformationMessage('Settings have been updated in the workspace file.');
                    } else {
                        workspaceJson.settings = getDefaultSettings(alPrefix);
                        fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceJson, null, 4));
                        vscode.window.showInformationMessage('Settings have been added to the workspace file.');
                    }
                } else {
                    workspaceJson.settings = getDefaultSettings(alPrefix);

                    fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaceJson, null, 4));
                    vscode.window.showInformationMessage('Settings have been added to the workspace file.');
                }
            } catch {
                vscode.window.showErrorMessage('Error parsing the workspace file');
            }
        });

        return true;
    } else {
        vscode.window.showErrorMessage('Error: No workspace file is currently open. Please open a .code-workspace file.');
        return false; // Exit
    }
}

function getDefaultSettings(alPrefix: string | undefined) {
    return {
        'search.exclude': {
            '**/.alcache': true,
            '**/rad.json': true,
            '**/*.code-search': true
        },
        'files.trimTrailingWhitespace': false,
        'files.autoSave': 'afterDelay',
        'files.autoSaveDelay': 10000,
        'window.autoDetectColorScheme': false,
        'workbench.statusBar.visible': true,
        'workbench.editor.showTabs': 'multiple',
        'workbench.editor.tabSizing': 'shrink',
        'workbench.editor.tabActionLocation': 'right',
        'workbench.editor.wrapTabs': true,
        'workbench.startupEditor': 'newUntitledFile',
        'workbench.editor.enablePreview': true,
        'workbench.settings.editor': 'json',
        'workbench.sideBar.location': 'left',
        'breadcrumbs.enabled': true,
        'explorer.compactFolders': false,
        'explorer.autoReveal': true,
        'editor.formatOnSave': true,
        'editor.suggestSelection': 'first',
        'editor.snippetSuggestions': 'bottom',
        'editor.suggest.snippetsPreventQuickSuggestions': false,
        'editor.tabCompletion': 'on',
        'editor.wordWrap': 'on',
        'editor.mouseWheelZoom': true,
        'editor.minimap.enabled': false,
        'editor.cursorBlinking': 'phase',
        'editor.cursorStyle': 'line',
        'editor.lineHeight': 22,
        'editor.inlayHints.enabled': 'offUnlessPressed',
        'extensions.ignoreRecommendations': true,
        'git.autofetch': true,
        'git.enableSmartCommit': false,
        'git.suggestSmartCommit': false,
        'git.postCommitCommand': 'push',
        'git.enableStatusBarSync': false,
        'git.pruneOnFetch': true,
        'al.browser': 'Edge',
        'al.enableCodeActions': true,
        'al.enableCodeAnalysis': true,
        'al.incrementalBuild': true,
        'al.backgroundCodeAnalysis': 'Project',
        'al.packageCachePath': '.alpackages',
        'al.compilationOptions': {
            'generateReportLayout': true
        },
        'al.assemblyProbingPaths': [
            '.netpackages'
        ],
        'al.codeAnalyzers': [
            '${AppSourceCop}',
            '${CodeCop}',
            '${UICop}'
        ],
        'al.inlayhints.functionReturnTypes.enabled': true,
        'al.inlayhints.parameterNames.enabled': true,
        'al-test-runner.sendDebugTelemetry': false,
        'CRS.FileNamePattern': '<ObjectNameShort>.<ObjectTypeShortPascalCase>.al',
        'CRS.FileNamePatternExtensions': '<ObjectNameShort>.<ObjectTypeShortPascalCase>.al',
        'CRS.FileNamePatternPageCustomizations': '<ObjectNameShort>.<ObjectTypeShortPascalCase>.al',
        'CRS.ObjectNamePrefix': alPrefix || 'MyPrefix',
        'CRS.RenameWithGit': false,
        'CRS.DependencyGraph.ExcludePublishers': [
            'Microsoft'
        ],
        '[al]': {
            'editor.wordBasedSuggestions': 'off',
            'editor.suggestSelection': 'first',
            'editor.formatOnSave': true,
            'editor.semanticHighlighting.enabled': false
        },
        'notebook.breadcrumbs.showCodeCells': true
    };
}

async function addCloudLaunchSettings() {
    if (vscode.workspace.workspaceFolders) {

        const directory = vscode.workspace.workspaceFolders[0];
        const settingsDirectory = path.join(directory.uri.fsPath, dirName);
        const settingsPath = path.join(settingsDirectory, launchFileName);
        try {
            let environmentName: string | undefined;

            while (environmentName === undefined || environmentName === '') {
                environmentName = await vscode.window.showInputBox({
                    prompt: 'Please enter the name of the environment.'
                });

                if (environmentName === undefined) {
                    vscode.window.showInformationMessage(launchFileName + ' is not updated.');
                    return;
                }
            }

            if (fs.existsSync(settingsPath)) {

                const fileContent = fs.readFileSync(settingsPath, 'utf8');
                const launchJson = JSON.parse(fileContent);
                const configurations = launchJson.configurations || [];

                // update the name of the existing configurations
                configurations.forEach((config: { name: string }, index: number) => {
                    const existingName = config.name.includes('-')
                        ? config.name.split('-').slice(1).join('-').trim()
                        : config.name.trim();
                    config.name = `${index + 1} - ${existingName}`;
                });

                const configurationCount = configurations.length;
                const configEnviromentName = `${configurationCount + 1} - ${environmentName}`;

                const SaaSConfig = {
                    name: configEnviromentName,
                    type: 'al',
                    request: 'launch',
                    environmentType: 'Sandbox',
                    environmentName: environmentName,
                    startupObjectId: 22,
                    breakOnError: true,
                    breakOnRecordWrite: 'None',
                    launchBrowser: true,
                    enableLongRunningSqlStatements: true,
                    enableSqlInformationDebugger: true,
                    numberOfSqlStatements: 10,
                    dependencyPublishingOption: "Default",
                    tenant: "default",
                };

                // add the new configuration
                configurations.push(SaaSConfig);
                launchJson.configurations = configurations;
                // update the file
                fs.writeFileSync(settingsPath, JSON.stringify(launchJson, null, 4));

                vscode.window.showInformationMessage(`The ${launchFileName} has been successfully updated with the new configuration: ${configEnviromentName}`);
            } else {
                vscode.window.showErrorMessage('Error: ' + launchFileName + ' is not found.');
            }
        }
        catch {
            vscode.window.showErrorMessage('Error updating the file.');
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    registerCMD(context, 'mc.go', async () => {
        if (vscode.workspace.workspaceFolders) {

            const directory = vscode.workspace.workspaceFolders[0];
            const settingsDirectory = path.join(directory.uri.fsPath, dirName);
            const settingsPath = path.join(settingsDirectory, settingsFileName);
            try {
                let alPrefix: string | undefined;

                while (alPrefix === undefined || alPrefix === '') {
                    alPrefix = await vscode.window.showInputBox({
                        prompt: 'Please enter the prefix for your AL project.'
                    });

                    if (alPrefix === undefined) {
                        vscode.window.showInformationMessage(settingsFileName + ' was not created');
                        return;
                    }
                }

                // directory does not exist 
                if (!fs.existsSync(settingsDirectory)) {
                    fs.mkdirSync(settingsDirectory);
                }
                const settings = getDefaultSettings(alPrefix);

                // check whether the file already exists
                if (fs.existsSync(settingsPath)) {
                    vscode.window.showWarningMessage(settingsFileName + ' already exists! Should this file be overwritten?', 'Yes', 'No')
                        .then(async selection => {
                            if (selection === 'Yes') {
                                // create file
                                fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
                                // init appSourceCop
                                settingsMgt.initAppSourceCop(alPrefix || '');
                            }
                        });
                } else {
                    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
                    // init appSourceCop
                    settingsMgt.initAppSourceCop(alPrefix);

                    if (fs.existsSync(settingsPath)) {
                        vscode.window.showInformationMessage(settingsFileName + ' has been created.');
                    } else {
                        vscode.window.showErrorMessage('Error: ' + settingsFileName + ' could not be created.');
                    }
                }
            }
            catch {
                vscode.window.showErrorMessage('Error creating the file.');
            }
        }
    });
    registerCMD(context, 'mc.right', async () => handleSidebarLocation(context, 'right'));
    registerCMD(context, 'mc.left', async () => handleSidebarLocation(context, 'left'));
    registerCMD(context, 'mc.toggleAppSourceCop', async () => toggleAppSourceCop());
    registerCMD(context, 'mc.workspace', async () => workspaceFactory());
    registerCMD(context, 'mc.addCloudLaunchSettings', async () => addCloudLaunchSettings());
    registerCMD(context, 'mc.createPermissionSet', async () => createPermissionSet());
}

export function deactivate() { }
