#!/usr/bin/env node
const [, , ...args] = process.argv;
const currnetPath = process.cwd();
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const readdirp = require('readdirp');
const Mustache = require('mustache');
const AWS = require('aws-sdk');
const editJsonFile = require('edit-json-file');

// require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(
  '\x1b[33m',
  " _____                  __  __                                            _ _\n |  ___|__  _ __ ___ ___|  \\/  | __ _ _ __   __ _  __ _  ___ _ __      ___| (_)\n | |_ / _ \\| '__/ __/ _ \\ |\\/| |/ _` | '_ \\ / _` |/ _` |/ _ \\ '__|___ / __| | |\n |  _| (_) | | | (_|  __/ |  | | (_| | | | | (_| | (_| |  __/ | |____| (__| | |\n |_|  \\___/|_|  \\___\\___|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|       \\___|_|_|\n                                                  |___/",
);
console.log('\x1b[37m', '');

if (args[0] == 'create') {
  let fmConfigData;
  let settings = {
    root: '',
    entryType: 'all',
  };
  let allFiles = [];
  let name = args[1];
  let convert = false;

  if (!name) {
    console.log(
      '\x1b[37m%s\x1b[36m%s\x1b[32m%s\x1b[37m%s\x1b[36m%s\x1b[32m',
      'Please specify the project directory:\n',
      '   fm-cli create',
      ' <project-directory>\n\n',
      'For example:\n',
      '   fm-cli create',
      ' my-custom-widget\n',
    );
  } else {
    if (!fs.existsSync(resolve.join(currnetPath, name))) {
      getDetails(false);
    } else if (fs.existsSync(resolve.join(currnetPath, name, 'fmConfig.json'))) {
      console.log(
        `The project ${name} alredy exists as a ForceManager Fragment. Please start again the create process and choose another project name.\n`,
      );
    } else {
      inquirer
        .prompt([
          {
            name: 'convert',
            type: 'list',
            message: `The project ${name} alredy exists. Do you want to convert this project to a ForceManager Fragment?\n`,
            choices: ['No', 'Yes'],
            default: 0,
          },
        ])
        .then((answers) => {
          if (answers.convert === 'Yes') {
            getDetails(true);
          }
        })
        .catch((err) => console.warn(err));
    }

    function getDetails(convert) {
      inquirer
        .prompt([
          {
            name: 'type',
            type: 'list',
            message: 'Type',
            choices: ['Widget', 'Form', 'Page'],
            default: 0,
          },
          {
            name: 'widget_type',
            type: 'list',
            message: 'Widget type',
            choices: ['Entity widget', 'SFM widget'],
            default: 0,
            when: function(answers) {
              return answers.type === 'Widget';
            },
          },
        ])
        .then((answers) => {
          fmConfigData = {
            name: name,
            type: answers.type.toLowerCase(),
            widget_type: function() {
              switch (answers.widget_type) {
                case 'Entity widget':
                  return 'entity';
                case 'SFM widget':
                  return 'sfm';
              }
            },
          };
          settings.root = path.resolve(__dirname, 'templates', fmConfigData.type);
          if (convert) {
            settings.depth = 0;
            settings.entryType = 'files';
            settings.fileFilter = ['fmConfig.json.mustache'];
          }
          readdirp(settings)
            .on('data', (file) => {
              allFiles.push(file);
            })
            .on('warn', (warn) => {
              console.warn('Warn: ', warn);
            })
            .on('error', (err) => {
              console.error('error: ', err);
            })
            .on('end', () => {
              copyFiles();
            });
        })
        .catch((err) => console.error(err));
    }
    function copyFiles() {
      console.log('allFiles', allFiles);
      fs.mkdirp(path.resolve(currnetPath, fmConfigData.name))
        .then(() => {
          for (const file of allFiles) {
            if (fs.lstatSync(file.fullPath).isDirectory()) {
              fs.mkdirp(path.resolve(currnetPath, fmConfigData.name, file.path), (err) => {
                if (err) console.error(err);
              });
              continue;
            }
            fs.readFile(file.fullPath, 'utf8', (error, fileContent) => {
              if (error) {
                throw error;
              }
              let outputfileContent = fileContent;
              if (file.name.split('.').pop() === 'mustache') {
                outputfileContent = Mustache.render(fileContent, fmConfigData);
              }
              fs.writeFile(
                path.resolve(currnetPath, fmConfigData.name, file.path.replace('.mustache', '')),
                outputfileContent,
                (err) => {
                  if (err) {
                    return console.error(err);
                  }
                },
              );
            });
          }
          console.log('Done!');
        })
        .catch((err) => console.error(err));
    }
  }
} else if (args[0] === 'deploy') {
  fs.readFile(path.resolve(currnetPath, 'fmConfig.json'), 'utf8', (error, fileContent) => {
    if (error) {
      console.log('No existe un proyecto válido en esta ubicación');
    } else {
      let fmConfig = JSON.parse(fileContent);
      let AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
      let AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

      checkAWSkeys = () => {
        if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
          return Promise.resolve();
        } else {
          return inquirer
            .prompt([
              {
                name: 'aws__access_key_id',
                ttype: 'input',
                message: 'Enter your AWS_ACCESS_KEY_ID:',
              },
              {
                name: 'aws_secret_access_key',
                type: 'input',
                message: 'Enter your AWS_SECRET_ACCESS_KEY:',
              },
            ])
            .then((answers) => {
              let AWS_ACCESS_KEY_ID = answers.aws__access_key_id;
              let AWS_SECRET_ACCESS_KEY = answers.aws_secret_access_key;
              let envFilepath = path.resolve(__dirname, '.env');
              let envFileContent = `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}\nAWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}`;
              return fs.writeFile(envFilepath, envFileContent);
            })
            .catch((err) => console.error(err));
        }
      };

      checkGuid = () => {
        if (fmConfig.guid) {
          return Promise.resolve();
        } else {
          return inquirer
            .prompt([
              {
                name: 'guid',
                ttype: 'input',
                message: 'Enter the GUID',
              },
            ])
            .then((answers) => {
              let fmConfigEdit = editJsonFile(path.resolve(currnetPath, 'fmConfig.json'));
              fmConfigEdit.set('guid', answers.guid);
              fmConfigEdit.save();
              fmConfig.guid = answers.guid;
            })
            .catch((err) => console.error(err));
        }
      };

      uploadFiles = () => {
        return new Promise((resolve, reject) => {
          const s3 = new AWS.S3({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
          });
          const distFolderPath = path.join(currnetPath, fmConfig.distFolder);
          console.log('distFolderPath', distFolderPath);
          let settings = {
            root: distFolderPath,
            entryType: 'all',
          };
          let allFiles = [];
          readdirp(settings)
            .on('data', function(file) {
              allFiles.push(file);
            })
            .on('warn', function(warn) {
              reject(warn);
            })
            .on('error', function(err) {
              reject(err);
            })
            .on('end', function() {
              let promises = [];
              for (const file of allFiles) {
                if (fs.lstatSync(file.fullPath).isDirectory()) {
                  continue;
                }
                promises.push(
                  fs
                    .readFile(file.fullPath)
                    .then((fileContent) => {
                      const params = {
                        Bucket: 'fmassets',
                        Key: `fragments/${fmConfig.guid}/${file.path}`,
                        Body: fileContent,
                      };
                      return s3.upload(params).promise();
                    })
                    .then((data) => {
                      console.log(`Successfully uploaded '${file.fullPath}' in ${data.Location}`);
                    })
                    .catch((err) => reject(err)),
                );
              }
              Promise.all(promises)
                .then(() => resolve())
                .catch((err) => reject(err));
            });
        });
      };

      checkAWSkeys()
        .then(() => checkGuid())
        .then(() => uploadFiles())
        .then(() => console.log('Done!'))
        .catch((err) => console.error(err));
    }
  });
} else if (args[0] === 'start') {
  fs.readFile(path.resolve(currnetPath, 'fmConfig.json'), 'utf8', (error, fileContent) => {
    if (error) {
      console.log('No existe un proyecto válido en esta ubicación');
    } else {
      let fmConfig = JSON.parse(fileContent);
      let http = require('http');
      let filePath = path.resolve(__dirname, 'src', 'index.html');
      let port = args[1] ? args[1] : 3000;
      let data = {
        port,
        name: fmConfig.name,
        type: fmConfig.type,
        widgetType: fmConfig.widgetType,
      };
      fs.readFile(filePath, 'utf8', (error, fileContent) => {
        if (error) {
          throw error;
        }
        let html = Mustache.render(fileContent, data);
        http
          .createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(html);
            res.end();
          })
          .listen(8080, () => {
            console.log(`Server running on port 8080, loading iframe on port ${port}`);
          })
          .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.log('Port 8080 is already in use');
              return;
            }
            console.warn(err);
          });
      });
    }
  });
}
