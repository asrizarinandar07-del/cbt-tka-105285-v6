"use client";
import { useState, useEffect } from "react";

type Soal = {
  id: number;
  mapel: string;
  soal: string;
  a: string;
  b: string;
  c: string;
  d: string;
  kunci: string;
};

const SOAL_DATA: Soal[] = [
  { id: 1, mapel: "Matematika", soal: "Hasil dari 12 x 15 adalah...", a: "150", b: "180", c: "165", d: "175", kunci: "b" },
  { id: 2, mapel: "Matematika", soal: "Jika sebuah segitiga siku-siku memiliki alas 6 cm dan tinggi 8 cm, luasnya?", a: "24 cm²", b: "48 cm²", c: "14 cm²", d: "20 cm²", kunci: "a" },
  { id: 3, mapel: "IPA", soal: "Alat pernapasan pada ikan adalah...", a: "Paru-paru", b: "Insang", c: "Trakea", d: "Kulit", kunci: "b" },
  { id: 4, mapel: "IPA", soal: "Fotosintesis terjadi di bagian...", a: "Akar", b: "Batang", c: "Daun", d: "Bunga", kunci: "c" },
  { id: 5, mapel: "Bahasa Indonesia", soal: "Sinonim kata 'Pandai' adalah...", a: "Bodoh", b: "Cerdas", c: "Malas", d: "Rajin", kunci: "b" },
  { id: 6, mapel: "Bahasa Indonesia", soal: "Kalimat yang mengandung majas personifikasi:", a: "Angin berbisik di telingaku", b: "Dia sepandai ayahnya", c: "Buku itu tebal", d: "Saya makan nasi", kunci: "a" },
];

export default function Home() {
  const [login, setLogin] = useState(false);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [token, setToken] = useState("");
  const [indexSoal, setIndexSoal] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [waktu, setWaktu] = useState(3600);
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    if (!login || selesai) return;
    const t = setInterval(() => {
      setWaktu((w) => {
        if (w <= 1) { setSelesai(true); return 0; }
        return w - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [login, selesai]);

  const formatWaktu = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const skor = Object.keys(jawaban).filter((k) => {
    const soal = SOAL_DATA.find((s) => s.id === Number(k));
    return soal && jawaban[Number(k)] === soal.kunci;
  }).length;

  if (!login) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-blue-700">CBT TKA 105285 V6</h1>
          <p className="text-center text-gray-600 mb-6">SMP Negeri 2 Kisaran</p>
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border p-3 rounded mb-3" />
          <input value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Kelas (ex: VI-A)" className="w-full border p-3 rounded mb-3" />
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token: 105285" className="w-full border p-3 rounded mb-4" />
          <button onClick={() => { if (token === "105285" && nama && kelas) setLogin(true); else alert("Isi Nama, Kelas dan Token 105285"); }} className="w-full bg-blue-600 text-white p-3 rounded font-bold">MASUK UJIAN</button>
        </div>
      </div>
    );
  }

  if (selesai) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Ujian Selesai!</h2>
          <p className="mb-2">{nama} - {kelas}</p>
          <p className="text-5xl font-bold text-blue-600 my-4">{skor}/{SOAL_DATA.length}</p>
          <p className="text-gray-600 mb-4">Nilai: {Math.round((skor / SOAL_DATA.length) * 100)}</p>
          <button onClick={() => { setLogin(false); setJawaban({}); setIndexSoal(0); setWaktu(3600); setSelesai(false); }} className="w-full bg-blue-600 text-white p-3 rounded">Kembali ke Login</button>
        </div>
      </div>
    );
  }

  const soalAktif = SOAL_DATA[indexSoal];
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0">
        <div><b>{nama}</b> - {kelas}</div>
        <div className="bg-red-600 text-white px-4 py-1 rounded font-mono">{formatWaktu(waktu)}</div>
      </header>
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto p-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow flex-1">
          <div className="flex justify-between mb-4 text-sm text-gray-600"><span>{soalAktif.mapel}</span><span>Soal {indexSoal + 1} / {SOAL_DATA.length}</span></div>
          <h3 className="text-lg font-semibold mb-6">{indexSoal + 1}. {soalAktif.soal}</h3>
          <div className="space-y-3">
            {(["a", "b", "c", "d"] as const).map((opt) => (
              <button key={opt} onClick={() => setJawaban({ ...jawaban, [soalAktif.id]: opt })} className={`w-full text-left border p-3 rounded flex gap-3 ${jawaban[soalAktif.id] === opt ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}>
                <b>{opt.toUpperCase()}.</b> {soalAktif[opt]}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button disabled={indexSoal === 0} onClick={() => setIndexSoal(indexSoal - 1)} className="px-4 py-2 border rounded disabled:opacity-50">Sebelumnya</button>
            {indexSoal === SOAL_DATA.length - 1 ? <button onClick={() => setSelesai(true)} className="px-6 py-2 bg-green-600 text-white rounded font-bold">SELESAI</button> : <button onClick={() => setIndexSoal(indexSoal + 1)} className="px-4 py-2 bg-blue-600 text-white rounded">Selanjutnya</button>}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow lg:w-64 h-fit">
          <h4 className="font-bold mb-3">Navigasi Soal</h4>
          <div className="grid grid-cols-5 gap-2">
            {SOAL_DATA.map((_, i) => (
              <button key={i} onClick={() => setIndexSoal(i)} className={`h-10 rounded font-bold ${i === indexSoal ? "bg-blue-600 text-white" : jawaban[SOAL_DATA[i].id] ? "bg-green-500 text-white" : "bg-gray-200"}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
