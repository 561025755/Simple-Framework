Schema.addCategory({
    name: "basic",
    text: "地铁站灯箱",
    dataAttributes: [{
        name: "序号",
        type: "number",
        value: "",
        category: "default"
    },
    {
        name: "名称",
        type: "string",
        value: "",
        category: "default"
    },
    //{
    //    name: "所有者",
    //    type: "string",
    //    value: "",
    //    category: "default"
    //},
    {
        name: "连接",
        type: "link",
        value: "",
        category: "default"
    //},
    //{
    //    name: "便笺",
    //    type: "string",
    //    value: "",
    //    category: "default"
        //
    }
    ]
});
Schema.addShape({
    name: "text",
    title: "文本",
    category: "basic",
    shape:"rectangle",
    attribute: {
        linkable: false
    },
    props: {
        w: 160,
        h: 40
    },
    anchors: [],
    textBlock: [{
        position: {
            x: 0,
            y: 0,
            w: "w",
            h: "h"
        },
        text: "文本"
    }],
    path: [{
        lineStyle: {
            lineWidth: 0
        },
        fillStyle: {
            type: "none"
        },
        actions: {
            ref: "rectangle"
        }
    }],
    drawIcon: function (b, c) {
        var a = 0;
        var d = -10;
        c = c + 20;
        return [{
            lineStyle: {
                lineWidth: 2
            },
            fillStyle: {
                type: "solid",
                color: "50, 50, 50"
            },
            actions: [{
                action: "move",
                x: a,
                y: d
            },
            {
                action: "line",
                x: b,
                y: d
            },
            {
                action: "line",
                x: b,
                y: d + c * 0.2
            },
            {
                action: "line",
                x: b * 0.9,
                y: d + c * 0.12
            },
            {
                action: "line",
                x: b * 0.55,
                y: d + c * 0.12
            },
            {
                action: "line",
                x: b * 0.55,
                y: d + c * 0.85
            },
            {
                action: "line",
                x: b * 0.63,
                y: d + c
            },
            {
                action: "line",
                x: b * 0.37,
                y: d + c
            },
            {
                action: "line",
                x: b * 0.45,
                y: d + c * 0.85
            },
            {
                action: "line",
                x: b * 0.45,
                y: d + c * 0.12
            },
            {
                action: "line",
                x: b * 0.1,
                y: d + c * 0.12
            },
            {
                action: "line",
                x: 0,
                y: d + c * 0.2
            },
            {
                action: "close"
            }]
        }]
    }
});
Schema.addShape({
    name: "round",
    shape: "round",
    title: "圆形",
    category: "basic",
    props: {
        w: 70,
        h: 70
    },
    path: [{
        actions: {
            ref: "round"
        }
    }]
});
Schema.addShape({
    name: "stairEyebrow",
    shape: "stairEyebrow",
    title: "梯眉",
    category: "basic",
    props: {
        w: 30,
        h: 5
    },
 
    path: [{        
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "rectangle",
    shape: "rectangle",
    title: "矩形",
    category: "basic",
    props: {
        w: 100,
        h: 70
    },
    path: [{
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "roundRectangle",
    title: "圆角矩形",
    category: "basic",
    shape: "roundRectangle",
    props: {
        w: 100,
        h: 70
    },
    path: [{
        actions: {
            ref: "roundRectangle"
        }
    }]
});
Schema.addShape({
    name: "singleLeftArrow",
    title: "左箭头",
    category: "basic",
    props: {
        w: 90,
        h: 60
    },
    anchors: [{
        x: "w",
        y: "h*0.5"
    },
    {
        x: "0",
        y: "h*0.5"
    }],
    textBlock: [{
        position: {
            x: "0",
            y: "h*0.33",
            w: "w",
            h: "h*0.34"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "0",
            y: "h/2"
        },
        {
            action: "line",
            x: "Math.min(0.5*h,0.45*w)",
            y: "0"
        },
        {
            action: "line",
            x: "Math.min(0.5*h,0.45*w)",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "Math.min(0.5*h,0.45*w)",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "Math.min(0.5*h,0.45*w)",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "h/2"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "singleRightArrow",
    title: "右箭头",
    category: "basic",
    props: {
        w: 90,
        h: 60
    },
    anchors: [{
        x: "w",
        y: "h*0.5"
    },
    {
        x: "0",
        y: "h*0.5"
    }],
    textBlock: [{
        position: {
            x: "0",
            y: "h*0.33",
            w: "w",
            h: "h*0.34"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "0",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "0"
        },
        {
            action: "line",
            x: "w",
            y: "h*0.5"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "0",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "0",
            y: "h*0.33"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "doubleHorizontalArrow",
    title: "左右箭头",
    category: "basic",
    props: {
        w: 90,
        h: 60
    },
    anchors: [{
        x: "w",
        y: "h*0.5"
    },
    {
        x: "0",
        y: "h*0.5"
    }],
    textBlock: [{
        position: {
            x: "0",
            y: "h*0.33",
            w: "w",
            h: "h*0.34"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "0",
            y: "h*0.5"
        },
        {
            action: "line",
            x: "Math.min(h*0.5,w*0.45)",
            y: "0"
        },
        {
            action: "line",
            x: "Math.min(h*0.5,w*0.45)",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h*0.33"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "0"
        },
        {
            action: "line",
            x: "w",
            y: "h*0.5"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h"
        },
        {
            action: "line",
            x: "w-Math.min(h*0.5,w*0.45)",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "Math.min(h*0.5,w*0.45)",
            y: "h*0.67"
        },
        {
            action: "line",
            x: "Math.min(h*0.5,w*0.45)",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "h*0.5"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "singleUpArrow",
    title: "上箭头",
    category: "basic",
    props: {
        w: 60,
        h: 90
    },
    anchors: [{
        x: "w*0.5",
        y: "0"
    },
    {
        x: "w*0.5",
        y: "h"
    }],
    textBlock: [{
        position: {
            x: "-w*0.2",
            y: "h*0.43",
            w: "w*1.4",
            h: "h*0.24"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "w*0.5",
            y: "0"
        },
        {
            action: "line",
            x: "w",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "h"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "h"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "0",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.5",
            y: "0"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "singleDownArrow",
    title: "下箭头",
    category: "basic",
    props: {
        w: 60,
        h: 90
    },
    anchors: [{
        x: "w*0.5",
        y: "0"
    },
    {
        x: "w*0.5",
        y: "h"
    }],
    textBlock: [{
        position: {
            x: "-w*0.2",
            y: "h*0.33",
            w: "w*1.4",
            h: "h*0.24"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "w*0.33",
            y: "0"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "0"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.5",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "0"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "doubleVerticalArrow",
    title: "上下箭头",
    category: "basic",
    props: {
        w: 60,
        h: 90
    },
    anchors: [{
        x: "w*0.5",
        y: "0"
    },
    {
        x: "w*0.5",
        y: "h"
    }],
    textBlock: [{
        position: {
            x: "-w*0.2",
            y: "h*0.38",
            w: "w*1.4",
            h: "h*0.24"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "w*0.5",
            y: "0"
        },
        {
            action: "line",
            x: "w",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.67",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.5",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "h-Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.33",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "0",
            y: "Math.min(w*0.5,h*0.45)"
        },
        {
            action: "line",
            x: "w*0.5",
            y: "0"
        },
        {
            action: "close"
        }]
    }]
});
Schema.addShape({
    name: "backArrow",
    title: "左返回箭头",
    category: "basic",
    props: {
        w: 70,
        h: 70
    },
    anchors: [{
        x: "w-Math.min(w*0.12,20)",
        y: "h*0.5"
    },
    {
        x: "0",
        y: "h*0.5"
    }],
    textBlock: [{
        position: {
            x: "0",
            y: "0",
            w: "w-10",
            h: "h"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "0",
            y: "Math.min(Math.min(w,h)*0.4,80)"
        },
        {
            action: "quadraticCurve",
            x1: "0",
            y1: "0",
            x: "Math.min(Math.min(w,h)*0.4,80)",
            y: "0"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20)-Math.min(Math.min(w,h)*0.4,80)",
            y: "0"
        },
        {
            action: "quadraticCurve",
            x1: "w-Math.min(w*0.12,20)",
            y1: "0",
            x: "w-Math.min(w*0.12,20)",
            y: "Math.min(Math.min(w,h)*0.4,80)"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20)",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "w",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20)-Math.min(Math.min(h,w)*0.25,50)/2",
            y: "h"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20)*2 - Math.min(Math.min(h,w)*0.25,50)",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20) - Math.min(Math.min(h,w)*0.25,50)",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "w-Math.min(w*0.12,20) - Math.min(Math.min(h,w)*0.25,50)",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "quadraticCurve",
            x1: "w-Math.min(w*0.12,20)-Math.min(Math.min(h,w)*0.25,50)",
            y1: "Math.min(Math.min(h,w)*0.25,50)",
            x: "w-Math.min(w*0.12,20)-Math.min(Math.min(h,w)*0.25,50)-Math.min(w*0.15,30)",
            y: "Math.min(Math.min(h,w)*0.25,50)"
        },
        {
            action: "line",
            x: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.15,30)",
            y: "Math.min(Math.min(h,w)*0.25,50)"
        },
        {
            action: "quadraticCurve",
            x1: "Math.min(Math.min(h,w)*0.25,50)",
            y1: "Math.min(Math.min(h,w)*0.25,50)",
            x: "Math.min(Math.min(h,w)*0.25,50)",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "line",
            x: "Math.min(Math.min(h,w)*0.25,50)",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "close"
        }]
    },
    {
        lineStyle: {
            lineWidth: 0
        },
        fillStyle: {
            type: "none"
        },
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "rightBackArrow",
    title: "右返回箭头",
    category: "basic",
    props: {
        w: 70,
        h: 70
    },
    anchors: [{
        x: "Math.min(w*0.12,20)",
        y: "h*0.5"
    },
    {
        x: "w",
        y: "h*0.5"
    }],
    textBlock: [{
        position: {
            x: "10",
            y: "0",
            w: "w-10",
            h: "h"
        }
    }],
    path: [{
        actions: [{
            action: "move",
            x: "w",
            y: "Math.min(Math.min(w,h)*0.4,80)"
        },
        {
            action: "quadraticCurve",
            x1: "w",
            y1: "0",
            x: "w-Math.min(Math.min(w,h)*0.4,80)",
            y: "0"
        },
        {
            action: "line",
            x: "Math.min(w*0.12,20)+Math.min(Math.min(w,h)*0.4,80)",
            y: "0"
        },
        {
            action: "quadraticCurve",
            x1: "Math.min(w*0.12,20)",
            y1: "0",
            x: "Math.min(w*0.12,20)",
            y: "Math.min(Math.min(w,h)*0.4,80)"
        },
        {
            action: "line",
            x: "Math.min(w*0.12,20)",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "0",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "Math.min(w*0.12,20)+Math.min(Math.min(h,w)*0.25,50)/2",
            y: "h"
        },
        {
            action: "line",
            x: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.12,20)*2",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.12,20)",
            y: "h-h*0.1-Math.min(h*0.1,50)"
        },
        {
            action: "line",
            x: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.12,20)",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "quadraticCurve",
            x1: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.12,20)",
            y1: "Math.min(Math.min(h,w)*0.25,50)",
            x: "Math.min(Math.min(h,w)*0.25,50)+Math.min(w*0.12,20)+Math.min(w*0.15,30)",
            y: "Math.min(Math.min(h,w)*0.25,50)"
        },
        {
            action: "line",
            x: "w-Math.min(Math.min(h,w)*0.25,50)-Math.min(w*0.15,30)",
            y: "Math.min(Math.min(h,w)*0.25,50)"
        },
        {
            action: "quadraticCurve",
            x1: "w-Math.min(Math.min(h,w)*0.25,50)",
            y1: "Math.min(Math.min(h,w)*0.25,50)",
            x: "w-Math.min(Math.min(h,w)*0.25,50)",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "line",
            x: "w-Math.min(Math.min(h,w)*0.25,50)",
            y: "h"
        },
        {
            action: "line",
            x: "w",
            y: "h"
        },
        {
            action: "line",
            x: "w",
            y: "Math.min(Math.min(h,w)*0.4,80)"
        },
        {
            action: "close"
        }]
    },
    {
        lineStyle: {
            lineWidth: 0
        },
        fillStyle: {
            type: "none"
        },
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "corner",
    title: "拐角",
    category: "basic",
    props: {
        w: 70,
        h: 70
    },
    anchors: [{
        x: "w*0.5",
        y: "0"
    },
    {
        x: "w*0.5",
        y: "0"
    },
    {
        x: "0",
        y: "h*0.5"
    },
    {
        x: "0",
        y: "h*0.5"
    }],
    path: [{
        actions: [{
            action: "move",
            x: "0",
            y: "0"
        },
        {
            action: "line",
            x: "w",
            y: "0"
        },
        {
            action: "line",
            x: "w-Math.min(w/6,30)",
            y: "Math.min(h/6,30)"
        },
        {
            action: "line",
            x: "Math.min(w/6,30)",
            y: "Math.min(h/6,30)"
        },
        {
            action: "line",
            x: "Math.min(w/6,30)",
            y: "h-Math.min(h/6,30)"
        },
        {
            action: "line",
            x: "0",
            y: "h"
        },
        {
            action: "line",
            x: "0",
            y: "0"
        },
        {
            action: "close"
        }]
    },
    {
        lineStyle: {
            lineWidth: 0
        },
        fillStyle: {
            type: "none"
        },
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "billboard",
    title: "牌子，梯牌等，不可亮灯的",
    category: "basic",
    shape:"rectangle",
    props: {
        w: 50,
        h: 10
    },
    fillStyle:{
        type: "dashed",
        color: "150,150,150"
    },
    lineStyle: {
        lineWidth:2,
        lineColor: "50,50,50",
        lineStyle: "solid"

    },
    path: [{
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "LightBox",
    title: "灯箱,可亮灯的",
    category: "basic",    
    props: {
        w: 50,
        h: 10
    },
    fillStyle: {
        type: "dashed",
        color: "150,150,150"
    },
    lineStyle: {
        lineWidth: 2,
        lineColor: "0,128,0",
        lineStyle: "dashed"

    },
    path: [{
        actions: {
            ref: "rectangle"
        }
    }]
});
Schema.addShape({
    name: "stair",
    title: "楼梯扶梯",
    category: "basic",
    name:"stair",
    
   
   
    props: {
        w: 20,
        h: 60
    },
    
    path: [{
        lineStyle: {
            lineWidth: 0
        },
        actions: {
            ref: "rectangle"
        }
    },
    {
        lineStyle: {
            lineWidth: 2
        },
        actions: {
            ref: "innerStair"
        }
    },
    {
        fillStyle: {
            type:"none"
        },
        actions: {
            ref:"rectangle"
        }
    
    }
    
    ],
    
});
Schema.addGlobalCommand("innerStair", [        
    {
        action: "move",
        y: "2+(h-4)/20",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*2",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*2",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*3",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*3",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*4",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*4",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*5",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*5",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*6",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*6",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*6",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*6",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*7",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*7",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*8",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*8",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*9",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*9",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*10",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*10",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*11",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*11",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*12",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*12",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*13",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*13",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*14",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*14",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*15",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*15",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*16",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*16",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*17",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*17",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*18",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*18",
        x: "w-2"
    },
    {
        action: "move",
        y: "2+(h-4)/20*19",
        x: "2"
    },
    {
        action: "line",
        y: "2+(h-4)/20*19",
        x: "w-2"
    },
    //{
    //    action: "move",
    //    y: "(h-2)",
    //    x: "2"
    //},
    //{
    //    action: "line",
    //    y: "(h-2)",
    //    x: "w-2"
    //},
    //   {
    //       action: "move",
    //       x: "2",
    //       y: "0"
    //   },
    //{
    //    action: "line",
    //    x: "2",
    //    y: "(h-4)"
    //},
    //{
    //    action: "move",
    //    x: "w-2",
    //    y: "0"
    //},
    //{
    //    action: "line",
    //    x: "w-2",
    //    y: "(h-4)"
    //}
    //,
    {
        action: "close"          
    }
    ]
);
Schema.addShape({
    name: "Line",
    title: "线",
    category: "basic",
    attribute: {
        linkable: false
    },
    props: {
        w: 240,
        h: 21
    },
    lineStyle: {
        lineWidth: 2,
        lineColor: "136,136,136"
    },
    anchors: [],
    resizeDir: ["l", "r"],
    textBlock: [],
    path: [{
        fillStyle: {
            type: "none"
        },
        actions: [{
            action: "move",
            x: 0,
            y: "lineWidth%2==0 ? Math.round(h/2) : h/2"
        },
        {
            action: "line",
            x: "w",
            y: "lineWidth%2==0 ? Math.round(h/2) : h/2"
        }]
    },
    {
        fillStyle: {
            type: "none"
        },
        lineStyle: {
            lineWidth: 0
        },
        actions: {
            ref: "rectangle"
        }
    }]
});