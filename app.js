'use strict';

var myURL = window.location.href.substring(0, window.location.href.search('DeviationTracking'));

var myFormDigest = "";

var getFormDigest = $.ajax({
    async: false,
    url: myURL + "DeviationTracking/_api/contextinfo",
    method: "POST",
    headers: { "Accept": "application/json; odata=verbose" }
});

getFormDigest.done(function (data, textStatus, jqXHR) {
    myFormDigest = data.d.GetContextWebInformation.FormDigestValue;
});

var myFSEs = [];
var myDocuments = [];
var myDeviations = [];

$(document).ready(function () {

    getFormDigest;

    resetPage();

    //  populate myFSEs array from FSEs list
    getJson(myURL + "DeviationTracking/_api/web/lists/getbytitle('FSEs')/items", getFSEs, logError);
    
    $("#DevOpen").datepicker();

    $("#addNewDeviation").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Add": addNewDev,
            Cancel: function() {
            $(this).dialog( "close" );
            }
        }
    });

    $("#addNewDevButton").on("click", function () {
        $("#addNewDeviation").dialog("open");
    });

    $("#filterButton").click(function () {
        $("#filters").slideToggle("medium");
    });

    $("#chartButton").click(function () {
        $("#charts").slideToggle("medium");
    });

    $("#resetFilter").click(function () {
        resetPage();
    });

    $("#applyFilter").click(function () {
    //    getPunchlist();
    //    updateChart();
    });

    $("#chartType").change(function () {
        updateChart();
    });

    //delete dev on 'x' button click
    $("#DeviationsContainer").on("mousedown", ".deleteDevButton", function (event) {
        if (confirm("You are about to delete this deviation. Continue?")) {
            //deleteDev($(this).attr('id'));
        }
        event.stopImmediatePropagation();
        event.preventDefault();
    });

    //open dev on button click
    $("#DeviationsContainer").on("mousedown", ".openDevButton", function (event) {
        var url = $(this).attr('id');
        event.stopImmediatePropagation();
        event.preventDefault();
        //window.open(url, '_blank');
    });

}); //  document ready

$(document).on("change", "#DevFSE", function () {
    popControl(myDocuments, "DevDocument", "Select Document...", $('#DevFSE').val());
    $('#DevDocument').val('0');
    $('#DevNumber').val('');
});

$(document).on("change", "#DevDocument", function () {
    let myDevs = myDeviations.filter(Deviation => Deviation[7] == $('#DevDocument').val());
    const myDocNumber = myDocuments.filter(Document => Document[0] == $('#DevDocument').val())[0][1];
    
    if (myDevs.length === 0) {
        
        $('#DevNumber').val(myDocNumber + "-DEV-001");
    } else {
        const latest = myDevs.sort(function (a, b) {
            const last = a[1];
            const next = b[1];
            return last > next ? -1 : 1;
        })[0][1];
        var myNum = pad(parseInt(latest.substring(latest.length - 3, latest.length)) + 1);
        $('#DevNumber').val(myDocNumber + "-DEV-" + myNum);
    }
});

function addNewDev() {

    var call = $.ajax({
        url: myURL + "DeviationTracking/_api/web/lists/getbytitle('DevInfo')/items",
        type: "POST",
        data: JSON.stringify({
            "__metadata": { type: "SP.Data.DevInfoListItem" },
            Title: $('#DevNumber').val() + '.docx',
            DevNumber: $('#DevNumber').val(),
            DevOpen: $('#DevOpen').val(),
            DevType: $('#DevType').val(),
            DevCategory: $('#DevCategory').val(),
            DevDocumentId: myDocuments.filter(Document => Document[0] == $('#DevDocument').val())[0][0]
        }),
        headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": myFormDigest
        }
    });

    call.done(function (data, textStatus, jqXHR) {
        alert('Success! \nDeviation ' + $('#DevNumber').val() + ' is being generated. \nPlease check back shortly.');
        $('#DevFSE').val('0');
        $('#DevDocument').val('0');
        $('#DevNumber').val('');
        $('#DevType').val('Select Type...');
        $('#DevCategory').val('Select Category...');
    });

    call.fail(function (jqXHR, textStatus, errorThrown) {
        alert('fail');
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : textStatus;
        console.log(message);
    });
}   // addNewDev

function resetPage() {
    $('#FSEs').val('0');
    $('#Documents').val('0');
    $('#filterStatusBoth').prop('checked', true);

    popDeviationList();

    updateChart();

}   //  resetPage

function updateChart() {

    switch ($('#chartType').val()) {
        case "chartDevType":
            var numMinor = myDeviations.filter(Deviation => Deviation[5] === "Minor").length;
            var numMajor = myDeviations.filter(Deviation => Deviation[5] === "Major").length;
            var numCritical = myDeviations.filter(Deviation => Deviation[5] === "Critical").length;
            var totalDev = numMinor + numMajor + numCritical;

            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                theme: "theme4",
                data: [{
                    type: "pie",
                    indexLabelFontFamily: "Garamond",
                    indexLabelFontSize: 14,
                    indexLabel: "{label} {y}%",
                    startAngle: -20,
                    showInLegend: false,
                    toolTipContent: "{legendText} {y}%",
                    dataPoints: [
                        { y: Math.round(100 * numMinor / totalDev), legendText: "Minor", label: "Minor" },
                        { y: Math.round(100 * numMajor / totalDev), legendText: "Major", label: "Major" },
                        { y: Math.round(100 * numCritical / totalDev), legendText: "Critical", label: "Critical" }
                    ]
                }]
            });
            break;

        case "chartDevCategory":
            var numTestFormError = myDeviations.filter(Deviation => Deviation[6] === "Test Form Error").length;
            var numFailuretoMeetAcceptanceCriterion = myDeviations.filter(Deviation => Deviation[6] === "Failure to Meet Acceptance Criterion").length;
            var numUnexpectedConditionsorTestResults = myDeviations.filter(Deviation => Deviation[6] === "Unexpected Conditions or Test Results").length;
            var numTestCannotBeCompletedasWritten = myDeviations.filter(Deviation => Deviation[6] === "Test Cannot Be Completed as Written").length;
            var numOther = myDeviations.filter(Deviation => Deviation[6] === "Other").length;
            var totalDev = numTestFormError + numFailuretoMeetAcceptanceCriterion + numUnexpectedConditionsorTestResults + numTestCannotBeCompletedasWritten + numOther;

            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                theme: "theme4",
                data: [{
                    type: "pie",
                    indexLabelFontFamily: "Garamond",
                    indexLabelFontSize: 14,
                    indexLabel: "{label} {y}%",
                    startAngle: -20,
                    showInLegend: false,
                    toolTipContent: "{legendText} {y}%",
                    dataPoints: [
                        { y: Math.round(100 * numTestFormError / totalDev), legendText: "Test Form Error", label: "Test Form Error" },
                        { y: Math.round(100 * numFailuretoMeetAcceptanceCriterion / totalDev), legendText: "Failure to Meet Acceptance Criterion", label: "Failure to Meet Acceptance Criterion" },
                        { y: Math.round(100 * numUnexpectedConditionsorTestResults / totalDev), legendText: "Unexpected Conditions or Test Results", label: "Unexpected Conditions or Test Results" },
                        { y: Math.round(100 * numTestCannotBeCompletedasWritten / totalDev), legendText: "Test Cannot Be Completed as Written", label: "Test Cannot Be Completed as Written" },
                        { y: Math.round(100 * numOther / totalDev), legendText: "Other", label: "Other" }
                    ]
                }]
            });
            break;
        case "chartDevOpenVsClosed":
            var numClosed = myDeviations.filter(Deviation => Deviation[4] != "Null").length;
            var totalDev = myDeviations.length;
            var numOpen = totalDev - numClosed;

            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,
                theme: "theme4",
                data: [{
                    type: "pie",
                    indexLabelFontFamily: "Garamond",
                    indexLabelFontSize: 14,
                    indexLabel: "{label} {y}%",
                    startAngle: -20,
                    showInLegend: false,
                    toolTipContent: "{legendText} {y}%",
                    dataPoints: [
                        { y: Math.round(100 * numOpen / totalDev), legendText: "Open", label: "Open" },
                        { y: Math.round(100 * numClosed / totalDev), legendText: "Closed", label: "Closed" },
                    ]
                }]
            });
            break;
    }

    chart.render();

}   //  updateChart

function getJson(endpointUrl, success, failure) {
    $.ajax({
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        url: endpointUrl,
        success: success,
        failure: failure
    });
}   //  getJson

function getFSEs(data) {
    myFSEs = data.d.results.map(FSE => [`${FSE.Id}`, `${FSE.FSEID}`, `${FSE.Title}`]);

    //  populate FSEs filter from array
    popControl(myFSEs, "FSEs", "All FSEs");
    //  populate New Dev Form dropdown from array
    popControl(myFSEs, "DevFSE", "Select FSE...");

    //  populate myDocs array from Documents list
    getJson(myURL + "DeviationTracking/_api/web/lists/getbytitle('Documents')/items", getDocuments, logError);

}   //  getFSEs

function getDocuments(data) {
    myDocuments = data.d.results.map(Document => [`${Document.Id}`, `${Document.DocNumber}`, `${Document.Title}`, `${Document.FSEIDId}`]);

    //  populate FSEs filter from array
    popControl(myDocuments, "Documents", "All Documents");
    //  populate New Dev Form dropdown from array
    popControl(myDocuments, "DevDocument", "Select Document...");

    //  populate myDocs array from Documents list
    getJson(myURL + "DeviationTracking/_api/web/lists/getbytitle('DevInfo')/items", getDeviations, logError);

}   //  getDocuments

function getDeviations(data) {
    myDeviations = data.d.results.map(Deviation =>[`${Deviation.Id}`, `${Deviation.DevNumber}`, `${Deviation.Description}`, `${Deviation.DevOpen}`, `${Deviation.DevClosed}`, `${Deviation.DevType}`, `${Deviation.DevCategory}`, `${Deviation.DevDocumentId}`]);

    popDeviationList();

    updateChart();

}   //  getDeviations

function popControl(arr, el, allText, filter) {
    var output = `<option value='0' selected='selected'>${allText}</option>`;

    for (var i = 0; i < arr.length; i++) {
        if (`${arr[i][3]}` == filter || !filter) {
            output += `<option value='${arr[i][0]}'>${arr[i][1]} ${arr[i][2]}</option>`;
        }   
    }

    $(`#${el}`).html(output);

}   //  popControl

function popDeviationList() {
    var myDevListOutput = "<div id='accordion'>";

    $.each(myDeviations, function (index) {
        var myOpenDate = myDeviations[index][3];
        var myClosedDate = myDeviations[index][4];
        var myDocTitle = myDocuments.filter(Document => Document[0] == myDeviations[index][7])[0][2];

        if (myOpenDate === "null") {
            myOpenDate = "";
        } else {
            myOpenDate = new Date(myOpenDate).toLocaleDateString();
        }

        if (myClosedDate === "null") {
            myClosedDate = "";
        } else {
            myClosedDate = new Date(myClosedDate).toLocaleDateString();
        }

        myDevListOutput += `<h3>${myDeviations[index][1]}`;
        myDevListOutput += `<span class='deleteDevButton ui-icon ui-icon-close' data-dev='${myDeviations[index][1]}'></span>`;
        myDevListOutput += `<span class='openDevButton ui-icon ui-icon-document' data-dev='${myDeviations[index][1]}'></span></br>`;
        myDevListOutput += `<span>${myDocTitle}</span></br>`;
        myDevListOutput += `<span><label>Opened:</label> ${myOpenDate}</span>`;
        myDevListOutput += `</h3>`;
        myDevListOutput += `<div>`;
        myDevListOutput += `<div><label>Closed:</label> ${myClosedDate}</div>`;
        myDevListOutput += `<div><label>Type:</label> ${myDeviations[index][5]}</div>`;
        myDevListOutput += `<div><label>Category:</label> ${myDeviations[index][6]}</div>`;
        myDevListOutput += `</div>`;
    });

    myDevListOutput += "</div>";
    $("#DeviationsContainer").html(myDevListOutput);

    $("#accordion").accordion({
        collapsible: true,
        active: false
    });

    $('#DeviationsLabel').html('Deviations (' + $("#accordion > h3").length + ')');

}   //  popDeviationList

function logError(error) {
    console.log(JSON.stringify(error));
}   //  logError

function pad(n) {
    if (n < 10) {
        return "00" + n;
    } else if (n < 100) {
        return "0" + n;
    } else {
        return n;
    }
}   // pad