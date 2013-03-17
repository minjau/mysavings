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

            MS.init(appbar.winControl,
                listView,
                newButton,
                editButton,
                deleteButton,
                closeBudgetPopup,
                budgetEditPopupUI,
                this.deleteBudget,
                this.clearData,
                this.fillPopup
            );

            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Windows.ApplicationModel.Search.SearchPane.getForCurrentView().showOnKeyboardInput = true;

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
            saveBudget.addEventListener("click", this.saveBudget, false);
        },
        
        listViewSelectionChanged: function () {
            MS.helper.closePopup();
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }

            setImmediate(function() {
                appbar.winControl.show();
            });
        },
        
        fillPopup: function() {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            budgetName.value = item.title;
            budgetDateFrom.winControl.current = new Date(item.dateFrom);
            budgetDateTo.winControl.current = new Date(item.dateTo);
            budgetAmount.value = item.amount;
        },
        
        saveBudget: function (el) {
            WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            budgetEditPopupUI.style.opacity = 0;
            budgetEditPopupUI.style.display = 'none';
            var selectedItem = self.getSelectedItem();
            if (selectedItem) {
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
            
            var listView = document.querySelector(".groupeditemslist").winControl;
            listView.selection.clear();
        },
        
        clearData: function () {
            var now = new Date();
            budgetName.value = "";
            budgetDateFrom.winControl.current = new Date(now.getFullYear(), now.getMonth(), 1);
            budgetDateTo.winControl.current = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            budgetAmount.value = "";
        },

        deleteBudget: function () {
            var item = self.getSelectedItem();
            if (!item) {
                return;
            }
            Db.deleteBudget(item.key);
            appbar.winControl.hide();
        },
        
        getSelectedItem: function () {
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
                //listView.itemDataSource = Data.groups.dataSource;
                //listView.groupDataSource = null;
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
                var group = Db.groupedBudgets.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Db.groupedBudgets.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { key: item.key });
            }
        }
    });
})();
