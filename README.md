# Arboris

Hassle-free combination of mobx-state-tree and server-side rendering.

## What it is

This library aims to simplify adding server-side rendering to your React application by using the power of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree).

It works by wrapping all asynchronous actions in tracking function and running your React components through initial rendering phase (prerendering). After the prerendering, Arboris will wait for all Promises to resolve and render your application once again, this time filled with all necessary data in store. Magic!

Arboris does not aim to solve the server-side rendering configuration prerequisites, you still need to figure out how to compile your server and client assets with webpack. [We recommend Razzle for this](https://github.com/jaredpalmer/razzle).

## Installation

run `yarn add arboris` or `npm install arboris`, depending on package manager you use. Easy peasy.

## Usage

See [getting started](https://github.com/d4rky-pl/arboris/wiki/Getting-started) for step-by-step guide into implementing Arboris in your app.

## Powered by Arboris

Arboris is maintained by developers at [Untitled Kingdom](https://untitledkingdom.com). 
Here are some projects, where you can see MST in action:

<a href="https://facets.org/edge" target="_blank"><img src="https://facets.org/edge/public/icon.png" title="Facets Edge"></a>

## Roadmap

See [issues](https://github.com/d4rky-pl/arboris/issues).
Let us know about any issues you encounter and ideas you would like to see in next releases.  