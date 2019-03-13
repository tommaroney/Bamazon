const enquirer = require("enquirer");

async function orderPrompt(productQuantityObj) {
    let customerOrder = {};
    await enquirer.prompt({
        type: "select",
        message: "Please select the id of the product you would like to purchase: ",
        name: "selection",
        choices: Object.keys(productQuantityObj),
    }).then(async (answer) => {
        customerOrder.originalQuantity = productQuantityObj[answer.selection];
        customerOrder.item_id = answer.selection;
    const quantityOrdered = await howManyPrompt(answer.selection, productQuantityObj);
        customerOrder.numberOrdered = quantityOrdered.amount;
    });
    return customerOrder;
}

async function howManyPrompt(productName, productQuantityObj) {
    let quantityOptions = [];
    for(i = 0; i <= productQuantityObj[productName]; i++) {
        quantityOptions.push(i.toString());
    }
    return await enquirer.prompt({
        type: "autocomplete",
        message: "How many of this item would you like?",
        suggest(choices, input) {
            choices.filter((choice) => choice.message.startsWith(input));
        },
        choices: quantityOptions,
        name: "amount"
    });
}

function managePrompt() {
    return enquirer.prompt({
        type: "select",
        message: "Please select your task: ",
        name: "action",
        choices: [ "View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product" ],
    });
}

function supplementInventoryPrompt(allProductsObj) {
    let allProductsArr = Object.keys(allProductsObj);
    return enquirer.prompt({
        type: "select",
        message: "Which item would you like to add inventory to? ",
        name: "itemName",
        choices: allProductsArr,
    });
}

function increaseByPrompt(item) {
    return enquirer.prompt({
        type: "input",
        message: "How many " + item + "s would you like to add to the inventory?",
        name: "num",
    });
}

function newProductPrompt() {
    return enquirer.prompt([
        {
            type: "input",
            message: "What is the product you would like to add called?",
            name: "itemName",
        },
        {
            type: "input",
            message: "What department carries this item?",
            name: "itemDepartment",
        },
        {
            type: "input",
            message: "What price will this product list for?",
            name: "itemPrice",
        },
        {
            type: "input",
            message: "How many of this item will be added to inventory?",
            name: "itemQuantity",
        }
    ]);
}

function supervisorPrompt() {
    return enquirer.prompt({
        type: "select",
        message: "What would you like to do?",
        name: "supervisorTask",
        choices: ["View Product Sales by Department", "Create New Department"],
    });
}

function createNewDepartmentPrompt() {
    return enquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new department?",
            name: "departmentName"
        },
        {
            type: "input",
            message: "What is the annual overhead of the department?",
            name: "departmentOverhead"
        }
    ]);
}

module.exports = {
    orderPrompt,
    managePrompt,
    supplementInventoryPrompt,
    newProductPrompt,
    increaseByPrompt,
    supervisorPrompt,
    createNewDepartmentPrompt,
}