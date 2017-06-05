import React, { Component } from 'react';
import './App.css';


// Components //

const Heading = str => ( 
        <h1>Now Viewing {str}</h1>
);

const ProfileLink = user => (
        <a href={`/users/${user.id}`}>user.name</a>
);

// Functional Component
/*
contramap returns partially applied component. Flat component with fold
concat is basically a bifold
*/
const Comp = g =>
    ({
        fold: g,
        concat: other => Comp(x => <div>{g(x)} {other.fold(x)}</div>),
        contramap: f => Comp(x => g(f(x)))
    });


const Reducer = g =>
    ({
        fold: g,
        contramap: f =>
            Reducer((acc, x) => g(acc, f(x))),
        map: f =>
            Reducer((acc, x) => f(g(acc, x))),
        concat: o =>
            Reducer((acc, x) => o.fold(g(acc, x), x))
    })

const CurrentPage = Comp(Heading).contramap(s => s.pageName),
      Link = Comp(ProfileLink).contramap(s => s.currentUser);

const CurrentView = CurrentPage.concat(Link);


// Fold view with state
const App = CurrentView.fold({
    pageName: 'Home',
    currentUser: { id: 2, name: 'ja0nz' }
});

export default class extends Component {
    render() {
        return (
            <div className="App">
                {App} 
            </div>
        );
    }
}
