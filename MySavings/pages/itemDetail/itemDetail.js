(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var self;
    var listView;
    var expenseslistView;
    var budget;
    
    var ui = WinJS.UI;

    var incomeHelper;
    var expensesHelper;
    
    

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            self = this;
            listView = document.querySelector(".incomeItemsList").winControl;
            expenseslistView = document.querySelector(".expensesItemsList").winControl;
            
            budget = Db.getBudget(options.key);
            document.querySelector('h1.titlearea').innerHTML = 'My Savings: '+budget.title + ', ' + budget.year;
            
            incomeHelper = MS.init(appbar.winControl,
                expenseslistView,
                newButton,
                editButton,
                deleteButton,
                closePopupButton,
                editPopup,
                this.deleteBudget,
                this.clearData,
                this.fillPopup
            );

            expensesHelper = MS.init(appbar.winControl,
                listView,
                newButton,
                editButton,
                deleteButton,
                closePopupButton,
                editPopup,
                this.deleteBudget,
                this.clearData,
                this.fillPopup
            );

            this.initIncomeList();
            this.initExpensesList();

            saveButton.addEventListener("click", this.save, false);
        },

        initIncomeList: function() {
            listView.itemTemplate = document.querySelector(".itemtemplate");
            listView.groupHeaderTemplate = document.querySelector(".headertemplate");

            self._initializeLayout(appView.value);
            listView.element.focus();

            listView.onselectionchanged = this.listViewSelectionChanged;
        },
        
        initExpensesList: function() {
            expenseslistView.itemTemplate = document.querySelector(".expenses-itemtemplate");
            expenseslistView.groupHeaderTemplate = document.querySelector(".expenses-headertemplate");

            self._initializeLayoutExpenses(appView.value);
            expenseslistView.element.focus();

            expenseslistView.onselectionchanged = this.listViewSelectionChanged;
        },

        _initializeLayout: function (viewState) {
            if (viewState === appViewState.snapped) {
                //listView.itemDataSource = Data.groups.dataSource;
                //listView.groupDataSource = null;
                //listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = budget.expenses.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },
        
        _initializeLayoutExpenses: function (viewState) {
            if (viewState === appViewState.snapped) {
                //listView.itemDataSource = Data.groups.dataSource;
                //listView.groupDataSource = null;
                //listView.layout = new ui.ListLayout();
            } else {
                expenseslistView.itemDataSource = budget.income.dataSource;
                expenseslistView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        listViewSelectionChanged: function () {
            incomeHelper.closePopup();
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }

            appbar.winControl.show();
        },

        fillPopup: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            
            nameField.value = item.name;
            amountField.value = item.amount;
        },

        save: function () {
            WinJS.UI.Animation.hidePopup(editPopup);
            editPopup.style.opacity = 0;
            editPopup.style.display = 'none';
            var selectedItem = self.getSelectedItem();
            if (selectedItem) {
                Db.updateExpense(budget.key, listView.selection.getIndices()[0], { name: nameField.value, amount: amountField.value });
            } else {
                Db.createExpense(budget.key, { name: nameField.value, amount: amountField.value });
            }
            
            listView.selection.clear();
        },

        clearData: function () {
            nameField.value = "";
            amountField.value = "";
        },

        deleteBudget: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            
            var index = self.getItemIndex();
            if (index != null) {
                Db.deleteExpense(budget.key, index);
            }
            appbar.winControl.hide();
        },
        
        getItemIndex: function () {
            var index = listView.selection.getIndices();
            if (index.length == 0) {
                return null;
            }

            return index[0];
        },

        getSelectedItem: function () {
            var index = self.getItemIndex();
            if (index == null) {
                return null;
            }
            
            var item = budget.expenses.getAt(index);
            if (!item) {
                return null;
            }

            return item;            
        }
    });
})();
