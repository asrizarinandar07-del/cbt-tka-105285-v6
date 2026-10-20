"use client";
import { useState, useEffect } from "react";
import { soalMatematika, soalIndonesia } from "./soalData";

export default function Page() {
  const [login, setLogin] = useState(false);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("6A");
  const [mapel, setMapel] = useState("MATEMATIKA");
  const [paket, setPaket] = useState("A");
  const [soalList, setSoalList] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, any>>({});
  const [selesai, setSelesai] = useState(false);
  const [waktu, setWaktu] = useState(60 * 60);

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

  const mulaiUjian = () => {
    if (!nama) { alert("Isi Nama Siswa dulu!"); return; }
    const bank = mapel === "MATEMATIKA" ? soalMatematika : soalIndonesia;
    const paketData = (bank as any)[paket];
    setSoalList(paketData);
    setLogin(true); setIndex(0); setJawaban({}); setSelesai(false); setWaktu(60*60);
  };

  const pilihJawaban = (id: number, val: any) => setJawaban(p => ({...p, [id]: val}));
  const pilihMCMA = (id: number, opsi: string) => {
    const cur = jawaban[id] || [];
    const next = cur.includes(opsi) ? cur.filter((x:string)=>x!==opsi) : [...cur, opsi];
    setJawaban(p => ({...p, [id]: next}));
  };
  const hitungNilai = () => {
    let benar = 0;
    soalList.forEach((s) => {
      const j = jawaban[s.id]; if (!j) return;
      if (s.tipe === "mcma") {
        if (s.kunci.sort().join("") === (j as string[]).sort().join("")) benar++;
      } else if (s.tipe === "isian") {
        if (String(j).toLowerCase().trim() === String(s.kunci).toLowerCase().trim()) benar++;
      } else { if (j === s.kunci) benar++; }
    });
    return Math.round((benar / soalList.length) * 100);
  };
  const formatWaktu = (d:number) => `${Math.floor(d/60).toString().padStart(2,"0")}:${(d%60).toString().padStart(2,"0")}`;

  if (!login) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
          <h1 className="text-2xl font-black text-center text-blue-800">CBT TKA 105285</h1>
          <p className="text-center text-xs text-gray-600 mb-4">UPT SPF SD INPRES 105285 • TKA STANDAR 2025</p>
          <div className="bg-green-50 border border-green-200 p-2 rounded text-xs text-center mb-4">✅ 180 SOAL READY • 90 MTK + 90 BIN • 4 Bentuk Soal TKA</div>
          <div className="space-y-3">
            <div><label className="text-sm font-bold">Nama Siswa</label><input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Contoh: Kesya" className="w-full border rounded-lg p-2.5 mt-1"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-bold">Kelas</label><select value={kelas} onChange={e=>setKelas(e.target.value)} className="w-full border rounded-lg p-2.5 mt-1"><option>6A</option><option>6B</option><option>6C</option></select></div>
              <div><label className="text-sm font-bold">Paket</label><div className="flex gap-1 mt-1">{["A","B","C"].map(p=><button key={p} onClick={()=>setPaket(p)} className={`flex-1 py-2.5 rounded-lg border-2 font-bold ${paket===p?"bg-blue-600 text-white border-blue-600":"bg-white"}`}>{p}</button>)}</div></div>
            </div>
            <div><label className="text-sm font-bold">Pilih Mata Pelajaran</label><div className="grid grid-cols-2 gap-2 mt-1">
              <button onClick={()=>setMapel("MATEMATIKA")} className={`p-3 rounded-xl border-2 text-left ${mapel==="MATEMATIKA"?"bg-blue-600 text-white border-blue-600":"bg-white border-gray-300"}`}><div className="font-bold">📐 MATEMATIKA</div><div className="text-xs opacity-80">90 Soal • 3 Paket</div></button>
              <button onClick={()=>setMapel("INDONESIA")} className={`p-3 rounded-xl border-2 text-left ${mapel==="INDONESIA"?"bg-orange-600 text-white border-orange-600":"bg-white border-gray-300"}`}><div className="font-bold">📖 B. INDONESIA</div><div className="text-xs opacity-80">90 Soal • 3 Paket</div></button>
            </div></div>
            <div className="bg-blue-50 p-2.5 rounded-lg text-xs"><b>Format TKA:</b> 20 PG + 4 PG Kompleks (Pilih 2) + 3 Isian + 3 Benar-Salah • Timer 60 menit</div>
            <button onClick={mulaiUjian} className="w-full bg-blue-700 text-white font-black py-3 rounded-xl">MULAI {mapel} PAKET {paket} - 30 SOAL</button>
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
          <h2 className="text-2xl font-bold text-green-700">Selesai!</h2><p className="mt-1 text-sm">{nama} - {kelas} - {mapel} Paket {paket}</p>
          <div className="mt-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl p-6"><div className="text-sm opacity-90">NILAI TKA</div><div className="text-6xl font-black mt-1">{nilai}</div><div className="text-sm mt-2">{nilai>=75?"LULUS - HEBAT!":"BELAJAR LAGI YA"}</div></div>
          <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-left"><div>Mapel: {mapel}</div><div>Benar: {Math.round((nilai/100)*soalList.length)} / {soalList.length}</div><div>Sisa Waktu: {formatWaktu(waktu)}</div></div>
          <button onClick={()=>{setLogin(false); setSelesai(false);}} className="w-full mt-5 bg-gray-800 text-white py-3 rounded-xl font-bold">Kembali ke Menu</button>
        </div>
      </div>
    );
  }

  const soal = soalList[index]; if (!soal) return null;
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-3 flex justify-between items-center sticky top-0 z-10"><div className="font-bold text-xs text-blue-700">{mapel} P-{paket} | {nama} | {index+1}/{soalList.length}</div><div className="flex gap-2"><div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">{formatWaktu(waktu)}</div><button onClick={()=>setSelesai(true)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Selesai</button></div></div>
      <div className="max-w-5xl mx-auto p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3 bg-white rounded-xl shadow p-5"><div className="flex gap-2 mb-3"><span className={`text-[10px] px-2 py-1 rounded font-black ${soal.tipe==="pilihan_ganda"?"bg-blue-100 text-blue-700":soal.tipe==="mcma"?"bg-purple-100 text-purple-700":soal.tipe==="isian"?"bg-orange-100 text-orange-700":"bg-green-100 text-green-700"}`}>{soal.tipe.toUpperCase()}</span><span className="text-xs text-gray-400">No {soal.id}</span></div><h3 className="text-[16px] font-semibold mb-5">{soal.soal}</h3>
          {soal.tipe==="pilihan_ganda" && <div className="space-y-2">{Object.entries(soal.opsi).map(([k,v]:any)=><button key={k} onClick={()=>pilihJawaban(soal.id,k)} className={`w-full text-left border-2 p-3 rounded-xl flex gap-2 ${jawaban[soal.id]===k?"border-blue-600 bg-blue-50":"border-gray-200"}`}><span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${jawaban[soal.id]===k?"bg-blue-600 text-white":"bg-gray-200"}`}>{k}</span><span className="text-sm">{v as string}</span></button>)}</div>}
          {soal.tipe==="mcma" && <div className="space-y-2"><p className="text-[11px] text-purple-700 font-bold">* PILIH 2 JAWABAN BENAR!</p>{Object.entries(soal.opsi).map(([k,v]:any)=>{const checked=(jawaban[soal.id]||[]).includes(k); return <button key={k} onClick={()=>pilihMCMA(soal.id,k)} className={`w-full text-left border-2 p-3 rounded-xl flex gap-2 ${checked?"border-purple-600 bg-purple-50":"border-gray-200"}`}><span className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${checked?"bg-purple-600 text-white border-purple-600":"border-gray-300"}`}>{checked?"✓":""}</span><span className="text-sm font-bold">{k}.</span><span className="text-sm">{v as string}</span></button>})}</div>}
          {soal.tipe==="isian" && <div><input value={jawaban[soal.id]||""} onChange={e=>pilihJawaban(soal.id,e.target.value)} placeholder="Ketik jawaban..." className="w-full border-2 border-orange-300 rounded-xl p-3"/><p className="text-[11px] text-gray-500 mt-1">Tidak case-sensitive, contoh: fabel / malas / 120</p></div>}
          {soal.tipe==="benar_salah" && <div className="space-y-2">{Object.entries(soal.opsi).map(([k,v]:any)=><button key={k} onClick={()=>pilihJawaban(soal.id,k)} className={`w-full text-left border-2 p-3 rounded-xl ${jawaban[soal.id]===k?"border-green-600 bg-green-50":"border-gray-200"}`}><span className="text-sm font-bold">{k}. {v as string}</span></button>)}</div>}
          <div className="flex justify-between mt-8"><button disabled={index===0} onClick={()=>setIndex(index-1)} className="px-4 py-2 rounded-xl bg-gray-200 text-sm disabled:opacity-40">← Prev</button>{index<soalList.length-1?<button onClick={()=>setIndex(index+1)} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">Next →</button>:<button onClick={()=>setSelesai(true)} className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-bold">Selesai</button>}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 h-fit"><h4 className="font-bold text-xs mb-2">Soal {mapel} Paket {paket}</h4><div className="grid grid-cols-5 gap-1.5">{soalList.map((s,i)=>{const sudah=jawaban[s.id]!==undefined && (Array.isArray(jawaban[s.id])?jawaban[s.id].length>0:String(jawaban[s.id]).length>0); return <button key={s.id} onClick={()=>setIndex(i)} className={`h-8 rounded text-xs font-bold ${i===index?"bg-blue-600 text-white":sudah?"bg-green-500 text-white":"bg-gray-100"}`}>{i+1}</button>})}</div></div>
      </div>
    </div>
  );
}
