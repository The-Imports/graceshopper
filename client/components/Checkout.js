import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import axios from 'axios';
import history from '../history';

class Checkout extends Component {
	constructor(props) {
        super(props);
        this.state = {
            cart: {},
            loaded: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }    
    componentDidMount() {
        axios.get('/api/session/cart').then(response => {
            if (response.data) {
                this.setState({
                    cart: response.data,
                    loaded: true,
                })
            }
        })
    }
    changeQuantity(id, amount) {
        console.log("changing quantity: ", id, amount)
        var orderId = this.state.cart.id;
        axios.put(`/api/orders/${orderId}/products/${id}`, {
            quantity: amount,
        }).then(()=> {
            axios.get('/api/session/cart').then(response => {
                if (response.data) {
                    this.setState({
                        cart: response.data,
                        loaded: true,
                    })
                }
            })
        })
    }
    removeItem(id) {
        console.log("removing item: ", id);
        var orderId = this.state.cart.id;
        axios.delete(`/api/orders/${orderId}/products/${id}`).then(() =>  {
            axios.get('/api/session/cart').then(response => {
                if (response.data) {
                    this.setState({
                        cart: response.data,
                        loaded: true,
                    })
                }
            })            
        })
    }
    buttonClicked() {
        console.log("buttonClicked");
    }
    handleSubmit(event) {
        event.preventDefault();
        console.log("submitting...", event.target);
        console.log("event.target.email: ", event.target.email.value);
        let orderInfo = {};
        // history.push('/');

        orderInfo.email = event.target.email.value;
        orderInfo.address = event.target.address.value;
        orderInfo.cardName = event.target.cardName.value;
        orderInfo.cardNumber = event.target.cardNumber.value;
        orderInfo.cvv = event.target.cvv.value;
        orderInfo.cardYear = event.target.cardYear.value;
        orderInfo.cardMonth = event.target.cardMonth.value;
        console.log("orderInfo: ", orderInfo);
        axios.post('/api/session/checkout', {
            cartId: this.state.cart.id,
            information: orderInfo,
        }).then((postedCart) => {
            history.push('/');
        });
    }       
	render() {
        console.log("props: ", this.props);
        console.log("state: ", this.state);
        const cart = this.state.cart;
        console.log("cart: ", cart);
        console.log("instances: ", cart.instances);
        return (
			<div className="container">
			<h1 className="my-4">Checkout</h1>
			<div className="row" style={{"paddingBottom":"10px"}}>
		
            <div className="col-lg-6">
                <h3>Order Summary</h3>
                <table style={{width:"100%"}} className="table">
                <tbody>
                  <tr>
                    <th>Items</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Remove</th> 
                  </tr>
                  {(this.state.loaded) ? 
                    (cart.instances.map(instance => {
                    return(
                      <tr key={instance.id}>				  
                      <td>
                          {instance.product.title}
                      </td>
                      <td>${instance.price}</td> 
                      <td>
                      {instance.quantity}
                      &nbsp; &nbsp;
                      <button className="btn btn-danger" onClick={() => this.changeQuantity(instance.id, instance.quantity - 1)}>-</button>
                          &nbsp; &nbsp;
                      <button className="btn btn-success" onClick={() => this.changeQuantity(instance.id, instance.quantity + 1)}>+</button>
                      </td> 
                    <td>
                    <button className="btn btn-danger" onClick={() => this.removeItem(instance.id)}>X</button>
                      </td>
                    </tr>)})) : (null)}
                </tbody>
              </table>
            </div>

			<div className="col-lg-6">
            <h3>Payment & Shipping Information</h3>
            <form onSubmit={this.handleSubmit}>
            <div className="form-group">
            <div className="form-group">
                <label htmlFor="exampleInputEmail1"><b>Email</b></label>
                <input name="email" type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
            </div>            

            <div className="form-group">
                <label htmlFor="exampleInputEmail1"><b>Shipping Address</b></label>
                <input name="address" type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter address"/>
            </div>            

            <div className="form-group">
                <label htmlFor="exampleInputEmail1"><b>Name on Card</b></label>
                <input name="cardName" type="cardName" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter card name"/>
            </div>

            <div className="form-group">
                <label htmlFor="exampleInputEmail1"><b>Credit Card Number</b></label>
                <input name="cardNumber" type="number" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Card Number"/>
            </div>
                        
            <div className="form-group col-sm-4" style={{paddingLeft:"0px", display:"inline-block"}}>            
                <label style={{paddingLeft:"0px"}} htmlFor="cvv"><b>CVV Code</b></label>
                <input name="cvv" type="number" className="form-control" id="cvv" placeholder="Security Code"/>
            </div>
            <div className="form-group col-sm-offset-5 col-sm-6" style={{paddingLeft:"0px", float:"right", display:"inline-block"}}>            
            
            <label style={{paddingLeft:"0px"}} htmlFor="expiry"><b>Expiry</b></label>
            <div className="row" style={{marginLeft:"0px"}}>
                <input name="cardYear" type="text" className="form-control" id="year" placeholder="YYYY" 
                style={{width:"40%", display:"inline-block", marginRight:"10px"}}/>
                <input name="cardMonth" type="text" className="form-control" id="month" placeholder="MM" style={{width:"40%", display:"inline-block"}}/>
            </div>
            
            </div>
            </div>
                <button type="submit" className="btn btn-primary" style={{"marginTop":"0px"}}><b>
                Submit Order</b></button>
            </form>
            </div>
			</div>
			</div>
			)
	}
}

const mapStateToProps = function(state) {
	
}

const mapDispatchToProps = function(dispatch) {

}

export default connect(mapStateToProps,mapDispatchToProps)(Checkout)
