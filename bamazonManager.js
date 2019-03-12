const prompter = require("./prompter.js");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazonDB",
});

let supplementInvObj;

async function runManager() {
    let prompterResponse = await prompter.managePrompt();
    switch(prompterResponse.action) {
        
        case "View Products for Sale":
            await listItems(true);
            connection.end();
            break;

        case "View Low Inventory":
            showLowInventory();
            connection.end();
            break;

        case "Add to Inventory":
            const productsAndIdsObj = await listItems(false);
            let itemResponse = await prompter.supplementInventoryPrompt(productsAndIdsObj);
            let itemPlusObj = await handleSupplementInventoryPromptReturn(itemResponse, productsAndIdsObj);
            supplementInventory(itemPlusObj).then((response) => {
                connection.end();
            });
            break;

        case "Add New Product": 
            addNewProduct();
            break;
    }
}

function listItems(display, conditional = "") {
    let result = {};
    return new Promise((resolve, reject) => {
        connection.query("select * from products" + conditional, (err, res) => {
            if(err) return reject(err);
            if(display)
                display(res);
            res.forEach((item) => {
                result[item.product_name] = item.item_id;
            });
            resolve(result);
        });
    });
}

function showLowInventory() {
    listItems(true, " where stock_quantity < 5");
}

function handleSupplementInventoryPromptReturn(answer, allProductsObj) {
    return new Promise(async (resolve, reject) => {
    let itemIncreaseByObj = {};
    let increaseBy;
    while(!increaseBy) {
        let increaseResponseObj = await prompter.increaseByPrompt(answer.itemName);
        increaseBy = parseInt(increaseResponseObj.num);
    }
    itemIncreaseByObj.itemID = allProductsObj[answer.itemName]
    itemIncreaseByObj.extraQuantity = increaseBy;
    resolve(itemIncreaseByObj);
    });
}

function supplementInventory(infoObj) {
    return new Promise ((resolve, reject) => {
        connection.query("select * from products where item_id = ?", infoObj.itemID, (err, results, fields) => {
            if(err) return reject(err);
            
            let newQuantity = parseInt(results[0].stock_quantity) + parseInt(infoObj.extraQuantity);

            connection.query("update products set stock_quantity = ? where item_id = ?", [newQuantity, infoObj.itemID], (err, results, fields) => {
                if(err) return reject(err);
                if(results.affectedRows > 0)
                    console.log("Your update was made with no issues");
                else
                    console.log("You may want to confirm this update.  There were " + results.warningCount + " warnings on update.");
                resolve(results);
            });
        });
    });
}

function display(itemArr) {
    itemArr.forEach((item) => {
        console.log("\nItem ID: " + item.item_id +
                    "\nProduct: " + item.product_name + 
                    "\nDepartment: " + item.department_name + 
                    "\nPrice: " + item.price +
                    "\nStock Quantity: "+ item.stock_quantity);
    });
}

async function addNewProduct() {
    const newProduct = await prompter.newProductPrompt();
    var product = {
        product_name: newProduct.itemName,
        department_name: newProduct.itemDepartment,
        price: newProduct.itemPrice,
        stock_quantity: newProduct.itemQuantity,
    }
    connection.query("insert into products set ?", product, (err, results, fields) => {
        if(err) throw err;
        if(results.affectedRows > 0)
            console.log("Your update was made with no issues");
        else
            console.log("You may want to confirm this update.  There were " + results.warningCount + " warnings on update.");
        connection.end();
    });
}

connection.connect(function(err) {
    if(err) throw err;

    console.log("connected as id: " + connection.threadId + "\n");
    runManager();
})