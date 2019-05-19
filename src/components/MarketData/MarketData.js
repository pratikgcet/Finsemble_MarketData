import {Grid, BaseGridSerializingSession} from 'ag-grid-community';

var columnDefs = [
	{headerName: "Symbol", field: "symbol"},
	{headerName: "Company", field: "company",filter: false},
	{headerName: "Exchange", field: "exchange",filter: false},
	{headerName: "Sector", field: "sector",filter: false}
];
	// let the grid know which columns to use	  
var gridOptions = {
	defaultColDef: {editable: true, filter: true, sortable:true},
	columnDefs: columnDefs,
	rowSelection: 'single',
	//  singleClickEdit: true,
	 onSelectionChanged: onSelectionChanged,
	
};

function GetData()
{ 
	// lookup the container we want the Grid to use
	var eGridDiv = document.querySelector('#myGrid');

	// create the grid passing in the div to use together with the columns & data we want to use
	new Grid(eGridDiv, gridOptions);
	var listofStocks = "AAPL,FB,MSFT,VOD,BT";
	var rowdata=[];
	var url="https://api.iextrading.com/1.0/stock/market/batch?symbols="+listofStocks+"&types=quote";
	var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
						var httpResult = JSON.parse(httpRequest.responseText);
						
            for (var key in httpResult) {
                if (httpResult.hasOwnProperty(key)) {
									rowdata.push({symbol:httpResult[key].quote.symbol,company:httpResult[key].quote.companyName,
										exchange:httpResult[key].quote.primaryExchange, sector:httpResult[key].quote.sector});
                    
                }
						}
            gridOptions.api.setRowData(rowdata);
        }
	};
}

function onSelectionChanged() {
	var selectedRows = gridOptions.api.getSelectedRows();
	var selectedRowsString = '';
	selectedRows.forEach( function(selectedRow, index) {
			if (index!==0) {
					selectedRowsString += ', ';
			}
			selectedRowsString += selectedRow.symbol;
	});
	document.querySelector('#selectedRows').innerHTML = selectedRowsString  ;
	FSBL.Clients.RouterClient.transmit("Symbol", selectedRowsString);
}

const FSBLReady = () => {
	try {
		FSBL.Clients.WindowClient.setWindowTitle("Stock Information");
		GetData();
		// Do things with FSBL in here.
		
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
