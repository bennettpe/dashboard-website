// Load CSV Data 
queue()
     .defer(d3.csv, "./data/2013 Sales Records.csv")
     .await(getData);

function getData(error, salesData) {

     // Process data through crossfilter 
     var ndx = crossfilter(salesData);
     var all = ndx.groupAll();

     // Colors and color scales 
     var SchemeSet3 = [
          "#8dd3c7", // Monte Carlo
          "#ffffb3", // Portafino
          "#bebada", // Lavender Gray
          "#fb8072", // Salmon
          "#80b1d3", // Half Baked
          "#fdb462", // Koromiko
          "#b3de69", // Yellow Green
          "#fccde5", // Classic Rose
          "#d9d9d9", // Alto
          "#bc80bd", // Wisteria
          "#ccebc5", // Peppermint
          "#ffed6f"  // Kournikova
     ];

     // Create the dc.js chart objects 
     costSum = dc.numberDisplay("#dc-total-cost-display");
     profitSum = dc.numberDisplay("#dc-total-profit-display");
     revenueSum = dc.numberDisplay("#dc-total-revenue-display");
     unitCountSum = dc.numberDisplay("#dc-total-unit-count-display");
     unitssoldsubregionChart = dc.rowChart("#dc-units-sold-sub-region-chart");
     unitssoldcountryMenu = dc.selectMenu("#country-units-sold-selector");
     unitssolditemtypeChart = dc.rowChart("#dc-units-sold-item-type-chart");
     totalunitssoldChart = dc.rowChart("#dc-total-units-sold-chart");
     totalsChart = dc.compositeChart("#dc-totals-chart");
     pieChart = dc.pieChart("#dc-pie-chart");
     dataTable = dc.dataTable("#dc-data-table");

     // Format the time (d3.time.format) 
     var FormatDate = d3.time.format("%d/%m/%Y");
     var FormatMonth = d3.time.format("%m");
     var FormatMonthName = d3.time.format("%m.%b");
     var FormatYear = d3.time.format("%Y");

     // Format the data 
     salesData.forEach(function (d) {
          d.Order_Date_dt = FormatDate.parse(d.Order_Date);
          d.Order_Date = FormatDate(d.Order_Date_dt);
          d.Order_Date_Month = FormatMonthName(d.Order_Date_dt);
          d.Order_Date_Year = FormatYear(d.Order_Date_dt);
          d.Ship_Date_dt = FormatDate.parse(d.Ship_Date);
          d.Ship_Date = FormatDate(d.Order_Date_dt);
          d.Ship_Date_Month = FormatMonthName(d.Order_Date_dt);
          d.Ship_Date_Year = FormatYear(d.Ship_Date_dt);
          d.Order_ID = +d.Order_ID;
          d.Total_Cost = +d.Total_Cost;
          d.Total_Profit = +d.Total_Profit;
          d.Total_Revenue = +d.Total_Revenue;
          d.Unit_Cost = +d.Unit_Cost;
          d.Unit_Price = +d.Unit_Price;
          d.Units_Sold = +d.Units_Sold;
     });

     // groupAll function to sum up the values 
     var allDim = ndx.dimension(function (d) {
          return d;
     });

     // groupAll function to sum up values for dc.numberDisplay(s) 
     var sumAlltotals = allDim.groupAll().reduce(
          function (p, v) {
               p.unitCountSum += v.Units_Sold;
               p.revenueSum += v.Total_Revenue;
               p.costSum += v.Total_Cost;
               p.profitSum += v.Total_Profit;
               return p;
          },
          function (p, v) {
               p.unitCountSum -= v.Units_Sold;
               p.revenueSum -= v.Total_Revenue;
               p.costSum -= v.Total_Cost;
               p.profitSum -= v.Total_Profit;
               return p;
          },
          function () {
               return { unitCountSum: 0, revenueSum: 0, costSum: 0, profitSum: 0 };
          }
     );

     // Create dc.numberDisplay(s) 
     costSum
          .group(sumAlltotals)
          .formatNumber(d3.format(",.0f"))
          .html({
               some:
                    "<span> Total Cost &nbsp" +
                    '<span style="color:#DC143C;"> <strong> £%number </strong> </span>',
               none:
                    "<span> Total Cost &nbsp" +
                    '<span style="color:#DC143C;"> <strong> Zero Records </strong> </span>'
          })
          .transitionDuration(500)
          .valueAccessor(function (d) {
               return d.costSum;
          });

     profitSum
          .group(sumAlltotals)
          .formatNumber(d3.format(",.0f"))
          .html({
               some:
                    "<span> Total Profit &nbsp" +
                    '<span style="color:#556B2F;"> <strong> £%number </strong> </span>',
               none:
                    "<span> Total Profit &nbsp" +
                    '<span style="color:#556B2F;"> <strong> Zero Records </strong> </span>'
          })
          .transitionDuration(500)
          .valueAccessor(function (d) {
               return d.profitSum;
          });

     revenueSum
          .group(sumAlltotals)
          .formatNumber(d3.format(",.0f"))
          .html({
               some:
                    "<span> Total Revenue &nbsp" +
                    '<span style="color:#6495ED;"> <strong> £%number </strong> </span>',
               none:
                    "<span> Total Revenue &nbsp" +
                    '<span style="color:#6495ED;"> <strong> Zero Records </strong> </span>'
          })
          .transitionDuration(500)
          .valueAccessor(function (d) {
               return d.revenueSum;
          });

     unitCountSum
          .group(sumAlltotals)
          .formatNumber(d3.format(",.0f"))
          .html({
               some:
                    "<span> Total Units Sold &nbsp" +
                    '<span style="color:#6495ED;"> <strong> %number </strong> </span>',
               none:
                    "<span> Total Units Sold &nbsp" +
                    '<span style="color:#6495ED;"> <strong> Zero Records </strong> </span>'
          })
          .transitionDuration(500)
          .valueAccessor(
               function (d) {
                    return d.unitCountSum;
               });

     /* Create Dimensionand Group for Sub_Region */

     // Dimension by Sub-Region
     var subRegionDim = ndx
          .dimension(
               function (d) {
                    return d.Sub_Region;
               }),

          // Unit_Sold by Sub_Region
          unitSoldBySubRegionGroup = subRegionDim
               .group()
               .reduceSum(
                    function (d) {
                         return d.Units_Sold;
                    });

     /* Create Dimension and Group for Country */

     // Dimension by Country
     var countryDim = ndx.dimension(
          function (d) {
               return d.Country;
          }),

          // Unit_Sold by Country
          unitSoldByCountryGroup = countryDim
               .group()
               .reduceSum(
                    function (d) {
                         return d.Units_Sold;
                    });

     /* Create Dimension and Group for Item_Type */

     // Dimension by Item_Type
     var itemTypeDim = ndx
          .dimension(
               function (d) {
                    return d.Item_Type;
               }),

          // Unit_Sold by Item_Type
          unitSoldByItemTypeGroup = itemTypeDim
               .group()
               .reduceSum(
                    function (d) {
                         return d.Units_Sold;
                    });

     /* Create Dimension and Groups for Order_Date_Month */

     // Dimension by Order_Date_Month
     var orderDateMonthDim = ndx.dimension(
          function (d) {
               return d.Order_Date_Month;
          }),

          // Sum Total_Cost by Order_Date_Month
          totalCostMonthGroupSum = orderDateMonthDim
               .group()
               .reduceSum(
                    function (d) {
                         return d3.format(".0f")(+d.Total_Cost);
                    }),

          // Sum Total_Profit by Order_Date_Month
          totalProfitMonthGroupSum = orderDateMonthDim
               .group()
               .reduceSum(
                    function (d) {
                         return d3.format(".0f")(+d.Total_Profit);
                    }),

          // Sum Total_Revenue by Order_Date_Month
          totalRevenueMonthGroupSum = orderDateMonthDim
               .group()
               .reduceSum(
                    function (d) {
                         return d3.format(".0f")(+d.Total_Revenue);
                    }),

          // Sum Units_Sold by Order_Date_Month
          unitSoldbyMonthGroupSum = orderDateMonthDim
               .group()
               .reduceSum(
                    function (d) {
                         return d3.format(".0f")(+d.Units_Sold);
                    });

     // Print Filter 
     // print_filter("totalProfitSubRegionGroupFiltered");

     // Create dc.dataCount 
     dc.dataCount(".dc-data-count")
          .dimension(ndx)
          .group(all)
          .html({
               some:
                    '<span style="color:#6495ED;"> <strong> %filter-count </strong>' +
                    '</span> <span> selected out of <span style="color:#6495ED;">' + 
                    '<strong> %total-count </strong> </span> records ' +
                    '<a href="javascript:dc.filterAll(); dc.renderAll();"> &nbsp; <i> Reset All Filters </i></a>',
               all:
                    "<span> All" +
                    '<span style="color:#6495ED;"> <strong> %total-count </strong> </span>' +
                    "<span> records selected, Please click on graph(s) to apply filters."
          });

     // Country Selection Menu 
     unitssoldcountryMenu
          .dimension(countryDim)
          .group(unitSoldByCountryGroup)
          .promptText("Select All Countries");

     // Units Sold by Sub_Region Chart 
     unitssoldsubregionChart
          .height(300)
          .width(600)
          .dimension(subRegionDim)
          .group(unitSoldBySubRegionGroup)
          .elasticX(true)
          .gap(1)
          .label(function (d) {
               return d.key + " : " + d3.format(",")(+d.value);
          })
          .margins({ top: 10, right: 20, bottom: 30, left: 10 })
          .ordering(function (d) {
               return d.Sub_Region;
          })
          .ordinalColors(SchemeSet3)
          .title(function (d) {
               return "Units Sold:" + d3.format(",")(+d.value);
          })
          .transitionDuration(500)
          .xAxis()
          .ticks(6);

     // Units Sold by Item_Type Chart 
     unitssolditemtypeChart
          .height(300)
          .width(600)
          .dimension(itemTypeDim)
          .elasticX(true)
          .gap(1)
          .group(unitSoldByItemTypeGroup)
          .label(function (d) {
               return d.key + " : " + d3.format(",")(+d.value);
          })
          .margins({ top: 10, right: 20, bottom: 30, left: 10 })
          .ordering(function (d) {
               return d.Item_Type;
          })
          .ordinalColors(SchemeSet3)
          .title(function (d) {
               return "Units Sold:" + d3.format(",")(+d.value);
          })
          .transitionDuration(500)
          .xAxis()
          .ticks(6);

     // Units Sold by Month Chart 
     totalunitssoldChart
          .height(300)
          .width(600)
          .dimension(orderDateMonthDim)
          .group(unitSoldbyMonthGroupSum)
          .gap(1)
          .elasticX(true)
          .label(function (d) {
               // split 01.Jan to Jan change [1] to [0] to get 01 
               return d.key.split(".")[1] + " : " + d3.format(",")(+d.value);
          })
          .ordering(function (d) {
               return d.key;
          })
          .ordinalColors(SchemeSet3)
          .margins({ top: 10, right: 20, bottom: 30, left: 10 })
          .title(function (d) {
               return "Monthly Units Sold:" + d3.format(",")(+d.value);
          })
          .transitionDuration(500)
          .xAxis()
          .ticks(6);

     // Remove empty bins from Pie Chart data 
     var totalProfitMonthGroupSumFiltered = remove_empty_bins(
          totalProfitMonthGroupSum
     );

     // Create Profits by Month Chart 
     pieChart
          .height(300)
          .width(600)
          .radius(140)
          .innerRadius(40)
          .externalLabels(45)
          .externalRadiusPadding(40)
          .cy([152])
          .dimension(orderDateMonthDim)
          .group(totalProfitMonthGroupSumFiltered)
          .drawPaths(true)
          .minAngleForLabel(0)
          .ordering(function (d) {
               return d.key;
          })
          .ordinalColors(SchemeSet3)
          .slicesCap(12)
          .title(function (d) {
               return "Profits: " + "£" + d3.format(",")(+d.value);
          })
          .transitionDuration(500)
          // workaround for #703: not enough data is accessible through .label() to display percentages
          .on("pretransition", function (chart) {
               chart.selectAll("text.pie-slice").text(function (d) {
                    return (
                         d.data.key.split(".")[1] + " " +
                         dc.utils.printSingleValue(
                              ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100) + "%"
                    );
               });
          });

     // Create Totals by Month Chart 
     totalsChart
          .height(300)
          .width(600)
          .dimension(subRegionDim)
          .group(totalCostMonthGroupSum)
          .elasticY(true)
          .legend(
               dc
                    .legend()
                    .x(50)
                    .y(0)
          )
          .margins({ top: 10, right: 20, bottom: 30, left: 40 })
          ._rangeBandPadding(1)
          .renderHorizontalGridLines(true)
          .transitionDuration(500)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .compose([
               dc
                    .lineChart(totalsChart)
                    .group(totalRevenueMonthGroupSum, "Monthly Revenue")
                    .interpolate("monotone")
                    .ordinalColors(["#80b1d3"])
                    .valueAccessor(function (d) {
                         return d.value;
                    }),
               dc
                    .lineChart(totalsChart)
                    .group(totalCostMonthGroupSum, "Monthly Costs")
                    .interpolate("monotone")
                    .ordinalColors(["#fb8072"])
                    .valueAccessor(function (d) {
                         return d.value;
                    }),
               dc
                    .lineChart(totalsChart)
                    .group(totalProfitMonthGroupSum, "Monthly Profit")
                    .interpolate("monotone")
                    .ordinalColors(["#b3de69"])
                    .valueAccessor(function (d) {
                         return d.value;
                    })
          ]);
     totalsChart.yAxis().tickFormat(d3.format(".2s"));
     totalsChart.xAxis().tickFormat(function (d) {
          return d.substr(3);
     });

     // Create data table 
     dataTable
          .height(300)
          .width(600)
          .dimension(countryDim)
          .group(function (d) {
               return "";
          })
          .columns([
               function (d) { return d.Country; },
               function (d) { return d.Item_Type; },
               function (d) { return d.Order_Date; },
               function (d) { return d.Ship_Date; },
               function (d) { return d.Units_Sold; },
               function (d) { return "£" + d3.format(".2f")(+d.Unit_Price); },
               function (d) { return "£" + d3.format(".2f")(+d.Unit_Cost); },
               function (d) { return "£" + d3.format(",.0f")(+d.Total_Revenue); },
               function (d) { return "£" + d3.format(",.0f")(+d.Total_Cost); },
               function (d) { return "£" + d3.format(",.0f")(+d.Total_Profit); }
          ])
          .showGroups(false)
          .size(15) // Default = 25
          .sortBy(function (d) {
               return [d.Country, d.Item_Type, d.Order_Date].join();
          });

     // Render Charts 
     dc.renderAll();

     // Remove empty bins Function (if value = 0), before passing to Chart(s) 
     function remove_empty_bins(source_group) {
          return {
               all: function () {
                    return source_group.all().filter(function (d) {
                         //return Math.abs(d.value) > 0.00001; // if using floating-point numbers
                         return d.value !== 0; // if integers only
                    });
               }
          };
     }

     // Print Filter Function Tip
     // taken from the following artical
     // https://www.codeproject.com/Articles/693841/Making-Dashboards-with-Dc-js-Part-1-Using-Crossfilter
     function print_filter(filter) {
          var f = eval(filter);
          if (typeof f.length != "undefined") {} else { }
          if (typeof f.top != "undefined") {f = f.top(Infinity);} else { }
          if (typeof f.dimension != "undefined") {
               f = f.dimension(function (d) { return ""; })
                    .top(Infinity);
          } else { }
          console.log(filter + "(" + f.length + ") = " +
               JSON.stringify(f)
                    .replace("[", "[\n\t")
                    .replace(/}\,/g, "},\n\t")
                    .replace("]", "\n]")
          );
     }
}
