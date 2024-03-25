import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const filename = 'settings.json';
const dirName = '.vscode';

/**
 * Toggles the ${AppSourceCop} in al.codeAnalyzers
 * @returns void
 */
export function ToggleAppSourceCop(): void {
  if (vscode.workspace.workspaceFolders) {
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);
   
    try {
      // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      const analyzers = settings['al.codeAnalyzers'];
   
      if (Array.isArray(analyzers)) {
        const index = analyzers.indexOf('${AppSourceCop}');
   
        if (index !== -1) {
          analyzers.splice(index, 1);
          deleteAppSourceCop();
        } else {
          analyzers.push('${AppSourceCop}');

          // Add AppSourceCodeCop  file
          initAppSourceCop(getPropertyValue('CRS.ObjectNamePrefix'));
        }
        settings['al.codeAnalyzers'] = analyzers;
   
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error read ${filename}`);
    }
  }
}

/**
 * Delete AppSourceCop.json from root directory
 */
export function deleteAppSourceCop(): void {
 if (vscode.workspace.workspaceFolders) {
  const AppSourceCop = 'AppSourceCop.json';

  try {
			const directory = vscode.workspace.workspaceFolders[0];
      const settingsDirectory = path.join(directory.uri.fsPath, '');
			const settingsPath = path.join(settingsDirectory, AppSourceCop);
      // file delete
      if(fs.existsSync(settingsPath)) {
        fs.unlinkSync(settingsPath);
      }
  } catch (err) {
	  vscode.window.showErrorMessage('Error deleting file ' + AppSourceCop);
	}
 }
}

/**
 * Create the AppSourceCop.json file
 * @returns void
 */
export function initAppSourceCop(appPrefix: string): void {
 if (vscode.workspace.workspaceFolders) {
  try {
      const AppSourceCop = 'AppSourceCop.json';
			const directory = vscode.workspace.workspaceFolders[0];
      const settingsDirectory = path.join(directory.uri.fsPath, '');
			const settingsPath = path.join(settingsDirectory, AppSourceCop);
      const settings = {'mandatoryAffixes': [appPrefix]};

    // check whether the file already exists
		if (fs.existsSync(settingsPath)) {
			vscode.window.showWarningMessage(AppSourceCop + ' already exists! Should this file be overwritten?', 'Yes', 'No')
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
		  vscode.window.showInformationMessage(AppSourceCop + ' has been created.');
		} else {
		  vscode.window.showErrorMessage('Error: ' + AppSourceCop + ' could not be created.');
		}
  } catch (err) {
	  vscode.window.showErrorMessage('Error creating the file.');
	}
 }
}

/**
 * Checks whether the settings.json exists
 * @returns boolean
 */
export function settingsFileExists(): boolean {
  let result = false;

  if (vscode.workspace.workspaceFolders) {
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);

    try {
      // directory does not exist 
      if (!fs.existsSync(settingsDirectory)) {
        fs.mkdirSync(settingsDirectory);
      }

      if (fs.existsSync(settingsPath)) {
        result = true;
      }

    } catch (error) {
      result = false;
    }
  }
  return result;
}

/**
 * Searches the settings.json for a property
 * @param property 
 * @returns boolean
 */
export function propertyExists(property: string): boolean {
  let result = false;

  if (vscode.workspace.workspaceFolders) {
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);
    try {
      // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      
      // search property
      if (settings.hasOwnProperty(property)) {
        result = true;
      } else {
        result = false;
      }
    } catch (error) {
      result = false;
    }
  } else {
    result = false;
  }
  return result;
}

/**
 * Set the value of a settings.json property.
 * @param property 
 * @param value 
 */
export function setProperty(property: string, value: any): void {
  if (vscode.workspace.workspaceFolders) {
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);
   
    try {
      // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);

      settings[property] = value;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
    } catch (error) {
      vscode.window.showErrorMessage(`Error setting property "${property}"`);
    }
  }
}

/**
 * Get the property value from json file
 * @param property
 * @returns string 
 */
export function getPropertyValue(property: string): string  {
  let value = undefined;
 
  if (vscode.workspace.workspaceFolders) {
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);
   
    try {
      // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data); 
      
      if( settings.hasOwnProperty(property)){
        value = settings[property];
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error getting property "${property}" value.`);
    }
  }
  return value;
}