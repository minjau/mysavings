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
        var expense = budget.income.getAt(index);
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
                }
            );
    }

    function recalcBudget(budget) {
        budget.incomeSum = transactionSum(budget.income);
        budget.expensesSum = transactionSum(budget.expenses);
        budget.balance = budget.amount + budget.incomeSum - budget.expensesSum;
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
})();
