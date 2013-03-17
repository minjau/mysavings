(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var self;
    var listView;
    var budget;
    
    var ui = WinJS.UI;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            self = this;
            listView = document.querySelector(".incomeItemsList").winControl;
            budget = Db.getBudget(options.key);
            
            MS.init(appbar.winControl,
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
            
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");

            self._initializeLayout(appView.value);
            listView.element.focus();

            listView.onselectionchanged = this.listViewSelectionChanged;
            saveButton.addEventListener("click", this.save, false);
        },

        _initializeLayout: function (viewState) {
            if (viewState === appViewState.snapped) {
                //listView.itemDataSource = Data.groups.dataSource;
                //listView.groupDataSource = null;
                //listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = budget.income.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },
        
        listViewSelectionChanged: function () {
            MS.helper.closePopup();
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
            //budgetName.value = item.title;
            //budgetDateFrom.winControl.current = new Date(item.dateFrom);
            //budgetDateTo.winControl.current = new Date(item.dateTo);
            //budgetAmount.value = item.amount;
        },

        save: function (el) {
            //WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            //budgetEditPopupUI.style.opacity = 0;
            //budgetEditPopupUI.style.display = 'none';
            //var selectedItem = self.getSelectedItem();
            //if (selectedItem) {
            //    Db.updateBudget({
            //        key: selectedItem.key,
            //        title: budgetName.value,
            //        dateFrom: budgetDateFrom.winControl.current,
            //        dateTo: budgetDateTo.winControl.current,
            //        amount: budgetAmount.value
            //    });
            //} else {
            //    Db.createBudget({
            //        title: budgetName.value,
            //        dateFrom: budgetDateFrom.winControl.current,
            //        dateTo: budgetDateTo.winControl.current,
            //        amount: budgetAmount.value
            //    });
            //}
            
            listView.selection.clear();
        },

        clearData: function () {
            //budgetName.value = "";
            //budgetDateFrom.winControl.current = new Date(2000, 0, 1);
            //budgetDateTo.winControl.current = new Date(2000, 0, 1);
            //budgetAmount.value = "";
        },

        deleteBudget: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            //Db.deleteBudget(item.key);
            appbar.winControl.hide();
        },

        getSelectedItem: function () {
            var item = budget.income.getAt(listView.selection.getIndices()[0]);
            if (!item) {
                return null;
            }

            return item;            
        }
    });
})();
