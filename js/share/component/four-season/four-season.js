
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
            },
            grouplength: {
                type: 'number',
                default: 3
            }
        },

        init: function () {

            this.fElement = this.el;

            this.idx = 0;
            this.nexttexture = 0;
            this.len = this.data.images.length;

            this.pos = this.data.pos;
            this.images = this.data.images;
            this.partisys = this.data.partisys;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;
            this.grouplength = this.data.grouplength;
            console.log('four-season [grouplegth]:' + this.grouplength);
            for (var i = 0; i < this.grouplength; i++) {

                var parti = document.createElement('a-entity');
                parti.setAttribute('id', 'fourseason' + (i + 1).toString());
                parti.setAttribute('one-season', 'pos', this.pos);
                parti.setAttribute('one-season', 'texture', this.images[this.nexttexture]);
                parti.setAttribute('one-season', 'partisys', this.partisys);
                parti.setAttribute('one-season', 'starttime', this.starttime);
                parti.setAttribute('one-season', 'duration', this.duration);

                this.fElement.appendChild(parti);
                console.log('four-season:' + this.images[this.nexttexture]);
                this.nexttexture += 1;
            }

            this.view = false;

            this.tick = AFRAME.utils.throttle(this.tick, this.duration - this.starttime, this);
        },

        tick: function (time, timeDelta) {
            
            if (this.view) {

                var element = document.querySelector('#fourseason' + (this.idx + 1).toString());

                if(element != null){
                    
                    fElement.removeAttribute("one-season");

                    element.setAttribute('one-season', 'pos', this.pos);
                    element.setAttribute('one-season', 'texture', this.images[this.nexttexture]);
                    element.setAttribute('one-season', 'partisys', this.partisys);
                    element.setAttribute('one-season', 'starttime', this.starttime);
                    element.setAttribute('one-season', 'duration', this.duration);

                    console.log('four-season by tick:' + this.images[this.nexttexture]);
                    //console.log('four-season:' + this.partisys);
                }

                if ((this.idx + 1) < this.grouplength) {
                    this.idx += 1;
                } else {
                    this.idx = 0;
                }

                if ((this.nexttexture + 1) < this.len) {
                    this.nexttexture += 1;
                } else {
                    this.nexttexture = 0;
                }
            }

            this.view = true;
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

            this.pos = this.data.pos;
            this.texture = this.data.texture;
            this.partisys = this.data.partisys;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            this.view = false;

            this.tick = AFRAME.utils.throttle(this.tick, this.duration, this);

        },

        tick: function (time, timeDelta) {
            //if (this.view) {
            //    let element = this.el;
            //    element.parentNode.removeChild(element);
            //}

            //this.view = true;
        },

        remove: function () {
            fElement.removeAttribute("position");
            fElement.removeAttribute("particle-system");
        },

        update: function () {
            this.fElement.setAttribute('position', this.pos);
            this.fElement.setAttribute('particle-system', ('texture: ' + path + this.texture + ';' + this.partisys));
        }
    });

}());