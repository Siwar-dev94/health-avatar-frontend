import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const EXPRESSIONS = {
  neutral:   { mouthSmileLeft:0.08, mouthSmileRight:0.08, browInnerUp:0, eyeWideLeft:0, eyeWideRight:0, mouthFrownLeft:0, mouthFrownRight:0 },
  positive:  { mouthSmileLeft:0.7,  mouthSmileRight:0.7,  browInnerUp:0.2, eyeWideLeft:0.1, eyeWideRight:0.1, mouthFrownLeft:0, mouthFrownRight:0 },
  concerned: { mouthSmileLeft:0,    mouthSmileRight:0,    browInnerUp:0.6, eyeWideLeft:0, eyeWideRight:0, mouthFrownLeft:0.4, mouthFrownRight:0.4 },
  urgent:    { mouthSmileLeft:0,    mouthSmileRight:0,    browInnerUp:0.95, eyeWideLeft:0.6, eyeWideRight:0.6, mouthFrownLeft:0.25, mouthFrownRight:0.25 },
};

export function Avatar3D({ isSpeaking, sentiment, lipValue }) {
  const { scene } = useGLTF("/avatar.glb");
  const meshes = useRef([]);
  const blinkTimer = useRef(2 + Math.random() * 2);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);
  const currentViseme = useRef("viseme_sil");
  const visemeTimer = useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child.isMesh || child.isSkinnedMesh) && child.morphTargetDictionary) {
        meshes.current.push(child);
      }
    });
  }, [scene]);

  const setMorph = (name, value, speed = 0.12) => {
    meshes.current.forEach(mesh => {
      const idx = mesh.morphTargetDictionary?.[name];
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[idx] ?? 0, value, speed
        );
      }
    });
  };

  const resetVisemes = (speed = 0.15) => {
    ["viseme_sil","viseme_PP","viseme_FF","viseme_TH","viseme_DD",
     "viseme_kk","viseme_CH","viseme_SS","viseme_nn","viseme_RR",
     "viseme_aa","viseme_E","viseme_I","viseme_O","viseme_U"
    ].forEach(v => setMorph(v, 0, speed));
  };

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    scene.rotation.y = Math.sin(t * 0.35) * 0.025;
    scene.rotation.x = Math.sin(t * 0.22) * 0.008;

    if (isSpeaking) {
      visemeTimer.current -= delta;
      if (visemeTimer.current <= 0) {
        resetVisemes(0.3);
        const vowels = ["viseme_aa","viseme_E","viseme_I","viseme_O","viseme_U"];
        const consonants = ["viseme_PP","viseme_FF","viseme_DD","viseme_kk","viseme_CH","viseme_SS","viseme_nn"];
        const pool = Math.random() > 0.4 ? vowels : consonants;
        currentViseme.current = pool[Math.floor(Math.random() * pool.length)];
        visemeTimer.current = 0.07 + Math.random() * 0.09;
      }
      setMorph(currentViseme.current, lipValue * 0.9, 0.35);
      setMorph("jawOpen", lipValue * 0.55, 0.3);
      setMorph("mouthOpen", lipValue * 0.4, 0.3);
    } else {
      resetVisemes(0.12);
      setMorph("jawOpen", 0, 0.15);
      setMorph("mouthOpen", 0, 0.15);
    }

    const expr = EXPRESSIONS[sentiment] || EXPRESSIONS.neutral;
    Object.entries(expr).forEach(([k, v]) => setMorph(k, v, 0.035));

    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      isBlinking.current = true;
      blinkProgress.current = 0;
      blinkTimer.current = 2.5 + Math.random() * 3.5;
    }
    if (isBlinking.current) {
      blinkProgress.current += delta * 8;
      const val = blinkProgress.current < 1
        ? blinkProgress.current
        : Math.max(0, 2 - blinkProgress.current);
      setMorph("eyeBlinkLeft", val, 1);
      setMorph("eyeBlinkRight", val, 1);
      if (blinkProgress.current >= 2) isBlinking.current = false;
    } else {
      setMorph("eyeBlinkLeft", 0, 0.2);
      setMorph("eyeBlinkRight", 0, 0.2);
    }

    setMorph("eyeSquintLeft", Math.max(0, Math.sin(t * 0.3) * 0.08), 0.05);
    setMorph("eyeSquintRight", Math.max(0, Math.sin(t * 0.3) * 0.08), 0.05);
  });

  return <primitive object={scene} scale={0.78} position={[0, -1.38, 0]} />;
}

useGLTF.preload("/avatar.glb");