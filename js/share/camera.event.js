var cameraFacing = false;

window.addEventListener('DOMContentLoaded', function () {

    var change_btn = document.getElementById('swCamera');

    // clickイベントリスナーで、切り替えボタンがタップされた時に切り替えを行う。
    change_btn.addEventListener("click", function (e) {

        e.preventDefault();

        var vi = document.querySelector('video');
        const mode = cameraFacing ? "environment" : "user";

        // フロントカメラをそのまま使うと、左右反転してしまうので、activeクラスとcssでミラー処理
        cameraFacing ? document.querySelector('video').classList.remove("active") : document.querySelector('video').classList.add("active");
        // canvasはAR.jsを使っている時
        cameraFacing ? document.querySelector('canvas').classList.remove("active") : document.querySelector('canvas').classList.add("active");

        // Android Chromeでは、セッションを一時停止しないとエラーが出ることがある
        stopStreamedVideo(vi);

        // カメラ切り替え
        navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
            .then(stream => vi.srcObject = stream)
            .catch(err => alert(`${err.name} ${err.message}`));

        cameraFacing = !cameraFacing;

    })
});

// videoセッション一時停止
function stopStreamedVideo(videoElem) {

    let stream = videoElem.srcObject;
    let tracks = stream.getTracks();

    tracks.forEach(function (track) {
        track.stop();
    });

    videoElem.srcObject = null;
}

window.addEventListener('DOMContentLoaded', function () {

    var image = document.getElementById('swScrshot');

    //スナップショットボタン
    image.addEventListener("click", function (e) {

        var res = window.confirm("スナップショットを行います。");

        if (res == true) {

            e.preventDefault();

            var video = document.querySelector('video');
            var snap = takeSnapshot(video);

            location.reload();

            var win = window.open();
            win.document.write("<img src='" + snap + "'/>");
        }
    })
});

//スナップショットを撮る
function takeSnapshot(video) {

    var resizedCanvas = document.createElement("canvas");
    var resizedContext = resizedCanvas.getContext("2d");
    var width = video.videoWidth;
    var height = video.videoHeight;
    var aScene = document.querySelector("a-scene").components.screenshot.getCanvas("perspective");

    if (width && height) {

        //videoのサイズをキャンバスにセット
        resizedCanvas.width = width;
        resizedCanvas.height = height;

        //キャンバスにvideoをコピー
        resizedContext.drawImage(video, 0, 0, width, height);

        //カメラの画角でar側の縮小処理を変える
        if (width > height) {
            // 横長（PC)
            resizedContext.drawImage(aScene, 0, 0, width, height);
        } else {
            // 縦長（スマホ）
            var scale = height / width;
            var scaledWidth = height * scale;
            var marginLeft = (width - scaledWidth) / 2;

            resizedContext.drawImage(aScene, marginLeft, 0, scaledWidth, height);
        }

        return resizedCanvas.toDataURL('image/png');
    }
}