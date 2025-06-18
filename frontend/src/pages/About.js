import React from 'react';

function About() {
  return (
    <div
      style={{
        maxWidth: '90%',
        margin: 'auto',
        padding: '40px 20px',
        fontFamily: 'Segoe UI, sans-serif', color: '#f0f0f0',
        lineHeight: '1.8',

      }}
    >
      <h1
        style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '30px',
          color: 'Pink',
        }}
      >
        About Taarak
      </h1>

      <p>
        <strong style={{ fontSize: '20px', color: '#4b0082' }}>Taarak</strong> is a modern astrology platform dedicated to bringing
        authentic <strong>Vedic wisdom</strong> to your fingertips. Whether you seek personalized{' '}
        <strong>Kundli generation</strong> (your astrological birth chart), daily{' '}
        <strong>Panchang</strong> (the Hindu calendar with Tithi, Nakshatra, Yoga, and Karana),
        compatibility analysis through <strong>Ashtakoot Milan</strong> (an eight-fold system for
        marriage matching), or the selection of an auspicious <strong>Muhurat</strong> (timing for key life events) —
        <em> Taarak </em> serves as your trusted cosmic guide.
      </p>

      <p>
        Built with a seamless blend of traditional astrological principles and modern web technology,
        <strong> Taarak </strong> provides accurate and insightful charts, planetary positions, yogas, dashas, and
        predictive tools — all customized according to your <strong>Janma Kundli</strong> (birth data).
        Our advanced engine computes planetary transitions using authentic algorithms based on
        <strong> Bṛhat Parāśara Horā Śāstra (BPHS)</strong> and other classic astrological texts.
      </p>

      <p>
        Our mission is to empower individuals with clarity, purpose, and spiritual awareness
        through easy-to-use tools and real-time astrological data. Whether you're consulting
        your <strong>daily Rashi predictions</strong>, analyzing your <strong>Navamsa</strong> or <strong>Dasamsa</strong> charts,
        or exploring <strong>gemstone recommendations</strong> based on your planetary strengths —
        Taarak helps you make timely and meaningful decisions aligned with the rhythm of the universe.
      </p>

      <p>
        From <strong>marriage planning</strong>, <strong>vehicle purchase</strong>, <strong>naming ceremonies (Naamkaran)</strong>, to
        <strong> griha pravesh (housewarming)</strong>, our platform provides the right Muhurat, planetary dos and don'ts,
        and astrological insights tailored for your event. Taarak is more than a tool — it's your
        celestial companion, lighting your path with ancient wisdom made simple for the modern world.
      </p>
    </div>
  );
}

export default About;
