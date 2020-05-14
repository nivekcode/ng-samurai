![Logo](https://raw.githubusercontent.com/kreuzerk/ng-samurai/master/docs/logo/ng-samurai.png)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Installation](#installation)
- [Getting started](#getting-started)
  - [Split](#split)
    - [Prerequisit for a successfull split](#prerequisit-for-a-successfull-split)
      - [Folder structure](#folder-structure)
      - [Circular dependencies](#circular-dependencies)
      - [Each file needs to belong to a module](#each-file-needs-to-belong-to-a-module)
  - [Generate subentry](#generate-subentry)
- [Further resources](#further-resources)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

> Improve tree shaking of your Angular library - more details on this [blog post](https://medium.com/@kevinkreuzer/ng-samurai-schematics-to-improve-tree-shaking-of-angular-libraries-83656ca22d9e)

# Overview

Nowadays, thanks to the Angular CLI, libraries are easy to create. They are a great way to share code across multiple applications.
Since they can be used in many places, performance is a critical aspect. A library that doesn’t perform can slow down multiple applications!

> This [blogpost](https://medium.com/angular-in-depth/improve-spa-performance-by-splitting-your-angular-libraries-in-multiple-chunks-8c68103692d0) offers a detailed explenation how wrongly packaged libraries can increase the main bundle size and slow down applications initial load.

Ng-packagr offers a great feature called subentries to improve tree shaking. There are a lot of things to be aware of
when trying to convert your library to take advantage of subentries.

Ng-samurai is an Angular schematic which automatically updates your library to take advantage of subentries and improve
tree shaking. Furthermore, it helps you to quickly generate new subentries.

# Installation

```
npm i -D ng-samurai
```

# Getting started

Once ng-samurai is installed we have two different schematics commands available - one for spliting an existing library
into multiple chunks (subentries) and another one for creating a new subentry.

#Available schematics
`ng-samurai` provides two schematics: `split-lib` and `generate-subentries`

## Split

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

### Prerequisit for a successfull split

For ng-samurai to function appropriately, there are certain requirements your library needs to fulfill. In some cases, you might need to refactor your application before using `ng-samurai`.

#### Folder structure

Converting your library to subentries may also require a change of the folder structure. Each module will result in a subentry and needs its folder. Subentries can not have multiple modules.

_Valid file structure_
![Logo](https://raw.githubusercontent.com/kreuzerk/ng-samurai/master/docs/prerequisite/file-structure-valid.png)

_Invalid file structure_
![Logo](https://raw.githubusercontent.com/kreuzerk/ng-samurai/master/docs/prerequisite/file-structure-invalid.png)

#### Circular dependencies

A subentry can use another subentry. But subentries can not work with circular dependencies.
![Logo](https://raw.githubusercontent.com/kreuzerk/ng-samurai/master/docs/prerequisite/circular-dependencies.png)

#### Each file needs to belong to a module

Entry points can contain all sorts of files. ng-samurai needs a module-file to be present to perform the migration. The .module file indicates to ng-samurai that this code will be split into a subentry.
![Logo](https://raw.githubusercontent.com/kreuzerk/ng-samurai/master/docs/prerequisite/module-required.png)

## Generate subentry

Once your library is converted to subentries, it's likely that you want to add new subentries. To do so, you can run
the following command:

```
ng g ng-samurai:generate-subentry
```

This will do the following things:

- Will create a new folder with the provided name
- Will create a (`module`, `component`, `index.ts`, `public-api.ts`, `package.json`)
- Will export the module and the component from the `public-api.ts`

# Further resources

If the topic of subentries is new to you. The following resources explain subentries in
more detail.

- [ng-packagr subentry documentation](https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md)
- [Blog on Angular in depth: Improve SPA performance by splliting your library in multiple chunks](https://medium.com/angular-in-depth/improve-spa-performance-by-splitting-your-angular-libraries-in-multiple-chunks-8c68103692d0)
