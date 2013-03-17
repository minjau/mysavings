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
            
            //var pageList = this._items.createGrouped(
            //    function groupKeySelector(item) { return group.key; },
            //    function groupDataSelector(item) { return group; }
            //);

            //incomeListView.itemDataSource = pageList.dataSource;
            incomeListView.itemTemplate = element.querySelector(".itemtemplate");
            //incomeListView.groupDataSource = pageList.groups.dataSource;
            incomeListView.groupHeaderTemplate = element.querySelector(".headertemplate");
            //incomeListView.oniteminvoked = this._itemInvoked.bind(this);

            self._initializeLayout(appView.value, budget);
            incomeListView.element.focus();

            //var tableBody = document.getElementById("myTableBody");
            //var template = document.getElementById("myTemplate").winControl;
            //var b = Db.getBudget(options.key);
            //b.income.forEach(function (item) {
            //    template.render(item, tableBody);
            //});

            //var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            //element.querySelector(".titlearea .pagetitle").textContent = item.group.title;
            //element.querySelector("article .item-title").textContent = budget.title;
            //element.querySelector("article .item-subtitle").textContent = item.subtitle;
            //element.querySelector("article .item-image").src = item.backgroundImage;
            //element.querySelector("article .item-image").alt = item.subtitle;
            //element.querySelector("article .item-content").innerHTML = item.content;
            //element.querySelector(".content").focus();
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
        }
    });
})();
