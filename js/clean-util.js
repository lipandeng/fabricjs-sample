var cleanUtil = {
    getRandomColor: function () {
        return '#' +
            (function (color) {
                return (color += '0123456789abcdef' [Math.floor(Math.random() * 16)]) && (color.length == 6) ? color : arguments.callee(color);
            })('');
    },
    // //由2点确定的直线，求到第三点的距离
    getDis: function (p1, p2, p3) {
        var len;
        //如果p1.x==p2.x 说明是条竖着的线
        if (p1.x - p2.x == 0) {
            len = Math.abs(p3.x - p1.x)
        } else {
            var A = (p1.y - p2.y) / (p1.x - p2.x)
            var B = p1.y - A * p1.x

            len = Math.abs((A * p3.x + B - p3.y) / Math.sqrt(A * A + 1))
        }
        return len
    },
    /**
     * @description 射线法判断点是否在多边形内部
     * @param {Object} p 待判断的点，格式：{ x: X坐标, y: Y坐标 }
     * @param {Array} poly 多边形顶点，数组成员的格式同 p
     * @return {String} 点 p 和多边形 poly 的几何关系
     */
    rayCasting: function (p, poly) {
        var px = p.x,
            py = p.y,
            flag = false

        for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
            var sx = poly[i].x,
                sy = poly[i].y,
                tx = poly[j].x,
                ty = poly[j].y

            // 点与多边形顶点重合
            if ((sx === px && sy === py) || (tx === px && ty === py)) {
                return false //'on'
            }

            // 判断线段两端点是否在射线两侧
            if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
                // 线段上与射线 Y 坐标相同的点的 X 坐标
                var x = sx + (py - sy) * (tx - sx) / (ty - sy)

                // 点在多边形的边上
                if (x === px) {
                    return false //'on'
                }

                // 射线穿过多边形的边界
                if (x > px) {
                    flag = !flag
                }
            }
        }

        // 射线穿过多边形边界的次数为奇数时点在多边形内
        return flag //? 'in' : 'out'
    },
    /**
     * 获取多边形中心点
     * @param {Point[]} points 点坐标数组 [{x:0,y:0}...]
     */
    getPolygonCenter: function (points) {
        if (!Array.isArray(points) || points.length < 3) {
            console.error("多边形坐标集合不能少于3个");
            return;
        }
        const result = {x: 0, y: 0};
        points.forEach((p) => {
            result.x += p.x;
            result.y += p.y;
        });
        result.x /= points.length;
        result.y /= points.length;
        return result;
    },
    calcAddControlCoord: function (p1, p2) {
        //console.info(p1, p2)
        let diffX, diffY;
        if (p1.x) {
            diffX = p1.x - p2.x
            diffY = p1.y - p2.y
        } else {
            diffX = p1.left - p2.left
            diffY = p1.top - p2.top
        }
        let _tan = Math.atan(diffX / diffY)
        let gamma = Math.round(Math.abs(_tan) * 180 / Math.PI)
        let sin = Math.sin(gamma * Math.PI / 180)
        let cos = Math.cos(gamma * Math.PI / 180)
        const c = 2.5
        let x = parseInt(c * sin * 10) / 10, y = parseInt(c * cos * 10) / 10
        //console.info(gamma, sin, x, y)
        if (diffX < 0) {
            x = -x
        }
        if (diffY < 0) {
            y = -y
        }
        return {x, y}
    },
    calcCenterPoint: function (p1, p2) {
        return {
            x: parseInt((p1.x + p2.x) / 2),
            y: parseInt((p1.y + p2.y) / 2) //+ 20
        }
    },
    icon: {
        star: "data:image/png;base64,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",
        end: "data:image/png;base64,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",
        add: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAuNJREFUWEfNlz9oE3EUx7/vYtNWi7pIUEQURwe1TVJ0sR1EEdtchnaw16KLioI66OBkRXBRcNL6DwRztcUOl1apBQcLItVcqlCok6CgRDQuWhtNSO7JVZPeJWnvlwQSb37v/T6/7/vze0eo8Uc1Ph/CADsOa2vdabQxSXvA7AfgIcDDIAJzHMRxgHSSpCeZhsbn07f3fhe5nCPAtq6H7pX17lMATgPYKBIUQIzBdxiNt6bV/Z+X81kWwHtI85MkDQDcLHhwvlmMiC5FQoGbS/kvCeDvGzvIhvGozINtbgy+GFWD/cViFQXw9o6dITauORw+aQZ2MX3NEHcT6MKyUktSR+R+5+N8mwIAv6LJDNKcbs7g9qganDTtvIrWRqBnjj4Gt0YfBCNWOxvA34KrnxLJua7KNl+fEmYnAIBeJ5LJXbMj3amsbX6QswCuOAcCygNYiHxOV+WrBQCtPeOrDUrNirZaBQCf0nXu5jf3DsRNiJwC/t7wPmZMiNzetKkAAGCc1AflGzYAX492GUTnqwIATOqq3G4HUMIvAOyuEgASyVS9WYy5FPiU8DsAWy0AC32ebTVRsHy7FmViPeHXsYI5kcYmfVj+uFgDSniOgaZsAGufl3t41q/YnCAiXyQUiFoUGP0J8KpqAYAlvz7YqS8C9ITfg7C5WilwpXnLy+HgB4sCWgQgn6jcFbUhgCT9aJoJ9c1bi/A6gBPVAGBgJqrK2+2DqMTnt0IFcuM4p0DL0adrpMT8WwAbRFSoACAmZaj51VDgi02Bf89qv9O7noUrFyB/ObG9hubQkPA7KqJCmQAxAw1e655YuJD0jh5n5gGnNJSzkBBRdyQUGFlyIbFMLpFUlLSSAaToamAw/2L/51KaU6KWa3kWoqY/JtZ87Twyvm5FKtUFQheAtqJFSphig+6yIY1ND3V8cyrkgjkg4mDaLKjicnuojjxsELkymXiibi5uznbRGFk7x3/DUgOWav8HEtBgMITdcBIAAAAASUVORK5CYII=",
        delete: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E"
    }
}
