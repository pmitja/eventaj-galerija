import Image from "next/image";

type ShowcaseRow = {
  pill: string;
  title: string;
  mobileTitle?: string;
  description: string;
  mobileDescription?: string;
  checks?: string[];
  imageSrc: string;
  imageAlt: string;
  /** true = screenshot on the left, copy on the right */
  flip?: boolean;
  /** soft tinted panel behind the screenshot (for the identity card) */
  tint?: boolean;
};

const rows: ShowcaseRow[] = [
  {
    pill: "Sodelovanje gostov",
    title: "Komentarji, všečki in voščila",
    description:
      "Gostje ob vsaki fotografiji pustijo sporočilo ali čestitko in dodajo srček. Vsi utrinki in besede ostanejo zbrani na enem mestu — tudi po dogodku.",
    mobileDescription: "Gostje ob fotografijah pustijo sporočila, čestitke in srčke — vse na enem mestu.",
    checks: ["Sporočila ob vsaki fotografiji", "Srčki za najljubše utrinke", "Zbrano na enem mestu"],
    imageSrc: "/marketing/screenshots/comments-desktop.png",
    imageAlt: "Galerija dogodka z odprtim oknom komentarjev",
  },
  {
    pill: "Brez prijave",
    title: "Pridruži se v nekaj sekundah",
    description:
      "Gost skenira QR kodo, vpiše ime ali vzdevek in že sodeluje. Brez aplikacije, brez računa, brez gesla — sodelovanje je preprosto za vse generacije.",
    mobileDescription: "Skeniraj QR, vpiši ime in sodeluj. Brez aplikacije, računa ali gesla.",
    checks: ["Brez namestitve aplikacije", "Brez registracije in gesla", "Deluje na vsakem telefonu"],
    imageSrc: "/marketing/screenshots/identity-gate.png",
    imageAlt: "Okno za vpis imena gosta v galeriji dogodka",
    flip: true,
    tint: true,
  },
  {
    pill: "Dostava",
    title: "Vse prejmete na e-pošto",
    description:
      "Po nakupu na e-pošto prejmete QR kodo in povezave do galerije ter prikaza v živo. Ko se dogodek zaključi, vam pošljemo še ZIP z vsemi fotografijami.",
    mobileDescription: "Po nakupu prejmete QR in povezave, po dogodku pa ZIP z vsemi fotografijami.",
    checks: ["QR koda in povezave takoj po nakupu", "Prikaz v živo z enim klikom", "ZIP vseh fotografij po dogodku"],
    imageSrc: "/marketing/screenshots/email-qr.png",
    imageAlt: "E-poštno sporočilo z QR kodo dogodka",
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Showcase() {
  return (
    <section className="showcase section-muted" id="funkcije-podrobno">
      <div className="shell">
        {rows.map((row) => (
          <article className={`showcase-row ${row.flip ? "showcase-row--flip" : ""}`} key={row.title}>
            <div className="showcase-copy">
              <div className="section-pill">{row.pill}</div>
              <h2 className="desktop-only">{row.title}</h2>
              <h2 className="mobile-only">{row.mobileTitle ?? row.title}</h2>
              <p className="desktop-only">{row.description}</p>
              <p className="mobile-only">{row.mobileDescription ?? row.description}</p>
              {row.checks ? (
                <ul className="showcase-checks">
                  {row.checks.map((check) => (
                    <li key={check}>
                      <span className="showcase-check" aria-hidden="true"><CheckIcon /></span>
                      {check}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className={`showcase-visual-wrap ${row.tint ? "showcase-visual-wrap--tint" : ""}`}>
              <div className="showcase-visual">
                <Image src={row.imageSrc} alt={row.imageAlt} fill sizes="(max-width: 900px) 100vw, 620px" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
