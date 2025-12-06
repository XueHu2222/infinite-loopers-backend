# Installing This TypeScript Application

This is a skeleton app for people who want to use TypeScript in ExpressJS. A docker-compose file is included for those who want to run it in a container.

You don't have to use the docker-compose file if you're fine with installing NodeJS and NPM locally. Feel free to delete it if that's the case.

## Prerequisites
Make sure you have [NodeJS](https://nodejs.org/en/download/) installed (preferably the LTS version). This will also install `npm`. For Windows users you might consider [Chocolaty](https://chocolatey.org) and for Mac users obviously [Brew](https://brew.sh). These are both package managers that will help you install and update all kinds of packages via the CLI. Highly recommended. 

1. Open a terminal window (command prompt, git bash, powershell)
2. Check if NodeJS is installed by typing `node --version` into the terminal. It should print a line with something like `v18.18.0`.
3. Check if NPM is installed by typing  `npm --version` into the terminal. It should print a line with something like `9.8.0`.

## Instructions

1. Clone or download this repository to your computer
2. Open a terminal in the project directory.
3. Install the dependencies by running `npm install`.

## Recommended VS Code Extension
 - To use the provided `.editorconfig` file, install the [EditorConfig](https://editorconfig.org/#download) plugin.
 - To use the provided `.eslintrc.cjs` file, install the [ESLint](https://eslint.org/docs/user-guide/integrations) plugin.

## Using Docker

If you're like me and you dislike NodeJS and NPM piling up heaps of folders on your pc, run TypeScript in Docker!

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Open a terminal window (Powershell on Windows, regular command prompt will not work).
3. Clone this repository.
4. Move to this folder inside the terminal.
5. Run `docker-compose up` and open a new terminal OR run `docker-compose up -d` which allows you to work in the same terminal.
6. Follow the steps from [Instructions](#instructions) from step 4, but prefix all the commands with `docker-compose exec ts-app`.
7. Close the docker container by pressing `ctrl` + `c` or `docker-compose down`, respectively for step 5

## Running the project

In the package.json you can see which commands (in scripts) are used to run or build the server. If you are using docker please keep in mind that you will have to use `docker-compose exec ts-app` to execute the scripts.

- `npm run dev`: in the dev environment we use this command to actually compile the TS code
- `npm run start`: in production we use this command the start a server in production

One note on running the command `npm run start`. We use nodemon to monitor the node server and to restart the server automatically. If we use `node start.js` we have to restart the server ourselves. You could install the nodemon package globally, but in this repo we installed it locally.

## Design choices

### Modules

We use ES6 module system to import and export modules.

### Variables.env

We save credentials to other services in a `variables.env` file. This file is included in this template. However, it is common use not to include it in a public repository. There are some default key value pairs included to demonstrate its working.

### Ports

You can change the ports of your server via `variables.env`

### Run TS directly via Nodemon

We choose to compile TS to JS and run the compiled JS to test it. However it is possible to run typescript in express [Nodemon and TS](https://blog.logrocket.com/configuring-nodemon-with-typescript/)

For setting up the TS we used this [source](https://betterstack.com/community/guides/scaling-nodejs/nodejs-typescript/#step-2-installing-and-configuring-typescript)

### Database connectivity
In this project [Prisma](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) is used for Object Relation Mapping. It comes with all kind of utilities as models, seeds and migration.

If you want to change somte items on the the db for yourself:
1. Update the `scheme.prisma` if necessary
2. Update the `seed.ts` if necessary
3. Throw away the db
4. Run `npx prisma migrate dev`


### SQLite studio
Use [sqlite](https://sqlitestudio.pl) studio to check database changes.