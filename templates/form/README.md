## Full From creation process

### 1) Create new form

- Go to [ForceManager Setup Forms](https://setup.forcemanager.net/#/app/forms) and 'Create Generic Form'.
- Set the Description and select if you want to host the form in the default ForceManager Server or you want to put the URL or your own Server.

### 2) Configure permissions

- Go to [Old ForceManager Setup](https://cfm.forcemanager.net/web/views/specific/permissions.aspx) section Permissions and create a new Role 'Forms'.
- Select the permissions that you want from 'ForceManager Forms'.
- Assagn this role to all users you want to be able to see forms tab in mobile Apps.

### 3) Install ForceManager CLI

```
yarn add global forcemanager-cli
```

### 4) Create new project

- Go to the folder where you want to create the project.

- `fm-cli create <new-project-name>`

- Select Tyoe: Form. A empty project will be created in the specified <new-project-name> directory.

- `cd <new-project-name>`

- `yarn istall` or `npm istall`

### 5) Start Dev mode

```
yarn start
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

```
fm-cli start
```

Runs the development enviroment with the context and BrigeBackend listening for Bridge calls.

### 7) Get development API keys

- Go to 'Manage Keys' section of the new [ForceManager Setup](https://setup.forcemanager.net/#/app/apikeys).
- Select 'Thirt party integraions' tab and click to 'Create API keys'.
- Set Name and Description to 'Forms' and select 'external_basic' for the plan.

### 6) Configure Dev mode

- Click on the gear icon on the top right corner to see the config panel.
- Set de Entitiy ID with the ID of the account you want to use.
- Go to Login tab and set the Public and Private Keys you generated previously.

### 7) Code

Forms are React projects structured to modyfy just some files.

#### config.json

JOSN file to define the structure of the Froms, pages, fields, origin of the lists data, validations, requireds, etc.

#### defaultValues.js

This file is have a getDefaultValues function that is called at the begining and sets the initial values of the fields. Recives the entire state of App.js and the selected form and return a new state whith the initial values.

#### customActions.js

#### customValidations.js

In this file you can define any custom validation you want to define for a field creating a function and settinf the name of this function in the validation attribute of the file in the config.json file.

### 8) Build

```
yarn build
```

Builds the app for production to the `build` folder.
PUBLIC_URL constant is defined in .env file.

### 9) Deploy

#### Via CLI (Not working yet)

```
fm-cli deploy
```

To deploy the code to the standar ForceManager server form fragments https://fmfragments.s3.amazonaws.com/fmfragments/code/{GUID}
Not working yet.

### Manually

Copy files to any Server/FTP you can access with https.
In this case you should set Custom URL in Form config in [ForceManager Setup](https://setup.forcemanager.net/#/app/forms).

[Formms docuemntation](/templates/forms/README.md)
