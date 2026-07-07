// 1. シーン（3D空間）の作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // 空の色

// 2. カメラの作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 5); 

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

// 1. 衝突対象のバウンディングボックスを格納する配列を作成
const obstacleBBs = [];

// 2. 箱を生成して配列に登録する関数（使い回せるようにする）
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

// 3. 箱を置く
createBox(0, 0, 0);   
createBox(0, 0, 2); 
createBox(2, 0, 0,); 
createBox(2, 0, 2,); 
createBox(0, 0, 4); 
createBox(2, 0, 4); 
createBox(4, 0, 0); 
createBox(4, 0, 2); 
createBox(4, 0, 4); 
createBox(0, 0, 6); 
createBox(2, 0, 6); 
createBox(4, 0, 6); 
createBox(6, 0, 6); 
createBox(6, 0, 4); 
createBox(6, 0, 2); 
createBox(6, 0, 0); 
createBox(0, 0, -2);   //ここから左奥
createBox(-2, 0, 0,); 
createBox(-2, 0, -2,); 
createBox(0, 0, -4); 
createBox(-2, 0, -4); 
createBox(-4, 0, 0); 
createBox(-4, 0, -2); 
createBox(-4, 0, -4); 
createBox(0, 0, -6); 
createBox(-2, 0, -6); 
createBox(-4, 0, -6); 
createBox(-6, 0, -6); 
createBox(-6, 0, -4); 
createBox(-6, 0, -2); 
createBox(-6, 0, 0); 
createBox(-2, 0, 2,);   //ここからは左側
createBox(-2, 0, 4,);
createBox(-2, 0, 6,);
createBox(-4, 0, 2,);
createBox(-4, 0, 4,);
createBox(-4, 0, 6,);
createBox(-6, 0, 2,);
createBox(-6, 0, 4,);
createBox(-6, 0, 6,);
createBox(2, 0, -2,);    //ここから右奥
createBox(2, 0, -4,);
createBox(2, 0, -6,);
createBox(4, 0, -2,);
createBox(4, 0, -4,);
createBox(4, 0, -6,);
createBox(6, 0, -2,);
createBox(6, 0, -4,);
createBox(6, 0, -6,);
createBox(6, 2, -6,);   //上にも一個

// --- キーボード移動の制御ロジック ---
const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
const moveSpeed = 0.1;

const gravity = 0.01;      // 重力
const jumpPower = 0.25;    // ジャンプ力
let velocityY = 0;         // Y方向の速度
let onGround = false;      // 地面にいるか

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': moveState.forward = true; break;
    case 'KeyS': moveState.backward = true; break;
    case 'KeyA': moveState.left = true; break;
    case 'KeyD': moveState.right = true; break;
    case 'Space':
  if (onGround) {
    velocityY = jumpPower;
    onGround = false;
  }
  break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': moveState.forward = false; break;
    case 'KeyS': moveState.backward = false; break;
    case 'KeyA': moveState.left = false; break;
    case 'KeyD': moveState.right = false; break;
  }
});

// 5. 描画ループ（アニメーション）
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    // プレイヤーのサイズ定義（使い回すためのヘルパー関数）
    const getPlayerBB = () => {
      return new THREE.Box3(
        new THREE.Vector3(camera.position.x - 0.3, camera.position.y - 1.7, camera.position.z - 0.3),
        new THREE.Vector3(camera.position.x + 0.3, camera.position.y,       camera.position.z + 0.3)
      );
    };

    // --- 1. Z軸方向（前後）の移動と判定 ---
    const posBeforeZ = camera.position.clone();
    
    // 前後の移動だけを実行
    if (moveState.forward)  controls.moveForward(moveSpeed);
    if (moveState.backward) controls.moveForward(-moveSpeed);
    
    // Z軸移動後の判定。ぶつかっていたらZだけ戻す（Xは維持）
    if (obstacleBBs.some(boxBB => getPlayerBB().intersectsBox(boxBB))) {
      camera.position.z = posBeforeZ.z;
      // moveForwardはカメラの向きによってXも動かすため、厳密にはXも戻す必要がある場合があるが、
      // 簡易的には一度座標を完全に戻してから、改めて個別に処理するのが安全。
      camera.position.x = posBeforeZ.x; 
    }

    // --- 2. X軸方向（左右）の移動と判定 ---
    const posBeforeX = camera.position.clone();
    
    // 左右の移動だけを実行
    if (moveState.left)  controls.moveRight(-moveSpeed);
    if (moveState.right) controls.moveRight(moveSpeed);
    
    // X軸移動後の判定。ぶつかっていたらXだけ戻す
    if (obstacleBBs.some(boxBB => getPlayerBB().intersectsBox(boxBB))) {
      camera.position.x = posBeforeX.x;
      camera.position.z = posBeforeX.z;
    }

// --- 3. Y軸方向（垂直）の移動と判定 ---

// 移動前の位置を保存
const posBeforeY = camera.position.clone();

// 重力
velocityY -= gravity;

// 落下・ジャンプ
camera.position.y += velocityY;

// 当たり判定
if (obstacleBBs.some(boxBB => getPlayerBB().intersectsBox(boxBB))) {

    // 落下していたら着地
    if (velocityY < 0) {
        onGround = true;
    }

    // 元の高さに戻す
    camera.position.y = posBeforeY.y;
    velocityY = 0;
}
else {
    onGround = false;
}
  }

  //奈落の底
  if (camera.position.y <-20) {
camera.position.set(0, 3, 5)
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
