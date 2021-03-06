import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from 'reducers/index.js';

function configureStore() {
  const middlewares = [thunk];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(
      createLogger({
        collapsed: true,
      }),
    );
  }

  const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  const store = createStore(reducer, enhancer);
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('reducers/index.js', () => {
      const nextRootReducer = require('reducers/index.js').default;
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}

export default configureStore;
