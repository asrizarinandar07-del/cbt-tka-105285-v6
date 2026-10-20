"use client";
import { useState, useEffect } from "react";
import { soalMatematika, soalIndonesia } from "./soalData";

// TIPE DATA
type Siswa = { id: string; nama: string; nisn: string; kelas: string; };
type Rekap = { id: string; nama: string; kelas: string; mapel: string; paket: string; nilai: number; benar: string; tanggal: string; };

export default function Page() {
  // STATE UMUM
  const [role, setRole] = useState<"menu" | "siswa" | "guru" | "guru_dashboard">("menu");
  const [loginSiswa, setLoginSiswa] = useState(false);
  
  // SISWA STATE
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("6A");
  const [mapel, setMapel] = useState("MATEMATIKA");
  const [paket, setPaket] = useState("A");
  const [soalList, setSoalList] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, any>>({});
  const [selesai, setSelesai] = useState(false);
  const [waktu, setWaktu] = useState(3600);

  // GURU STATE
  const [guruUser, setGuruUser] = useState("");
  const [guruPass, setGuruPass] = useState("");
  const [tabGuru, setTabGuru] = useState<"rekap" | "siswa" | "soal">("rekap");
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [rekapNilai, setRekapNilai] = useState<Rekap[]>([]);
  const [formSiswa, setFormSiswa] = useState<Siswa>({id:"", nama:"", nisn:"", kelas:"6A"});
  const [editMode, setEditMode] = useState(false);

  // LOAD DARI LOCALSTORAGE
  useEffect(() => {
    const s = localStorage.getItem("dataSiswa_105285");
    const r = localStorage.getItem("rekapNilai_105285");
    if (s) setDataSiswa(JSON.parse(s));
    if (r) setRekapNilai(JSON.parse(r));
    // Data awal jika kosong
    if (!s) {
      const awal: Siswa[] = [
        {id:"1", nama:"Kesya", nisn:"001", kelas:"6A"},
        {id:"2", nama:"Budi", nisn:"002", kelas:"6A"},
        {id:"3", nama:"Siti", nisn:"003", kelas:"6B"},
      ];
      setDataSiswa(awal);
      localStorage.setItem("dataSiswa_105285", JSON.stringify(awal));
    }
  }, []);

  // SIMPAN
  const saveSiswa = (newData: Siswa[]) => {
    setDataSiswa(newData);
    localStorage.setItem("dataSiswa_105285", JSON.stringify(newData));
  };
  const saveRekap = (newData: Rekap[]) => {
    setRekapNilai(newData);
    localStorage.setItem("rekapNilai_105285", JSON.stringify(newData));
  };

  // TIMER
  useEffect(() => {
    if (!loginSiswa || selesai) return;
    const t = setInterval(() => setWaktu(w => { if(w<=1){ setSelesai(true); return 0;} return w-1;}), 1000);
    return () => clearInterval(t);
  }, [loginSiswa, selesai]);

  // FUNGSI SISWA
  const mulaiUjian = () => {
    if (!nama) { alert("Pilih / Isi Nama Siswa dulu!"); return; }
    const bank = mapel==="MATEMATIKA" ? soalMatematika : soalIndonesia;
    setSoalList((bank as any)[paket]);
    setLoginSiswa(true); setIndex(0); setJawaban({}); setSelesai(false); setWaktu(3600);
  };
  const pilihJawaban = (id:number, val:any) => setJawaban(p=>({...p, [id]:val}));
  const pilihMCMA = (id:number, opsi:string) => {
    const cur = jawaban[id] || [];
    const next = cur.includes(opsi) ? cur.filter((x:string)=>x!==opsi) : [...cur, opsi];
    setJawaban(p=>({...p, [id]:next}));
  };
  const hitungNilai = () => {
    let benar=0;
    soalList.forEach((s:any)=>{ 
      const j=jawaban[s.id]; if(!j) return;
      if(s.tipe==="mcma"){ if(s.kunci.sort().join("")===(j as string[]).sort().join("")) benar++; }
      else if(s.tipe==="isian"){ if(String(j).toLowerCase().trim()===String(s.kunci).toLowerCase().trim()) benar++; }
      else { if(j===s.kunci) benar++; }
    });
    return { nilai: Math.round((benar/soalList.length)*100), benar: `${benar}/${soalList.length}` };
  };
  const formatWaktu = (d:number) => `${Math.floor(d/60).toString().padStart(2,"0")}:${(d%60).toString().padStart(2,"0")}`;

  // SAAT SELESAI -> SIMPAN REKAP
  useEffect(() => {
    if(selesai && soalList.length>0){
      const {nilai, benar} = hitungNilai();
      const baru: Rekap = { id: Date.now().toString(), nama, kelas, mapel, paket, nilai, benar, tanggal: new Date().toLocaleString("id-ID") };
      const update = [baru, ...rekapNilai].slice(0,200);
      saveRekap(update);
    }
  }, [selesai]);

  // FUNGSI GURU
  const loginGuru = () => {
    if(guruUser==="guru105285" && guruPass==="TKA2025"){ setRole("guru_dashboard"); }
    else { alert("Username / Password Salah!\n\nDefault:\nUser: guru105285\nPass: TKA2025"); }
  };
  const handleSimpanSiswa = () => {
    if(!formSiswa.nama || !formSiswa.nisn){ alert("Nama & NISN wajib diisi!"); return; }
    if(editMode){
      const upd = dataSiswa.map(d=> d.id===formSiswa.id ? formSiswa : d);
      saveSiswa(upd);
    } else {
      const baru = {...formSiswa, id: Date.now().toString()};
      saveSiswa([...dataSiswa, baru]);
    }
    setFormSiswa({id:"", nama:"", nisn:"", kelas:"6A"}); setEditMode(false);
  };
  const hapusSiswa = (id:string) => { if(confirm("Hapus siswa ini?")) saveSiswa(dataSiswa.filter(d=>d.id!==id)); };
  const exportExcel = () => {
    let csv = "No,Nama,NISN,Kelas,Mapel,Paket,Nilai,Benar,Tanggal\n";
    rekapNilai.forEach((r,i)=>{ csv += `${i+1},${r.nama},${r.kelas},${r.mapel},${r.paket},${r.nilai},${r.benar},${r.tanggal}\n`; });
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`REKAP_TKA_105285_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  // 1. MENU AWAL PILIH ROLE
  if(role==="menu"){
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-black text-blue-800">CBT TKA 105285</h1>
          <p className="text-xs text-gray-600">UPT SPF SD INPRES 105285 - TKA STANDAR 2025</p>
          <div className="mt-6 space-y-3">
            <button onClick={()=>setRole("siswa")} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow">👨‍🎓 MASUK SEBAGAI SISWA<br/><span className="text-xs font-normal opacity-80">Kerjakan Soal TKA - 180 Soal</span></button>
            <button onClick={()=>setRole("guru")} className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl shadow">👨‍🏫 LOGIN GURU / ADMIN<br/><span className="text-xs font-normal opacity-80">Rekap Nilai & Input Data Siswa</span></button>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 p-2 rounded text-[11px]">✅ {dataSiswa.length} Siswa Terdata • {rekapNilai.length} Ujian Tersimpan</div>
        </div>
      </div>
    );
  }

  // 2. LOGIN GURU FORM
  if(role==="guru"){
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm">
          <h2 className="font-black text-lg">Login Guru</h2><p className="text-xs text-gray-500 mb-4">Default User: guru105285 / Pass: TKA2025</p>
          <input value={guruUser} onChange={e=>setGuruUser(e.target.value)} placeholder="Username" className="w-full border p-2.5 rounded-lg mb-2"/>
          <input type="password" value={guruPass} onChange={e=>setGuruPass(e.target.value)} placeholder="Password" className="w-full border p-2.5 rounded-lg mb-3"/>
          <button onClick={loginGuru} className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold">LOGIN</button>
          <button onClick={()=>setRole("menu")} className="w-full mt-2 bg-gray-200 py-2 rounded-lg text-sm">← Kembali</button>
        </div>
      </div>
    );
  }

  // 3. DASHBOARD GURU
  if(role==="guru_dashboard"){
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow p-3 flex justify-between items-center"><h2 className="font-black text-blue-800">PANEL GURU - TKA 105285</h2><button onClick={()=>setRole("menu")} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Logout</button></div>
        <div className="max-w-6xl mx-auto p-3">
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setTabGuru("rekap")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tabGuru==="rekap"?"bg-blue-600 text-white":"bg-white"}`}>📊 Rekap Nilai ({rekapNilai.length})</button>
            <button onClick={()=>setTabGuru("siswa")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tabGuru==="siswa"?"bg-blue-600 text-white":"bg-white"}`}>👨‍🎓 Data Siswa ({dataSiswa.length})</button>
            <button onClick={()=>setTabGuru("soal")} className={`px-4 py-2 rounded-lg text-sm font-bold ${tabGuru==="soal"?"bg-blue-600 text-white":"bg-white"}`}>📚 Info Soal</button>
          </div>

          {tabGuru==="rekap" && (
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Rekap Nilai Ujian</h3><div className="flex gap-2"><button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs">⬇️ Export Excel</button><button onClick={()=>{ if(confirm("Hapus semua rekap?")) saveRekap([]);}} className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs">Hapus Semua</button></div></div>
              <div className="overflow-auto max-h-[70vh]"><table className="w-full text-xs"><thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 text-left">No</th><th className="p-2 text-left">Nama</th><th className="p-2">Kelas</th><th className="p-2">Mapel</th><th className="p-2">Paket</th><th className="p-2">Nilai</th><th className="p-2">Tanggal</th></tr></thead><tbody>{rekapNilai.map((r,i)=><tr key={r.id} className="border-b"><td className="p-2">{i+1}</td><td className="p-2 font-bold">{r.nama}</td><td className="p-2 text-center">{r.kelas}</td><td className="p-2 text-center">{r.mapel==="MATEMATIKA"?"MTK":"BIN"}</td><td className="p-2 text-center">{r.paket}</td><td className="p-2 text-center font-black text-blue-700">{r.nilai}</td><td className="p-2">{r.tanggal}</td></tr>)}{rekapNilai.length===0 && <tr><td colSpan={7} className="p-4 text-center text-gray-400">Belum ada ujian</td></tr>}</tbody></table></div>
            </div>
          )}

          {tabGuru==="siswa" && (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl shadow p-4 h-fit"><h3 className="font-bold mb-3">{editMode?"Edit Siswa":"Input Siswa Baru"}</h3>
                <input value={formSiswa.nama} onChange={e=>setFormSiswa({...formSiswa, nama:e.target.value})} placeholder="Nama Lengkap" className="w-full border p-2 rounded mb-2"/>
                <input value={formSiswa.nisn} onChange={e=>setFormSiswa({...formSiswa, nisn:e.target.value})} placeholder="NISN / No Induk" className="w-full border p-2 rounded mb-2"/>
                <select value={formSiswa.kelas} onChange={e=>setFormSiswa({...formSiswa, kelas:e.target.value})} className="w-full border p-2 rounded mb-3"><option>6A</option><option>6B</option><option>6C</option></select>
                <button onClick={handleSimpanSiswa} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold">{editMode?"Update":"Simpan"}</button>
                {editMode && <button onClick={()=>{setEditMode(false); setFormSiswa({id:"", nama:"", nisn:"", kelas:"6A"});}} className="w-full mt-2 bg-gray-200 py-2 rounded-lg text-sm">Batal Edit</button>}
              </div>
              <div className="md:col-span-2 bg-white rounded-xl shadow p-4"><h3 className="font-bold mb-3">Daftar Siswa ({dataSiswa.length})</h3><div className="overflow-auto max-h-[70vh]"><table className="w-full text-xs"><thead className="bg-gray-100"><tr><th className="p-2 text-left">Nama</th><th className="p-2">NISN</th><th className="p-2">Kelas</th><th className="p-2">Aksi</th></tr></thead><tbody>{dataSiswa.map(s=><tr key={s.id} className="border-b"><td className="p-2 font-bold">{s.nama}</td><td className="p-2 text-center">{s.nisn}</td><td className="p-2 text-center">{s.kelas}</td><td className="p-2 text-center flex gap-1 justify-center"><button onClick={()=>{setFormSiswa(s); setEditMode(true);}} className="bg-yellow-400 px-2 py-1 rounded text-[10px]">Edit</button><button onClick={()=>hapusSiswa(s.id)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px]">Hapus</button></td></tr>)}</tbody></table></div></div>
            </div>
          )}

          {tabGuru==="soal" && (
            <div className="bg-white rounded-xl shadow p-4 text-sm"><h3 className="font-bold mb-2">Info Bank Soal</h3><p>Matematika: {soalMatematika.A.length+soalMatematika.B.length+soalMatematika.C.length} Soal (3 Paket)</p><p>B. Indonesia: {soalIndonesia.A.length+soalIndonesia.B.length+soalIndonesia.C.length} Soal (3 Paket)</p><p className="mt-3 text-xs text-gray-600">Edit soal di GitHub file soalData.js</p></div>
          )}
        </div>
      </div>
    );
  }

  // 4. SISWA LOGIN & UJIAN (SAMA SEPERTI SEBELUMNYA TAPI NAMA DARI DATA SISWA)
  if(!loginSiswa){
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
          <h1 className="text-2xl font-black text-center text-blue-800">CBT TKA 105285</h1><p className="text-center text-xs text-gray-600 mb-2">UPT SPF SD INPRES 105285 • TKA STANDAR 2025</p>
          <div className="bg-green-50 border p-2 rounded text-xs text-center mb-4">✅ 180 SOAL READY • Data Siswa: {dataSiswa.length} • Auto Rekap Nilai</div>
          <div className="space-y-3">
            <div><label className="text-sm font-bold">Pilih Nama Siswa (Dari Data Guru)</label>
              <select value={nama} onChange={e=>{ const s=dataSiswa.find(x=>x.nama===e.target.value); setNama(e.target.value); if(s) setKelas(s.kelas); }} className="w-full border rounded-lg p-2.5 mt-1"><option value="">-- Pilih Siswa --</option>{dataSiswa.map(s=><option key={s.id} value={s.nama}>{s.nama} - {s.kelas} - {s.nisn}</option>)}<option value="__manual__">Ketik Manual...</option></select>
              {(nama==="__manual__" || !dataSiswa.find(x=>x.nama===nama)) && <input value={nama==="__manual__"?"":nama} onChange={e=>setNama(e.target.value)} placeholder="Ketik Nama Manual" className="w-full border rounded-lg p-2.5 mt-2"/>}
            </div>
            <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-bold">Kelas</label><select value={kelas} onChange={e=>setKelas(e.target.value)} className="w-full border rounded-lg p-2.5 mt-1"><option>6A</option><option>6B</option><option>6C</option></select></div><div><label className="text-sm font-bold">Paket</label><div className="flex gap-1 mt-1">{["A","B","C"].map(p=><button key={p} onClick={()=>setPaket(p)} className={`flex-1 py-2.5 rounded-lg border-2 font-bold ${paket===p?"bg-blue-600 text-white border-blue-600":"bg-white"}`}>{p}</button>)}</div></div></div>
            <div><label className="text-sm font-bold">Mata Pelajaran</label><div className="grid grid-cols-2 gap-2 mt-1"><button onClick={()=>setMapel("MATEMATIKA")} className={`p-3 rounded-xl border-2 text-left ${mapel==="MATEMATIKA"?"bg-blue-600 text-white border-blue-600":"bg-white"}`}><div className="font-bold">📐 MATEMATIKA</div></button><button onClick={()=>setMapel("INDONESIA")} className={`p-3 rounded-xl border-2 text-left ${mapel==="INDONESIA"?"bg-orange-600 text-white border-orange-600":"bg-white"}`}><div className="font-bold">📖 B. INDONESIA</div></button></div></div>
            <button onClick={mulaiUjian} className="w-full bg-blue-700 text-white font-black py-3 rounded-xl">MULAI {mapel} PAKET {paket}</button>
            <button onClick={()=>setRole("menu")} className="w-full bg-gray-200 py-2 rounded-lg text-sm">← Menu Awal</button>
          </div>
        </div>
      </div>
    );
  }

  if(selesai){
    const {nilai, benar} = hitungNilai();
    return (<div className="min-h-screen bg-green-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"><h2 className="text-2xl font-bold text-green-700">Selesai!</h2><p className="text-sm">{nama} - {kelas} - {mapel} {paket}</p><div className="mt-5 bg-green-600 text-white rounded-2xl p-6"><div className="text-6xl font-black">{nilai}</div><div className="text-sm mt-1">{benar} Benar</div></div><div className="mt-4 bg-blue-50 p-2 rounded text-xs">✅ Nilai otomatis tersimpan di Rekap Guru!</div><button onClick={()=>{setLoginSiswa(false); setRole("menu"); setSelesai(false);}} className="w-full mt-5 bg-gray-800 text-white py-3 rounded-xl font-bold">Kembali Menu</button></div></div>);
  }

  const soal = soalList[index]; if(!soal) return null;
  return (
    <div className="min-h-screen bg-gray-100"><div className="bg-white shadow p-3 flex justify-between sticky top-0"><div className="font-bold text-xs text-blue-700">{mapel} P-{paket} | {nama} | {index+1}/{soalList.length}</div><div className="flex gap-2"><div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">{formatWaktu(waktu)}</div><button onClick={()=>setSelesai(true)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Selesai</button></div></div>
      <div className="max-w-5xl mx-auto p-3 grid md:grid-cols-4 gap-3"><div className="md:col-span-3 bg-white rounded-xl shadow p-5"><h3 className="font-semibold mb-5">{soal.soal}</h3>
          {soal.tipe==="pilihan_ganda" && <div className="space-y-2">{Object.entries(soal.opsi).map(([k,v]:any)=><button key={k} onClick={()=>pilihJawaban(soal.id,k)} className={`w-full text-left border-2 p-3 rounded-xl ${jawaban[soal.id]===k?"border-blue-600 bg-blue-50":"border-gray-200"}`}>{k}. {v as string}</button>)}</div>}
          {soal.tipe==="mcma" && <div className="space-y-2"><p className="text-[11px] text-purple-700 font-bold">PILIH 2!</p>{Object.entries(soal.opsi).map(([k,v]:any)=><button key={k} onClick={()=>pilihMCMA(soal.id,k)} className={`w-full text-left border-2 p-3 rounded-xl ${(jawaban[soal.id]||[]).includes(k)?"border-purple-600 bg-purple-50":"border-gray-200"}`}>{k}. {v as string}</button>)}</div>}
          {soal.tipe==="isian" && <input value={jawaban[soal.id]||""} onChange={e=>pilihJawaban(soal.id,e.target.value)} placeholder="Ketik jawaban..." className="w-full border-2 border-orange-300 rounded-xl p-3"/>}
          {soal.tipe==="benar_salah" && <div className="space-y-2">{Object.entries(soal.opsi).map(([k,v]:any)=><button key={k} onClick={()=>pilihJawaban(soal.id,k)} className={`w-full border-2 p-3 rounded-xl ${jawaban[soal.id]===k?"border-green-600 bg-green-50":"border-gray-200"}`}>{k}. {v as string}</button>)}</div>}
          <div className="flex justify-between mt-8"><button disabled={index===0} onClick={()=>setIndex(index-1)} className="px-4 py-2 bg-gray-200 rounded-xl">← Prev</button>{index<soalList.length-1?<button onClick={()=>setIndex(index+1)} className="px-5 py-2 bg-blue-600 text-white rounded-xl">Next →</button>:<button onClick={()=>setSelesai(true)} className="px-5 py-2 bg-green-600 text-white rounded-xl">Selesai</button>}</div>
        </div><div className="bg-white rounded-xl shadow p-3 h-fit"><div className="grid grid-cols-5 gap-1.5">{soalList.map((s:any,i:number)=><button key={s.id} onClick={()=>setIndex(i)} className={`h-8 rounded text-xs font-bold ${i===index?"bg-blue-600 text-white":jawaban[s.id]?"bg-green-500 text-white":"bg-gray-100"}`}>{i+1}</button>)}</div></div></div></div>
  );
}
