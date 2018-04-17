const db = require('../db');
const User = require('./user');
const Product = require('./product');
const Review = require('./review');
const Order = require('./order');
const Category = require('./category');
const productInstance = require('./productInstance');


/**
 * If we had any associations to make, this would be a great place to put them!
 * ex. if we had another model called BlogPost, we might say:
 *
 *    BlogPost.belongsTo(User)
 */

/**
 * We'll export all of our models here, so that any time a module needs a model,
 * we can just require it from 'db/models'
 * for example, we can say: const {User} = require('../db/models')
 * instead of: const User = require('../db/models/user')
 */

Review.belongsTo(Product);
Product.hasMany(Review);

Review.belongsTo(User)
User.hasMany(Review);

User.hasMany(Order);
Order.belongsTo(User);

productInstance.belongsTo(Order)
Order.hasMany(productInstance, {as: 'instances'})

productInstance.belongsTo(Product, {as: "parent"});
Product.hasMany(productInstance, {as: "instances"});

const ProductCategory = db.define('ProductCategory', {

})

Product.belongsToMany(Category, { through: ProductCategory, as: 'categories' });
Category.belongsToMany(Product, { through: ProductCategory });
// through is required!

// user.addProject(project, { through: { role: 'manager' }});


// Product.belongsToMany(Category, {through: });
// Category.belongsToMany(Product, {as: "products"});

module.exports = {
  User,
  Product,
  Review,
  Order,
  productInstance,
  Category,
  ProductCategory
}
