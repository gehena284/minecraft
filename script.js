// 1. シーン（3D空間）の作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // 空の色

// 2. カメラの作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 5); // 身長1.7mの高さに設定

// 3. レンダラーの作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. FPS用の視点操作（PointerLockControls）の追加
const controls = new THREE.PointerLockControls(camera, document.body);

// 画面をクリックしたらFPSモードを開始
document.body.addEventListener('click', () => {
  controls.lock();
});

// --- オブジェクトと光源の配置 ---

// 光源（変更なし）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// ★ 1. 衝突対象のバウンディングボックスを格納する配列を作成
const obstacleBBs = [];

// ★ 2. 箱を生成して配列に登録する関数（使い回せるようにする）
function createBox(x, y, z) {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // この箱の当たり判定を生成して配列に追加
  const bb = new THREE.Box3().setFromObject(mesh);
  obstacleBBs.push(bb);

  return mesh;
}

// ★ 3. 実際にいくつか箱を置いてみる
createBox(0, 0, 0);   
createBox(0, 0, 2); 
createBox(2, 0, 0,); 
createBox(2, 0, 2,); 


// --- キーボード移動の制御ロジック ---
const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
const moveSpeed = 0.1;

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': moveState.forward = true; break;
    case 'KeyS': moveState.backward = true; break;
    case 'KeyA': moveState.left = true; break;
    case 'KeyD': moveState.right = true; break;
    case 'Space': moveState.up = true; break;
    case 'ShiftLeft': moveState.down = true; break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': moveState.forward = false; break;
    case 'KeyS': moveState.backward = false; break;
    case 'KeyA': moveState.left = false; break;
    case 'KeyD': moveState.right = false; break;
    case 'Space': moveState.up = false; break;
    case 'ShiftLeft': moveState.down = false; break;
  }
});


// 5. 描画ループ（アニメーション）
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    // --- 1. X軸・Z軸（水平方向）の移動と判定 ---
    const posBeforeHorizontal = camera.position.clone();

    if (moveState.forward)  controls.moveForward(moveSpeed);
    if (moveState.backward) controls.moveForward(-moveSpeed);
    if (moveState.left)     controls.moveRight(-moveSpeed);
    if (moveState.right)    controls.moveRight(moveSpeed);

    let playerBB = new THREE.Box3(
      new THREE.Vector3(camera.position.x - 0.3, camera.position.y - 1.7, camera.position.z - 0.3),
      new THREE.Vector3(camera.position.x + 0.3, camera.position.y,       camera.position.z + 0.3)
    );

    // ★ 4. 配列内のいずれかの箱と衝突しているかチェック
    // .some() は配列のどれか1つでも条件（衝突）を満たしたら true を返します
    const isCollidingHorizontal = obstacleBBs.some(boxBB => playerBB.intersectsBox(boxBB));

    if (isCollidingHorizontal) {
      camera.position.x = posBeforeHorizontal.x;
      camera.position.z = posBeforeHorizontal.z;
    }


    // --- 2. Y軸（垂直方向）の移動と判定 ---
    const posBeforeVertical = camera.position.clone();

    if (moveState.up)   camera.position.y += moveSpeed;
    if (moveState.down) camera.position.y -= moveSpeed;

    playerBB.set(
      new THREE.Vector3(camera.position.x - 0.3, camera.position.y - 1.7, camera.position.z - 0.3),
      new THREE.Vector3(camera.position.x + 0.3, camera.position.y,       camera.position.z + 0.3)
    );

    // ★ 5. 垂直方向も同様に配列内をチェック
    const isCollidingVertical = obstacleBBs.some(boxBB => playerBB.intersectsBox(boxBB));

    if (isCollidingVertical) {
      camera.position.y = posBeforeVertical.y;
    }
  }

  renderer.render(scene, camera);
}
animate();

// レスポンシブ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
