/**
 * Welcome to the seed file! This seed file uses a newer language feature called...
 *
 *                  -=-= ASYNC...AWAIT -=-=
 *
 * Async-await is a joy to use! Read more about it in the MDN docs:
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 *
 * Now that you've got the main idea, check it out in practice below!
 */

const db = require('../server/db')
const {User, Review, Order, productInstance, Product} = require('../server/db/models')


var Products = [
    {
        sportType: 'Football',
        title: 'Shoulder Pads',
        quantity: 7,
        price: 23.00,
    },
    {
        sportType: 'Football',
        title: 'Helmet',
        quantity: 6,
        price: 35.00,
    },
    {
        sportType: 'Soccer',
        title: 'Soccer Ball',
        quantity: 3,
        price: 50.00,
    },
    {
        sportType: 'Basketball',
        title: 'Basketball Shoes',
        quantity: 13,
        price: 250.00,
    },
    {
        sportType: 'Combat Sports',
        title: 'Boxing Gloves',
        quantity: 4,
        price: 80.00,
    },
    {
        sportType: 'Swimming',
        title: 'Speedo',
        quantity: 200,
        price: 2.00,
    },
    {
        sportType: 'Football',
        title: 'Cleats',
        quantity: 4,
        price: 150.00,
    },
    {
        sportType: 'Hockey',
        title: 'Hockey Puck',
        quantity: 9,
        price: 5.00,

    },
    {
        sportType: 'Baseball',
        title: 'Baseball Bat',
        quantity: 6,
        price: 100.00,
    },
    {
        sportType: 'Volleyball',
        title: 'Girls Volleyball Shorts',
        quantity: 15,
        price: 8.00,
    }
];

var Orders = [
  {isCart: true, userId: 1},
  {isCart: false, userId: 1},
  {isCart: false, userId: 1},
]


async function seed () {
  await db.sync({force: true});
  console.log('db synced!')
  await User.destroy({where: {}});
  await productInstance.destroy({where: {}});
  await Product.destroy({where: {}});
  await Review.destroy({where: {}});
  await Order.destroy({where: {}});
  // Whoa! Because we `await` the promise that db.sync returns, the next line will not be
  // executed until that promise resolves!

  const orders = await Promise.all([
    Order.create({}),
    Order.create({}),
    Order.create({}),
  ]);

  const products = await Promise.all(Products.map((product) => {
    Product.create(product).then( async (product) => {
        product.createInstance(-1, orders[0].id).then(instance => {
            console.log("created instance of : ", product.title, instance);
        });
        product.createInstance(0, orders[1].id).then(instance => {
            console.log("created instance of : ", product.title, instance);
        });
        product.createInstance(1, orders[2].id).then(instance => {
            console.log("created instance of : ", product.title, instance);
        });
        // productInstance.create({
        //     productId:product.id,
        // })
        // var examplePrices = [parseFloat(product.price) - 1, parseFloat(product.price) + 1, parseFloat(product.price)];
        // examplePrices.forEach((price) => {
        //     productInstance.create({
        //         productId:product.id,
        //         price:price,
        //     });
        // })
    });
  }))

  const users = await Promise.all([
    User.create({email: 'cody@email.com', password: '123'}),
    User.create({email: 'murphy@email.com', password: '123'})
  ])

  await Order.bulkCreate(Orders)


  // Wowzers! We can even `await` on the right-hand side of the assignment operator
  // and store the result that the promise resolves to in a variable! This is nice!
  console.log(`seeded ${users.length} users, ${products.length} products`);
  console.log(`seeded successfully`);
}

// Execute the `seed` function
// `Async` functions always return a promise, so we can use `catch` to handle any errors
// that might occur inside of `seed`
seed()
  .catch(err => {
    console.error(err.message)
    console.error(err.stack)
    process.exitCode = 1
  })
  .then(() => {
    console.log('closing db connection')
    db.close()
    console.log('db connection closed')
  })

/*
 * note: everything outside of the async function is totally synchronous
 * The console.log below will occur before any of the logs that occur inside
 * of the async function
 */
console.log('seeding...')
