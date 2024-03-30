import * as vscode from 'vscode';
import * as ChildProcess from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as os from 'os';
import * as unzipper from 'unzipper';

export function isDockerInstalled(): boolean {
  let result = false;

  try {
    ChildProcess.execSync('docker -v');
    result = true;
  } catch (error) {
    result = false;
  }
  return result;
}

export function installDocker() {
    https.get('https://download.docker.com/components/engine/windows-server/index.json', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
            const jsonData = JSON.parse(data);
           
            const versionTmp = '19.03.5';

            if (jsonData.versions[versionTmp]) {
              const versionData = jsonData.versions[versionTmp];
              const DownloadUrl = versionData.url;
              console.log(DownloadUrl);

              const file = fs.createWriteStream(`C:\\Users\\${os.userInfo().username}\\Downloads\\docker.zip`);

              https.get(DownloadUrl, (response) => {
                
                response.pipe(file);
                
                vscode.window.withProgress({

                  location: vscode.ProgressLocation.Notification,
                  title: 'Docker is downloading...',
                  cancellable: false

                }, (progress, token) => {
                  return new Promise<void>((resolve, reject) => { 
                    const timer = setInterval(() => {
                      progress.report({ increment: 2 });
                    }, 1000);
                    file.on('finish', () => {
                      clearInterval(timer);
                      resolve();
                    });
                  });
                });
                file.on('finish', function() {
                  file.close(() => {
                    fs.createReadStream(`C:\\Users\\${os.userInfo().username}\\Downloads\\docker.zip`)
                      .pipe(unzipper.Extract({ path: `C:\\Users\\${os.userInfo().username}\\Downloads\\` }))
                      .on('close', () => {
                        console.log('Docker has been unpacked.');
                      })
                      .on('error', (err: Error) => { 
                        console.error('Error unpacking file:', err);
                      });
                  });
                });

                file.on('error', (err) => {
                  fs.unlink(`C:\\Users\\${os.userInfo().username}\\Downloads\\docker.zip`, () => {});
                  console.error('Error downloading file:', err);
                });
              });
            }     
      });
    });
  }