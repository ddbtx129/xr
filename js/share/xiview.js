var webAr = webAr || {};

var videoInfo = {};
var tapCount = 0;
var tapclicked = false;

var viewmode = 'marker';

(function (global) {

    document.getElementById("info1").style.display = "inline";
    webAr.scene = document.querySelector('a-scene');

    var shadowopacity = 0.5;
    var shadowalphaTest = 0.5;

    var defAngle = 0;

    var defPos = { x: 0, y: 0, z: 0 };
    var defScale = { x: 4, y: 4, z: 4 };
    var defwrapPos = { x: 0, y: 0, z: 0 };
    var defwrapScale = { x: 4, y: 4, z: 4 };
    var deflogoScale = { x: 8, y: 6, z: 6 };

    var viewAngle = 0;

    var objAngle = 5;
    var srcno = { obj: 1, from: 1, to: 1, length: 1 };
    var scalechange = 0;

    var loaderEnd = 0;

    var idx = 0;
    var n_idx = 0;

    var defwrap = {};
    var defobj = {};
    var deflogo = {};
    var markerIdx = '';
    // 1: Videoセット完了  2: 一時停止  3: 再生中
    var videoState = {};

    var displaysound = 1;
    //var videosound = 1;

    var fireworksInterval = new Array();  //  花火タイマー
    var particlestart = new Array();
    var fireworksstart = new Array();
    var Expired = 0;

    var ar = {

        init: function () {

            loaderEnd = 0;
            document.getElementById("swPlay").style.display = 'none';
            document.getElementById("swSound").style.display = 'none';

            this.setArg();
            this.checkYukoukigen();

            if (this.setArData()) {

                this.setParticleElement();

                this.setWrap();

                this.createModel(1);

                var deviceEvents = {
                    Touch: typeof document.ontouchstart !== 'undefined',
                    Pointer: window.navigator.pointerEnabled,
                    MSPointer: window.navigator.msPointerEnabled
                };

                this.eventNames = {
                    start: deviceEvents.Pointer ? 'pointerdown' : deviceEvents.MSPointer ? 'MSPointerDown' : deviceEvents.Touch ? 'touchstart' : 'mousedown',
                    move: deviceEvents.Pointer ? 'pointermove' : deviceEvents.MSPointer ? 'MSPointerMove' : deviceEvents.Touch ? 'touchmove' : 'mousemove',
                    end: deviceEvents.Pointer ? 'pointerup' : deviceEvents.MSPointer ? 'MSPointerUp' : deviceEvents.Touch ? 'touchend' : 'mouseup'
                };

                this.setScene();

                // イベント設定
                this.setOverturnEvents();
                this.setResizeEvents();
                this.setMoveEvents();
                this.setTapEvents();
                this.setPreviewEvents();
                this.setMovieEvents();
                this.setSoundEvebts();
            }

            this.setSwitcher();

            let elem = document.getElementById("version1");
            let cameraWrapper = document.getElementById("camera-wrapper");
            let camera = document.getElementById("camera");

            elem.addEventListener("click", () => {
                let y = camera.getAttribute("rotation").y;
                cameraWrapper.setAttribute("rotation", { y: -1 * y });
            });

            var msg3 = document.getElementById('mloader3');
            msg3.innerHTML = 'データ読み込み中・・・';

            if (n_idx <= 1) {
                var msg1 = document.getElementById('mloader1-1');
                var msg2 = document.getElementById('mloader1-2');

                if (this.arData[0].isMarkerType == 1) {
                    msg1.innerHTML = "対象マーカーを検出し表示します。";
                    if (viewAngle == 0) {
                        msg2.innerHTML = "マーカーに垂直にしてください。";
                    } else {
                        msg2.innerHTML = "マーカーに平行にしてください。";
                    }
                } else {
                    msg1.innerHTML = "対象イメージを追跡し表示します。";
                    if (viewAngle == 0) {
                        msg2.innerHTML = "対象イメージに垂直にしてください。";
                    } else {
                        msg2.innerHTML = "対象イメージに平行にしてください。";
                    }
                }
            }
        },

        setArg: function () {

            var self = this;

            var arg = {};
            var viewIdx = {};
            var args = {};

            var pair = location.search.substring(1).split('&');

            for (var i = 0; pair[i]; i++) {
                var kv = pair[i].split('=');
                arg[kv[0]] = decodeURIComponent(kv[1]);
            }

            arg.DebugMode = arg.debug && (parseInt(arg.debug, 10).toString());
            arg.targetObj = arg.target ? (parseInt(arg.target, 10).toString()) : 0;
            arg.Muted = arg.mute ? (parseInt(arg.mute, 10)) : 1;

            videosound = arg.Muted;

            if (videosound == 1) {
                document.getElementById("swSound").setAttribute("src", "asset/sound_on_w.png");
            } else {
                document.getElementById("swSound").setAttribute("src", "asset/sound_off_w.png");
            }

            if (!!(arg.xd)) {

                var base = {};
                base = this.readBaseXml('data/' + arg.mo + '/' + arg.x + '.xml');

                var pcs = {};
                pcs = this.readPcsXml('data/' + arg.mo + '/' + arg.x + '.xml');

                // プレビューモード
                //arg.PVList = base[0].pv;
                arg.PVList = arg.pv;

                // マーカー OR NFT
                arg.ARList = base[0].ar && (parseInt(base[0].ar, 10).toString());

                arg.ExDate = base[0].ed && (parseInt(base[0].ed, 16).toString(10));

                this.checkEndkigen(arg.ExDate);

                arg.WZOOM = base[0].wzoom && (parseInt(base[0].wzoom, 10).toString());
                arg.XYZ = base[0].xyz && (base[0].xyz).toString();

                arg.PARTI = base[0].parti && (base[0].parti).toString();
                arg.FireWorks = base[0].fireworks && (base[0].fireworks).toString();

                arg.Multi = pcs.length;

                for (idx = 0; idx < arg.Multi; idx++) {

                    args[idx] = {};

                    args[idx].ar = 0;

                    // マーカー OR NFT
                    args[idx].ARList = pcs[idx].ar && (parseInt(pcs[idx].ar, 10).toString());

                    // 影
                    args[idx].shodowList = pcs[idx].xs && (parseInt(pcs[idx].xs, 16).toString(2));
                    // 影
                    args[idx].ashodowList = pcs[idx].xsa && (parseInt(pcs[idx].xsa, 16).toString(2));                    // 影
                    args[idx].bshodowList = pcs[idx].xsb && (parseInt(pcs[idx].xsb, 16).toString(2));                    // 影
                    args[idx].cshodowList = pcs[idx].xsc && (parseInt(pcs[idx].xsc, 16).toString(2));
                    // サイズ
                    args[idx].sizeList = pcs[idx].wh && (parseInt(pcs[idx].wh, 16).toString(10));

                    // Aサイズ 倍率
                    args[idx].sizeAList = pcs[idx].wha && (pcs[idx].wha);
                    // Bサイズ 倍率
                    args[idx].sizeBList = pcs[idx].whb && (pcs[idx].whb);
                    // Cサイズ 倍率
                    args[idx].sizeCList = pcs[idx].whc && (pcs[idx].whc);

                    // 倍率
                    args[idx].WRAPZOOM = (pcs[idx].wrapzoom) && (parseInt(pcs[idx].wrapzoom, 10).toString());

                    // マテリアル シェーダー
                    args[idx].MaterialShader = pcs[idx].materialshader;

                    // 角度
                    args[idx].angleList = pcs[idx].an && ((pcs[idx].an).toString());
                    // オブジェクトタイプ
                    args[idx].typeList = pcs[idx].t;

                    // マーカー
                    args[idx].markerList = pcs[idx].m;
                    args[idx].markerList1 = pcs[idx].m1;
                    args[idx].markerList2 = pcs[idx].m2;

                    // 対象オブジェクト
                    args[idx].ObjectList = pcs[idx].o;
                    args[idx].ObjectList1 = pcs[idx].o1;
                    args[idx].ObjectList2 = pcs[idx].o2;
                    args[idx].ObjectList3 = !!(pcs[idx].o3) ? pcs[idx].o3 : pcs[idx].o2;

                    // 追加オブジェクト
                    args[idx].OAtList = pcs[idx].oa;
                    args[idx].OBtList = pcs[idx].ob;
                    args[idx].OCList = pcs[idx].oc;

                    // ラッパー +X +Y +Z
                    args[idx].WrapZList = !!(pcs[idx].wrapz) ? (pcs[idx].wrapz).toString() : '0 0 0';

                    // オブジェクト +X +Y +Z
                    args[idx].OZList = !!(pcs[idx].oz) ? (pcs[idx].oz).toString() : '0 0 0';
                    args[idx].OAZList = !!(pcs[idx].oaz) ? (pcs[idx].oaz).toString() : '0 0 0';
                    args[idx].OBZList = !!(pcs[idx].obz) ? (pcs[idx].obz).toString() : '0 0 0';
                    args[idx].OCZList = !!(pcs[idx].ocz) ? (pcs[idx].ocz).toString() : '0 0 0';

                    // マーカー＆オブジェクト
                    args[idx].MkObjList = pcs[idx].mo;

                    viewIdx[idx] = 0;
                    videoState[idx] = 0;

                    // ロゴ表示
                    var logo = pcs[idx].l && ('0000' + (parseInt(pcs[idx].l, 16).toString(10))).slice(-4);

                    args[idx].LogoList = {};
                    args[idx].LogoAnimeList = {};

                    if (!!(logo)) {
                        logo = (logo.match(/.{2}/g));
                        args[idx].LogoList = (logo).toString().split(',');
                        args[idx].LogoAnimeList = (args[idx].LogoList[1] && parseInt(args[idx].LogoList[1]));
                    }

                    args[idx].PARList = (!!(pcs[idx].par) ? pcs[idx].par : arg.PARTI);
                    args[idx].FireWorkList = (!!(pcs[idx].firework) ? pcs[idx].firework : arg.fireworks);

                    if (args[idx].PARList) {

                        var file = 'particle/' + args[idx].PARList + '.xml';
                        var fsize = file.fileSize;

                        if (fsize != -1) {

                            var parti = {};
                            parti = this.readParticleXml(file);
                            var particle = new Array();

                            for (var k = 0; k < parti.length; k++) {

                                var attribute = {};

                                attribute.kind = parti[k].kind;
                                attribute.attribute = (parti[k].attribute != null) ? parti[k].attribute : 'particle-system';
                                attribute.idnm = (parti[k].idnm + (((idx + 1) * 100) + (k + 1)).toString());
                                attribute.pos = parti[k].pos;
                                attribute.partisys = parti[k].partisys;
                                attribute.fireworks = parti[k].fireworks;
                                attribute.assets = parti[k].assets;
                                attribute.assetsid = parti[k].assetsid;
                                attribute.assetssrc = parti[k].assetssrc;
                                attribute.starttime = parti[k].starttime;
                                attribute.duration = parti[k].duration;

                                particle[k] = attribute;
                            }

                            args[idx].Particle = particle;
                        }
                    }

                    particlestart[idx] = 0;

                    if (!!(args[idx].FireWorkList)) {

                        var file = 'particle/fireworks_' + args[idx].FireWorkList + '.xml';
                        var fsize = file.fileSize;
                        var particle = new Array();

                        if (fsize != -1) {

                            var fw = {};
                            fw = this.readFireworksXml(file);

                            for (var k = 0; k < fw.length; k++) {

                                var attribute = {};

                                attribute.kind = fw[k].kind;
                                attribute.basepos = fw[k].basepos;
                                attribute.pos = fw[k].pos;
                                attribute.particlefirework = fw[k].particlefirework;
                                attribute.trail = (!!(fw[k].trail) ? fw[k].trail : 0);
                                attribute.bloom = (!!(fw[k].bloom) ? fw[k].bloom : 0);
                                attribute.fireworktimer = (!!(fw[k].fireworktimer) ? fw[k].fireworktimer : 0);
                                attribute.timerrange = (!!(fw[k].timerrange) ? fw[k].timerrange : attribute.fireworktimer);

                                particle[k] = attribute;
                            }

                        }

                        args[idx].Particlefireworks = particle;

                    } else {
                        particlestart[idx] = -1;
                    }
                }

                if (arg.Multi > 1) {
                    var bMulti = document.getElementById('imgMulti');
                    bMulti.src = 'asset/markers-w.png';
                }

            } else {

                arg.Multi = 1;

                arg.ExDate = args[idx].ed && (parseInt(args[idx].ed, 16).toString(10));

                args[0] = {};
                idx = 0;

                args[idx] = arg;

                args[idx].ar = 0;

                // プレビューモード
                arg.PVList = arg.pv;
                // マーカー OR NFT
                arg.ARList = arg.ar && (parseInt(arg.ar, 10).toString());

                // マーカー OR NFT
                args[idx].ARList = arg.ar && (parseInt(arg.ar, 10).toString());

                // 影
                args[idx].shodowList = args[idx].xs && (parseInt(args[idx].xs, 16).toString(2));

                args[idx].ashodowList = args[idx].xsa && (parseInt(args[idx].xsa, 16).toString(2));
                args[idx].bshodowList = args[idx].xsb && (parseInt(args[idx].xsb, 16).toString(2));
                args[idx].cshodowList = args[idx].xsc && (parseInt(args[idx].xsc, 16).toString(2));

                // サイズ
                args[idx].sizeList = args[idx].wh && (parseInt(args[idx].wh, 16).toString(10));
                // 角度
                args[idx].angleList = args[idx].an && ((args[idx].an).toString());
                // オブジェクトタイプ
                args[idx].typeList = args[idx].t;

                // マーカー
                args[idx].markerList = args[idx].m;
                args[idx].markerList1 = args[idx].m1;
                args[idx].markerList2 = args[idx].m2;

                // 対象オブジェクト
                args[idx].ObjectList = args[idx].o;
                args[idx].ObjectList1 = args[idx].o1;
                args[idx].ObjectList2 = args[idx].o2;
                args[idx].ObjectList3 = !!(args[idx].o3) ? args[idx].o3 : args[idx].o2;

                // マーカー＆オブジェクト
                args[idx].MkObjList = args[idx].mo;

                viewIdx[0] = 0;
                videoState[0] = 0;

                // 追加オブジェクト
                args[idx].OAtList = args[idx].oa;
                args[idx].OBtList = args[idx].ob;
                args[idx].OCList = args[idx].oc;

                // オブジェクトZ軸(重なり)
                args[idx].OZList = 0;
                args[idx].OAZList = 0;
                args[idx].OBZList = 0;
                args[idx].OCZList = 0;

                // ロゴ表示
                var logo = args[idx].l && ('0000' + (parseInt(args[idx].l, 16).toString(10))).slice(-4);

                args[idx].LogoList = {};
                args[idx].LogoAnimeList = {};

                if (!!(logo)) {
                    logo = (logo.match(/.{2}/g));
                    args[idx].LogoList = (logo).toString().split(',');
                    args[idx].LogoAnimeList = (args[idx].LogoList[1] && parseInt(args[idx].LogoList[1]));
                }

                args[idx].PARList = args[idx].par;
            }

            if (!(arg.DebugMode)) {
                document.getElementById('debug1').style.display = 'none';
                document.getElementById('debug2').style.display = 'none';
                document.getElementById('debug3').style.display = 'none';
            }

            self.arg = arg;
            self.args = args;

            self.viewIdx = viewIdx;
            self.videoState = videoState;
            self.videosound = videosound;
        },

        checkYukoukigen: function () {

            var self = this;

            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            month = ('0' + month).slice(-2);
            day = ('0' + day).slice(-2);

            if (!!(self.arg.ExDate) && Expired == 0) {
                if (parseInt(self.arg.ExDate.toString()).toString(10) < (year + month + day).toString()) {
                    var str = self.arg.ExDate.toString();
                    var y_date = (str.substr(0, 4) + '年' + str.substr(4, 2) + '月' + str.substr(6, 2) + '日');
                    Expired = 1;
                    this.Err_Exit('表示期限は、' + y_date + ' です。\n' + '表示期限が終了しているため、表示することができません。');
                }
            }
        },

        checkEndkigen: function (enddate) {

            var self = this;

            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            month = ('0' + month).slice(-2);
            day = ('0' + day).slice(-2);

            if (!!(enddate) && Expired == 0) {
                if (parseInt(enddate.toString()).toString(10) < (year + month + day).toString()) {
                    var str = enddate.toString();
                    var y_date = (str.substr(0, 4) + '年' + str.substr(4, 2) + '月' + str.substr(6, 2) + '日');
                    Expired = 1;
                    this.Err_Exit('表示期限は、' + y_date + ' です。\n' + '表示期限が終了しているため、表示することができません。');
                }
            }
        },

        setArData: function () {

            var self = this;

            var arData = {};
            var dataObj = {};
            var assets = document.createElement('a-assets');

            assets.setAttribute('id', 'arAssets' + (idx + 1).toString());
            assets.setAttribute('timeout', '9000');

            for (idx = 0; idx < self.arg.Multi; idx++) {

                arData[idx] = null;
                dataObj[idx] = {};
                //oType[idx] = "png";

                defobj[idx] = {};

                var objecttype = (!(self.args[idx].typeList) ? GetFileType('') : GetFileType(String(self.args[idx].typeList)));

                // データの準備
                var object = {};
                var n_object = '';
                var seq = 0;

                var MarkerType = !!(self.args[idx].ARList) ? Number(('0' + Number(self.args[idx].ARList)).slice(-1)) : 1;
                var RandomType = 0;
                RandomType = (Number(self.args[idx].ARList) - Number(MarkerType)) / 10;

                var objName = new Array();

                if (!(self.args[idx].ObjectList)) {

                    var no = Number(self.args[idx].ObjectList2);
                    if (RandomType != 9) {
                        seq = (Number(self.args[idx].ObjectList3) - Number(self.args[idx].ObjectList2));
                    } else {
                        seq = 0;
                        no = this.getRandomIntInclusive(Number(self.args[idx].ObjectList2), Number(self.args[idx].ObjectList3));
                    }

                    for (var i = 0; i <= seq; i++) {
                        var j = ((no + i) < 100) ? 2 : ((no + i).toString()).length;
                        var obj = (('0').repeat(j) + (parseInt(no + i, 10).toString())).slice(-(j));
                        object[i] = ((self.args[idx].MkObjList) && (obj) ?
                            (self.args[idx].MkObjList + '/' + obj)
                            :
                            (self.args[idx].ObjectList1 + '/' + obj));
                        objName[i] = obj;
                    }
                } else {
                    object[0] = (!(self.args[idx].ObjectList) ? '' : self.args[idx].ObjectList);
                    objName[0] = self.args[idx].ObjectList;
                }

                n_object = ((self.args[idx].MkObjList) ? (self.args[idx].MkObjList) : ((self.args[idx].ObjectList1) ? (self.args[idx].ObjectList1) : (self.args[idx].ObjectList)));

                dataObj[idx] = { path: object[0] + '.' + objecttype };
                dataObj[idx].oType = objecttype;

                dataObj[idx].paths = {};
                dataObj[idx].ObjectPath = {};

                dataObj[idx].srcno = { obj: 1, from: 1, to: 1, length: 1 };

                dataObj[idx].addType = { A: '', B: '', C: '' };

                if (seq > 0) {
                    dataObj[idx].srcno.length = 0;
                    for (var i = 0; i <= seq; i++) {
                        dataObj[idx].paths[i] = object[i] + '.' + dataObj[idx].oType;
                        dataObj[idx].srcno.length += 1;
                    }
                } else {
                    dataObj[idx].paths[0] = object[0] + '.' + dataObj[idx].oType;
                }

                if (!!(self.args[idx].OAtList)) {
                    dataObj[idx].addType.A = (!!(self.args[idx].OAtList || '').match(/\.gif$/i)) ? 'gif' : 'png';
                    dataObj[idx].ObjectPath.A = self.args[idx].OAtList;
                }
                if (!!(self.args[idx].OBtList)) {
                    dataObj[idx].addType.B = (!!(self.args[idx].OBtList || '').match(/\.gif$/i)) ? 'gif' : 'png';
                    dataObj[idx].ObjectPath.B = self.args[idx].OBtList;
                }
                if (!!(self.args[idx].OCtList)) {
                    dataObj[idx].addType.C = (!!(self.args[idx].OCtList || '').match(/\.gif$/i)) ? 'gif' : 'png';
                    dataObj[idx].ObjectPath.C = self.args[idx].OBtList;
                }

                if (n_idx < dataObj[idx].srcno.length) {
                    n_idx = dataObj[idx].srcno.length
                }

                dataObj[idx].isPng = !!(dataObj[idx].path || '').match(/\.png$/i);
                dataObj[idx].isGif = !!(dataObj[idx].path || '').match(/\.gif$/i);
                dataObj[idx].isMp4 = false;
                dataObj[idx].isMp4 = !!(dataObj[idx].path || '').match(/\.mp4$/i);
                dataObj[idx].isGltf = !!(dataObj[idx].path || '').match(/\.gltf$/i);
                dataObj[idx].isPV = !!(self.arg.PVList);
                dataObj[idx].isNFT = !!(self.arg.ARList);
                //dataObj[idx].isMarkerType = !!(self.args[idx].ARList) ? Number(self.args[idx].ARList) : 1;
                dataObj[idx].isMarkerType = !!(self.args[idx].ARList) ? Number(('0' + Number(self.args[idx].ARList)).slice(-1)) : 1;
                dataObj[idx].isRandom = RandomType;
                dataObj[idx].isOpenAnime = !!(self.args[idx].ARList) ? (Number(self.args[idx].ARList) >= 10 ? 1 : 0) : 0;
                dataObj[idx].isLogo = (!!(self.args[idx].LogoList) ? self.args[idx].LogoList[0] : '0');
                dataObj[idx].isAnime = (!!(self.args[idx].LogoAnimeList) ? Number(self.args[idx].LogoAnimeList) : 0);

                dataObj[idx].isShadow = self.args[idx].shodowList && !!Number(self.args[idx].shodowList);

                dataObj[idx].isAShadow = self.args[idx].ashodowList && !!Number(self.args[idx].ashodowList);
                dataObj[idx].isBShadow = self.args[idx].bshodowList && !!Number(self.args[idx].bshodowList);
                dataObj[idx].isCShadow = self.args[idx].cshodowList && !!Number(self.args[idx].cshodowList);
                
                dataObj[idx].Shader = !!(self.args[idx].MaterialShader) ? (self.args[idx].MaterialShader).toString() : "standard";

                dataObj[idx].isParti = (!!(self.args[idx].PARList) ? self.args[idx].PARList : self.arg.PARTI);
                dataObj[idx].isFirework = self.args[idx].FireWorkList;

                // サイズ
                self.args[idx].sizeList = String(!!(!!(self.args[idx].sizeList) && !(dataObj[idx].isPV)) ? self.args[idx].sizeList : GetDefaultSize((dataObj[idx].isMarkerType == 1 ? 0 : 1), dataObj[idx].oType));

                var wh = SizeSplit(self.args[idx].sizeList).toString().split(',');
                var i = ((parseInt(self.args[idx].sizeList).toString(10)).length % 2 == 0) ? (parseInt(self.args[idx].sizeList).toString(10)).length : (parseInt(self.args[idx].sizeList).toString(10)).length + 1;
                var j = (dataObj[idx].isMarkerType == 1 ? 2 : 2);

                dataObj[idx].size = { w: (Number(wh[0]) * (10 ** -((i - j) / 2))).toFixed(1), h: (Number(wh[1]) * (10 ** -((i - j) / 2))).toFixed(1) };
                defobj[idx].Scale = { x: dataObj[idx].size.w, y: dataObj[idx].size.h, z: dataObj[idx].size.h };

                // オブジェクトソース
                if (dataObj[idx].path) {

                    var folder = !!(dataObj[idx].isMp4) ? 'video' : (!!(dataObj[idx].isGltf) ? 'gltf' : 'pic');
                    dataObj[idx].path = rootPath + 'article/' + folder + '/' + dataObj[idx].path;
                    dataObj[idx].arObj = {};

                    if (!!(dataObj[idx].isPng) || !!(dataObj[idx].isGif)) {

                        var img = {};
                        //var imgAdd = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            img[i] = document.createElement('img');
                            img[i].setAttribute('crossorigin', 'anonymous');
                            img[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            img[i].setAttribute('src', dataObj[idx].paths[i]);
                            img[i].setAttribute('object-name', objName[i]);

                            dataObj[idx].arObj[i] = { obj: img[i] };

                            assets.appendChild(img[i]);

                            //imgAdd[i] = {};

                            //if (!!(self.args[idx].OAtList)) {
                            //    dataObj[idx].ObjectPath[i].A = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].A;

                            //    imgAdd[i].A = document.createElement('img');
                            //    imgAdd[i].A.setAttribute('crossorigin', 'anonymous');
                            //    imgAdd[i].A.setAttribute('id', 'asource' + ((idx + 1) * 100 + (i + 1)).toString());
                            //    imgAdd[i].A.setAttribute('src', dataObj[idx].ObjectPath[i].A);

                            //    dataObj[idx].arObj[i][1] = imgAdd[i].A;

                            //    assets.appendChild(imgAdd[i].A);
                            //}

                            //if (!!(self.args[idx].OBtList)) {
                            //    dataObj[idx].ObjectPath[i].B = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].B;

                            //    imgAdd[i].B = document.createElement('img');
                            //    imgAdd[i].B.setAttribute('crossorigin', 'anonymous');
                            //    imgAdd[i].B.setAttribute('id', 'bsource' + ((idx + 1) * 100 + (i + 1)).toString());
                            //    imgAdd[i].B.setAttribute('src', dataObj[idx].ObjectPath[i].B);

                            //    dataObj[idx].arObj[i][2] = imgAdd[i].B;

                            //    assets.appendChild(imgAdd[i].B);
                            //}

                            //if (!!(self.args[idx].OCtList)) {
                            //    dataObj[idx].ObjectPath[i].C = rootPath + 'article/' + folder + '/' + dataObj[idx].ObjectPath[i].C;

                            //    imgAdd[i].C = document.createElement('img');
                            //    imgAdd[i].C.setAttribute('crossorigin', 'anonymous');
                            //    imgAdd[i].C.setAttribute('id', 'csource' + ((idx + 1) * 100 + (i + 1)).toString());
                            //    imgAdd[i].C.setAttribute('src', dataObj[idx].ObjectPath[i].C);

                            //    dataObj[idx].arObj[i][3] = imgAdd[i].C;

                            //    assets.appendChild(imgAdd[i].C);
                            //}
                        }

                    } else if (!!(dataObj[idx].isMp4)) {

                        var video = {};
                        var audio = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            video[i] = document.createElement("video");
                            video[i].setAttribute("src", dataObj[idx].paths[i]);
                            video[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            video[i].setAttribute('preload', 'auto');
                            video[i].setAttribute('response-type', 'arraybuffer');
                            video[i].setAttribute('loop', 'true');
                            video[i].setAttribute('crossorigin', 'anonymous');
                            video[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                            video[i].setAttribute("playsinline", "");
                            video[i].setAttribute("controls", "false");
                            //video[i].setAttribute("autoplay", "");
                            video[i].setAttribute('object-name', objName[i]);

                            audio[i] = document.createElement("audio");
                            audio[i].setAttribute("src", dataObj[idx].paths[i]);
                            audio[i].setAttribute('id', 'asource' + ((idx + 1) * 100 + (i + 1)).toString());
                            audio[i].setAttribute('preload', 'auto');
                            audio[i].setAttribute('response-type', 'arraybuffer');
                            audio[i].setAttribute('loop', 'true');
                            audio[i].setAttribute('crossorigin', 'anonymous');
                            audio[i].setAttribute('webkit-playsinline', 'webkit-playsinline');
                            audio[i].setAttribute("playsinline", "");
                            audio[i].setAttribute("controls", "false");
                            //audio[i].setAttribute("autoplay", "");
                            audio[i].setAttribute('object-name', objName[i]);

                            dataObj[idx].arObj[i] = { obj: video[i], obj2: audio[i] };

                            assets.appendChild(video[i]);
                            assets.appendChild(audio[i]);
                        }

                    } else if (dataObj[idx].isGltf) {

                        var model = {};

                        for (var i = 0; i <= seq; i++) {
                            dataObj[idx].paths[i] = rootPath + 'article/' + folder + '/' + dataObj[idx].paths[i];

                            model[i] = document.createElement('a-asset-item');
                            model[i].setAttribute('crossorigin', 'anonymous');
                            model[i].setAttribute('id', 'source' + ((idx + 1) * 100 + (i + 1)).toString());
                            model[i].setAttribute('src', dataObj[idx].paths[i]);
                            model[i].setAttribute('object-name', objName[i]);

                            dataObj[idx].arObj[i] = { obj: model[i] };

                            assets.appendChild(model[i]);
                        }
                    }

                    if (!!(self.args[idx].OAtList) || !!(self.args[idx].OBtList) || !!(self.args[idx].OCtList)) {

                        var imgAdd = {};

                        if (!!(self.args[idx].OAtList)) {

                            // 追加Aサイズ
                            self.args[idx].sizeAList = !!(self.args[idx].sizeAList) ? self.args[idx].sizeAList : 1;

                            defobj[idx].ScaleA = {
                                x: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeAList)).toFixed(2),
                                y: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeAList)).toFixed(2),
                                z: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeAList)).toFixed(2)
                            };

                            dataObj[idx].ObjectPath.A = rootPath + 'article/pic/' + dataObj[idx].ObjectPath.A;

                            imgAdd.A = document.createElement('img');
                            imgAdd.A.setAttribute('crossorigin', 'anonymous');
                            imgAdd.A.setAttribute('id', 'asource' + ((idx + 1) * 100).toString());
                            imgAdd.A.setAttribute('src', dataObj[idx].ObjectPath.A);

                            dataObj[idx].arObj.A = imgAdd.A;

                            assets.appendChild(imgAdd.A);
                        }

                        if (!!(self.args[idx].OBtList)) {

                            // 追加Bサイズ
                            self.args[idx].sizeBList = !!(self.args[idx].sizeBList) ? self.args[idx].sizeBList : 1;

                            defobj[idx].ScaleB = {
                                x: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeBList)).toFixed(2),
                                y: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeBList)).toFixed(2),
                                z: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeBList)).toFixed(2)
                            };

                            dataObj[idx].ObjectPath.B = rootPath + 'article/pic/' + dataObj[idx].ObjectPath.B;

                            imgAdd.B = document.createElement('img');
                            imgAdd.B.setAttribute('crossorigin', 'anonymous');
                            imgAdd.B.setAttribute('id', 'bsource' + ((idx + 1) * 100).toString());
                            imgAdd.B.setAttribute('src', dataObj[idx].ObjectPath.B);

                            dataObj[idx].arObj.B = imgAdd.B;

                            assets.appendChild(imgAdd.B);
                        }

                        if (!!(self.args[idx].OCtList)) {

                            // 追加Cサイズ
                            self.args[idx].sizeCList = !!(self.args[idx].sizeCList) ? self.args[idx].sizeCList : 1;

                            defobj[idx].ScaleC = {
                                x: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeCList)).toFixed(2),
                                y: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeCList)).toFixed(2),
                                z: (Number(defobj[idx].Scale.x) * Number(self.args[idx].sizeCList)).toFixed(2)
                            };

                            dataObj[idx].ObjectPath.C = rootPath + 'article/pic/' + dataObj[idx].ObjectPath.C;

                            imgAdd.C = document.createElement('img');
                            imgAdd.C.setAttribute('crossorigin', 'anonymous');
                            imgAdd.C.setAttribute('id', 'csource' + ((idx + 1) * 100).toString());
                            imgAdd.C.setAttribute('src', dataObj[idx].ObjectPath.C);

                            dataObj[idx].arObj.C = imgAdd.C;

                            assets.appendChild(imgAdd.C);
                        }
                    }

                    if (dataObj[idx].isLogo) {

                        dataObj[idx].logopath = rootPath + 'article/gltf/' + n_object + '/' + 'logo-' + self.args[idx].LogoList[0] + '.gltf';

                        var model = document.createElement('a-asset-item');
                        model.setAttribute('crossorigin', 'anonymous');
                        model.setAttribute('id', 'lsource' + ((idx + 1) * 100 + 1).toString());
                        model.setAttribute('src', dataObj[idx].logopath);

                        assets.appendChild(model);
                    }

                    if (dataObj[idx].tap) {

                        self.tap = true;
                        var bTap = document.createElement('img');

                        bTap.setAttribute('crossorigin', 'anonymous');
                        bTap.setAttribute('id', 'swDown');
                        bTap.setAttribute('src', 'asset/touch_w.png');

                        document.body.appendChild(bTap);
                    }

                    dataObj[idx].seq = seq;
                }

                arData[idx] = dataObj[idx];

                if (!arData[idx].path) {
                    // 画像なかった
                    this.Err_Exit('画像情報が取得できませんでした。');
                    return false;
                }
            }

            webAr.scene.appendChild(assets);
            self.arData = arData;

            return true;
        },

        setParticleElement: function () {

            var self = this;
            var beforel = null;
            let el = document.getElementById('arScene');

            for (idx = 0; idx < self.arg.Multi; idx++) {

                if (!!(self.arData[idx].isParti)) {

                    for (var k = 0; k < self.args[idx].Particle.length; k++) {
                        if (!!(self.args[idx].Particle[k].assets)) {
                            var ass = document.createElement('a-assets');
                            ass.setAttribute('id', self.args[idx].Particle[k].assetsid);
                            ass.setAttribute('position', self.args[idx].Particle[k].assetssrc);

                            el.appendChild(ass);
                        }

                        if (!!(self.args[idx].Particle[k].idnm)) {

                            var parti = document.createElement('a-entity');

                            if (self.args[idx].Particle[k].kind == '0') {
                                parti.setAttribute('id', self.args[idx].Particle[k].idnm);
                                parti.setAttribute('position', self.args[idx].Particle[k].pos);
                                parti.setAttribute(self.args[idx].Particle[k].attribute, self.args[idx].Particle[k].partisys);
                                parti.setAttribute('style', 'display:none');
                                el.appendChild(parti);

                            } else if (self.args[idx].Particle[k].kind == '1') {
                                parti.setAttribute('id', self.args[idx].Particle[k].idnm);
                                parti.setAttribute(self.args[idx].Particle[k].attribute, '');
                                //parti.setAttribute('style', 'display:none');

                                el.appendChild(parti);

                                parti.setAttribute(self.args[idx].Particle[k].attribute.toString(), 'pos', self.args[idx].Particle[k].pos);
                                parti.setAttribute(self.args[idx].Particle[k].attribute.toString(), 'partisys', self.args[idx].Particle[k].partisys);
                                parti.setAttribute(self.args[idx].Particle[k].attribute.toString(), 'starttime', self.args[idx].Particle[k].starttime);
                                parti.setAttribute(self.args[idx].Particle[k].attribute.toString(), 'duration', self.args[idx].Particle[k].duration);
                            }
                        }
                    }
                }
            }
        },

        setSwitcher: function () {

            var self = this;

            var swMarker = document.getElementById('swMarker');
            var swPreview = document.getElementById('swPreview');

            if (self.arData[0].isPV) {
                swPreview.classList.add('current');
            } else {
                swMarker.classList.add('current');
            }

            swMarker.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    webAr.markerIdx = '';
                    location.replace(location.search.replace('&pv=1', ''));
                    for (var i = 0; i < webAr.ar.arg.Multi; i++) {
                        webAr.ar.videoState[i] = 0;
                    }
                    webAr.ar.setDiplayBtn(0);
                }
            });

            swPreview.addEventListener('click', function () {
                if (!this.classList.contains('current')) {
                    webAr.markerIdx = '1';
                    location.replace(location.search + '&pv=1');
                    for (var i = 0; i < webAr.ar.arg.Multi; i++) {
                        webAr.ar.videoState[i] = 0;
                    }
                    webAr.ar.setDiplayBtn(1);
                }
            });
        },

        setWrap: function () {

            var self = this;
            self.wrap = new Array;

            for (idx = 0; idx < self.arg.Multi; idx++) {

                defwrap[idx] = { Pos: defwrapPos, Scale: defwrapScale };
                var wpos = AFRAME.utils.coordinates.parse(self.args[idx].WrapZList);

                //var xAngle = (!!(self.args[idx].angleList) ? Number(self.args[idx].angleList) : 0);
                var wrap = document.createElement('a-entity');

                wrap.setAttribute('id', 'base' + ((idx + 1)).toString());
                wrap.setAttribute('scale', AFRAME.utils.coordinates.stringify(defwrap[idx].Scale));
                if (!(self.arData[idx].isPV) && !!(self.arg.XYZ)) {
                    var pos = AFRAME.utils.coordinates.parse(self.arg.XYZ);
                    defwrap[idx].Pos = pos;
                }

                defwrap[idx].Pos = {
                    x: (Number(defwrap[idx].Pos.x) + Number(wpos.x)).toFixed(2),
                    y: (Number(defwrap[idx].Pos.y) + Number(wpos.y)).toFixed(2),
                    z: (Number(defwrap[idx].Pos.z) + Number(wpos.z)).toFixed(2)
                };

                wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(defwrap[idx].Pos));
                wrap.setAttribute('rotation', '0 0 0');
                //wrap.setAttribute('rotation', xAngle + ' 0 0');
                wrap.setAttribute('src', rootPath + 'asset/plane.png');
                wrap.setAttribute('material', 'transparent: true, opacity: 0');
                wrap.setAttribute('style', 'z-index: 5');
                wrap.setAttribute('visible', true);

                self.wrap[idx] = wrap;
                self.arData[idx].wrap = self.wrap[idx];
            }
        },

        createModel: function (objno) {

            var self = this;
            var val = self.arData;

            for (idx = 0; idx < self.arg.Multi; idx++) {

                if (!val[idx].path) {
                    continue;
                }

                var srcname = '#source' + (((idx + 1) * 100) + objno).toString();
                var asrcname = '#asource' + ((idx + 1) * 100).toString();
                var bsrcname = '#bsource' + ((idx + 1) * 100).toString();
                var csrcname = '#csource' + ((idx + 1) * 100).toString();

                if (val[idx].isShadow && !(val[idx].isGltf)) {

                    var shadow = document.createElement('a-image');
                    var spos = AFRAME.utils.coordinates.parse(self.args[idx].OZList);
                    var posVec3shadow = self.positionVec3('shadow', idx);
                    var posVec3mshadow = {
                        x: (Number(posVec3shadow.x) + Number(spos.x)).toFixed(2),
                        y: (Number(posVec3shadow.y)).toFixed(2),
                        z: (Number(posVec3shadow.z) - Number(spos.y)).toFixed(2)
                    };

                    shadow.setAttribute('id', 'shadow' + (idx + 1).toString());
                    //shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow', idx)));
                    shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3mshadow));
                    shadow.setAttribute('rotation', '-90 0 0');
                    shadow.setAttribute('style', 'z-index: 2');

                    AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                        primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x
                    });

                    //AFRAME.utils.entity.setComponentProperty(shadow, 'material', { 
                    //    shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, 
                    //    alphaTest: shadowalphaTest, color: 'black', opacity: shadowopacity, depthTest: false
                    //});

                    if(val[idx].isGif || !(self.args[idx].MaterialShader)) {
                        AFRAME.utils.entity.setComponentProperty(shadow, 'material', { 
                            shader: val[idx].isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, 
                            alphaTest: shadowalphaTest, color: 'black', opacity: shadowopacity, depthTest: false
                        });
                    } else {
                        console.log(val[idx].Shader);
                        AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                            shader: val[idx].Shader, npot: true, src: srcname, transparent: true, alphaTest: shadowalphaTest,
                            color: '0.1 0.9 0.2', opacity: shadowopacity, depthTest: false
                        });
                        AFRAME.utils.entity.setComponentProperty(shadow, 'material', { 
                            shader: val[idx].isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, 
                            alphaTest: shadowalphaTest, color: 'black', opacity: shadowopacity, depthTest: false
                        });
                    }

                    self.arData[idx].shadow = shadow;
                }

                if (self.args[idx].OAtList && val[idx].isAShadow && !(val[idx].isGltf)) {

                    var ashadow = document.createElement('a-image');
                    var aspos = AFRAME.utils.coordinates.parse(self.args[idx].OAZList);
                    var posVec3ashadow = {
                        x: (Number(posVec3shadow.x) + Number(aspos.x)).toFixed(2),
                        y: (Number(posVec3shadow.y)).toFixed(2),
                        z: (Number(posVec3shadow.z) - Number(aspos.y)).toFixed(2)
                    };

                    defobj[idx].posVec3ashadowa = posVec3ashadow;

                    ashadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                    ashadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3ashadow));

                    ashadow.setAttribute('rotation', '-90 0 0');
                    ashadow.setAttribute('style', 'z-index: 2');
                    ashadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(ashadow, 'geometry', {
                        primitive: 'plane', height: (defobj[idx].ScaleA.y), width: (defobj[idx].ScaleA.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(ashadow, 'material', {
                        shader: val[idx].isGif ? 'gif' : 'flat', npot: true, src: asrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[idx].ashadow = ashadow;
                }

                if (self.args[idx].OBtList && val[idx].isBShadow && !(val[idx].isGltf)) {

                    var bshadow = document.createElement('a-image');
                    var bspos = AFRAME.utils.coordinates.parse(self.args[idx].OBZList);
                    var posVec3bshadow = {
                        x: (Number(posVec3shadow.x) + Number(bspos.x)).toFixed(2),
                        y: (Number(posVec3shadow.y)).toFixed(2),
                        z: (Number(posVec3shadow.z) - Number(bspos.y)).toFixed(2)
                    };

                    defobj[idx].posVec3bshadow = posVec3bshadow;

                    bshadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                    bshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3bshadow));

                    bshadow.setAttribute('rotation', '-90 0 0');
                    bshadow.setAttribute('style', 'z-index: 2');
                    bshadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(bshadow, 'geometry', {
                        primitive: 'plane', height: (defobj[idx].ScaleB.y), width: (defobj[idx].ScaleB.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(bshadow, 'material', {
                        shader: val[idx].isGif ? 'gif' : 'flat', npot: true, src: bsrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[idx].bshadow = bshadow;
                }

                if (self.args[idx].OCtList && val[idx].isCShadow && !(val[idx].isGltf)) {

                    var cshadow = document.createElement('a-image');
                    var cspos = AFRAME.utils.coordinates.parse(self.args[idx].OBZList);
                    var posVec3cshadow = {
                        x: (Number(posVec3shadow.x) + Number(cspos.x)).toFixed(2),
                        y: (Number(posVec3shadow.y)).toFixed(2),
                        z: (Number(posVec3shadow.z) - Number(cspos.y)).toFixed(2)
                    };

                    defobj[idx].posVec3cshadow = posVec3cshadow;

                    cshadow.setAttribute('id', 'ashadow' + (idx + 1).toString());
                    cshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3cshadow));

                    cshadow.setAttribute('rotation', '-90 0 0');
                    cshadow.setAttribute('style', 'z-index: 2');
                    cshadow.setAttribute('visible', !(self.arg.targetObj));

                    AFRAME.utils.entity.setComponentProperty(cshadow, 'geometry', {
                        primitive: 'plane', height: (defobj[idx].ScaleC.y), width: (defobj[idx].ScaleC.x)
                    });

                    AFRAME.utils.entity.setComponentProperty(cshadow, 'material', {
                        shader: val[idx].isGif ? 'gif' : 'flat', npot: true, src: csrcname, transparent: true, alphaTest: shadowalphaTest,
                        color: 'black', opacity: shadowopacity, depthTest: false
                    });

                    self.arData[idx].cshadow = cshadow;
                }

                var elname = '';

                if (!val[idx].isMp4) {
                    if (!val[idx].isGif) {
                        elname = 'a-image'
                    } else {
                        elname = 'a-entity'
                    }
                } else if (!!(val[idx].isMp4)) {
                    elname = 'a-video'
                }

                var main = document.createElement(elname);

                var posVec3 = self.positionVec3('main', idx);
                defPos = posVec3;
                defobj[idx].Pos = posVec3;

                var mpos = AFRAME.utils.coordinates.parse(self.args[idx].OZList);

                defobj[idx].Pos = {
                    x: (Number(posVec3.x) + Number(mpos.x)).toFixed(2),
                    y: (Number(posVec3.y) + Number(mpos.y)).toFixed(2),
                    z: (Number(posVec3.z) + Number(mpos.z)).toFixed(2)
                };

                main.setAttribute('id', 'main' + (idx + 1).toString());
                main.setAttribute('position', AFRAME.utils.coordinates.stringify(defobj[idx].Pos));

                main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val[idx].isGltf) {

                    main.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.x));
                    main.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].Scale.y));

                    //if (val[idx].isMp4) {
                    //    main.setAttribute('play', 'true');
                    //}

                    AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                        primitive: 'plane', height: defobj[idx].Scale.y, width: defobj[idx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                    });

                    if (!val[idx].isMp4) {
                        if (!val[idx].isGif) {
                            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                                shader: val[idx].isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        } else {
                            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                                shader: 'gif', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                            main.setAttribute('gif', "");
                        }
                    } else {
                        main.setAttribute('play', 'true');

                        // 0.1 0.9 0.2  #16 19E533  RGB  25 229 51
                        //AFRAME.utils.entity.setComponentProperty(main, 'material', {
                        //    shader: 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                        //    side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        //});

                        if(!(self.args[idx].MaterialShader)) {
                            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                                shader: 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        } else {
                            AFRAME.utils.entity.setComponentProperty(main, 'material', {
                                shader: val[idx].Shader, npot: true, src: srcname, color: '0.1 0.9 0.2', displacementMap: null, displacementBias: -0.5,
                                side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                            });
                        }
                    }
                } else {
                    main.setAttribute('gltf-model', srcname);
                    main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].Scale));
                }

                main.setAttribute('style', 'z-index: 3');

                self.arData[idx].main = main;

                //var addmainobj = { 0: self.args[idx].OAtList, 1: self.args[idx].OBtList, 2: self.args[idx].OCtList };
                //var addmainZaxis = { 0: self.args[idx].OAZList, 1: self.args[idx].OBZList, 2: self.args[idx].OCZList };

                //var addmain = {};

                if (self.args[idx].OAtList) {

                    var aelname = (val[idx].addType.A == 'gif') ? 'a-entity' : 'a-image';
                    var amain = document.createElement(aelname);

                    var apos = AFRAME.utils.coordinates.parse(self.args[idx].OAZList);
                    var posVec3a = {
                        x: (Number(posVec3.x) + Number(apos.x)).toFixed(2),
                        y: (Number(posVec3.y) + Number(apos.y)).toFixed(2),
                        z: (Number(posVec3.z) + Number(apos.z)).toFixed(2)
                    };

                    defobj[idx].posVec3a = posVec3a;

                    amain.setAttribute('id', 'amain' + (idx + 1).toString());
                    amain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3a));

                    amain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[idx].isGltf) {
                        amain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleA.x));
                        amain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleA.y));

                        if (!!(val[idx].isMp4)) {
                            amain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(amain, 'geometry', {
                            primitive: 'plane', height: defobj[idx].ScaleA.y, width: defobj[idx].ScaleA.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(amain, 'material', {
                            shader: val[idx].isGif ? 'gif' : 'standard', npot: true, src: asrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        amain.setAttribute('gltf-model', asrcname);
                        amain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleA));
                    }

                    amain.setAttribute('style', 'z-index: 4');

                    self.arData[idx].amain = amain;
                }

                if (self.args[idx].OBtList) {

                    var belname = (val[idx].addType.B == 'gif') ? 'a-entity' : 'a-image';
                    var bmain = document.createElement(belname);

                    var bpos = AFRAME.utils.coordinates.parse(self.args[idx].OBZList);
                    var posVec3b = {
                        x: (Number(posVec3.x) + Number(bpos.x)).toFixed(2),
                        y: (Number(posVec3.y) + Number(bpos.y)).toFixed(2),
                        z: (Number(posVec3.z) + Number(bpos.z)).toFixed(2)
                    };

                    defobj[idx].posVec3b = posVec3b;

                    bmain.setAttribute('id', 'bmain' + (idx + 1).toString());
                    bmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3b));

                    bmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[idx].isGltf) {
                        bmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleB.x));
                        bmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleB.y));

                        if (!!(val[idx].isMp4)) {
                            bmain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(bmain, 'geometry', {
                            primitive: 'plane', height: defobj[idx].ScaleB.y, width: defobj[idx].ScaleB.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(bmain, 'material', {
                            shader: val[idx].isGif ? 'gif' : 'standard', npot: true, src: bsrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        bmain.setAttribute('gltf-model', bsrcname);
                        bmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleB));
                    }

                    bmain.setAttribute('style', 'z-index: 4');

                    self.arData[idx].bmain = bmain;
                }

                if (self.args[idx].OCtList) {

                    var celname = (val[idx].addType.C == 'gif') ? 'a-entity' : 'a-image';
                    var cmain = document.createElement(celname);

                    var cpos = AFRAME.utils.coordinates.parse(self.args[idx].OCZList);
                    var posVec3c = {
                        x: (Number(posVec3.x) + Number(cpos.x)).toFixed(2),
                        y: (Number(posVec3.y) + Number(cpos.y)).toFixed(2),
                        z: (Number(posVec3.z) + Number(cpos.z)).toFixed(2)
                    };

                    defobj[idx].posVec3c = posVec3c;

                    cmain.setAttribute('id', 'cmain' + (idx + 1).toString());
                    cmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3c));

                    cmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                    if (!val[idx].isGltf) {
                        cmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleC.x));
                        cmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleC.y));

                        if (!!(val[idx].isMp4)) {
                            cmain.setAttribute('play', 'true');
                        }

                        AFRAME.utils.entity.setComponentProperty(cmain, 'geometry', {
                            primitive: 'plane', height: defobj[idx].ScaleC.y, width: defobj[idx].ScaleC.x, segmentsHeight: 1, segmentsWidth: 1
                        });

                        AFRAME.utils.entity.setComponentProperty(cmain, 'material', {
                            shader: val[idx].isGif ? 'gif' : 'standard', npot: true, src: csrcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        cmain.setAttribute('gltf-model', csrcname);
                        cmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[idx].ScaleC));
                    }

                    cmain.setAttribute('style', 'z-index: 4');

                    self.arData[idx].cmain = cmain;
                }

                if (val[idx].isLogo) {

                    var logo = document.createElement('a-entity');
                    var rate = (!val[idx].isMp4) ? 1 : 2;

                    deflogo[idx] = {
                        Pos: self.positionVec3Logo(Number(val[idx].isAnime), idx),
                        Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                    };

                    logo.setAttribute('id', 'logo' + (idx + 1).toString());
                    logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[idx].Pos));
                    logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[idx].Scale));
                    logo.setAttribute('gltf-model', '#lsource' + ((idx + 1) * 100 + 1).toString());
                    logo.setAttribute('style', 'z-index: 4');

                    self.arData[idx].logo = logo;
                }
            }
        },

        resetModel: function (oidx, objno) {

            var self = this;
            var val = self.arData;

            if (!val[oidx].path) {
                return;
            }

            var srcname = '#source' + (((Number(oidx) + 1) * 100) + objno).toString();

            if (val[oidx].isShadow && !(val[oidx].isGltf)) {

                var shadow = document.createElement('a-image');
                var posVec3shadow = self.positionVec3('shadow', oidx);
                var posVec3mshadow = {
                    x: (Number(posVec3shadow.x) + Number(spos.x)).toFixed(2),
                    y: (Number(posVec3shadow.y)).toFixed(2),
                    z: (Number(posVec3shadow.z) - Number(spos.y)).toFixed(2)
                };

                shadow.setAttribute('id', 'shadow' + ((oidx + 1)).toString());
                //shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(self.positionVec3('shadow', oidx)));
                shadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3mshadow));
                shadow.setAttribute('rotation', '-90 0 0');
                shadow.setAttribute('style', 'z-index: 2');

                AFRAME.utils.entity.setComponentProperty(shadow, 'geometry', {
                    primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x
                });

                //AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                //    shader: val.isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, alphaTest: 0.1,
                //    color: 'black', opacity: 0.3, depthTest: false
                //});

                if(val[oidx].isGif || !(self.args[oidx].MaterialShader)) {
                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', { 
                        shader: val[oidx].isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, 
                        alphaTest: shadowalphaTest, color: 'black', opacity: shadowopacity, depthTest: false
                    });
                } else {
                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', {
                        shader: val[oidx].Shader, npot: true, src: srcname, transparent: true, 
                        alphaTest: shadowalphaTest, color: '0.1 0.9 0.2', opacity: shadowopacity, depthTest: false
                    });
                    AFRAME.utils.entity.setComponentProperty(shadow, 'material', { 
                        shader: val[oidx].isGif ? 'gif' : 'flat', npot: true, src: srcname, transparent: true, 
                        alphaTest: shadowalphaTest, color: 'black', opacity: shadowopacity, depthTest: false
                    });
                }

                self.arData[oidx].shadow = shadow;
            }

            if (self.args[oidx].OAtList && val[oidx].isAShadow && !(val[oidx].isGltf)) {

                var ashadow = document.createElement('a-image');
                var aspos = AFRAME.utils.coordinates.parse(self.args[oidx].OAZList);
                var posVec3ashadow = {
                    x: (Number(posVec3shadow.x) + Number(aspos.x)).toFixed(2),
                    y: (Number(posVec3shadow.y)).toFixed(2),
                    z: (Number(posVec3shadow.z) - Number(aspos.y)).toFixed(2)
                };

                defobj[oidx].posVec3ashadowa = posVec3ashadow;

                ashadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                ashadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3ashadow));

                ashadow.setAttribute('rotation', '-90 0 0');
                ashadow.setAttribute('style', 'z-index: 2');
                ashadow.setAttribute('visible', !(self.arg.targetObj));

                AFRAME.utils.entity.setComponentProperty(ashadow, 'geometry', {
                    primitive: 'plane', height: (defobj[oidx].ScaleA.y), width: (defobj[oidx].ScaleA.x)
                });

                AFRAME.utils.entity.setComponentProperty(ashadow, 'material', {
                    shader: val[oidx].isGif ? 'gif' : 'flat', npot: true, src: asrcname, transparent: true, alphaTest: shadowalphaTest,
                    color: 'black', opacity: shadowopacity, depthTest: false
                });

                self.arData[oidx].ashadow = ashadow;
            }

            if (self.args[oidx].OBtList && val[oidx].isAShadow && !(val[oidx].isGltf)) {

                var bshadow = document.createElement('a-image');
                var bspos = AFRAME.utils.coordinates.parse(self.args[oidx].OBZList);
                var posVec3bshadow = {
                    x: (Number(posVec3shadow.x) + Number(bspos.x)).toFixed(2),
                    y: (Number(posVec3shadow.y)).toFixed(2),
                    z: (Number(posVec3shadow.z) - Number(bspos.y)).toFixed(2)
                };

                defobj[oidx].posVec3bshadow = posVec3bshadow;

                bshadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                bshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3bshadow));

                bshadow.setAttribute('rotation', '-90 0 0');
                bshadow.setAttribute('style', 'z-index: 2');
                bshadow.setAttribute('visible', !(self.arg.targetObj));

                AFRAME.utils.entity.setComponentProperty(bshadow, 'geometry', {
                    primitive: 'plane', height: (defobj[oidx].ScaleB.y), width: (defobj[oidx].ScaleB.x)
                });

                AFRAME.utils.entity.setComponentProperty(bshadow, 'material', {
                    shader: val[oidx].isGif ? 'gif' : 'flat', npot: true, src: bsrcname, transparent: true, alphaTest: shadowalphaTest,
                    color: 'black', opacity: shadowopacity, depthTest: false
                });

                self.arData[oidx].bshadow = bshadow;
            }

            if (self.args[oidx].OCtList && val[oidx].isAShadow && !(val[oidx].isGltf)) {

                var cshadow = document.createElement('a-image');
                var cspos = AFRAME.utils.coordinates.parse(self.args[oidx].OCZList);
                var posVec3cshadow = {
                    x: (Number(posVec3shadow.x) + Number(cspos.x)).toFixed(2),
                    y: (Number(posVec3shadow.y)).toFixed(2),
                    z: (Number(posVec3shadow.z) - Number(cspos.y)).toFixed(2)
                };

                defobj[oidx].posVec3cshadow = posVec3cshadow;

                cshadow.setAttribute('id', 'ashadow' + (oidx + 1).toString());
                cshadow.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3cshadow));

                cshadow.setAttribute('rotation', '-90 0 0');
                cshadow.setAttribute('style', 'z-index: 2');
                cshadow.setAttribute('visible', !(self.arg.targetObj));

                AFRAME.utils.entity.setComponentProperty(cshadow, 'geometry', {
                    primitive: 'plane', height: (defobj[oidx].ScaleC.y), width: (defobj[oidx].ScaleC.x)
                });

                AFRAME.utils.entity.setComponentProperty(cshadow, 'material', {
                    shader: val[oidx].isGif ? 'gif' : 'flat', npot: true, src: csrcname, transparent: true, alphaTest: shadowalphaTest,
                    color: 'black', opacity: shadowopacity, depthTest: false
                });

                self.arData[oidx].cshadow = cshadow;
            }

            var elname = '';

            if (!val[oidx].isMp4) {
                if (!val[oidx].isGif) {
                    elname = 'a-image'
                } else {
                    elname = 'a-entity'
                }
            } else if (!!(val[oidx].isMp4)) {
                elname = 'a-video'
            }

            var main = document.createElement(elname);

            var posVec3 = self.positionVec3('main', oidx);
            defobj[oidx].Pos = posVec3;
            var mpos = AFRAME.utils.coordinates.parse(self.args[oidx].OZList);
            defobj[oidx].Pos = {
                x: (Number(posVec3.x) + Number(mpos.x)).toFixed(2),
                y: (Number(posVec3.y) + Number(mpos.y)).toFixed(2),
                z: (Number(posVec3.z) + Number(mpos.z)).toFixed(2)
            };

            main.setAttribute('id', 'main' + ((oidx + 1)).toString());
            main.setAttribute('position', AFRAME.utils.coordinates.stringify(defobj[oidx].Pos));

            main.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

            if (!val[oidx].isGltf) {

                main.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.x));
                main.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale.y));

                //if (val[oidx].isMp4) {
                //    main.setAttribute('play', 'true');
                //}

                AFRAME.utils.entity.setComponentProperty(main, 'geometry', {
                    primitive: 'plane', height: defobj[oidx].Scale.y, width: defobj[oidx].Scale.x, segmentsHeight: 1, segmentsWidth: 1
                });

                if (!val[oidx].isMp4) {
                    if (!val[oidx].isGif) {
                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: val[oidx].isGif ? 'gif' : 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: 'gif', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                        main.setAttribute('gif', "");
                    }
                } else {
                    //AFRAME.utils.entity.setComponentProperty(main, 'material', {
                    //    shader: 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                    //    side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    //});
                    if(!(self.args[idx].MaterialShader)) {
                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: 'standard', npot: true, src: srcname, displacementMap: null, displacementBias: -0.5,
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    } else {
                        AFRAME.utils.entity.setComponentProperty(main, 'material', {
                            shader: (val[idx].Shader).toString(), npot: true, src: srcname, color: '0.1 0.9 0.2', displacementMap: null, displacementBias: -0.5, 
                            side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                        });
                    }
                }
            } else {
                main.setAttribute('play', 'true');

                main.setAttribute('gltf-model', srcname);
                main.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].Scale));
            }

            main.setAttribute('style', 'z-index: 3');

            self.arData[oidx].main = main;

            if (self.args[oidx].OAtList) {

                var aelname = (val[oidx].addType.A == 'gif') ? 'a-entity' : 'a-image';
                var amain = document.createElement(aelname);

                var apos = AFRAME.utils.coordinates.parse(self.args[oidx].OAZList);
                var posVec3a = {
                    x: (Number(posVec3.x) + Number(apos.x)).toFixed(2),
                    y: (Number(posVec3.y) + Number(apos.y)).toFixed(2),
                    z: (Number(posVec3.z) + Number(apos.z)).toFixed(2)
                };

                defobj[oidx].posVec3a = posVec3a;

                amain.setAttribute('id', 'amain' + (oidx + 1).toString());
                amain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3a));

                amain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val[oidx].isGltf) {
                    amain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleA.x));
                    amain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleA.y));

                    amain.setAttribute('style', 'z-index: 4');

                    if (!!(val[oidx].isMp4)) {
                        amain.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(amain, 'geometry', {
                        primitive: 'plane', height: defobj[oidx].ScaleA.y, width: defobj[oidx].ScaleA.x, segmentsHeight: 1, segmentsWidth: 1
                    });

                    AFRAME.utils.entity.setComponentProperty(amain, 'material', {
                        shader: val[oidx].isGif ? 'gif' : 'standard', npot: true, src: asrcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    amain.setAttribute('gltf-model', asrcname);
                    amain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleA));
                }

                self.arData[oidx].amain = amain;
            }

            if (self.args[oidx].OBtList) {

                var belname = (val[oidx].addType.B == 'gif') ? 'a-entity' : 'a-image';
                var bmain = document.createElement(belname);

                var bpos = AFRAME.utils.coordinates.parse(self.args[oidx].OBZList);
                var posVec3b = {
                    x: (Number(posVec3.x) + Number(bpos.x)).toFixed(2),
                    y: (Number(posVec3.y) + Number(bpos.y)).toFixed(2),
                    z: (Number(posVec3.z) + Number(bpos.z)).toFixed(2)
                };

                defobj[oidx].posVec3b = posVec3b;

                bmain.setAttribute('id', 'bmain' + (oidx + 1).toString());
                bmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3b));

                bmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val[oidx].isGltf) {
                    bmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleB.x));
                    bmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleB.y));

                    if (!!(val[oidx].isMp4)) {
                        bmain.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(bmain, 'geometry', {
                        primitive: 'plane', height: defobj[oidx].ScaleB.y, width: defobj[oidx].ScaleB.x, segmentsHeight: 1, segmentsWidth: 1
                    });

                    AFRAME.utils.entity.setComponentProperty(bmain, 'material', {
                        shader: val[oidx].isGif ? 'gif' : 'standard', npot: true, src: bsrcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    bmain.setAttribute('gltf-model', bsrcname);
                    bmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleB));
                }

                bmain.setAttribute('style', 'z-index: 4');

                self.arData[oidx].bmain = bmain;
            }

            if (self.args[oidx].OCtList) {

                var celname = (val[oidx].addType.C == 'gif') ? 'a-entity' : 'a-image';
                var cmain = document.createElement(celname);

                var cpos = AFRAME.utils.coordinates.parse(self.args[oidx].OCZList);
                var posVec3c = posVec3c = {
                    x: (Number(posVec3.x) + Number(cpos.x)).toFixed(2),
                    y: (Number(posVec3.y) + Number(cpos.y)).toFixed(2),
                    z: (Number(posVec3.z) + Number(cpos.z)).toFixed(2)
                };

                defobj[oidx].posVec3c = posVec3c;

                cmain.setAttribute('id', 'cmain' + (oidx + 1).toString());
                cmain.setAttribute('position', AFRAME.utils.coordinates.stringify(posVec3c));

                cmain.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));

                if (!val[oidx].isGltf) {
                    cmain.setAttribute('width', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleC.x));
                    cmain.setAttribute('height', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleC.y));

                    if (!!(val[oidx].isMp4)) {
                        cmain.setAttribute('play', 'true');
                    }

                    AFRAME.utils.entity.setComponentProperty(cmain, 'geometry', {
                        primitive: 'plane', height: defobj[oidx].ScaleC.y, width: defobj[oidx].ScaleC.x, segmentsHeight: 1, segmentsWidth: 1
                    });

                    AFRAME.utils.entity.setComponentProperty(cmain, 'material', {
                        shader: val[oidx].isGif ? 'gif' : 'standard', npot: true, src: csrcname, displacementMap: null, displacementBias: -0.5,
                        side: 'double', transparent: true, alphaTest: 0.1, metalness: 0, roughness: 0.5
                    });
                } else {
                    cmain.setAttribute('gltf-model', csrcname);
                    cmain.setAttribute('scale', AFRAME.utils.coordinates.stringify(defobj[oidx].ScaleC));
                }

                cmain.setAttribute('style', 'z-index: 4');

                self.arData[oidx].cmain = cmain;
            }

            if (val[oidx].isLogo) {

                var logo = document.createElement('a-entity');
                var rate = (!val[oidx].isMp4) ? 1 : 2;

                deflogo[oidx] = {
                    Pos: self.positionVec3Logo(Number(val[oidx].isAnime), oidx),
                    Scale: ((deflogoScale.x * rate) + ' ' + (deflogoScale.y * rate) + ' ' + (deflogoScale.z * rate))
                };

                logo.setAttribute('id', 'logo' + (oidx + 1).toString());
                logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[oidx].Pos));
                logo.setAttribute('scale', AFRAME.utils.coordinates.stringify(deflogo[oidx].Scale));
                logo.setAttribute('gltf-model', '#lsource' + ((oidx + 1) * 100 + 1).toString());
                logo.setAttribute('style', 'z-index: 4');

                self.arData[oidx].logo = logo;
            }
        },

        createModelAnime: function (oidx) {

            var self = this;
            var direction = getRandomIntInclusive(0, 1);
            var rate = 1;

            if (direction == 0) {
                if (self.arData[oidx].isMarkerType == 1 || self.arData[oidx].isPV) {
                    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].main, 'animation__posModel' + Number(oidx), {
                        property: 'position',
                        dir: 'alternate',
                        dur: 1000,
                        easing: 'easeInOutQuart',
                        loop: false,
                        from: defobj[oidx].Pos.x + ' ' + (Number(defobj[oidx].Pos.y) - (Number(defobj[oidx].Scale.y) * rate) * 10) + ' ' + defobj[oidx].Pos.z,
                        to: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z,
                        startEvents: 'posModel' + Number(oidx)
                    });
                    console.log('posModel' + Number(oidx));
                    console.log('from:' + defobj[oidx].Pos.x + ' ' + (Number(defobj[oidx].Pos.y) - (Number(defobj[oidx].Scale.y) * rate) * 10) + ' ' + defobj[oidx].Pos.z);
                    console.log('to:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z);
                } else {
                    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].main, 'animation__posModel' + Number(oidx), {
                        property: 'position',
                        dir: 'alternate',
                        dur: 1000,
                        easing: 'easeInOutQuart',
                        loop: false,
                        from: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + (Number(defobj[oidx].Pos.z) - (Number(defobj[oidx].Scale.z) * rate) * 10),
                        to: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z,
                        startEvents: 'posModel' + Number(oidx)
                    });
                    console.log('posModel' + Number(oidx));
                    console.log('from:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + (Number(defobj[oidx].Pos.z) - (Number(defobj[oidx].Scale.z) * rate) * 10));
                    console.log('to:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z);
                }
            } else if (direction == 1) {
                if (self.arData[oidx].isMarkerType == 1 || self.arData[oidx].isPV) {
                    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].main, 'animation__posModel' + Number(oidx), {
                        property: 'position',
                        dir: 'alternate',
                        dur: 1000,
                        easing: 'easeInOutQuart',
                        loop: false,
                        from: defobj[oidx].Pos.x + ' ' + (Number(defobj[oidx].Pos.y) + (Number(defobj[oidx].Scale.y) * rate) * 10) + ' ' + defobj[oidx].Pos.z,
                        to: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z,
                        startEvents: 'posModel' + Number(oidx)
                    });
                    console.log('posModel' + Number(oidx));
                    console.log('from:' + defobj[oidx].Pos.x + ' ' + (Number(defobj[oidx].Pos.y) + (Number(defobj[oidx].Scale.y) * rate) * 10) + ' ' + defobj[oidx].Pos.z);
                    console.log('to:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z);
                } else {
                    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].main, 'animation__posModel' + Number(oidx), {
                        property: 'position',
                        dir: 'alternate',
                        dur: 1000,
                        easing: 'easeInOutQuart',
                        loop: false,
                        from: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + (Number(defobj[oidx].Pos.z) + (Number(defobj[oidx].Scale.z) * rate) * 10),
                        to: defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z,
                        startEvents: 'posModel' + Number(oidx)
                    });
                    console.log('posModel' + Number(oidx));
                    console.log('from:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + (Number(defobj[oidx].Pos.z) + (Number(defobj[oidx].Scale.z) * rate) * 10));
                    console.log('to:' + defobj[oidx].Pos.x + ' ' + defobj[oidx].Pos.y + ' ' + defobj[oidx].Pos.z);
                }
            }

            function getRandomIntInclusive(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
            }
        },

        createAnimation: function (oidx) {

            var self = this;
            var val = self.arData;

            if (!!val[oidx].isLogo) {

                var rate = (!val[oidx].isMp4) ? 1 : 2;

                self.arData[oidx].logo.setAttribute('position', AFRAME.utils.coordinates.stringify(deflogo[oidx].Pos));

                // 反射
                //AFRAME.utils.entity.setComponentProperty(logo, 'geometry', {
                //    primitive: 'box', height: deflogoScale, width: deflogoScale, depth: deflogoScale, segmentsHeight: 1, segmentsWidth: 1
                //});
                //AFRAME.utils.entity.setComponentProperty(logo, 'material', {
                //    shader: 'standard', npot: true, src: '#lsource', displacementMap: null, displacementBias: -0.5,
                //    side: 'double', transparent: true, alphaTest: 0.1, metalness: (!!(val.isReflect) ? 1 : 0), roughness: (!!(val.isReflect) ? 0.3 : 0.5)
                //});

                if (!!val[oidx].isAnime) {

                    self.arData[oidx].logo.setAttribute('radius', (deflogo[oidx].Scale.x / 2));

                    if (val[oidx].isAnime == 1) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'linear'
                        });
                    } else if (val[oidx].isAnime == 2) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn', {
                            property: 'rotation',
                            from: '0 0 0',
                            to: '0 360 0',
                            dur: 3000,
                            loop: true,
                            easing: 'easeOutElastic',
                            elasticity: 300
                        });
                        //} else if (val[oidx].isAnime == 3) {
                        //    self.arData[oidx].logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                        //    // 弾む
                        //    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__pos', {
                        //        property: 'position',
                        //        dir: 'alternate',
                        //        dur: 400,
                        //        easing: 'easeInOutQuart',
                        //        loop: true,
                        //        from: deflogo[oidx].Pos.x + ' ' + deflogo[oidx].Pos.y + ' ' + deflogo[oidx].Pos.z,
                        //        to: deflogo[oidx].Pos.x + ' ' + (deflogo[oidx].Pos.y + (deflogo[oidx].Scale.y * rate) / 5) + ' ' + deflogo[oidx].Pos.z
                        //    });
                        //    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__scale', {
                        //        property: 'scale',
                        //        dir: 'alternate',
                        //        dur: 400,
                        //        easing: 'easeOutQuad',
                        //        loop: true,
                        //        from: deflogo[oidx].Scale.x * 1.2 + ' ' + deflogo[oidx].Scale.y* 0.8 + ' ' + deflogo[oidx].Scale.z,
                        //        to: deflogo[oidx].Scale.x * 0.8 + ' ' + deflogo[oidx].Scale.y * 1.2 + ' ' + deflogo[oidx].Scale.z
                        //    });
                    } else if (val[oidx].isAnime == 11) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn1', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'linear',
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn1'
                        });
                    } else if (val[oidx].isAnime == 12) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn2', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'easeOutElastic',
                            elasticity: 300,
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn2'
                        });
                        //} else if (val[oidx].isAnime == 13) {
                        //    self.arData[oidx].logo.setAttribute('rotation', AFRAME.utils.coordinates.stringify('0 0 0'));
                        //    // 弾む
                        //    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__pos3', {
                        //        property: 'position',
                        //        dir: 'alternate',
                        //        dur: 400,
                        //        easing: 'easeInOutQuart',
                        //        loop: false,
                        //        from: deflogo[oidx].x + ' ' + (deflogo[oidx].Pos.y + (deflogo[oidx].Scale.h * rate) / 5) + ' ' + deflogo[oidx].Pos.z,
                        //        to: deflogo[oidx].Pos.x + ' ' + deflogo[oidx].Pos.y + ' ' + deflogo[oidx].Pos.z,
                        //        startEvents: 'pos3'
                        //    });
                        //    AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__scale3', {
                        //        property: 'scale',
                        //        dir: 'alternate',
                        //        dur: 400,
                        //        easing: 'easeOutQuad',
                        //        loop: false,
                        //        from: deflogo[oidx].Scale.x * 1.2 + ' ' + deflogo[oidx].Scale.y * 0.8 + ' ' + deflogo[oidx].Scale.z,
                        //        to: deflogo[oidx].Scale.x * 0.8 + ' ' + deflogo[oidx].Scale.y * 1.2 + ' ' + deflogo[oidx].Scale.z,
                        //        startEvents: 'scale3'
                        //    });
                    }
                } else {
                    if (val[oidx].isAnime != 99) {
                        AFRAME.utils.entity.setComponentProperty(self.arData[oidx].logo, 'animation__turn0', {
                            property: 'rotation',
                            dur: 3000,
                            easing: 'easeOutElastic',
                            elasticity: 300,
                            from: '0 0 0',
                            to: '0 360 0',
                            startEvents: 'turn0'
                        });
                    }
                }
            }
        },

        objectDataVal: function (oScale, oPosition, oAngle) {

            if (oScale != null) {
                var elem = document.getElementById("debug1");
                elem.innerHTML = "WDH: " + Number(oScale).toFixed(1) + ' ∠ ' + Number(oAngle).toFixed(1);
            }

            if (oPosition != null) {
                var elem = document.getElementById("debug2");
                elem.innerHTML = "pos X: " + Number(oPosition.x).toFixed(1) + " Y: " + Number(oPosition.y).toFixed(1) + ' Z: ' + Number(oPosition.z).toFixed(1);
            }
        },

        addScene: function (oidx) {

            var self = this;
            var val = self.arData;

            if (val[oidx].isLogo) {
                self.arData[oidx].logo && self.wrap[oidx].appendChild(self.arData[oidx].logo);
            }

            self.arData[oidx].shadow && self.wrap[oidx].appendChild(self.arData[oidx].shadow);

            self.arData[oidx].cshadow && self.wrap[oidx].appendChild(self.arData[oidx].cshadow);
            self.arData[oidx].bshadow && self.wrap[oidx].appendChild(self.arData[oidx].bshadow);
            self.arData[oidx].ashadow && self.wrap[oidx].appendChild(self.arData[oidx].ashadow);

            self.arData[oidx].main && self.wrap[oidx].appendChild(self.arData[oidx].main);

            self.arData[oidx].cmain && self.wrap[oidx].appendChild(self.arData[oidx].cmain);
            self.arData[oidx].bmain && self.wrap[oidx].appendChild(self.arData[oidx].bmain);
            self.arData[oidx].amain && self.wrap[oidx].appendChild(self.arData[oidx].amain);
        },

        setScene: function () {

            var self = this;
            var val = self.arData;

            var mWrap = {};
            self.mWrap = {};

            for (idx = 0; idx < self.arg.Multi; idx++) {

                this.addScene(idx);

                var zoomRateH = defwrap[idx].Scale.y;
                var wrapZoom = 1;
                var pvAngle = -5;

                var wrapPos = { x: defwrap[idx].Pos.x, y: defwrap[idx].Pos.y, z: defwrap[idx].Pos.z };

                if (!!(val[idx].isParti)) {
                    for (var k = 0; k < self.args[idx].Particle.length; k++) {
                        if (self.args[idx].Particle[k].kind == '0') {
                            var parti = document.getElementById("arParticle" + ((idx + 1) * 100 + (k + 1)));
                            AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: false });
                        }
                    } 
                }

                if (self.arData[idx].isPV) {

                    viewmode = 'pv';

                    wrapPos.x -= 0;
                    wrapPos.y -= (!!(val[idx].isMp4) ? -1 : -0);
                    wrapPos.z -= defwrap[idx].Scale.y * 1.5;

                    wrapZoom = 0.25;
                    zoomRateH = defwrap[idx].Scale.y * wrapZoom;
                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));
                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                    markerIdx = '1';

                    var multi = document.getElementById('txtMultiNo');
                    multi.innerHTML = markerIdx;

                    if (idx > 0) {
                        self.wrap[idx].setAttribute('visible', false);
                    } else {
                        if (!!(val[idx].isParti)) {
                            for (var k = 0; k < self.args[idx].Particle.length; k++) {
                                if (self.args[idx].Particle[k].kind == '0') {
                                    var parti = document.getElementById("arParticle" + ((idx + 1) * 100 + (k + 1)));
                                    parti.setAttribute('position', '0 ' + (2.25 + wrapPos.y) + ' -15');
                                    AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: true });
                                }
                            }
                        }
                    }

                    webAr.scene.appendChild(self.wrap[idx]);

                } else {

                    if (!!(val[idx].isParti)) {
                        for (var k = 0; k < self.args[idx].Particle.length; k++) {
                            if (self.args[idx].Particle[k].kind == '0') {
                                var parti = document.getElementById("arParticle" + ((idx + 1) * 100 + (k + 1)));
                                parti.setAttribute('position', '0 2.25 -15');
                                AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: false });
                            }
                        }
                    }

                    var mk = '';

                    if (val[idx].isMarkerType == 1) {

                        viewmode = 'marker';
                        var xAngle = (!!(self.args[idx].angleList) ? Number(self.args[idx].angleList) : 0);
                        pvAngle = -30 + xAngle;

                        wrapZoom = (!(self.args[idx].WRAPZOOM)) ? 0.4 : Number(self.args[idx].WRAPZOOM) <= 0 ? 0.4 : Number(self.args[idx].WRAPZOOM);
                        zoomRateH = zoomRateH * wrapZoom;

                        defwrap[idx].Pos.y = -5;

                        mWrap[idx] = null;

                        // ARマーカー
                        mWrap[idx] = document.createElement('a-marker');
                        mWrap[idx].setAttribute('markerhandler', '');
                        mWrap[idx].setAttribute('preset', 'custom');
                        mWrap[idx].setAttribute('type', 'pattern');
                        mWrap[idx].setAttribute('id', 'arMarker' + (idx + 1).toString());
                        mWrap[idx].setAttribute('data-index', idx);

                        mk = 'pattern/p-def.patt';

                        if ((self.args[idx].markerList1) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].markerList1 + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].MkObjList) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].MkObjList + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].markerList) && (self.args[idx].markerList2)) {
                            mk = 'pattern/' + self.args[idx].markerList + '/p-' + self.args[idx].markerList2 + '.patt';
                        } else if ((self.args[idx].markerList)) {
                            mk = 'pattern/p-' + self.args[idx].markerList + '.patt';
                        }

                    } else {

                        viewmode = 'nft';
                        var xAngle = (!!(self.args[idx].angleList) ? Number(self.args[idx].angleList) : 0);
                        pvAngle = -90 + xAngle;

                        wrapZoom = (!(self.args[idx].WRAPZOOM)) ? 30 : Number(self.args[idx].WRAPZOOM) <= 0 ? 30 : Number(self.args[idx].WRAPZOOM);
                        zoomRateH = zoomRateH * wrapZoom;

                        // NFTマーカー
                        mWrap[idx] = document.createElement('a-nft');
                        mWrap[idx].setAttribute('markerhandler', '');
                        mWrap[idx].setAttribute('preset', 'custom');
                        mWrap[idx].setAttribute('type', 'nft');
                        mWrap[idx].setAttribute('id', 'arMarker' + (idx + 1).toString());
                        mWrap[idx].setAttribute('smooth', 'true');
                        mWrap[idx].setAttribute('smoothCount', '10');
                        mWrap[idx].setAttribute('smoothTolerance', '0.01');
                        mWrap[idx].setAttribute('smoothThreshold', '5');
                        mWrap[idx].setAttribute('data-index', idx);

                        if ((self.args[idx].markerList1) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList1 + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].MkObjList) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].MkObjList + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].markerList) && (self.args[idx].markerList2)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList + '/' + self.args[idx].markerList2 + '/' + self.args[idx].markerList2;
                        } else if ((self.args[idx].markerList)) {
                            mk = 'ImageDescriptors/' + self.args[idx].markerList + '/' + self.args[idx].markerList;
                        } else if ((self.args[idx].MkObjList)) {
                            mk = 'ImageDescriptors/' + self.args[idx].MkObjList + '/01';
                        }
                    }

                    self.wrap[idx].setAttribute('rotation', AFRAME.utils.coordinates.stringify(String(pvAngle) + ' 0 0'));

                    mWrap[idx].addEventListener('markerFound', function (e) {

                        let cameraWrapper = document.getElementById("camera-wrapper");
                        let camera = document.getElementById("camera");

                        let y = camera.getAttribute("rotation").y;
                        cameraWrapper.setAttribute("rotation", { y: -1 * y });

                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));

                        if (webAr.ar.arData[i].isParti) {
                            for (var k = 0; k < webAr.ar.args[i].Particle.length; k++) {
                                if (self.args[idx].particle[k].kind == '0') {
                                    var parti = document.getElementById("arParticle" + ((i + 1) * 100 + (k + 1)));
                                    AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: true });
                                }
                            }
                        }

                        if (!!(webAr.ar.arData[i].isFirework)) {
                            webAr.ar.startFireworksEvent(i);
                        }

                        if (!!(webAr.ar.arData[i].isMp4)) {
                            if (webAr.markerIdx == '') {
                                webAr.ar.arData[i].wrap.setAttribute('visible', true);
                                webAr.ar.arData[i].viewIdx = 1;
                                webAr.markerIdx += (i + 1).toString();
                                var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + webAr.ar.arData[i].srcno.obj).toString());
                                video.muted = !(webAr.ar.videosound == 1);
                                if (webAr.ar.videoState[i] < 2) {
                                    var objnm = '';
                                    if (webAr.ar.arData[0].isRandom == 8 || webAr.ar.arData[0].isRandom == 9) {
                                        objnm = video.getAttribute('object-name');
                                    }
                                    (document.getElementById("swPlay")).setAttribute('src', webAr.ar.getPlayButton(objnm));
                                    document.getElementById("swPlay").style.display = 'inline';
                                    webAr.ar.videoState[i] = 1;
                                    video.pause();
                                } else {
                                    webAr.ar.videoState[i] = 3;
                                    video.play();
                                }
                            }
                        } else {

                            webAr.ar.arData[i].viewIdx = 1;
                            webAr.markerIdx = '';
                            for (var j = 0; j < webAr.ar.arg.Multi; j++) {
                                if (!!(webAr.ar.arData[j].viewIdx)) {
                                    if (webAr.markerIdx != '') {
                                        webAr.markerIdx += ',';
                                    }
                                    webAr.markerIdx += (j + 1).toString();
                                }
                            }
                        }

                        var multi = document.getElementById('txtMultiNo');
                        multi.innerHTML = webAr.markerIdx;
                    });

                    mWrap[idx].addEventListener('markerLost', function (e) {

                        var elem = e.target || e.srcElement;
                        var elemId = elem.id;
                        var targetmarker = document.getElementById(elemId.toString());
                        var i = Number(targetmarker.getAttribute('data-index'));

                        if (webAr.ar.arData[i].isParti) {
                            for (var k = 0; k < webAr.ar.args[i].Particle.length; k++) {
                                if (self.args[idx].particle[k].kind == '0') {
                                    var parti = document.getElementById("arParticle" + ((i + 1) * 100 + (k + 1)));
                                    AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: false });
                                }
                            }
                        }

                        if (!!(webAr.ar.arData[i].isFirework)) {
                            webAr.ar.stopFireworksEvent();
                        }

                        if (!!(webAr.ar.arData[i].isMp4)) {
                            webAr.ar.arData[i].wrap.setAttribute('visible', false);
                            var video = document.querySelector('#source' + (((Number(i) + 1) * 100) + webAr.ar.arData[i].srcno.obj).toString());
                            video.muted = !(webAr.ar.videosound == 1);
                            if (webAr.ar.videoState[i] < 2) {
                                document.getElementById("swPlay").style.display = 'none';
                            } else {
                                document.getElementById("swPlay").style.display = 'none';
                                video.pause();
                                webAr.ar.videoState[i] = 2;
                            }
                        }

                        if (webAr.ar.arData[i].isRandom == 8) {
                            if (webAr.ar.arData[i].seq > 0) {
                                var objNo = webAr.ar.getRandomIntInclusive(1, webAr.ar.arData[i].srcno.length);
                                webAr.ar.removeObject(i);
                                webAr.ar.switchObject(objNo, i);
                            }
                        }

                        webAr.ar.arData[i].viewIdx = 0;
                        webAr.markerIdx = '';

                        for (var j = 0; j < webAr.ar.arg.Multi; j++) {
                            if (!!(webAr.ar.arData[j].viewIdx)) {
                                if (webAr.markerIdx != '') {
                                    webAr.markerIdx += ',';
                                }
                                webAr.markerIdx += (j + 1).toString();
                            }
                        }

                        var multi = document.getElementById('txtMultiNo');
                        multi.innerHTML = webAr.markerIdx;

                        //if (webAr.markerIdx == '') {
                        //    webAr.ar.resetGyro();
                        //}

                        let cameraWrapper = document.getElementById("camera-wrapper");
                        let camera = document.getElementById("camera");

                        let y = camera.getAttribute("rotation").y;
                        cameraWrapper.setAttribute("rotation", { y: -1 * y });

                    });

                    AFRAME.utils.entity.setComponentProperty(self.wrap[idx], 'animation', {
                        property: 'scale', dur: 5, easing: 'linear', loop: false, to: zoomRateH + ' ' + zoomRateH + ' ' + zoomRateH
                    });

                    wrapPos = { x: defwrap[idx].Pos.x, y: defwrap[idx].Pos.y, z: defwrap[idx].Pos.z };
                    self.wrap[idx].setAttribute('position', AFRAME.utils.coordinates.stringify(wrapPos));

                    mWrap[idx].setAttribute('url', AFRAME.utils.coordinates.stringify(rootPath + mk));

                    mWrap[idx].appendChild(self.wrap[idx]);
                    webAr.scene.appendChild(mWrap[idx]);

                    self.mWrap[idx] = mWrap[idx];
                }

                //this.createModelAnime(idx);

                if (!!val[idx].isLogo) {
                    this.createAnimation(idx);
                }

                self.arData[idx].yClickRate = ((!!(val[idx].isMarkerType == 1) || !!(val[idx].isPV)) ? 0.2 : 5);
                self.arData[idx].yTouchRate = ((!!(val[idx].isMarkerType == 1) || !!(val[idx].isPV)) ? 0.02 : (0.1 * wrapZoom));

                self.arData[idx].wrapPos = wrapPos;
                self.arData[idx].zoomRateH = zoomRateH;
                self.arData[idx].wrapZoom = wrapZoom;
                self.arData[idx].pvAngle = pvAngle;

                viewAngle = (pvAngle >= -30 && pvAngle <= 20) ? 0 : -90;

                this.objectDataVal(zoomRateH, wrapPos, pvAngle);
            }
        },

        resetScene: function (oidx) {

            var self = this;
            var val = self.arData;

            this.addScene(oidx);

            if (!val[oidx].isMp4) {
                document.getElementById("swPlay").style.display = 'none';
            }

            //this.createModelAnime(oidx);

            if (!!val[oidx].isLogo) {
                this.createAnimation(oidx);
            }

            this.objectDataVal(webAr.ar.arData[oidx].zoomRateH, webAr.ar.arData[oidx].wrapPos, webAr.ar.arData[oidx].pvAngle);
        },

        setOverturnEvents: function () {

            var self = this;

            var bR90 = document.getElementById('swR90');
            var bR00 = document.getElementById('swR00');
            var timer;

            bR90.addEventListener('click', function () {
                changeAngle(-objAngle);
            });

            bR00.addEventListener('click', function () {
                changeAngle(objAngle);
            });

            bR90.addEventListener(self.eventNames.start, function (e) {
                e.preventDefault();
                timer = setInterval(() => {
                    changeAngle(-(objAngle * 0.1));
                }, 10);
            });

            bR90.addEventListener(self.eventNames.end, function (e) {
                e.preventDefault();
                clearInterval(timer);
            });

            bR90.addEventListener(self.eventNames.move, function (e) {
                e.preventDefault();
                clearInterval(timer);
            });

            bR00.addEventListener(self.eventNames.start, function (e) {
                e.preventDefault();
                timer = setInterval(() => {
                    changeAngle((objAngle * 0.1));
                }, 10);
            });

            bR00.addEventListener(self.eventNames.end, function (e) {
                e.preventDefault();
                clearInterval(timer);
            });

            bR00.addEventListener(self.eventNames.move, function (e) {
                e.preventDefault();
                clearInterval(timer);
            });

            function changeAngle(angle) {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if ((webAr.ar.arData[j].pvAngle + angle) > 360) {
                        webAr.ar.arData[j].pvAngle += (angle - 360);
                    } else if ((webAr.ar.arData[j].pvAngle + angle) < -360) {
                        webAr.ar.arData[j].pvAngle += (angle + 360);
                    } else {
                        webAr.ar.arData[j].pvAngle += angle;
                    }
                    webAr.ar.arData[j].wrap.setAttribute('rotation', AFRAME.utils.coordinates.stringify((webAr.ar.arData[j].pvAngle).toString() + ' 0 0'));
                    webAr.ar.objectDataVal(webAr.ar.arData[j].zoomRateH, webAr.ar.arData[j].wrapPos, webAr.ar.arData[j].pvAngle);
                }
            };
        },

        setResizeEvents: function () {

            var self = this;

            var prevPageY;

            // 拡大・縮小
            webAr.scene.addEventListener(self.eventNames.start, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                scalechange = 0;
                prevPageY = event.pageY;    // 縦軸 or 前後軸
            });

            webAr.scene.addEventListener(self.eventNames.move, function (e) {
                var event = e.changedTouches ? e.changedTouches[0] : e;
                if (prevPageY) {
                    tapclicked = !!(tapCount = scalechange);
                    scalechange = 1;
                    var marker = webAr.markerIdx.split(',');
                    for (var i = 0; i < marker.length; i++) {
                        var j = Number(marker[i]) - 1;
                        var zoomRate = webAr.ar.arData[j].zoomRateH;
                        if ((zoomRate + (prevPageY - event.pageY) / webAr.scene.clientHeight / 5) > 0.1) {
                            var rate = ((prevPageY - event.pageY) / webAr.scene.clientHeight / 5) * webAr.ar.arData[j].wrapZoom;
                            webAr.ar.arData[j].zoomRateH += rate;
                            AFRAME.utils.entity.setComponentProperty(webAr.ar.arData[j].wrap, 'animation', {
                                property: 'scale', dur: 5, easing: 'linear', loop: false, to: webAr.ar.arData[j].zoomRateH + ' ' + webAr.ar.arData[j].zoomRateH + ' ' + webAr.ar.arData[j].zoomRateH
                            });
                            var elem = document.getElementById("debug1");
                            elem.innerHTML = "Scale: " + Number(webAr.ar.arData[j].zoomRateH).toFixed(1);
                        }
                    }
                }
            });

            webAr.scene.addEventListener(self.eventNames.end, function (e) {
                scalechange = 0;
                prevPageY = null;
            });

            function getSmall() {
                var marker = webAr.markerIdx.split(',');
                var j = Number(marker[0]);
                var zoomRate = webAr.ar.arData[j].zoomRateH;

                if (marker.length > 1) {
                    for (var i = 1; i < marker.length; i++) {
                        j = Number(marker[i]) - 1;
                        if (zoomRate > webAr.ar.arData[j].zoomRateH) {
                            zoomRate = webAr.ar.arData[j].zoomRateH;
                        }
                    }
                }
                return zoomRate;
            };
        },

        setMoveEvents: function () {

            var self = this;

            var bUP = document.getElementById('swUp');
            var bDOWN = document.getElementById('swDown');
            var timer;

            // 上下移動ボタン押下
            bUP.addEventListener('click', function () {
                moveposition('up');
            });

            bDOWN.addEventListener('click', function () {
                moveposition('down');
            });
            // ↑ 

            // UPボタン長押し
            bUP.addEventListener(self.eventNames.start, function (e) {
                e.preventDefault();
                bUP.classList.add('active');
                timer = setInterval(() => {
                    moveposition('up');
                }, 10);
            });

            bUP.addEventListener(self.eventNames.end, function (e) {
                e.preventDefault();
                bUP.classList.remove('active');
                clearInterval(timer);
            });

            bUP.addEventListener(self.eventNames.move, function (e) {
                e.preventDefault();
                bUP.classList.remove('active');
                clearInterval(timer);
            });

            // DOWNボタン長押し
            bDOWN.addEventListener(self.eventNames.start, function (e) {
                e.preventDefault();
                bDOWN.classList.add('active');
                timer = setInterval(() => {
                    moveposition('down');
                }, 10);
            });

            bDOWN.addEventListener(self.eventNames.end, function (e) {
                e.preventDefault();
                bDOWN.classList.remove('active');
                clearInterval(timer);
            });

            bDOWN.addEventListener(self.eventNames.move, function(e) {
                e.preventDefault();
                bDOWN.classList.remove('active');
                clearInterval(timer);
            });

            function moveposition(updown) {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    webAr.ar.arData[j].wrapPos = AFRAME.utils.coordinates.parse(webAr.ar.arData[j].wrap.getAttribute('position'));

                    if (!!(webAr.ar.arData[j].isParti)) {
                        for (var k = 0; k < webAr.ar.args[j].Particle.length; k++) {
                            var parti = document.getElementById("arParticle" + ((j + 1) * 100 + (k + 1)));
                            var parpos = { x: 0, y: (2.25 + Number(webAr.ar.arData[j].wrapPos.y)), z: (-15 + Number(webAr.ar.arData[j].wrapPos.z)) };
                            parti.setAttribute('position', AFRAME.utils.coordinates.stringify(parpos));
                        }
                    }
                }

                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    if (webAr.ar.arData[j].isMarkerType == 1 || webAr.ar.arData[j].isPV) {
                        if (updown == 'up') {
                            webAr.ar.arData[j].wrapPos.y += webAr.ar.arData[j].yTouchRate;
                        } else {
                            webAr.ar.arData[j].wrapPos.y -= webAr.ar.arData[j].yTouchRate;
                        }
                    } else {
                        if (updown == 'up') {
                            webAr.ar.arData[j].wrapPos.z -= webAr.ar.arData[j].yTouchRate;
                        } else {
                            webAr.ar.arData[j].wrapPos.z += webAr.ar.arData[j].yTouchRate;
                        }
                    }
                }

                for (var i = 0; i < marker.length; i++) {
                    var j = Number(marker[i]) - 1;
                    webAr.ar.arData[j].wrap.setAttribute('position', AFRAME.utils.coordinates.stringify(webAr.ar.arData[j].wrapPos));
                    webAr.ar.objectDataVal(webAr.ar.arData[j].zoomRateH, webAr.ar.arData[j].wrapPos, webAr.ar.arData[j].pvAngle);
                }
            };
        },

        setTapEvents: function () {

            var self = this;
            var val = self.arData;
            var elem = document.getElementById("version1");
            var timer = 350;

            webAr.scene.addEventListener(self.eventNames.start, function (e) {

                ++tapCount;

                if (tapclicked && tapCount > 0) {

                    setTimeout(function () {

                        if (tapclicked && tapCount == 2 && !(scalechange)) {
                            tapclicked = false;
                            var marker = webAr.markerIdx.split(',');
                            if (marker.length > 0) {
                                for (var i = 0; i < marker.length; i++) {
                                    var j = Number(marker[i]) - 1;
                                    if (webAr.ar.arData[j].seq > 0) {
                                        var objNo = ((webAr.ar.arData[j].srcno.obj + 1) <= webAr.ar.arData[j].srcno.length) ? webAr.ar.arData[j].srcno.obj + 1 : 1;
                                        switchObj(e, objNo, j);
                                    }
                                }
                            }
                            return;
                        }
                        if (tapclicked && tapCount >= 3 && !(scalechange)) {
                            tapclicked = false;
                            var marker = webAr.markerIdx.split(',');
                            if (marker.length > 0) {
                                for (var i = 0; i < marker.length; i++) {
                                    var j = Number(marker[i]) - 1;
                                    if (webAr.ar.arData[j].seq > 0) {
                                        var objNo = ((webAr.ar.arData[j].srcno.obj - 1) > 0) ? webAr.ar.arData[j].srcno.obj - 1 : webAr.ar.arData[j].srcno.length;
                                        switchObj(e, objNo, j);
                                    }
                                }
                            }
                            return;
                        }
                    }, timer);
                }

                tapclicked = true;

                setTimeout(function () {

                    if (tapclicked && tapCount == 1 && !(scalechange)) {

                        e.preventDefault();
                        var marker = webAr.markerIdx.split(',');

                        for (var i = 0; i < marker.length; i++) {
                            var j = Number(marker[i]) - 1;
                            if (j > -1) {
                                if (!(val[j].isAnime)) {
                                    if (!!(val[j].isLogo)) {
                                        if (val[j].path) {
                                            self.arData[j].logo.emit('turn0');
                                        }
                                    }
                                } else {
                                    if (val[j].isAnime == 11) {
                                        if (val[j].path && val[j].isAnime == 11) {
                                            self.arData[j].logo.emit('turn1');
                                        }
                                    }
                                    if (val[j].isAnime == 12) {
                                        if (val[j].path && val[j].isAnime == 12) {
                                            self.arData[j].logo.emit('turn2');
                                        }
                                    }
                                    if (val[j].isAnime == 13) {
                                        if (val[j].path && val[j].isAnime == 13) {
                                            self.arData[j].logo.emit('pos3');
                                            self.arData[j].logo.emit('scale3');
                                        }
                                    }
                                }
                            }
                        }
                    }
                    tapCount = 0;
                    tapclicked = false;
                }, 750);

            });

            var slideinfo = document.getElementById("slideshow");

            slideinfo.addEventListener(self.eventNames.start, function (e) {
                if (webAr.loaderEnd == 1) {
                    document.getElementById("slideshow").style.display = 'none';
                    webAr.loaderEnd = 2;
                    var slideshow = document.getElementById('slideshow');
                    slideshow.style.zIndex = '996';
                    var slidewrap = document.getElementById('slidewrap');
                    slidewrap.style.marginTop = '25%';

                    if (webAr.ar.arData[0].isPV && !!(webAr.ar.arData[0].isFirework)) {
                        webAr.ar.startFireworksEvent(0);
                    }
                }
            });

            function switchObj(e, fileno, oidx) {
                //  e =イベント  fileno = 変更後ファイル名  oidx = 現インデックス (ラッパー 及び 影・メインオブジェ・ロゴ オブジェクト a-assistのぞく)
                // ビューポートの変更(ズーム)を防止
                e.preventDefault();

                webAr.ar.removeObject(oidx);

                webAr.ar.switchObject(fileno, oidx);

                tapCount = 0;
                tapclicked = false;
            };
        },

        removeObject: function (oidx) {

            var marker = webAr.markerIdx.split(',');

            if (webAr.ar.arData[oidx].srcno.length == 1) {
                return;
            }

            if (!!(webAr.ar.arData[oidx].isMp4)) {
                if (webAr.ar.videoState[oidx] > 1) {
                    var video = document.querySelector('#source' + (((oidx + 1) * 100) + webAr.ar.arData[oidx].srcno.obj).toString());
                    video.muted = !(webAr.ar.videosound == 1);
                    video.pause();
                    webAr.ar.videoState[oidx] = 2;
                }
            }

            var shadow = document.getElementById('shadow' + (Number(oidx) + 1).toString());
            if (shadow != null) {
                shadow.remove();
            }
            var main = document.getElementById('main' + (Number(oidx) + 1).toString());
            if (main != null) {
                main.remove();
            }
            var logo = document.getElementById('logo' + (Number(oidx) + 1).toString());
            if (logo != null) {
                logo.remove();
            }
        },

        switchObject: function (fileno, oidx) {

            webAr.ar.arData[oidx].srcno.obj = fileno;
            webAr.ar.resetModel(oidx, webAr.ar.arData[oidx].srcno.obj);
            webAr.ar.resetScene(oidx);

            if (!!(webAr.ar.arData[oidx].isMp4)) {
                var video = document.querySelector('#source' + (((oidx + 1) * 100) + webAr.ar.arData[oidx].srcno.obj).toString());
                video.muted = !(webAr.ar.videosound == 1);
                if (Number(webAr.ar.videoState[oidx]) != 2 || Number(webAr.ar.videoState[oidx]) <= 0) {
                    video.pause();
                    var objnm = '';
                    if (webAr.ar.arData[0].isRandom == 8 || webAr.ar.arData[0].isRandom == 9) {
                        objnm = video.getAttribute('object-name');
                    }
                    (document.getElementById("swPlay")).setAttribute('src', webAr.ar.getPlayButton(objnm));
                    document.getElementById('swPlay').style.display = 'inline';
                    document.getElementById("info1").style.display = "none";
                    webAr.ar.videoState[oidx] = 1;
                } else {
                    video.play();
                    webAr.ar.videoState[oidx] = 3;
                }
            }

            webAr.ar.arData[oidx].wrap.setAttribute('visible', true);
        },

        setPreviewEvents: function () {

            var self = this;
            var bMarker = document.getElementById('swMulti');

            bMarker.addEventListener('click', function () {
                if (webAr.ar.arData[0].isPV) {
                    var marker = webAr.markerIdx.split(',');
                    var i = (Number(marker[0]) - 1) < 0 ? 0 : Number(marker[0]) - 1;
                    if (!!(webAr.ar.arData[i].isMp4)) {
                        if (webAr.ar.videoState[i] > 1) {
                            var video = document.querySelector('#source' + (((i + 1) * 100) + webAr.ar.arData[i].srcno.obj).toString());
                            video.muted = !(webAr.ar.videosound == 1);
                            video.pause();
                            webAr.ar.videoState[i] = 2;
                        }
                    }

                    if (webAr.ar.arData[i].isParti) {
                        for (var k = 0; k < webAr.ar.args[i].Particle.length; k++) {
                            if (self.args[idx].particle[k].kind == '0') {
                                var parti = document.getElementById("arParticle" + ((i + 1) * 100 + (k + 1)));
                                AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: false });
                            }
                        }
                    }

                    if (!!(webAr.ar.arData[i].isFirework)) {
                        webAr.ar.stopFireworksEvent();
                    }

                    webAr.ar.arData[i].wrap.setAttribute('visible', false);

                    var j = ((i + 1) < webAr.ar.arg.Multi) ? i + 1 : 0;
                    webAr.ar.arData[j].wrap.setAttribute('visible', true);
                    webAr.ar.objectDataVal(webAr.ar.arData[j].zoomRateH, webAr.ar.arData[i].wrapPos, webAr.ar.arData[i].pvAngle);

                    //webAr.ar.arData[j].main.emit('posModel' + (j));

                    var multi = document.getElementById('txtMultiNo');
                    webAr.markerIdx = (j + 1).toString();
                    multi.innerHTML = webAr.markerIdx;

                    if (!!(webAr.ar.arData[j].isMp4)) {
                        var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                        video.muted = !(webAr.ar.videosound == 1);
                        if (Number(webAr.ar.videoState[j]) != 2 || Number(webAr.ar.videoState[j]) <= 0) {
                            video.pause();
                            var objnm = '';
                            if (webAr.ar.arData[0].isRandom == 8 || webAr.ar.arData[0].isRandom == 9) {
                                objnm = video.getAttribute('object-name');
                            }
                            (document.getElementById("swPlay")).setAttribute('src', webAr.ar.getPlayButton(objnm));
                            document.getElementById('swPlay').style.display = 'inline';
                            document.getElementById("info1").style.display = "none";
                            webAr.ar.videoState[j] = 1;
                        } else {
                            video.play();
                            webAr.ar.videoState[j] = 3;
                        }
                    }

                    if (webAr.ar.arData[j].isParti) {
                        for (var k = 0; k < webAr.ar.args[j].Particle.length; k++) {
                            if (self.args[idx].particle[k].kind == '0') {
                                var parti = document.getElementById("arParticle" + ((j + 1) * 100 + (k + 1)));
                                AFRAME.utils.entity.setComponentProperty(parti, "particle-system", { enabled: true });
                            }
                        }
                    }

                    if (!!(webAr.ar.arData[j].isFirework)) {
                        webAr.ar.startFireworksEvent(0);
                    }
                }
            });
        },

        setMovieEvents: function () {
            var self = this;

            var bPlay = document.getElementById('swPlay');

            bPlay.addEventListener('click', function () {
                var marker = webAr.markerIdx.split(',');
                for (var i = 0; i < marker.length; i++) {
                    var j = (Number(marker[i]) - 1) < 0 ? 0 : Number(marker[i]) - 1;
                    if (!!(webAr.ar.arData[j].isMp4)) {
                        var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                        video.play();
                        webAr.ar.videoState[j] = 3;
                    }
                }
                document.getElementById("swPlay").style.display = 'none';
                document.getElementById("info1").style.display = "none";
            });

            window.addEventListener('focus', function (e) {
                if (webAr.loaderEnd != 0) {
                    var marker = webAr.markerIdx.split(',');
                    for (var i = 0; i < marker.length; i++) {
                        var j = Number(marker[i]) - 1;
                        if (j >= 0) {
                            if (!!(webAr.ar.arData[j].isMp4)) {
                                var video = document.querySelector('#source' + (((j + 1) * 100) + webAr.ar.arData[j].srcno.obj).toString());
                                if (webAr.ar.videoState[j] != 3) {
                                    video.pause();
                                    webAr.ar.videoState[j] = 1;
                                    var objnm = '';
                                    if (webAr.ar.arData[0].isRandom == 8 || webAr.ar.arData[0].isRandom == 9) {
                                        objnm = video.getAttribute('object-name');
                                    }
                                    (document.getElementById("swPlay")).setAttribute('src', webAr.ar.getPlayButton(objnm));
                                    document.getElementById("swPlay").style.display = 'inline';
                                }
                            }
                            var slide = document.getElementById('slideshow').style.display;
                            if (slide == 'none') {
                                if (!!(webAr.ar.arData[j].isFirework)) {
                                    webAr.ar.startFireworksEvent(j);
                                }
                            }
                        }
                    }
                }
            });

            window.addEventListener('blur', function (e) {
                if (webAr.loaderEnd != 0) {
                    if (webAr.ar.arData[0].isPV == 1) {
                        for (var j = 0; j < webAr.ar.arg.Multi; j++) {
                            VideoStop(j);
                        }
                    } else {
                        var marker = webAr.markerIdx.split(',');
                        for (var i = 0; i < marker.length; i++) {
                            var j = Number(marker[i]) - 1;
                            VideoStop(j);
                        }
                    }
                }
                webAr.ar.stopFireworksEvent();
            });

            function VideoStop(oidx) {
                if (oidx > -1) {
                    if (!!(webAr.ar.arData[oidx].isMp4)) {
                        var video = document.querySelector('#source' + (((oidx + 1) * 100) + webAr.ar.arData[oidx].srcno.obj).toString());
                        video.pause();
                        if (webAr.ar.videoState[oidx] == 3) {
                            webAr.ar.videoState[oidx] = 2;
                        } else {
                            webAr.ar.videoState[oidx] = 1;
                        }
                    }
                }
            };
        },

        setGyroValuEvents: function () {
            // デバイスの方向の変化を検出したとき
            window.addEventListener('deviceorientation', function (e) {
                // e.beta：(x軸 -180 ～ 180)    e.gamma：(y軸 -90 ～ 90)   e.alpha：(z軸 0 ～ 360)
                var elem = document.getElementById("debug3");
                elem.innerHTML = "dir X: " + Number(e.beta).toFixed(1) + " Y: " + Number(e.gamma).toFixed(1) + ' Z: ' + Number(e.alpha).toFixed(1);
            });
        },

        setSoundEvebts: function () {
            let bSound = document.getElementById("swSound");

            bSound.addEventListener('click', function () {

                var video = document.querySelector('#source' + ((webAr.markerIdx * 100) + webAr.ar.arData[(webAr.markerIdx - 1)].srcno.obj).toString());

                if (webAr.ar.videosound == 1) {
                    bSound.setAttribute("src", "asset/sound_off_w.png");
                    video.muted = true;
                    webAr.ar.videosound = 0;
                } else {
                    bSound.setAttribute("src", "asset/sound_on_w.png");
                    video.muted = false;
                    webAr.ar.videosound = 1;
                }
            });
        },

        startFireworksEvent: function (oidx) {

            var arrData = -1;
            var nexttimeout = 1;

            if (webAr.particlestart[oidx] == 0) {

                nexttimeout = 1500;

                for (var i = 0; i < webAr.ar.args[oidx].Particlefireworks.length; i++) {

                    if (Number(webAr.ar.args[oidx].Particlefireworks[i].kind) == 0) {

                        let min = Number(webAr.ar.args[oidx].Particlefireworks[i].timerrange);
                        let max = Number(webAr.ar.args[oidx].Particlefireworks[i].fireworktimer);
                        var fTimer = webAr.ar.getRandomIntInclusive(min, max);

                        function setFirstElement(j) {

                            let fpos = { x: 0, y: -110, z: 250 };
                            let posdata = (webAr.ar.args[oidx].Particlefireworks[j].pos).toString().split(',');
                            if (posdata.length >= 3) {
                                fpos = { x: Number(posdata[0]), y: Number(posdata[1]), z: Number(posdata[2]) };
                            }

                            if (document.getElementById('arFirework' + (j + 1).toString()) != null) {
                                document.getElementById('arFirework' + (j + 1).toString()).remove();
                            }

                            let fws = document.createElement('a-entity');
                            fws.setAttribute('ID', 'arFirework' + (j + 1).toString());
                            fws.setAttribute('class', 'pFirework');
                            fws.setAttribute('position', AFRAME.utils.coordinates.stringify(fpos));
                            fws.setAttribute('particle-firework', webAr.ar.args[oidx].Particlefireworks[j].particlefirework);
                            let pf = webAr.ar.args[oidx].Particlefireworks[j].particlefirework;
                            let useTrail = 0;
                            if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) == 0 && Number(webAr.ar.args[oidx].Particlefireworks[j].trail) == 1) {
                                pf += ',useTrail: ' + webAr.ar.args[oidx].Particlefireworks[j].trail;
                            } else if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) <= -1) {
                                useTrail = webAr.ar.getRandomIntInclusive(0, 1);
                                pf += ',useTrail: ' + (useTrail).toString();
                            }
                            let useBloom = 0;
                            if (Number(webAr.ar.args[oidx].Particlefireworks[j].bloom) == 0 && Number(webAr.ar.args[oidx].Particlefireworks[j].bloom) == 1) {
                                pf += ',useBloom: ' + webAr.ar.args[oidx].Particlefireworks[j].bloom;
                            } else if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) <= -1) {
                                useBloom = webAr.ar.getRandomIntInclusive(0, 1);
                                pf += ',useBloom: ' + (useBloom).toString();
                            }
                            pf += ',pState:0}';
                            fws.setAttribute('particle-firework', pf);

                            document.getElementById('arScene').appendChild(fws);

                        };

                        setTimeout(setFirstElement, fTimer, i);
                    } 
                }

                webAr.particlestart[oidx] = 1;
            }

            setTimeout(function () {

                let fireworksidx = new Array();

                for (var i = 0; i < webAr.ar.args[oidx].Particlefireworks.length; i++) {
                    if (Number(webAr.ar.args[oidx].Particlefireworks[i].kind) == 1) {
                        fireworksidx.push(i);
                        arrData = i;
                    }
                }

                webAr.fireworksInterval = new Array();

                if (arrData > -1) {
                    for (var i = 0; i < fireworksidx.length; i++) {
                        let min = Number(webAr.ar.args[oidx].Particlefireworks[fireworksidx[i]].timerrange);
                        let max = Number(webAr.ar.args[oidx].Particlefireworks[fireworksidx[i]].fireworktimer);
                        var fTimer = webAr.ar.getRandomIntInclusive(min, max);

                        function setNextElement(j) {
                            webAr.ar.createFirework(j[0], j[1]);
                        //    webAr.ar.removeFireworks();
                        };

                        webAr.fireworksInterval.push(setInterval(setNextElement, fTimer, [oidx, fireworksidx[i]]));
                        console.log('Particle-fireworks no.' + fireworksidx[i] +' Interval : ' + fTimer);
                    }

                }
            }, nexttimeout);
        },

        stopFireworksEvent: function () {
            for (var i = 0; i < webAr.fireworksInterval.length; i++) {
                clearInterval(webAr.fireworksInterval[i]);
            }
        },

        createFirework: function (oidx, row) {

            function genCirclePoint(radius1, hei, radius2) {
                var rand = Math.random() * Math.PI;
                var xsign = Math.random() > 0.5 ? 1 : -1;
                var r = Math.random() * (radius2 - radius1) + radius1;

                //var x = r * Math.sin(rand) * xsign;
                //var z = r * Math.cos(rand);
                //if (z > 0) {
                //    z = z * -1;
                //};

                var x = webAr.ar.getRandomDecimal(radius1 * -1, radius1);
                var y = webAr.ar.getRandomDecimal(hei, (hei + 50));
                var z = radius2;
                //var p = new THREE.Vector3(x, hei, z);
                //var p = new THREE.Vector3(x, hei, radius2);
                var p = new THREE.Vector3(x, y, z);
                return p;
            };

            function genFireWork(pos, j) {

                if (document.getElementById('arFirework' + (j + 1).toString()) != null) {
                    document.getElementById('arFirework' + (j + 1).toString()).remove();
                }

                let fws = document.createElement('a-entity');
                fws.setAttribute('ID', 'arFirework' + (row + 1).toString());
                fws.setAttribute('class', 'pFirework');
                fws.setAttribute('position', AFRAME.utils.coordinates.stringify(pos));

                let pf = webAr.ar.args[oidx].Particlefireworks[j].particlefirework;
                let useTrail = 0;
                if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) == 0 && Number(webAr.ar.args[oidx].Particlefireworks[j].trail) == 1) {
                    pf += ',useTrail: ' + webAr.ar.args[oidx].Particlefireworks[j].trail;
                } else if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) <= -1) {
                    useTrail = webAr.ar.getRandomIntInclusive(0, 1);
                    pf += ',useTrail: ' + (useTrail).toString();
                }
                let useBloom = 0;
                if (Number(webAr.ar.args[oidx].Particlefireworks[j].bloom) == 0 && Number(webAr.ar.args[oidx].Particlefireworks[j].bloom) == 1) {
                    pf += ',useBloom: ' + webAr.ar.args[oidx].Particlefireworks[j].bloom;
                } else if (Number(webAr.ar.args[oidx].Particlefireworks[j].trail) <= -1) {
                    useBloom = webAr.ar.getRandomIntInclusive(0, 1);
                    pf += ',useBloom: ' + (useBloom).toString();
                }
                pf += ',pState:0}';
                
                fws.setAttribute('particle-firework', pf);
                document.getElementById('arScene').appendChild(fws);
            };

            var fpos = { x: 0, y: -30, z: -120 };
            var posdata = (webAr.ar.args[oidx].Particlefireworks[row].pos).toString().split(',');
            if (posdata.length >= 3) {
                fpos = { x: Number(posdata[0]), y: Number(posdata[1]), z: Number(posdata[2]) };
            }
            var pos = genCirclePoint(fpos.x, fpos.y, fpos.z);
            genFireWork(pos, row);
        },

        removeFireworks: function () {

            var el = document.querySelectorAll('.pFirework');
            if (el.length > 0) {
                for (var i = 0; i < el.length; i++) {
                    var pf = el[i].getAttribute('particle-firework');
                }
            }
        },

        //setGyroReset: function () {

        //    let btn = document.getElementById("btn");
        //    let cameraWrapper = document.getElementById("camera-wrapper");
        //    let camera = document.getElementById("camera");

        //    btn.addEventListener("click", () => {
        //        let y = camera.getAttribute("rotation").y;
        //        cameraWrapper.setAttribute("rotation", { y: -1 * y });
        //    });
        //},

        setDiplayBtn: function (mode) {

            var self = this;
            var val = self.arData;

            document.getElementById("modeSwitch").style.display = "inline";
            document.getElementById("swUp").style.display = 'inline';
            document.getElementById("swDown").style.display = 'inline';

            document.getElementById("swPlay").style.display = 'none';

            if (webAr.ar.arData[0].oType != 'mp4') {
                document.getElementById("swSound").style.display = "none";

                document.getElementById("info1").style.display = "none";
                document.getElementById("swScrshot").style.display = "inline";
                document.getElementById("swCamera").style.display = "inline";
            } else {
                document.getElementById("info1").style.display = "inline";
                document.getElementById("swScrshot").style.display = "none";
                document.getElementById("swCamera").style.display = "none";

                document.getElementById("swSound").style.display = "inline";
            }

            if (val[0].isMarkerType == 1 || !!(val[0].isPV)) {
                document.getElementById("arloader").style.display = 'none';
            }

            this.resetGyro();
        },

        setLoaderEvents: function () {

            var loader = document.querySelector('a-assets');

            loader.addEventListener('loaded', function (e) {
                // ロード完了
                webAr.loaderEnd = 1;
                var mloader = document.getElementById('mloader3');
                mloader.innerHTML = '※ 画面をタップすると表示を開始します。';
                if (!!(webAr.ar.arData[0].isPV)) {
                    if (!!(webAr.ar.arData[0].isMp4)) {
                        var video = document.querySelector('#source101');
                        var objnm = '';
                        if (webAr.ar.arData[0].isRandom == 8 || webAr.ar.arData[0].isRandom == 9) {
                            objnm = video.getAttribute('object-name');
                        }
                        (document.getElementById("swPlay")).setAttribute('src', webAr.ar.getPlayButton(objnm));
                        document.getElementById("swPlay").style.display = 'inline';
                        video.pause();
                        webAr.ar.videoState[0] = 1;
                    }
                }
                document.getElementById("arloader").style.display = 'none';
            });
        },

        resetGyro: function () {
            var cameraWrapper = document.getElementById("camera-wrapper");
            var camera = document.getElementById("camera");
            var y = camera.getAttribute("rotation").y;
            cameraWrapper.setAttribute("rotation", { y: -1 * y });
        },

        positionVec3Logo: function (anime, oidx) {
            var self = this;
            var h1_2 = (self.arData[oidx].size.h / 5);
            var margin = (!!(self.arData[oidx].isMp4) ? 0.25 : 0);

            return { x: 0, y: -h1_2 - margin, z: 0 };
        },

        positionVec3: function (type, oidx) {
            var self = this;
            var h1 = self.arData[oidx].size.h;
            var h1_2 = self.arData[oidx].size.h / 2;

            var i = (!!(self.args[oidx].pv) ? h1_2 : (!!(self.args[oidx].isMarkerType == 1) ? -h1 * 5 : 0));

            if (type === 'shadow') {
                return { x: 0, y: 0, z: -h1_2 };
            } else {
                return { x: 0, y: h1_2, z: 0 };
            }
        },

        readParticleXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            };

            function setXmldata(xmldata) {

                var data = new Array();

                var cKind = xmldata.getElementsByTagName("kind");
                var cAttribute = xmldata.getElementsByTagName("attribute");
                var cId = xmldata.getElementsByTagName("idnm");
                var cPos = xmldata.getElementsByTagName("pos");
                var cParti = xmldata.getElementsByTagName("partisys");
                var cFireWorks = xmldata.getElementsByTagName("fireworks");
                var cAssets = xmldata.getElementsByTagName("assets");
                var cAssetsid = xmldata.getElementsByTagName("assetsid");
                var cAssetssrc = xmldata.getElementsByTagName("assetssrc");
                var cStarttime = xmldata.getElementsByTagName("starttime");
                var cDuration = xmldata.getElementsByTagName("duration");

                var len = cId.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        kind: (cKind[i] != null) ? Number(cKind[i].textContent) : '0',
                        attribute: (cAttribute[i] != null) && cAttribute[i].textContent,
                        idnm: (cId[i] != null) && cId[i].textContent,
                        pos: (cPos[i] != null) && cPos[i].textContent,
                        partisys: (cParti[i] != null) && cParti[i].textContent,
                        fireworks: (cFireWorks[i] != null) && cFireWorks[i].textContent,
                        assets: (cAssets[i] != null) && cAssets[i].textContent,
                        assetsid: (cAssetsid[i] != null) && cAssetsid[i].textContent,
                        assetssrc: (cAssetssrc[i] != null) && cAssetssrc[i].textContent,
                        starttime: (cStarttime[i] != null) ? Number(cStarttime[i].textContent) : 0,
                        duration: (cDuration[i] != null) ? Number(cDuration[i].textContent) : 0

                    };
                };

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        },

        readFireworksXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            };

            function setXmldata(xmldata) {

                var data = new Array();

                var cKind = xmldata.getElementsByTagName("kind");
                var cBasePos = xmldata.getElementsByTagName("basepos");
                var cPos = xmldata.getElementsByTagName("pos");
                var cPparticlefirework = xmldata.getElementsByTagName("particlefirework");
                var cTrail = xmldata.getElementsByTagName("trail");
                var cBloom = xmldata.getElementsByTagName("bloom");
                var cFireworktimer = xmldata.getElementsByTagName("fireworktimer");
                var cTimerrange = xmldata.getElementsByTagName("timerrange");

                var len = cKind.length;
                for (var i = 0; i < len; i++) {

                    data[i] = {
                        kind: (cKind[i] != null) && cKind[i].textContent,
                        basepos: (cBasePos[i] != null) && cBasePos[i].textContent,
                        pos: (cPos[i] != null) && cPos[i].textContent,
                        particlefirework: (cPparticlefirework[i] != null) && cPparticlefirework[i].textContent,
                        trail: (cTrail[i] != null) && cTrail[i].textContent,
                        bloom: (cBloom[i] != null) && cBloom[i].textContent,
                        fireworktimer: (cFireworktimer[i] != null) && cFireworktimer[i].textContent,
                        timerrange: (cTimerrange[i] != null) && cTimerrange[i].textContent
                    };
                };

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        },

        readBaseXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            };

            function setXmldata(xmldata) {

                var data = new Array();

                var cEd = xmldata.getElementsByTagName("ed0");
                var cAr = xmldata.getElementsByTagName("ar0");
                var cPv = xmldata.getElementsByTagName("pv");
                var cLen = xmldata.getElementsByTagName("len");
                var cWzoom = xmldata.getElementsByTagName("wzoom");
                var cXyz = xmldata.getElementsByTagName("xyz");
                var cParti = xmldata.getElementsByTagName("parti");
                var cFireworks = xmldata.getElementsByTagName("fireworks");

                var len = cEd.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        ed: (cEd[i] != null) && cEd[i].textContent,
                        ar: (cAr[i] != null) && cAr[i].textContent,
                        pv: (cPv[i] != null) && cPv[i].textContent,
                        len: (cLen[i] != null) && cLen[i].textContent,
                        wzoom: (cWzoom[i] != null) && cWzoom[i].textContent,
                        xyz: (cXyz[i] != null) && cXyz[i].textContent,
                        parti: (cParti[i] != null) && cParti[i].textContent,
                        fireworks: (cFireworks[i] != null) && cFireworks[i].textContent
                    };
                };

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        },

        readPcsXml: function (filenm) {
            var xmlhttp = new XMLHttpRequest();
            var xml = new Array();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var xmlTb = xmlhttp.responseXML;
                    xml = setXmldata(xmlTb);
                }
            };

            function setXmldata(tabelnm) {

                var data = new Array();

                var cEd = tabelnm.getElementsByTagName("ed1");
                var cAr = tabelnm.getElementsByTagName("ar1");
                var cM = tabelnm.getElementsByTagName("m");
                var cM1 = tabelnm.getElementsByTagName("m1");
                var cM2 = tabelnm.getElementsByTagName("m2");
                var cMo = tabelnm.getElementsByTagName("mo");
                var cT = tabelnm.getElementsByTagName("t");
                var cXs = tabelnm.getElementsByTagName("xs");
                var cXsa = tabelnm.getElementsByTagName("xsa");
                var cXsb = tabelnm.getElementsByTagName("xsb");
                var cXsc = tabelnm.getElementsByTagName("xsc");
                var cAn = tabelnm.getElementsByTagName("an");
                var cWh = tabelnm.getElementsByTagName("wh");
                var cWha = tabelnm.getElementsByTagName("wha");
                var cWhb = tabelnm.getElementsByTagName("whb");
                var cWhc = tabelnm.getElementsByTagName("whc");
                var cWrapzoom = tabelnm.getElementsByTagName("wrapzoom");
                var cMaterialshader = tabelnm.getElementsByTagName("materialshader");
                var cO = tabelnm.getElementsByTagName("o");
                var cO1 = tabelnm.getElementsByTagName("o1");
                var cO2 = tabelnm.getElementsByTagName("o2");
                var cO3 = tabelnm.getElementsByTagName("o3");

                var cOa = tabelnm.getElementsByTagName("oa");
                var cOb = tabelnm.getElementsByTagName("ob");
                var cOc = tabelnm.getElementsByTagName("oc");

                var cWrapZ = tabelnm.getElementsByTagName("wrapz");
                var cOZ = tabelnm.getElementsByTagName("oz");
                var cOaZ = tabelnm.getElementsByTagName("oaz");
                var cObZ = tabelnm.getElementsByTagName("obz");
                var cOcZ = tabelnm.getElementsByTagName("ocz");

                var cBg = tabelnm.getElementsByTagName("bg");

                var cL = tabelnm.getElementsByTagName("l");

                var cPar = tabelnm.getElementsByTagName("par");
                var cFirework = tabelnm.getElementsByTagName("firework");

                var len = cM.length;
                for (var i = 0; i < len; i++) {
                    data[i] = {
                        ed: (cEd[i] != null) && cEd[i].textContent,
                        ar: (cAr[i] != null) && cAr[i].textContent,
                        m: (cM[i] != null) && cM[i].textContent,
                        m1: (cM1[i] != null) && cM1[i].textContent,
                        m2: (cM2[i] != null) && cM2[i].textContent,
                        mo: (cMo[i] != null) && cMo[i].textContent,
                        t: (cT[i] != null) && cT[i].textContent,
                        xs: (cXs[i] != null) && cXs[i].textContent,
                        xsa: (cXsa[i] != null) && cXsa[i].textContent,
                        xsb: (cXsb[i] != null) && cXsb[i].textContent,
                        xsc: (cXsc[i] != null) && cXsc[i].textContent,
                        an: (cAn[i] != null) && cAn[i].textContent,
                        wh: (cWh[i] != null) && cWh[i].textContent,
                        wha: (cWha[i] != null) && cWha[i].textContent,
                        whb: (cWhb[i] != null) && cWhb[i].textContent,
                        whc: (cWhc[i] != null) && cWhc[i].textContent,
                        wrapzoom: (cWrapzoom[i] != null) && cWrapzoom[i].textContent,
                        materialshader: (cMaterialshader[i] != null) && cMaterialshader[i].textContent,
                        o: (cO[i] != null) && cO[i].textContent,
                        o1: (cO1[i] != null) && cO1[i].textContent,
                        o2: (cO2[i] != null) && cO2[i].textContent,
                        o3: (cO3[i] != null) && cO3[i].textContent,

                        oa: (cOa[i] != null) && cOa[i].textContent,
                        ob: (cOb[i] != null) && cOb[i].textContent,
                        oc: (cOc[i] != null) && cOc[i].textContent,

                        wrapz: (cWrapZ[i] != null) && cWrapZ[i].textContent,
                        oz: (cOZ[i] != null) && cOZ[i].textContent,
                        oaz: (cOaZ[i] != null) && cOaZ[i].textContent,
                        obz: (cObZ[i] != null) && cObZ[i].textContent,
                        ocz: (cOcZ[i] != null) && cOcZ[i].textContent,

                        bg: (cBg[i] != null) && cBg[i].textContent,

                        l: (cL[i] != null) && cL[i].textContent,

                        par: (cPar[i] != null) && cPar[i].textContent,
                        firework: (cFirework[i] != null) && cFirework[i].textContent
                    };
                };

                return data;
            };

            xmlhttp.open("GET", filenm, false);
            xmlhttp.send(null);

            return xml;
        },

        getPlayButton: function (filenm) {

            var file = 'asset/play-w-optiy.png';
            var playimg = 'asset/play-w-optiy.png';
            var fsize = -1;

            if (!(filenm)) {
                var imgno = ('00' + Number(getRandom(1, 20))).slice(-2);
                file = 'asset/play-optiy/' + imgno + '.png';
            } else {
                file = 'asset/play-optiy/' + filenm + '.png';
            }

            fsize = file.fileSize;

            if (fsize != -1) {
                playimg = file;
            }

            return playimg;

            function getRandom(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
            }
        },

        getRandomIntInclusive: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
        },

        getRandomDecimal: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.random() * (max - min + 1) + min; //The maximum is inclusive and the minimum is inclusive
        },

        Err_Exit: function (msg) {
            window.alert(msg);
            //warningmsg = msg.replace('\n', '<br/>');
            var msg = (msg.replace('\n', '<br/>'));
            
            location.href = "warning.html" + '?msg=' + window.btoa(unescape(encodeURIComponent(msg))); 
        }
    };

    webAr.ar = ar;
    webAr.ar.init();

    webAr.ar.setDiplayBtn(!!(ar.args[0].pv));

    webAr.srcno = srcno;

    webAr.defAngle = defAngle;
    webAr.defPos = defPos;
    webAr.defScale = defScale;
    webAr.defwrapPos = defwrapPos;
    webAr.defwrapScale = defwrapScale;
    webAr.deflogoScale = deflogoScale;
    webAr.markerIdx = markerIdx;
    webAr.loaderEnd = loaderEnd;
    webAr.fireworksInterval = fireworksInterval;
    webAr.particlestart = particlestart;

    webAr.ar.setGyroValuEvents();
    webAr.ar.setLoaderEvents();

}());
