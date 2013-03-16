(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var self;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            self = this;
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value);
            listView.element.focus();

            listView.onselectionchanged = this.listViewSelectionChanged;
            newButton.addEventListener("click", function() {
                self.showPopup(false);
            }, false);
            editButton.addEventListener("click", function() {
                self.showPopup(true);
            }, false);
            deleteButton.addEventListener("click", this.deleteBudget, false);
            saveBudget.addEventListener("click", this.saveBudget, false);
            closeBudgetPopup.addEventListener("click", this.closeBudgetPopup, false);
            
            appbar.winControl.addEventListener("beforeshow", function (e) {
                e.preventDefault();
                self.beforeShowAppBar();
            });
        },
        
        listViewSelectionChanged: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }

            appbar.winControl.show();
        },
        
        beforeShowAppBar: function () {
            var listView = document.querySelector(".groupeditemslist").winControl;
            var selectedItems = listView.selection.getIndices();
            if (selectedItems.length > 0) {
                appbar.winControl.hideCommands(newButton.winControl, true);
                appbar.winControl.showCommands(editButton.winControl, true);
                appbar.winControl.showCommands(deleteButton.winControl, true);
            } else {
                appbar.winControl.showCommands(newButton.winControl, true);
                appbar.winControl.hideCommands(editButton.winControl, true);
                appbar.winControl.hideCommands(deleteButton.winControl, true);
            }
        },

        showPopup: function (prefilData) {
            self.clearData();
            
            budgetEditPopupUI.style.display = '';
            var offsetX = window.outerWidth / 2 - (budgetEditPopupUI.clientWidth / 2);
            var offsetY = window.outerHeight / 2 - (budgetEditPopupUI.clientHeight / 2);
            budgetEditPopupUI.style.pixelLeft = offsetX;
            budgetEditPopupUI.style.pixelTop = offsetY;
            budgetEditPopupUI.style.opacity = "1";
            if (prefilData) {
                var item = self.getSelectedItem();
                budgetName.value = item.title;
                budgetDateFrom.winControl.current = new Date(item.dateFrom);
                budgetDateTo.winControl.current = new Date(item.dateTo);
                budgetAmount.value = item.amount;
            }

            WinJS.UI.Animation.showPopup(budgetEditPopupUI, { top: "12px", left: "0px", rtlflip: true }).done(function() {
                budgetEditPopupUI.setActive();
            });
        },
        
        saveBudget: function (el) {
            WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            budgetEditPopupUI.style.opacity = 0;
            budgetEditPopupUI.style.display = 'none';
            var selectedItem = self.getSelectedItem();
            if (selectedItem) {
                debugger;
                Db.updateBudget({
                    key: selectedItem.key,
                    title: budgetName.value,
                    dateFrom: budgetDateFrom.winControl.current,
                    dateTo: budgetDateTo.winControl.current,
                    amount: budgetAmount.value
                });
            } else {
                Db.createBudget({
                    title: budgetName.value,
                    dateFrom: budgetDateFrom.winControl.current,
                    dateTo: budgetDateTo.winControl.current,
                    amount: budgetAmount.value
                });
            }
        },
        
        clearData: function() {
            budgetName.value = "";
            budgetDateFrom.winControl.current = new Date(2000, 0, 1);
            budgetDateTo.winControl.current = new Date(2000, 0, 1);
            budgetAmount.value = "";
        },

        deleteBudget: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            Db.deleteBudget(item.key);
        },

        closeBudgetPopup: function () {
            WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            budgetEditPopupUI.style.display = 'none';
            budgetEditPopupUI.style.opacity = 0;
        },
        
        getSelectedItem: function() {
            var listView = document.querySelector(".groupeditemslist").winControl;
            var item = Db.groupedBudgets.getAt(listView.selection.getIndices()[0]);
            if (!item) {
                return null;
            }

            return item;
        },
            // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />
            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Db.groupedBudgets.dataSource;
                listView.groupDataSource = Db.budgetsInTheGroups.dataSource;
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Db.groupedBudgets.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: [item.key, item.title] });
            }
        }
    });
})();
