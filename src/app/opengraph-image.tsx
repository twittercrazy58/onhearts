import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          border: '16px solid #E8DFD3',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Interlocking Hearts Emblem */}
        <svg width="96" height="96" viewBox="0 0 40 40" fill="none">
          <path
            d="M16.5 31.5C16.5 31.5 5 23.8 5 14.8C5 10.6 8.2 7.5 12.1 7.5C14.5 7.5 16.5 8.8 17.5 10.6C18.5 8.8 20.5 7.5 22.9 7.5C26.8 7.5 30 10.6 30 14.8C30 23.8 18.5 31.5 16.5 31.5Z"
            stroke="#B8925A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.5 33.5C23.5 33.5 12 25.8 12 16.8C12 12.6 15.2 9.5 19.1 9.5C21.5 9.5 23.5 10.8 24.5 12.6C25.5 10.8 27.5 9.5 29.9 9.5C33.8 9.5 37 12.6 37 16.8C37 25.8 25.5 33.5 23.5 33.5Z"
            stroke="#B8925A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
        </svg>

        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            color: '#2C2520',
            marginTop: 18,
            letterSpacing: '0.02em',
          }}
        >
          OneHearts
        </div>

        <div
          style={{
            fontSize: 24,
            fontStyle: 'italic',
            color: '#7A6F67',
            marginTop: 8,
            fontFamily: 'sans-serif',
          }}
        >
          Powered by ProEdge Software Solutions
        </div>

        <div
          style={{
            marginTop: 32,
            padding: '10px 28px',
            borderRadius: 999,
            backgroundColor: '#B8925A',
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: 'sans-serif',
          }}
        >
          Digital Wedding Experience &amp; Memories Platform
        </div>
      </div>
    ),
    { ...size }
  );
}