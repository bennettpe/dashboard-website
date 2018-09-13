/* Load CSV Data */
      queue()
       .defer(d3.csv, "/data/2013 Sales Records.csv")
       .await(getData);
        
function getData(error, salesData) {
    
    /* Process data through crossfilter */
        var ndx = crossfilter(salesData); 
        var all = ndx.groupAll();
        
    /* Create the dc.js chart objects */ 
        var revenueSum              = dc.numberDisplay("#dc-total-revenue-display");
        var costSum                 = dc.numberDisplay("#dc-total-cost-display");
        var profitSum               = dc.numberDisplay("#dc-total-profit-display");
        var unitssoldsubregionChart = dc.rowChart("#dc-units-sold-sub-region-chart");
        var unitssolditemtypeChart  = dc.rowChart("#dc-units-sold-item-type-chart");
        var totalcostChart          = dc.barChart("#dc-total-cost-chart");
        var totalrevenueChart       = dc.barChart("#dc-total-revenue-chart");
        var totalprofitChart        = dc.barChart("#dc-total-profit-chart");
        var dataTable               = dc.dataTable("#dc-data-table");
        
    /* Format the time (d3.time.format) */
        var FormatDate      = d3.time.format('%d/%m/%Y');
        var FormatMonth     = d3.time.format('%m')
        var FormatMonthName = d3.time.format("%m.%b");
        var FormatYear      = d3.time.format('%Y');
                            
    /* Format the data */
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
        });

   /* groupAll function to sum up the values */
       var allDim                       = ndx.dimension(function(d) { return d; }); // Dimension by all
   
   /* groupAll function to sum up Total_Revenue,Total_Cost & Total_Profit values for dc.numberDisplay */       
       var sumAlltotals = allDim.groupAll().reduce( 
              function(p, v) {
                              p.revenueSum += v.Total_Revenue;
                              p.costSum    += v.Total_Cost;
                              p.profitSum  += v.Total_Profit;
                              return p;
                             },
              function(p, v) {
                              p.revenueSum -= v.Total_Revenue;
                              p.costSum    -= v.Total_Cost;
                              p.profitSum  -= v.Total_Profit;
                              return p;
                             },
              function ()    {return {revenueSum: 0, costSum: 0, profitSum: 0};
        });
        
    /* Create dc.numberDisplay */                   
            revenueSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"Total Revenue = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> £ %number    </strong> </span>",
                          none:"Total Revenue = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)    
                   .valueAccessor(function (d) {return d.revenueSum;});
                   
            costSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"Total Cost = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> £ %number    </strong> </span>",
                          none:"Total Cost = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)    
                   .valueAccessor(function (d) {return d.costSum;});
                   
            profitSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"Total Profit = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> £ %number    </strong> </span>",
                          none:"Total Profit = " + "<span style=\"color:steelblue; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)
                   .valueAccessor(function (d) {return d.profitSum;});       
    
   /* Create Dimensions and Groups for Sub_Region */
       var subRegionDim                 = ndx.dimension(function(d) { return d.Sub_Region; }),                          // Dimension by Sub-Region
           subRegionGroupCount          = subRegionDim.group(),                                                         // Count by Sub_Region 
           totalProfitBySubRegionGroup  = subRegionDim.group().reduceSum(function(d) { return d.Total_Profit;  }),      // Total_Profit by Sub_Region
           unitSoldBySubRegionGroup     = subRegionDim.group().reduceSum(function(d) { return d.Units_Sold;    }),      // Unit_Sold by Sub_Region
           totalRevenueBySubRegionGroup = subRegionDim.group().reduceSum(function(d) { return d.Total_Revenue; });      // Total_Revenue by Sub_Region 
    
    /* Create Dimensions and Groups for Country */                                     
       var countryDim                  = ndx.dimension(function(d) { return d.Country; }),                             // Dimension by Country
           countryGroupCount           = countryDim.group(),                                                           // Count by Country 
           totalProfitByCountryGroup   = countryDim.group().reduceSum(function(d) { return d.Total_Profit; }),         // Total_Profit by Country
           unitSoldByCountryGroup      = countryDim.group().reduceSum(function(d) { return d.Units_Sold;   });         // Unit_Sold by Country
    
    /* Create Dimensions and Groups for Item_Type */                                       
       var itemTypeDim                 = ndx.dimension(function(d) { return d.Item_Type; }),                           // Dimension by Item_Type
           itemTypeGroupCount          = itemTypeDim.group(),                                                          // Count by Item_Type
           totalProfitByItemTypeGroup  = itemTypeDim.group().reduceSum(function(d) { return d.Total_Profit; }),        // Total_Profit by Item_Type
           unitSoldByItemTypeGroup     = itemTypeDim.group().reduceSum(function(d) { return d.Units_Sold;   });        // Unit_Sold by Item_Type
    
    /* Create Dimensions and Groups for Order_Date */    
       var orderDateDim               = ndx.dimension(function(d) { return d.Order_Date_dt; });                        // Dimension by Order_Date_dt
       var orderDateGroupCount        = orderDateDim.group();                                                          // Count by Order_Date_dt
    
    /* Create Dimensions and Groups for Order_Date_Month */   
       var orderDateMonthDim          = ndx.dimension(function(d) { return d.Order_Date_Month; }),                     // Dimension by Order_Date_Month
           totalCostMonthGroupSum     = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Cost;    }),  // Sum Total_Cost by Order_Date_Month
           totalProfitMonthGroupSum   = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Profit;  }),  // Sum Total_Profit by Order_Date_Month
           totalRevenueMonthGroupSum  = orderDateMonthDim.group().reduceSum(function(d) { return d.Total_Revenue; });  // Sum Total_Revenue by Order_Date_Month
    
    /* Create Dimensions and Groups for Units_Sold */          
       var unitsSoldDim               = ndx.dimension(function(d) { return d.Units_Sold; });                           // Dimension by Units_Sold
       var unitsSoldGroupCount        = unitsSoldDim.group();                                                          // Count by Units_Sold
    
    // Print Filter Function Tip  
    // taken from the following artical  
    // https://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-1-Using-Crossfil  
    function print_filter(filter) {
    	var f=eval(filter);
    	if (typeof(f.length) != "undefined") {} else{}
    	if (typeof(f.top) != "undefined") {f=f.top(Infinity);} else{}
    	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);} else{}
    	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    } 
    
    /* Print Filter */ 
    // print_filter("sumAlltotalRevenueGroup");
    
    /* RowTip tooltip (d3.tip) */
      var rowTip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function (d) { return "<span style='color: #c6dbef'>" + d.key + "</span> : " + d.value;});
    
    /* create Order_Date range for Axis */ 
      var minOrderDate = orderDateDim.bottom(1)[0].Order_Date_dt;
      var maxOrderDate = orderDateDim.top(1)[0].Order_Date_dt;
      //console.log(minOrderDate);
      //console.log(maxOrderDate);
      
    /* create data count */
       dc.dataCount(".dc-data-count")
         .dimension(ndx)
         .group(all);
        
    /* Country Selection Menu */
       dc.selectMenu("#country-units-sold-selector")
         .dimension(countryDim)
         .group(unitSoldByCountryGroup);
        
    /* Units Sold by Sub_Region Chart */
        unitssoldsubregionChart
         .width(390).height(300)
         .dimension(subRegionDim)
         .group(unitSoldBySubRegionGroup)
         .colors(d3.scale.category20())
         .elasticX(true)
         .gap(1)
         .margins({top: 10, right: 20, bottom: 20, left: 20})
         .ordering(function(d) { return d.Sub_Region; })
         .xAxis().ticks(6);
       
    /* Units Sold by Item_Type Chart */
         unitssolditemtypeChart
          .width(390).height(300)
          .dimension(itemTypeDim)
          .elasticX(true)
          .group(unitSoldByItemTypeGroup)
          .colors(d3.scale.category20())
          .margins({top: 10, right: 10, bottom: 20, left: 20})
          .ordering(function(d) { return d.Item_Type; })
          .xAxis().ticks(6);
          
    /* Total_Revenue Chart */  
         totalrevenueChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalRevenueMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 70})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });      
         
    /* Total_Cost Chart */    
         totalcostChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalCostMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 70})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); }); 
          
    /* Total_Profit Chart */
         totalprofitChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalProfitMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 20, left: 60})
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });
          
    /* Create data table */
         dataTable
          .width(800).height(300)
          .dimension(allDim)
	   	  .group(function(d) { return ""; })
		  .columns([
		            function(d) { return d.Country;    },
					function(d) { return d.Item_Type;  },
					function(d) { return d.Order_Date; },
          	        function(d) { return d.Ship_Date;  },
          	        function(d) { return d.Units_Sold; },
          	        function(d) { return "£" + d3.format(".2f")   (+d.Unit_Price);    },
          	        function(d) { return "£" + d3.format(".2f")   (+d.Unit_Cost);     },
          	        function(d) { return "£" + d3.format(",.0f")  (+d.Total_Revenue); },
          	        function(d) { return "£" + d3.format(",.0f")  (+d.Total_Cost);    },
          	        function(d) { return "£" + d3.format(",.0f")  (+d.Total_Profit);  }
				  ])
		  .showGroups(false)
		  .size(25) // Default = 25
		  .sortBy(function (d) {return [d.Country,d.Item_Type].join(); })		   
		  .order(d3.ascending);
		  
    /* Render Charts */
        dc.renderAll();
     
    /* Set up the tool tips (d3.tip) */
        d3.selectAll("g.row").call(rowTip);
        d3.selectAll("g.row").on('mouseover', rowTip.show)
                             .on('mouseout',  rowTip.hide)

}    