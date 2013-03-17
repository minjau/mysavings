(function () {
    "use strict";

    var positiveBudgetColor = '#FFF';
    var negativeBudgetColor = '#520000';
    
    var db = {
        budgets: new WinJS.Binding.List(),
        template: new WinJS.Binding.List()
    };

    var groupedBudgets = db.budgets
        .createSorted(function(left, right) {
            return left.dateFrom < right.dateFrom ? -1 : left.dateFrom > right.dateFrom ? 1 : 0;
        })
        .createGrouped(
            function (item) { return item.year; },
            function (item) { return { title: item.year }; },
            function (left, right) { return right - left; }
        );
    
    WinJS.Namespace.define("Db", {
        groupedBudgets: groupedBudgets,
        budgetsInTheGroups: groupedBudgets.groups,
        
        getBudget: getBudget,
        findBudgets: findBudgets,
        createBudget: createBudget,
        updateBudget: updateBudget,
        deleteBudget: deleteBudget,
        
        createIncome: createIncome,
        updateIncome: updateIncome,
        deleteIncome: deleteIncome,
        
        createExpense: createExpense,
        updateExpense: updateExpense,
        deleteExpense: deleteExpense,

        save: save,
        load: load
    });

    function getBudget(key) {
        var index = indexOfBudgetByKey(key);
        return db.budgets.getAt(index);
    }
    
    function findBudgets(queryText) {
        return db.budgets.createFiltered(function (item) {
            return item.title.toLowerCase().indexOf(queryText.toLowerCase()) >= 0;
        });
    }
    
    function createBudget(value) {
        var budget = WinJS.Binding.as({
            key: guid(),
            year: value.dateFrom.getFullYear(),
            title: value.title,
            dateFrom: value.dateFrom,
            dateTo: value.dateTo,
            amount: parseFloat(value.amount),
            incomeSum: 0,
            expensesSum: 0,
            balance: parseFloat(value.amount),
            color: positiveBudgetColor,
            income: new WinJS.Binding.List(),
            expenses: new WinJS.Binding.List()
        });

        db.budgets.push(budget);
        save();
    }
    
    function updateBudget(value) {
        var budget = getBudget(value.key);
        budget.year = value.dateFrom.getFullYear();
        budget.title = value.title;
        budget.dateFrom = value.dateFrom;
        budget.dateTo = value.dateTo;
        budget.amount = parseFloat(value.amount);
        recalcBudget(budget);
        save();
    }
    
    function deleteBudget(key) {
        var index = indexOfBudgetByKey(key);
        db.budgets.splice(index, 1);
        save();
    }
    
    function createIncome(budgetKey, value) {
        var budget = getBudget(budgetKey);
        var income = WinJS.Binding.as({
            name: value.name,
            amount: parseFloat(value.amount)
        });
        budget.income.push(income);
        recalcBudget(budget);
        save();
    }
    
    function updateIncome(budgetKey, index, value) {
        var budget = getBudget(budgetKey);
        var income = budget.income.getAt(index);
        income.name = value.name;
        income.amount = parseFloat(value.amount);
        recalcBudget(budget);
        save();
    }
    
    function deleteIncome(budgetKey, index) {
        var budget = getBudget(budgetKey);
        budget.income.splice(index, 1);
        recalcBudget(budget);
        save();
    }

    function createExpense(budgetKey, value) {
        var budget = getBudget(budgetKey);
        var expense = WinJS.Binding.as({
            name: value.name,
            amount: parseFloat(value.amount)
        });
        budget.expenses.push(expense);
        recalcBudget(budget);
        save();
    }

    function updateExpense(budgetKey, index, value) {
        var budget = getBudget(budgetKey);
        var expense = budget.expenses.getAt(index);
        expense.name = value.name;
        expense.amount = parseFloat(value.amount);
        recalcBudget(budget);
        save();
    }

    function deleteExpense(budgetKey, index) {
        var budget = getBudget(budgetKey);
        budget.expenses.splice(index, 1);
        recalcBudget(budget);
        save();
    }

    function save() {
        var data = {
            budgets: db.budgets.map(function(value) {
                return {
                    key: value.key,
                    year: value.year,
                    title: value.title,
                    dateFrom: value.dateFrom,
                    dateTo: value.dateTo,
                    amount: value.amount,
                    incomeSum: value.incomeSum,
                    expensesSum: value.expensesSum,
                    balance: value.balance,
                    color: value.color,
                    income: value.income.map(function(item) {
                        return { key: item.key, name: item.name, amount: item.amount };
                    }),
                    expenses: value.expenses.map(function(item) {
                        return { key: item.key, name: item.name, amount: item.amount };
                    })
                };
            }),
            template: db.template.map(function(value) {
                return {
                    key: value.key,
                    name: value.name,
                    amount: value.amount
                };
            })
        };
        
        Windows.Storage.KnownFolders.documentsLibrary.createFileAsync("MySavings.msd", Windows.Storage.CreationCollisionOption.replaceExisting)
            .done(
                function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(data)).done(function () {
                        WinJS.log && WinJS.log('Saved', 'db', 'info');
                    });
                },
                function (err) {
                    WinJS.log && WinJS.log(err, "db", "error");
                });
    }

    function load() {
        Windows.Storage.KnownFolders.documentsLibrary.getFileAsync("MySavings.msd")
            .done(
                function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).done(function (content) {
                        var data = JSON.parse(content);
                        var i, len, value;
                        var budgets = data.budgets || [];
                        for (i = 0, len = budgets.length; i < len; i++) {
                            value = budgets[i];
                            var budget = {
                                key: value.key,
                                year: value.year,
                                title: value.title,
                                dateFrom: value.dateFrom,
                                dateTo: value.dateTo,
                                amount: value.amount,
                                incomeSum: value.incomeSum,
                                expensesSum: value.expensesSum,
                                balance: value.balance,
                                color: value.color,
                                income: new WinJS.Binding.List(value.income.map(function (item) {
                                    return WinJS.Binding.as({ name: item.name, amount: item.amount });
                                })),
                                expenses: new WinJS.Binding.List(value.expenses.map(function (item) {
                                    return WinJS.Binding.as({ name: item.name, amount: item.amount });
                                }))
                            };
                            db.budgets.push(WinJS.Binding.as(budget));
                        }

                        var template = data.template || [];
                        for (i = 0, len = template.length; i < len; i++) {
                            value = template[i];
                            db.template.push({

                            });
                        }
                    });
                },
                function(err) {
                    WinJS.log && WinJS.log(err, "db", "error");
                    
                    var data = JSON.parse(testData);
                    var i, len, value;
                    var budgets = data.budgets || [];
                    for (i = 0, len = budgets.length; i < len; i++) {
                        value = budgets[i];
                        var budget = {
                            key: value.key,
                            year: value.year,
                            title: value.title,
                            dateFrom: value.dateFrom,
                            dateTo: value.dateTo,
                            amount: value.amount,
                            incomeSum: value.incomeSum,
                            expensesSum: value.expensesSum,
                            balance: value.balance,
                            color: value.color,
                            income: new WinJS.Binding.List(value.income.map(function(item) {
                                return WinJS.Binding.as({ name: item.name, amount: item.amount });
                            })),
                            expenses: new WinJS.Binding.List(value.expenses.map(function(item) {
                                return WinJS.Binding.as({ name: item.name, amount: item.amount });
                            }))
                        };
                        db.budgets.push(WinJS.Binding.as(budget));
                    }
                }
            );
    }

    function recalcBudget(budget) {
        budget.incomeSum = transactionSum(budget.income);
        budget.expensesSum = transactionSum(budget.expenses);
        budget.balance = budget.amount /*+ budget.incomeSum */- budget.expensesSum;
        budget.color = budget.balance > 0 ? positiveBudgetColor : negativeBudgetColor;
    }
    
    function indexOfBudgetByKey(key) {
        var index = -1;
        db.budgets.every(function (item, i) {
            if (item.key === key) {
                index = i;
                return false;
            }
            return true;
        });

        return index;
    }
    
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    
    function transactionSum(list) {
        var sum = 0;
        list.forEach(function(value) {
            sum += value.amount;
        });

        return sum;
    }


    var testData = '{"budgets":[{"key":"f2de30b3-38da-d130-be11-87a5965f0e1a","year":2013,"title":"January","dateFrom":"2013-01-01T10:00:00.000Z","dateTo":"2013-01-31T10:00:00.000Z","amount":5000,"incomeSum":4000,"expensesSum":1030,"balance":3970,"color":"#FFF","income":[{"name":"Salary","amount":4000}],"expenses":[{"name":"Food","amount":230},{"name":"Car repairs","amount":500},{"name":"Gas","amount":300}]},{"key":"ec995a32-5c04-ca55-f098-f11973fb53f6","year":2013,"title":"February","dateFrom":"2013-02-01T10:00:00.000Z","dateTo":"2013-02-28T10:00:00.000Z","amount":3000,"incomeSum":8000,"expensesSum":1030,"balance":1970,"color":"#FFF","income":[{"name":"Salary","amount":4000}],"expenses":[{"name":"Food","amount":230},{"name":"Car repairs","amount":500},{"name":"Gas","amount":300}]},{"key":"ae00a1be-9857-1648-9cb6-93e1c37a2641","year":2013,"title":"March","dateFrom":"2013-03-01T10:00:00.000Z","dateTo":"2013-03-31T09:00:00.000Z","amount":3200,"incomeSum":4000,"expensesSum":1030,"balance":2170,"color":"#FFF","income":[{"name":"Salary","amount":4000}],"expenses":[{"name":"Food","amount":230},{"name":"Car repairs","amount":500},{"name":"Gas","amount":300}]},{"key":"cf4ccf22-e32f-60a1-6a9c-65ed32292500","year":2013,"title":"April","dateFrom":"2013-04-01T09:00:00.000Z","dateTo":"2013-04-30T09:00:00.000Z","amount":3200,"incomeSum":4000,"expensesSum":5030,"balance":-1830,"color":"#520000","income":[{"name":"Salary","amount":4000}],"expenses":[{"name":"Food","amount":230},{"name":"Car repairs","amount":500},{"name":"Gas","amount":300},{"name":"Furniture","amount":4000}]},{"key":"8a4f2598-b7c9-3f32-1dc7-6b2f6847be29","year":2013,"title":"May","dateFrom":"2013-05-01T09:00:00.000Z","dateTo":"2013-05-31T09:00:00.000Z","amount":3500,"incomeSum":0,"expensesSum":770,"balance":2730,"color":"#FFF","income":[],"expenses":[{"name":"Food","amount":200},{"name":"Drinks","amount":300},{"name":"Transportation","amount":270}]},{"key":"704255ef-bab0-64da-de42-11680d67b6e0","year":2012,"title":"January","dateFrom":"2012-01-01T10:00:00.000Z","dateTo":"2012-01-31T10:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"b17d5ab8-dd0a-5fce-3bdd-b565a4e4d973","year":2012,"title":"February","dateFrom":"2012-02-01T10:00:00.000Z","dateTo":"2012-02-29T10:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"116afdc7-3b67-c280-b015-2806a03c4c5d","year":2012,"title":"March","dateFrom":"2012-03-01T10:00:00.000Z","dateTo":"2012-03-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"777d5eaa-94a7-a7ee-1f4f-aa015be64cce","year":2012,"title":"April","dateFrom":"2012-04-01T09:00:00.000Z","dateTo":"2012-04-30T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe1","year":2012,"title":"May","dateFrom":"2012-05-01T09:00:00.000Z","dateTo":"2012-05-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe2","year":2012,"title":"June","dateFrom":"2012-06-01T09:00:00.000Z","dateTo":"2012-06-30T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe3","year":2012,"title":"July","dateFrom":"2012-07-01T09:00:00.000Z","dateTo":"2012-07-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe4","year":2012,"title":"August","dateFrom":"2012-08-01T09:00:00.000Z","dateTo":"2012-08-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe5","year":2012,"title":"September","dateFrom":"2012-09-01T09:00:00.000Z","dateTo":"2012-09-30T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe6","year":2012,"title":"October","dateFrom":"2012-10-01T09:00:00.000Z","dateTo":"2012-10-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe7","year":2012,"title":"November","dateFrom":"2012-11-01T09:00:00.000Z","dateTo":"2012-11-30T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"e28c3e00-f08d-2d1c-dcff-5764aaa0cfe8","year":2012,"title":"December","dateFrom":"2012-12-01T09:00:00.000Z","dateTo":"2012-12-31T09:00:00.000Z","amount":2500,"incomeSum":0,"expensesSum":0,"balance":2500,"color":"#FFF","income":[],"expenses":[]},{"key":"88ce397a-f42a-a452-ccd8-00ea443804c1","year":2011,"title":"November","dateFrom":"2011-11-01T10:00:00.000Z","dateTo":"2013-03-31T09:00:00.000Z","amount":2200,"incomeSum":0,"expensesSum":0,"balance":2200,"color":"#FFF","income":[],"expenses":[]},{"key":"28f3a6fd-1ef5-9dbf-dc6d-15a94914737d","year":2011,"title":"December","dateFrom":"2011-12-01T10:00:00.000Z","dateTo":"2011-12-31T10:00:00.000Z","amount":2200,"incomeSum":0,"expensesSum":0,"balance":2200,"color":"#FFF","income":[],"expenses":[]}],"template":[]}';
})();
