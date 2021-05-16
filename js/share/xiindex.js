var rootPath = "https://spcont.aoshima-bk.co.jp/spcontents/";
var arType = 1;
var 
(function () {

    var path = location.href;
    var paramfull = document.location.search.substring(1);

    rootPath = (location.href).replace('xiview.html' + '?' + paramfull, '');

    document.addEventListener("touchmove", function (e) {
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('orientationchange', updateOrientation, false);

    var param = GetParam();

    if (!!(param.anv)) {
        rootPath = (location.href).replace('xiviewanv.html' + '?' + paramfull, '');
    }

    if (((navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('Android') > 0) && navigator.userAgent.indexOf('Mobile') > 0)
        || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('Android') > 0) {

        if (navigator.userAgent.indexOf('iPhone') > 0) {

            if (iosVersion() >= 11) {

                // TODO: iOS 11.0以上の場合
                if (navigator.userAgent.indexOf('CriOS') > 0) {
                    Err_Exit('【Safari】をご使用下さい。');
                }

            } else {
                Err_Exit('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。');
            }

        } else if (navigator.userAgent.indexOf('iPad') > 0) {

            if (iosVersion() >= 13) {

                // TODO: iOS 13.0以上の場合
                if (navigator.userAgent.indexOf('Safari') < 0) {
                    Err_Exit('【Safari】をご使用下さい。');
                }

            } else {
                Err_Exit('このバージョンのiOSは対応していません。iOS11以上をご使用下さい。');
            }

        } else if (navigator.userAgent.indexOf('Android') > 0 && navigator.userAgent.indexOf('Mobile') < 0  && navigator.userAgent.indexOf('Chrome') < 0) {
            Err_Exit('【Android Chrome】をご使用下さい。');
        }

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = ('0' + month).slice(-2);
        day = ('0' + day).slice(-2);

        if (!!(param.ed)) {

            if (parseInt(param.ed.toString(), 16).toString(10) < (year + month + day).toString()) {
                Err_Exit('表示期限が終了しているため、表示することができません。');
                return;
            }
        }
    } else {
        if (!(param.debug)) {
            Err_Exit('パソコンで表示することはできません。');
            retuern;
        }
    }

    function GetQueryString() {

        if (1 < document.location.search.length) {

            // 最初の1文字 (?記号) を除いた文字列を取得する
            var query = document.location.search.substring(1);

            // クエリの区切り記号 (&) で文字列を配列に分割する
            var parameters = query.split('&');

            var result = new Object();
            for (var i = 0; i < parameters.length; i++) {
                // パラメータ名とパラメータ値に分割する
                var element = parameters[i].split('=');

                var paramName = decodeURIComponent(element[0]);
                var paramValue = decodeURIComponent(element[1]);

                // パラメータ名をキーとして連想配列に追加する
                result[paramName] = decodeURIComponent(paramValue);
            }

            return result;
        }

        return null;
    }

    function GetParam() {
        // URLのパラメータを取得
        var urlParam = location.search.substring(1);

        // パラメータを格納する用の配列を用意
        var paramArray = [];

        // URLにパラメータが存在する場合
        if (urlParam) {
            // 「&」が含まれている場合は「&」で分割
            var param = urlParam.split('&');

            // 用意した配列にパラメータを格納
            for (i = 0; i < param.length; i++) {
                var paramItem = param[i].split('=');
                paramArray[paramItem[0]] = paramItem[1];
            }
        }

        return paramArray;
    }

    function LockScroll() {
        document.addEventListener("mousewheel", handleMouseWheel, { passive: false });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("keydown", handleKeyDown, { passive: false });
        document.body.style.overflow = "hidden";
    }

    function UnLockScroll() {
        document.removeEventListener("mousewheel", handleMouseWheel, { passive: false });
        document.removeEventListener("touchmove", handleTouchMove, { passive: false });
        document.removeEventListener("keydown", handleKeyDown, { passive: false });
        document.body.style.overflow = "visible";
    }

    function handleMouseWheel(e) {
        e.preventDefault();
    }

    function handleTouchMove(e) {
        e.preventDefault();
    }

    function handleKeyDown(e) {
        switch (e.keyCode) {
            case 0x25:
            case 0x26:
            case 0x27:
            case 0x28:
                e.preventDefault();
                break;
        }
    }

    function onResize() {
        // サイズを取得
        const width = window.innerWidth;
        const height = window.innerHeight;

        var renderer = new THREE.WebGLRenderer({ antialias: true });

        // レンダラーのサイズを調整する
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        var camera = new THREE.Camera();

        // カメラのアスペクト比を正す
        camera.aspect = width / height;
        //camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function Err_Exit(msg) {
        window.alert(msg);
        location.href = "warning.html";
    }

    function updateOrientation() {

        switch (window.orientation) {
            case 0:
                // 縦向き
                DiplayBtn('Vertical');
                break;

            case -90:
                // 横向き：右回転
                DiplayBtn('Horizontal');
                break;

            case 90:
                // 横向き：左回転
                DiplayBtn('Horizontal');
                break;

            case 180:
                // 縦向き：上下逆向きに回転
                DiplayBtn('Vertical');
                break;
        }

    }

    function DiplayBtn(orientation) {

        //resetGyro();

        if (orientation == 'Horizontal') {
            
            document.getElementById("swUp").style.display = 'none';
            document.getElementById("swDown").style.display = 'none';

            document.getElementById("swR90").style.display = 'none';
            document.getElementById("swR00").style.display = 'none';

        } else if (orientation == 'Vertical') {

            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';

            document.getElementById("swR90").style.display = 'inline';
            document.getElementById("swR00").style.display = 'inline';

        }
    }

    function resetGyro() {

        var cameraWrapper = document.getElementById("camera-wrapper");
        var camera = document.getElementById("camera");
        var x = camera.getAttribute("rotation").x;
        var y = camera.getAttribute("rotation").y;
        var z = camera.getAttribute("rotation").z;
        
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            cameraWrapper.setAttribute("rotation", { y: -1 * y });
        }
    }

    function requestFullScreen(elem) {
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        }
        else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen();
        }
        else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        }
        else if (elem.msRequestFullScreen) {
            elem.msRequestFullScreen();
        }
    }

    function lockOrientation(mode) {
        if (screen.orientation.lock) {
            screen.orientation.lock(mode);
        }
        else if (screen.lockOrientation) {
            screen.lockOrientation(mode);
        }
        else if (screen.webkitLockOrientation) {
            screen.webkitLockOrientation(mode);
        }
        else if (screen.mozLockOrientation) {
            screen.mozLockOrientation(mode);
        }
        else if (screen.msLockOrientation) {
            screen.msLockOrientation(mode);
        }
    }

}());

function GetFileType (arg) {
    var exct = 'png';

    switch (arg) {

        case 'g':
            return 'gif';
            break;
        case 'v':
            return 'mp4';
            break;
        case 'd':
            return 'gltf';
            break;
        case 'p':
            return 'png';
            break;
    }

    return exct;
}

function GetDefaultSize(arType, oType) {
    
    var wh = '2020';

    if (!arType) {
        if (oType != 'mp4') {
            // 7E4
            wh = '2020';    
        } else {
            // 7DB
            wh = '2011';
        }
    } else {
        if (oType != 'mp4') {
            // 7E4
            wh = '2020';
        } else {
            // 7DB
            wh = '2011';
        }
    }

    return wh;
}

function SizeSplit(size10) {
    var wh = '20,20';

    switch ((parseInt(size10).toString(10)).length) {
        case 2:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{1}/g);
            break;
        case 4:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{2}/g);
            break;
        case 6:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{3}/g);
            break;
        case 8:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{4}/g);
            break;
        case 10:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{5}/g);
            break;
        default:
            wh = size10 && (parseInt(size10).toString(10)).match(/.{1}/g);
            break;
    }

    return wh;
};

function loadscriptheader(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.head.appendChild(script);
}

function loadscriptbody(src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    document.body.appendChild(script);
}

function loadscript(src, before) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    var s = document.getElementById(before);
    s.parentNode.insertBefore(script, s);}

function loadARScript() {

    var objscriptjs = 'js/ar-view1.js';

    if (arType == 2) {
        objscriptjs = 'js/nft-view.js';
    } else if (arType == 1) {
        objscriptjs = 'js/ar-view1.js';
    }

    loadscriptbody(objscriptjs, 'version');
}