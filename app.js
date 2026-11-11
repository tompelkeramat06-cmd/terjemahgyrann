const $=id=>document.getElementById(id);
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let mode="live", recognition=null, listening=false, direction="ar", sourceFinal="", targetFinal="", chat=[], queue=Promise.resolve(), lastInterim="";
const defaults={source:"الكلام المصري سيظهر هنا...",target:"Terjemahan bahasa Indonesia akan muncul di sini..."};
function notice(t){$("notice").textContent="✦ "+t}
function status(on){listening=on;$("statusPill").textContent=on?"● MENDENGARKAN":"● SIAP";$("statusPill").classList.toggle("on",on)}
function setMode(next){
 if(listening) stopRecognition();
 mode=next;
 document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===next));
 $("modeDescription").textContent=next==="live"?"Satu arah: dengarkan Amiyah Mesir dan tampilkan terjemahan Indonesia secara bertahap.":"Dua arah: pilih mikrofon Orang Mesir atau Kamu, lalu terjemahan tampil sebagai riwayat percakapan.";
 $("liveControls").classList.toggle("hidden",next!=="live");
 $("liveResults").classList.toggle("hidden",next!=="live");
 $("conversationControls").classList.toggle("hidden",next!=="conversation");
 $("conversationResults").classList.toggle("hidden",next!=="conversation");
 $("sourceLanguage").textContent=next==="live"?"Amiyah Mesir":"Arab Mesir / Indonesia";
 $("targetLanguage").textContent=next==="live"?"Indonesia":"Terjemahan dua arah";
}
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));

async function translate(text,from,to){
 const pair=from+"|"+to;
 const res=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(text)+"&langpair="+pair);
 if(!res.ok) throw Error("translation");
 const data=await res.json();
 const result=data?.responseData?.translatedText;
 if(!result) throw Error("empty");
 return result;
}
function makeRecognition(lang){
 if(!SR){notice("Pengenalan suara tidak didukung browser ini. Gunakan Chrome atau Edge terbaru.");return null}
 const r=new SR();r.lang=lang;r.continuous=true;r.interimResults=true;r.maxAlternatives=1;return r;
}
function stopRecognition(){
 if(recognition){const old=recognition;recognition=null;try{old.stop()}catch(e){}}
 listening=false;status(false);
 $("liveMic").classList.remove("active");$("liveTitle").textContent="Mulai mendengarkan";$("liveBars").classList.remove("active");
 $("egyptMic").classList.remove("active");$("indoMic").classList.remove("active");
}
function startRecognition(lang,kind){
 if(!SR){notice("Gunakan Google Chrome atau Microsoft Edge terbaru untuk fitur mikrofon.");return}
 if(listening)stopRecognition();
 const isArabic=lang==="ar-EG";
 direction=isArabic?"ar":"id";
 sourceFinal="";targetFinal="";lastInterim="";
 const r=makeRecognition(lang);if(!r)return;recognition=r;listening=true;status(true);
 if(mode==="live"){$("liveMic").classList.add("active");$("liveTitle").textContent="Sedang mendengarkan...";$("liveBars").classList.add("active");$("sourceFoot").textContent="Mikrofon aktif"}
 else {$(kind==="egypt"?"egyptMic":"indoMic").classList.add("active");$(kind==="egypt"?"egyptMic":"indoMic").textContent="■ Berhenti"}
 notice(isArabic?"Mendengarkan Amiyah Mesir...":"Mendengarkan bahasa Indonesia...");
 r.onresult=ev=>{
  let interim="";
  for(let i=ev.resultIndex;i<ev.results.length;i++){
   const t=ev.results[i][0].transcript.trim();if(!t)continue;
   if(ev.results[i].isFinal){sourceFinal+=(sourceFinal?" ":"")+t;const current=t;queue=queue.then(async()=>{
     try{const tr=await translate(current,isArabic?"ar":"id",isArabic?"id":"ar");if(mode==="live"){targetFinal+=(targetFinal?" ":"")+tr;$("sourceText").textContent=sourceFinal;$("targetText").textContent=targetFinal;$("targetFoot").textContent="Terjemahan selesai"}else addBubble(isArabic,current,tr)}
     catch(e){notice("Terjemahan gagal. Periksa internet atau coba lagi beberapa saat.")}
   })}
   else interim+=t+" ";
  }
  if(mode==="live"){
   if(interim.trim()){$("sourceText").textContent=(sourceFinal?sourceFinal+" ":"")+interim.trim();$("sourceFoot").textContent="Mengenali ucapan..."}
  }
 };
 r.onerror=ev=>{const m={"not-allowed":"Izin mikrofon ditolak. Izinkan mikrofon pada pengaturan browser.","no-speech":"Suara belum terdeteksi. Coba bicara lagi.","audio-capture":"Mikrofon tidak ditemukan.","network":"Pengenalan suara memerlukan koneksi internet."};notice(m[ev.error]||"Terjadi kendala mikrofon: "+ev.error)};
 r.onend=()=>{if(recognition===r&&listening){try{r.start()}catch(e){stopRecognition()}}};
 try{r.start()}catch(e){stopRecognition();notice("Mikrofon belum siap. Coba tekan kembali.")}
}
function addBubble(isArabic,original,meaning){
 chat.push({isArabic,original,meaning});
 const log=$("chatLog");if(log.querySelector(".empty"))log.innerHTML="";
 const b=document.createElement("div");b.className="bubble "+(isArabic?"egypt":"indo");
 const label=document.createElement("small");label.textContent=isArabic?"🇪🇬 ORANG MESIR · AMIYAH":"🇮🇩 KAMU · INDONESIA";
 const orig=document.createElement("div");orig.className="original";orig.textContent=original;orig.dir=isArabic?"rtl":"ltr";
 const trans=document.createElement("div");trans.className="meaning";trans.textContent=meaning;trans.dir=isArabic?"ltr":"rtl";
 b.append(label,orig,trans);log.appendChild(b);log.scrollTop=log.scrollHeight;
}
$("liveMic").addEventListener("click",()=>{if(listening)stopRecognition();else startRecognition("ar-EG","live")});
$("egyptMic").addEventListener("click",()=>{if(listening&&direction==="ar"){stopRecognition()}else startRecognition("ar-EG","egypt")});
$("indoMic").addEventListener("click",()=>{if(listening&&direction==="id"){stopRecognition()}else startRecognition("id-ID","indo")});
function clearAll(){
 stopRecognition();sourceFinal="";targetFinal="";chat=[];
 $("sourceText").textContent=defaults.source;$("targetText").textContent=defaults.target;
 $("sourceFoot").textContent="Menunggu suara";$("targetFoot").textContent="Hasil terjemahan";
 $("chatLog").innerHTML='<div class="empty">Hasil percakapan akan muncul di sini.</div>';notice("Hasil percakapan telah dibersihkan.");
}
$("clearBtn").addEventListener("click",clearAll);$("clearChat").addEventListener("click",()=>{$("chatLog").innerHTML='<div class="empty">Hasil percakapan akan muncul di sini.</div>';chat=[]});
$("speakBtn").addEventListener("click",()=>{
 let text=mode==="live"?targetFinal:chat.map(x=>x.isArabic?x.meaning:x.meaning).join(". ");
 if(!text){notice("Belum ada terjemahan untuk dibacakan.");return}
 if(!("speechSynthesis"in window)){notice("Browser tidak mendukung pembacaan suara.");return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="id-ID";u.rate=.94;speechSynthesis.speak(u);
});
$("downloadBtn").addEventListener("click",()=>{
 let content="LINGUA — TRANSKRIP PERCakAPAN\n\n";
 if(mode==="live")content+="AMIYAH MESIR:\n"+(sourceFinal||$("sourceText").textContent)+"\n\nINDONESIA:\n"+(targetFinal||$("targetText").textContent);
 else content+=chat.map(x=>(x.isArabic?"ORANG MESIR":"KAMU")+"\n"+x.original+"\nTERJEMAHAN:\n"+x.meaning).join("\n\n");
 const a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));a.href=url;a.download="lingua-transkrip.txt";a.click();URL.revokeObjectURL(url);
});
document.querySelectorAll(".copy").forEach(b=>b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText($(b.dataset.copy).textContent);notice("Teks berhasil disalin.")}catch(e){notice("Tidak dapat menyalin teks.")}}));
if(!SR)notice("Browser belum mendukung pengenalan suara. Buka dengan Chrome atau Edge.");
