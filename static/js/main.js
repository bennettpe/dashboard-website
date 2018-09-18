/* Load CSV Data */
      queue()
       .defer(d3.csv, "/data/2013 Sales Records.csv")
       .await(getData);
        
function getData(error, salesData) {
    
    /* Process data through crossfilter */
        var ndx = crossfilter(salesData); 
        var all = ndx.groupAll();
        
    /* Create the dc.js chart objects */ 
            costSum                 = dc.numberDisplay  ("#dc-total-cost-display");
            profitSum               = dc.numberDisplay  ("#dc-total-profit-display");
            revenueSum              = dc.numberDisplay  ("#dc-total-revenue-display");
            unitCountSum            = dc.numberDisplay  ("#dc-total-unit-count-display");
            unitssoldsubregionChart = dc.rowChart       ("#dc-units-sold-sub-region-chart");
            unitssoldcountryMenu    = dc.selectMenu     ("#country-units-sold-selector")
            unitssolditemtypeChart  = dc.rowChart       ("#dc-units-sold-item-type-chart");
            totalunitssoldChart     = dc.rowChart       ("#dc-total-units-sold-chart");
            totalrevenueChart       = dc.barChart       ("#dc-total-revenue-chart");
            totalcostChart          = dc.barChart       ("#dc-total-cost-chart");
            totalprofitChart        = dc.barChart       ("#dc-total-profit-chart");
            totalsChart             = dc.compositeChart ("#dc-totals-chart");
            dataTable               = dc.dataTable      ("#dc-data-table");
        
    /* Format the time (d3.time.format) */
        var FormatDate        = d3.time.format('%d/%m/%Y');
        var FormatMonth       = d3.time.format('%m');
        var FormatMonthName   = d3.time.format("%m.%b");
        var FormatYear        = d3.time.format('%Y');
                            
    /* Format the data */
        salesData.forEach(function(d) {
           d.Order_Date_dt    = FormatDate.parse(d.Order_Date);
           d.Order_Date_Month = FormatMonthName(d.Order_Date_dt);
           d.Order_Date_Year  = FormatYear(d.Order_Date_dt);
           d.Ship_Date_dt     = FormatDate.parse(d.Ship_Date);
           d.Ship_Date_Month  = FormatMonthName(d.Order_Date_dt);
           d.Ship_Date_Year   = FormatYear(d.Ship_Date_dt);
           d.Order_ID         = +d.Order_ID; 
           d.Total_Cost       = +d.Total_Cost;
           d.Total_Profit     = +d.Total_Profit;
           d.Total_Revenue    = +d.Total_Revenue;
           d.Unit_Cost        = +d.Unit_Cost;
           d.Unit_Price       = +d.Unit_Price;
           d.Units_Sold       = +d.Units_Sold;
        });

    /* Ordinal Colors */  
        var SchemeSet3  = (["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",  
                            "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);
                            
   /* groupAll function to sum up the values */
       var allDim = ndx.dimension(function(d) { return d; });  
   
   /* groupAll function to sum up values for dc.numberDisplay(s) */       
       var sumAlltotals = allDim.groupAll().reduce( 
              function(p, v) {
                              p.unitCountSum  += v.Units_Sold
                              p.revenueSum    += v.Total_Revenue;
                              p.costSum       += v.Total_Cost;
                              p.profitSum     += v.Total_Profit;
                              return p;
              },
              function(p, v) {
                              p.unitCountSum  -= v.Units_Sold
                              p.revenueSum    -= v.Total_Revenue;
                              p.costSum       -= v.Total_Cost;
                              p.profitSum     -= v.Total_Profit;
                              return p;
              },
              function ()    {
                              return { unitCountSum: 0, revenueSum: 0, costSum: 0, profitSum: 0 }
              });
        
    /* Create dc.numberDisplay(s) */                   
            costSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"&nbsp Total Cost =" + "<span style=\"color:#DC143C; font-size: 16px;\"> <strong> £%number     </strong> </span>",
                          none:"&nbsp Total Cost =" + "<span style=\"color:#DC143C; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)    
                   .valueAccessor(function (d) { return d.costSum; });
                   
            profitSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"&nbsp Total Profit =" + "<span style=\"color:#556B2F; font-size: 16px;\"> <strong> £%number     </strong> </span>",
                          none:"&nbsp Total Profit =" + "<span style=\"color:#556B2F; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)
                   .valueAccessor(function (d) { return d.profitSum; });  
                   
          revenueSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"&nbsp Total Revenue =" + "<span style=\"color:#6495ED; font-size: 16px;\"> <strong> £%number     </strong> </span>",
                          none:"&nbsp Total Revenue =" + "<span style=\"color:#6495ED; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(500)    
                   .valueAccessor(function (d) { return d.revenueSum; });
                   
           unitCountSum
                   .group(sumAlltotals)
                   .formatNumber(d3.format(",.0f"))
                   .html({
                          some:"&nbsp Total Units Sold =" + "<span style=\"color:#6495ED; font-size: 16px;\"> <strong> %number      </strong> </span>",
                          none:"&nbsp Total Units Sold =" + "<span style=\"color:#6495ED; font-size: 16px;\"> <strong> Zero Records </strong> </span>"
                        })
                   .transitionDuration(1000)
                   .valueAccessor(function (d) { return d.unitCountSum; });         
    
   /* Create Dimensions and Groups for Sub_Region */
       var subRegionDim                = ndx.dimension(function(d) { return d.Sub_Region; }),                  // Dimension by Sub-Region
           unitSoldBySubRegionGroup    = subRegionDim.group().reduceSum(function(d) { return d.Units_Sold; }); // Unit_Sold by Sub_Region
    
    /* Create Dimensions and Groups for Country */                                     
       var countryDim                  = ndx.dimension(function(d) { return d.Country; }),                     // Dimension by Country
           unitSoldByCountryGroup      = countryDim.group().reduceSum(function(d) { return d.Units_Sold; });   // Unit_Sold by Country
    
    /* Create Dimensions and Groups for Item_Type */                                       
       var itemTypeDim                 = ndx.dimension(function(d) { return d.Item_Type; }),                   // Dimension by Item_Type
           unitSoldByItemTypeGroup     = itemTypeDim.group().reduceSum(function(d) { return d.Units_Sold; });  // Unit_Sold by Item_Type
    
    /* Create Dimensions and Groups for Order_Date_Month */   
       var orderDateMonthDim          = ndx.dimension(function(d) { return d.Order_Date_Month; }),                                         // Dimension by Order_Date_Month
           unitSoldbyMonthGroupSum    = orderDateMonthDim.group().reduceSum(function(d) { return d3.format(".0f") (+d.Units_Sold);    }),  // Sum Units_Sold by Order_Date_Month
           totalCostMonthGroupSum     = orderDateMonthDim.group().reduceSum(function(d) { return d3.format(".0f") (+d.Total_Cost);    }),  // Sum Total_Cost by Order_Date_Month
           totalProfitMonthGroupSum   = orderDateMonthDim.group().reduceSum(function(d) { return d3.format(".0f") (+d.Total_Profit);  }),  // Sum Total_Profit by Order_Date_Month
           totalRevenueMonthGroupSum  = orderDateMonthDim.group().reduceSum(function(d) { return d3.format(".0f") (+d.Total_Revenue); });  // Sum Total_Revenue by Order_Date_Month
        
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
       print_filter("sumAlltotals");
    
    /* create data count */
       dc.dataCount(".dc-data-count")
         .dimension(ndx)
         .group(all)
         .html({
                some: "<span style=\"color:#6495ED;\"> <strong> %filter-count </strong> </span> selected out of <span style=\"color:#6495ED;\"> <strong> %total-count </strong> </span> records " + 
                      " <a href=\"javascript:dc.filterAll(); dc.renderAll();\"> &nbsp; <i> Reset All Filters </i>  </a> ",
                 all: "All" +  "<span style=\"color:#6495ED;\"> <strong> %total-count </strong> </span> records selected, Please click on graph(s) to apply filters."
              });
              
    /* Country Selection Menu */
       unitssoldcountryMenu
         .dimension(countryDim)
         .group(unitSoldByCountryGroup)
         .promptText('Select All Countries');
    
    /* Units Sold by Sub_Region Chart */ 
       unitssoldsubregionChart
         .width(390).height(300)
         .dimension(subRegionDim)
         .group(unitSoldBySubRegionGroup)
         .ordinalColors(SchemeSet3)
         .elasticX(true)
         .gap(1)
         .margins({top: 10, right: 20, bottom: 30, left: 20})
         .ordering(function(d) { return d.Sub_Region; })
         .title(function(d){ return "Units Sold: " + d3.format(",") (+d.value); })
         .xAxis().ticks(6);
       
    /* Units Sold by Item_Type Chart */
         unitssolditemtypeChart
          .width(390).height(300)
          .dimension(itemTypeDim)
          .elasticX(true)
          .group(unitSoldByItemTypeGroup)
          .ordinalColors(SchemeSet3)
          .margins({top: 10, right: 10, bottom: 30, left: 20})
          .ordering(function(d) { return d.Item_Type; })
          .title(function(d){ return "Units Sold: " + d3.format(",") (+d.value); })
          .xAxis().ticks(6);
          
    /* Units Sold by Month Chart */
         totalunitssoldChart
          .width(585).height(300)
          .dimension(orderDateMonthDim)
          .group(unitSoldbyMonthGroupSum)
          .ordinalColors(SchemeSet3)
          .elasticX(true)
          .ordering(function(d) { return d.key; }) 
          .margins({top: 10, right: 10, bottom: 30, left: 20})
          .title(function(d){ return "Monthly Units Sold: " + d3.format(",") (+d.value); })
          .xAxis().ticks(6);
            
    /* Total_Revenue by Month Chart */  
         totalrevenueChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalRevenueMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 30, left: 70})
          .title(function(d){ return "Monthly Revenue: " + "£" + d3.format(",") (+d.value); })
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });      
         
    /* Total_Cost by Month Chart */    
         totalcostChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalCostMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 30, left: 70})
          .title(function(d){ return "Monthly Costs: " + "£" + d3.format(",") (+d.value); })
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); }); 
          
    /* Total_Profit by Month Chart */
         totalprofitChart 
          .width(390).height(300)
          .dimension(orderDateMonthDim)
          .group(totalProfitMonthGroupSum)
          .elasticY(true)
          .margins({top: 10, right: 10, bottom: 30, left: 70})
          .title(function(d){ return "Monthly Profit: " + "£" + d3.format(",") (+d.value); })
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // NOTE: substr(3) gets MMM from FormatMonthName "%m.%b" for i.e 01.Jan
          .xAxis().tickFormat(function(d){ return d.substr(3); });
 
    /* Create data table */
         dataTable
          .width(780).height(300)    
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
	      .order(d3.descending)	
	      .showGroups(false)
		  .size(Infinity) // Default = 25
		  //.size(20) // Default = 25
		  .sortBy(function (d) { return d.Total_Profit; });
		  
	   //  .sortBy(function (d) {return [d.Country,d.Item_Type].join(); });
   	       
    /* Create Totals by Month Chart */
  	     totalsChart
          .width(585).height(300)                                                               
	      .dimension(orderDateMonthDim) 
          .group(totalCostMonthGroupSum)                             
          .elasticY(true)
          .legend(dc.legend().x(90).y(0).itemHeight(15))
          .margins({top: 10, right: 10, bottom: 30, left: 70})
          ._rangeBandPadding(1)
          .renderHorizontalGridLines(true)
         .transitionDuration(1000)
	     .x(d3.scale.ordinal()) 
	     .xUnits(dc.units.ordinal) 
	   //.y(d3.scale.linear().domain([ d3.min(function(d) { return d.value; }), d3.max(function(d) { return d.value }) ]))
	   //.yaxis().tickFormat(function(d) {return "£" + formatNumber(d, 1000, "k"); })
	
   	     .compose([ 
	               dc.lineChart(totalsChart)
                     .group(totalRevenueMonthGroupSum, 'Monthly Revenue')
                     .interpolate("monotone") 
                     .ordinalColors(["#6495ED"])
                     .valueAccessor(function(d) {return d.value; }), 
                
                   dc.lineChart(totalsChart)
                     .group(totalCostMonthGroupSum, 'Monthly Costs')
                     //.dashStyle([2,2])
                     .interpolate("monotone") 
                     .ordinalColors(["#DC143C"])
                     .renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 0.0})
                     .title(function(d){ return "Monthly Costs: " + "£" + d3.format(",") (+d.value); })
                     .valueAccessor(function(d) { return d.value; }),
            
                   dc.lineChart(totalsChart)
                     .group(totalProfitMonthGroupSum, 'Monthly Profit')
                     //.dashStyle([3,2])
                     .interpolate("monotone") 
                     .ordinalColors(["#556B2F"])
                     .valueAccessor(function(d) {return d.value; }),
                 ]); 
             
    /* Render Charts */
        dc.renderAll(); 
}  
