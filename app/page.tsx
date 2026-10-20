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
  { id: 2, mapel: "Matematika", soal: "Jika sebuah segitiga siku-siku memiliki alas 6 cm dan tinggi 8 cm, luasnya?", a: "24 cm2", b: "48 cm2", c: "14 cm2", d: "10 cm2", kunci: "a" },
  { id: 3, mapel: "IPA", soal: "Alat pernapasan pada ikan adalah...", a: "Paru-paru", b: "Insang", c: "Trakea", d: "Kulit", kunci: "b" },
  { id: 4, mapel: "IPA", soal: "Fotosintesis terjadi di bagian...", a: "Akar", b: "Batang", c: "Daun", d: "Bunga", kunci: "c" },
  { id: 5, mapel: "Bahasa Indonesia", soal: "Sinonim kata 'Pintar' adalah...", a: "Bodoh", b: "Cerdas", c: "Malas", d: "Rajin", kunci: "b" },
  { id: 6, mapel: "Bahasa Indonesia", soal: "Kalimat yang mengandung majas personifikasi:", a: "Angin berbisik di telingaku", b: "Dia sepintar Einstein", c: "Bunga itu merah", d: "Saya makan nasi", kunci: "a" },
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
    const timer = setInterval(() => {
      setWaktu((w) => {
        if (w <= 1) { setSelesai(true); return 0; }
        return w - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [login, selesai]);

  const handleLogin = () => {
    if (token !== "105285") { alert("Token Salah! Token: 105285"); return; }
    if (!nama || !kelas) { alert("Isi Nama dan Kelas!"); return; }
    setLogin(true);
  };

  const nilai = () => {
    let benar = 0;
    SOAL_DATA.forEach(s => { if (jawaban[s.id] === s.kunci) benar++; });
    return Math.round((benar / SOAL_DATA.length) * 100);
  };

  const formatWaktu = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (selesai) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-green-600">Ujian Selesai!</h1>
          <p className="mt-2">UPT SPF SD Inpres 105285</p>
          <p className="mt-4 text-lg">Nama: {nama}</p>
          <p>Kelas: {kelas}</p>
          <p className="text-5xl font-bold my-6 text-blue-600">{nilai()}</p>
          <button onClick={() => location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Ulangi</button>
        </div>
      </div>
    );
  }

  if (!login) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-blue-700">CBT TKA 105285 V6</h1>
          <p className="text-center font-bold mt-1 text-gray-700">UPT SPF SD INPRES 105285</p>
          <p className="text-center text-sm text-gray-500 mb-6">Ujian Berbasis Komputer</p>
          <div className="space-y-4">
            <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border p-3 rounded-lg" />
            <input value={kelas} onChange={e=>setKelas(e.target.value)} placeholder="Kelas (Contoh: 6A)" className="w-full border p-3 rounded-lg" />
            <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Token Ujian: 105285" className="w-full border p-3 rounded-lg" />
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">MASUK UJIAN</button>
            <p className="text-xs text-center text-gray-400">Token default: 105285</p>
          </div>
        </div>
      </div>
    );
  }

  const soal = SOAL_DATA[indexSoal];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div><p className="font-bold">UPT SPF SD Inpres 105285</p><p className="text-sm">{nama} - {kelas}</p></div>
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold">{formatWaktu(waktu)}</div>
      </div>
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-blue-600 font-bold">{soal.mapel} - Soal {indexSoal+1} dari {SOAL_DATA.length}</p>
          <h2 className="text-lg font-semibold my-4">{soal.soal}</h2>
          <div className="space-y-3">
            {["a","b","c","d"].map(opt => (
              <label key={opt} className={`block border p-3 rounded-lg cursor-pointer ${jawaban[soal.id]===opt ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"}`}>
                <input type="radio" name={`soal-${soal.id}`} checked={jawaban[soal.id]===opt} onChange={()=>setJawaban({...jawaban, [soal.id]:opt})} className="mr-3" />
                {opt.toUpperCase()}. {(soal as any)[opt]}
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button disabled={indexSoal===0} onClick={()=>setIndexSoal(i=>i-1)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Sebelumnya</button>
            {indexSoal < SOAL_DATA.length-1 ? <button onClick={()=>setIndexSoal(i=>i+1)} className="px-4 py-2 bg-blue-600 text-white rounded">Selanjutnya</button> : <button onClick={()=>setSelesai(true)} className="px-6 py-2 bg-green-600 text-white rounded font-bold">SELESAI</button>}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow h-fit">
          <p className="font-bold mb-3">Navigasi Soal</p>
          <div className="grid grid-cols-5 gap-2">
            {SOAL_DATA.map((s, i) => (
              <button key={s.id} onClick={()=>setIndexSoal(i)} className={`p-2 rounded text-sm font-bold ${i===indexSoal ? "bg-blue-600 text-white" : jawaban[s.id] ? "bg-green-200" : "bg-gray-100"}`}>{i+1}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
