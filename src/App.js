import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const apiServer = 'http://localhost:3030';
const apiEndpoints = {
  transactions: `${apiServer}/transactions`,
  labels: `${apiServer}/labels`
};

const fetchJson = async (fetchUrl) => {
  const response = await fetch(fetchUrl);
  const jsonResponse = response.json();
  return jsonResponse;
};

class App extends Component {
  state = {};

  getLabelsAndTransactions = async () => {
    const [labels, transactions] = await Promise.all([
      fetchJson(apiEndpoints.labels),
      fetchJson(apiEndpoints.transactions)
    ]);
    console.log('labels from server:', labels);
    console.log('transactions from server:', transactions);

    return { labels, transactions };
  }

  async componentWillMount() {
    const { labels, transactions } = await this.getLabelsAndTransactions();
    this.setState({ labels, transactions });
  }

  render() {
    const { transactions } = this.state;

    return (
      transactions ?
        <div className="App">
          <header className="App-header">
            Bean Counter
          </header>
          
          <table className="transaction-table">
            <tbody>
              {
                transactions.reverse().map((transaction, transactionIndex) =>
                  <tr key={transactionIndex}>
                    <td>{transaction.description}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.value}</td>
                    <td>£{transaction.balance}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      : <div>LOADING...</div>
    );
  }
}

export default App;
