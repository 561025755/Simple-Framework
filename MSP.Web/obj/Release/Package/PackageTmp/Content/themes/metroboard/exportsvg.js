var Svg = {
    orderList:[],
    getViewBox: function (classname) {
        var view = document.getElementsByClassName(classname);       
        var left = Number.MAX_SAFE_INTEGER,
            right = 0,
            top = Number.MAX_SAFE_INTEGER,
            bottom = 0;
        if (view.length>0) {
            for (var v = 0;v<view.length;v++) {
                var e = view[v];
                var s = this.getPosition(e);
                if (s.l <= left) {
                    left = s.l;
                }
                if (s.t <= top) {
                    top = s.t;
                }
                if (s.r >= right) {
                    right = s.r;
                }
                if (s.b >= bottom) {
                    bottom = s.b;
                }
            }
        }      
        return {
            l: left ,
            r: right ,
            t: top,
            b: bottom 
        }
    },
    getElement: function (dom) {
        if (dom) {
            dom = $(dom);
            var id = dom.attr("id");           
            var info = dom.find(".shape_info");
            var text = dom.find(".text_canvas");            
            return {
                id: id,
                text: text.val(),
                fontcolor: text.css("color"),
                fontsize: text.css("font-size"),
                fontfamily: text.css("font-family"),
                textTransform: text.css("transform"),
                textTop: text.css("top"),
                textleft: text.css("left"),
                textAlign: text.css("text-align"),
                textLineHeight: text.css("line-height"),
                textOpacity: text.css("opacity"),
                textDecoration: text.css("text-decoration"),
                shape: info.attr("shape"),
                angle: info.attr("angle"),                
                fillcolor: info.attr("fillcolor"),
                filltype: info.attr("filltype"),                
                x: info.attr("x"),
                y: info.attr("y"),
                width: info.attr("width"),
                height: info.attr("height"),
                clickable: info.attr("clickable"),
                alpha: info.attr("alpha"),
           
            };
        }
    },
    getPosition: function (div) {
        var $div = $(div);
        var left = $div.css2num("left"),
           top = $div.css2num("top")
        width = $div.css2num("width"),
        height = $div.css2num("height");
        
        return {
            id:div.id,
            l: left,
            r:left +width,
            t:top,
            b:top +height
        };
    },
    getSvgPath: function (actions) {
        var a = "";
        switch (actions.action) {
            case "move":
                a += "M" + " ";
                break;
            case "line":
                a += "L" + " ";
                break;
            case "close":
                a += "Z" + " ";
                break;
            case "curve":
                a += "C" + " ";
                break;
            case "quadraticCurve":
                a += "Q"+" ";
                break;
            default:
                break;

        }
        if (typeof actions.x1 != "undefined") {
            a += actions.x1.toString() + " ";
        }
        if (typeof actions.y1 != "undefined") {
            a += actions.y1.toString() + " ";
        }
        if (typeof actions.x2 != "undefined") {
            a += actions.x2.toString() + " ";
        }
        if (typeof actions.y2 != "undefined") {
            a += actions.y2.toString()+" ";
        }
        if (typeof actions.x != "undefined") {
            a += actions.x.toString()+" ";
        }
        if (typeof actions.y != "undefined") {
            a += actions.y.toString()+" ";
        }
        return a;
    },  
    SvgMap: {
        nodes: [],
        addNode: function (node) {
            this.canAdd(this, node);
        },
       canAdd: function (node, n) {        
            var b = Svg.getPosition(n);
            if (this.hasChild(node)) {
                for (var i = 0; i < node.nodes.length; i++) {
                    var a = node.nodes[i];              
                    if (Svg.isChild(b, a)) {
                        //要添加的是被包含在节点的孩子中
                        //递归向下添加
                        return this.canAdd(a, n);
                    } else if (Svg.isChild(a,b)) {
                        //要添加的包含了节点的孩子
                        //
                      
                        var children = this.tryAddParent(node.nodes, b);
                        for (var j = 0; j < children.length; j++) {
                            var toDelete = children[j];
                            var index = node.nodes.indexOf(toDelete);
                            node.nodes.splice(index, 1);
                        }
                        b.nodes = children;
                        node.nodes.push(b);
                    } else {
                        if (node.nodes.indexOf(b)<0&&i==(node.nodes.length-1)) {
                            node.nodes.push(b);
                        }                        
                    }
                }

            }
            else {
                node.nodes = [];
                node.nodes.push(b);
            }

    
        },    
       hasChild: function (node) {
           var flag = false;
           if (node.nodes && node.nodes.length > 0) {
               flag = true;
           }
           return flag;
       },
       empty: function () {
           this.nodes = [];
       },
       tryAddParent:function(children,parent)
       {
           var list = [];
           for (var i = 0; i < children.length; i++) {
               var c = children[i];
               if (Svg.isChild(c, parent)) {                 
                   list.push(c);
               }
           }
           return list;
       }
       

    },    
    isChild:function (child,parent) {
        return child.l >= parent.l
            && child.r <= parent.r
            && child.t >= parent.t
            && child.b <= parent.b
           && child.id !=parent.id;
    },
    toArray: function (map) {
        if (this.SvgMap.hasChild(map)) {
            var list = [];
            for (var i = 0; i < map.nodes.length; i++) {
                var n = map.nodes[i];
                if (this.SvgMap.hasChild(n)) {
                    list.push(n);
                }
                this.orderList.push(n);
            }
            for (var j = 0; j < list.length; j++) {
                 this.toArray(list[j]);
            }
        } else {
            this.orderList.push(map);
        }
        return this.orderList;
    },
    buildSVGMap: function (classname) {
        this.SvgMap.empty();
        var elements = document.getElementsByClassName(classname);        
        for (var i = 0; i < elements.length; i++) {
            this.SvgMap.addNode(elements[i]);           
        }
        return this.SvgMap;
    }
};
$(function () {
    $.fn.css2num = function (c) {
        if (typeof c != "string") {
            return "0"
        }
        var b = $(this).css(c);
        if (/^-?[0-9]+.?[0-9]*$/.test(b.replace("px", "")) && !/\s/g.test(b.replace("px", ""))) {
            return parseInt(b.replace("px", ""))
        }
        return b
    }
});
 Export.svg={
     save2Local:function(classname,chartId)
     {
         var viewbox = Svg.getViewBox(classname);
         var container = document.getElementById("a");
         $(container).empty();
         var map = Svg.buildSVGMap(classname);
         var order = [];
         order = Svg.toArray(map);         
         var draw = SVG("a").attr('id',"chart"+ chartId);       
         draw.viewbox(viewbox.l, viewbox.t, (viewbox.r - viewbox.l), (viewbox.b - viewbox.t)).attr({
             width: viewbox.r - viewbox.l,
             height: viewbox.b - viewbox.t
         });        
         for (var i = 0; i < order.length; i++) {
             var o = order[i];
             var a = Model.getShapeById(o.id);
             var dom = document.getElementById(o.id);
             var element = Svg.getElement(dom);
             var g = draw.group();

             g.translate(a.props.x, a.props.y);
             var pathes = a.getPath();
             var drawpath = "";
             for (var k = 0; k < pathes.length; k++) {
                 
                 var path=pathes[k];
                 var linestyle = path.lineStyle;
                 if (linestyle && linestyle.lineWidth==0) {
                     continue;
                 }                
                     var p = path.actions;
                     for (var j = 0; j < p.length; j++) {
                         drawpath += Svg.getSvgPath(p[j]);
                     }
                 
             }
            
            var  e = g.path(drawpath);
            e.rotate(element.angle);
             e.attr({
                 "id": o.id,
                 "name": $(dom).find(".shape_info").attr("name"),
                 "sizeId": $(dom).find(".shape_info").attr("size"),
                 "sort": $(dom).find(".shape_info").attr("sort")
             });
             e.stroke({ color: "#000000", opacity: 0.6, width: 2 });
             e.fill({
                 color: (typeof a.fillStyle.color == "undefined") ? "none" :new SVG.Color('rgb('+ a.fillStyle.color+')'),
             });
            

             if (element.text) {
                 var gr = g.group();
                 var block = a.getTextBlock()[0];
                 var t = gr.text(block.text).font({
                     family: element.fontfamily,
                     size: element.fontsize,
                     fill: element.fontcolor
                 });
                 t.attr({
                     id: element.id,
                     x: parseInt(block.position.w / 2),
                     y: parseInt(block.position.h / 2),
                 });
             }


         }
         
       
         
         var doc = draw.exportSvg({ whitespace: true });
         doc = Utils.filterXss(doc);

         return doc;
     }


 };
