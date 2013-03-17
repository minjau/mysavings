(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var self;
    var incomeListView;
    
    var ui = WinJS.UI;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            self = this;
            incomeListView = document.querySelector(".incomeItemsList").winControl;
            var budget = Db.getBudget(options.key);
            
            incomeListView.itemTemplate = element.querySelector(".itemtemplate");
            incomeListView.groupHeaderTemplate = element.querySelector(".headertemplate");

            self._initializeLayout(appView.value, budget);
            incomeListView.element.focus();
            
            appbar.winControl.addEventListener("beforeshow", function (e) {
                e.preventDefault();
                self.beforeShowAppBar();
            });
        },

        _initializeLayout: function (viewState, budget) {
            if (viewState === appViewState.snapped) {
                //listView.itemDataSource = Data.groups.dataSource;
                //listView.groupDataSource = null;
                //listView.layout = new ui.ListLayout();
            } else {
                incomeListView.itemDataSource = budget.income.dataSource;
                incomeListView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },
        
        //listViewSelectionChanged: function () {
        //    self.closePopup();
        //    var item = self.getSelectedItem();
        //    if (!item) {
        //        return;
        //    }

        //    appbar.winControl.show();
        //},

        //beforeShowAppBar: function () {
        //    var listView = document.querySelector(".incomeItemsList").winControl;
        //    var selectedItems = listView.selection.getIndices();
        //    if (selectedItems.length > 0) {
        //        appbar.winControl.hideCommands(newButton.winControl, true);
        //        appbar.winControl.showCommands(editButton.winControl, true);
        //        appbar.winControl.showCommands(deleteButton.winControl, true);
        //    } else {
        //        appbar.winControl.showCommands(newButton.winControl, true);
        //        appbar.winControl.hideCommands(editButton.winControl, true);
        //        appbar.winControl.hideCommands(deleteButton.winControl, true);
        //    }
        //},

        //showPopup: function (prefilData) {
        //    self.clearData();

        //    budgetEditPopupUI.style.display = '';
        //    var offsetX = window.outerWidth / 2 - (budgetEditPopupUI.clientWidth / 2);
        //    var offsetY = window.outerHeight / 2 - (budgetEditPopupUI.clientHeight / 2);
        //    budgetEditPopupUI.style.pixelLeft = offsetX;
        //    budgetEditPopupUI.style.pixelTop = offsetY;
        //    budgetEditPopupUI.style.opacity = "1";
        //    if (prefilData) {
        //        var item = self.getSelectedItem();
        //        budgetName.value = item.title;
        //        budgetDateFrom.winControl.current = new Date(item.dateFrom);
        //        budgetDateTo.winControl.current = new Date(item.dateTo);
        //        budgetAmount.value = item.amount;
        //    }

        //    WinJS.UI.Animation.showPopup(budgetEditPopupUI, { top: "12px", left: "0px", rtlflip: true }).done(function () {
        //        budgetEditPopupUI.setActive();
        //    });
        //},

        //clearData: function () {
        //    budgetName.value = "";
        //    budgetDateFrom.winControl.current = new Date(2000, 0, 1);
        //    budgetDateTo.winControl.current = new Date(2000, 0, 1);
        //    budgetAmount.value = "";
        //},
        
        //closePopup: function () {
        //    WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
        //    budgetEditPopupUI.style.display = 'none';
        //    budgetEditPopupUI.style.opacity = 0;
        //},

        //getSelectedItem: function () {
        //    var listView = document.querySelector(".groupeditemslist").winControl;
        //    var item = Db.groupedBudgets.getAt(listView.selection.getIndices()[0]);
        //    if (!item) {
        //        return null;
        //    }

        //    return item;
        //}
    });
})();
