/****************************************/ 
/ Load CSV Data                          /
/****************************************/
queue()
    .defer(d3.csv, "/data/2013 Sales Records.csv")
    .await(getData);
        
function getData(error, salesData) {
    
    /****************************************/ 
    / Process data through crossfilter       /
    /****************************************/
        var ndx = crossfilter(salesData); 
        var all = ndx.groupAll();
        
    /****************************************/    
    / Create the dc.js chart objects         / 
    /****************************************/
        //var totalProfitSum     = dc.numberDisplay("#dc-total-profit-sum");
        
        var  unitssoldsubregionChart     = dc.rowChart("#dc-units-sold-sub-region-chart");
        var  unitssolditemtypeChart      = dc.rowChart("#dc-units-sold-item-type-chart");
        var  totalcostChart              = dc.barChart("#dc-total-cost-chart");
        var  totalrevenueChart           = dc.barChart("#dc-total-revenue-chart");
        var  totalprofitChart            = dc.barChart("#dc-total-profit-chart");
        var  dataTable                   = dc.dataTable("#dc-data-table");
        
    /****************************************/
    / Format the time (d3.time.format)       /
    /****************************************/
        var FormatDate      = d3.time.format('%d/%m/%Y');
        var FormatMonth     = d3.time.format('%m')
        var FormatMonthName = d3.time.format("%m.%b");
        var FormatYear      = d3.time.format('%Y');
                            
    /****************************************/
    / Format the data                        /
    /****************************************/
        salesData.forEach(function(d) {
           d.Order_Date_dt    = FormatDate.parse(d.Order_Date);
           d.Order_Date_Month = FormatMonthName(d.Order_Date_dt);
           d.Order_Date_Year  = FormatYear(d.Order_Date_dt);
           d.Ship_Date_dt     = FormatDate.parse(d.Ship_Date);
           d.Ship_Date_Month  = FormatMonth(d.Order_Date_dt);
           d.Ship_Date_Year   = FormatYear(d.Ship_Date_dt);
           d.Order_ID         = +d.Order_ID; 
           d.Total_Cost       = +d.Total_Cost;
           d.Total_Profit     = +d.Total_Profit;
           d.Total_Revenue    = +d.Total_Revenue;
           d.Unit_Cost        = +d.Unit_Cost;
           d.Unit_Price       = +d.Unit_Price;
           d.Units_Sold       = +d.Units_Sold; 
       //  d.Total_Cost       = d3.format("0f")(+d.Total_Cost); // Remove Decimal Points
        });

   /*****************************************/
   / Create Dimensions and Groups for charts /
   /*****************************************/
       var allDim                      = ndx.dimension(function(d) { return d; });                                     // Dimension by all
   
   /*********************************************/
   / Create Dimensions and Groups for Sub_Region /
   /*********************************************/   
       var subRegionDim                = ndx.dimension(function(d) { return d.Sub_Region; }),                          // Dimension by Sub-Region
           subRegionGroupCount         = subRegionDim.group(),                                                         // Count by Sub_Region 
           totalProfitBySubRegionGroup = subRegionDim.group().reduceSum(function(d) { return d.Total_Profit; }),       // Total_Profit by Sub_Region
           unitSoldBySubRegionGroup    = subRegionDim.group().reduceSum(function(d) { return d.Units_Sold; });         // Unit_Sold by Sub_Region
   
   / Top20 for Sub_Region /
       var top20TotalProfitBySubRegion = totalProfitBySubRegionGroup.top(20);                                          // Top 20 by Total_Profit
                                         top20TotalProfitBySubRegion[0].key;                                           // the top Total_Profit Sub_Region
                                         top20TotalProfitBySubRegion[0].value;                                         // the Total_Profit for that Sub_Region  
           
       var top20UnitSoldBySubRegion    = unitSoldBySubRegionGroup.top(20);                                             // Top 20 by Unit_Sold
                                         top20UnitSoldBySubRegion[0].key;                                              // the top Unit_Sold Sub_Region
                                         top20UnitSoldBySubRegion[0].value;                                            // the Unit value for that Sub_Region                                  
                                         
       var countryDim                 = ndx.dimension(function(d) { return d.Country; });                              // Dimension by Country
       var countryGroupCount          = countryDim.group();                                                            // Count by Country 
       
       var itemTypeDim                = ndx.dimension(function(d) { return d.Item_Type; });                            // Dimension by Item_Type
       var itemTypeGroupCount         = itemTypeDim.group();                                                           // Count by Item_Type
  
       var orderDateDim               = ndx.dimension(function(d) { return d.Order_Date_dt; });                        // Dimension by Order_Date_dt
       var orderDateGroupCount        = orderDateDim.group();                                                          // Count by Order_Date_dt
       
       var orderDateMonthDim          = ndx.dimension(function(d) { return d.Order_Date_Month; }),                     // Dimension by Order_Date_Month
           totalCostMonthGroupSum     = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Cost; }),     // Sum Total_Cost by Order_Date_Month
           totalProfitMonthGroupSum   = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Profit; }),   // Sum Total_Profit by Order_Date_Month
           totalRevenueMonthGroupSum  = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Revenue; });  // Sum Total_Revenue by Order_Date_Month
            
       var unitsSoldDim               = ndx.dimension(function(d) { return d.Units_Sold; });                           // Dimension by Units_Sold
       var unitsSoldGroupCount        = unitsSoldDim.group();                                                          // Count by Units_Sold
       
   /******************************************/
   / Total Profits by Country & Top 20        /
   /******************************************/         
       var totalProfitByCountryGroup    = countryDim.group().reduceSum(function(d) { return d.Total_Profit; }),  // Total_Profit by Country
           top20TotalProfitByCountry    = totalProfitByCountryGroup.top(20);                                     // Top 20 by Total_Profit
                                          top20TotalProfitByCountry[0].key;                                      // the top payment Country
                                          top20TotalProfitByCountry[0].value;                                    // the payment volume for that Country                                       
   /******************************************/
   / Total Profits by Item_Type & Top 20      /
   /******************************************/        
       var totalProfitByItemTypeGroup   = itemTypeDim.group().reduceSum(function(d) { return d.Total_Profit; }),  // Total_Profit by Item_Type
           top20TotalProfitByItemTypes  = totalProfitByItemTypeGroup.top(20);                                     // Top 20 by Total_Profit
                                          top20TotalProfitByItemTypes[0].key;                                     // the top payment Item_Type
                                          top20TotalProfitByItemTypes[0].value;                                   // the payment volume for that Item_Type  
   /******************************************/
   / Total Revenue by Sub_Region & Top 20     /
   /******************************************/ 
       var totalRevenueBySubRegionGroup  = subRegionDim.group().reduceSum(function(d) { return d.Total_Revenue; }), // Total_Revenue by Sub_Region
           top20TotalRevenueBySubRegion  = totalRevenueBySubRegionGroup.top(20);                                    // Top 20 by Total_Revenue
                                           top20TotalRevenueBySubRegion[0].key;                                     // the top Total_Revenue Sub_Region
                                           top20TotalRevenueBySubRegion[0].value;                                   // the Total_Revenue for that Sub_Region     
                                           
   /******************************************/
   / Units Sold by Country & Top 20           /
   /******************************************/  
       var unitSoldByCountryGroup        = countryDim.group().reduceSum(function(d) { return d.Units_Sold; }),     // Unit_Sold by Country
           top20UnitSoldByCountry        = unitSoldByCountryGroup.top(200);                                        // Top 20 by Unit_Sold
                                           top20UnitSoldBySubRegion[0].key;                                        // the top Unit_Sold Country
                                           top20UnitSoldBySubRegion[0].value;                                      // the Unit value for that Country                                    
   /******************************************/
   / Units Sold by Item_Type & Top 20         /
   /******************************************/   
       var unitSoldByItemTypeGroup       = itemTypeDim.group().reduceSum(function(d) { return d.Units_Sold; }),    // Unit_Sold by Item_Type
           top20UnitSoldByItemType       = unitSoldByItemTypeGroup.top(20);                                        // Top 20 by Unit_Sold
                                           top20UnitSoldByItemType[0].key;                                         // the top Unit_Sold Item_Type
                                           top20UnitSoldByItemType[0].value;                                       // the Unit value for that Item_Type 

    //--------------------------  
    // Print Filter Function Tip
    // taken from the following artical
    // https://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-1-Using-Crossfil
    //-----------------------------------------------------------------------------------------------      
    function print_filter(filter) {
    	var f=eval(filter);
    	if (typeof(f.length) != "undefined") {} else{}
    	if (typeof(f.top) != "undefined") {f=f.top(Infinity);} else{}
    	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);} else{}
    	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    } 
    
    //-------------
    // Print Filter 
    //-------------
    //  print_filter("totalsMonthGroupSum");
     
    /******************************************/
    / RowTip tooltip (d3.tip)                  /
    /******************************************/
      var rowTip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function (d) { return "<span style='color: #c6dbef'>" + d.key + "</span> : " + d.value;});
    
    //---------------------------------   
    // create Order_Date range for Axis   
    //---------------------------------
      var minOrderDate = orderDateDim.bottom(1)[0].Order_Date_dt;
      var maxOrderDate = orderDateDim.top(1)[0].Order_Date_dt;
      //console.log(minOrderDate);
      //console.log(maxOrderDate);
      
    /******************************************/
    / create data count                        /
    /******************************************/
      dc.dataCount(".dc-data-count")
        .dimension(ndx)
        .group(all);
        
    /******************************************/
    / Country Selection Menu (unitsSold)       /
    /******************************************/
      dc.selectMenu("#country-units-sold-selector")
        .dimension(countryDim)
        .group(unitSoldByCountryGroup);
        
    //-------------------------------
    // Units Sold by Sub_Region Chart 
    //-------------------------------
       unitssoldsubregionChart
         .width(400).height(250)
         .dimension(subRegionDim)
         .group(unitSoldBySubRegionGroup)
         .colors(d3.scale.category20())
         .elasticX(true)
         .margins({top: 10, right: 10, bottom: 20, left: 30})
         .ordering(function(d) { return d.Sub_Region; })
         .xAxis().ticks(6);
       
    //------------------------------
    // Units Sold by Item_Type Chart 
    //------------------------------
        unitssolditemtypeChart
         .width(400).height(250)
         .dimension(itemTypeDim)
         .elasticX(true)
         .group(unitSoldByItemTypeGroup)
         .colors(d3.scale.category20())
         .margins({top: 10, right: 10, bottom: 20, left: 30})
         .ordering(function(d) { return d.Item_Type; })
         .xAxis().ticks(6);
         
    //-------------------
    // Total_Profit Chart 
    //-------------------     
         totalprofitChart 
          .width(400).height(300)
          .dimension(orderDateMonthDim)
          .group(totalProfitMonthGroupSum)
          .elasticX(true)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 60})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });
          
    //-------------------
    // Total_Cost Chart 
    //-------------------     
         totalcostChart 
          .width(400).height(300)
          .dimension(orderDateMonthDim)
          .group(totalCostMonthGroupSum)
          .elasticX(true)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 70})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });     
          
    //-------------------
    // Total_Revenue Chart 
    //-------------------     
         totalrevenueChart 
          .width(400).height(300)
          .dimension(orderDateMonthDim)
          .group(totalRevenueMonthGroupSum)
          .elasticX(true)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 70})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });
          
    /******************************************/
    / Create data table                        /
    /******************************************/
         dataTable
          .width(800).height(300)
          .dimension(allDim)
	   	  .group(function(d) { return ""; })
		  .size(25) // Default = 25
		  .columns([
		            function(d) { return d.Country; },
					function(d) { return d.Item_Type; },
					function(d) { return d.Order_Date; },
          	        function(d) { return d.Ship_Date; },
          	        function(d) { return d.Units_Sold; },
          	        function(d) { return "£" + d3.format(".2f") (+d.Unit_Price);   },
          	        function(d) { return "£" + d3.format(".2f") (+d.Unit_Cost);    },
          	        function(d) { return "£" + d3.format("0f") (+d.Total_Revenue); },
          	        function(d) { return "£" + d3.format("0f") (+d.Total_Cost);    },
          	        function(d) { return "£" + d3.format("0f") (+d.Total_Profit);  }
				   ])
		  .sortBy(function (d) {return [d.Country,d.Item_Type].join(); })		   
		  .order(d3.ascending);
		  
    /******************************************/
    / Render Charts                            /
    /******************************************/
        dc.renderAll();
     
    /******************************************/  
    
    / Set up the tool tips (d3.tip)            /
    /******************************************/
        d3.selectAll("g.row").call(rowTip);
        d3.selectAll("g.row").on('mouseover', rowTip.show)
                             .on('mouseout',  rowTip.hide)

}    