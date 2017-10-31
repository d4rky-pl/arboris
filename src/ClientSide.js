import React from 'react'

export default class ClientSide extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: false }
  }
  
  componentDidMount() {
    this.setState({ visible: true })
  }
  
  render() {
    return this.state.visible ? this.props.children : null
  }
}