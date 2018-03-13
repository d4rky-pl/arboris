const track = (model, config) => {
  return model.volatile(() => ({
    $arboris: config
  }))
}

track.async = (opts = {}) => Object.assign({}, { type: "async" }, opts)

export default track
