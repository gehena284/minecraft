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

// 光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// 目印の箱（位置感覚を掴むため）
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 1, 0); // 地面の上に置く
scene.add(box);

// 【新設】緑の箱の「当たり判定用の箱」を生成
const boxBB = new THREE.Box3().setFromObject(box);


// --- キーボード移動の制御ロジック ---

const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
const moveSpeed = 0.1; // 移動速度

// キーを押したとき
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

// キーを離したとき
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


// 5. 描画ループ（アニメーション）の開始
// 5. 描画ループ（アニメーション）の開始
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    // --- 【変更】軸ごとに移動と衝突判定を行う ---

    // 1. X軸・Z軸（水平方向）の移動と判定
    const posBeforeHorizontal = camera.position.clone();

    if (moveState.forward)  controls.moveForward(moveSpeed);
    if (moveState.backward) controls.moveForward(-moveSpeed);
    if (moveState.left)     controls.moveRight(-moveSpeed);
    if (moveState.right)    controls.moveRight(moveSpeed);

    // 水平移動後のプレイヤーのBoundingBoxを作成
    let playerBB = new THREE.Box3(
      new THREE.Vector3(camera.position.x - 0.3, camera.position.y - 1.7, camera.position.z - 0.3),
      new THREE.Vector3(camera.position.x + 0.3, camera.position.y,       camera.position.z + 0.3)
    );

    // 水平移動で衝突したら、XとZだけ元の位置に戻す（Yは維持）
    if (playerBB.intersectsBox(boxBB)) {
      camera.position.x = posBeforeHorizontal.x;
      camera.position.z = posBeforeHorizontal.z;
    }

    // 2. Y軸（垂直方向）の移動と判定
    const posBeforeVertical = camera.position.clone();

    if (moveState.up)   camera.position.y += moveSpeed;
    if (moveState.down) camera.position.y -= moveSpeed;

    // 垂直移動後のプレイヤーのBoundingBoxを再計算
    playerBB.set(
      new THREE.Vector3(camera.position.x - 0.3, camera.position.y - 1.7, camera.position.z - 0.3),
      new THREE.Vector3(camera.position.x + 0.3, camera.position.y,       camera.position.z + 0.3)
    );

    // 垂直移動で衝突したら、Yだけ元の位置に戻す
    if (playerBB.intersectsBox(boxBB)) {
      camera.position.y = posBeforeVertical.y;
    }
  }

  renderer.render(scene, camera);
}
animate();

// 画面サイズが変更されたときのレスポンシブ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
