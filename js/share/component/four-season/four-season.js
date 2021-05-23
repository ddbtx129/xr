﻿//<particle>
//  <idnm>arParticle</idnm>
//  <pos>0 2.25 -15</pos>
//  <partisys>texture: asset/autumn/01.png; preset: snow; opacity: 0.7; ParticleCount: 500; size: 4, enabled: true</partisys>
//</particle>

//<particle>
//  <idnm>arParticle</idnm>
//  <pos>0 2.25 -15</pos>
//  <partisys>texture: asset/autumn/02.png; preset: snow; opacity: 0.7; ParticleCount: 500; size: 4, enabled: true</partisys>
//</particle>

//<particle>
//  <idnm>arParticle</idnm>
//  <pos>0 2.25 -15</pos>
//  <partisys>texture: asset/autumn/03.png; preset: snow; opacity: 0.7; ParticleCount: 500; size: 4, enabled: true</partisys>
//</particle>

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

    AFRAME.registerComponent('four-season', {

        schema: {
            Pos: {
                type: 'string',
                default: '0 2.25 -15'
            },
            texture: {
                type: 'string',
                default: 'images/particles/sparkle.png'
            },
            textures: {
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

            var len = this.data.textures.length;

            this.Pos = this.data.Pos;
            this.textures = this.data.textures;
            this.partisys = this.data.partisys;
            this.starttime = this.data.starttime;
            this.duration = this.data.duration;

            for (var i = 0; i < len; i++) {

                setTimeout(function (i) {
                    var parti = document.createElement('a-entity');
                    parti.setAttribute('id', 'fourseason' + (j + 1).toString());
                    parti.setAttribute('position', this.Pos);
                    parti.setAttribute('particle-system', '');
                    parti.setAttribute('particle-system', 'texture', path + this.textures[j]);
                    parti.setAttribute('particle-system', this.partisys);

                    this.fElement.appendChild(parti);

                }, Number(this.starttime));

                setTimeout(function (i) {
                    var parti = document.querySelector('#fourseason' + (j + 1).toString());
                    if (parti != null) {
                        parti.remove();
                    }
                }, Number(this.duration));
            }
        }
    });

});