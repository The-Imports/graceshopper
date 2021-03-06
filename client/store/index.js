import {createStore, combineReducers, applyMiddleware} from 'redux'
import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import users from './users'
import user from './user'
import products from './products'
import orders from './orders'
import productInstances from './productInstances'
import cart from './cart'
// import category from './category'
import reviews from './reviews'
import categories from './categories'


const reducer = combineReducers({user, products, orders, productInstances, cart, reviews, users, categories})

const middleware = composeWithDevTools(applyMiddleware(
  thunkMiddleware,
  createLogger({collapsed: true})
))
const store = createStore(reducer, middleware)

console.log("store line 20: ", store.getState());

export default store
// export * from './category'
export * from './user'
export * from './products'
export * from './orders'
export * from './productInstances'
export * from './cart'
export * from './reviews'
export * from './users'
export * from './categories'
