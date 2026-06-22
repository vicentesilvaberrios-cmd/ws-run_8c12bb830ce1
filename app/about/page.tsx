import Link from "next/link";

export const metadata = {
  title: "Cómo jugar — Flappy Bird",
  description:
    "Instrucciones de controles, puntaje y créditos del juego Flappy Bird.",
};

export default function AboutPage() {
  return (
    <>
      <header className="navbar">
        <strong>Flappy Bird</strong>
        <nav>
          <Link href="/">Jugar</Link>
          <Link href="/about" aria-current="page">
            Cómo jugar
          </Link>
        </nav>
      </header>

      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <div className="stack">
          <h1>Cómo jugar</h1>

          <section className="card">
            <div className="stack">
              <h2>Objetivo</h2>
              <p>
                El objetivo es volar lo más lejos posible sin chocar con las
                tuberías, el suelo ni el techo.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="stack">
              <h2>Controles</h2>
              <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
                <li>
                  <strong>Espacio</strong> o <strong>flecha arriba</strong>:
                  aletear / saltar.
                </li>
                <li>
                  <strong>Clic</strong> o <strong>tap</strong> en cualquier parte
                  del juego: aletear / saltar.
                </li>
                <li>
                  <strong>Enter</strong> o <strong>Espacio</strong> en la pantalla
                  final: volver a jugar.
                </li>
              </ul>
            </div>
          </section>

          <section className="card">
            <div className="stack">
              <h2>Puntaje</h2>
              <p>
                Sumás 1 punto cada vez que tu pájaro pasa entre un par de
                tuberías. Tu mejor marca se guarda en este dispositivo.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="stack">
              <h2>Accesibilidad</h2>
              <p>
                El juego funciona con teclado y pantalla táctil. Si necesitás
                más tiempo, pausá la pestaña.
              </p>
            </div>
          </section>

          <section className="card">
            <div className="stack">
              <h2>Créditos</h2>
              <p>
                Juego estilo Flappy Bird, desarrollado como proyecto web. Hecho
                con Next.js y Canvas.
              </p>
            </div>
          </section>

          <div className="cluster" style={{ justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/" className="btn btn-primary">
              Volver a jugar
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
