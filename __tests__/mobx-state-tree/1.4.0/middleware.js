import sinon from "sinon"
import createMiddleware from "../../../src/middleware"
import track from "../../../src/track"
import { addMiddleware, flow, types } from "./node_modules/mobx-state-tree"

const trueFn = () => true

let sandbox = sinon.createSandbox()

describe("middleware.js", () => {
  afterEach(() => sandbox.restore())

  describe("on MST 1.4.0", () => {
    describe("when renderLimit is reached", () => {
      it("fails using MST `abort` function", async () => {
        const delay = sandbox.stub().resolves(true)
        const Store = track(
          types.model("Store").actions(() => ({
            exampleFlow: flow(function*() {
              yield delay()
              return 2
            })
          })),
          { exampleFlow: track.async() }
        )

        const store = Store.create()

        const tracker = {
          add: sandbox.spy(),
          has: trueFn,
          remove: sandbox.spy(),
          renderLimitReached: trueFn
        }

        const middleware = createMiddleware(tracker, console)

        addMiddleware(store, middleware)

        const foo = await store.exampleFlow()
        expect(foo).toBe(null)
      })
    })
  })
})
