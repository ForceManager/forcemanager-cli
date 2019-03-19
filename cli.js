#!/usr/bin/env node
const [, , ...args] = process.argv;
const currnetPath = process.cwd();
const inquirer = require('inquirer');
const fs = require('fs-extra');
const readdirp = require('readdirp');
const Mustache = require('mustache');

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
    if (!fs.existsSync(`${currnetPath}/${name}`)) {
      getDetails(false);
    } else if (fs.existsSync(`${currnetPath}/${name}/fmConfig.json`)) {
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
          settings.root = `${__dirname}/templates/${fmConfigData.type}`;
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
      fs.mkdirp(`${currnetPath}/${fmConfigData.name}`)
        .then(() => {
          for (const file of allFiles) {
            if (fs.lstatSync(file.fullPath).isDirectory()) {
              fs.mkdirp(`${currnetPath}/${fmConfigData.name}/${file.path}`, (err) => {
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
                `${currnetPath}/${fmConfigData.name}/${file.path.replace('.mustache', '')}`,
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
  console.log('This option is not ready yet');
} else if (args[0] === 'start') {
  fs.readFile(`${currnetPath}/fmConfig.json`, 'utf8', (error, fileContent) => {
    if (error) {
      console.log('No existe un proyecto válido en esta ubicación');
    } else {
      let fmConfig = JSON.parse(fileContent);
      let http = require('http');
      let filePath = `${__dirname}/src/index.html`;
      let port = args[1] ? args[1] : 3000;
      let data = {
        port,
        name: fmConfig.name,
        type: fmConfig.type,
        widgetType: fmConfig.widgetType,
      };
      getToken()
        .then((res) => {
          data.devToken = res;
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
        })
        .catch((err) => console.error(err));
    }
  });
  function getToken() {
    return new Promise((resolve, reject) => {
      let envFilepath = `${__dirname}/.env`;
      fs.readFile(envFilepath, 'utf8', (error, fileContent) => {
        if (error && error.code === 'ENOENT') {
          inquirer
            .prompt([
              {
                name: 'dev_token',
                type: 'input',
                message: 'No Development Token configured. Please enter your Development Token:',
              },
            ])
            .then((answers) => {
              let envFilepath = `${__dirname}/.env`;
              let envFileContent = `DEV_TOKEN=${answers.dev_token}`;
              fs.writeFile(envFilepath, envFileContent);
              resolve(answers.dev_token);
            })
            .catch((err) => reject(err));
        } else if (error) {
          reject(error);
        } else {
          resolve(fileContent.match(/^DEV_TOKEN=(\d*)$/)[1]);
        }
      });
    });
  }
}
