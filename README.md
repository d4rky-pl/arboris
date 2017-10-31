# Arboris

Hassle-free combination of mobx-state-tree and server-side rendering.

## What it is

This library aims to simplify adding server-side rendering to your React application by using the power of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree).

It works by wrapping all asynchronous actions in tracking function and running your React components through initial rendering phase (prerendering). After the prerendering, Arboris will wait for all Promises to resolve and render your application once again, this time filled with all necessary data in store. Magic!

Arboris does not aim to solve the server-side rendering configuration prerequisites, you still need to figure out how to compile your server and client assets with webpack. [We recommend Razzle for this](https://github.com/jaredpalmer/razzle).

## Usage

- You must use mobx-state-tree and flow() for all asynchronous operations, if any operation is not wrapped in request-bound flow(), it will leak or it will normally finish running but the result will be ignored
- You must pass your API client via MST environments; you must also create a new instance of Store per request (if you try using a global, it will leak data between requests)
- Your API client must be able to authenticate using data that came from cookies; if you're connecting to OAuth API you need to keep `access_token` (and `refresh_token` if needed) in cookies so they're sent to the server with the request
- Don't forget about [useStaticRendering from mobx-react](https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering) to avoid memory leaks
- If you're using [react-helmet](https://github.com/nfl/react-helmet), remember about [renderStatic](https://github.com/nfl/react-helmet#server-usage)

### Server.js example code

```javascript
import { awaitOnServer } from "arboris"

import App from "./app"
import React from "react"
import { StaticRouter } from "react-router-dom"
import express from "express"
import expressStaticGzip from "express-static-gzip"
import Rollbar from "rollbar"
import cookieParser from "cookie-parser"
import template from "lodash/template"
import { Provider, useStaticRendering } from "mobx-react"
import { getSnapshot } from "mobx-state-tree"
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

    // This is where magic happens:
    awaitOnServer(async ({ track, render }) => {
      const { access_token, refresh_token } = req.cookies

      // You should use MST environments to pass your API client,
      // if you use some kind of global, it will leak between requests!
      const apiClient = new Api({ access_token, refresh_token, apiUrl })

      // Pass the track() function to your store, you will use it later
      const store = AppStore.create({}, { track, apiClient })

      const context = {}

      // Render is asynchronous as it waits for promises to resolve
      const markup = await render(
        <Provider store={store}>
          <StaticRouter context={context} location={req.url}>
            <App />
          </StaticRouter>
        </Provider>
      )

      const helmet = Helmet.renderStatic()
      const snapshot = getSnapshot(store)

      if (context.url) {
        res.redirect(context.url)
      } else {
        res
          .status(200)
          .send(
            renderTemplate({ assets, environment, markup, helmet, snapshot })
          )
      }
    })
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
    const { apiClient } = getEnv(self)
    const flow = getTrackedFlow(self)

    return {
      // This is where the magic happens (again):
      // We use flow() from MST for asynchronous actions but it's additionally
      // wrapped in the track() function.
      // `getTrackedFlow` is syntactic sugar for getEnv(self).track(flow(fn))
      // Promises are not tracked in browser (track returns passed function)
      signIn: flow(function* signIn(email, password) {
        yield apiClient.requestOauthToken(email, password)
      })
    }
  })
```