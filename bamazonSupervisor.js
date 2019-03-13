const mysql = require("mysql");
const prompter = require("./prompter.js");
const {table, getBorderCharacters} = require("table");

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "root",
    database: "bamazondb",
});

function salesByDepartment() {
    connection.query("select departments.department_id,departments.department_name, departments.over_head_costs, sum(product_sales) as department_sales from products right join departments on products.department_name = departments.department_name group by department_name order by department_name", (err, results, fields) => {
        let config, data, output;

        data = [
            ["department_id", "department_name", "over_head_costs", "department_sales", "total_profit"]
        ];

        results.forEach((row) => {
            let totalProfit = parseFloat(row.department_sales) - (parseInt(row.over_head_costs));
            let rowArr = [row.department_id, row.department_name, row.over_head_costs, row.department_sales, totalProfit];
            data.push(rowArr);
        });

        config = {
            border: getBorderCharacters('ramac'),
        }

        output = table(data, config);

        console.log(output);
        connection.end();
    });
}

async function createNewDepartment() {
    const departmentResponse = await prompter.createNewDepartmentPrompt();
    const newDepartment = {department_name: departmentResponse.departmentName, over_head_costs: departmentResponse.departmentOverhead};
    connection.query("insert into departments set ?", newDepartment, (err, results, fields) => {
        if(err) throw err;
        if(results.affectedRows > 0)
            console.log("Your update was made with no issues");
        else
            console.log("You may want to confirm this update.  There were " + results.warningCount + " warnings on update.");
        connection.end();
    });
}

async function runSupervisor() {
    const prompterResponse = await prompter.supervisorPrompt()
    const action = prompterResponse.supervisorTask;
    switch(action) {

        case "View Product Sales by Department":
            salesByDepartment();
            break;
        case "Create New Department":
            createNewDepartment();
            break;
    }
}

connection.connect((err) => {
    if(err) throw err;

    console.log("connected as id: " + connection.threadId + ".");
    runSupervisor();
});

