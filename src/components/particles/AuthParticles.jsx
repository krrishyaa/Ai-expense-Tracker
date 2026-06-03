import { motion } from 'framer-motion'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

async function initEngine(engine) {
  await loadSlim(engine)
}

function ParticlesCanvas() {
  const options = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 30,
    detectRetina: true,
    particles: {
      number: { value: 40 },
      color: { value: '#4f8ef7' },
      opacity: { value: 0.1 },
      size: { value: { min: 1, max: 2 } },
      links: {
        enable: true,
        distance: 140,
        opacity: 0.07,
        color: '#4f8ef7',
      },
      move: {
        enable: true,
        speed: 0.3,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
  }

  return (
    <Particles
      id="auth-particles"
      className="fixed inset-0 z-0 pointer-events-none"
      options={options}
    />
  )
}

function AuthOrbs() {
  return (
    <>
      {/* Top-left blue orb */}
      <motion.div
        className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,247,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom-right teal orb */}
      <motion.div
        className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,201,167,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, -30, 25, 0], y: [0, 25, -15, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Center purple orb */}
      <motion.div
        className="fixed top-[30%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
    </>
  )
}

export default function AuthParticles() {
  return (
    <>
      <ParticlesProvider init={initEngine}>
        <ParticlesCanvas />
      </ParticlesProvider>
      <AuthOrbs />
      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,7,13,0.6) 100%)',
        }}
      />
    </>
  )
}