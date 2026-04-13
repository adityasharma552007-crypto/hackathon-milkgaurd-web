'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Download } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: 'easeOut' },
  }),
}

export default function LandingClient() {
  const router = useRouter()

  const goToLogin = () => router.push('/auth/login')
  const goToDownload = () => router.push('/download')

  return (
    <main
      style={{
        maxWidth: 430,
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#F7F9F8',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ── HERO SECTION ── */}
      <section
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #60A5FA 0%, #3B82F6 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 32px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(28,117,232,0.1)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Image src="/logo.png" alt="MilkGuard Logo" width={88} height={88} style={{ objectFit: 'contain' }} priority />
        </motion.div>

        {/* App name */}
        <motion.h1
          custom={0.15}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            margin: 0,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          MilkGuard
        </motion.h1>

        {/* Tagline */}
        <motion.p
          custom={0.25}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            color: '#65A4FF',
            fontSize: 17,
            fontWeight: 500,
            margin: 0,
            marginBottom: 8,
            textAlign: 'center',
            letterSpacing: '0.1px',
          }}
        >
          Safe Milk. Scanned in Seconds.
        </motion.p>

        {/* Trust line */}
        <motion.p
          custom={0.32}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 13,
            margin: 0,
            marginBottom: 56,
            textAlign: 'center',
          }}
        >
          Trusted by families across India 🇮🇳
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={0.35}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <button
            onClick={goToLogin}
            className="landing-cta-btn"
            style={{
              width: '100%',
              height: 56,
              borderRadius: 999,
              backgroundColor: '#F5A623',
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.2px',
              boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
            }}
          >
            Get Started →
          </button>
          <button
            onClick={goToDownload}
            className="landing-cta-btn-secondary"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              border: '2px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Download size={18} />
            Download APK
          </button>
        </motion.div>

        {/* Already have account */}
        <motion.p
          custom={0.42}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            marginTop: 18,
            textAlign: 'center',
          }}
        >
          Already have an account?{' '}
          <button
            onClick={goToLogin}
            style={{
              color: '#65A4FF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Sign in
          </button>
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          custom={0.55}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            position: 'absolute',
            bottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: 1 }}>
            SCROLL
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: 'rgba(255,255,255,0.25)',
              animation: 'scrollPulse 1.8s ease-in-out infinite',
            }}
          />
        </motion.div>
      </section>

      {/* ── FEATURE CARDS SECTION ── */}
      <section
        style={{
          backgroundColor: '#F7F9F8',
          padding: '52px 24px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: '#1C1C1E',
            margin: 0,
            marginBottom: 28,
            letterSpacing: '-0.3px',
          }}
        >
          Why MilkGuard?
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              icon: '🔬',
              iconBg: '#EAF2FF',
              iconColor: '#60A5FA',
              title: 'Contactless Detection',
              desc: 'NIR spectral analysis reads through the container — no touching, no contamination.',
              delay: 0,
            },
            {
              icon: '⚡',
              iconBg: '#FDF3E3',
              iconColor: '#F5A623',
              title: 'Results in 8 Seconds',
              desc: 'Faster than any test kit. Scan, get results, stay safe.',
              delay: 0.08,
            },
            {
              icon: '🛡️',
              iconBg: '#EAF2FF',
              iconColor: '#60A5FA',
              title: 'FSSAI Certified Standards',
              desc: 'Every result compared against official FSSAI 2025-26 safety limits.',
              delay: 0.16,
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: card.delay }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                padding: '18px 18px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 16,
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  minWidth: 50,
                  borderRadius: 14,
                  backgroundColor: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {card.icon}
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    marginBottom: 4,
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#1C1C1E',
                    letterSpacing: '-0.1px',
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: '#6E7A80',
                    lineHeight: 1.5,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          padding: '44px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around' }}
        >
          {[
            { value: '97%', label: 'Adulteration rate\nin Rajasthan' },
            { value: '8 sec', label: 'Average scan\ntime' },
            { value: '7+', label: 'Adulterants\ndetected' },
          ].map((stat, i) => (
            <div key={stat.value} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 48,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    marginRight: 24,
                  }}
                />
              )}
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 30,
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: 11,
                    color: '#65A4FF',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.45,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section
        style={{
          backgroundColor: '#F7F9F8',
          padding: '52px 24px',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: '#1C1C1E',
            margin: 0,
            marginBottom: 36,
            letterSpacing: '-0.3px',
          }}
        >
          How It Works
        </motion.h2>

        <div style={{ position: 'relative' }}>
          {/* Vertical dashed line */}
          <div
            style={{
              position: 'absolute',
              left: 19,
              top: 40,
              bottom: 40,
              width: 1,
              borderLeft: '1.5px dashed #D4E8DC',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {[
              {
                num: '1',
                numBg: '#60A5FA',
                title: 'Pour a small sample',
                desc: 'Just 20ml of milk into the transparent cup provided.',
                delay: 0,
              },
              {
                num: '2',
                numBg: '#60A5FA',
                title: 'Place in the Pod cradle',
                desc: 'Set the cup next to the MilkGuard Pod sensor.',
                delay: 0.1,
              },
              {
                num: '3',
                numBg: '#F5A623',
                title: 'Get instant results',
                desc: 'AI analyses 18 wavelengths and returns your SafetyScore in 8 seconds.',
                delay: 0.2,
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: step.delay }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 16,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: '50%',
                    backgroundColor: step.numBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: `0 4px 12px ${step.numBg}55`,
                    zIndex: 1,
                  }}
                >
                  {step.num}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 4,
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#1C1C1E',
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: '#6E7A80',
                      lineHeight: 1.55,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(160deg, #60A5FA 0%, #3B82F6 100%)',
          padding: '56px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(46,204,138,0.06)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <h2
            style={{
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              marginBottom: 14,
              lineHeight: 1.25,
              letterSpacing: '-0.4px',
            }}
          >
            Ready to protect{'\n'}your family?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              margin: 0,
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 280,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Join thousands of families already using MilkGuard to verify their milk.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={goToLogin}
              className="landing-cta-btn"
              style={{
                width: '100%',
                maxWidth: 320,
                height: 56,
                borderRadius: 999,
                backgroundColor: '#F5A623',
                color: '#fff',
                fontSize: 17,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.2px',
                boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
              }}
            >
              Get Started Free
            </button>
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 12,
              marginTop: 16,
              marginBottom: 0,
            }}
          >
            No hardware required for web demo
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          backgroundColor: '#073380',
          padding: '28px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <button
            onClick={goToDownload}
            style={{
              color: '#65A4FF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Download APK
          </button>
          <a
            href="/about"
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            About
          </a>
          <a
            href="/faq"
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            FAQ
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
          MilkGuard © 2026
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0, marginTop: 4 }}>
          Built for India&apos;s food safety 🇮🇳
        </p>
      </footer>

      {/* Global styles for this page */}
      <style jsx global>{`
        .landing-cta-btn {
          transition: background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }
        .landing-cta-btn:hover {
          background-color: #E8941A !important;
          transform: scale(1.02);
          box-shadow: 0 6px 24px rgba(245,166,35,0.5) !important;
        }
        .landing-cta-btn:active {
          transform: scale(0.98);
        }
        .landing-cta-btn-secondary {
          transition: background-color 200ms ease, transform 200ms ease, border-color 200ms ease;
        }
        .landing-cta-btn-secondary:hover {
          background-color: rgba(255,255,255,0.3) !important;
          transform: scale(1.02);
          border-color: rgba(255,255,255,0.5) !important;
        }
        .landing-cta-btn-secondary:active {
          transform: scale(0.98);
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
  )
}
