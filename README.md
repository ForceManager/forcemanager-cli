# ForceManager CLI

Development tool to create ForceManager Fragments.

Fragments are isolated parts of code enbeded in ForceManager divided in 3 types: Widgets, Forms and Pages.

## ⭐️ Features

-   Create new Fragments.
-   Start Fragments in development mode.
-   Deploy fragments to sandbox enviroment.

## 📦 Installation

```
// with npm
npm install -g forcemanager-cli

// with yarn
yarn install -g forcemanager-cli
```

## ⚙️ Usage

### Create Fragment

You can create new project o covert existing ones.

* Go to the folder where you want to create the project.

* `fm-cli create`.

* Choose a project name.

* If the project exist but is not a ForceManager project you can convert the existing project in a Fragment.

* Follow the next steps


### Start a dev server

To start a server with an iframe where your Fragment is going to be embeded.
The default port of localhost that is going to be loaded inside the iframe is 3000. You can change this port specifying a different number.

* Run your project in any port of localhost.

* Go to the folder of the project you want to load.

* `fm-cli start` or `fm-cli start 4000`

* Configure the URL Base of the ForceManager API you want to use, the development Token and the other options.


### Deploy Fragment

Deploy a new Fragment to sandbox or update an existing one.

* Go to the folder of the project you want to deploy.

* `fm-cli deploy`


## 🙌 Contributing

To learn how to setup a development environment and for contribution guidelines, see [CONTRIBUTING.md](/CONTRIBUTING.md).

## 📜 Changelog

We use [GitHub releases](https://github.com/ForceManager/forcemanager-cli/releases).

## 📄 License

This project is licensed under the terms of the
[MIT license](/LICENSE).