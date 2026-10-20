"use client";
import { useState, useEffect } from "react";
import { soalMatematika } from "./soalData";

type TipeSoal = "pilihan_ganda" | "mcma" | "isian" | "benar_salah";

export default function Page() {
  const [login, setLogin] = useState(false);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("6A");
  const [paket, setPaket] = useState("A");
  const [soalList, setSoalList] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, any>>({});
  const [selesai, setSelesai] = useState(false);
  const [waktu, setWaktu] = useState(60 * 60); // 60 menit

  // Timer
  useEffect(() => {
    if (!login || selesai) return;
    const t = setInterval(() => {
      setWaktu((w) => {
        if (w <= 1) {
          setSelesai(true);
          return 0;
        }
        return w - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [login, selesai]);

  const mulaiUjian = () => {
    if (!nama) {
      alert("Isi Nama Siswa dulu Pak!");
      return;
    }
    const paketData = (soalMatematika as any)[paket] || soalMatematika.A;
    setSoalList(paketData);
    setLogin(true);
    setIndex(0);
    setJawaban({});
    setSelesai(false);
    setWaktu(60 * 60);
  };

  const pilihJawaban = (id: number, val: any) => {
    setJawaban((prev) => ({ ...prev, [id]: val }));
  };

  const pilihMCMA = (id: number, opsi: string) => {
    const cur = jawaban[id] || [];
    let next;
    if (cur.includes(opsi)) {
      next = cur.filter((x: string) => x !== opsi);
    } else {
      next = [...cur, opsi];
    }
    setJawaban((prev) => ({ ...prev, [id]: next }));
  };

  const hitungNilai = () => {
    let benar = 0;
    soalList.forEach((s) => {
      const j = jawaban[s.id];
      if (!j) return;
      if (s.tipe === "mcma") {
        const kunci = s.kunci.sort().join("");
        const jawab = (j as string[]).sort().join("");
        if (kunci === jawab) benar++;
      } else if (s.tipe === "isian") {
        if (String(j).toLowerCase().trim() === String(s.kunci).toLowerCase().trim()) benar++;
      } else {
        if (j === s.kunci) benar++;
      }
    });
    return Math.round((benar / soalList.length) * 100);
  };

  const formatWaktu = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = detik % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!login) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">CBT TKA 105285</h1>
          <p className="text-center text-gray-600 mb-6 text-sm">SD INPRES 105285 - Ujian Standar TKA</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Nama Siswa</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Kesya" className="w-full border rounded-lg p-2.5 mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">Kelas</label>
              <select value={kelas} onChange={(e) => setKelas(e.target.value)} className="w-full border rounded-lg p-2.5 mt-1">
                <option>6A</option><option>6B</option><option>6C</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Mapel</label>
              <select className="w-full border rounded-lg p-2.5 mt-1 bg-gray-100" disabled>
                <option>Matematika - 90 Soal (3 Paket)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">B. Indonesia akan menyusul Bagian 2</p>
            </div>
            <div>
              <label className="text-sm font-semibold">Pilih Paket Soal</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["A","B","C"].map((p) => (
                  <button key={p} onClick={() => setPaket(p)} className={`p-3 rounded-lg border-2 font-bold ${paket===p ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300"}`}>PAKET {p}<div className="text-xs font-normal">30 Soal</div></button>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
              <b>Standar TKA:</b><br/>• 20 Pilihan Ganda<br/>• 4 PG Kompleks (MCMA - Pilih 2)<br/>• 3 Isian Singkat<br/>• 3 Benar-Salah
            </div>
            <button onClick={mulaiUjian} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">MULAI UJIAN PAKET {paket}</button>
          </div>
        </div>
      </div>
    );
  }

  if (selesai) {
    const nilai = hitungNilai();
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-700">Ujian Selesai!</h2>
          <p className="mt-2">{nama} - {kelas} - Paket {paket}</p>
          <div className="mt-6 bg-green-600 text-white rounded-xl p-6">
            <div className="text-sm">NILAI AKHIR</div>
            <div className="text-5xl font-bold mt-2">{nilai}</div>
            <div className="text-sm mt-1">{nilai >= 75 ? "LULUS - Mantap!" : "Perlu Belajar Lagi"}</div>
          </div>
          <div className="mt-4 text-sm text-left bg-gray-50 p-3 rounded">
            <div>Benar: {Math.round((nilai/100)*soalList.length)} dari {soalList.length} soal</div>
            <div>Waktu sisa: {formatWaktu(waktu)}</div>
          </div>
          <button onClick={() => {setLogin(false); setSelesai(false);}} className="w-full mt-6 bg-gray-800 text-white py-2.5 rounded-lg">Kembali ke Login</button>
        </div>
      </div>
    );
  }

  const soal = soalList[index];
  if (!soal) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-3 flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-blue-700 text-sm">{nama} | Paket {paket} | Soal {index+1}/{soalList.length}</div>
        <div className="flex gap-3 items-center">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">{formatWaktu(waktu)}</div>
          <button onClick={() => setSelesai(true)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Selesai</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white rounded-xl shadow p-6">
          <div className="flex gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded font-bold ${soal.tipe==="pilihan_ganda"?"bg-blue-100 text-blue-700": soal.tipe==="mcma"?"bg-purple-100 text-purple-700": soal.tipe==="isian"?"bg-orange-100 text-orange-700":"bg-green-100 text-green-700"}`}>{soal.tipe.toUpperCase()}</span>
            <span className="text-xs text-gray-500">No. {soal.id}</span>
          </div>
          <h3 className="text-lg font-semibold mb-6 leading-relaxed">{soal.soal}</h3>

          {soal.tipe === "pilihan_ganda" && (
            <div className="space-y-2">
              {Object.entries(soal.opsi).map(([k, v]: any) => (
                <button key={k} onClick={() => pilihJawaban(soal.id, k)} className={`w-full text-left border-2 p-3 rounded-lg flex gap-3 ${jawaban[soal.id]===k ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${jawaban[soal.id]===k ? "bg-blue-600 text-white" : "bg-gray-200"}`}>{k}</span>
                  <span>{v as string}</span>
                </button>
              ))}
            </div>
          )}

          {soal.tipe === "mcma" && (
            <div className="space-y-2">
              <p className="text-xs text-purple-700 mb-2 font-semibold">* Centang 2 jawaban yang benar!</p>
              {Object.entries(soal.opsi).map(([k, v]: any) => {
                const checked = (jawaban[soal.id] || []).includes(k);
                return (
                  <button key={k} onClick={() => pilihMCMA(soal.id, k)} className={`w-full text-left border-2 p-3 rounded-lg flex gap-3 ${checked ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}>
                    <span className={`w-6 h-6 rounded border-2 flex items-center justify-center ${checked ? "bg-purple-600 border-purple-600 text-white" : "border-gray-300"}`}>{checked ? "✓" : ""}</span>
                    <span className="font-bold">{k}.</span><span>{v as string}</span>
                  </button>
                );
              })}
            </div>
          )}

          {soal.tipe === "isian" && (
            <div>
              <input value={jawaban[soal.id] || ""} onChange={(e) => pilihJawaban(soal.id, e.target.value)} placeholder="Ketik jawaban angka/kata di sini..." className="w-full border-2 border-orange-300 rounded-lg p-3 focus:border-orange-500 outline-none" />
              <p className="text-xs text-gray-500 mt-2">Contoh: 120 atau 0,75 atau malas</p>
            </div>
          )}

          {soal.tipe === "benar_salah" && (
            <div className="space-y-2">
              {Object.entries(soal.opsi).map(([k, v]: any) => (
                <button key={k} onClick={() => pilihJawaban(soal.id, k)} className={`w-full text-left border-2 p-3 rounded-lg ${jawaban[soal.id]===k ? "border-green-600 bg-green-50" : "border-gray-200"}`}>
                  <span className="font-bold">{k}. {v as string}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button disabled={index===0} onClick={() => setIndex(index-1)} className="px-5 py-2 rounded-lg bg-gray-200 disabled:opacity-50">← Sebelumnya</button>
            {index < soalList.length-1 ? (
              <button onClick={() => setIndex(index+1)} className="px-5 py-2 rounded-lg bg-blue-600 text-white">Selanjutnya →</button>
            ) : (
              <button onClick={() => setSelesai(true)} className="px-5 py-2 rounded-lg bg-green-600 text-white">Selesai & Lihat Nilai</button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 h-fit">
          <h4 className="font-bold text-sm mb-3">Navigasi Soal Paket {paket}</h4>
          <div className="grid grid-cols-5 gap-2">
            {soalList.map((s, i) => {
              const sudah = jawaban[s.id] !== undefined && (Array.isArray(jawaban[s.id]) ? jawaban[s.id].length > 0 : String(jawaban[s.id]).length > 0);
              return (
                <button key={s.id} onClick={() => setIndex(i)} className={`h-9 rounded text-sm font-bold ${i===index ? "bg-blue-600 text-white" : sudah ? "bg-green-500 text-white" : "bg-gray-200"}`}>{i+1}</button>
              );
            })}
          </div>
          <div className="mt-4 text-xs space-y-1">
            <div className="flex gap-2 items-center"><div className="w-3 h-3 bg-blue-600 rounded"></div> Sedang dikerjakan</div>
            <div className="flex gap-2 items-center"><div className="w-3 h-3 bg-green-500 rounded"></div> Sudah dijawab</div>
            <div className="flex gap-2 items-center"><div className="w-3 h-3 bg-gray-200 rounded"></div> Belum dijawab</div>
          </div>
        </div>
      </div>
    </div>
  );
}
