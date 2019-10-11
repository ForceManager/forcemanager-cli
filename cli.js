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
const open = require('open');
const mime = require('mime-types');
const axios = require('axios');
const archiver = require('archiver');

// require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(
  '\x1b[33m',
  " _____                  __  __                                            _ _\n |  ___|__  _ __ ___ ___|  \\/  | __ _ _ __   __ _  __ _  ___ _ __      ___| (_)\n | |_ / _ \\| '__/ __/ _ \\ |\\/| |/ _` | '_ \\ / _` |/ _` |/ _ \\ '__|___ / __| | |\n |  _| (_) | | | (_|  __/ |  | | (_| | | | | (_| | (_| |  __/ | |____| (__| | |\n |_|  \\___/|_|  \\___\\___|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|       \\___|_|_|\n                                                  |___/",
);
console.log('\x1b[37m', '');

if (args[0] == 'create') {
  create();
} else if (args[0] === 'deploy') {
  deploy();
} else if (args[0] === 'start') {
  start();
}

function slugify(str) {
  var map = {
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

  for (var pattern in map) {
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
            widget_type: function() {
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
          settings.root = path.resolve(__dirname, 'template', fmConfigData.type);
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
}

function deploy() {
  fs.readFile(path.resolve(currnetPath, 'fmConfig.json'), 'utf8', (error, fileContent) => {
    if (error) {
      console.log('No existe un proyecto válido en esta ubicación');
    } else {
      let fmConfig = JSON.parse(fileContent);
      let cfm_user = process.env.CFM_USER;
      let cfm_token = process.env.CFM_TOKEN;
      const zipFilePath = `${__dirname}/file.zip`;
      let signedUrl;

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

      checkToken = () => {
        if (cfm_token) {
          return Promise.resolve();
        } else {
          return login()
            .then((res) => fs.writeFile(res.envFilepath, res.envFileContent))
            .catch((err) => console.error('checkToken error'));
        }
      };

      login = () => {
        return inquirer
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
              url: 'https://be-cfmsta.forcemanager.net/api/authenticate/v1/login',
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
            console.log('token', res);
            cfm_token = res.data.token;
            let envFilepath = path.resolve(__dirname, '.env');
            let envFileContent = `USER=${cfm_user}\nCFM_TOKEN=${cfm_token}`;
            return fs.writeFile(envFilepath, envFileContent);
          })
          .catch((err) => {
            if (err.response && err.response.status === 400) {
              console.log('Wrong user or password');
              return login();
            } else if (err.response && err.response.status === 401) {
              console.log('Expired token');
              cfm_token = undefined;
              return login();
            } else {
              console.error(err);
            }
          });
      };

      getSignedUrl = () => {
        return new Promise((resolve, reject) => {
          axios({
            method: 'get',
            url: `https://be-cfmsta.forcemanager.net/api/fragments/v1/${fmConfig.guid}/upload`,
            headers: { Authorization: `Bearer ${cfm_token}` },
            contentType: 'application/json',
            accept: '*/*',
          })
            .then((res) => {
              signedUrl = res.data.url;
              resolve();
            })
            .catch((err) => reject(err));
        });
      };

      zipFiles = () => {
        return new Promise((resolve, reject) => {
          const distFolderPath = path.join(currnetPath, fmConfig.distFolder);
          let settings = {
            root: distFolderPath,
            entryType: 'all',
          };
          let allFiles = [];
          let output = fs.createWriteStream(zipFilePath);
          let archive = archiver('zip', {
            zlib: { level: 9 },
          });

          output.on('close', function() {
            console.log('Zip file successfully created. Size: ' + archive.pointer() + ' bytes.');
          });

          output.on('end', function() {
            console.log('Data has been drained');
          });

          archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
              console.warn(err);
            } else {
              throw err;
            }
          });

          archive.on('error', function(err) {
            throw err;
          });

          archive.pipe(output);

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
                  archive.directory('subdir/', file.fullPath);
                  continue;
                }
                promises.push(
                  fs
                    .readFile(file.fullPath)
                    .then((fileContent) => archive.append(fileContent, { name: file.path }))
                    .catch((err) => reject(err)),
                );
              }
              Promise.all(promises)
                .then(() => archive.finalize())
                .then(() => resolve())
                .catch((err) => reject(err));
            });
        });
      };

      uploadFile = (zipFileContent) => {
        console.log('Uploading...');
        const options = {
          headers: {
            'Content-Type': 'application/zip',
          },
        };
        return axios.put(signedUrl, zipFileContent, options);
      };

      checkGuid()
        .then(() => checkToken())
        .then(() => zipFiles())
        .then(() => getSignedUrl())
        .then(() => fs.readFile(zipFilePath))
        .then((res) => uploadFile(res))
        .then(() => fs.remove(zipFilePath))
        .then(() => console.log('Done!'))
        .catch((err) => {
          console.error(err);
          return fs.remove(zipFilePath);
        })
        .catch((err) => console.error(err));
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
