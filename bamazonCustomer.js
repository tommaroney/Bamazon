let mysql = require("mysql");
let prompter = require("./prompter.js");

let connection = mysql.createConnection({

    host: "localhost",

    port: 3306,

    user: "root",
    password: "root",
    database: "bamazonDB"
});

function listAllItems() {
    connection.query("select * from products", async function(err, res) {
        if(err) throw err;
        let productAndQuantity = {};

        console.log("Here are the items up for bid: \n");
        res.forEach((item) => {
            if(parseInt(item.stock_quantity) > 0) {
                productAndQuantity[item.item_id] = item.stock_quantity;
                console.log("Product ID: " + item.item_id +
                            "\nProduct: " + item.product_name +
                            "\nPrice: $" + item.price + "\n");
            }
        });
        
        let finalOrder = await prompter.orderPrompt(productAndQuantity);
        
        await connection.query('update products set stock_quantity = ? where item_id = ?', [parseInt(finalOrder.originalQuantity) - parseInt(finalOrder.numberOrdered), parseInt(finalOrder.item_id)], async function (error, results, fields) {
            if(error) {
                return connection.rollback(function() {
                    throw error;
                });
            }
            console.log("\nTransaction successful!");
            await connection.query('select * from products where item_id = ?', finalOrder.item_id, async function(err, res, fields) {
                let totalPurchase = parseFloat(res[0].price) * parseFloat(finalOrder.numberOrdered);
                let newTotalSales = res[0].product_sales + totalPurchase;
                console.log("You have purchased " + finalOrder.numberOrdered + " " + res[0].product_name + ".  The total cost of your purchase is: $" + totalPurchase);

                await connection.query("update products set product_sales = ? where item_id = ?", [newTotalSales, finalOrder.item_id], (err, results, fields) => {
                    if(err) throw err;
                    connection.end();
                });
            });
        });
    });
}

connection.connect( function(err) {
    if(err) throw err;

    console.log("connected as id " + connection.threadId + "\n");
    listAllItems();
})