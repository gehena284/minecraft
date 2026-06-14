// 1. シーン・カメラ・レンダラーの準備
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // プレイヤーの目の高さ（Y=1.6）に設定
        camera.position.set(0, 1.6, 5); 

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // ★ 一人称視点用のコントローラーに変更
        const controls = new THREE.PointerLockControls(camera, document.body);

        // 画面クリックでポインターロック（ゲーム開始）
        const instructions = document.getElementById('instructions');
        instructions.addEventListener('click', () => {
            controls.lock();
        });

        // ロック時・解除時の画面表示切り替え
        controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
        });
        controls.addEventListener('unlock', () => {
            instructions.style.display = 'flex';
        });

        // 2. ライトの設定
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 40, 20);
        scene.add(dirLight);

        // 3. ブロックの作成
        const blockSize = 1;
        const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        const material = new THREE.MeshLambertMaterial({ color: 0x55aa44 }); 

        // 4. フラットワールドの生成（少し広めの40マス）
        const worldSize = 40; 
        for (let x = -worldSize/2; x < worldSize/2; x++) {
            for (let z = -worldSize/2; z < worldSize/2; z++) {
                const cube = new THREE.Mesh(geometry, material);
                // ブロックの上面が Y=0 になるように配置
                cube.position.set(x * blockSize, -blockSize/2, z * blockSize);
                scene.add(cube);
            }
        }

        // ★ 移動のためのキー入力を監視する設定
        const move = { forward: false, backward: false, left: false, right: false };
        const velocity = new THREE.Vector3(); // 移動速度
        const direction = new THREE.Vector3(); // 移動方向
        const speed = 15.0; // 移動速度の倍率

        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': move.forward = true; break;
                case 'KeyS': move.backward = true; break;
                case 'KeyA': move.left = true; break;
                case 'KeyD': move.right = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': move.forward = false; break;
                case 'KeyS': move.backward = false; break;
                case 'KeyA': move.left = false; break;
                case 'KeyD': move.right = false; break;
            }
        });

        // 前回のフレームからの経過時間を測るクロック
        const clock = new THREE.Clock();

        // 5. アニメーションループ
        function animate() {
            requestAnimationFrame(animate);
            
            if (controls.isLocked) {
                const delta = clock.getDelta(); // フレーム間の経過時間（秒）

                // 速度の減衰（慣性）
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;

                // 移動方向の計算
                direction.z = Number(move.forward) - Number(move.backward);
                direction.x = Number(move.right) - Number(move.left);
                direction.normalize(); // 斜め移動でも速度が変わらないようにする

                // 向いている方向を基準に移動速度を加算
                if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
                if (move.left || move.right) velocity.x -= direction.x * speed * delta;

                // カメラの座標を更新
                controls.moveRight(-velocity.x * delta);
                controls.moveForward(-velocity.z * delta);
            }

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
