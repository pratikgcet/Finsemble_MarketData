import {Grid} from 'ag-grid-community';

var rowdata=[];
var columnDefs = [
	{headerName: "Date", field: "date"},
	{headerName: "Open", field: "open"},
	{headerName: "High", field: "high"},
	{headerName: "Low", field: "low"},
	{headerName: "Close", field: "close"},
	{headerName: "Volume", field: "volume"},
	{headerName: "Dividend", field: "dividend"}
];  
  // let the grid know which columns to use	  
  var gridOptions = {
	defaultColDef: {editable: true},
	columnDefs: columnDefs,
	rowSelection: 'single',
	rowdata:rowdata,
	// onGridReady: function (params) {
        
    //     params.api.setRowData(rowdata);
    // }
};

function GetData(data)
{
	rowdata=[];
	var url="https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+data+"&apikey=O6DBD3Y16249QWMU"
	var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
			var httpResult = JSON.parse(httpRequest.responseText);
						
            for (var key in httpResult['Time Series (Daily)']) {
                    
                var open=httpResult['Time Series (Daily)'][key]['1. open'];
                var high=httpResult['Time Series (Daily)'][key]['2. high'];
                var low=httpResult['Time Series (Daily)'][key]['3. low'];
                var close=httpResult['Time Series (Daily)'][key]['4. close'];
                var volume=httpResult['Time Series (Daily)'][key]['6. volume'];
                var dividend=httpResult['Time Series (Daily)'][key]['7. dividend amount'];
                rowdata.push({date:key,open:open,high:high,low:low,close:close,volume:volume,dividend:dividend});
			}
			var params = {
				force: true
			};
			gridOptions.api.setRowData(rowdata);
			gridOptions.api.refreshCells(params);
			
        }
	};
}

const FSBLReady = () => {
	try {
		FSBL.Clients.WindowClient.setWindowTitle("Time Series Data");
		// lookup the container we want the Grid to use
		var eGridDiv = document.querySelector('#myGrid');

		// create the grid passing in the div to use together with the columns & data we want to use
		new Grid(eGridDiv, gridOptions);
		FSBL.Clients.RouterClient.addListener("Symbol", function(err,notify) {
		
		GetData(notify.data);
	});
		
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
