# ForceManager CLI

Development tool to create ForceManager Fragments.

Fragments are isolated parts of code embeded in ForceManager divided in 3 types: Widgets, Forms and Pages.

## ⭐️ Features

-   Create new Fragments.
-   Start Fragments in development mode.
-   Deploy fragments to sandbox enviroment.

## 📦 Installation

```
// with npm
npm install -g forcemanager-cli

// with yarn
yarn add global forcemanager-cli
```

## ⚙️ Usage

### Create Fragment

You can create new project o convert existing ones.

* Go to the folder where you want to create the project.

* `fm-cli create <project-name>`

* Follow the create assistant steps

* If the directory <project-name> exist but is not a ForceManager project you can convert the existing project in a Fragment.

* If the doesn't exist, a 'Hello World' project will be created in the specified <project-name> directory.

* `cd <project-name>`

* `yarn istall` or `npm istall`


### Start a dev server

To start a server with an iframe where your Fragment is going to be embeded.
The default port of localhost that is going to be loaded inside the iframe is 3000. You can change this port specifying a different number.

* Run your project in any port of localhost.

* Go to the folder of the project you want to load.

* `fm-cli start` or `fm-cli start 4000`

* Configure Options and set Private and Public Key to login.


### Deploy Fragment

Deploy the code of a Fragment to AWS.

* Go to the folder of the project you want to deploy.

* `fm-cli deploy`

* Set GUID if is not alredy set.


## 🙌 Contributing

To learn how to setup a development environment and for contribution guidelines, see [CONTRIBUTING.md](/CONTRIBUTING.md).

## 📜 Changelog

We use [GitHub releases](https://github.com/ForceManager/forcemanager-cli/releases).

## 📄 License

This project is licensed under the terms of the
[MIT license](/LICENSE).