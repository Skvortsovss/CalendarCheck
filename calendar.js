var workingDays = 0;
var holidays = 0;
var numDays = 0;

var XMLHttpRequest
  = XMLHttpRequest || require('xmlhttprequest').XMLHttpRequest;
  

function requestInfoForAllDates (n, cb) 
{
	var latch = makeLatch(n, cb);

	var day=new Date(document.getElementById("startDate").value);
	makeURLs(n).map(function (url, i) {
		startXMLRequest('GET', url, latch.bind(undefined, i));
	});

}

function makeLatch (n, cb) {

  var remaining = n,
      results = [],
      countDown;

  countDown = function (i, result) {
    results[i] = result;
    if (--remaining == 0 && typeof cb == 'function') {
      cb(results);
    }
  }

  return countDown;
}

function startXMLRequest (method, url, cb) 
{
  var xmlRequest = createXMLRequest();

  xmlRequest.onreadystatechange = function () {
    if (isXMLFinished(xmlRequest)) {
      if (cb && typeof cb == 'function') {
        cb(xmlRequest, method, url);
      }
    }
  }

  xmlRequest.open(method, url, true);
  xmlRequest.send();

  return xmlRequest;
}

function createXMLRequest () 
{
  var xmlRequest;

  if (XMLHttpRequest) {
    xmlRequest = new XMLHttpRequest();
  } else {
    xmlRequest = new ActiveXObject('Microsoft.XMLHTTP');
  }

  return xmlRequest;
}

function isXMLFinished (xmlRequest)
{
  return (xmlRequest.readyState == 4) && (xmlRequest.status == 200);
}

function validateDates() 
{
  numDays= getNumDays();
  if (numDays > 0)
  {
	requestInfoForAllDates(numDays, function(requests) {
		// Take out the responses, they are collected in the order they were
		// requested.
		responses = requests.map(function(request) {
		return request.responseText;
		});
		for (var i=0; i<numDays; i++)
		{
			var info = eval ( "(" + responses[i] + ")" );
			if (info.holiday == false)
			{
				workingDays+=1;
			}
			else
			{
				holidays+=1;
			}
		}

		showResults();
	});
  }
  else
  {
	document.getElementById("error").innerHTML = "ERROR!";
  }
}

function getNumDays()
{
	var startDate=new Date(document.getElementById("startDate").value);
	var endDate=new Date(document.getElementById("endDate").value);
	var numDays = -1
	
	if (endDate && startDate &&(endDate > startDate))
	{
		numDays = parseInt((endDate - startDate) / (86400 * 1000)) + 1;
		document.getElementById("Days").innerHTML = "You want to rest for " + numDays + " days";	
	}
	else if (startDate && isNaN(endDate))
	{
		numDays = 1;
		document.getElementById("Days").innerHTML = "You want to rest for 1 day";	
	}
	else
	{
		document.getElementById("error").innerHTML = "You entered invalid date range!";
	}
	return numDays;
}

function makeURLs (n) 
{
	var i, dateURL = [];
	var day=new Date(document.getElementById("startDate").value);
	var dt=day.getDate();
	var mn=day.getMonth() + 1;
	var yy=day.getFullYear();
	var date = yy+"-"+mn+"-"+dt;

	for (i = 1; i <= n; i++) 
	{
		dateURL.push("https://datazen.katren.ru/calendar/day/" + date + "/");
		var nextDay = nextDays(day);
		day = nextDay.day1;
		date = nextDay.date
	}

  return dateURL;
}

var nextDays = function (day){
	var nextDay = new Date(day);
	nextDay.setDate(day.getDate()+1)
	dt=nextDay.getDate();
	mn=nextDay.getMonth() + 1;
	yy=nextDay.getFullYear();
	
	var date = yy+"-"+mn+"-"+dt;
	return {
		date: date, 
		day1: nextDay
	};
};

function showResults()
{
	document.getElementById("WDays").innerHTML = "Working Days: " + workingDays;
	document.getElementById("HDays").innerHTML = "Holidays: " + holidays;	
	workingDays = 0;
	holidays = 0;
}