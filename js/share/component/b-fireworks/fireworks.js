
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

	AFRAME.registerComponent('scatter', {

		schema:
		{
			color: {
				type: 'string',
				default: ""
			},
			texture: {
				type: "string",
				default: 'images/particles/sparkle.png'
			},
			bPos: {
				type: "array",
				default: [-0.4, 0, 8]
			},
			posfactor: {
				type: "array",
				default: [270, 0, 90]
			},
			maxWidthtLen: {
			    type: 'array',
			    default: [-3, 3]
			},
			maxHeightLen: {
				type: 'array',
				default: [4, 8]
			},
			riseTimeLen: {
				type: 'array',
				default: [2, 3]
			},
			riseTime: {
				type: 'number',
				default: 2.5
			},
			bOpacity: {
				type: 'number',
				default: 1
			},
			tOpacity: {
				type: 'number',
				default: 1
			},
			frequency: {
				type: "number",
				default: 0.75
			},
			tScale: {
			    type: "number",
			    default: 0.75
			},
			radius: {
				type: 'number',
				default: 9
			},
			pCount: {
				type: "array",
				default: [100, 999]
			},
			bVelocity: {
				type: "array",
				default: [1, 2]
			},
			bDuration:{
			    type: "array",
			    default: [1.0, 3.0]
			},
			bSpread: {
				type: "array",
				default: [4.0, 5.0]
			},
			multifirework: {
				type: "number",
				default: 0.15
			},
			loop: {
				type: "boolean",
				default: false
			}
		},

		init: function () {

			this.fElement = this.el;

			this.maxHeightLen = { min: Number(this.data.maxHeightLen[0]), max: Number(this.data.maxHeightLen[1]) };
			this.maxWidthtLen = { min: Number(this.data.maxWidthtLen[0]), max: Number(this.data.maxWidthtLen[1]) };
			this.bPos = { x: Number(this.data.bPos[0]), y: Number(this.data.bPos[1]), z: Number(this.data.bPos[2]) };
			this.posfactor = { x: Number(this.data.posfactor[0]), y: Number(this.data.posfactor[1]), z: Number(this.data.posfactor[2]) };
			this.riseTimeLen = { min: Number(this.data.riseTimeLen[0]), max: Number(this.data.riseTimeLen[1]) };
			this.pCount = { min: Number(this.data.pCount[0]), max: Number(this.data.pCount[1]) };
			this.bVelocity = { min: Number(this.data.bVelocity[0]), max: Number(this.data.bVelocity[1]) };
			this.bDuration = { min: Number(this.data.bDuration[0]), max: Number(this.data.bDuration[1]) };
			this.bSpread = { min: Number(this.data.bSpread[0]), max: Number(this.data.bSpread[1]) };

			// ランダムな飛行パラメータ
			let maxHeight = this.maxHeightLen.min;
			let riseTime = this.riseTimeLen.min;

			if (this.maxHeightLen.min >= this.maxHeightLen.max) {
				maxHeight = this.maxHeightLen.min;
			} else {
				maxHeight = randomNormal(this.maxHeightLen.min, this.maxHeightLen.max);
			}

			if (this.riseTimeLen.min >= this.riseTimeLen.max) {
				riseTime = this.riseTimeLen.min;
			} else {
				riseTime = randomNormal(this.riseTimeLen.min, this.riseTimeLen.max);
			}

			var firework = document.createElement("a-entity");
			firework.setAttribute("firework", "");
			firework.setAttribute("position", { "x": this.bPos.x, "y": this.bPos.y, "z": this.bPos.z });
			firework.setAttribute("firework", "color", this.data.color);
			firework.setAttribute("firework", "bOpacity", this.data.bOpacity);
			firework.setAttribute("firework", "tOpacity", 0.25);
			firework.setAttribute("firework", "tScale", this.data.tScale);
			firework.setAttribute("firework", "maxHeight", maxHeight);
			firework.setAttribute("firework", "riseTime", riseTime);
			firework.setAttribute("firework", "pCount", this.pCount.min + ',' + this.pCount.max);
			firework.setAttribute("firework", "bVelocity", this.bVelocity.min + ',' + this.bVelocity.max);
			firework.setAttribute("firework", "bDuration", this.bDuration.min + ',' + this.bDuration.max);
			firework.setAttribute("firework", "bSpread", this.bSpread.min + ',' + this.bSpread.max);

			this.fElement.appendChild(firework);
			this.firework = firework;
		},

		tick: function (time, deltaTime) // deltaTime: milliseconds
		{
			if (this.data.loop) {

				let deltaSeconds = deltaTime / 1000;
				let eventFrequency = this.data.frequency;

				if (Math.random() < eventFrequency * deltaSeconds) {

					let angle = THREE.Math.degToRad(this.posfactor.x);
					let angleSpread = THREE.Math.degToRad(this.posfactor.z);
					let angleRadians = angle + randomNormal(-angleSpread, angleSpread);
					let radius = this.data.radius;
				    //let x = radius * Math.cos(angleRadians);
					let x = randomNormal(this.maxWidthtLen.min, this.maxWidthtLen.max);
					let y = this.posfactor.y;
					let z = radius * Math.sin(angleRadians);

					// ランダムな飛行パラメータ
					let maxHeight = randomNormal(this.maxHeightLen.min, this.maxHeightLen.max);
					let riseTime = randomNormal(this.riseTimeLen.min, this.riseTimeLen.max);

					var firework = document.createElement("a-entity");
					firework.setAttribute("firework", "");
					firework.setAttribute("position", { "x": x, "y": y, "z": z });
					firework.setAttribute("firework", "color", this.data.color);
					firework.setAttribute("firework", "bOpacity", this.data.bOpacity);
					firework.setAttribute("firework", "tOpacity", this.data.tOpacity);
					firework.setAttribute("firework", "tScale", this.data.tScale);
					firework.setAttribute("firework", "maxHeight", maxHeight);
					firework.setAttribute("firework", "riseTime", riseTime);
					firework.setAttribute("firework", "pCount", this.pCount.min + ',' + this.pCount.max);
					firework.setAttribute("firework", "bVelocity", this.bVelocity.min + ',' + this.bVelocity.max);
					firework.setAttribute("firework", "bDuration", this.bDuration.min + ',' + this.bDuration.max);
					firework.setAttribute("firework", "bSpread", this.bSpread.min + ',' + this.bSpread.max);

					this.fElement.appendChild(firework);
					this.firework = firework;

					// 複数の花火
					// 0.10 = 1/10 double, 1/100 triple, 1/1000 quadruple, etc.
					// 0.20 =  1/5 double,  1/25 triple,  1/125 quadruple, etc.
					while (Math.random() < this.data.multifirework) {
						var fireworkExtra = document.createElement("a-entity");
						fireworkExtra.setAttribute("firework", "");
						fireworkExtra.setAttribute("position", { "x": x, "y": y, "z": z });
						// 位置、高さ、爆発までの時間を同期させる
						fireworkExtra.setAttribute("firework", "color", this.data.color);
						fireworkExtra.setAttribute("firework", "bOpacity", this.data.bOpacity);
						fireworkExtra.setAttribute("firework", "tOpacity", this.data.tOpacity);
						fireworkExtra.setAttribute("firework", "tScale", this.data.tScale);
						fireworkExtra.setAttribute("firework", "maxHeight", maxHeight);
						fireworkExtra.setAttribute("firework", "riseTime", riseTime);
						fireworkExtra.setAttribute("firework", "pCount", this.pCount.min + ',' + this.pCount.max);
						fireworkExtra.setAttribute("firework", "bVelocity", this.bVelocity.min + ',' + this.bVelocity.max);
						fireworkExtra.setAttribute("firework", "bDuration", this.bDuration.min + ',' + this.bDuration.max);
						fireworkExtra.setAttribute("firework", "bSpread", this.bSpread.min + ',' + this.bSpread.max);

						this.fElement.appendChild(fireworkExtra);
						this.fireworkExtra = fireworkExtra;
					}
				}
			} else {
				if (this.fElement.childElementCount <= 0) {
					let element = this.el;
					element.removeAttribute('scatter')
				}
			}
		},

		remove: function () {
			var self = this;

			var self = this;

			if (self.fElement.childElementCount > 0) {
				for (var i = 0; i < self.fElement.childElementCount; i++) {
					self.fElement.children[i].removeAttribute('firework');
					self.fElement.children[i].remove();
				}
			}
		}
	});

	AFRAME.registerComponent('firework', {

		schema:
		{
			color: {
				type: 'string',
				default: ""
			},
			maxHeight: {
				type: 'number',
				default: 4.5
			},
			riseTime: {
				type: 'number',
				default: 2.5
			},	// time to reach maxHeight,
			bOpacity: {
				type: 'number',
				default: 1
			},
			tOpacity: {
				type: 'number',
				default: 1
			},
			tScale: {
			    type: "number",
			    default: 0.75
			},
			texture: {
				type: "string",
				default: path + 'images/particles/sparkle.png'
			},
			pCount: {
				type: "array",
				default: [100, 999]
			},
			bVelocity: {
				type: "array",
				default: [1, 2]
			},
			bDuration: {
			    type: "array",
			    default: [1.0, 3.0]
			},
			bSpread: {
				type: "array",
				default: [4.0, 5.0]
			},
			fireball: {
				type: "string",
				default: path + 'images/fireball.png'
			},
			fireballSheet: {
				type: "string",
				default: path + 'images/fireball-up.png'
			}
		},

		randomColor: function () {
			let colorList = ["red", "orange", "gold", "green", "cyan", "#0088FF", "violet"];
			let colorIndex = Math.floor(colorList.length * Math.random());
			return colorList[colorIndex];
		},

		init: function () {
			// 設定されていない場合はランダムな色を設定
			if (this.data.color == "") {
				this.data.color = this.randomColor();
			}

			this.pCount = { min: Number(this.data.pCount[0]), max: Number(this.data.pCount[1]) };
			this.bVelocity = { min: Number(this.data.bVelocity[0]), max: Number(this.data.bVelocity[1]) };

			// 動きのアニメーションを設定する
			let p = this.el.object3D.position;
			this.el.setAttribute("animation__position", "property", "position");
			this.el.setAttribute("animation__position", "from", { "x": p.x, "y": p.y, "z": p.z });
			this.el.setAttribute("animation__position", "to", { "x": p.x, "y": p.y + this.data.maxHeight, "z": p.z });
			this.el.setAttribute("animation__position", "dur", this.data.riseTime * 1000);
			this.el.setAttribute("animation__position", "easing", "easeOutQuad");  // fast at start, then slower

			// trail effect ----------------------------------------------------------
			this.particleTrail = document.createElement("a-image");
			this.particleTrail.setAttribute("position", "0 -0.1 0");
			this.particleTrail.setAttribute("width", "0.5");
			this.particleTrail.setAttribute("height", "0.5");
			this.particleTrail.setAttribute("scale", "1 1 1");

			this.particleTrail.setAttribute("src", this.data.fireball);
			this.particleTrail.setAttribute("spritesheet-animation", "rows: 1; columns: 8; frameDuration: 0.08; loop: true;");
			this.particleTrail.setAttribute("material", "blending: additive; transparent: true; opacity: " + this.data.tOpacity + ";color:" + this.data.color);

			this.particleTrail.setAttribute("animation__fade", "property", "material.opacity");
			this.particleTrail.setAttribute("animation__fade", "from", this.data.tOpacity);
			this.particleTrail.setAttribute("animation__fade", "to", 0.2);
			this.particleTrail.setAttribute("animation__fade", "dur", this.data.riseTime * 1000);
			this.particleTrail.setAttribute("animation__fade", "easing", "easeOutQuad");  // slow at start, then fast

			this.particleTrail.setAttribute("animation__shrink", "property", "scale");
		    //this.particleTrail.setAttribute("animation__shrink", "from", "1 1 1");
		    var tScale = this.data.tScale + ' ' + this.data.tScale + ' ' + this.data.tScale;
		    this.particleTrail.setAttribute("animation__shrink", "from", tScale);
			this.particleTrail.setAttribute("animation__shrink", "to", "0.25 0.25 0.25");
			this.particleTrail.setAttribute("animation__shrink", "dur", this.data.riseTime * 1000);
			this.particleTrail.setAttribute("animation__shrink", "easing", "easeOutQuad");  // slow at start, then fast

			this.el.appendChild(this.particleTrail);

			// burst effect ----------------------------------------------------------
			this.particleBurst = document.createElement("a-entity");
			this.particleBurst.setAttribute("spe-particles", "");
			this.particleBurst.setAttribute("spe-particles", "texture", this.data.texture);
			this.particleBurst.setAttribute("spe-particles", "blending", "additive");
			this.particleBurst.setAttribute("spe-particles", "distribution", "sphere");
			this.particleBurst.setAttribute("spe-particles", "radius", 0.01);

			// 粒子は最後の瞬間に収縮と退色の両方を実行
			this.particleBurst.setAttribute("spe-particles", "opacity", [this.data.bOpacity, this.data.bOpacity, this.data.bOpacity, 0]);
			// this.particleBurst.setAttribute("spe-particles", "size", [1, 1, 1, 0]);

			let particleCount = Math.floor(randomUniform(this.pCount.min, this.pCount.max));
			this.particleBurst.setAttribute("spe-particles", "particleCount", particleCount);

			// パーティクルバーストとパーティクルストリームの変化
			if (Math.random() < 0.80) {
				this.particleBurst.setAttribute("spe-particles", "activeMultiplier", particleCount);
			} else {
				this.particleBurst.setAttribute("spe-particles", "activeMultiplier", particleCount / 128);
			}

			// note: 分布 = '球'の場合, 速度ベクトルの最初の成分のみを使用
			let baseVelocity = randomUniform(this.bVelocity.min, this.bVelocity.max);
			this.particleBurst.setAttribute("spe-particles", "velocity", { "x": baseVelocity, "y": 0, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "velocitySpread", { "x": 0.5, "y": 0, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "drag", 1.00);
			this.particleBurst.setAttribute("spe-particles", "randomizeVelocity", true);

			// 重力を少し加える
			this.particleBurst.setAttribute("spe-particles", "accelerationDistribution", "box");
			this.particleBurst.setAttribute("spe-particles", "acceleration", { "x": 0, "y": -0.2, "z": 0 });
			this.particleBurst.setAttribute("spe-particles", "accelerationSpread", { "x": 0, "y": 0.2, "z": 0 });

		    // 粒子がどのくらい持続するか
			this.bDuration = { min: Number(this.data.bDuration[0]), max: Number(this.data.bDuration[1]) };
			this.bSpread = { min: Number(this.data.bSpread[0]), max: Number(this.data.bSpread[1]) };
		    //this.burstDuration = randomUniform(1.0, 3.0);
			this.burstDuration = randomUniform(this.bDuration.min, this.bDuration.max);
			this.burstSpread = randomUniform(this.bSpread.min, this.bSpread.max);
			this.particleBurst.setAttribute("spe-particles", "maxAge", this.burstDuration);
			//this.particleBurst.setAttribute("spe-particles", "maxAgeSpread", this.burstDuration / 4);
			this.particleBurst.setAttribute("spe-particles", "maxAgeSpread", this.burstDuration / this.burstSpread);
			// 持続時間=粒子を放出する最大時間
			// 2回目のバーストを防ぐために、最小最大年齢未満にする必要
			this.particleBurst.setAttribute("spe-particles", "duration", 0.5);

			// default: むらのない色
			let colorArray = ["white", this.data.color, this.data.color, this.data.color];
			// 色変化をランダム
			if (Math.random() < 0.25) {
				let color2 = this.data.color;
				// 2番目の色が最初の色と異なることを確認
				while (color2 == this.data.color) {
					color2 = this.randomColor();
				}
				colorArray = ["white", this.data.color, color2, color2];
			}

			this.particleBurst.setAttribute("spe-particles", "color", colorArray);

			// バースト効果を無効
			// 最大高さに達した後、（ティック方式で）有効
			this.particleBurst.setAttribute("spe-particles", "enabled", false);

			this.el.appendChild(this.particleBurst);

			this.elapsedTime = 0;
			this.burstStart = false;
		},

		tick: function (time, deltaTime) {

			this.elapsedTime += deltaTime / 1000;

			// 花火が最大の高さに達し、バースト効果を開始
			if (this.elapsedTime > this.data.riseTime && this.burstStart == false) {
				this.burstStart = true;
				this.particleBurst.setAttribute("spe-particles", "enabled", true);

				this.el.removeChild(this.particleTrail);
			}

			// 花火完了後、シーンから削除
			//  粒子の世代変化を考慮
			if (this.elapsedTime > this.data.riseTime + this.burstDuration * 1.25) {
				let element = this.el;
				element.parentNode.removeChild(element);
			}
		}
	});

}());