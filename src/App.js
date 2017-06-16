import React, { Component } from 'react';
import './App.css';


// Components
const Heading = str => ( 
        <h1>Now Viewing {str}</h1>
),
Link = user => (
        <a href={`/users/${user.id}`}>{user.name}</a>
);

console.log('Link', Link)
const functionalhandler = (props) => {

    let textInput = null;

    const handleClick = () => console.log(textInput.value);

    return (
        <div>
            <input
                defaultValue="Bob"
                type="text"
                ref={(self) => {console.log(self); textInput = self; }} />
            <input
                type="button"
                value="Alert me"
                onClick={handleClick}
            />
        </div>
    );
};


// ComponentFactory ::  a -> JSX
const ComponentFactory = comp =>
    ({
        fold: comp, // bound component
        concat: other => // bifold two Components
            ComponentFactory(x => <div>{comp(x)} {other.fold(x)}</div>),
        contramap: props => // passing state to component
            ComponentFactory(x => comp(props(x)))
    });

// Heading(getPagename(Object))

const HeadingBound = ComponentFactory(Heading).contramap(s => s.pageName),
      LinkBound = ComponentFactory(Link).contramap(s => s.currentUser);

// Merge two components
const CurrentView = HeadingBound.concat(LinkBound);

const state = {
    pageName: 'Home',
    currentUser: { id: 2, name: 'ja0nz' }
};
// Fold view with state
const HeadingLinkDiv = CurrentView.fold(state);
console.log(HeadingLinkDiv);

export default class extends Component {
    render() {
        return (
            <div className="App">
                {HeadingLinkDiv}
                {functionalhandler()}
            </div>
        );
    }
}

/* ----------------------------------------------- */
// Playing wit Reducers */

// Reducer :: (a,b) -> a
const Reducer = g =>
    ({
        fold: g, // bound reducer
        contramap: f => // run f on each element before reduce
            Reducer((acc, x) => g(acc, f(x))),
        map: f => // reduce first and than map afterwards
            Reducer((acc, x) => f(g(acc, x))),
        concat: o => // concat reducers
            Reducer((acc, x) => o.fold(g(acc, x), x))
    });

const r = Reducer((acc, x) => acc.concat(x)) // Concat reducer, concat = fold
    .contramap(x => `The number is ${x}`) // apply on each element
    .map(x => x + '! ') // reduce + map

/* console.log([1,2,3].reduce(r.fold, ''));*/
// The number is 1! ...

const appReducer = Reducer((state, action) => {
    switch (action.type) {
        case 'set_visibility_filter':
            return Object.assign({}, state, {
                visibilityFilter: action.filter
            })
        default:
            return state
    }
}),
todoReducer = Reducer((state, action) => {
    switch (action.type) {
        case 'new_todo':
            const t = { id: 0, title: action.payload.title }
            return Object.assign({}, state, {
                todos: state.todos.concat(t)
            })
        default:
            return state
    }
});

const todoApp =
    appReducer
        .concat(todoReducer)
        .contramap(action => Object.assign({filter: 'all'}, action))
        .map(s => Object.assign({}, s, { lastUpdated: Date() }))

const stateTodo = {visibilityFilter: 'complete',
                   type: 'set_visibility_filter'},
statefulApp = todoApp.fold(stateTodo);

console.log(statefulApp);

/* ------------------------------ */
// Higher order Components. Concat with Components

// Hoc :: Component -> Component

const Hoc = g =>
    ({
        fold: g,
        concat: other =>
            Hoc(x => g(other.fold(x)))
    });

/*
 *const hoc = Hoc(withReducer('state', 'dispatch', todoApp.fold, {todos: []}));
 * 
 * const Todos = hoc.fold(({ state, dispatch }) => (
 *     <div>
 *         <span>Filter: {state.setVisibilityFilter}</span>
 *         <ul>
 *             { state.todos.map(t => <li>{t.title}</li>) }
 *         </ul>
 *         <button onClick={() =>
 *             dispatch({type: 'new_todo', payload: {title: 'New todo'}})}>
 *             Add Todo
 *         </button>
 *         <button onClick={() =>
 *             dispatch({ type: 'set_visibility_filter' })}>
 *             Set Visibility
 *         </button>
 *     </div>
 * ));
 * 
 * 
 * const TodoComp = Component(classToFn(Todos))
 * 
 * App = do
 * Contramaps with Updaters
 * concat Components
 * fold Component with state
 */

