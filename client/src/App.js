import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    sweetPacks: [],
    sweetacksArray: [],
    requiredAmount: 0,
    newPackSize: 0,
    order: ''
  }

  componentDidMount = () => {
    this.getSweetPacks();
  }

  getSweetPacks = () => {
    fetch('/api/sweetpacks')
      .then(res => res.json())
      .then(sweetPacks => this.setState({ sweetPacks }));
  }

  removeSweetPack = (id) => {
    fetch('/api/sweetpacks/' + id, {
      method: 'delete',
    });
    this.getSweetPacks();
  }

  addSweetPack = () => {
    fetch('/api/sweetpacks/', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "size": this.state.newPackSize
      })
    });
    this.setState({ newPackSize: 0 });
    this.getSweetPacks();
  }

  updatePacksRequired = event => {
    this.setState({ requiredAmount: event.target.value });
  }

  updateNewPackSize = event => {
    this.setState({ newPackSize: event.target.value });
  }

  calculatePacksRequired = event => {
    var goal = this.state.requiredAmount;
    var order = [];
    var result = {};
    var output = '';

    this.optimisePacks = (number) => {

      // get the available sweets into a better format
      let sweetPacksArray = [...new Set(this.state.sweetPacks.map(data => data.size))];

      // find the nearest pack to the required amount
      var nearest = sweetPacksArray.reduce((prev, curr) => Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev);

      // record the remainder
      var remainder = number - nearest;
      order.push(nearest);

      // after finding the nearest pack, do we have any sweets left over?
      if (remainder > 0) {

        // search again
        return this.optimisePacks(remainder);
      } else {

        // now we need to see what we have an if it's sensible
        // The issue seems to be duplicate packs at the bottom end, when we could choose
        // a larger pack size, so lets fix that issue, hopefully..
        var counts = [];
        order.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });

        // I'm not sure if this works in all cases, but I need to do something else with
        // my life now, so best stab at it :P

        // do we have the first pack size in the order
        if (counts.indexOf(sweetPacksArray[0])) {

          // it is also ordered twice?
          if (counts[sweetPacksArray[0]] === 2) {

            // what's the min pack size x 2
            var doubleIt = sweetPacksArray[0] * 2;

            // find the nearest pack to that, and add it to the order
            counts[sweetPacksArray.reduce((prev, curr) => Math.abs(curr - doubleIt) < Math.abs(prev - doubleIt) ? curr : prev)] = 1;

            // ditch what we had before
            delete counts[sweetPacksArray[0]];
          }
        }

        // string the description together
        counts.forEach((val, key) => {
          var plural = (val > 1) ? 's' : '';
          output = output + val + ' ' + key + ' pack' + plural + ' ';
        });

        return output;
      }

    }

    result = this.optimisePacks(goal);
    this.setState({ order: result });
  }

  render() {
    const { sweetPacks, order } = this.state;

    return (
      <div className="App">
        {sweetPacks.length ? (
          <div>
            <h1>Welcome to Simons Sweet Shop!</h1>
            <h3>Available sweet pack sizes are:</h3>
            <ul className="sweet-packs">
              {sweetPacks.map((packs) =>
                <li key={packs._id}>
                  {packs.size}
                  {sweetPacks.length > 1 &&
                    <button
                      className="remove"
                      onClick={() => this.removeSweetPack(packs._id)}>
                      X
                  </button>
                  }
                </li>
              )}
              <li><input type="text" className="add-pack" value={this.state.newPackSize} onChange={this.updateNewPackSize} />
                <button
                  className="button"
                  onClick={this.addSweetPack}>
                  Add New Pack
            </button></li>
            </ul>

            <p><input type="text" className="qty-required" onChange={this.updatePacksRequired} placeholder="How many sweets do you want?" /></p>
            <p>We will send you: {order}</p>
            <button
              className="button"
              onClick={this.calculatePacksRequired}>
              Calculate
            </button>
          </div>
        ) : (
            // we don't have any sweetpacks defined..
            <div>
              <h1>No Sweet Packs defined :(</h1>
              <button
                className="more"
                onClick={this.getSweetPacks}>
                Try Again?
            </button>
            </div>
          )}
      </div>
    );
  }
}

export default App;
