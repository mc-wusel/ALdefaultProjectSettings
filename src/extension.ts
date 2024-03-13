import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('mc.go', async () => {
		if (vscode.workspace.workspaceFolders) {
			const filename = 'settings.json';
			const dirName = '.vscode';
			const directory = vscode.workspace.workspaceFolders[0];
			const settingsDirectory = path.join(directory.uri.fsPath, dirName);
			const settingsPath = path.join(settingsDirectory, filename);

			try {
				// directory does not exist 
				if (!fs.existsSync(settingsDirectory)) {
					fs.mkdirSync(settingsDirectory);
				}

				let alPrefix: string | undefined;

				while (alPrefix === undefined || alPrefix === '') {
					alPrefix = await vscode.window.showInputBox({
						prompt: 'Please enter the prefix for your AL project.'
					});
				}

				const settings = {
					'search.exclude': {
						'**/.alcache': true,
						'**/rad.json': true,
						'**/*.code-search': true
					},
					'files.trimTrailingWhitespace': false,
					'files.autoSave': 'afterDelay',
					'files.autoSaveDelay': 10000,
					'window.autoDetectColorScheme': false,
					'workbench.sideBar.location': 'right',
					'workbench.statusBar.visible': true,
					'workbench.editor.showTabs': 'multiple',
					'workbench.editor.tabSizing': 'shrink',
					'workbench.editor.tabActionLocation': 'right',
					'workbench.editor.wrapTabs': true,
					'workbench.startupEditor': 'newUntitledFile',
					'workbench.editor.enablePreview': true,
					'workbench.settings.editor': 'json',
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
					'CRS.ObjectNamePrefix': alPrefix + ' ',
					'CRS.RenameWithGit': false,
					'CRS.DependencyGraph.ExcludePublishers': [
						'Microsoft'
					],
					'[al]': {
						'editor.wordBasedSuggestions': 'off',
						'editor.suggestSelection': 'first',
						'editor.formatOnSave': true,
						'editor.semanticHighlighting.enabled': false,
					},
					'notebook.breadcrumbs.showCodeCells': true
				};

				// check whether the file already exists
				if (fs.existsSync(settingsPath)) {
					vscode.window.showWarningMessage(filename + ' already exists! Should this file be overwritten?', 'Yes', 'No')
						.then(async selection => {
							if (selection === 'Yes') {
								// create file
								fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
							}
						});
				} else {
					fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
				}
				// check the file
				if (fs.existsSync(settingsPath)) {
					vscode.window.showInformationMessage(filename + ' has been created.');
				} else {
					vscode.window.showErrorMessage('Error: ' + filename + ' could not be created.');
				}
			}
			catch (err) {
				vscode.window.showErrorMessage('Error creating the file.');
			}
		}
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }
