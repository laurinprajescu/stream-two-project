queue()
   .defer(d3.json, "/transactionsJa/projects")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

   //Clean projectsJson data
   var transactionsJaProjects = projectsJson;
   var dateFormat = d3.time.format("%m/%e/%y %H:%M");
   transactionsJaProjects.forEach(function (d) {
       d["Transaction_date"] = dateFormat.parse(d["Transaction_date"]);
       d["Transaction_date"].setDate(1);
       d["Price"] = +d["Price"];
   });

    //Create a Crossfilter instance
   var ndx = crossfilter(transactionsJaProjects);

    //Define Dimensions
   var dateDim = ndx.dimension(function (d) {
       return d["Transaction_date"];
   });
   var salesByCountry = ndx.dimension(function (d) {
       return d["Country"];
   });
   var cardTypeDim = ndx.dimension(function (d) {
       return d["Payment_Type"];
   });

       //Calculate metrics
   var numSalesByDate = dateDim.group();
   var numSalesByCountry = salesByCountry.group();
   var numCardByType = cardTypeDim.group();

    var totalSales = ndx.groupAll().reduceSum(function (d) {
       return d["Price"];
   });

   //Define values (to be used in charts)
   var minDate = dateDim.bottom(1)[0]["Transaction_date"];
   var maxDate = dateDim.top(1)[0]["Transaction_date"];

   //Charts
   var timeChart = dc.barChart("#time-chart");
   var salesByCountryChart = dc.pieChart("#sales-by-country");
   var totalSalesND = dc.numberDisplay("#total-sales");
   var cardTypeChart = dc.rowChart("#card-type-row-chart");

   totalSalesND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalSales)
       .formatNumber(d3.format(".3s"));

   timeChart
       .width(1000)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(dateDim)
       .group(numSalesByDate)
       .transitionDuration(500)
       .x(d3.time.scale().domain([minDate, maxDate]))
       .elasticY(true)
       .xAxisLabel("Day")
       .yAxis().ticks(5);

   salesByCountryChart
       .height(250)
       .radius(90)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(salesByCountry)
       .group(numSalesByCountry);

   cardTypeChart
       .width(300)
       .height(250)
       .dimension(cardTypeDim)
       .group(numCardByType)
       .xAxis().ticks(4);

   dc.renderAll();
}
/**
 * Created by lauri on 01/03/2017.
 */