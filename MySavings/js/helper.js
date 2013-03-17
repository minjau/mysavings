var MS = (function () {
    "use strict";
    
    var ui = WinJS.UI;
    
    var appbar,
        listView,
        newButton,
        editButton,
        deleteButton,
        closePopupButton,
        editPopup,
        deleteFunction,
        clearFunction,
        fillFunction,
        helper = {};

    helper.addBeforeShowEventToAppBar = function() {
        appbar.addEventListener("beforeshow", function (e) {
            //e.preventDefault();
            helper.beforeShowAppBar();
        });
    },

    helper.beforeShowAppBar = function() {
        var selectedItems = listView.selection.getIndices();
        if (selectedItems.length > 0) {
            appbar.hideCommands(newButton.winControl, true);
            appbar.showCommands(editButton.winControl, true);
            appbar.showCommands(deleteButton.winControl, true);
        } else {
            appbar.showCommands(newButton.winControl, true);
            appbar.hideCommands(editButton.winControl, true);
            appbar.hideCommands(deleteButton.winControl, true);
        }
    },
    helper.showPopup = function(prefilData) {
        clearFunction();

        editPopup.style.display = '';
        var offsetX = window.outerWidth / 2 - (editPopup.clientWidth / 2);
        var offsetY = window.outerHeight / 2 - (editPopup.clientHeight / 2);
        editPopup.style.pixelLeft = offsetX;
        editPopup.style.pixelTop = offsetY;
        editPopup.style.opacity = "1";
        if (prefilData) {
            fillFunction();
        }

        WinJS.UI.Animation.showPopup(editPopup, { top: "12px", left: "0px", rtlflip: true }).done(function() {
            editPopup.setActive();
        });
    },
        
    helper.closePopup = function () {
        WinJS.UI.Animation.hidePopup(editPopup);
        editPopup.style.display = 'none';
        editPopup.style.opacity = 0;
    };
     

    return {
        init: function (appbarInner, listViewInner, newButtonInner, editButtonInner, deleteButtonInner, closePopupButtonInner, editPopupInner, deleteFunctionInner, clearFunctionInner, fillFunctionInner) {
            appbar = appbarInner;          
            listView = listViewInner;
            newButton = newButtonInner;
            editButton = editButtonInner;
            deleteButton = deleteButtonInner;
            closePopupButton = closePopupButtonInner;
            editPopup = editPopupInner;
            deleteFunction = deleteFunctionInner;
            clearFunction = clearFunctionInner;
            fillFunction = fillFunctionInner;
            helper.addBeforeShowEventToAppBar();

            newButton.addEventListener("click", function () { helper.showPopup(false); }, false);
            editButton.addEventListener("click", function () { helper.showPopup(true); }, false);
            deleteButton.addEventListener("click", function () { deleteFunction(); }, false);
            closePopupButton.addEventListener("click", function () { helper.closePopup(); }, false);
        },
        helper: helper
    };
})()