#!/usr/bin/env node
const [, , ...args] = process.argv;
const currnetPath = process.cwd();
const inquirer = require('inquirer');
const fs = require('fs-extra');
const readdirp = require('readdirp');
const Mustache = require('mustache');

console.log('\x1b[33m', ' _____                  __  __                                            _ _\n |  ___|__  _ __ ___ ___|  \\/  | __ _ _ __   __ _  __ _  ___ _ __      ___| (_)\n | |_ / _ \\| \'__/ __/ _ \\ |\\/| |/ _` | \'_ \\ / _` |/ _` |/ _ \\ \'__|___ / __| | |\n |  _| (_) | | | (_|  __/ |  | | (_| | | | | (_| | (_| |  __/ | |____| (__| | |\n |_|  \\___/|_|  \\___\\___|_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|       \\___|_|_|\n                                                  |___/');
console.log('\x1b[37m', '');

if (args[0] == 'create') {
    let fmConfigData;

    // readdirp settings
    let settings = {
        root: '',
        entryType: 'all',
    };
    let allFiles = [];

    inquirer.prompt([
        {
            name: 'type',
            type: 'list',
            message: 'Type',
            choices: ['Widget', 'Form', 'Page'],
            default: 0,
        }, {
            name: 'widget_type',
            type: 'list',
            message: 'Widget type',
            choices: ['Entity widget', 'SFM widget'],
            default: 0,
            when: function (answers) { return answers.type === 'Widget'; },
        }, {
            name: 'widget_subtype',
            type: 'list',
            message: 'Widget subtype',
            choices: ['Oportunities', 'Companies'],
            default: 1,
            when: function (answers) { return answers.widget_type === 'Entity widget'; },
        }, {
            name: 'platforms',
            type: 'checkbox',
            message: 'Platforms',
            choices: ['Web', 'iOS', 'Android'],
            default: 1,
            when: function (answers) { return answers.type === 'Page'; },
        }, {
            name: 'title',
            type: 'input',
            message: function (answers) { return answers.type + ' title'; },
        }, {
            name: 'name',
            type: 'input',
            message: function (answers) { return answers.type + ' name'; },
            default: function (answers) { return answers.title.toLowerCase().replace(/[^A-Z0-9]+/ig, '-'); },
        }, {
            name: 'width',
            type: 'list',
            message: 'Width',
            choices: ['1', '1/2', '1/3'],
            default: 0,
            when: function (answers) { return answers.type === 'Widget'; },
        }, {
            name: 'rows',
            type: 'list',
            message: 'Rows',
            choices: ['1', '2'],
            default: 0,
            when: function (answers) { return answers.type === 'Widget'; },
        }, {
            name: 'dev_token',
            type: 'input',
            message: 'Token de desarrollo',
            default: '1234567890',
        }
    ])
    .then(answers => {
        let postData;
        let html = fs.readFileSync(`${__dirname}/templates/hello.html`, 'utf8');
        fmConfigData = {
            title: answers.title,
            name: answers.name,
            type: answers.type.toLowerCase(),
            widget_type: function () {
                switch (answers.widget_type) {
                    case 'Entity widget':
                        return 'entity';
                    case 'SFM widget':
                        return 'sfm';
                };
            },
            web: answers.platforms ? answers.platforms.includes('Web') : null,
            ios: answers.platforms ? answers.platforms.includes('iOS') : null,
            android: answers.platforms ? answers.platforms.includes('Android') : null,
            widget_subtype: function () {
                switch (answers.widget_subtype) {
                    case 'Oportunities':
                        return 1;
                    case 'Companies':
                        return 2;
                }
            },
            language: answers.language,
            columns: function () {
                switch (answers.widget_type) {
                    case 'Entity widget':
                        switch (answers.width) {
                            case '1/2':
                                return 2;
                            case '1/3':
                                return 1;
                            case '1':
                            default:
                                return 3;
                        }
                    case 'SFM widget':
                        switch (answers.width) {
                            case '1/2':
                                return 6;
                            case '1/3':
                                return 4;
                            case '1':
                            default:
                                return 12;
                        }
                }
            },
            rows: parseInt(answers.rows),
        };
        switch (fmConfigData.type) {
            case 'widget':
                postData = {
                    "type": fmConfigData.type,
                    "title": fmConfigData.title,
                    "description": fmConfigData.name,
                    "widgetType": fmConfigData.widgetType,
                    "widgetSubtype": fmConfigData.widgetSubtype,
                    "columns": fmConfigData.columns,
                    "rows": fmConfigData.rows,
                    "order": fmConfigData.order,
                    "content": html,
                };
                break;
            case 'page':
                postData = {
                    "type": fmConfigData.type,
                    "title": fmConfigData.title,
                    "description": fmConfigData.name,
                    "order": fmConfigData.order,
                    "content": html,
                };
                break;
            case 'form':
                postData = {
                    "type": fmConfigData.type,
                    "title": fmConfigData.title,
                    "description": fmConfigData.name,
                    "content": html,
                };
                break;
        }
        // return axiosFm.post(`${ENDPOINT}`, postData);
        return Promise.resolve({ data: { id: 100 } }); //TEMP
    })
    .then(res => {
        fmConfigData.id = res.data.id;
        console.log(`Project created in DB`);
        settings.root = `${__dirname}/templates/${fmConfigData.type}`;

        readdirp(settings)
            .on('data', file => {
                allFiles.push(file);
            })
            .on('warn', warn => {
                console.warn('Warn: ', warn);
            })
            .on('error', err => {
                console.error('error: ', err);
            })
            .on('end', () => {
                if (fs.existsSync(`${currnetPath}/${fmConfigData.name}/fmConfig.json`)) {
                    console.log('Exist as ForceManager project');
                    inquirer.prompt([
                        {
                            name: 'convert',
                            type: 'list',
                            message: `The project ${fmConfigData.name} alredy exists. Do you want to convert this project to a ForceManager Custom Development?`,
                            choices: ['No', 'Yes'],
                            default: 0,
                        }
                    ])
                    .then(answers => {
                        if (answers.convert === 'Yes') {
                            console.log('convert');
                        }
                    });
                } else if (fs.existsSync(`${currnetPath}/${fmConfigData.name}`)) {
                    console.log(`The project ${fmConfigData.name} alredy exists as a ForceManager Custom Development. Please start again the create process and choose another project name.`);
                } else {
                    let envFilepath = `${currnetPath}/${fmConfigData.name}/.env`;
                    let envFileContent = `DEV_TOKEN=${fmConfigData.dev_token}`;
                    fs.mkdirp(`${currnetPath}/${fmConfigData.name}`)
                    .then(() => fs.writeFile(envFilepath, envFileContent))
                    .then(() => {
                        for (const file of allFiles) {
                            if (fs.lstatSync(file.fullPath).isDirectory()) {
                                fs.mkdirp(`${currnetPath}/${fmConfigData.name}/${file.path}`, err => {
                                    if (err) { console.error(err); }
                                });
                                continue;
                            }
                            fs.readFile(file.fullPath, 'utf8', (error, fileContent) => {
                                if (error) { throw error; }
                                let outputfileContent = fileContent;
                                if (file.name.split('.').pop() === 'mustache') {
                                    outputfileContent = Mustache.render(fileContent, fmConfigData);
                                }
                                fs.writeFile(`${currnetPath}/${fmConfigData.name}/${file.path.replace('.mustache', '')}`, outputfileContent, err => {
                                    if (err) { return console.error(err); }
                                });
                            });
                        }
                        console.log('Done!');
                    })
                    .catch(err => console.error(err));
                }
            });
    })
    .catch(err => console.error(err));
} else if (args[0] === 'deploy') {
    console.log('This option is not ready yet')
}
else if (args[0] === 'start') {
    fs.readFile(`${currnetPath}/fmConfig.json`, 'utf8', (error, fileContent) => {
        if (error) {
            console.log('No existe un proyecto válido en esta ubicación');
        } else {
            let fmConfig = JSON.parse(fileContent);
            var http = require('http');
            var filePath = `${__dirname}/src/index.html`;
            var port = args[1] ? args[1] : 3000;
            var data = {
                port,
                type: fmConfig.type,
                widgetType: fmConfig.widgetType,
                entityId: fmConfig.widgetSubtype,
                entity: fmConfig.widgetSubtype == 2 ? 'Company' : 'Oportunity',
                id: fmConfig.id,
                title: fmConfig.title,
                columns: fmConfig.columns,
            };
            fs.readFile(filePath, 'utf8', (error, fileContent) => {
                if (error) { throw error; }
                var html = Mustache.render(fileContent, data);
                http.createServer((req, res) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(html);
                    res.end();
                }).listen(8080, () => {
                    console.log(`Server running on port 8080, loading iframe on port ${port}`)
                }).on('error', err => {
                    if (err.code ===  'EADDRINUSE') {
                        console.log('Port 8080 is already in use');
                        return;
                    }
                    console.warn(err);
                });
            });
        }
    });
}