<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Deviation Tracking</title>

    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" >
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" >
    <link rel="stylesheet" type="text/css" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="../Content/App.css" >

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
    <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    <script src="/_layouts/15/init.js"></script>
    <script src="../Scripts/App.js"></script>
    <script src="../Scripts/canvasjs.min.js"></script>
</head>
<body>

    <nav class="navbar navbar-default">
      <div class="container-fluid">

        <div class="navbar-header">
            <div class="staticMenu">
                <a class="navbar-brand" id="headerBrand" href="#">Deviations</a>
                <a class="navbar-brand" id="filterButton" href="#"><span class="fa fa-filter" aria-hidden="true"></span></a>
                <a class="navbar-brand" id="chartButton" href="#"><span class="fa fa-pie-chart" aria-hidden="true"></span></a>
            </div>
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>

        <div class="collapse navbar-collapse" id="bs-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li><a href="../Lists/FSEs">FSEs</a></li>
                <li><a href="../Lists/Documents">Documents</a></li>
                <li><a href="../Lists/Deviations">Deviations</a></li>
                <li class="bg-info" id="addNewDevButton"><a href="javascript:void(0)">Add New</a></li>
            </ul>
        </div>

      </div>
    </nav>

    <div class="container" role="main">
        <div class="row">
            <div id="filtersAndChart" class="col-md-6 col-xs-12">
                <div id="filters">
                    <div class="form-group dropdown">
                        <select class="form-control input-lg" id="FSEs">
                            <option value="0" selected="selected">All FSEs</option>
                        </select> 
                    </div>
                    <div class="form-group dropdown">
                        <select class="form-control input-lg" id="Documents">
                            <option value="0" selected="selected">All Documents</option>
                        </select> 
                    </div>
                    <div id="filterStatus" class="radio">
                        <label>
                            <input type="radio" name="openClosedBothRadios" id="filterStatusOpen" value="Open"> Open
                        </label> 
                        <label>
                            <input type="radio" name="openClosedBothRadios" id="filterStatusClosed" value="Closed"> Closed
                        </label>
                        <label>
                            <input type="radio" name="openClosedBothRadios" id="filterStatusBoth" value="Both" checked> Both
                        </label>
                    </div>
                    <button class="btn btn-default right" id="applyFilter" onclick="javascript:return false;">Apply</button>
                    <button class="btn btn-default right" id="resetFilter" onclick="javascript:return false;">Reset</button>
                </div>
                <div id="charts">
                    <select class="form-control" id="chartType">
                        <option value="chartDevOpenVsClosed">Items Open vs. Closed</option>
                        <option value="chartDevType">Items by Type</option>
                        <option value="chartDevCategory">Items by Category</option>
                    </select>
                    <div id="chartContainer"></div>     
                </div>
            </div>
            <div id="list" class="col-md-6 col-xs-12">
                <h1><label for="DeviationsContainer" id="DeviationsLabel">Deviations</label></h1>
                <div id="DeviationsContainer"></div>
            </div>
        </div>
    </div>

    <div id="addNewDeviation" title="Add New Deviation">
      <form>
        <fieldset>
          <select class="form-control" id="DevFSE"></select>
          <select class="form-control" id="DevDocument"></select>
          <input class="form-control" type="text" autocomplete="off" placeholder="Deviation number..." id="DevNumber">
          <input class="form-control" type="text" autocomplete="off" placeholder="Select Open Date..." id="DevOpen">
          <select class="form-control" id="DevType">
            <option>Select Type...</option>
            <option>Minor</option>
            <option>Major</option>
            <option>Critical</option>
          </select>
          <select class="form-control" id="DevCategory">
            <option>Select Category...</option>
            <option>Failure to Meet Acceptance Criterion</option>
            <option>Unexpected Conditions or Test Results</option>
            <option>Test Cannot Be Completed as Written</option>
            <option>Test Form Error</option>
            <option>Other</option>
          </select>
        </fieldset>
      </form>
    </div>

</body>

</html>
