# ForceManager CLI

A development tool to create ForceManager Fragments.

Fragments are isolated parts of code embedded in ForceManager divided into 3 types: Widgets, Forms, and Pages.

## ⭐️ Features

- Create new Fragments.
- Start Fragments in development mode.
- Deploy fragments to sandbox enviroment.

## 📦 Installation

With yarn (recommended):

```
yarn global add forcemanager-cli
```

With npm:

```
npm install -g forcemanager-cli

```

## ⚙️ Usage

### Create Fragment

You can create new project o convert existing ones.

#### 1) Create new project

- Go to the folder where you want to create the project.

- `fm create <new-project-name>`

- Follow the create assistant steps. A'Hello World' project will be created in the specified <new-project-name> directory.

- `cd <new-project-name>`

- `yarn` or `npm install`

#### 2) Convert existing project

- Go to the folder where you have the project.

- `fm create <existing-directory-project-name>`

- Follow the create assistant steps

### Start a dev environment

Opens a web page with an iframe where your Fragment is going to be embedded.

- `yarn start` or `npm start`

- Configure Options and login with ForceManager Setup credentials.

### Deploy Fragment

Deploy the code of a Fragment

- Go to the folder of the project you want to deploy.

- `yarn deploy` or `npm run deploy`

- Set GUID or other parameters if are not alredy set.

## Widgets

[Documentation](https://github.com/ForceManager/fm-widget-template/blob/master/widgets.md)

## Forms

[Documentation](https://github.com/ForceManager/fm-form-template/blob/master/forms.md)

## 🙌 Contributing

To learn how to setup a development environment and for contribution guidelines, see [CONTRIBUTING.md](/CONTRIBUTING.md).

## 📜 Changelog

We use [GitHub releases](https://github.com/ForceManager/forcemanager-cli/releases).

## 📄 License

This project is licensed under the terms of the
[MIT license](/LICENSE).
