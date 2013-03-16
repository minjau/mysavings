﻿(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    
    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
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

            //document.getElementsByClassName("item")
            newButton.addEventListener("click", this.showPopup, false);
            saveBudget.addEventListener("click", this.saveBudget, false);
            closeBudgetPopup.addEventListener("click", this.closeBudgetPopup, false);
        },

        showPopup: function () {
            budgetEditPopupUI.style.display = '';
            var offsetX = window.outerWidth / 2 - (budgetEditPopupUI.clientWidth / 2);
            var offsetY = window.outerHeight / 2 - (budgetEditPopupUI.clientHeight / 2);
            budgetEditPopupUI.style.pixelLeft = offsetX;
            budgetEditPopupUI.style.pixelTop = offsetY;
            budgetEditPopupUI.style.opacity = "1";
            WinJS.UI.Animation.showPopup(budgetEditPopupUI, { top: "12px", left: "0px", rtlflip: true }).done(function() {
                budgetEditPopupUI.setActive();
                //budgetDateFrom.winControl.current = "";
            });
        },
        
        saveBudget: function (el) {
            WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            budgetEditPopupUI.style.opacity = 0;
            budgetEditPopupUI.style.display = 'none';
            Db.createBudget({
                title: budgetName.value,
                dateFrom: budgetDateFrom.winControl.current,
                dateTo: budgetDateTo.winControl.current,
                amount: budgetAmount.value
            });
        },
        
        closeBudgetPopup: function () {
            WinJS.UI.Animation.hidePopup(budgetEditPopupUI);
            budgetEditPopupUI.style.display = 'none';
            budgetEditPopupUI.style.opacity = 0;
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
                listView.groupDataSource = Db.groupedBudgets.groups.dataSource;
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
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        }
    });
})();
