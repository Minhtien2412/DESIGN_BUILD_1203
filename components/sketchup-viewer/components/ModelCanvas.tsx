// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Environment, Grid, Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { GLTFLoader } from "three-stdlib";
import type { CameraPreset, ModelCanvasHandle, PreparedModel } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively dispose geometry + materials to prevent GPU memory leaks. */
function disposeObject(root: THREE.Object3D) {
  root.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const val of Object.values(mat as Record<string, unknown>)) {
        if (val && val instanceof THREE.Texture) val.dispose();
      }
      mat.dispose();
    }
  });
}

/**
 * Center + ground-align model, compute bounding data.
 * Returns a CLONED scene so the original is never mutated.
 */
function prepareModel(rootScene: THREE.Group): PreparedModel {
  const scene = rootScene.clone(true);

  // Enable shadows on every mesh
  scene.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  if (box.isEmpty()) {
    throw new Error("Model không chứa geometry hợp lệ để hiển thị.");
  }

  const center = box.getCenter(new THREE.Vector3());

  // center X/Z, ground-align Y
  scene.position.x -= center.x;
  scene.position.y -= box.min.y;
  scene.position.z -= center.z;

  scene.updateMatrixWorld(true);

  const finalBox = new THREE.Box3().setFromObject(scene);
  const sphere = finalBox.getBoundingSphere(new THREE.Sphere());
  const size = finalBox.getSize(new THREE.Vector3());

  return {
    scene,
    radius: Math.max(sphere.radius, 1),
    size,
    target: new THREE.Vector3(0, Math.max(size.y * 0.5, 0.5), 0),
  };
}

// ---------------------------------------------------------------------------
// Inner scene (runs inside Canvas context)
// ---------------------------------------------------------------------------

interface SceneContentsProps {
  modelUrl: string | null;
  autoRotate: boolean;
  cameraPreset: CameraPreset;
  onModelLoaded: () => void;
  onError: (message: string) => void;
}

const SceneContents = forwardRef<ModelCanvasHandle, SceneContentsProps>(
  function SceneContents(
    { modelUrl, autoRotate, cameraPreset, onModelLoaded, onError },
    ref,
  ) {
    const { camera, invalidate } = useThree();
    const controlsRef = useRef<any>(null);
    const [model, setModel] = useState<PreparedModel | null>(null);

    // -----------------------------------------------------------------------
    // Camera preset logic
    // -----------------------------------------------------------------------
    const applyViewPreset = useCallback(
      (preset: CameraPreset) => {
        const controls = controlsRef.current;
        if (!controls || !model) {
          // Fallback default
          camera.position.set(6, 5, 8);
          camera.up.set(0, 1, 0);
          camera.updateProjectionMatrix();
          controls?.target.set(0, 0, 0);
          controls?.update();
          invalidate();
          return;
        }

        const { target, radius, size } = model;
        const dist = Math.max(radius * 2.4, 4);
        const eyeY = target.y + Math.max(size.y * 0.25, radius * 0.25);

        const positions: Record<CameraPreset, THREE.Vector3> = {
          perspective: new THREE.Vector3(dist, eyeY + radius * 0.35, dist),
          top: new THREE.Vector3(0, dist * 1.65, 0.001),
          front: new THREE.Vector3(0, eyeY, dist * 1.4),
          left: new THREE.Vector3(-dist * 1.4, eyeY, 0),
          right: new THREE.Vector3(dist * 1.4, eyeY, 0),
        };

        camera.position.copy(positions[preset]);
        camera.near = Math.max(radius / 100, 0.1);
        camera.far = Math.max(radius * 30, 1000);
        camera.up.set(0, preset === "top" ? 0 : 1, preset === "top" ? -1 : 0);

        controls.target.copy(target);
        camera.lookAt(target);
        camera.updateProjectionMatrix();
        controls.update();
        invalidate();
      },
      [camera, invalidate, model],
    );

    useImperativeHandle(
      ref,
      () => ({
        resetView: () => applyViewPreset("perspective"),
        setViewPreset: (p: CameraPreset) => applyViewPreset(p),
      }),
      [applyViewPreset],
    );

    // -----------------------------------------------------------------------
    // Load model when URL changes
    // -----------------------------------------------------------------------
    useEffect(() => {
      if (!modelUrl) {
        setModel((prev) => {
          if (prev) disposeObject(prev.scene);
          return null;
        });
        return;
      }

      let cancelled = false;
      const loader = new GLTFLoader();

      loader.load(
        modelUrl,
        (gltf: GLTF) => {
          if (cancelled) return;
          try {
            const root = gltf.scene || gltf.scenes?.[0];
            if (!root) throw new Error("File không chứa scene hợp lệ.");
            const prepared = prepareModel(root);
            setModel((prev) => {
              if (prev) disposeObject(prev.scene);
              return prepared;
            });
          } catch (err) {
            onError(
              err instanceof Error
                ? err.message
                : "Không thể load model. Hãy kiểm tra file.",
            );
          }
        },
        undefined,
        () => {
          if (!cancelled) {
            onError(
              "Không thể load model. Nếu dùng .gltf, hãy đảm bảo file self-contained hoặc chuyển sang .glb.",
            );
          }
        },
      );

      return () => {
        cancelled = true;
      };
    }, [modelUrl, onError]);

    // Apply preset + notify parent after model loads
    useEffect(() => {
      if (!model) return;
      applyViewPreset(cameraPreset);
      onModelLoaded();
    }, [model]); // intentionally only re-run on model change

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (model) disposeObject(model.scene);
      };
    }, [model]);

    // -----------------------------------------------------------------------
    // Scene JSX
    // -----------------------------------------------------------------------
    return (
      <>
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <hemisphereLight intensity={0.45} groundColor="#d1d5db" />
        <directionalLight
          position={[8, 14, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Environment + Ground */}
        <Environment preset="city" />
        <Grid
          position={[0, 0, 0]}
          args={[30, 30]}
          cellSize={0.75}
          cellThickness={0.5}
          cellColor="#d4d4d8"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#a1a1aa"
          fadeDistance={40}
          fadeStrength={1}
          infiniteGrid
        />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          makeDefault
        />

        {/* Model or placeholder */}
        {model ? (
          <primitive object={model.scene} />
        ) : (
          <Html center>
            <div className="skp-viewer__canvas-placeholder">
              <h3>🏗 Chưa có model</h3>
              <p>Upload file .glb hoặc .gltf để bắt đầu xem 3D.</p>
            </div>
          </Html>
        )}
      </>
    );
  },
);

// ---------------------------------------------------------------------------
// ModelCanvas — public component wrapping Three.js Canvas
// ---------------------------------------------------------------------------

interface ModelCanvasProps {
  modelUrl: string | null;
  autoRotate: boolean;
  cameraPreset: CameraPreset;
  onModelLoaded: () => void;
  onError: (message: string) => void;
}

export const ModelCanvas = forwardRef<ModelCanvasHandle, ModelCanvasProps>(
  function ModelCanvas(props, ref) {
    return (
      <div className="skp-viewer__canvas-shell">
        <Canvas
          shadows
          camera={{ position: [6, 5, 8], fov: 45 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#f8fafc"]} />
          <SceneContents ref={ref} {...props} />
        </Canvas>
      </div>
    );
  },
);
