# ng-samurai

> Improve tree shaking of your Angular library

- [ng-samurai](#ng-samurai)
  - [Installation](#installation)
  - [Getting started](#getting-started)
  - [Split](#split)
  - [Generate subentry](#generate-subentry)

Nowadays, thanks to the Angular CLI, libraries are easy to create. They are a great way to share code across multiple applications.
Since they can be used in many places, performance is a critical aspect. A library that doesn’t perform can slow down multiple applications!

> This [blogpost](https://medium.com/angular-in-depth/improve-spa-performance-by-splitting-your-angular-libraries-in-multiple-chunks-8c68103692d0) offers a detailed explenation how wrongly packaged libraries can increase the main bundle size and slow down applications initial load.

Ng-packagr offers a great feature called subentries to improve tree shaking. There are a lot of things to be aware of
when trying to convert your library to take advantage of subentries.

Ng-samurai is an Angular schematic which automatically updates your library to take advantage of subentries and improve
tree shaking. Furthermore it helps you to quickly generate new subentries.

## Installation

```
npm i -D ng-samurai
```

## Getting started

Once ng-samurai is installed we have two different schematics commands available - one for spliting an existing library
into multiple chunks (subentries) and another one for creating a new subentry.

### Split

Spliting your libary automatically into multiple chunks our library project needs to fullfill a couple of cirterias:

- Nesting of modules: Modules used bx other modules can only be siblings and never children. There should always be one
  only one module per subentry.

Go ahead and run the following command in the root of your project:

```
ng g ng-samurai:split-lib
```

This will do the following things:

- Will convert each folder where it encounters a module to a subentry - it will add a (`index.ts`, `public-api.ts`, `package.json`)
- Will export all the necessary Typescript files from the `public-api`. Necessary files are (`components`, `services` or other Typescript files expect `.spec` files)
- Will update the `public-api` in the root level and export all subentries
- Will adjust the paths of your `tsconfig.json` so that your IDEA understands subentris

### Generate subentry

Once your library is converted to subentries, it's likely that you want to add new subentries. To do so, you can run
the following command:

```
ng g ng-samurai:generate-subentry
```

This will do the following things:

- Will create a new folder with the provided name
- Will create a (`module`, `component`, `index.ts`, `public-api.ts`, `package.json`)
- Will export the module and the component from the `public-api.ts`
