var metroOrder = {    
    cart: {
        chart: [],
        box: [],      
    },
    init: function () {
        this.cart.box = [];
        this.cart.chart = [];
    },
    addToCart: function (b, c) {
        var index = this.cart.box.indexOf(b.id);       
        if (index < 0) {        
            this.cart.box.push(b.id);
        }
        var i = this.cart.chart.indexOf(c);
        if (i < 0) {
            this.cart.chart.push(c);
        }        
        return this.cart;
    },
    removeFromCart: function (b) {
        //var row = b.parentElement.parentElement;       
        //$(row).remove();
        //$("#" + row.cells[0].textContent).css("fill", "black");
        //var id = row.cells[0].textContent;       
        var index = this.cart.box.indexOf(b.id);
        if (index >= 0) {
            this.cart.box.splice(index, 1);
        }      
        return this.cart;
    },
    removerChart: function (c) {
        var i = this.cart.chart.indexOf(c);
        if (i >= 0) {
            this.cart.chart.splice(i, 1);
        }
        return this.cart;

    },
    showCart: function () {
        var chart = this.cart.chart[0];
        var box = this.cart.box;
        if (chart) {
            chart.setAttribute('width', 500);
            chart.setAttribute('height', 500);
            $(chart).appendTo($("#result-svg"));
            d3.selectAll("#result-svg svg").
                selectAll("path").
                filter(function () { return metroOrder.cart.box.indexOf(this.id) >= 0; })
                .style("fill", "red");
            svgPanZoom(chart);
        }
       
    }
}