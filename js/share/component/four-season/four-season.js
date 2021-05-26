
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
                default: 'preset: snow; ParticleCount: 500; size: 4'
            },
            opacity: {
                type: 'number',
                default: 0.7
            },
            enabled: {
                type: 'boolean',
                default: true
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
            this.opacity = this.data.opacity;
            this.enabled = this.data.enabled;
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
            parti.setAttribute('one-season', 'opacity', this.opacity);
            parti.setAttribute('one-season', 'enabled', this.enabled);
            parti.setAttribute('one-season', 'starttime', this.starttime);
            parti.setAttribute('one-season', 'duration', this.duration);

            this.fElement.appendChild(parti);

            this.idx += 1;

            this.tick = AFRAME.utils.throttle(this.tick, this.duration - this.starttime, this);
        },

        tick: function (time, dt) {
            console.log(this.enabled);
            if (this.enabled) {

                var parti = document.createElement('a-entity');

                parti.setAttribute('id', 'fourseason' + (this.idx + 1).toString());
                parti.setAttribute('one-season', 'pos', this.pos);
                parti.setAttribute('one-season', 'texture', '#afourseason' + (this.idx + 1).toString());
                parti.setAttribute('one-season', 'partisys', this.partisys);
                parti.setAttribute('one-season', 'opacity', this.opacity);
                parti.setAttribute('one-season', 'enabled', this.enabled);
                parti.setAttribute('one-season', 'starttime', this.starttime);
                parti.setAttribute('one-season', 'duration', this.duration);

                //console.log(('texture: ' + path + this.images[this.idx] + ',' + this.partisys));
                this.fElement.appendChild(parti);

                if ((this.idx + 1) < this.len) {
                    this.idx += 1;
                } else {
                    this.idx = 0;
                }
            }
        },

        update: function () {
            let element = this.el;

            this.fElement = this.el;
            this.len = this.data.images.length;

            this.idx = 0;

            this.pos = this.data.pos;
            this.images = this.data.images;
            this.partisys = this.data.partisys;
            this.opacity = this.data.opacity;
            this.enabled = this.data.enabled;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            if (this.fElement.childElementCount > 0) {
                for (var i = 0; i < this.fElement.childElementCount; i++) {
                    if (this.fElement.children[i].hasAttribute('one-season')) {
                        //this.fElement.children[i].setAttribute('one-season', 'enabled', this.enabled);
                        AFRAME.utils.entity.setComponentProperty(this.fElement.children[i], "one-season", { pos: this.pos });
                        AFRAME.utils.entity.setComponentProperty(this.fElement.children[i], "one-season", { enabled: this.enabled });
                    }
                }
            }
        },

        remove: function () {
            let element = this.el;

            if (this.fElement.childElementCount > 0) {
                for (var i = 0; i < this.fElement.childElementCount; i++) {
                    let element = this.el;
                    element.removeChild(element.children[i]);
                }
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
                default: 'preset: snow; ParticleCount: 500; size: 4'
            },
            opacity: {
                type: 'number',
                default: 0.7
            },
            enabled: {
                type: 'boolean',
                default: true
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
            this.enabled = this.data.enabled;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;
            console.log('particle-system');
            this.fElement.setAttribute('position', this.pos);
            this.fElement.setAttribute('particle-system', ('texture: ' + this.texture + '; opacity: ' + this.opacity + '; ' + this.partisys + '; enabled: ' + this.enabled));

            this.view = false;
            this.len = 0;
            this.tick = AFRAME.utils.throttle(this.tick, this.duration, this);
        },

        tick: function (time, dt) {
            if (this.enabled) {

                if (this.view) {
                    let element = this.el;
                    element.parentNode.removeChild(element);
                }

                this.view = true;
                this.len += 1;
            }
        },

        update: function () {

            this.fElement = this.el;

            this.idx = 0;

            this.pos = this.data.pos;
            this.texture = this.data.texture;
            this.partisys = this.data.partisys;
            this.opacity = this.data.opacity;
            this.enabled = this.data.enabled;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            AFRAME.utils.entity.setComponentProperty(this.fElement, "particle-system", { pos: this.pos });
            AFRAME.utils.entity.setComponentProperty(this.fElement, "particle-system", { enabled: this.enabled });
        }
    });

}());