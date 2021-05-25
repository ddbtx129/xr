
(function () {
    
    var js = document.scripts;

    js = js[js.length - 1];

    var path = js.src.substring(0, js.src.lastIndexOf("/") + 1);

    function randomNormal(min, max) {
        let rand = 0;
        for (let n = 0; n < 6; n++)
            rand += Math.random();
        return min + (max - min) * (rand / 6);
    }

    function randomUniform(min, max) {
        return min + (max - min) * Math.random();
    }

    //var img = new Array();
    //var idx = 0;
    //var len = 1;

    AFRAME.registerComponent('four-season', {


        schema: {
            pos: {
                type: 'string',
                default: '0 2.25 -15'
            },
            texture: {
                type: 'string',
                default: 'images/particles/sparkle.png'
            },
            images: {
                type: 'array',
                default: ['images/spring/01.png', 'images/spring/02.png', 'images/spring/03.png',
                    'images/summer/01.png', 'images/summer/02.png', 'images/summer/03.png',
                    'images/autumn/01.png', 'images/autumn/02.png', 'images/autumn/03.png',
                    'images/winter/01.png', 'images/winter/02.png', 'images/winter/03.png',]
            },
            partisys: {
                type: 'string',
                default: 'preset: snow; opacity: 0.7; ParticleCount: 500; size: 4, enabled: true'
            },
            starttime: {
                type: 'number',
                default: 1000
            },
            duration: {
                type: 'number',
                default: 3000
            }
        },

        init: function () {

            this.fElement = this.el;

            this.idx = 0;
            this.len = this.data.images.length;

            this.pos = this.data.pos;
            this.images = this.data.images;
            this.partisys = this.data.partisys;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            for (var i = 0; i < this.images.length; i++) {
                var assist = document.createElement('a-assist');
                assist.setAttribute('id', 'afourseason' + (i + 1).toString());
                assist.setAttribute('src', path + this.images[i]);
                this.fElement.appendChild(assist);
            }

            var parti = document.createElement('a-entity');
            parti.setAttribute('id', 'fourseason' + (this.idx + 1).toString());
            parti.setAttribute('one-season', 'pos', this.pos);
            parti.setAttribute('one-season', 'texture', '#afourseason' + (this.idx + 1).toString());
            parti.setAttribute('one-season', 'partisys', this.partisys);
            parti.setAttribute('one-season', 'starttime', this.starttime);
            parti.setAttribute('one-season', 'duration', this.duration);
            this.fElement.appendChild(parti);

            this.idx += 1;

            this.tick = AFRAME.utils.throttle(this.tick, this.duration - this.starttime, this);
        },

        tick: function (time, dt) {

            var parti = document.createElement('a-entity');
            parti.setAttribute('id', 'fourseason' + (this.idx + 1).toString());
            parti.setAttribute('one-season', 'pos', this.pos);
            parti.setAttribute('one-season', 'texture', '#afourseason' + (this.idx + 1).toString());
            parti.setAttribute('one-season', 'partisys', this.partisys);
            parti.setAttribute('one-season', 'starttime', this.starttime);
            parti.setAttribute('one-season', 'duration', this.duration);
            //parti.setAttribute('position', this.pos);
            //parti.setAttribute('particle-system', ('texture: ' + path + this.images[this.idx] + ';' + this.partisys));
            console.log(('texture: ' + path + this.images[this.idx] + ',' + this.partisys));
            this.fElement.appendChild(parti);

            //function remove(val) {
            //    var parti = document.querySelector('#fourseason' + (val[0] + 1).toString());
            //    if (parti != null) {
            //        parti.remove();
            //    }
            //};

            //setTimeout(remove, Number(this.duration), [this.idx]);

            if ((this.idx + 1) < this.len) {
                this.idx += 1;
            } else {
                this.idx = 0;
            }
        }
    });

    AFRAME.registerComponent('one-season', {

        schema: {
            pos: {
                type: 'string',
                default: '0 2.25 -15'
            },
            texture: {
                type: 'string',
                default: 'images/spring/01.png'
            },
            partisys: {
                type: 'string',
                default: 'preset: snow; ParticleCount: 500; size: 4, enabled: true'
            },
            opacity: {
                type: 'number',
                default: 0.7
            },
            starttime: {
                type: 'number',
                default: 1000
            },
            duration: {
                type: 'number',
                default: 3000
            }
        },

        init: function () {

            this.fElement = this.el;

            this.idx = 0;

            this.pos = this.data.pos;
            this.texture = this.data.texture;
            this.partisys = this.data.partisys;
            this.opacity = this.data.opacity;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            this.fElement.setAttribute('position', this.pos);
            this.fElement.setAttribute('particle-system', ('texture: ' + this.texture + '; opacity: ' + this.opacity + '; ' + this.partisys));

            //this.view = false;
            this.len = 0;
            this.tick = AFRAME.utils.throttle(this.tick, (this.duration / 2), this);

        },

        tick: function (time, dt) {

            if (this.len > 0) {
                if (this.len == 1) {
                    this.fElement.setAttribute('particle-system', ('texture: ' + this.texture + '; opacity: ' + (this.opacity / 2) + '; ' + this.partisys));
                } else {
                    let element = this.el;
                    element.parentNode.removeChild(element);
                }
            }

            this.len += 1;
        }
    });

}());