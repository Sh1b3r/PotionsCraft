import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import { BREWING_INGREDIENTS, POTIONS_DATA } from '../data/potionsData';
import { playBubbleSound, playBrewCompleteSound, playButtonClickSound } from '../utils/soundEffects';

function BrewingStandModel({ isBrewing, liquidColor = '#2266aa' }) {
  const standRef = useRef();
  const flameRef = useRef();

  useFrame((state, delta) => {
    if (standRef.current) {
      standRef.current.rotation.y += delta * 0.15;
    }
    if (flameRef.current && isBrewing) {
      flameRef.current.intensity = 2.5 + Math.sin(state.clock.elapsedTime * 15) * 1.5;
    }
  });

  return (
    <group ref={standRef} position={[0, -0.6, 0]}>
      {/* Stone Base Slab */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.2, 16]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>

      {/* Central Blaze Rod */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 8]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff6600"
          emissiveIntensity={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Top Ingredient Holder / Cup */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.26, 0.12, 0.22, 12]} />
        <meshStandardMaterial color="#444444" roughness={0.7} />
      </mesh>

      {/* 3 Radiating Stand Arms */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => {
        const x = Math.sin(angle) * 0.75;
        const z = Math.cos(angle) * 0.75;

        return (
          <group key={idx}>
            {/* Supporting wire arm */}
            <mesh
              position={[x * 0.5, 0.1, z * 0.5]}
              rotation={[0, angle, Math.PI / 4]}
            >
              <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
              <meshStandardMaterial color="#333333" metalness={0.8} />
            </mesh>

            {/* Bottle Plate */}
            <mesh position={[x, -0.28, z]}>
              <cylinderGeometry args={[0.26, 0.26, 0.04, 12]} />
              <meshStandardMaterial color="#444444" metalness={0.6} />
            </mesh>

            {/* Potion Bottle placed on stand */}
            <group position={[x, 0.05, z]} scale={[0.45, 0.45, 0.45]}>
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.2, 12]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.16, 0.16, 0.4, 12]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.6}
                  transmission={0.85}
                  roughness={0.1}
                />
              </mesh>
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.7, 12]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.5}
                  transmission={0.85}
                  roughness={0.1}
                />
              </mesh>
              <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.44, 0.44, 0.55, 12]} />
                <meshStandardMaterial
                  color={liquidColor}
                  emissive={liquidColor}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            </group>
          </group>
        );
      })}

      <pointLight
        ref={flameRef}
        position={[0, 0.6, 0]}
        color="#ff7700"
        intensity={1.8}
        distance={3.5}
      />

      {isBrewing && (
        <Sparkles
          count={45}
          scale={[1.8, 2.2, 1.8]}
          size={3.5}
          speed={1.5}
          noise={0.5}
          color={liquidColor}
          position={[0, 0.5, 0]}
        />
      )}
    </group>
  );
}

export default function ThreeBrewingStand() {
  const [selectedIngredient, setSelectedIngredient] = useState(BREWING_INGREDIENTS[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewProgress, setBrewProgress] = useState(0);
  const [activePotion, setActivePotion] = useState(null);
  const [liquidColor, setLiquidColor] = useState('#2255bb');

  const handleStartBrewing = () => {
    if (isBrewing) return;
    playButtonClickSound();
    setIsBrewing(true);
    setBrewProgress(0);

    const bubbleInterval = setInterval(() => {
      playBubbleSound();
    }, 450);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setBrewProgress(progress);

      if (progress >= 100) {
        clearInterval(progressInterval);
        clearInterval(bubbleInterval);
        setIsBrewing(false);

        const targetPotion =
          POTIONS_DATA.find((p) => p.id === selectedIngredient.creates) ||
          POTIONS_DATA[0];

        setActivePotion(targetPotion);
        setLiquidColor(targetPotion.color);
        playBrewCompleteSound();
      }
    }, 250);
  };

  return (
    <div className="brewing-simulator-container">
      <div className="brewing-header">
        <h2 className="pixel-title">3D Алхімічна Варильна Стійка</h2>
        <p className="brewing-subtitle">
          Виберіть інгредієнт та зваріть справжнє зілля у реальному часі!
        </p>
      </div>

      <div className="brewing-layout">
        <div className="brewing-canvas-wrap">
          <Canvas
            camera={{ position: [0, 1.2, 3.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={1.0} />
            <directionalLight position={[3, 5, 4]} intensity={1.6} />
            <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#99bbff" />

            <BrewingStandModel isBrewing={isBrewing} liquidColor={liquidColor} />

            <OrbitControls
              enableZoom={false}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={(2.8 * Math.PI) / 4}
            />
          </Canvas>

          {isBrewing && (
            <div className="brewing-overlay-status">
              <div className="brewing-bubbles-anim">♨️ Варіння... {brewProgress}%</div>
              <div className="brewing-progress-bar">
                <div
                  className="brewing-progress-fill"
                  style={{ width: `${brewProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="brewing-controls">
          <h3 className="pixel-h3">1. Виберіть інгредієнт:</h3>
          <div className="ingredients-grid">
            {BREWING_INGREDIENTS.slice(0, 10).map((item) => (
              <button
                key={item.id}
                className={`ingredient-btn ${
                  selectedIngredient.id === item.id ? 'active' : ''
                }`}
                onClick={() => {
                  playButtonClickSound();
                  setSelectedIngredient(item);
                }}
                disabled={isBrewing}
              >
                <span
                  className="ingredient-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="ingredient-name">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="selected-ingredient-info">
            <b>Опис:</b> {selectedIngredient.desc}
          </div>

          <button
            className={`brew-action-btn ${isBrewing ? 'brewing' : ''}`}
            onClick={handleStartBrewing}
            disabled={isBrewing}
          >
            {isBrewing ? '⏳ ВАРІННЯ ТРИВАЄ...' : '⚗️ РОЗПОЧАТИ ВАРІННЯ!'}
          </button>

          {activePotion && !isBrewing && (
            <div className="brew-result-box">
              <img src={activePotion.icon} alt={activePotion.name} className="result-icon" />
              <div>
                <div className="result-label">Зварено успішно:</div>
                <div className="result-name" style={{ color: activePotion.color }}>
                  {activePotion.name}
                </div>
                <div className="result-desc">{activePotion.description}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}