import React, { Component } from 'react';

export class Home extends Component {
  static displayName = Home.name;

  constructor(props) {
    super(props);
    this.state = {
      platform: '',
      email: '',
      password: '',
      searchPlatform: '',
      data: [],
      editIndex: -1,
      showPassword: false,
      showPasswords: {} // State to manage visibility of passwords for each item
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    fetch('http://localhost:5000/api/accounts')
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { platform, email, password, editIndex } = this.state;
    const account = { platform, email, password };

    if (editIndex === -1) {
      // Add new entry
      fetch('http://localhost:5000/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      }).then(() => this.fetchData());
    } else {
      // Edit existing entry
      const originalAccount = this.state.data[editIndex];
      fetch(`http://localhost:5000/api/accounts/${originalAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...account, id: originalAccount.id })
      }).then(() => this.fetchData());
    }

    this.setState({ platform: '', email: '', password: '', editIndex: -1 });
  }

  handleClear = () => {
    this.setState({ platform: '', email: '', password: '', editIndex: -1 });
  }

  handleSearch = () => {
    const { searchPlatform, data } = this.state;
    const result = data.find(item => item.platform === searchPlatform);
    if (result) {
      this.setState({ platform: result.platform, email: result.email, password: result.password, editIndex: data.indexOf(result) });
    } else {
      alert('No record found');
    }
  }

  handleDelete = (id) => {
    fetch(`http://localhost:5000/api/accounts/${id}`, {
      method: 'DELETE'
    }).then(() => this.fetchData());
  }

  togglePasswordVisibility = (index) => {
    this.setState(prevState => ({
      showPasswords: {
        ...prevState.showPasswords,
        [index]: !prevState.showPasswords[index]
      }
    }));
  }

  render() {
    const { platform, email, password, searchPlatform, data, showPasswords } = this.state;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>Platform:</label>
            <input type="text" name="platform" value={platform} onChange={this.handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={email} onChange={this.handleChange} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label>Password:</label>
            <input
              type={this.state.showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={this.handleChange}
              required
              style={{ marginRight: '10px' }}
            />
            <button
              type="button"
              onMouseDown={() => this.setState({ showPassword: true })}
              onMouseUp={() => this.setState({ showPassword: false })}
              onMouseLeave={() => this.setState({ showPassword: false })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {this.state.showPassword ? '🙈' : '👁️'}
            </button>
            <button type="submit" style={{ padding: '5px 10px' }}>Save</button>
            <button type="button" onClick={this.handleClear} style={{ padding: '5px 10px' }}>Clear</button>

          </div>
        </form>

        <div>
          <h2>Search</h2>
          <input type="text" name="searchPlatform" value={searchPlatform} onChange={this.handleChange} placeholder="Enter Platform" />
          <button onClick={this.handleSearch}>Search</button>
        </div>

        <h2>Data</h2>
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              {item.platform} - {item.email} - {showPasswords[index] ? item.password : '••••••••'}
              <button onClick={() => this.togglePasswordVisibility(index)}>
                {showPasswords[index] ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => this.setState({ platform: item.platform, email: item.email, password: item.password, editIndex: index })}>Edit</button>
              <button onClick={() => this.handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}