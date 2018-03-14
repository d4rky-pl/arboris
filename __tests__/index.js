import index from '../src/index'

describe('index.js', () => {
  it('returns a function', () => {
    expect(index).toBeInstanceOf(Function);
  })
  
  it('returns a function that returns middleware', () => {
    const arboris = index()
    expect(arboris.middleware).toBeInstanceOf(Function)
  })
  
  it('returns a function that retuns a render function', () => {
    const arboris = index()
    expect(arboris.render).toBeInstanceOf(Function)
  })
})