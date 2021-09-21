#!/usr/bin/env node
const [, , ...args] = process.argv;
const currnetPath = process.cwd();
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const readdirp = require('readdirp');
const Mustache = require('mustache');
const editJsonFile = require('edit-json-file');
const open = require('open');
const archiver = require('archiver');
const axios = require('axios');
const envfile = require('envfile');
const download = require('download-git-repo');
const packageJson = require('./package.json');

console.log(
  '\x1b[33m',
  " _____                  __  __                                            _ _\n |  ___|__  _ __ ___ ___|  \\/  | __ _ _ __   __ _  __ _  ___ _ __      ___| (_)\n | |_ / _ \\| '__/ __/ _ \\ |\\/| |/ _` | '_ \\ / _` |/ _` |/ _ \\ '__|___ / __| | |\n |  _| (_) | | | (_|  __/ |  | | (_| | | | | (_| | (_| |  __/ | |____| (__| | |\n |_|  \\___/|_|  \\___\\___|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|       \\___|_|_|\n                                                  |___/",
);
console.log('\x1b[37m', '');

if (args[0] === 'create') {
  console.log('\x1b[0m', 'FM Create\n');
  create();
} else if (args[0] === 'deploy') {
  console.log('\x1b[0m', 'FM Deploy\n');
  deploy(false);
} else if (args[0] === 'deploy_sandbox') {
  console.log('\x1b[0m', 'FM Deploy\n');
  deploy(true);
} else if (args[0] === 'start') {
  start();
} else if (args[0] === 'set_public_url') {
  console.log('\x1b[0m', 'FM Pre-build\n');
  setPublicUrl(false);
} else if (args[0] === 'set_public_url_sandbox') {
  console.log('\x1b[0m', 'FM Pre-build\n');
  setPublicUrl(true);
} else if (args[0] === '-v') {
  console.log('\x1b[0m', `Version: ${packageJson.version}\n`);
} else {
  console.log('\x1b[0m', 'No arguments found. Please use create, start or deploy.');
}

function slugify(str) {
  const map = {
    '-': ' ',
    '-': '_',
    a: 'á|à|ã|â|À|Á|Ã|Â',
    e: 'é|è|ê|É|È|Ê',
    i: 'í|ì|î|Í|Ì|Î',
    o: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
    u: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    c: 'ç|Ç',
    n: 'ñ|Ñ',
  };

  str = str.toLowerCase();

  for (const pattern in map) {
    str = str.replace(new RegExp(map[pattern], 'g'), pattern);
  }

  return str;
}

function create() {
  let fmConfigData;
  let settings = {
    root: '',
    entryType: 'all',
  };
  let name = args[1];

  if (!name) {
    console.log(
      '\x1b[37m%s\x1b[36m%s\x1b[32m%s\x1b[37m%s\x1b[36m%s\x1b[32m%s\x1b[0m',
      'Please specify the project directory:\n',
      '   fm-cli create',
      ' <project-directory>\n\n',
      'For example:\n',
      '   fm-cli create',
      ' my-custom-widget\n',
      '',
    );
  } else {
    name = slugify(name);
    if (!fs.existsSync(path.join(currnetPath, name))) {
      getDetails(false);
    } else if (fs.existsSync(path.join(currnetPath, name, 'fmConfig.json'))) {
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
        .catch(console.error);
    }

    function getDetails(convert) {
      inquirer
        .prompt([
          {
            name: 'type',
            type: 'list',
            message: 'Type',
            choices: ['Widget', 'Form'], //, 'Page'
            default: 0,
          },
          // {
          //   name: 'widget_type',
          //   type: 'list',
          //   message: 'Widget type',
          //   choices: ['Entity widget', 'SFM widget'],
          //   default: 0,
          //   when: function(answers) {
          //     return answers.type === 'Widget';
          //   },
          // },
        ])
        .then((answers) => {
          fmConfigData = {
            name: name,
            type: answers.type.toLowerCase(),
            widget_type: 'entity',
            widget_type: function () {
              if (answers.type === 'Widget') {
                return 'entity';
                // switch (answers.widget_type) {
                //   case 'Entity widget':
                //     return 'entity';
                //   case 'SFM widget':
                //     return 'sfm';
                // }
              } else {
                return '';
              }
            },
          };
          settings.root = path.resolve(__dirname, 'templates', fmConfigData.type);
          if (convert) {
            createFmConfig();
          } else {
            copyFiles();
          }
        })
        .catch(console.error);
    }

    function createFmConfig() {
      fs.writeJson(path.join(currnetPath, fmConfigData.name, 'fmConfig.json'), fmConfigData)
        .then((res) => {
          console.log('Done!');
        })
        .catch(console.error);
    }

    function copyFiles() {
      download(`ForceManager/fm-${fmConfigData.type}-template`, fmConfigData.name, function (err) {
        if (err) {
          console.warn('Error downloading template.');
        } else {
          Promise.all([
            setProjectName(path.join(currnetPath, fmConfigData.name, 'fmConfig.json'), false),
            setProjectName(path.join(currnetPath, fmConfigData.name, 'package.json'), true),
          ])
            .then((res) => {
              console.log('Done!');
            })
            .catch(console.error);
        }
      });
    }

    function setProjectName(filePath, resetVersion) {
      return fs
        .readJson(filePath)
        .then((jsonFile) => {
          jsonFile.name = fmConfigData.name;
          if (resetVersion) {
            jsonFile.version = '0.0.1';
          }
          return fs.writeJson(filePath, jsonFile);
        })
        .catch(console.error);
    }
  }
}

function deploy(sandbox) {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
  fs.readFile(path.resolve(currnetPath, 'fmConfig.json'), 'utf8', (error, fileContent) => {
    if (error) {
      console.log('No existe un proyecto válido en esta ubicación');
    } else {
      let fmConfig = JSON.parse(fileContent);
      let cfm_user = process.env.CFM_USER;
      let cfm_token = process.env.CFM_TOKEN;
      let signedUrl;
      const zipFilePath = `${__dirname}/file.zip`;
      const guidKey = sandbox ? 'guidSandbox' : 'guid';
      const implementationKey = sandbox ? 'implementationIdSandbox' : 'implementationId';

      checkGuidAndImpId = () => {
        if (fmConfig[guidKey] && fmConfig[implementationKey]) {
          return Promise.resolve();
        } else {
          return inquirer
            .prompt([
              {
                name: 'implementationId',
                type: 'input',
                message: 'Enter implementation Id',
                default: fmConfig[implementationKey] || null,
              },
              {
                name: 'guid',
                type: 'input',
                message: 'Enter GUID',
                default: fmConfig[guidKey] || null,
              },
            ])
            .then((answers) => {
              let fmConfigEdit = editJsonFile(path.resolve(currnetPath, 'fmConfig.json'));
              fmConfigEdit.set(guidKey, answers.guid);
              fmConfigEdit.set(implementationKey, answers.implementationId);
              fmConfigEdit.save();
              fmConfig.guid = answers.guid;
              fmConfig[guidKey] = answers.guid;
              fmConfig[implementationKey] = answers.implementationId;
            })
            .catch(console.error);
        }
      };

      checkToken = () => {
        if (cfm_token) {
          return Promise.resolve();
        } else {
          return login()
            .then((res) => fs.writeFile(res.envFilepath, res.envFileContent))
            .catch((err) => console.error('Check token error'));
        }
      };

      login = () => {
        return new Promise((resolve, reject) => {
          inquirer
            .prompt([
              {
                name: 'username',
                type: 'input',
                message: 'Email:',
                default: cfm_user,
              },
              {
                name: 'password',
                type: 'password',
                message: 'Password:',
              },
            ])
            .then((answers) => {
              cfm_user = answers.username;
              return axios({
                method: 'post',
                url: 'https://be-cfm.forcemanager.net/api/authenticate/v1/login',
                data: { username: answers.username, password: answers.password },
                timeout: 30000,
                withCredentials: false,
                maxContentLength: 128 * 1024 * 1024,
                dataType: 'json',
                contentType: 'application/json',
                accept: '*/*',
              });
            })
            .then((res) => {
              cfm_token = res.data.token;
              let envFilepath = path.resolve(__dirname, '.env');
              let envFileContent = `CFM_USER=${cfm_user}\nCFM_TOKEN=${cfm_token}`;
              fs.writeFile(envFilepath, envFileContent).then(resolve).catch(reject);
            })
            .catch((err) => {
              if (err.response && err.response.status === 400) {
                console.log('Wrong user or password');
                return login();
              } else if (err.response && err.response.status === 401) {
                console.log('Expired token');
                cfm_token = '';
                return login();
              } else {
                console.error(err);
                reject();
              }
            });
        });
      };

      getSignedUrl = () => {
        console.log('Getting upload signed URL...');
        return new Promise((resolve, reject) => {
          return axios({
            method: 'get',
            url: `https://be-cfm.forcemanager.net/api/fragments/v1/${fmConfig[guidKey]}/upload`,
            headers: { Authorization: `Bearer ${cfm_token}` },
            contentType: 'application/json',
            accept: '*/*',
          })
            .then((res) => {
              signedUrl = res.data.url;
              resolve();
            })
            .catch((err) => {
              console.error('Get upload URL error:', err.response.data.error);
              reject();
            });
        });
      };

      zipFiles = () => {
        console.log('Creating Zip file...');
        return new Promise((resolve, reject) => {
          const distFolderPath = path.join(currnetPath, fmConfig.distFolder);
          let settings = {
            entryType: 'all',
          };
          let allFiles = [];
          let output = fs.createWriteStream(zipFilePath);
          let archive = archiver('zip', {
            zlib: { level: 9 },
          });

          output.on('close', function () {
            console.log('Zip file successfully created. Size: ' + archive.pointer() + ' bytes.');
          });

          output.on('end', function () {
            console.log('Data has been drained');
          });

          archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
              console.warn(err);
            } else {
              throw err;
            }
          });

          archive.on('error', function (err) {
            throw err;
          });

          archive.pipe(output);

          readdirp(distFolderPath, settings)
            .on('data', function (file) {
              allFiles.push(file);
            })
            .on('warn', function (warn) {
              reject(warn);
            })
            .on('error', function (err) {
              reject(err);
            })
            .on('end', function () {
              let promises = [];
              for (const file of allFiles) {
                if (fs.lstatSync(file.fullPath).isDirectory()) {
                  archive.directory('subdir/', file.fullPath);
                  continue;
                }
                promises.push(
                  fs
                    .readFile(file.fullPath)
                    .then((fileContent) => archive.append(fileContent, { name: file.path }))
                    .catch(reject),
                );
              }
              Promise.all(promises)
                .then(() => archive.finalize())
                .then(() => resolve())
                .catch(reject);
            });
        });
      };

      uploadFile = (zipFileContent) => {
        console.log('Uploading Zip file...');
        const options = {
          headers: {
            'Content-Type': 'application/zip',
          },
        };
        return axios
          .put(signedUrl, zipFileContent, options)
          .catch((err) => console.error('Upload error:', err));
      };

      function changeImplementation(implementationId) {
        return new Promise((resolve, reject) => {
          console.log('Implementation ', implementationId);
          axios({
            method: 'put',
            url: 'https://be-cfm.forcemanager.net/api/config/v1/changeImplementation',
            headers: { Authorization: `Bearer ${cfm_token}` },
            contentType: 'application/json',
            accept: '*/*',
            data: {
              implementation: String(implementationId),
            },
          })
            .then((res) => {
              cfm_token = res.data.token;
              let envFilepath = path.resolve(__dirname, '.env');
              let envFileContent = `CFM_USER=${cfm_user}\nCFM_TOKEN=${cfm_token}`;
              fs.writeFile(envFilepath, envFileContent)
                .then(resolve)
                .catch((err) => {
                  console.error('Error writing .env file: ', err);
                  reject();
                });
            })
            .catch((err) => {
              console.error('Change implementation error:', err.response.data.error || err);
              if ((err.response.data.code = '2')) {
                return login()
                  .then((res) => changeImplementation(implementationId))
                  .then(resolve)
                  .catch((err) => {
                    console.error(err);
                    reject();
                  });
              } else {
                reject();
              }
            });
        });
      }

      checkGuidAndImpId()
        .then(checkToken)
        .then(() => changeImplementation(fmConfig[implementationKey]))
        .then(zipFiles)
        .then(getSignedUrl)
        .then(() => fs.readFile(zipFilePath))
        .then(uploadFile)
        .then(() => {
          console.log('Done!\n');
          fs.remove(zipFilePath).catch(console.error);
          return fs.readFile(path.resolve(currnetPath, 'package.json'), 'utf8');
        })
        .then((fileContent) => {
          try {
            const packageJson = JSON.parse(fileContent);
            packageJson.version && console.log(`Deployed version: ${packageJson.version}\n`);
          } catch (error) {}
        })
        .catch((err) => {
          console.error('Error\n', err ? err : '');
        });
    }
  });
}

function start() {
  fs.readFile(path.resolve(currnetPath, 'fmConfig.json'), 'utf8')
    .then((fileContent) => {
      let fmConfig = JSON.parse(fileContent);
      let http = require('http');
      let port = args[1] ? args[1] : 3000;
      let data = {
        port,
        name: fmConfig.name,
        type: fmConfig.type,
        widgetType: fmConfig.widgetType,
      };
      let readHtml = fs.readFile(path.resolve(__dirname, 'src', 'index.html'), 'utf8');
      let readCss = fs.readFile(path.resolve(__dirname, 'src', 'styles.css'), 'utf8');
      let readJs = fs.readFile(path.resolve(__dirname, 'src', 'script.js'), 'utf8');
      Promise.all([readHtml, readCss, readJs])
        .then((fileContents) => {
          let html = Mustache.render(fileContents[0], data);
          let css = fileContents[1];
          let js = Mustache.render(fileContents[2], data);
          http
            .createServer((req, res) => {
              switch (req.url) {
                case '/styles.css':
                  res.writeHead(200, { 'Content-Type': 'text/css' });
                  res.write(css);
                  break;
                case '/script.js':
                  res.writeHead(200, { 'Content-Type': 'text/javascript' });
                  res.write(js);
                  break;
                default:
                  res.writeHead(200, { 'Content-Type': 'text/html' });
                  res.write(html);
                  break;
              }
              res.end();
            })
            .listen(8080, () => {
              open('http://localhost:8080');
              console.log(`Server running on port 8080, loading iframe on port ${port}`);
            })
            .on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.log('Port 8080 is already in use');
                return;
              }
              console.warn(err);
            });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => {
      console.log('No existe un proyecto válido en esta ubicación');
    });
}

function setPublicUrl(sandbox) {
  let fmConfig;
  let publicUrl;
  const sourcePath = path.resolve(currnetPath, '.env');
  fs.readJson(path.resolve(currnetPath, 'fmConfig.json'))
    .then((res) => {
      fmConfig = res;
      const guidKey = sandbox ? 'guidSandbox' : 'guid';
      return getGuid(fmConfig, guidKey);
    })
    .then((res) => {
      publicUrl = `/code/${res}`;
      return fs.pathExists(sourcePath);
    })
    .then((exists) => {
      const parsedEnvFile = exists ? envfile.parseFileSync(sourcePath) : {};
      return Promise.resolve(parsedEnvFile);
    })
    .then((parsedEnvFile) => {
      parsedEnvFile.PUBLIC_URL = publicUrl;
      return fs.writeFile(sourcePath, envfile.stringifySync(parsedEnvFile));
    })
    .catch(console.error);
}

function getGuid(fmConfig, guidKey) {
  if (fmConfig[guidKey]) {
    return Promise.resolve(fmConfig[guidKey]);
  } else {
    return inquirer
      .prompt([
        {
          name: 'guid',
          type: 'input',
          message: `Enter the ${guidKey === 'guidSandbox' ? 'sandbox ' : ''}GUID`,
        },
      ])
      .then((answers) => {
        const fmConfigEdit = editJsonFile(path.resolve(currnetPath, 'fmConfig.json'));
        fmConfigEdit.set(guidKey, answers.guid);
        fmConfigEdit.save();
        fmConfig[guidKey] = answers.guid;
        return answers.guid;
      })
      .catch(console.error);
  }
}
