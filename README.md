# Arboris

Hassle-free combination of mobx-state-tree and server-side rendering.

## What it is

This library aims to simplify adding server-side rendering to your React application by using the power of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree).

It works by wrapping all asynchronous actions in tracking function and running your React components through initial rendering phase (prerendering). After the prerendering, Arboris will wait for all Promises to resolve and render your application once again, this time filled with all necessary data in store. Magic!

Arboris does not aim to solve the server-side rendering configuration prerequisites, you still need to figure out how to compile your server and client assets with webpack. [We recommend Razzle for this](https://github.com/jaredpalmer/razzle).

## Usage

- You must use mobx-state-tree and flow() for all asynchronous operations, if any operation is not wrapped inflow(), it will run but the result will be ignored
- You must pass your API client via MST environments; you must also create a new instance of Store per request (if you try using a global, it will leak data between requests)
- Your API client must be able to authenticate using data that came from cookies; if you're connecting to OAuth API you need to keep `access_token` (and `refresh_token` if needed) in cookies so they're sent to the server with the request
- Don't forget about [useStaticRendering from mobx-react](https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering) to avoid memory leaks
- If you're using [react-helmet](https://github.com/nfl/react-helmet), remember about [renderStatic](https://github.com/nfl/react-helmet#server-usage)

### Server.js example code

```javascript
import Arboris from "arboris"

import App from "./app"
import React from "react"
import { StaticRouter } from "react-router-dom"
import express from "express"
import expressStaticGzip from "express-static-gzip"
import Rollbar from "rollbar"
import cookieParser from "cookie-parser"
import template from "lodash/template"
import { Provider, useStaticRendering } from "mobx-react"
import { addMiddleware, getSnapshot } from "mobx-state-tree"
import Helmet from "react-helmet"
// eslint-disable-next-line
import indexFile from "!!raw-loader!./index.html"

import AppStore from "stores/app_store"

import Api from "./utils/api"
const apiUrl = process.env.API_URL

useStaticRendering(true)

const environment = process.env.NODE_ENV || "development"
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)
const renderTemplate = template(indexFile)
const server = express()

server
  .disable("x-powered-by")
  .use(
    expressStaticGzip(process.env.RAZZLE_PUBLIC_DIR, {
      indexFromEmptyFile: false
    })
  )
  .use(cookieParser())
  .use(rollbar.errorHandler())
  .get("/*", async (req, res) => {
    // Initialize Arboris per request
    const arboris = Arboris()

    // Always pass your access and refresh token via cookies to make sure
    // they are available to server without any special preparation.
    const { access_token, refresh_token } = req.cookies

    // You should use MST environments to pass your API client,
    // if you use some kind of global, it will leak between requests!
    const apiClient = new Api({ access_token, refresh_token, apiUrl })

    // Attach Arboris middleware to your store
    const store = AppStore.create({}, { track, apiClient })
    addMiddleware(store, arboris.middleware)

    const context = {}

    // Render is asynchronous as it waits for promises to resolve
    const markup = await arboris.render(
      <Provider store={store}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </Provider>
    )

    const helmet = Helmet.renderStatic()

    // Create a snapshot to make sure you're not double-running network 
    // requests for the data you could already have in store
    const snapshot = getSnapshot(store)

    if (context.url) {
      res.redirect(context.url)
    } else {
      // When rendering a template, remember to set your snapshot to a global
      // variable like window.INITIAL_STATE. Then pick it up on client-side 
      // when initializing your store.
      // (example: AppStore.create(window.INITIAL_STATE))

      res
        .status(200)
        .send(
          renderTemplate({ assets, environment, markup, helmet, snapshot })
        )
    }
  })

export default server
```

### Store example

```javascript
const SessionStore = types
  .model("SessionStore", {
    ready: types.optional(types.boolean, false)
  })
  .actions(self => {
    return {
      // Remember to use flow() for asynchronous actions!
      signIn: flow(function* signIn(email, password) {
        yield apiClient.requestOauthToken(email, password)
      })
    }
  })
```

## Usage without MST

Even though `mobx-state-tree` is highly recommended you can use manual tracking with `arboris.track(fn)`. It requires `fn` to return a `Promise`.

## TODO

- Better documentation
- Should we pursue more integrations than MST?
