import React, { Component } from 'react';
import './App.css';


// Components //

const Heading = str => ( 
        <h1>Now Viewing {str}</h1>
);

const Link = user => (
        <a href={`/users/${user.id}`}>{user.name}</a>
);

// ComponentFactory :: Component a => a -> b
const ComponentFactory = comp =>
    ({
        fold: comp, // launch function chain
        concat: other => // bifold two Components
            ComponentFactory(x => <div>{comp(x)} {other.fold(x)}</div>),
        contramap: statef => // passing state to component
            ComponentFactory(x => comp(statef(x)))
    });

// Reducer :: (a,b) -> a
const Reducer = g =>
    ({
        fold: g,
        contramap: f =>
            Reducer((acc, x) => g(acc, f(x))),
        map: f =>
            Reducer((acc, x) => f(g(acc, x))),
        concat: o =>
            Reducer((acc, x) => o.fold(g(acc, x), x))
    });

const r = Reducer((acc, x) => acc.concat(x))
    .contramap(x => `The number is ${x}`)
    .map(x => x + '! ')

console.log([1,2,3].reduce(r.fold, ''));


const state = {
    pageName: 'Home',
    currentUser: { id: 2, name: 'ja0nz' }
};

const HeadingPageName = ComponentFactory(Heading).contramap(s => s.pageName),
      LinkCurrentUser = ComponentFactory(Link).contramap(s => s.currentUser);

// Merge two components
const CurrentView = HeadingPageName.concat(LinkCurrentUser);


// Fold view with state
const App = CurrentView.fold(state);

export default class extends Component {
    render() {
        return (
            <div className="App">
                {App} 
            </div>
        );
    }
}
