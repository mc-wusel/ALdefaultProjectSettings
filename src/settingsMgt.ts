import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const filename = 'settings.json';
const dirName = '.vscode';

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

      } catch ( error ) {
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
    try{
      // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      // search property
       if(settings.hasOwnProperty(property)){
        result = true;
       } else {
        result = false;
       }
    } catch ( error ) {
      result = false;
    }
  } else {
    result = false;
  }
  return result;
}

export function setProperty(property: string, value: any): void {
  if (vscode.workspace.workspaceFolders) {  
    const directory = vscode.workspace.workspaceFolders[0];
    const settingsDirectory = path.join(directory.uri.fsPath, dirName);
    const settingsPath = path.join(settingsDirectory, filename);
    try{
    // read the file
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);    

      settings[property] = value;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
    } catch ( error ) {
      vscode.window.showErrorMessage(`Error setting property "${property}"`);
    }
  }
}