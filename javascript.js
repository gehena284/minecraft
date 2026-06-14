 // 1. シーン・カメラ・レンダラーの準備
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // マイクラっぽい青空の色

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(10, 15, 20); // 少し上から見下ろす位置

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // カメラコントローラー（マウスでグリグリ動かせるようにする）
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 2. ライト（照明）の設定
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 全体を明るく
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // 太陽光（影や明暗が出る）
        dirLight.position.set(20, 40, 20);
        scene.add(dirLight);

        // 3. ブロック（立方体）の作成
        const blockSize = 1;
        const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        
        // マイクラ風にするために、緑の草ブロック（天面）と茶色の土（側面）っぽさを簡易表現
        const material = new THREE.MeshLambertMaterial({ color: 0x55aa44 }); 

        // 4. フラットワールドの生成（20マスの平原）
        const worldSize = 20; 

        for (let x = -worldSize/2; x < worldSize/2; x++) {
            for (let z = -worldSize/2; z < worldSize/2; z++) {
                // 今回は「インスタンス」ではなく分かりやすさ重視で愚直にMeshを生成
                const cube = new THREE.Mesh(geometry, material);
                
                // 格子状に配置
                cube.position.set(x * blockSize, 0, z * blockSize);
                scene.add(cube);
            }
        }

        // 5. アニメーションループ（画面の更新）
        function animate() {
            requestAnimationFrame(animate);
            
            // コントローラーの更新
            controls.update();
            
            renderer.render(scene, camera);
        }

        // ウィンドウサイズが変わったときのレスポンシブ対応
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // ループ開始！
        animate();